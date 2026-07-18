import React, { useState, useMemo } from 'react';
import { Layers, RefreshCw, Eye, AlertTriangle, Plus, X, Sliders, Play, ArrowDownLeft } from 'lucide-react';
import { PositionItem } from '../types';

interface PositionsTabProps {
  positions: PositionItem[];
  onClosePosition: (id: string) => void;
  onCreateCustomPosition: (name: string, amount: number, strategy: string) => void;
  usdcBalance: number;
  triggerToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export default function PositionsTab({
  positions,
  onClosePosition,
  onCreateCustomPosition,
  usdcBalance,
  triggerToast
}: PositionsTabProps) {
  const [subTab, setSubTab] = useState<'OPEN' | 'COMPLETED' | 'HIDDEN'>('OPEN');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Custom manual position builder state
  const [customPairName, setCustomPairName] = useState('BONK / SOL');
  const [customInvestAmount, setCustomInvestAmount] = useState('15');
  const [customStrategy, setCustomStrategy] = useState('Two-sided');

  const filteredPositions = useMemo(() => {
    if (subTab === 'OPEN') {
      return positions.filter((p) => p.status === 'In Range' || p.status === 'Out of Range');
    } else if (subTab === 'COMPLETED') {
      return positions.filter((p) => p.status === 'Closed');
    } else {
      return []; // empty hidden tab
    }
  }, [positions, subTab]);

  // Overall position stats
  const totalStats = useMemo(() => {
    let portfolioValue = 0;
    let unrealizedPnl = 0;
    let realizedPnl = 0;
    let openCount = 0;

    positions.forEach((p) => {
      if (p.status !== 'Closed') {
        portfolioValue += p.currentValue;
        unrealizedPnl += p.pnlDollar;
        openCount++;
      } else {
        realizedPnl += p.pnlDollar;
      }
    });

    return {
      portfolioValue,
      unrealizedPnl,
      realizedPnl,
      openCount
    };
  }, [positions]);

  return (
    <div className="space-y-6">
      
      {/* Upper Metrics Grid (Image 2 style) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="panel-dark p-4 flex flex-col justify-between">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Portfolio Value</span>
          <span className="text-lg font-mono font-bold mt-1 text-slate-100">
            ${totalStats.portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="panel-dark p-4 flex flex-col justify-between">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Open Positions</span>
          <span className="text-lg font-mono font-bold mt-1 text-slate-100">
            {totalStats.openCount} Pairs
          </span>
        </div>

        <div className="panel-dark p-4 flex flex-col justify-between">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Unrealized P&L</span>
          <span className={`text-lg font-mono font-bold mt-1 ${totalStats.unrealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalStats.unrealizedPnl >= 0 ? '+' : ''}${totalStats.unrealizedPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="panel-dark p-4 flex flex-col justify-between">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Realized P&L</span>
          <span className={`text-lg font-mono font-bold mt-1 ${totalStats.realizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalStats.realizedPnl >= 0 ? '+' : ''}${totalStats.realizedPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="panel-dark p-4 flex flex-col justify-between col-span-2 lg:col-span-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Fees Earned</span>
          <span className="text-lg font-mono font-bold mt-1 text-emerald-400">
            +${(totalStats.portfolioValue * 0.0034).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
        
        {/* Navigation tabs (Image 2 style) */}
        <div className="flex bg-[#111116] border border-[#1e1e26] rounded-xl p-1 text-xs">
          {(['OPEN', 'COMPLETED', 'HIDDEN'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSubTab(tab)}
              className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
                subTab === tab
                  ? 'bg-[#1a1a24] text-emerald-400 border border-[#2a2a38]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()} ({tab === 'OPEN' ? totalStats.openCount : tab === 'COMPLETED' ? positions.filter(p => p.status === 'Closed').length : 0})
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-black font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-600/10"
          >
            <Plus className="h-4 w-4" />
            New Position
          </button>
        </div>
      </div>

      {/* Position Cards Layout (Image 2 style) */}
      {filteredPositions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPositions.map((pos) => {
            const isOutOfRange = pos.status === 'Out of Range';
            return (
              <div
                key={pos.id}
                className="panel-dark flex flex-col justify-between hover:border-slate-800/80 bg-[#101014] border border-[#1d1d25]"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-100">{pos.name}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold border uppercase ${
                          pos.type === 'Bot' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {pos.type}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono mt-1 block">Created: {pos.timestamp}</span>
                    </div>

                    <div className="text-right">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                        isOutOfRange
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : pos.status === 'Closed'
                          ? 'bg-slate-800 text-slate-400 border border-slate-700/40'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isOutOfRange ? 'bg-amber-400 animate-pulse' : pos.status === 'Closed' ? 'bg-slate-500' : 'bg-emerald-400'}`} />
                        {pos.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 bg-slate-950/50 rounded-xl p-3.5 border border-slate-800/80 my-4 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider font-sans">Active Capital</span>
                      <div className="text-slate-200 mt-0.5 font-bold">${pos.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider font-sans font-semibold">Invested Size</span>
                      <div className="text-slate-400 mt-0.5">${pos.investedAmount.toLocaleString()} USDC</div>
                    </div>
                    <div className="col-span-2 border-t border-slate-800/60 pt-2 flex justify-between">
                      <span className="text-slate-500 text-[10px] font-sans">Trigger Path:</span>
                      <span className="text-slate-300 text-[10px]">{pos.depositStrategy} routing</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/60 pt-3 mt-1 text-xs">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-sans">Unrealized profit:</span>
                    <span className={`font-mono font-bold ${pos.pnlDollar >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {pos.pnlDollar >= 0 ? '+' : ''}${pos.pnlDollar.toFixed(2)} ({pos.pnlPercent.toFixed(2)}%)
                    </span>
                  </div>

                  {pos.status !== 'Closed' && (
                    <button
                      onClick={() => onClosePosition(pos.id)}
                      className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold text-[11px] px-3.5 py-1.5 rounded-lg transition"
                    >
                      Close LP Position
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="panel-dark text-center py-16 space-y-3 bg-[#111116] border border-slate-800/50 max-w-xl mx-auto">
          <Layers className="h-10 w-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No active positions on current wallet</h3>
          <p className="text-xs text-slate-500">
            You do not have any LP liquidity pairs or Autonomy bot positions open. Enter a custom pool pairing or deploy capital to start earning yield.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-black font-bold text-xs px-4 py-2.5 rounded-lg transition"
          >
            Create First Position
          </button>
        </div>
      )}

      {/* Manual LP position creator modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101014] border border-[#1d1d25] rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-emerald-400" />
              Build Concentrated LP Position
            </h3>
            <p className="text-xs text-slate-400 mt-1">Deploy liquidity into Arbitrum Uniswap pools using smart routing paths.</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const amt = parseFloat(customInvestAmount);
                if (isNaN(amt) || amt <= 0) {
                  triggerToast('Please enter a valid deposit size', 'warning');
                  return;
                }
                if (amt > usdcBalance) {
                  triggerToast('Insufficient USDC balance', 'warning');
                  return;
                }
                onCreateCustomPosition(customPairName, amt, customStrategy);
                setShowCreateModal(false);
              }}
              className="mt-5 space-y-4"
            >
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-bold text-slate-400">Select Pool Pair:</label>
                <select
                  value={customPairName}
                  onChange={(e) => setCustomPairName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500/50"
                >
                  <option value="BONK / SOL">BONK / SOL LP</option>
                  <option value="DOGE / USDC">DOGE / USDC LP</option>
                  <option value="SHIB / USDC">SHIB / USDC LP</option>
                  <option value="ANSEM / SOL">ANSEM / SOL LP</option>
                  <option value="WIF / SOL">WIF / SOL LP</option>
                  <option value="PEPE / ETH">PEPE / ETH LP</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-bold text-slate-400">Active Capital Input (USDC):</label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={customInvestAmount}
                    onChange={(e) => setCustomInvestAmount(e.target.value)}
                    placeholder="0.00"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono outline-none focus:border-emerald-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setCustomInvestAmount((usdcBalance * 0.95).toFixed(2))}
                    className="absolute right-2.5 top-1.5 bg-slate-900 border border-slate-800 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded"
                  >
                    MAX
                  </button>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Available Balance:</span>
                  <span>${usdcBalance.toLocaleString()} USDC</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-bold text-slate-400">Trigger Strategy Method:</label>
                <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800/80 text-[10px] font-bold font-mono text-center">
                  {['Two-sided', 'Quote only', 'Base only'].map((strat) => (
                    <button
                      key={strat}
                      type="button"
                      onClick={() => setCustomStrategy(strat)}
                      className={`py-1 rounded border ${
                        customStrategy === strat
                          ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400 font-bold'
                          : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {strat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[10px] text-slate-500 leading-relaxed font-sans">
                🔒 LP positions are non-custodial. Funds are locked directly within smart contract execution paths on Uniswap V3 Arbitrum networks.
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs py-2.5 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-black font-bold text-xs py-2.5 rounded-xl transition"
                >
                  Deploy LP Strategy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
