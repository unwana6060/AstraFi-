import React from 'react';
import { Shield, Sparkles, Plus, ArrowDownLeft } from 'lucide-react';
import { VaultPool } from '../types';

interface YieldPoolsProps {
  pools: VaultPool[];
  handleOpenTxModal: (pool: VaultPool, type: 'deposit' | 'withdraw') => void;
  isLiveMode: boolean;
  accruedRewards: number;
  handleClaimRewards: () => void;
}

export default function YieldPools({
  pools,
  handleOpenTxModal,
  isLiveMode,
  accruedRewards,
  handleClaimRewards
}: YieldPoolsProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">AstraFi Yield Pool Suite</h2>
          <p className="text-sm text-slate-400">Automated capital-allocation strategies compounding yields natively on Arbitrum Layer 2.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-400" />
            <span>Smart Contract: Paused = <span className="text-emerald-400 font-mono">FALSE</span></span>
          </div>
          <button
            onClick={handleClaimRewards}
            disabled={accruedRewards <= 0}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-800 disabled:text-slate-500 text-black font-bold text-xs px-4 py-3 rounded-xl transition shadow-lg shadow-emerald-600/10"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Claim Rewards (${accruedRewards.toFixed(4)})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pools.map((pool) => (
          <div key={pool.id} className="panel-dark flex flex-col justify-between group">
            <div>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: pool.color }}>
                    {pool.token} Strategy
                  </span>
                  <h3 className="text-base font-bold mt-0.5 text-slate-100">{pool.name}</h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-mono font-extrabold text-emerald-400">{pool.apy}% APY</div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    pool.risk === 'Low' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    pool.risk === 'Medium' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                  }`}>
                    {pool.risk} Risk Profile
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-950/50 rounded-xl p-3.5 border border-slate-800/80 my-4">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Total Staked (TVL)</span>
                  <div className="text-sm font-mono font-bold text-slate-300 mt-0.5">
                    ${pool.tvl.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Your Active Staked</span>
                  <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">
                    {pool.userDeposit > 0 ? `${pool.userDeposit} ${pool.token}` : '0.00'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-800/60">
              <button
                onClick={() => handleOpenTxModal(pool, 'deposit')}
                className="flex-1 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 font-bold text-xs py-2.5 px-3 rounded-lg transition duration-150 flex items-center justify-center gap-1.5 border border-emerald-500/20"
              >
                <Plus className="h-3.5 w-3.5" />
                Stake Assets
              </button>
              <button
                onClick={() => handleOpenTxModal(pool, 'withdraw')}
                disabled={pool.userDeposit <= 0}
                className="flex-1 bg-slate-800/60 hover:bg-slate-700/60 disabled:opacity-40 disabled:hover:bg-slate-800/60 text-slate-200 font-bold text-xs py-2.5 px-3 rounded-lg transition duration-150 flex items-center justify-center gap-1.5 border border-slate-700/60"
              >
                <ArrowDownLeft className="h-3.5 w-3.5" />
                Unstake Position
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
