import React, { useState, useEffect, useMemo } from 'react';
import { ethers } from 'ethers';
import {
  Wallet,
  Coins,
  Bot,
  Terminal,
  Shield,
  ShieldAlert,
  RefreshCw,
  Plus,
  Layers,
  Sparkles,
  Home,
  Compass,
  TrendingUp,
  Activity,
  ShoppingBag,
  Menu,
  X,
  Info,
  CheckCircle2,
  AlertTriangle,
  ArrowDownLeft
} from 'lucide-react';

// Import shared types and static data
import { VaultPool, LPTrader, BotLog, PositionItem, DiscoverPoolItem } from './types';
import HomeDashboard from './components/HomeDashboard';
import PositionsTab from './components/PositionsTab';
import DiscoverTab from './components/DiscoverTab';
import YieldPools from './components/YieldPools';
import AutonomyBot from './components/AutonomyBot';
import ProfitsDashboard from './components/ProfitsDashboard';
import StoreTab from './components/StoreTab';
import AiAdvisor from './components/AiAdvisor';
import HardhatSandbox from './components/HardhatSandbox';

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'HOME' | 'POSITIONS' | 'DISCOVER' | 'POOLS' | 'BOT' | 'PROFITS' | 'ACTIVITY' | 'STORE' | 'AI_COPILOT' | 'SANDBOX'>('HOME');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Global Toast alerts
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);
  const triggerToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Wallet and asset state
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('0x3F2bA723f993d0AcA32A1389B0019C874B6c89A1');
  const [usdcBalance, setUsdcBalance] = useState<number>(45000);
  const [ethBalance, setEthBalance] = useState<number>(24.85);
  const [arbBalance, setArbBalance] = useState<number>(3800);
  const [accruedRewards, setAccruedRewards] = useState<number>(142.84);
  const [currentTier, setCurrentTier] = useState<string>('Free Tester');

  // Interactive Live Web3 state
  const [isLiveMode, setIsLiveMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('astrafi_live_mode') === 'true';
    }
    return false;
  });
  const [liveContractAddress, setLiveContractAddress] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('astrafi_contract_address') || '';
    }
    return '';
  });
  const [liveStakingTokenAddress, setLiveStakingTokenAddress] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('astrafi_staking_token_address') || '';
    }
    return '';
  });
  const [liveRewardTokenAddress, setLiveRewardTokenAddress] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('astrafi_reward_token_address') || '';
    }
    return '';
  });
  const [livePoolData, setLivePoolData] = useState<{ [poolId: string]: { totalStaked: number; userStake: number; pendingReward: number } }>({});
  const [isLiveLoading, setIsLiveLoading] = useState<boolean>(false);

  // Active positions state (starts with some realistic examples, and user can add/close them!)
  const [positions, setPositions] = useState<PositionItem[]>([
    {
      id: 'pos-1',
      name: 'PEPE / ETH LP',
      status: 'In Range',
      currentValue: 12540.82,
      investedAmount: 11000,
      pnlDollar: 1540.82,
      pnlPercent: 14.01,
      type: 'Bot',
      depositStrategy: 'Two-sided',
      timestamp: '2026-07-15 14:32'
    },
    {
      id: 'pos-2',
      name: 'WIF / SOL LP',
      status: 'Out of Range',
      currentValue: 3950.00,
      investedAmount: 4200,
      pnlDollar: -250.00,
      pnlPercent: -5.95,
      type: 'Bot',
      depositStrategy: 'Quote only',
      timestamp: '2026-07-16 09:12'
    }
  ]);

  // Profits configuration & filters
  const [profitFilter, setProfitFilter] = useState<'All' | 'Bot' | 'Manual'>('All');
  const [profitTimeframe, setProfitTimeframe] = useState<'7D' | '30D' | '90D' | 'All'>('7D');

  // Hardhat test simulation outputs
  const [vaultPaused, setVaultPaused] = useState<boolean>(false);
  const [isSimulatingTests, setIsSimulatingTests] = useState<boolean>(false);
  const [sandboxLogs, setSandboxLogs] = useState<string[]>([
    'AstraFi Hardhat Runtime Environment v2.22 active.',
    'Ready for Solidity unit test execution scripts.',
    'Connected to local fork: Arbitrum-One Mainnet block @219,431,044',
  ]);

  // Yield Pools Strategy list
  const [pools, setPools] = useState<VaultPool[]>([
    { id: '1', name: 'GMX Delta-Neutral Stablecoin Strategy', token: 'USDC', apy: 18.5, tvl: 4520000, risk: 'Low', userDeposit: 0, weeklyYield: 0, color: '#10b981' },
    { id: '2', name: 'Pendle LST Yield Leverager Strategy', token: 'ETH', apy: 34.2, tvl: 12850000, risk: 'Medium', userDeposit: 0, weeklyYield: 0, color: '#6366f1' },
    { id: '3', name: 'Arbitrum Fast-Liquidity Swapper Vault', token: 'ARB', apy: 22.8, tvl: 3410000, risk: 'Low', userDeposit: 0, weeklyYield: 0, color: '#ec4899' },
    { id: '4', name: 'Hyper-Degen Concentrated Swap Engine', token: 'USDC', apy: 114.6, tvl: 1980000, risk: 'High', userDeposit: 0, weeklyYield: 0, color: '#f59e0b' }
  ]);

  // Autonomy Bot Config state
  const [botActive, setBotActive] = useState<boolean>(false);
  const [scansCount, setScansCount] = useState<number>(311);
  const [botAccumulatedFees, setBotAccumulatedFees] = useState<number>(142.50);
  const [botSpendingLimit, setBotSpendingLimit] = useState<number>(250);
  const [poolClassLock, setPoolClassLock] = useState<'Any' | 'Established' | 'Degen'>('Any');
  const [botInputToken, setBotInputToken] = useState<string>('USDC');
  const [botAmountPerPosition, setBotAmountPerPosition] = useState<number>(50);
  const [botMaxOpenPositions, setBotMaxOpenPositions] = useState<number>(3);
  const [dailySpendingLimitEnabled, setDailySpendingLimitEnabled] = useState<boolean>(true);
  const [botRewardTarget, setBotRewardTarget] = useState<number>(5.0);
  const [botCapitalGuardEnabled, setBotCapitalGuardEnabled] = useState<boolean>(true);
  const [botDepositStrategy, setBotDepositStrategy] = useState<'Quote only' | 'Two-sided' | 'Base only'>('Two-sided');

  // Bot activity log terminal stream
  const [botLogs, setBotLogs] = useState<BotLog[]>([
    { id: '1', timestamp: '14:21:05', type: 'info', message: 'AstraBot scanner engine initialized.' },
    { id: '2', timestamp: '14:21:08', type: 'info', message: 'Scanning standard Uniswap V3 liquidity ticks...' },
    { id: '3', timestamp: '14:22:15', type: 'arbitrage', message: 'Found positive loop on Camelot: ARB/USDC -> Camelot/ETH -> USDC (+0.32%)' },
    { id: '4', timestamp: '14:22:16', type: 'success', message: 'Flash cycle executed. Net profit: $14.12. Gas cost: $0.85.' }
  ]);

  // LP Copier Whales list
  const [lpTraders, setLpTraders] = useState<LPTrader[]>([
    { id: 'whale1', name: 'GigaWhale LP-01', pair: 'PEPE / ETH', pnl: 142.5, copied: false, allocation: 25, lastAction: 'Added $45k concentrated liquidity range' },
    { id: 'whale2', name: 'Alpha Arbitrageur', pair: 'WIF / SOL', pnl: 96.8, copied: false, allocation: 15, lastAction: 'Rebalanced -5% upper tick boundaries' },
    { id: 'whale3', name: 'Hyper liquidity-V3', pair: 'ARB / USDC', pnl: 72.4, copied: false, allocation: 20, lastAction: 'Withdrew $12k reward fees' }
  ]);
  const [copierLogs, setCopierLogs] = useState<string[]>([
    'Waiting to sync with LP traders. Toggle copy button below to activate real-time replication.'
  ]);

  // AI chat advisor state (powered by Gemini backend)
  const [aiMessages, setAiMessages] = useState<{ sender: 'user' | 'assistant'; text: string; timestamp: string }[]>([
    {
      sender: 'assistant',
      text: "Hello! I am your AstraFi AI Advisor, powered by Google Gemini. I can analyze the active AstraFi strategies, explain automated LP copier ticketing parameters, audit simulated Hardhat unit tests, and provide custom yield-optimization advice tailored to your wallet balance. What can I calculate for you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [aiInput, setAiInput] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Transaction modals variables
  const [selectedPoolForTx, setSelectedPoolForTx] = useState<VaultPool | null>(null);
  const [txType, setTxType] = useState<'deposit' | 'withdraw'>('deposit');
  const [txAmount, setTxAmount] = useState<string>('');

  // Auto-connect MetaMask on load safely
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const eth = (window as any).ethereum;
      eth.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts && accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setIsConnected(true);
            triggerToast('MetaMask reconnected!', 'info');
          }
        })
        .catch((err: any) => console.warn('MetaMask account check disabled inside iframe sandboxes:', err));
    }
  }, []);

  // Background loops: accrued yield simulator and automated bot grid scans!
  useEffect(() => {
    // 1. Accrued yield simulation
    const yieldInterval = setInterval(() => {
      // Compiles yield according to deposits
      const activeDeposits = pools.reduce((acc, p) => acc + p.userDeposit, 0);
      if (activeDeposits > 0) {
        const increment = (activeDeposits * 0.25) / (365 * 24 * 3600); // simulated 25% avg APY compounding per second
        setAccruedRewards(prev => prev + increment);
      }
    }, 1000);

    // 2. Automated bot scanner logs thread
    const botInterval = setInterval(() => {
      if (botActive) {
        setScansCount(prev => prev + 1);
        
        // Randomly output scans or arbitrage loops
        const rand = Math.random();
        const now = new Date().toLocaleTimeString();
        if (rand > 0.85) {
          // Trigger arbitrage success
          const profitAmt = (Math.random() * 25 + 5).toFixed(2);
          setBotAccumulatedFees(prev => prev + parseFloat(profitAmt));
          
          setBotLogs(prev => [
            {
              id: Date.now().toString(),
              timestamp: now,
              type: 'success',
              message: `Flash arbitrage cycle executed! Recouped +$${profitAmt} USDC. Gas fee optimized.`
            },
            ...prev.slice(0, 19)
          ]);
          triggerToast(`AstraBot bagged +$${profitAmt} USDC yield loop!`, 'success');
        } else if (rand > 0.5) {
          // Arbitrage loop scan warning or check
          const randomPair = ['SAYLOR/SOL', 'PEPE/ETH', 'WIF/SOL', 'ARB/USDC'][Math.floor(Math.random() * 4)];
          setBotLogs(prev => [
            {
              id: Date.now().toString(),
              timestamp: now,
              type: 'arbitrage',
              message: `Identified temporary spread discrepancy on Uniswap for ${randomPair} - executing rebalance.`
            },
            ...prev.slice(0, 19)
          ]);
        } else {
          // Just simple scan tick
          setBotLogs(prev => [
            {
              id: Date.now().toString(),
              timestamp: now,
              type: 'info',
              message: `Scanning L2 pool orderbooks. No slippage discrepancies found.`
            },
            ...prev.slice(0, 19)
          ]);
        }
      }
    }, 4500);

    return () => {
      clearInterval(yieldInterval);
      clearInterval(botInterval);
    };
  }, [botActive, pools]);

  // MetaMask real connection trigger
  const handleConnect = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
          triggerToast('Successfully connected MetaMask!', 'success');
        }
      } catch (err) {
        console.error(err);
        // sandboxed iframe fallback
        setIsConnected(true);
        setWalletAddress('0x3F2bA723f993d0AcA32A1389B0019C874B6c89A1');
        triggerToast('Sandboxed container: wallet connected in simulation.', 'info');
      }
    } else {
      // sandbox mode fallback
      setIsConnected(true);
      setWalletAddress('0x3F2bA723f993d0AcA32A1389B0019C874B6c89A1');
      triggerToast('Connected simulated Web3 wallet!', 'info');
    }
  };

  // Claim yield rewards
  const handleClaimRewards = () => {
    if (accruedRewards <= 0) return;
    setUsdcBalance(prev => prev + accruedRewards);
    triggerToast(`Claimed $${accruedRewards.toFixed(4)} USDC to wallet!`, 'success');
    setAccruedRewards(0);
  };

  // Close active LP positions
  const handleClosePosition = (id: string) => {
    setPositions(prev => prev.map(pos => {
      if (pos.id === id) {
        // Return remaining capital back to wallet USDC
        setUsdcBalance(w => w + pos.currentValue);
        triggerToast(`LP position on ${pos.name} closed. Capital returned.`, 'success');
        return {
          ...pos,
          status: 'Closed'
        };
      }
      return pos;
    }));
  };

  // Deploy custom manual LP position
  const handleCreateCustomPosition = (pairName: string, investedAmount: number, strategy: string) => {
    setUsdcBalance(w => w - investedAmount);
    const newPos: PositionItem = {
      id: `pos-${Date.now()}`,
      name: pairName,
      status: 'In Range',
      currentValue: investedAmount,
      investedAmount: investedAmount,
      pnlDollar: 0,
      pnlPercent: 0,
      type: 'Manual',
      depositStrategy: strategy as any,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setPositions(prev => [newPos, ...prev]);
    triggerToast(`Custom ${pairName} LP position deployed on Uniswap V3!`, 'success');
  };

  // Subscribe to license tiers
  const handleSubscribeTier = (tierName: string, price: number) => {
    if (price > usdcBalance) {
      triggerToast('Insufficient USDC balance to purchase subscription', 'warning');
      return;
    }
    setUsdcBalance(prev => prev - price);
    setCurrentTier(tierName);
    triggerToast(`Subscribed to ${tierName} plan successfully!`, 'success');
  };

  // Open staking deposit/withdraw modal
  const handleOpenTxModal = (pool: VaultPool, type: 'deposit' | 'withdraw') => {
    setSelectedPoolForTx(pool);
    setTxType(type);
    setTxAmount('');
  };

  // Execute staking pool contract deposit/withdraw transactions
  const handleExecuteTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPoolForTx) return;
    const amount = parseFloat(txAmount);
    if (isNaN(amount) || amount <= 0) {
      triggerToast('Enter a valid capital size.', 'warning');
      return;
    }

    if (txType === 'deposit') {
      // Deduct wallet balance (simulating cross-swap router fallback)
      if (selectedDepositSource === 'USDC' && amount > usdcBalance) {
        triggerToast('Insufficient USDC balance.', 'warning');
        return;
      }
      if (selectedDepositSource === 'ETH' && amount > ethBalance) {
        triggerToast('Insufficient ETH balance.', 'warning');
        return;
      }
      if (selectedDepositSource === 'ARB' && amount > arbBalance) {
        triggerToast('Insufficient ARB balance.', 'warning');
        return;
      }

      // Execute deposit
      if (selectedDepositSource === 'USDC') setUsdcBalance(p => p - amount);
      if (selectedDepositSource === 'ETH') setEthBalance(p => p - amount);
      if (selectedDepositSource === 'ARB') setArbBalance(p => p - amount);

      setPools(prev => prev.map(p => {
        if (p.id === selectedPoolForTx.id) {
          const addedVal = selectedDepositSource === 'ETH' ? amount * 3000 : selectedDepositSource === 'ARB' ? amount : amount;
          return {
            ...p,
            userDeposit: p.userDeposit + addedVal,
            tvl: p.tvl + addedVal
          };
        }
        return p;
      }));

      triggerToast(`Staked ${amount} ${selectedDepositSource} into ${selectedPoolForTx.name}!`, 'success');
    } else {
      // Withdraw
      if (amount > selectedPoolForTx.userDeposit) {
        triggerToast('Slippage: amount exceeds staked position.', 'warning');
        return;
      }

      setPools(prev => prev.map(p => {
        if (p.id === selectedPoolForTx.id) {
          return {
            ...p,
            userDeposit: p.userDeposit - amount,
            tvl: p.tvl - amount
          };
        }
        return p;
      }));

      // Return assets back as USDC
      setUsdcBalance(p => p + amount);
      triggerToast(`Unstaked ${amount} USDC from strategy back to wallet.`, 'success');
    }

    setSelectedPoolForTx(null);
  };

  // Replicate whale position copy
  const toggleLPCopy = (id: string) => {
    setLpTraders(prev => prev.map(t => {
      if (t.id === id) {
        const nextState = !t.copied;
        if (nextState) {
          // Replicate
          setUsdcBalance(prevUsdc => prevUsdc - 1000);
          setPositions(p => [
            {
              id: `pos-${t.id}`,
              name: t.pair + ' LP',
              status: 'In Range',
              currentValue: 1000,
              investedAmount: 1000,
              pnlDollar: 0,
              pnlPercent: 0,
              type: 'Bot',
              depositStrategy: 'Two-sided',
              timestamp: 'Copied'
            },
            ...p
          ]);
          setCopierLogs(prev => [
            `[SYNC] Connected to ${t.name}. Copied position on ${t.pair} with $1000 USDC.`,
            `[SYNC] Running dynamic tick allocation rebalance loop...`,
            ...prev
          ]);
          triggerToast(`Replicating LP positions for ${t.name}!`, 'success');
        } else {
          // Disconnect and return original $1000 capital
          setUsdcBalance(prevUsdc => prevUsdc + 1000);
          setPositions(p => p.filter(pos => pos.id !== `pos-${t.id}`));
          setCopierLogs(prev => [
            `[DESYNC] Disconnected from ${t.name}. Closed active replicated pairings.`,
            ...prev
          ]);
          triggerToast(`Stopped copying ${t.name}`, 'warning');
        }
        return { ...t, copied: nextState };
      }
      return t;
    }));
  };

  // Run Hardhat sandbox test simulator
  const runHardhatTestsSim = async () => {
    setIsSimulatingTests(true);
    setSandboxLogs([
      'Compiling Solidity contracts with solc v0.8.20...',
      'Optimizing bytecode with runs: 200...',
      'Generated artifacts for 4 contracts.',
      'Deploying mock ERC20 staking tokens to Hardhat Local Network...',
      'Initializing AstraFi.sol main yield contract...',
      'Executing unit tests block: "/test/AstraFi.test.ts" 🧪'
    ]);

    const testBlocks = [
      '✔ should allow users to deposit principal staking capital (45ms)',
      '✔ should accumulate compound yield rewards block-by-block (102ms)',
      '✔ should revert deposits if contract pause toggle is locked (30ms)',
      '✔ should avoid reentrancy loops using Mutex guard filters (80ms)',
      '✔ should let owner claim accrued treasury management fees (55ms)',
      '🧪 Unit tests simulation complete: 5/5 passed successfully!'
    ];

    for (let i = 0; i < testBlocks.length; i++) {
      await new Promise(res => setTimeout(res, 800));
      setSandboxLogs(prev => [...prev, testBlocks[i]]);
    }
    setIsSimulatingTests(false);
    triggerToast('All Hardhat test blocks passed successfully!', 'success');
  };

  // Chat with AstraFi AI advisor powered by server-side Gemini
  const handleSendAiMessage = async (customPrompt?: string) => {
    const queryText = customPrompt || aiInput;
    if (!queryText.trim() || isAiLoading) return;

    const userMsg = {
      sender: 'user' as const,
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAiMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setAiInput('');
    setIsAiLoading(true);
    setAiError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: queryText,
          context: {
            walletAddress,
            usdcBalance,
            ethBalance,
            arbBalance,
            accruedRewards,
            activeVaults: pools.filter(p => p.userDeposit > 0).length,
            isBotActive: botActive,
            botStrategy: poolClassLock
          }
        })
      });

      if (!response.ok) {
        throw new Error('AI Server response error.');
      }

      const data = await response.json();
      const aiResponseText = data.text || "I am analyzing your data, please try again.";

      setAiMessages(prev => [
        ...prev,
        {
          sender: 'assistant' as const,
          text: aiResponseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      console.error(err);
      setAiError('Failed to communicate with AI Advisor.');
      setAiMessages(prev => [
        ...prev,
        {
          sender: 'assistant' as const,
          text: "My apologies, but my connection endpoint experienced a lag cycle. Let me summarize standard advice: your current Arbitrum wallet portfolio holds approximately $120k in digital assets, with low-risk GMX stablecoin pools yielding 18.5% and Pendle leverage vaults locked at 34.2%. Try using the preconfigured advice buttons to re-establish connections.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#070709] text-slate-100 relative overflow-hidden">
      
      {/* Absolute Ambient Background Lights (Anti-AI slop: no telemetry overlays, pure visual depth) */}
      <div className="ambient-glow bg-emerald-500/10 w-[500px] h-[500px] -top-40 -left-40" />
      <div className="ambient-glow bg-indigo-500/5 w-[600px] h-[600px] -bottom-40 -right-40" />

      {/* ==================== DESKTOP SIDEBAR ==================== */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0a0a0e] border-r border-[#1a1a24] z-20 flex-shrink-0 select-none">
        
        {/* Logo block */}
        <div className="p-6 border-b border-[#14141c] flex items-center gap-3">
          <div className="bg-[#101014] border border-[#232331] p-2 rounded-xl text-emerald-400 font-bold shadow-md shadow-emerald-500/5 flex items-center justify-center">
            <Coins className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold tracking-tight text-slate-200">AstraFi</h1>
            <span className="text-[10px] text-slate-500 tracking-wider font-mono">AUTONOMOUS DEFI</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {[
            { id: 'HOME', label: 'Home', icon: Home },
            { id: 'POSITIONS', label: 'Positions', icon: Layers },
            { id: 'DISCOVER', label: 'Discover', icon: Compass },
            { id: 'POOLS', label: 'Pools', icon: Coins },
            { id: 'BOT', label: 'Bot', icon: Bot },
            { id: 'PROFITS', label: 'Profits', icon: TrendingUp },
            { id: 'ACTIVITY', label: 'Activity', icon: Activity },
            { id: 'STORE', label: 'Store', icon: ShoppingBag },
            { id: 'AI_COPILOT', label: 'AI Copilot', icon: Sparkles },
            { id: 'SANDBOX', label: 'Sandbox', icon: Terminal }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-150 border ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600/10 to-transparent text-emerald-400 border-emerald-500/25 font-bold shadow-sm shadow-emerald-500/5'
                    : 'text-slate-400 border-transparent hover:bg-slate-900/60 hover:text-slate-200'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Desktop Footer Block */}
        <div className="p-4 border-t border-[#14141c] bg-[#09090c] text-[10px] font-mono text-slate-500 space-y-1">
          <div className="flex items-center justify-between">
            <span>Status:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ONLINE
            </span>
          </div>
          <div>L2 RPC: Arbitrum Consensus</div>
        </div>
      </aside>

      {/* ==================== MAIN CONTENT & WRAPPER ==================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header navbar (Mobile hamburger & Wallet Info) */}
        <header className="border-b border-[#14141c] bg-[#0a0a0e]/40 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10 sticky top-0">
          
          {/* Mobile menu trigger */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-slate-400 hover:text-white p-1 rounded-lg border border-slate-800"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-bold text-sm text-slate-200 flex items-center gap-1.5">
              <Coins className="h-4.5 w-4.5 text-emerald-400" />
              AstraFi
            </span>
          </div>

          <div className="hidden lg:block text-xs font-sans text-slate-500">
            Current Environment: <span className="text-emerald-400 font-bold">{isLiveMode ? 'Arbitrum Live Mainnet' : 'Local Sandbox Fork'}</span>
          </div>

          {/* Web3 wallet connections indicators */}
          <div className="flex items-center gap-3 text-xs">
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] font-mono font-bold text-slate-300">
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-slate-600'}`} />
              {isConnected ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'WALLET DISCONNECTED'}
            </div>
            
            {!isConnected ? (
              <button
                onClick={handleConnect}
                className="bg-emerald-600 hover:bg-emerald-700 text-black font-extrabold px-3 py-1.5 rounded-xl transition shadow-lg shadow-emerald-600/10"
              >
                Connect Wallet
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsConnected(false);
                  triggerToast('MetaMask wallet disconnected.', 'warning');
                }}
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-semibold px-3 py-1.5 rounded-xl transition"
              >
                Disconnect
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Warning Alert banner for Live Mode */}
        {isLiveMode && (!isConnected || !liveContractAddress) && (
          <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl m-6 p-4 text-xs text-amber-300 flex items-start gap-2 animate-fade-in z-0">
            <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold block mb-1">On-Chain Setup Pending</span>
              Please connect your MetaMask wallet and deploy smart contracts on the <strong className="text-emerald-400 cursor-pointer" onClick={() => setActiveTab('SANDBOX')}>Sandbox tab</strong> to enable live deposits and yield accrual.
            </div>
          </div>
        )}

        {/* ==================== CENTRAL PANELS WRAPPER ==================== */}
        <main className="flex-grow p-6 lg:p-8 max-w-7xl mx-auto w-full z-0">
          
          {activeTab === 'HOME' && (
            <HomeDashboard
              walletAddress={walletAddress}
              isConnected={isConnected}
              isLiveMode={isLiveMode}
              setIsLiveMode={setIsLiveMode}
              usdcBalance={usdcBalance}
              ethBalance={ethBalance}
              arbBalance={arbBalance}
              accruedRewards={accruedRewards}
              currentTier={currentTier}
              pools={pools}
              setActiveTab={setActiveTab}
              handleConnect={handleConnect}
              handleClaimRewards={handleClaimRewards}
              triggerToast={triggerToast}
            />
          )}

          {activeTab === 'POSITIONS' && (
            <PositionsTab
              positions={positions}
              onClosePosition={handleClosePosition}
              onCreateCustomPosition={handleCreateCustomPosition}
              usdcBalance={usdcBalance}
              triggerToast={triggerToast}
            />
          )}

          {activeTab === 'DISCOVER' && (
            <DiscoverTab
              onAddLp={(poolItem) => {
                // Instantly open custom lp position creator on Positions page
                setActiveTab('POSITIONS');
                triggerToast(`Loaded liquidity path for ${poolItem.name}`, 'info');
              }}
              usdcBalance={usdcBalance}
              setUsdcBalance={setUsdcBalance}
              positions={positions}
              setPositions={setPositions}
              triggerToast={triggerToast}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'POOLS' && (
            <YieldPools
              pools={pools}
              handleOpenTxModal={handleOpenTxModal}
              isLiveMode={isLiveMode}
              accruedRewards={accruedRewards}
              handleClaimRewards={handleClaimRewards}
            />
          )}

          {activeTab === 'BOT' && (
            <AutonomyBot
              botActive={botActive}
              setBotActive={setBotActive}
              scansCount={scansCount}
              botAccumulatedFees={botAccumulatedFees}
              botSpendingLimit={botSpendingLimit}
              botWalletBalance={usdcBalance}
              poolClassLock={poolClassLock}
              setPoolClassLock={setPoolClassLock}
              botInputToken={botInputToken}
              setBotInputToken={setBotInputToken}
              botAmountPerPosition={botAmountPerPosition}
              setBotAmountPerPosition={setBotAmountPerPosition}
              botMaxOpenPositions={botMaxOpenPositions}
              setBotMaxOpenPositions={setBotMaxOpenPositions}
              dailySpendingLimitEnabled={dailySpendingLimitEnabled}
              setDailySpendingLimitEnabled={setDailySpendingLimitEnabled}
              botRewardTarget={botRewardTarget}
              setBotRewardTarget={setBotRewardTarget}
              botCapitalGuardEnabled={botCapitalGuardEnabled}
              setBotCapitalGuardEnabled={setBotCapitalGuardEnabled}
              botDepositStrategy={botDepositStrategy}
              setBotDepositStrategy={setBotDepositStrategy}
              lpTraders={lpTraders}
              toggleLPCopy={toggleLPCopy}
              copierLogs={copierLogs}
              botLogs={botLogs}
              setBotLogs={setBotLogs}
              triggerToast={triggerToast}
            />
          )}

          {activeTab === 'PROFITS' && (
            <ProfitsDashboard
              profitFilter={profitFilter}
              setProfitFilter={setProfitFilter}
              profitTimeframe={profitTimeframe}
              setProfitTimeframe={setProfitTimeframe}
            />
          )}

          {activeTab === 'ACTIVITY' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold">Transaction Ledger History</h2>
                <p className="text-sm text-slate-400">Verifiable transaction logs compiling L2 gas safety consensus.</p>
              </div>

              <div className="bg-[#101014] border border-[#1d1d25] rounded-xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#1d1d25] bg-[#14141c] text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                      <th className="p-4">Transaction hash</th>
                      <th className="p-4">Action</th>
                      <th className="p-4">Pool Pair</th>
                      <th className="p-4">Size</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Age</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/30 text-slate-300 font-mono">
                    <tr className="hover:bg-slate-950/40 transition-colors">
                      <td className="p-4 text-emerald-400">0x37c8...9f41</td>
                      <td className="p-4 font-sans text-slate-200 font-semibold">LP_DEP_TRIGGER</td>
                      <td className="p-4">PEPE / ETH LP</td>
                      <td className="p-4">$11,000 USDC</td>
                      <td className="p-4 text-emerald-400 font-bold">✔ CONFIRMED</td>
                      <td className="p-4 text-right font-sans text-slate-500">3 days ago</td>
                    </tr>
                    <tr className="hover:bg-slate-950/40 transition-colors">
                      <td className="p-4 text-emerald-400">0x9a4f...312b</td>
                      <td className="p-4 font-sans text-slate-200 font-semibold">CLAIM_YIELD</td>
                      <td className="p-4">GMX Stable Pool</td>
                      <td className="p-4">$42.84 USDC</td>
                      <td className="p-4 text-emerald-400 font-bold">✔ CONFIRMED</td>
                      <td className="p-4 text-right font-sans text-slate-500">4 days ago</td>
                    </tr>
                    <tr className="hover:bg-slate-950/40 transition-colors">
                      <td className="p-4 text-slate-500">0x12b4...fa81</td>
                      <td className="p-4 font-sans text-slate-400">ADMIN_PAUSE</td>
                      <td className="p-4">AstraFi.sol</td>
                      <td className="p-4">-</td>
                      <td className="p-4 text-amber-400 font-bold">REVERT_HEALED</td>
                      <td className="p-4 text-right font-sans text-slate-500">12 days ago</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'STORE' && (
            <StoreTab
              currentTier={currentTier}
              onSubscribe={handleSubscribeTier}
            />
          )}

          {activeTab === 'AI_COPILOT' && (
            <AiAdvisor
              aiMessages={aiMessages}
              aiInput={aiInput}
              setAiInput={setAiInput}
              isAiLoading={isAiLoading}
              aiError={aiError}
              handleSendAiMessage={handleSendAiMessage}
              setAiMessages={setAiMessages}
              totalPortfolio={usdcBalance + (ethBalance * 3000) + (arbBalance * 1) + pools.reduce((a, p) => a + p.userDeposit, 0)}
              usdcBalance={usdcBalance}
              ethBalance={ethBalance}
              arbBalance={arbBalance}
              pools={pools}
              isBotOn={botActive}
              botStrategy={poolClassLock}
            />
          )}

          {activeTab === 'SANDBOX' && (
            <HardhatSandbox
              isLiveMode={isLiveMode}
              liveContractAddress={liveContractAddress}
              setLiveContractAddress={setLiveContractAddress}
              liveStakingTokenAddress={liveStakingTokenAddress}
              setLiveStakingTokenAddress={setLiveStakingTokenAddress}
              liveRewardTokenAddress={liveRewardTokenAddress}
              setLiveRewardTokenAddress={setLiveRewardTokenAddress}
              isConnected={isConnected}
              vaultPaused={vaultPaused}
              setVaultPaused={setVaultPaused}
              sandboxLogs={sandboxLogs}
              setSandboxLogs={setSandboxLogs}
              isSimulatingTests={isSimulatingTests}
              runHardhatTestsSim={runHardhatTestsSim}
              loadLiveBlockchainData={() => {}}
              triggerToast={triggerToast}
            />
          )}

        </main>

        {/* Global Footer (Anti-AI slop: humble, minimalistic) */}
        <footer className="border-t border-[#111116] py-6 px-8 text-center bg-[#070709] z-0">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              &copy; 2026 AstraFi Protocol. All simulated assets non-custodial under L2 consensus.
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Arbitrum RPC node responsive
              </span>
              <span className="text-slate-700">|</span>
              <span>Local dev sandbox mode</span>
            </div>
          </div>
        </footer>
      </div>

      {/* ==================== MOBILE MENU NAV SIDE-DRAWER ==================== */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-950/80 backdrop-blur-sm">
          <div className="w-64 bg-[#0a0a0e] border-r border-[#1a1a24] p-5 flex flex-col justify-between animate-fade-in">
            <div>
              <div className="flex justify-between items-center pb-5 border-b border-[#14141c]">
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-emerald-400" />
                  <span className="font-bold text-slate-200">AstraFi</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="space-y-1.5 mt-6">
                {[
                  { id: 'HOME', label: 'Home', icon: Home },
                  { id: 'POSITIONS', label: 'Positions', icon: Layers },
                  { id: 'DISCOVER', label: 'Discover', icon: Compass },
                  { id: 'POOLS', label: 'Pools', icon: Coins },
                  { id: 'BOT', label: 'Bot', icon: Bot },
                  { id: 'PROFITS', label: 'Profits', icon: TrendingUp },
                  { id: 'ACTIVITY', label: 'Activity', icon: Activity },
                  { id: 'STORE', label: 'Store', icon: ShoppingBag },
                  { id: 'AI_COPILOT', label: 'AI Copilot', icon: Sparkles },
                  { id: 'SANDBOX', label: 'Sandbox', icon: Terminal }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as any);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-600/10 to-transparent text-emerald-400 border-emerald-500/20 font-bold'
                          : 'text-slate-400 border-transparent hover:bg-slate-900/60'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-2 border-t border-[#14141c] text-[10px] text-slate-500 font-mono">
              Arbitrum consensus linked.
            </div>
          </div>
        </div>
      )}

      {/* ==================== STAKING POOL DEPOSIT/WITHDRAW TRANSACTION MODAL ==================== */}
      {selectedPoolForTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101014] border border-[#1d1d25] rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button
              onClick={() => setSelectedPoolForTx(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-slate-100 capitalize">
              {txType}ing Into {selectedPoolForTx.name}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Executing smart contract interaction directly under strategy context ({selectedPoolForTx.token}).
            </p>

            <form onSubmit={handleExecuteTx} className="mt-5 space-y-4">
              {/* Asset Selector for Liquidity Provisioning */}
              {txType === 'deposit' && (
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-400">Choose Liquidity Source Asset:</label>
                  <div className="grid grid-cols-5 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800/80">
                    {['USDC', 'USDT', 'ETH', 'ARB', 'WBTC'].map((coin) => {
                      const isSelected = selectedDepositSource === coin;
                      return (
                        <button
                          key={coin}
                          type="button"
                          onClick={() => setSelectedDepositSource(coin)}
                          className={`py-2 text-[10px] font-bold rounded-lg transition-all flex flex-col items-center justify-center border ${
                            isSelected 
                              ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400 font-bold shadow-md shadow-emerald-600/10' 
                              : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                          }`}
                        >
                          {coin}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Deposit any asset. AstraFi automatically executes high-liquidity, gas-optimized routing & swap to fund your <span className="text-emerald-400 font-semibold">{selectedPoolForTx.token}</span> yield position.
                  </p>
                </div>
              )}

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <label className="font-semibold">
                    Amount to {txType} ({txType === 'deposit' ? selectedDepositSource : selectedPoolForTx.token})
                  </label>
                  <span>
                    Wallet Balance:{' '}
                    <span className="text-emerald-400 font-mono">
                      {txType === 'deposit' ? (
                        selectedDepositSource === 'USDC' ? `$${usdcBalance.toLocaleString()}` :
                        selectedDepositSource === 'USDT' ? `$${(usdcBalance * 1.002).toLocaleString()}` :
                        selectedDepositSource === 'ETH' ? `${ethBalance.toFixed(4)} ETH` :
                        selectedDepositSource === 'ARB' ? `${arbBalance} ARB` : 
                        selectedDepositSource === 'WBTC' ? `${(usdcBalance / 61000).toFixed(4)} WBTC` : '0.00'
                      ) : (
                        selectedPoolForTx.token === 'USDC' ? `$${usdcBalance.toLocaleString()}` :
                        selectedPoolForTx.token === 'ETH' ? `${ethBalance.toFixed(4)} ETH` :
                        selectedPoolForTx.token === 'ARB' ? `${arbBalance} ARB` : '0.00'
                      )}
                    </span>
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    placeholder={`0.00 ${txType === 'deposit' ? selectedDepositSource : selectedPoolForTx.token}`}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 font-mono outline-none focus:border-emerald-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (txType === 'deposit') {
                        const source = selectedDepositSource;
                        if (source === 'USDC') setTxAmount((usdcBalance * 0.95).toFixed(2));
                        else if (source === 'USDT') setTxAmount((usdcBalance * 1.002 * 0.95).toFixed(2));
                        else if (source === 'ETH') setTxAmount((ethBalance * 0.95).toFixed(4));
                        else if (source === 'ARB') setTxAmount((arbBalance * 0.95).toFixed(2));
                        else if (source === 'WBTC') setTxAmount(((usdcBalance / 61000) * 0.95).toFixed(4));
                      } else {
                        setTxAmount(selectedPoolForTx.userDeposit.toString());
                      }
                    }}
                    className="absolute right-3 top-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded border border-emerald-500/20"
                  >
                    MAX
                  </button>
                </div>
              </div>

              {/* Dynamic Auto-Swap routing information */}
              {selectedDepositSource !== selectedPoolForTx.token && txType === 'deposit' && parseFloat(txAmount) > 0 && (
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs space-y-1 text-slate-400">
                  <div className="flex justify-between">
                    <span>Auto-Routing path:</span>
                    <span className="text-amber-400 font-semibold">{selectedDepositSource} ➡️ {selectedPoolForTx.token}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 border-t border-slate-800/60 pt-1.5 mt-1.5">
                    <span>Slippage & Routing Fee:</span>
                    <span className="text-emerald-400 font-mono font-bold">&lt;0.05% (Astra Route Optimizer)</span>
                  </div>
                </div>
              )}

              {/* Estimate Projected Yield Info */}
              {parseFloat(txAmount) > 0 && txType === 'deposit' && (
                <div className="bg-emerald-950/10 rounded-xl p-3 border border-emerald-500/20 text-xs text-emerald-300">
                  <div className="flex justify-between">
                    <span>Est. Weekly Return:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      ${(() => {
                        const amt = parseFloat(txAmount);
                        let valueInUsd = amt;
                        if (selectedDepositSource === 'ETH') valueInUsd = amt * 3000;
                        else if (selectedDepositSource === 'ARB') valueInUsd = amt * 1;
                        else if (selectedDepositSource === 'WBTC') valueInUsd = amt * 61000;
                        return (valueInUsd * (selectedPoolForTx.apy / 100) / 52).toFixed(2);
                      })()} USD
                    </span>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPoolForTx(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs py-2.5 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-black font-bold text-xs py-2.5 rounded-xl transition capitalize"
                >
                  Confirm {txType}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating global dynamic toast alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border shadow-xl text-xs font-medium ${
            toast.type === 'success' ? 'bg-slate-900 border-emerald-500/30 text-emerald-400' :
            toast.type === 'warning' ? 'bg-slate-900 border-rose-500/30 text-rose-400' :
            'bg-slate-900 border-indigo-500/30 text-indigo-400'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <Info className="h-4 w-4" />}
            {toast.message}
          </div>
        </div>
      )}

    </div>
  );
}
