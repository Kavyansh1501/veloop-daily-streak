require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const StreakConfig = require('../src/models/StreakConfig');
const StreakReward = require('../src/models/StreakReward');

// Values match the supplied VELoop design exactly (spec section 19).
const REWARDS = [
  { day: 1, rewardType: 'VES', currency: 'VES', amount: 5, title: 'Daily Reward', assetType: 'coin' },
  { day: 2, rewardType: 'VES', currency: 'VES', amount: 10, title: 'Daily Reward', assetType: 'coin' },
  { day: 3, rewardType: 'VES', currency: 'VES', amount: 15, title: 'Daily Reward', assetType: 'coin' },
  {
    day: 4,
    rewardType: 'GIFT_CARD',
    currency: 'INR',
    amount: 1,
    title: 'Daily Reward',
    subtitle: 'Amazon Gift Card',
    assetType: 'gift-card',
  },
  {
    day: 5,
    rewardType: 'GIFT_CARD',
    currency: 'INR',
    amount: 2,
    title: 'Daily Reward',
    subtitle: 'Amazon Gift Card',
    assetType: 'gift-card',
  },
  { day: 6, rewardType: 'VES', currency: 'VES', amount: 30, title: 'Daily Reward', assetType: 'coin' },
  {
    day: 7,
    rewardType: 'GIFT_CARD',
    currency: 'INR',
    amount: 5,
    title: 'Ultimate Reward',
    subtitle: 'Amazon Gift Card',
    assetType: 'crown',
  },
];

const run = async () => {
  await connectDB();

  await StreakConfig.deleteMany({});
  await StreakConfig.create({ totalDays: 7, claimIntervalHours: 24, missedGraceHours: 24, active: true });

  await StreakReward.deleteMany({});
  await StreakReward.insertMany(REWARDS);

  console.log(`Seeded StreakConfig and ${REWARDS.length} StreakReward days.`);
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
