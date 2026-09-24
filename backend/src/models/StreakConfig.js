const mongoose = require('mongoose');

// Central knobs for the streak rules. If these values ever change, no
// service code or React code should need to change (spec section 66).
const streakConfigSchema = new mongoose.Schema(
  {
    totalDays: { type: Number, required: true, default: 7 },
    claimIntervalHours: { type: Number, required: true, default: 24 }, // time until the next day unlocks
    missedGraceHours: { type: Number, required: true, default: 24 }, // extra time allowed before a streak is considered missed
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StreakConfig', streakConfigSchema);
