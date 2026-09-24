const mongoose = require('mongoose');
const crypto = require('crypto');
const StreakCycle = require('../models/StreakCycle');
const StreakClaim = require('../models/StreakClaim');
const AuditLog = require('../models/AuditLog');
const rewardService = require('./reward.service');
const walletService = require('./wallet.service');

const addHours = (date, hours) => new Date(date.getTime() + hours * 60 * 60 * 1000);

const logEvent = (userId, event, meta = {}) =>
  AuditLog.create({ userId, event, meta }).catch((err) => console.error('Audit log failed:', err.message));

const getOrCreateCycle = async (userId) => {
  let cycle = await StreakCycle.findOne({ userId });
  if (!cycle) {
    cycle = await StreakCycle.create({ userId, cycleNumber: 1, currentDay: 1, currentStreak: 0, status: 'ACTIVE' });
  }
  return cycle;
};

// Lazily detects a missed streak on every read - no cron job needed. The
// very next request the user makes (GET /status or POST /claim) is what
// discovers and applies the reset, using server time as the only clock
// (spec sections 15, 49-51).
const applyMissedResetIfNeeded = async (cycle, config) => {
  if (cycle.status !== 'ACTIVE' || !cycle.nextClaimAt) return cycle; // day 1 / nothing claimed yet -> nothing to miss

  const missedDeadline = addHours(cycle.nextClaimAt, config.missedGraceHours);
  if (new Date() <= missedDeadline) return cycle;

  const reset = await StreakCycle.findOneAndUpdate(
    { _id: cycle._id, cycleNumber: cycle.cycleNumber }, // guards against a concurrent reset/claim
    {
      $set: { currentDay: 1, currentStreak: 0, status: 'ACTIVE', lastClaimedAt: null, nextClaimAt: null },
      $inc: { cycleNumber: 1 },
    },
    { new: true }
  );

  if (reset) {
    await logEvent(cycle.userId, 'STREAK_RESET', { previousCycle: cycle.cycleNumber });
    return reset;
  }
  return StreakCycle.findById(cycle._id); // someone else already resolved it
};

const buildStatusResponse = async (userId) => {
  const config = await rewardService.getConfig();
  let cycle = await getOrCreateCycle(userId);
  cycle = await applyMissedResetIfNeeded(cycle, config);

  const now = new Date();
  const claimable =
    cycle.status === 'ACTIVE' && (!cycle.nextClaimAt || now >= cycle.nextClaimAt) && cycle.currentDay <= config.totalDays;
  const rewards = await rewardService.getAllRewards();

  const rewardCards = rewards.map((r) => {
    let status;
    if (cycle.status === 'COMPLETED' || r.day < cycle.currentDay) status = 'CLAIMED';
    else if (r.day > cycle.currentDay) status = 'LOCKED';
    else status = claimable ? 'AVAILABLE' : 'LOCKED';

    return {
      day: r.day,
      status,
      nextClaimAt: r.day === cycle.currentDay && !claimable ? cycle.nextClaimAt : undefined,
      reward: { type: r.rewardType, currency: r.currency, amount: r.amount, title: r.title, assetType: r.assetType },
    };
  });

  const nextRewardConfig = cycle.status === 'COMPLETED' ? null : rewards.find((r) => r.day === cycle.currentDay);

  return {
    success: true,
    serverTime: now.toISOString(),
    streak: {
      currentStreak: cycle.currentStreak,
      currentDay: Math.min(cycle.currentDay, config.totalDays),
      checkedIn: cycle.currentStreak,
      totalRewards: config.totalDays,
      status: cycle.status,
      claimable,
      nextClaimAt: cycle.nextClaimAt,
      nextReward: nextRewardConfig
        ? { day: nextRewardConfig.day, type: nextRewardConfig.rewardType, amount: nextRewardConfig.amount, currency: nextRewardConfig.currency }
        : null,
    },
    rewards: rewardCards,
  };
};

const claim = async (userId) => {
  await logEvent(userId, 'STREAK_CLAIM_REQUEST');

  const config = await rewardService.getConfig();
  let cycle = await getOrCreateCycle(userId);
  cycle = await applyMissedResetIfNeeded(cycle, config);

  if (cycle.status === 'COMPLETED') {
    await logEvent(userId, 'STREAK_CLAIM_REJECTED', { reason: 'CYCLE_COMPLETED' });
    throw Object.assign(new Error('You have completed this streak cycle. Check back for the next one.'), {
      statusCode: 400,
    });
  }

  const now = new Date();
  const claimable = !cycle.nextClaimAt || now >= cycle.nextClaimAt;
  if (!claimable) {
    await logEvent(userId, 'STREAK_CLAIM_REJECTED', { reason: 'LOCKED', nextClaimAt: cycle.nextClaimAt });
    throw Object.assign(new Error('Your next reward is not available yet.'), { statusCode: 400 });
  }

  // The request body is intentionally never consulted for which day to
  // grant - "day" always comes from the server's own record of the user's
  // state (spec sections 14, 35, 99).
  const day = cycle.currentDay;
  const reward = await rewardService.getRewardForDay(day);
  const isLastDay = day >= config.totalDays;
  const nextClaimAt = isLastDay ? null : addHours(now, config.claimIntervalHours);
  const referenceId = `STREAK-${crypto.randomUUID()}`;

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // The atomic lock: this update only succeeds if the cycle is still
    // exactly where we just read it. A concurrent duplicate request finds
    // no match here and fails cleanly - this is what makes claiming safe
    // under a race and idempotent under a retry (spec sections 40-42).
    const lockedCycle = await StreakCycle.findOneAndUpdate(
      { _id: cycle._id, cycleNumber: cycle.cycleNumber, currentDay: day, status: 'ACTIVE' },
      {
        $set: {
          currentDay: day + 1,
          lastClaimedAt: now,
          nextClaimAt,
          status: isLastDay ? 'COMPLETED' : 'ACTIVE',
        },
        $inc: { currentStreak: 1 },
      },
      { new: true, session }
    );

    if (!lockedCycle) {
      await session.abortTransaction();
      await logEvent(userId, 'DUPLICATE_CLAIM', { day });
      throw Object.assign(new Error('This reward has already been claimed.'), { statusCode: 409 });
    }

    await StreakClaim.create(
      [{ userId, cycleNumber: cycle.cycleNumber, day, rewardId: reward._id, claimedAt: now, transactionId: referenceId }],
      { session }
    );

    await walletService.creditReward({ userId, reward, streakDay: day, referenceId, session });

    await session.commitTransaction();
    await logEvent(userId, 'STREAK_CLAIM_SUCCESS', { day, referenceId });
  } catch (err) {
    if (session.inTransaction()) await session.abortTransaction();

    if (err.code === 11000) {
      await logEvent(userId, 'DUPLICATE_CLAIM', { day });
      throw Object.assign(new Error('This reward has already been claimed.'), { statusCode: 409 });
    }
    throw err;
  } finally {
    session.endSession();
  }

  return buildStatusResponse(userId);
};

const getHistory = async (userId) =>
  StreakClaim.find({ userId })
    .sort({ claimedAt: -1 })
    .populate('rewardId', 'day rewardType currency amount title');

module.exports = { getStatus: buildStatusResponse, claim, getHistory };
