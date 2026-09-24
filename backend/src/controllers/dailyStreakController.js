const streakService = require('../services/streak.service');
const asyncHandler = require('../utils/asyncHandler');

const getStreak = asyncHandler(async (req, res) => {
  const data = await streakService.getStatus(req.user._id);
  res.json(data);
});

const claim = asyncHandler(async (req, res) => {
  const data = await streakService.claim(req.user._id);
  res.json(data);
});

const getHistory = asyncHandler(async (req, res) => {
  const history = await streakService.getHistory(req.user._id);
  res.json({ success: true, history });
});

module.exports = { getStreak, claim, getHistory };
