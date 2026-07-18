import React, { useState } from 'react';
import { Bot, RefreshCw, Zap, Sliders, Play, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { BotLog, LPTrader } from '../types';

interface AutonomyBotProps {
  // Autonomy Bot States & Setters
  botActive: boolean;
  setBotActive: (val: boolean) => void;
  scansCount: number;
  botAccumulatedFees: number;
  botSpendingLimit: number;
  botWalletBalance: number;
  poolClassLock: 'Any' | 'Established' | 'Degen';
  setPoolClassLock: (val: 'Any' | 'Established' | 'Degen') => void;
  botInputToken: string;
  setBotInputToken: (val: string) => void;
  botAmountPerPosition: number;
  setBotAmountPerPosition: (val: number) => void;
  botMaxOpenPositions: number;
  setBotMaxOpenPositions: (val: number) => void;
  dailySpendingLimitEnabled: boolean;
  setDailySpendingLimitEnabled: (val: boolean) => void;
  botRewardTarget: number;
  setBotRewardTarget: (val: number) => void;
  botCapitalGuardEnabled: boolean;
  setBotCapitalGuardEnabled: (val: boolean) => void;
  botDepositStrategy: 'Quote only' | 'Two-sided' | 'Base only';
  setBotDepositStrategy: (val: 'Quote only' | 'Two-sided' | 'Base only') => void;
  
  // LP Copier Props
  lpTraders: LPTrader[];
  toggleLPCopy: (id: string) => void;
  copierLogs: string[];
  
  // Bot Scanning Props
  botLogs: BotLog[];
  setBotLogs: React.Dispatch<React.SetStateAction<BotLog[]>>;
  triggerToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export default function AutonomyBot({
  botActive,
  setBotActive,
  scansCount,
  botAccumulatedFees,
  botSpendingLimit,
  botWalletBalance,
  poolClassLock,
  setPoolClassLock,
  botInputToken,
  setBotInputToken,
  botAmountPerPosition,
  setBotAmountPerPosition,
  botMaxOpenPositions,
  setBotMaxOpenPositions,
  dailySpendingLimitEnabled,
  setDailySpendingLimitEnabled,
  botRewardTarget,
  setBotRewardTarget,
  botCapitalGuardEnabled,
  setBotCapitalGuardEnabled,
  botDepositStrategy,
  setBotDepositStrategy,
  lpTraders,
  toggleLPCopy,
  copierLogs,
  botLogs,
  setBotLogs,
  triggerToast
}: AutonomyBotProps) {
  const [subTab, setSubTab] = useState<'AUTONOMY' | 'COPY_LP'>('AUTONOMY');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">AstraFi Autonomy Engine</h2>
          <p className="text-sm text-slate-400">Leverage flash arbitrage cycles and rebalancing scripts across L2 liquidity pools.</p>
        </div>

        {/* Dual Tab Toggle */}
        <div className="flex bg-[#111116] border border-[#1e1e26] rounded-xl p-1">
          <button
            onClick={() => setSubTab('AUTONOMY')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              subTab === 'AUTONOMY'
                ? 'bg-[#1a1a24] text-emerald-400 border border-[#2a2a38]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="h-3.5 w-3.5" />
            Autonomy Bot
          </button>
          <button
            onClick={() => setSubTab('COPY_LP')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              subTab === 'COPY_LP'
                ? 'bg-[#1a1a24] text-emerald-400 border border-[#2a2a38]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            Copy LPing
          </button>
        </div>
      </div>

      {subTab === 'AUTONOMY' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Config column (left-side span 2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Status Panel (Image 5 style) */}
            <div className="panel-dark grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#111116] border border-[#23232f]">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Autonomy Bot</span>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => {
                      setBotActive(!botActive);
                      triggerToast(`Autonomy Bot is now ${!botActive ? 'ONLINE & scanning grids' : 'OFFLINE'}`, !botActive ? 'success' : 'warning');
                    }}
                    className={`w-12 h-6 rounded-full p-0.5 transition-all flex items-center ${
                      botActive ? 'bg-emerald-500 justify-end' : 'bg-slate-800 justify-start'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-[#070709] border border-slate-700/50" />
                  </button>
                  <span className={`text-xs font-mono font-bold ${botActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {botActive ? 'ACTIVE' : 'OFFLINE'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col border-l border-slate-800/80 pl-4">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Scans</span>
                <span className="text-lg font-mono font-bold mt-1 text-slate-200">{scansCount}</span>
              </div>

              <div className="flex flex-col border-l border-slate-800/80 pl-4">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Fees Accumulated</span>
                <span className="text-lg font-mono font-bold mt-1 text-emerald-400">${botAccumulatedFees.toFixed(2)}</span>
              </div>

              <div className="flex flex-col border-l border-slate-800/80 pl-4">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Spending Limit</span>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="flex-1 bg-slate-900 rounded-full h-1.5 max-w-[80px]">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '85%' }} />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">85%</span>
                </div>
              </div>
            </div>

            {/* Custom Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Box 1: Pool Class Lock & Token Setup */}
              <div className="panel-dark space-y-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="h-4 w-4 text-emerald-400" />
                  Pool Class Lock & Token
                </h3>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Class Selection:</label>
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800/80">
                    {['Any', 'Established', 'Degen'].map((lock) => (
                      <button
                        key={lock}
                        onClick={() => {
                          setPoolClassLock(lock as any);
                          triggerToast(`Scanner locked to ${lock} pools.`, 'info');
                        }}
                        className={`py-1.5 text-[10px] font-bold rounded-lg transition-all border ${
                          poolClassLock === lock
                            ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400 font-bold'
                            : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {lock}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Bot Spending Asset:</label>
                  <select
                    value={botInputToken}
                    onChange={(e) => {
                      setBotInputToken(e.target.value);
                      triggerToast(`Spending asset set to ${e.target.value}`, 'info');
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500/50"
                  >
                    <option value="USDC">USDC (Stable USD)</option>
                    <option value="USDT">USDT (Tether USD)</option>
                    <option value="ETH">ETH (Ethereum Native)</option>
                    <option value="ARB">ARB (Arbitrum native)</option>
                  </select>
                </div>
              </div>

              {/* Box 2: Bot Sizing Sliders */}
              <div className="panel-dark space-y-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Bot Constraints</h3>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
                    <span>Amt per Position:</span>
                    <span className="text-emerald-400 font-mono">${botAmountPerPosition} {botInputToken}</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="500"
                    step="5"
                    value={botAmountPerPosition}
                    onChange={(e) => setBotAmountPerPosition(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 h-1.5 bg-slate-900 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
                    <span>Max Open Positions:</span>
                    <span className="text-emerald-400 font-mono">{botMaxOpenPositions} Pools</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={botMaxOpenPositions}
                    onChange={(e) => setBotMaxOpenPositions(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 h-1.5 bg-slate-900 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Box 3: Reward Strategy (Image 5 style) */}
              <div className="panel-dark space-y-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Reward Strategy</h3>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Trigger Target:</label>
                  <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80 text-[10px] font-bold font-mono">
                    {[0.5, 1.0, 5.0, 10, 25, 50].map((tgt) => (
                      <button
                        key={tgt}
                        onClick={() => {
                          setBotRewardTarget(tgt);
                          triggerToast(`Trigger profit target set to +${tgt}%`, 'info');
                        }}
                        className={`py-1 rounded border ${
                          botRewardTarget === tgt
                            ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400 font-bold'
                            : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        +{tgt}%
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-300 uppercase">Capital Guard</span>
                    <span className="text-[9px] text-slate-500 leading-none mt-0.5">Auto SL hedge defense</span>
                  </div>
                  <button
                    onClick={() => {
                      setBotCapitalGuardEnabled(!botCapitalGuardEnabled);
                      triggerToast(`Capital Guard: ${!botCapitalGuardEnabled ? 'ACTIVE' : 'DEACTIVATED'}`, 'info');
                    }}
                    className={`w-10 h-5 rounded-full p-0.5 transition-all flex items-center ${
                      botCapitalGuardEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-800 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-[#070709]" />
                  </button>
                </div>
              </div>

              {/* Box 4: Deposit Strategy */}
              <div className="panel-dark space-y-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Deposit Strategy</h3>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-sans">Active Strategy Path:</label>
                  <div className="grid grid-cols-1 gap-2">
                    {['Quote only', 'Two-sided', 'Base only'].map((strat) => (
                      <button
                        key={strat}
                        onClick={() => {
                          setBotDepositStrategy(strat as any);
                          triggerToast(`Deposit strategy route updated: ${strat}`, 'info');
                        }}
                        className={`py-2 px-3 text-left text-xs font-bold rounded-xl transition border flex justify-between items-center ${
                          botDepositStrategy === strat
                            ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400 font-bold'
                            : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <span>{strat} execution routing</span>
                        {botDepositStrategy === strat && <Zap className="h-3.5 w-3.5 text-emerald-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Activity terminal column (right-side span 1) */}
          <div className="panel-dark flex flex-col justify-between h-full min-h-[460px] lg:col-span-1">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${botActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">AstraBot Transaction Stream</h3>
                </div>
                <button
                  onClick={() => {
                    setBotLogs([{ id: 'init', timestamp: new Date().toLocaleTimeString(), type: 'info', message: 'Cleared console stream logs.' }]);
                    triggerToast('Telemetry logs cleared');
                  }}
                  className="text-[10px] text-slate-500 hover:text-white transition flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  Clear
                </button>
              </div>

              <div className="bg-slate-950 font-mono text-[11px] text-slate-300 p-4 rounded-xl border border-slate-800/80 h-96 overflow-y-auto space-y-2.5">
                {botLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-slate-500 flex-shrink-0">[{log.timestamp}]</span>
                    <span className={`px-1 rounded text-[9px] font-bold uppercase flex-shrink-0 border ${
                      log.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      log.type === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      log.type === 'arbitrage' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-slate-800 text-slate-400 border-transparent'
                    }`}>
                      {log.type}
                    </span>
                    <span>{log.message}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 text-[10px] text-slate-500 bg-slate-950/40 p-3 rounded-lg border border-slate-800/60 leading-normal">
              ⚠️ Arbitrage scanner ticks execute automatically utilizing flash loans. Gas safety safeguards are established with standard prioritization.
            </div>
          </div>
        </div>
      ) : (
        /* Copy LPing Interface (Old LP Copier beautifully nested) */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-300">Top Performing Arbitrum LP Whales</h3>
            {lpTraders.map((trader) => (
              <div
                key={trader.id}
                className={`p-4 rounded-xl border transition-all ${
                  trader.copied
                    ? 'bg-emerald-950/10 border-emerald-500/40 shadow-sm shadow-emerald-500/5'
                    : 'bg-[#101014] border-[#1d1d25]'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-100">{trader.name}</span>
                      <span className="text-[10px] bg-slate-950 text-emerald-400 font-mono px-2 py-0.5 rounded border border-emerald-500/20">{trader.pair} LP</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Last Action: <span className="font-mono text-emerald-300">{trader.lastAction}</span></p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">PnL (All-Time)</span>
                    <div className="text-sm font-mono font-bold text-emerald-400 flex items-center justify-end gap-0.5">
                      <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
                      +{trader.pnl}%
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-400 font-sans">
                    {trader.copied ? (
                      <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Allocated 25% portfolio USDC
                      </span>
                    ) : 'Deactivated'}
                  </div>
                  <button
                    onClick={() => toggleLPCopy(trader.id)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-bold transition ${
                      trader.copied
                        ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-black shadow-sm'
                    }`}
                  >
                    {trader.copied ? 'Stop Copying' : 'Copy Positions'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="panel-dark flex flex-col justify-between h-full min-h-[380px]">
            <div>
              <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                LP Replication Log
              </h3>
              
              <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 font-mono text-xs text-slate-300 h-64 overflow-y-auto space-y-3">
                {copierLogs.map((log, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-slate-500 flex-shrink-0">[{new Date().toLocaleTimeString()}]</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 text-[10px] text-slate-500 bg-slate-950/40 p-3 rounded-lg border border-slate-800/60 leading-normal">
              ⚠️ LP replication carries risk of Impermanent Loss. Ticks adjustments replicate whale transactions block-by-block.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
