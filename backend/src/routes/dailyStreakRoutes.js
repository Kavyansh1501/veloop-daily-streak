const express = require('express');
const rateLimit = require('express-rate-limit');
const { protect } = require('../middleware/auth');
const { getStreak, claim, getHistory } = require('../controllers/dailyStreakController');

const router = express.Router();

// Claiming is the one action that grants real value, so on top of the
// frontend disabling the button on click (spec 41), it gets its own
// tighter per-user rate limit here.
const claimLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  message: { success: false, message: 'Too many requests. Please slow down.' },
});

router.use(protect);

router.get('/', getStreak);
router.get('/status', getStreak); // same computed state serves both endpoints for this project's scope
router.get('/history', getHistory);
router.post('/claim', claimLimiter, claim);

module.exports = router;
