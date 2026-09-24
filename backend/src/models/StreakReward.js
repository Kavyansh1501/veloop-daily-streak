const mongoose = require('mongoose');

const streakRewardSchema = new mongoose.Schema(
  {
    day: { type: Number, required: true, unique: true, min: 1 },
    rewardType: { type: String, required: true, enum: ['VES', 'GIFT_CARD'] },
    currency: { type: String, required: true, enum: ['VES', 'INR'] },
    amount: { type: Number, required: true, min: 0 },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    assetType: { type: String, enum: ['coin', 'gift-card', 'crown'], default: 'coin' },
    active: { type: Boolean, default: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StreakReward', streakRewardSchema);
