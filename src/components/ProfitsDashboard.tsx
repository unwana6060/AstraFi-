import React, { useState, useMemo } from 'react';
import { TrendingUp, Calendar, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ProfitsDashboardProps {
  profitFilter: 'All' | 'Bot' | 'Manual';
  setProfitFilter: (val: 'All' | 'Bot' | 'Manual') => void;
  profitTimeframe: '7D' | '30D' | '90D' | 'All';
  setProfitTimeframe: (val: '7D' | '30D' | '90D' | 'All') => void;
}

export default function ProfitsDashboard({
  profitFilter,
  setProfitFilter,
  profitTimeframe,
  setProfitTimeframe
}: ProfitsDashboardProps) {
  
  // High-fidelity chart datasets
  const chartData = useMemo(() => {
    const filterMultiplier = profitFilter === 'Bot' ? 0.82 : profitFilter === 'Manual' ? 0.18 : 1.0;
    
    if (profitTimeframe === '7D') {
      return [
        { name: 'Mon', profit: Math.max(0, 120 * filterMultiplier) },
        { name: 'Tue', profit: Math.max(0, 250 * filterMultiplier) },
        { name: 'Wed', profit: Math.max(0, 410 * filterMultiplier) },
        { name: 'Thu', profit: Math.max(0, 320 * filterMultiplier) },
        { name: 'Fri', profit: Math.max(0, 580 * filterMultiplier) },
        { name: 'Sat', profit: Math.max(0, 790 * filterMultiplier) },
        { name: 'Sun', profit: Math.max(0, 1468.73 * filterMultiplier) }
      ];
    } else if (profitTimeframe === '90D') {
      return [
        { name: 'May 1', profit: Math.max(0, 100 * filterMultiplier) },
        { name: 'May 15', profit: Math.max(0, 320 * filterMultiplier) },
        { name: 'May 30', profit: Math.max(0, 550 * filterMultiplier) },
        { name: 'Jun 15', profit: Math.max(0, 890 * filterMultiplier) },
        { name: 'Jun 30', profit: Math.max(0, 1150 * filterMultiplier) },
        { name: 'Jul 15', profit: Math.max(0, 1468.73 * filterMultiplier) }
      ];
    } else { // 30D / All default
      return [
        { name: 'Jun 8', profit: Math.max(0, 50 * filterMultiplier) },
        { name: 'Jun 11', profit: Math.max(0, 110 * filterMultiplier) },
        { name: 'Jun 14', profit: Math.max(0, 190 * filterMultiplier) },
        { name: 'Jun 17', profit: Math.max(0, 250 * filterMultiplier) },
        { name: 'Jun 20', profit: Math.max(0, 420 * filterMultiplier) },
        { name: 'Jun 23', profit: Math.max(0, 580 * filterMultiplier) },
        { name: 'Jun 26', profit: Math.max(0, 710 * filterMultiplier) },
        { name: 'Jun 29', profit: Math.max(0, 930 * filterMultiplier) },
        { name: 'Jul 2', profit: Math.max(0, 1150 * filterMultiplier) },
        { name: 'Jul 5', profit: Math.max(0, 1468.73 * filterMultiplier) }
      ];
    }
  }, [profitFilter, profitTimeframe]);

  // Totals calculations based on filter
  const stats = useMemo(() => {
    const mult = profitFilter === 'Bot' ? 0.82 : profitFilter === 'Manual' ? 0.18 : 1.0;
    return {
      total: 1468.73 * mult,
      today: 425.27 * mult,
      week: 726.32 * mult,
      closed: Math.floor(331 * mult),
      targetReached: Math.floor(283 * mult),
      capitalGuard: Math.floor(48 * mult),
      manualClosed: profitFilter === 'Bot' ? 0 : profitFilter === 'Manual' ? 14 : 14,
    };
  }, [profitFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">Earnings Dashboard</h2>
          <p className="text-sm text-slate-400">Track and analyze automated yields and manual LP rebalancing profits.</p>
        </div>

        {/* Profit Filters */}
        <div className="flex bg-[#111116] border border-[#1e1e26] rounded-xl p-1 text-xs">
          {(['All', 'Bot', 'Manual'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setProfitFilter(filter)}
              className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
                profitFilter === filter
                  ? 'bg-[#1a1a24] text-emerald-400 border border-[#2a2a38]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {filter} Positions
            </button>
          ))}
        </div>
      </div>

      {/* Main Profits green block (Image 1 style) */}
      <div className="bg-gradient-to-br from-emerald-600/10 via-emerald-700/5 to-transparent border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden">
        {/* Absolute decorative chart vector background */}
        <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-10 pointer-events-none flex items-end justify-end">
          <TrendingUp className="h-64 w-64 text-emerald-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex flex-col justify-center">
            <span className="text-[11px] text-emerald-400 uppercase font-bold tracking-wider">Net Total Profit</span>
            <span className="text-3xl font-extrabold tracking-tight mt-1 text-slate-100 font-mono">
              +${stats.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-emerald-500 font-bold mt-1 flex items-center gap-0.5">
              <ArrowUpRight className="h-3.5 w-3.5" />
              Over limit targets (+2.94%)
            </span>
          </div>

          <div className="flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-800/80 pt-4 md:pt-0 md:pl-6">
            <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Today</span>
            <span className="text-xl font-bold mt-1 text-emerald-400 font-mono">
              +${stats.today.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-800/80 pt-4 md:pt-0 md:pl-6">
            <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">This Week</span>
            <span className="text-xl font-bold mt-1 text-slate-200 font-mono">
              +${stats.week.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-800/80 pt-4 md:pt-0 md:pl-6">
            <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Closed Positions</span>
            <span className="text-xl font-bold mt-1 text-slate-200 font-mono">{stats.closed}</span>
          </div>
        </div>
      </div>

      {/* Target status row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="panel-dark p-4 bg-[#111116] border border-slate-800/50 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-500/10 p-2 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase">Reward Target Reached</h4>
              <p className="text-[10px] text-slate-500">Auto closed at specified profit triggers</p>
            </div>
          </div>
          <span className="text-base font-mono font-bold text-slate-200">{stats.targetReached}</span>
        </div>

        <div className="panel-dark p-4 bg-[#111116] border border-slate-800/50 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="bg-rose-500/10 p-2 rounded-lg">
              <TrendingUp className="h-4 w-4 text-rose-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase">Capital Guard Triggered</h4>
              <p className="text-[10px] text-slate-500">Auto defended standard downside slippage</p>
            </div>
          </div>
          <span className="text-base font-mono font-bold text-slate-200">{stats.capitalGuard}</span>
        </div>

        <div className="panel-dark p-4 bg-[#111116] border border-slate-800/50 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="bg-indigo-500/10 p-2 rounded-lg">
              <Calendar className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase">Manual Closed</h4>
              <p className="text-[10px] text-slate-500">Positions closed manually by wallet</p>
            </div>
          </div>
          <span className="text-base font-mono font-bold text-slate-200">{stats.manualClosed}</span>
        </div>
      </div>

      {/* Cumulative Profit Chart */}
      <div className="panel-dark space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Cumulative Profit Progress</h3>
          
          {/* Timeframe Toggles */}
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px] font-mono">
            {(['7D', '30D', '90D'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setProfitTimeframe(tf)}
                className={`px-2.5 py-1 rounded font-bold transition ${
                  profitTimeframe === tf
                    ? 'bg-[#1a1a24] text-emerald-400 border border-[#2a2a38]'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="profitGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#475569" fontSize={10} fontStyle="italic" />
              <YAxis stroke="#475569" fontSize={10} tickFormatter={(val) => `$${val}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#101014', borderColor: '#1d1d25', borderRadius: '12px' }}
                labelStyle={{ color: '#94a3b8', fontWeight: 'bold', fontSize: '11px' }}
                itemStyle={{ color: '#10b981', fontSize: '11px' }}
                formatter={(value: any) => [`$${parseFloat(value).toFixed(2)}`, 'Cumulative Profit']}
              />
              <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#profitGlow)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
