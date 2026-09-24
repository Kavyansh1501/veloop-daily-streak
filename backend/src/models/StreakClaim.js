const mongoose = require('mongoose');

const streakClaimSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cycleNumber: { type: Number, required: true },
    day: { type: Number, required: true },
    rewardId: { type: mongoose.Schema.Types.ObjectId, ref: 'StreakReward', required: true },
    status: { type: String, enum: ['SUCCESS'], default: 'SUCCESS' },
    claimedAt: { type: Date, required: true, default: Date.now },
    transactionId: { type: String, required: true },
  },
  { timestamps: true }
);

// The single most important line in this project: makes it physically
// impossible for one user to claim the same day of the same cycle twice,
// even under two simultaneous requests (spec sections 40-42, 62).
streakClaimSchema.index({ userId: 1, cycleNumber: 1, day: 1 }, { unique: true });

module.exports = mongoose.model('StreakClaim', streakClaimSchema);
