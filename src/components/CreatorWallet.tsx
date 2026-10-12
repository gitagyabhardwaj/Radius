import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { CheckCircle2, CircleDashed, Clock, Banknote, History, Wallet, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CreatorWalletProps {
  currentUser: any;
  velocitySubscribed: boolean;
}

export default function CreatorWallet({ currentUser, velocitySubscribed }: CreatorWalletProps) {
  const earnings = useQuery(api.escrow.getCreatorEarnings);
  const transactions = useQuery(api.escrow.getCreatorTransactions);
  const requestWithdrawal = useMutation(api.escrow.requestWithdrawal);

  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [upiId, setUpiId] = useState<string>(currentUser?.upiId || '');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState<boolean>(false);

  const handleWithdraw = async () => {
    setWithdrawError(null);
    setWithdrawSuccess(false);

    if (!upiId) {
      setWithdrawError('Please enter a valid UPI ID');
      return;
    }

    const amountNum = parseFloat(withdrawAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setWithdrawError('Please enter a valid amount');
      return;
    }

    if (earnings && amountNum > earnings.availableBalance) {
      setWithdrawError('Amount exceeds available balance');
      return;
    }

    setIsWithdrawing(true);
    try {
      await requestWithdrawal({ amount: amountNum, upiId });
      setWithdrawSuccess(true);
      setWithdrawAmount('');
      setTimeout(() => setWithdrawSuccess(false), 5000);
    } catch (err: any) {
      console.error('Withdrawal error:', err);
      setWithdrawError(err.message || 'Failed to process withdrawal');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const setMaxAmount = () => {
    if (earnings) {
      setWithdrawAmount(earnings.availableBalance.toString());
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      
      {/* Balances Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Available Balance */}
        <div className="bg-zinc-900/70 border border-emerald-500/30 backdrop-blur-xl shadow-[0_0_30px_-5px_rgba(16,185,129,0.15)] ring-1 ring-white/5 rounded-2xl p-6 flex flex-col gap-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-sans tracking-wider text-emerald-400 font-bold uppercase">Available Balance</span>
            <Wallet className="w-4 h-4 text-emerald-500/50" />
          </div>
          <span className="text-4xl font-display font-bold text-white">
            {earnings === undefined ? (
              <span className="inline-block w-24 h-8 bg-zinc-800 rounded animate-pulse" />
            ) : (
              `₹${earnings.availableBalance.toFixed(2)}`
            )}
          </span>
          <p className="text-xs text-zinc-400 font-mono">Cleared from escrow, ready for withdrawal.</p>
        </div>

        {/* Pending Escrow */}
        <div className="bg-zinc-900/70 border border-zinc-800/50 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 rounded-2xl p-6 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-sans tracking-wider text-zinc-400 font-bold uppercase">Pending in Escrow</span>
            <Clock className="w-4 h-4 text-zinc-500/50" />
          </div>
          <span className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-500">
            {earnings === undefined ? (
              <span className="inline-block w-24 h-8 bg-zinc-800 rounded animate-pulse" />
            ) : (
              `₹${earnings.totalPending.toFixed(2)}`
            )}
          </span>
          <p className="text-xs text-zinc-400 font-mono">Secured by smart contracts, awaiting verification.</p>
        </div>

        {/* Total Withdrawn */}
        <div className="bg-zinc-900/70 border border-zinc-800/50 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 rounded-2xl p-6 flex flex-col gap-3">
           <div className="flex items-center justify-between">
            <span className="text-[11px] font-sans tracking-wider text-zinc-400 font-bold uppercase">Total Withdrawn</span>
            <Banknote className="w-4 h-4 text-zinc-500/50" />
          </div>
          <span className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-500">
            {earnings === undefined ? (
              <span className="inline-block w-24 h-8 bg-zinc-800 rounded animate-pulse" />
            ) : (
              `₹${earnings.totalWithdrawn.toFixed(2)}`
            )}
          </span>
          <p className="text-xs text-zinc-400 font-mono">Lifetime payouts sent to your bank account.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Withdrawal Panel */}
        <div className="lg:col-span-5 bg-zinc-900/70 border border-zinc-800/50 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 rounded-2xl p-6 flex flex-col gap-6">
          <div className="border-b border-zinc-800 pb-4">
            <h3 className="text-sm font-display font-bold text-white tracking-widest uppercase">Withdraw Funds</h3>
            <p className="text-xs text-zinc-400 mt-1 font-mono">Transfer available balance directly via UPI.</p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-sans tracking-wider text-white font-bold uppercase">UPI ID</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-700 font-mono transition-colors placeholder:text-zinc-600"
                placeholder="e.g. yourname@okicici"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-sans tracking-wider text-white font-bold uppercase">Amount (₹)</label>
                <button onClick={setMaxAmount} className="text-[10px] text-emerald-400 hover:text-emerald-300 font-mono tracking-wider font-bold uppercase transition-colors">
                  MAX
                </button>
              </div>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-700 font-mono transition-colors placeholder:text-zinc-600"
                placeholder="0.00"
              />
            </div>
            
            <div className="flex items-start gap-2 bg-zinc-950 p-3 rounded-xl border border-zinc-800/50">
              <Clock className="w-3.5 h-3.5 text-zinc-400 mt-0.5 shrink-0" />
              <p className="text-[10px] font-mono text-zinc-400 leading-relaxed">
                Standard processing time is 24-48 hours. Withdrawals are processed safely directly to your registered UPI ID.
              </p>
            </div>
            
            <AnimatePresence>
              {withdrawError && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-[11px] font-mono text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl">
                  {withdrawError}
                </motion.div>
              )}
              {withdrawSuccess && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3" />
                  Withdrawal requested successfully!
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={handleWithdraw}
              disabled={isWithdrawing || (earnings?.availableBalance || 0) <= 0}
              className="w-full py-3 bg-white hover:bg-zinc-200 text-black font-mono text-sm rounded-xl font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isWithdrawing ? (
                <>
                  <CircleDashed className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Transfer to Bank
                  <ArrowUpRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Transaction History */}
        <div className="lg:col-span-7 bg-zinc-900/70 border border-zinc-800/50 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 rounded-2xl p-6 flex flex-col gap-6">
           <div className="border-b border-zinc-800 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-display font-bold text-white tracking-widest uppercase">Transaction Ledger</h3>
              <p className="text-xs text-zinc-400 mt-1 font-mono">History of all campaign payouts and withdrawals.</p>
            </div>
            <History className="w-5 h-5 text-zinc-500" />
          </div>

          <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {!transactions ? (
              // Loading state
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 border border-zinc-800/50 rounded-xl flex items-center justify-between bg-zinc-950/50 animate-pulse">
                  <div className="flex flex-col gap-2">
                    <div className="w-32 h-4 bg-zinc-800 rounded" />
                    <div className="w-24 h-3 bg-zinc-800 rounded" />
                  </div>
                  <div className="w-16 h-6 bg-zinc-800 rounded" />
                </div>
              ))
            ) : transactions.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-zinc-500">
                <History className="w-8 h-8 opacity-50" />
                <p className="text-sm font-mono">No transactions yet.</p>
              </div>
            ) : (
              transactions.map((tx: any) => (
                <div key={tx.id} className="p-4 border border-zinc-800/50 rounded-xl flex items-center justify-between bg-zinc-950/50 hover:bg-zinc-900/50 transition-colors group">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {tx.type === 'payout' ? tx.campaignName : 'Funds Withdrawn'}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">
                      {tx.type === 'payout' ? `From: ${tx.brandName}` : tx.campaignName}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {new Date(tx.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-zinc-700" />
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        tx.status === 'Released' || tx.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        tx.status === 'Escrow Locked' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        tx.status === 'Deliverable Verified' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        tx.status === 'Pending' || tx.status === 'Processing' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`font-mono font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-white'}`}>
                      {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
