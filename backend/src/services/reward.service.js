const StreakConfig = require('../models/StreakConfig');
const StreakReward = require('../models/StreakReward');

const getConfig = async () => {
  const config = await StreakConfig.findOne({ active: true }).sort({ createdAt: -1 });
  if (!config) {
    throw Object.assign(new Error('Streak is not configured yet.'), { statusCode: 500 });
  }
  return config;
};

const getAllRewards = async () => StreakReward.find({ active: true }).sort({ day: 1 });

const getRewardForDay = async (day) => {
  const reward = await StreakReward.findOne({ day, active: true });
  if (!reward) {
    throw Object.assign(new Error(`No reward configured for day ${day}.`), { statusCode: 500 });
  }
  return reward;
};

module.exports = { getConfig, getAllRewards, getRewardForDay };
