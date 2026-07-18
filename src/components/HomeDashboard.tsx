import React from 'react';
import { Wallet, Sparkles, TrendingUp, ChevronRight, Coins, ShoppingBag, Shield } from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { VaultPool } from '../types';

interface HomeDashboardProps {
  walletAddress: string;
  isConnected: boolean;
  isLiveMode: boolean;
  setIsLiveMode: (val: boolean) => void;
  usdcBalance: number;
  ethBalance: number;
  arbBalance: number;
  accruedRewards: number;
  currentTier: string;
  pools: VaultPool[];
  setActiveTab: (tab: any) => void;
  handleConnect: () => void;
  handleClaimRewards: () => void;
  triggerToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export default function HomeDashboard({
  walletAddress,
  isConnected,
  isLiveMode,
  setIsLiveMode,
  usdcBalance,
  ethBalance,
  arbBalance,
  accruedRewards,
  currentTier,
  pools,
  setActiveTab,
  handleConnect,
  handleClaimRewards,
  triggerToast
}: HomeDashboardProps) {
  
  // Pricing constants for portfolio valuation
  const ethPrice = 3000;
  const arbPrice = 1.0;
  
  // Calculate total portfolio values
  const userStakedSum = pools.reduce((acc, p) => acc + p.userDeposit, 0);
  const walletAssetsVal = usdcBalance + (ethBalance * ethPrice) + (arbBalance * arbPrice);
  const totalPortfolioValue = walletAssetsVal + userStakedSum;

  // Pie chart assets distribution
  const allocationData = [
    { name: 'USDC Wallet', value: usdcBalance, color: '#10b981' },
    { name: 'ETH Balance', value: ethBalance * ethPrice, color: '#6366f1' },
    { name: 'ARB Balance', value: arbBalance * arbPrice, color: '#ec4899' },
    { name: 'Active Staked LP', value: userStakedSum, color: '#f59e0b' }
  ].filter(item => item.value > 0);

  // Home mock cumulative chart
  const weeklyData = [
    { name: 'Mon', value: 250 },
    { name: 'Tue', value: 410 },
    { name: 'Wed', value: 380 },
    { name: 'Thu', value: 650 },
    { name: 'Fri', value: 780 },
    { name: 'Sat', value: 1120 },
    { name: 'Sun', value: totalPortfolioValue * 0.005 + 1200 }
  ];

  return (
    <div className="space-y-6">
      
      {/* Banner & Mode Switcher */}
      <div className="panel-dark bg-gradient-to-r from-[#101014] via-[#15151f] to-emerald-950/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-400 animate-pulse" />
            <h2 className="text-xl font-bold text-slate-100">AstraFi Portfolio Manager</h2>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Arbitrum Network Active
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Optimize and monitor multi-pool liquidity capital, autonomous grid bot earnings, and yield-farm allocations.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-3 bg-[#070709] border border-slate-800 p-1.5 rounded-xl">
          <button
            onClick={() => {
              setIsLiveMode(false);
              localStorage.setItem('astrafi_live_mode', 'false');
              triggerToast('Switched to simulated Sandbox execution.', 'info');
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              !isLiveMode
                ? 'bg-slate-900 text-slate-100 border border-slate-800'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Sandbox Mode
          </button>
          <button
            onClick={() => {
              setIsLiveMode(true);
              localStorage.setItem('astrafi_live_mode', 'true');
              triggerToast('Live Web3 MetaMask mode engaged!', 'success');
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              isLiveMode
                ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/25'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Live Web3 Mode
          </button>
        </div>
      </div>

      {/* Main Grid: Left balance columns & Right allocation charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns - Balances & Claim cards */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Wallet connection status widget */}
          <div className="panel-dark p-5 bg-[#101014] border border-[#1d1d25]">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Web3 Wallet Balance</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/60">
                    <Wallet className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Account Status</span>
                    <span className="text-xs font-mono text-slate-300">
                      {isConnected ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Disconnected'}
                    </span>
                  </div>
                </div>
                {!isConnected ? (
                  <button
                    onClick={handleConnect}
                    className="bg-emerald-600 hover:bg-emerald-700 text-black font-extrabold text-[10px] px-3 py-1.5 rounded-lg transition"
                  >
                    Connect
                  </button>
                ) : (
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full uppercase border border-emerald-500/20">
                    Connected
                  </span>
                )}
              </div>

              {/* Wallet Coins List */}
              <div className="space-y-3.5 pt-4 border-t border-slate-800/60 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">USDC Cash:</span>
                  <span className="text-slate-200 font-bold">${usdcBalance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">ETH Balance:</span>
                  <span className="text-slate-300">{ethBalance.toFixed(4)} ETH</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">ARB Balance:</span>
                  <span className="text-slate-300">{arbBalance} ARB</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-800/40 pt-3">
                  <span className="text-slate-500 font-sans font-semibold">Allocated Staking:</span>
                  <span className="text-amber-500 font-bold">${userStakedSum.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick claim reward card */}
          <div className="panel-dark bg-gradient-to-br from-[#101014] to-emerald-950/20 border border-emerald-500/15 p-5">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Unclaimed Yield Rewards</span>
                <div className="text-2xl font-mono font-black text-slate-100 mt-1.5">
                  ${accruedRewards.toFixed(4)}
                </div>
              </div>
              <div className="bg-emerald-500/10 p-2 rounded-xl">
                <Sparkles className="h-4 w-4 text-emerald-400 animate-spin" />
              </div>
            </div>
            
            <button
              onClick={handleClaimRewards}
              disabled={accruedRewards <= 0}
              className="w-full mt-5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-800 disabled:text-slate-500 text-black font-extrabold text-xs py-2.5 px-3 rounded-xl transition duration-150 flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/10"
            >
              Claim Rewards Assets
            </button>
          </div>

          {/* Subscription status card */}
          <div className="panel-dark p-4 bg-[#111116] border border-slate-800/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-indigo-400" />
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block">License Tier</span>
                <span className="text-slate-300 font-bold font-sans">{currentTier}</span>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('STORE')}
              className="text-emerald-400 hover:text-emerald-500 font-bold text-[11px] transition flex items-center gap-0.5"
            >
              Upgrade
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>

        {/* Right Columns - Visual allocation charts (Area and Pie Charts) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Portfolio balance summary */}
          <div className="panel-dark">
            <div className="flex justify-between items-baseline">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Active Net Worth</span>
                <div className="text-2xl font-mono font-extrabold text-slate-100 mt-1">
                  ${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <span className="text-emerald-400 text-xs font-mono font-semibold flex items-center gap-0.5">
                <TrendingUp className="h-3.5 w-3.5" />
                +2.94%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-slate-800/60">
              
              {/* Asset Allocation Chart (Pie) */}
              <div className="md:col-span-1 flex flex-col justify-center items-center">
                <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2 self-start">Portfolio Shares</h4>
                <div className="h-32 w-32 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocationData}
                        innerRadius={28}
                        outerRadius={45}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {allocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Central balance value */}
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-[10px] font-mono font-bold text-slate-200">${totalPortfolioValue > 1000 ? `${(totalPortfolioValue/1000).toFixed(0)}k` : totalPortfolioValue.toFixed(0)}</span>
                  </div>
                </div>
                {/* Labels legend */}
                <div className="flex flex-wrap gap-x-2 gap-y-1 justify-center mt-3 text-[9px] font-sans text-slate-400">
                  {allocationData.map((d, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span>{d.name.replace(' Balance', '').replace(' Wallet', '')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Growth Chart (Area) */}
              <div className="md:col-span-2 flex flex-col justify-between">
                <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">Net Worth Growth</h4>
                <div className="h-40 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="netWorthGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#475569" fontSize={8} />
                      <YAxis stroke="#475569" fontSize={8} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#101014', borderColor: '#1d1d25', borderRadius: '8px', fontSize: '10px' }}
                        itemStyle={{ color: '#10b981' }}
                        formatter={(val: any) => [`$${parseFloat(val).toFixed(2)}`, 'Asset Value']}
                      />
                      <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#netWorthGlow)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>

          {/* Quick Shortcuts Links Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => setActiveTab('POSITIONS')}
              className="panel-dark p-4 bg-[#111116] border border-slate-800/40 hover:border-emerald-500/20 text-left space-y-1.5 transition group"
            >
              <div className="bg-emerald-500/10 w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <Coins className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Deploy Manual LP</h4>
                <p className="text-[10px] text-slate-500">Deploy concentrated liquidity pools manually.</p>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('BOT')}
              className="panel-dark p-4 bg-[#111116] border border-slate-800/40 hover:border-emerald-500/20 text-left space-y-1.5 transition group"
            >
              <div className="bg-indigo-500/10 w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <TrendingUp className="h-4 w-4 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Configure Grid Bot</h4>
                <p className="text-[10px] text-slate-500">Activate automated arbitrage cycle scans.</p>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('AI_COPILOT')}
              className="panel-dark p-4 bg-[#111116] border border-slate-800/40 hover:border-emerald-500/20 text-left space-y-1.5 transition group"
            >
              <div className="bg-pink-500/10 w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <Sparkles className="h-4 w-4 text-pink-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Consult AI advisor</h4>
                <p className="text-[10px] text-slate-500">Tailor yield allocation strategies via Gemini.</p>
              </div>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
