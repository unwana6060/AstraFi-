import React, { useState } from 'react';
import { 
  Search, Compass, Award, Users, Plus, Copy, Check, ExternalLink, 
  ChevronRight, Info, Sliders, Settings, Flame, TrendingUp, Zap, Sparkles, X, ArrowUpRight 
} from 'lucide-react';
import { DISCOVER_POOLS } from '../data';
import { DiscoverPoolItem, PositionItem } from '../types';

interface DiscoverTabProps {
  onAddLp: (pool: DiscoverPoolItem) => void;
  usdcBalance?: number;
  setUsdcBalance?: React.Dispatch<React.SetStateAction<number>>;
  positions?: PositionItem[];
  setPositions?: React.Dispatch<React.SetStateAction<PositionItem[]>>;
  triggerToast?: (msg: string, type?: 'success' | 'info' | 'warning') => void;
  setActiveTab?: (tab: any) => void;
}

interface AstraLPer {
  rank: number;
  name: string;
  address: string;
  tokens: string[];
  winRate: number;
  totalProfit: string;
  feesEarned: string;
  totalPositions: number;
  avgInvested: string;
  avgAge: string;
  monthlyIncome: string;
  history: { period: string; positions: number; profit: string }[];
  firstActivity: string;
  lastActivity: string;
}

interface AstraDegen {
  rank: number;
  name: string;
  handle: string;
  address: string;
  winRate: number;
  trades: string;
  avgHold: string;
  lastTrade: string;
  followers: string;
  netProfit: string;
  roi: string;
  tags: string[];
}

export default function DiscoverTab({ 
  onAddLp, 
  usdcBalance = 45000, 
  setUsdcBalance, 
  positions = [], 
  setPositions, 
  triggerToast = () => {}, 
  setActiveTab 
}: DiscoverTabProps) {
  const [activeSub, setActiveSub] = useState<'POOLS' | 'TOP_LPERS' | 'TOP_DEGENS'>('POOLS');
  
  // Pools tab states
  const [poolType, setPoolType] = useState<'M_POOLS' | 'D_POOLS' | 'ESTABLISHED'>('M_POOLS');
  const [searchQuery, setSearchQuery] = useState('');
  const [resolution, setResolution] = useState<'5m' | '1h' | '24h'>('1h');
  const [poolsSortBy, setPoolsSortBy] = useState<'SCORE' | 'TVL' | 'VOL' | 'FEES' | 'NONE'>('NONE');

  // Top LPers tab states
  const [lperSortMetric, setLperSortMetric] = useState<'WIN_RATE' | 'TOTAL_PROFIT' | 'FEES_EARNED' | 'AVG_INVESTED' | 'MONTHLY_INCOME'>('WIN_RATE');
  const [copiedAddressId, setCopiedAddressId] = useState<string | null>(null);

  // Top Degens tab states
  const [degenSortMetric, setDegenSortMetric] = useState<'PnL' | 'Return' | 'WinRate' | 'Trades' | 'Followers'>('PnL');
  const [degenTimeframe, setDegenTimeframe] = useState<'7D' | '30D' | 'All'>('7D');

  // Review & Deployment Modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewType, setReviewType] = useState<'LP_COPY' | 'DEGEN_MIRROR'>('LP_COPY');
  const [reviewTargetName, setReviewTargetName] = useState('');
  const [reviewPair, setReviewPair] = useState('SOL / USDC');
  const [reviewStrategy, setReviewStrategy] = useState<'Curve' | 'Grid' | 'Two-sided'>('Curve');
  const [reviewBins, setReviewBins] = useState(69);
  const [reviewSlippage, setReviewSlippage] = useState('1.0%');
  const [reviewAmt, setReviewAmt] = useState('15');
  const [reviewTargetProfit, setReviewTargetProfit] = useState('5.0');

  // Mock static list of Top LP whales (Astra original data structure)
  const astraLPers: AstraLPer[] = [
    {
      rank: 1,
      name: 'GigaWhale LP-01',
      address: '0x8fa1548e65bd2a411440',
      tokens: ['SOL', 'USDC', 'PEPE', 'ETH'],
      winRate: 100.00,
      totalProfit: '$142,500',
      feesEarned: '$45,300',
      totalPositions: 12,
      avgInvested: '$24,500',
      avgAge: '1.4h',
      monthlyIncome: '$12,400',
      history: [
        { period: '7D', positions: 3, profit: '+$14,200' },
        { period: '30D', positions: 8, profit: '+$45,800' },
        { period: 'ALL', positions: 12, profit: '+$142,500' }
      ],
      firstActivity: '04/04/2026',
      lastActivity: '3 mins ago'
    },
    {
      rank: 2,
      name: 'Alpha Arbitrageur',
      address: '0x3F2bA723f993d0AcA32A',
      tokens: ['WIF', 'SOL', 'USDT', 'USDC'],
      winRate: 96.80,
      totalProfit: '$96,800',
      feesEarned: '$32,100',
      totalPositions: 8,
      avgInvested: '$15,200',
      avgAge: '2.1h',
      monthlyIncome: '$8,200',
      history: [
        { period: '7D', positions: 2, profit: '+$9,800' },
        { period: '30D', positions: 5, profit: '+$31,400' },
        { period: 'ALL', positions: 8, profit: '+$96,800' }
      ],
      firstActivity: '04/10/2026',
      lastActivity: '12 mins ago'
    },
    {
      rank: 3,
      name: 'Hyper liquidity-V3',
      address: '0x5f9e2a1cbd8912aa4401',
      tokens: ['ARB', 'USDC', 'ETH', 'WBTC'],
      winRate: 92.40,
      totalProfit: '$72,400',
      feesEarned: '$18,500',
      totalPositions: 14,
      avgInvested: '$10,000',
      avgAge: '0.9h',
      monthlyIncome: '$6,100',
      history: [
        { period: '7D', positions: 4, profit: '+$7,500' },
        { period: '30D', positions: 9, profit: '+$24,800' },
        { period: 'ALL', positions: 14, profit: '+$72,400' }
      ],
      firstActivity: '03/15/2026',
      lastActivity: '1 hour ago'
    },
    {
      rank: 4,
      name: 'ConcentratedWhale',
      address: '0x7d21bc548902fa48e1a5',
      tokens: ['BONK', 'SOL', 'USDC'],
      winRate: 91.00,
      totalProfit: '$55,200',
      feesEarned: '$14,200',
      totalPositions: 6,
      avgInvested: '$8,500',
      avgAge: '3.2h',
      monthlyIncome: '$4,800',
      history: [
        { period: '7D', positions: 1, profit: '+$6,200' },
        { period: '30D', positions: 3, profit: '+$18,400' },
        { period: 'ALL', positions: 6, profit: '+$55,200' }
      ],
      firstActivity: '05/01/2026',
      lastActivity: '4 hours ago'
    }
  ];

  // Mock static list of Top spot Degens (Astra original data structure)
  const astraDegens: AstraDegen[] = [
    {
      rank: 1,
      name: 'Cupseyy Spot',
      handle: '@Cupseyy',
      address: '0x2fg5b76c8d9ea321044e',
      winRate: 100.00,
      trades: '4.7K',
      avgHold: '6.3h',
      lastTrade: '4 mins ago',
      followers: '25.7K',
      netProfit: '+$1,270,000',
      roi: '+239% return',
      tags: ['gmgn', 'wash_trader', 'koi', 'axiom']
    },
    {
      rank: 2,
      name: 'Cented Alpha',
      handle: '@Cented7',
      address: '0x9d4a8bc5421eb5c2049d',
      winRate: 85.40,
      trades: '3.1K',
      avgHold: '12.4h',
      lastTrade: '12 mins ago',
      followers: '18.2K',
      netProfit: '+$806,000',
      roi: '+191% return',
      tags: ['alpha', 'whale', 'pump_fun']
    },
    {
      rank: 3,
      name: 'Gh0stee Router',
      handle: '@gh0stee',
      address: '0x4f12ec9db54812a44d81',
      winRate: 78.20,
      trades: '8.5K',
      avgHold: '2.1h',
      lastTrade: '1 hour ago',
      followers: '32.4K',
      netProfit: '+$524,000',
      roi: '+115% return',
      tags: ['speed_runner', 'high_slippage', 'jito']
    },
    {
      rank: 4,
      name: 'Ansem Whitelist',
      handle: '@AnsemWhale',
      address: '0x6b1ca4219c8d5ea2f04e',
      winRate: 72.00,
      trades: '12.4K',
      avgHold: '1.1h',
      lastTrade: '2 hours ago',
      followers: '45.1K',
      netProfit: '+$412,000',
      roi: '+88% return',
      tags: ['meme_god', 'whale', 'hype']
    }
  ];

  // Copy address to clipboard simulation
  const handleCopyAddress = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddressId(id);
    triggerToast('Wallet address copied to clipboard', 'success');
    setTimeout(() => setCopiedAddressId(null), 2000);
  };

  // Open the review & deploy popover dialog
  const openReviewModal = (type: 'LP_COPY' | 'DEGEN_MIRROR', targetName: string, pairName: string) => {
    setReviewType(type);
    setReviewTargetName(targetName);
    setReviewPair(pairName);
    setReviewBins(69);
    setReviewStrategy(type === 'LP_COPY' ? 'Two-sided' : 'Curve');
    setReviewAmt('15');
    setShowReviewModal(true);
  };

  // Execute actual position creation (connecting with positions global state!)
  const executePositionDeployment = () => {
    const amt = parseFloat(reviewAmt);
    if (isNaN(amt) || amt <= 0) {
      triggerToast('Please enter a valid investment capital size', 'warning');
      return;
    }
    if (amt > usdcBalance) {
      triggerToast('Insufficient USDC wallet balance to deploy', 'warning');
      return;
    }

    if (setUsdcBalance) {
      setUsdcBalance(prev => prev - amt);
    }

    if (setPositions) {
      const isLP = reviewType === 'LP_COPY';
      const strategyMapped = reviewStrategy === 'Two-sided' ? 'Two-sided' : 
                             reviewStrategy === 'Curve' ? 'Quote only' : 'Base only';
      
      const newPos: PositionItem = {
        id: `pos-discovered-${Date.now()}`,
        name: isLP ? `${reviewPair} LP` : `MIRROR ${reviewTargetName.toUpperCase()}`,
        status: 'In Range',
        currentValue: amt,
        investedAmount: amt,
        pnlDollar: 0,
        pnlPercent: 0,
        type: isLP ? 'Bot' : 'Manual',
        depositStrategy: strategyMapped,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
      };

      setPositions(prev => [newPos, ...prev]);
    }

    setShowReviewModal(false);
    triggerToast(`DeFi Strategy successfully deployed! Assigned $${amt} USDC.`, 'success');
    
    if (setActiveTab) {
      setActiveTab('POSITIONS');
    }
  };

  // Handle pool filtering and sorting
  const filteredPools = DISCOVER_POOLS.filter((pool) => {
    const matchesSearch = pool.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (poolType === 'ESTABLISHED') {
      return pool.status === 'Active' && parseFloat(pool.tvl.replace('$', '').replace('M', '')) > 2.0;
    } else if (poolType === 'D_POOLS') {
      return pool.status === 'Low Liq';
    } else { // M_POOLS default - all
      return true;
    }
  });

  const sortedPools = [...filteredPools].sort((a, b) => {
    if (poolsSortBy === 'SCORE') return b.score - a.score;
    if (poolsSortBy === 'TVL') {
      const getVal = (v: string) => parseFloat(v.replace('$', '').replace('M', '').replace('k', '')) * (v.includes('M') ? 1000 : 1);
      return getVal(b.tvl) - getVal(a.tvl);
    }
    if (poolsSortBy === 'VOL') {
      const getVal = (v: string) => parseFloat(v.replace('$', '').replace('M', '').replace('k', '')) * (v.includes('M') ? 1000 : 1);
      return getVal(b.vol1h) - getVal(a.vol1h);
    }
    if (poolsSortBy === 'FEES') {
      const getVal = (v: string) => {
        if (v === '-' || v === '$0') return 0;
        return parseFloat(v.replace('$', '').replace('M', '').replace('k', '')) * (v.includes('M') ? 1000 : v.includes('k') ? 1 : 0.001);
      };
      return getVal(b.fees1h) - getVal(a.fees1h);
    }
    return 0; // NONE
  });

  // Sort LPers dynamically
  const sortedLPers = [...astraLPers].sort((a, b) => {
    if (lperSortMetric === 'WIN_RATE') return b.winRate - a.winRate;
    if (lperSortMetric === 'TOTAL_PROFIT') {
      const getVal = (v: string) => parseFloat(v.replace('$', '').replace(',', ''));
      return getVal(b.totalProfit) - getVal(a.totalProfit);
    }
    if (lperSortMetric === 'FEES_EARNED') {
      const getVal = (v: string) => parseFloat(v.replace('$', '').replace(',', ''));
      return getVal(b.feesEarned) - getVal(a.feesEarned);
    }
    if (lperSortMetric === 'AVG_INVESTED') {
      const getVal = (v: string) => parseFloat(v.replace('$', '').replace(',', ''));
      return getVal(b.avgInvested) - getVal(a.avgInvested);
    }
    if (lperSortMetric === 'MONTHLY_INCOME') {
      const getVal = (v: string) => parseFloat(v.replace('$', '').replace(',', ''));
      return getVal(b.monthlyIncome) - getVal(a.monthlyIncome);
    }
    return 0;
  });

  // Sort Degens dynamically
  const sortedDegens = [...astraDegens].sort((a, b) => {
    if (degenSortMetric === 'PnL') {
      const getVal = (v: string) => parseFloat(v.replace('$', '').replace('+', '').replace('-', '').replace(',', ''));
      return getVal(b.netProfit) - getVal(a.netProfit);
    }
    if (degenSortMetric === 'Return') {
      const getVal = (v: string) => parseFloat(v.replace('% return', '').replace('+', ''));
      return getVal(b.roi) - getVal(a.roi);
    }
    if (degenSortMetric === 'WinRate') return b.winRate - a.winRate;
    if (degenSortMetric === 'Trades') return parseFloat(b.trades) - parseFloat(a.trades);
    if (degenSortMetric === 'Followers') return parseFloat(b.followers) - parseFloat(a.followers);
    return 0;
  });

  return (
    <div className="space-y-6">
      
      {/* Header and top navigation layout (Image 3 style) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">Discover ecosystem whales</h2>
          <p className="text-sm text-slate-400">Discover and replicate high-performance on-chain strategies in real time.</p>
        </div>

        {/* Master sub tabs */}
        <div className="flex bg-[#111116] border border-[#1e1e26] rounded-xl p-1 text-xs">
          <button
            onClick={() => setActiveSub('POOLS')}
            className={`flex items-center gap-1.5 px-3.5 py-2 font-bold rounded-lg transition-all ${
              activeSub === 'POOLS'
                ? 'bg-[#1a1a24] text-emerald-400 border border-[#2a2a38]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            Pools
          </button>
          <button
            onClick={() => setActiveSub('TOP_LPERS')}
            className={`flex items-center gap-1.5 px-3.5 py-2 font-bold rounded-lg transition-all ${
              activeSub === 'TOP_LPERS'
                ? 'bg-[#1a1a24] text-emerald-400 border border-[#2a2a38]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            Top LPers
          </button>
          <button
            onClick={() => setActiveSub('TOP_DEGENS')}
            className={`flex items-center gap-1.5 px-3.5 py-2 font-bold rounded-lg transition-all ${
              activeSub === 'TOP_DEGENS'
                ? 'bg-[#1a1a24] text-emerald-400 border border-[#2a2a38]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            Top Degens
          </button>
        </div>
      </div>

      {/* ==================================== POOLS TAB ==================================== */}
      {activeSub === 'POOLS' && (
        <div className="space-y-4">
          
          {/* Slogan and count */}
          <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
            <span>6,289 Active Liquidity Pools Identified</span>
            <span className="bg-[#101014] px-2 py-1 rounded border border-slate-800">Arbitrum L2 Mainnet Fork</span>
          </div>

          {/* Subtabs, resolutions, and search bar */}
          <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 pt-1">
            
            {/* Left part: horizontal categorizations */}
            <div className="flex bg-[#111116] border border-[#1e1e26] rounded-xl p-0.5 text-[11px] self-start">
              {[
                { type: 'M_POOLS', label: 'All Pools' },
                { type: 'ESTABLISHED', label: 'Established Pools' },
                { type: 'D_POOLS', label: 'Low Liquidity' }
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => setPoolType(item.type as any)}
                  className={`px-3 py-1 font-bold rounded-lg transition-all ${
                    poolType === item.type
                      ? 'bg-[#1a1a24] text-emerald-400 border border-[#2a2a38]'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Right part: resolution toggle & search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 lg:max-w-2xl justify-end">
              
              {/* Resolution select slider */}
              <div className="flex bg-[#111116] border border-[#1e1e26] rounded-xl p-0.5 text-[11px] self-start sm:self-auto">
                {(['5m', '1h', '24h'] as const).map((res) => (
                  <button
                    key={res}
                    onClick={() => setResolution(res)}
                    className={`px-3 py-1 font-bold rounded-lg transition-all ${
                      resolution === res
                        ? 'bg-[#1a1a24] text-emerald-400 border border-[#2a2a38]'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {res}
                  </button>
                ))}
              </div>

              {/* Dynamic search input field */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search pools - BONK, SOL/USDC, or paste an address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#101014] border border-[#1d1d25] rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>
          </div>

          {/* Quick interactive filter chips for table sorting (Screen 3 style) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px]">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px] mr-1">Sort filters:</span>
            {[
              { id: 'NONE', label: 'Default' },
              { id: 'SCORE', label: '🔥 High Astra Score' },
              { id: 'TVL', label: '💎 Top TVL' },
              { id: 'VOL', label: '📊 High Volume' },
              { id: 'FEES', label: '💸 Top Fee Generating' }
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => setPoolsSortBy(chip.id as any)}
                className={`px-3 py-1.5 rounded-lg border font-bold transition-all whitespace-nowrap ${
                  poolsSortBy === chip.id
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-[#101014] border-[#1d1d25] text-slate-400 hover:text-slate-200'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Pools Table (Image 3 style: high contrast, custom metrics columns) */}
          <div className="bg-[#101014] border border-[#1d1d25] rounded-xl overflow-hidden overflow-x-auto shadow-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1d1d25] bg-[#14141c] text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                  <th className="p-4">Pool Pair Name</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Astra Score</th>
                  <th className="p-4">TVL</th>
                  <th className="p-4">Volume ({resolution})</th>
                  <th className="p-4">Fees ({resolution})</th>
                  <th className="p-4">V/T Ratio</th>
                  <th className="p-4 text-right">Liquidity Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/20">
                {sortedPools.map((pool, idx) => {
                  // Calculate dynamic V/T ratio
                  const tvlNum = parseFloat(pool.tvl.replace('$', '').replace('M', '').replace('k', ''));
                  const volNum = parseFloat(pool.vol1h.replace('$', '').replace('M', '').replace('k', ''));
                  let vtRatio = '0.00';
                  if (!isNaN(tvlNum) && !isNaN(volNum) && tvlNum > 0) {
                    vtRatio = (volNum / tvlNum).toFixed(2);
                  }

                  return (
                    <tr key={idx} className="hover:bg-slate-950/40 transition-colors">
                      <td className="p-4 font-bold text-slate-200">
                        <div className="flex items-center gap-2">
                          <div className="bg-slate-900 border border-slate-800 rounded-full h-5 w-5 flex items-center justify-center font-mono font-bold text-[9px] text-emerald-400 shadow-sm">
                            {pool.name.charAt(0)}
                          </div>
                          <span>{pool.name}</span>
                          <span className={`text-[8px] px-1.5 py-0.2 rounded font-mono font-bold uppercase border ${
                            pool.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            pool.status === 'Low Liq' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-slate-850 text-slate-500 border-transparent'
                          }`}>
                            {pool.status}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-slate-400">{pool.price}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-mono font-bold text-xs ${pool.score > 35 ? 'text-emerald-400' : 'text-slate-400'}`}>
                            {pool.score > 0 ? pool.score : '-'}
                          </span>
                          <div className="w-12 bg-slate-900 rounded-full h-1 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${pool.score > 35 ? 'bg-emerald-500' : 'bg-slate-700'}`} 
                              style={{ width: `${pool.score > 0 ? pool.score : 0}%` }} 
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-slate-300">{pool.tvl}</td>
                      <td className="p-4 font-mono text-slate-400">{pool.vol1h}</td>
                      <td className="p-4 font-mono text-slate-400">{pool.fees1h}</td>
                      <td className="p-4 font-mono text-slate-500 font-semibold">{vtRatio}</td>
                      <td className="p-4 text-right">
                        {pool.hasLp ? (
                          <button
                            onClick={() => openReviewModal('LP_COPY', 'Ecosystem Pool', pool.name)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-black font-extrabold text-[11px] px-3.5 py-2 rounded-lg transition-all shadow-md shadow-emerald-600/5"
                          >
                            + Replicate LP
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-600 font-bold uppercase pr-3 select-none">No LP Active</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================== TOP LPERS TAB ==================================== */}
      {activeSub === 'TOP_LPERS' && (
        <div className="space-y-4">
          
          {/* Header slogan & count bar (Image 1 style) */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-slate-500">
            <span>3,848 Top Active LPers Identified</span>
            <span className="text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-900 leading-none">
              Last rebalancing sync cycle: <strong>Block @219,431,044</strong>
            </span>
          </div>

          {/* Metric Sort Toggles (Image 1 top scroll) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px]">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px] mr-1">Sort Metrics:</span>
            {[
              { id: 'WIN_RATE', label: 'Win Rate' },
              { id: 'TOTAL_PROFIT', label: 'Total Profit' },
              { id: 'FEES_EARNED', label: 'Fees Earned' },
              { id: 'AVG_INVESTED', label: 'Avg Invested' },
              { id: 'MONTHLY_INCOME', label: 'Monthly Income' }
            ].map((metric) => (
              <button
                key={metric.id}
                onClick={() => setLperSortMetric(metric.id as any)}
                className={`px-3 py-1.5 rounded-lg border font-bold transition-all whitespace-nowrap ${
                  lperSortMetric === metric.id
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-[#101014] border-[#1d1d25] text-slate-400 hover:text-slate-200'
                }`}
              >
                {metric.label}
              </button>
            ))}
          </div>

          {/* LP Cards Grid (Image 1 style: sparklines, metrics grid, history table) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedLPers.map((lper) => (
              <div 
                key={lper.rank} 
                className="panel-dark flex flex-col justify-between bg-[#101014] border border-[#1d1d25] hover:border-slate-800/80 transition-all p-5"
              >
                
                {/* Upper block with rank, copyable address, tokens */}
                <div className="flex justify-between items-start border-b border-slate-800/50 pb-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-emerald-600/10 text-emerald-400 font-extrabold px-2 py-0.5 rounded border border-emerald-500/20">
                        #{lper.rank} LPer
                      </span>
                      <h3 className="font-bold text-slate-100 text-sm">{lper.name}</h3>
                    </div>

                    {/* Copyable address widget */}
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1 font-mono">
                      <span>{lper.address.slice(0, 8)}...{lper.address.slice(-6)}</span>
                      <button 
                        onClick={() => handleCopyAddress(`lper-${lper.rank}`, lper.address)}
                        className="text-slate-600 hover:text-slate-300 p-0.5 rounded transition"
                      >
                        {copiedAddressId === `lper-${lper.rank}` ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                      <a href="#" className="text-slate-600 hover:text-slate-300 p-0.5 rounded">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  {/* Token asset circles */}
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {lper.tokens.map((tok, i) => (
                      <div 
                        key={i} 
                        className="h-5.5 w-5.5 rounded-full bg-slate-900 border border-slate-800 text-[8px] font-bold flex items-center justify-center text-slate-300 font-mono shadow"
                        title={tok}
                      >
                        {tok.slice(0, 2)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Performance stats upper block: large winrate and SVG sparkline */}
                <div className="flex justify-between items-center bg-slate-950/40 border border-slate-800/50 rounded-xl p-3 mb-4">
                  <div>
                    <span className="text-[9px] uppercase text-slate-500 font-bold tracking-wider">Win Rate Index</span>
                    <div className="text-xl font-mono font-extrabold text-emerald-400 mt-0.5">
                      {lper.winRate.toFixed(2)}%
                    </div>
                  </div>

                  {/* Beautiful customized green SVG sparkline */}
                  <div className="flex flex-col items-end">
                    <svg className="w-24 h-8 text-emerald-400" viewBox="0 0 100 30" fill="none">
                      <path
                        d={lper.rank === 1 ? "M0,25 Q15,15 30,22 T60,5 T90,12 T100,2" : 
                           lper.rank === 2 ? "M0,28 Q15,20 30,25 T60,8 T90,15 T100,4" :
                           lper.rank === 3 ? "M0,22 Q15,18 30,12 T60,18 T90,5 T100,6" :
                                             "M0,25 Q15,10 30,18 T60,22 T90,10 T100,8"}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d={lper.rank === 1 ? "M0,25 Q15,15 30,22 T60,5 T90,12 T100,2 L100,30 L0,30 Z" : 
                           lper.rank === 2 ? "M0,28 Q15,20 30,25 T60,8 T90,15 T100,4 L100,30 L0,30 Z" :
                           lper.rank === 3 ? "M0,22 Q15,18 30,12 T60,18 T90,5 T100,6 L100,30 L0,30 Z" :
                                             "M0,25 Q15,10 30,18 T60,22 T90,10 T100,8 L100,30 L0,30 Z"}
                        fill="url(#grad)"
                        opacity="0.1"
                      />
                      <defs>
                        <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="currentColor" />
                          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="text-[8px] font-mono text-slate-500 mt-1">Compound trajectory</span>
                  </div>
                </div>

                {/* Metrics detail grid */}
                <div className="grid grid-cols-3 gap-2 text-xs font-mono mb-4">
                  <div className="bg-slate-950/20 border border-slate-900 p-2 rounded-lg">
                    <span className="text-[9px] uppercase text-slate-500 font-bold block font-sans">Profit</span>
                    <span className="font-extrabold text-slate-200">{lper.totalProfit}</span>
                  </div>
                  <div className="bg-slate-950/20 border border-slate-900 p-2 rounded-lg">
                    <span className="text-[9px] uppercase text-slate-500 font-bold block font-sans">Fees Earned</span>
                    <span className="font-extrabold text-emerald-400">{lper.feesEarned}</span>
                  </div>
                  <div className="bg-slate-950/20 border border-slate-900 p-2 rounded-lg">
                    <span className="text-[9px] uppercase text-slate-500 font-bold block font-sans">Avg Invested</span>
                    <span className="font-extrabold text-slate-300">{lper.avgInvested}</span>
                  </div>
                  <div className="bg-slate-950/20 border border-slate-900 p-2 rounded-lg">
                    <span className="text-[9px] uppercase text-slate-500 font-bold block font-sans">Total Pools</span>
                    <span className="font-extrabold text-slate-300">{lper.totalPositions} Pairs</span>
                  </div>
                  <div className="bg-slate-950/20 border border-slate-900 p-2 rounded-lg">
                    <span className="text-[9px] uppercase text-slate-500 font-bold block font-sans">Avg Age</span>
                    <span className="font-extrabold text-slate-400">{lper.avgAge}</span>
                  </div>
                  <div className="bg-slate-950/20 border border-slate-900 p-2 rounded-lg">
                    <span className="text-[9px] uppercase text-slate-500 font-bold block font-sans">Est. Monthly</span>
                    <span className="font-extrabold text-emerald-400">{lper.monthlyIncome}</span>
                  </div>
                </div>

                {/* Miniature History Table within Card (Image 1 style) */}
                <div className="bg-slate-950 border border-slate-900 rounded-xl overflow-hidden mb-4">
                  <table className="w-full text-left text-[10px] font-mono">
                    <thead>
                      <tr className="bg-[#14141c] text-slate-500 font-bold border-b border-slate-900">
                        <th className="p-2 font-sans">Timeframe</th>
                        <th className="p-2 text-center font-sans">Total Positions</th>
                        <th className="p-2 text-right font-sans">Cumulative Profit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/60 text-slate-300">
                      {lper.history.map((hist, hIdx) => (
                        <tr key={hIdx} className="hover:bg-slate-900/40">
                          <td className="p-2 font-bold">{hist.period}</td>
                          <td className="p-2 text-center">{hist.positions} Pools</td>
                          <td className="p-2 text-right font-bold text-emerald-400">{hist.profit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer and interactive copy buttons */}
                <div className="flex items-center justify-between border-t border-slate-800/40 pt-3 mt-1">
                  <div className="text-[9px] text-slate-500 font-medium">
                    <div>First deployment: {lper.firstActivity}</div>
                    <div className="mt-0.5">Last Sync: {lper.lastActivity}</div>
                  </div>

                  <button
                    onClick={() => openReviewModal('LP_COPY', lper.name, `${lper.tokens[0]} / ${lper.tokens[1]}`)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-black font-extrabold text-xs px-4 py-2 rounded-xl transition shadow-lg shadow-emerald-600/5 flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Copy LP Strategy
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* ==================================== TOP DEGENS TAB ==================================== */}
      {activeSub === 'TOP_DEGENS' && (
        <div className="space-y-4">
          
          {/* Slogan and descriptive stats (Image 4/5 style) */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-slate-500">
            <span>Discover - Profitable spot traders to mirror in real time.</span>
            
            {/* Timeframe picker */}
            <div className="flex bg-[#111116] border border-[#1e1e26] rounded-xl p-0.5 text-[10px]">
              {(['7D', '30D', 'All'] as const).map((tFrame) => (
                <button
                  key={tFrame}
                  onClick={() => setDegenTimeframe(tFrame)}
                  className={`px-2.5 py-0.5 font-bold rounded-lg transition-all ${
                    degenTimeframe === tFrame
                      ? 'bg-[#1a1a24] text-emerald-400 border border-[#2a2a38]'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {tFrame}
                </button>
              ))}
            </div>
          </div>

          {/* Degen sorting chips scroll bar (Image 4 style) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px]">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px] mr-1">Rank sorting:</span>
            {[
              { id: 'PnL', label: 'Net PnL Profit' },
              { id: 'Return', label: 'Return ROI %' },
              { id: 'WinRate', label: 'Win Rate' },
              { id: 'Trades', label: 'Trades Count' },
              { id: 'Followers', label: 'Followers' }
            ].map((metric) => (
              <button
                key={metric.id}
                onClick={() => setDegenSortMetric(metric.id as any)}
                className={`px-3 py-1.5 rounded-lg border font-bold transition-all whitespace-nowrap ${
                  degenSortMetric === metric.id
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-[#101014] border-[#1d1d25] text-slate-400 hover:text-slate-200'
                }`}
              >
                {metric.label}
              </button>
            ))}
          </div>

          {/* Degens Cards Layout (Image 4/5 layout style) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedDegens.map((degen) => (
              <div 
                key={degen.rank} 
                className="panel-dark flex flex-col justify-between bg-[#101014] border border-[#1d1d25] hover:border-slate-800/80 transition-all p-5"
              >
                <div>
                  
                  {/* Top: Rank, Avatar, Handle details */}
                  <div className="flex justify-between items-start border-b border-slate-800/50 pb-3 mb-4">
                    <div className="flex items-center gap-3">
                      
                      {/* Avatar with customized gradient ring */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-indigo-500 rounded-full animate-spin opacity-40 blur-xs" />
                        <div className="relative h-10 w-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-slate-200">
                          {degen.name.charAt(0)}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-slate-950 text-indigo-400 font-mono px-1.5 py-0.2 rounded border border-indigo-500/10">
                            #{degen.rank} Degen
                          </span>
                          <span className="text-xs text-slate-400 font-bold font-mono">{degen.handle}</span>
                        </div>
                        <h4 className="font-bold text-slate-100 text-sm mt-0.5">{degen.name}</h4>
                      </div>
                    </div>

                    {/* Copyable address widget */}
                    <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-mono">
                      <span>{degen.address.slice(0, 6)}...{degen.address.slice(-4)}</span>
                      <button 
                        onClick={() => handleCopyAddress(`degen-${degen.rank}`, degen.address)}
                        className="text-slate-600 hover:text-slate-300 p-0.5 rounded transition"
                      >
                        {copiedAddressId === `degen-${degen.rank}` ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Profit metrics box */}
                  <div className="grid grid-cols-2 gap-4 bg-slate-950/50 border border-slate-850 p-3.5 rounded-xl text-center mb-4">
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold uppercase block">Net Profit</span>
                      <span className="text-lg font-mono font-extrabold text-emerald-400 block mt-0.5">
                        {degen.netProfit}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold uppercase block">Return ROI ({degenTimeframe})</span>
                      <span className="text-lg font-mono font-extrabold text-emerald-400 block mt-0.5">
                        {degen.roi}
                      </span>
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono mb-4 text-slate-300">
                    <div className="bg-slate-950/20 border border-slate-900/60 p-2 rounded-lg">
                      <span className="text-[9px] uppercase text-slate-500 font-bold block font-sans">Trades</span>
                      <span className="font-extrabold">{degen.trades}</span>
                    </div>
                    <div className="bg-slate-950/20 border border-slate-900/60 p-2 rounded-lg">
                      <span className="text-[9px] uppercase text-slate-500 font-bold block font-sans">Avg Hold</span>
                      <span className="font-extrabold text-slate-200">{degen.avgHold}</span>
                    </div>
                    <div className="bg-slate-950/20 border border-slate-900/60 p-2 rounded-lg">
                      <span className="text-[9px] uppercase text-slate-500 font-bold block font-sans">Win Rate</span>
                      <span className="font-extrabold text-emerald-400">{degen.winRate.toFixed(1)}%</span>
                    </div>
                    <div className="bg-slate-950/20 border border-slate-900/60 p-2 rounded-lg">
                      <span className="text-[9px] uppercase text-slate-500 font-bold block font-sans">Followers</span>
                      <span className="font-extrabold text-slate-200">{degen.followers}</span>
                    </div>
                  </div>

                  {/* Horizontal tags/labels (Image 4 bottom style) */}
                  <div className="flex flex-wrap gap-1.5 pt-1.5 pb-2">
                    {degen.tags.map((tag, i) => (
                      <span 
                        key={i} 
                        className="text-[9px] font-bold font-mono px-2 py-0.5 rounded-md bg-slate-900/60 text-slate-400 border border-slate-800"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                </div>

                {/* Footer and interactive mirror button */}
                <div className="flex items-center justify-between border-t border-slate-800/40 pt-4 mt-3">
                  <div className="text-[9px] text-slate-500 font-semibold font-mono">
                    Last active spot execution: {degen.lastTrade}
                  </div>

                  <button
                    onClick={() => openReviewModal('DEGEN_MIRROR', degen.name, 'SOL / USDC')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-black font-extrabold text-xs px-4 py-2 rounded-xl transition shadow-lg shadow-emerald-600/5 flex items-center gap-1.5"
                  >
                    <Zap className="h-3.5 w-3.5 text-black" />
                    Mirror Degen
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* ==================================== REVIEW POSITION SLIDE DIALOG MODAL ==================================== */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101014] border border-[#1d1d25] rounded-2xl w-full max-w-md p-6 relative shadow-2xl animate-fade-in text-slate-200">
            
            {/* Close button */}
            <button 
              onClick={() => setShowReviewModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header branding & title (Image 11 style) */}
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-emerald-600/10 border border-emerald-500/20 p-1.5 rounded-lg text-emerald-400">
                <Sparkles className="h-4.5 w-4.5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-100">
                  {reviewType === 'LP_COPY' ? 'Review LP Copy Ticket' : 'Review Mirror Position'}
                </h3>
                <span className="text-[10px] text-slate-500 tracking-wider font-mono font-bold uppercase block">AstraFi Autonomous Vaults</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-normal mb-4">
              Deploy capital into the {reviewPair} trading pair mirroring <strong>{reviewTargetName}</strong> strategy routing paths.
            </p>

            {/* Main setup params form */}
            <div className="space-y-4">
              
              {/* Dynamic Strategy Choice */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400">Yield Strategy Variant:</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80 text-[10px] font-bold font-mono text-center">
                  {['Curve', 'Grid', 'Two-sided'].map((strat) => (
                    <button
                      key={strat}
                      onClick={() => setReviewStrategy(strat as any)}
                      className={`py-1.5 rounded border ${
                        reviewStrategy === strat
                          ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400 font-bold'
                          : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {strat.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider for Bins or Range limit (Screen 11 reactive range slider) */}
              <div className="space-y-1 bg-slate-950/40 p-3 rounded-xl border border-slate-900">
                <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
                  <span>Price Interval Bins:</span>
                  <span className="text-emerald-400 font-mono font-extrabold">{reviewBins} Bins</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="150"
                  step="1"
                  value={reviewBins}
                  onChange={(e) => setReviewBins(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-slate-900 rounded-lg cursor-pointer mt-1"
                />
                <span className="text-[8px] font-mono text-slate-500 leading-none">Concentrates capital inside optimized profit bands</span>
              </div>

              {/* Capital input amount with preset buttons (Screen 11 user capital) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Position Allocation Size (USDC):</label>
                  <span className="text-[10px] text-slate-500 font-mono">Bal: ${usdcBalance.toLocaleString()} USDC</span>
                </div>
                
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={reviewAmt}
                    onChange={(e) => setReviewAmt(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-mono outline-none focus:border-emerald-500/50 font-bold"
                  />
                  <div className="absolute right-2 top-2 text-slate-400 text-[10px] font-bold font-mono">USDC</div>
                </div>

                {/* Preset selectors: include the 15 USDC the user specifically has / wants */}
                <div className="grid grid-cols-5 gap-1 text-[10px] font-bold font-mono text-center">
                  {['15', '50', '250', '1000'].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setReviewAmt(preset)}
                      className={`py-1 rounded border transition ${
                        reviewAmt === preset
                          ? 'bg-emerald-600/15 border-emerald-500/40 text-emerald-400 font-bold'
                          : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      ${preset}
                    </button>
                  ))}
                  <button
                    onClick={() => setReviewAmt(usdcBalance.toString())}
                    className="py-1 rounded border bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-300"
                  >
                    MAX
                  </button>
                </div>
              </div>

              {/* Trigger Profit target parameter */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400">Position Target Reward Trigger:</label>
                <div className="grid grid-cols-4 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800/80 text-[10px] font-bold font-mono text-center">
                  {['1.0', '5.0', '10.0', '25.0'].map((tgt) => (
                    <button
                      key={tgt}
                      onClick={() => setReviewTargetProfit(tgt)}
                      className={`py-1 rounded border ${
                        reviewTargetProfit === tgt
                          ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400 font-bold'
                          : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      +{tgt}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Slippage Protection tolerance selectors (Screen 11 slippage choice) */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400">Slippage Tolerance Protection:</label>
                <div className="grid grid-cols-5 gap-1.5 bg-slate-950 p-1 rounded-xl border border-[#1d1d25] text-[10px] font-bold font-mono text-center">
                  {['0.1%', '0.5%', '1.0%', '2.0%', '3.0%'].map((slip) => (
                    <button
                      key={slip}
                      onClick={() => setReviewSlippage(slip)}
                      className={`py-1.5 rounded border ${
                        reviewSlippage === slip
                          ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400 font-bold'
                          : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {slip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cost and parameters breakdown lists (Image 11 style) */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-900 text-[10px] font-mono text-slate-400 space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-sans">AstraPro Strategy Fee:</span>
                  <span className="text-emerald-400 font-bold">75 Credits (Active VIP Free)</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans">On-chain Gas Reservation:</span>
                  <span className="text-slate-300">0.0001 ETH</span>
                </div>
                <div className="flex justify-between border-t border-slate-900 pt-1.5 font-bold">
                  <span className="font-sans text-slate-300">Collateral Rent (Refundable):</span>
                  <span className="text-slate-200">0.0657 ETH</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-2.5 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={executePositionDeployment}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-black font-extrabold text-xs py-2.5 rounded-xl transition shadow-lg shadow-emerald-600/10 flex items-center justify-center gap-1"
                >
                  <Zap className="h-3.5 w-3.5 text-black" />
                  Create Position
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
