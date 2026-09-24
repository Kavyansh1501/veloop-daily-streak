const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');

// Credits VEs to the wallet and writes the matching ledger entry as one
// atomic step. Gift-card rewards still produce a transaction record (so
// there's always a full paper trail) but don't move the VEs balance -
// they aren't spendable currency, just a logged entitlement.
const creditReward = async ({ userId, reward, streakDay, referenceId, session }) => {
  const wallet = await Wallet.findOne({ userId }).session(session);
  const balanceBefore = wallet.vesBalance;
  const isSpendableVEs = reward.rewardType === 'VES';

  if (isSpendableVEs) {
    wallet.vesBalance += reward.amount;
    await wallet.save({ session });
  }

  const balanceAfter = wallet.vesBalance;

  const [transaction] = await WalletTransaction.create(
    [
      {
        transactionId: referenceId,
        userId,
        currency: reward.currency,
        type: 'CREDIT',
        amount: reward.amount,
        source: 'DAILY_STREAK',
        referenceId,
        streakDay,
        balanceBefore,
        balanceAfter,
        status: 'SUCCESS',
      },
    ],
    { session }
  );

  return { wallet, transaction };
};

module.exports = { creditReward };
