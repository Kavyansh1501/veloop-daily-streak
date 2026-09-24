const mongoose = require('mongoose');

// One document per user, representing their CURRENT cycle. It's mutated
// in place as they claim each day. cycleNumber increments on every reset
// or completion, so StreakClaim's unique index (userId+cycleNumber+day)
// never collides with a previous cycle's history.
const streakCycleSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    cycleNumber: { type: Number, required: true, default: 1 },
    currentDay: { type: Number, required: true, default: 1 },
    currentStreak: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ['ACTIVE', 'COMPLETED'], default: 'ACTIVE' },
    lastClaimedAt: { type: Date, default: null },
    nextClaimAt: { type: Date, default: null }, // null = claimable right now
  },
  { timestamps: true }
);

module.exports = mongoose.model('StreakCycle', streakCycleSchema);
