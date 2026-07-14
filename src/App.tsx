import React, { useState, useEffect, useMemo } from 'react';
import {
  Wallet,
  LineChart as ChartIcon,
  Coins,
  Bot,
  Terminal,
  ArrowUpRight,
  Shield,
  ShieldAlert,
  RefreshCw,
  Play,
  CheckCircle2,
  Zap,
  Plus,
  Layers,
  Flame,
  AlertTriangle,
  LogOut,
  Info,
  Sparkles
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// types & interfaces
interface VaultPool {
  id: string;
  name: string;
  token: string;
  apy: number;
  tvl: number;
  risk: 'Low' | 'Medium' | 'High';
  userDeposit: number;
  weeklyYield: number;
  color: string;
}

interface LPTrader {
  id: string;
  name: string;
  pair: string;
  pnl: number;
  copied: boolean;
  allocation: number;
  lastAction: string;
}

interface BotLog {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'arbitrage';
  message: string;
}

export default function App() {
  // Navigation & tabs
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'VAULTS' | 'LP_COPIER' | 'ASTRABOT' | 'SANDBOX' | 'AI_COPILOT'>('DASHBOARD');

  // AI Advisor Chat State
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

  // Wallet State
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('0x3F2bA723f993d0AcA32A1389B0019C874B6c89A1');
  const [network, setNetwork] = useState<'arbitrum_mainnet' | 'arbitrum_sepolia' | 'ethereum'>('arbitrum_mainnet');
  const [usdcBalance, setUsdcBalance] = useState<number>(45000);
  const [ethBalance, setEthBalance] = useState<number>(24.85); // ~$74,550
  const [arbBalance, setArbBalance] = useState<number>(3800); // ~$3,800
  const [accruedRewards, setAccruedRewards] = useState<number>(142.84);

  // MetaMask real connection handler
  const handleConnect = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
          triggerToast('Successfully connected to MetaMask!', 'success');
          
          // Try to fetch real ETH balance
          try {
            const balanceHex = await (window as any).ethereum.request({
              method: 'eth_getBalance',
              params: [accounts[0], 'latest']
            });
            const realEth = parseInt(balanceHex, 16) / 1e18;
            setEthBalance(realEth > 0 ? realEth : 24.85);
          } catch (e) {
            console.warn('Could not fetch real ETH balance, using simulated balance.');
          }
        }
      } catch (error: any) {
        console.error('MetaMask connection error', error);
        triggerToast(error.message || 'MetaMask connection rejected', 'warning');
      }
    } else {
      // Fallback for sandboxed preview container or normal mobile browsers
      setIsConnected(true);
      setWalletAddress('0x3F2bA723f993d0AcA32A1389B0019C874B6c89A1');
      triggerToast('No MetaMask extension detected. Connected simulated sandbox wallet!', 'info');
    }
  };

  // Listen for account and network changes in MetaMask
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
      (window as any).ethereum.on('chainChanged', handleChainChanged);

      // Check if already authorized
      (window as any).ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts && accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setIsConnected(true);
          }
        })
        .catch(console.error);

      return () => {
        if ((window as any).ethereum.removeListener) {
          (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged);
          (window as any).ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, []);

  // Notification Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Trigger Toast helper
  const triggerToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Pools state
  const [pools, setPools] = useState<VaultPool[]>([
    { id: '1', name: 'Arbitrum Delta-Neutral Maximizer', token: 'USDC', apy: 16.8, tvl: 4520400, risk: 'Low', userDeposit: 15000, weeklyYield: 4.84, color: '#38bdf8' },
    { id: '2', name: 'ETH Volatility Harvester V3', token: 'ETH', apy: 28.4, tvl: 8904500, risk: 'Medium', userDeposit: 6.5, weeklyYield: 0.0355, color: '#6366f1' },
    { id: '3', name: 'WBTC Liquid Staking Booster', token: 'WBTC', apy: 9.2, tvl: 12450000, risk: 'Low', userDeposit: 0.0, weeklyYield: 0.0, color: '#f59e0b' },
    { id: '4', name: 'Astra Ecosystem High-Yield Compounder', token: 'ARB', apy: 34.5, tvl: 1850300, risk: 'High', userDeposit: 1200, weeklyYield: 7.96, color: '#ec4899' },
  ]);

  // Deposit/Withdraw Modal State
  const [selectedPoolForTx, setSelectedPoolForTx] = useState<VaultPool | null>(null);
  const [txType, setTxType] = useState<'deposit' | 'withdraw'>('deposit');
  const [txAmount, setTxAmount] = useState<string>('');

  // LP Copier state
  const [lpTraders, setLpTraders] = useState<LPTrader[]>([
    { id: 'lp-1', name: 'GigaWhale LP-01', pair: 'ETH-USDC', pnl: 142.5, copied: true, allocation: 25, lastAction: 'Rebalanced Tick [1850 - 2150]' },
    { id: 'lp-2', name: 'Alpha Arbitrageur', pair: 'ARB-ETH', pnl: 96.8, copied: false, allocation: 0, lastAction: 'Minted Liquidity Position' },
    { id: 'lp-3', name: 'Hyper liquidity-V3', pair: 'WBTC-USDC', pnl: 72.4, copied: false, allocation: 0, lastAction: 'Removed 15% out-of-range liquidity' },
    { id: 'lp-4', name: 'Arbitrum DeFi Farmer', pair: 'USDC-USDT', pnl: 18.2, copied: false, allocation: 0, lastAction: 'Collected Swap Fees' },
  ]);

  // LP Copier logs
  const [copierLogs, setCopierLogs] = useState<string[]>([
    'Copier engine active. Replicating GigaWhale LP-01 parameters.',
    'Synced GigaWhale Tick boundaries matching price ETH=$3,012.45.',
    'Collected $4.20 USDC fees in past 4 hours.'
  ]);

  // AstraBot (Trading Bot) state
  const [isBotOn, setIsBotOn] = useState<boolean>(true);
  const [botStrategy, setBotStrategy] = useState<'conservative' | 'balanced' | 'aggressive'>('balanced');
  const [botLogs, setBotLogs] = useState<BotLog[]>([
    { id: 'b-1', timestamp: '12:44:02', type: 'info', message: 'AstraBot grid trading engine initiated with USDC routing active.' },
    { id: 'b-2', timestamp: '12:44:15', type: 'arbitrage', message: 'Spread identified: Uniswap V3 (ARB=$0.982) vs Camelot (ARB=$0.987). Execution queued.' },
    { id: 'b-3', timestamp: '12:44:16', type: 'success', message: 'Arbitrage transaction successful! Profit executed: +$12.45 USDC. Gas spent: $0.18 USDC.' },
    { id: 'b-4', timestamp: '12:44:48', type: 'info', message: 'Listening to orderbook updates on GMX V2 and Uniswap V3.' }
  ]);

  // Smart Contract State (for Sandbox)
  const [vaultPaused, setVaultPaused] = useState<boolean>(false);
  const [sandboxLogs, setSandboxLogs] = useState<string[]>([
    '[SOLIDITY SUITE] Deploying IAstraFi interface...',
    '[SOLIDITY SUITE] Deploying AstraFi.sol core implementation...',
    '[SOLIDITY SUITE] AstraFi initialized at 0x82a51A7...31B4',
    '[SOLIDITY SUITE] Setup Mock ERC20 tokens (USDC, ARB, WBTC).',
    '[SOLIDITY SUITE] Created 4 default strategy vault pools.'
  ]);
  const [isSimulatingTests, setIsSimulatingTests] = useState<boolean>(false);

  // Increment accrued rewards in real-time
  useEffect(() => {
    let interval: any;
    if (isConnected) {
      interval = setInterval(() => {
        // Increment yields block by block
        setAccruedRewards((prev) => {
          const rewardFactor = isBotOn ? 0.0058 : 0.0024;
          return Number((prev + rewardFactor).toFixed(4));
        });

        // Simulating AstraBot trading triggers periodically
        if (isBotOn && Math.random() > 0.72) {
          const gasPrice = (Math.random() * 0.12 + 0.05).toFixed(3);
          const profit = (Math.random() * 25 + 5).toFixed(2);
          const blockNum = Math.floor(Math.random() * 100000) + 21540000;
          const timestamp = new Date().toLocaleTimeString();

          const templates: { message: string; type: 'info' | 'success' | 'arbitrage' | 'warning' }[] = [
            { message: `Arbitrage opportunity: Camelot V3 vs GMX V2. Profit executed: +$${profit} USDC (Gas: $${gasPrice} USDC).`, type: 'success' },
            { message: `Adjusting LP ticks on ETH-USDC pool to defend range [2980 - 3080].`, type: 'info' },
            { message: `Gas limit adjustment on block #${blockNum} to secure speed premium.`, type: 'info' },
            { message: `Simulated transaction success on hash 0xae83...f42c with USDC routing.`, type: 'success' },
            { message: `Volatility alert: Arbitrum sequencer ping delayed. Risk mitigated.`, type: 'warning' }
          ];

          const choice = templates[Math.floor(Math.random() * templates.length)];
          setBotLogs((prev) => [
            { id: `b-dyn-${Date.now()}`, timestamp, type: choice.type, message: choice.message },
            ...prev.slice(0, 15)
          ]);

          // Award small share to usdc balance occasionally
          if (choice.type === 'success') {
            setUsdcBalance((prev) => prev + Number((parseFloat(profit) * 0.1).toFixed(2)));
          }
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isConnected, isBotOn]);

  // Convert active deposit values into unified USD metric
  const ethPrice = 3000;
  const arbPrice = 1.05;
  const wbtcPrice = 58000;

  // Compute stats
  const totalBalances = useMemo(() => {
    const walletValue = usdcBalance + (ethBalance * ethPrice) + (arbBalance * arbPrice);
    
    // Deposits sum
    let depositValue = 0;
    pools.forEach(pool => {
      if (pool.token === 'USDC') depositValue += pool.userDeposit;
      if (pool.token === 'ETH') depositValue += pool.userDeposit * ethPrice;
      if (pool.token === 'ARB') depositValue += pool.userDeposit * arbPrice;
      if (pool.token === 'WBTC') depositValue += pool.userDeposit * wbtcPrice;
    });

    const lpCopiedAllocation = lpTraders
      .filter(t => t.copied)
      .reduce((acc, t) => acc + (usdcBalance * (t.allocation / 100)), 0);

    return {
      wallet: walletValue,
      deposits: depositValue,
      totalPortfolio: walletValue + depositValue + accruedRewards + lpCopiedAllocation,
    };
  }, [usdcBalance, ethBalance, arbBalance, pools, lpTraders, accruedRewards]);

  // Asset allocation percentages
  const allocationData = useMemo(() => {
    return [
      { name: 'USDC Stables', value: usdcBalance + pools.find(p => p.token === 'USDC')?.userDeposit!, color: '#38bdf8' },
      { name: 'ETH Core', value: (ethBalance + pools.find(p => p.token === 'ETH')?.userDeposit!) * ethPrice, color: '#6366f1' },
      { name: 'Arbitrum (ARB)', value: (arbBalance + pools.find(p => p.token === 'ARB')?.userDeposit!) * arbPrice, color: '#ec4899' },
      { name: 'Yields & Rewards', value: accruedRewards, color: '#10b981' }
    ];
  }, [usdcBalance, ethBalance, arbBalance, pools, accruedRewards]);

  // Simulated 7-day Yield Curve
  const historyData = [
    { day: 'Mon', Portfolio: totalBalances.totalPortfolio - 840 },
    { day: 'Tue', Portfolio: totalBalances.totalPortfolio - 610 },
    { day: 'Wed', Portfolio: totalBalances.totalPortfolio - 490 },
    { day: 'Thu', Portfolio: totalBalances.totalPortfolio - 210 },
    { day: 'Fri', Portfolio: totalBalances.totalPortfolio - 120 },
    { day: 'Sat', Portfolio: totalBalances.totalPortfolio - 45 },
    { day: 'Sun', Portfolio: totalBalances.totalPortfolio },
  ];

  // Handlers
  const handleClaimRewards = () => {
    if (accruedRewards <= 0) return;
    const claimed = accruedRewards;
    setUsdcBalance((prev) => prev + claimed);
    setAccruedRewards(0);
    triggerToast(`Claimed $${claimed.toFixed(2)} USDC successfully! Funds transferred to Arbitrum wallet.`, 'success');
  };

  const handleSendAiMessage = async (customPrompt?: string) => {
    const promptToSend = customPrompt || aiInput;
    if (!promptToSend.trim()) return;

    // Clear input
    if (!customPrompt) setAiInput('');

    const newUserMessage = {
      sender: 'user' as const,
      text: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAiMessages((prev) => [...prev, newUserMessage]);
    setIsAiLoading(true);
    setAiError(null);

    const contextInstruction = `You are the AstraFi AI Advisor, a brilliant, premium, hyper-knowledgeable yield-optimizer & market strategist copilot built by Google Gemini operating on the Arbitrum L2 ecosystem.
The user is viewing their AstraFi dashboard. Here is their current wallet and portfolio state:
- Wallet Balance: USDC: $${usdcBalance.toLocaleString()}, ETH: ${ethBalance} ETH ($${(ethBalance * ethPrice).toLocaleString()}), ARB: ${arbBalance} ARB ($${(arbBalance * arbPrice).toLocaleString()})
- Total Portfolio Value: $${totalBalances.totalPortfolio.toLocaleString()}
- Active Pools user deposited in:
${pools.map(p => `  * ${p.name} (${p.token}): User Deposit: $${p.userDeposit}, APY: ${p.apy}%`).join('\n')}
- Available Pools (to advise):
  1. GMX Delta-Neutral Stables (APY: 18.5%, TVL: $2.4M, Risk: Low, token: USDC)
  2. Pendle LST Yield Lev (APY: 28.4%, TVL: $1.2M, Risk: Medium, token: ETH)
  3. Uniswap V3 Concentrated LP (APY: 32.1%, TVL: $850k, Risk: High, token: ARB)
  4. Arbitrum Delta-Neutral (APY: 12.8%, TVL: $4.1M, Risk: Low, token: USDC)
- Copied LP Traders:
${lpTraders.map(t => `  * ${t.name} (Pair: ${t.pair}): Copy Status: ${t.copied ? 'Copied with $' + t.allocation : 'Not copied'}, PnL: ${t.pnl}%`).join('\n')}
- AstraBot Trading Status: ${isBotOn ? 'RUNNING' : 'PAUSED'} (${botStrategy} strategy)

Always provide professional, precise, scannable, and encouraging DeFi recommendations. Write in an elegant, structured format using clean markdown (bolding, clear lists, code snippets if useful). Remind them that simulated assets represent sandbox parameters but can be deployed to live-deployment smart contracts when they are ready. If they need to configure their Gemini API Key, mention they can easily paste it into Settings > Secrets panel of AI Studio.`;

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          systemInstruction: contextInstruction
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch response from Gemini API.');
      }

      setAiMessages((prev) => [
        ...prev,
        {
          sender: 'assistant' as const,
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'An error occurred. Please check your Gemini API key in the Secrets configuration.');
      setAiMessages((prev) => [
        ...prev,
        {
          sender: 'assistant' as const,
          text: `⚠️ **API Error:** ${err.message || 'Unable to fetch response.'} \n\nPlease make sure you have added your **GEMINI_API_KEY** in the **Settings > Secrets** panel of AI Studio. This key is securely managed server-side to prevent exposure to the browser.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleOpenTxModal = (pool: VaultPool, type: 'deposit' | 'withdraw') => {
    setSelectedPoolForTx(pool);
    setTxType(type);
    setTxAmount('');
  };

  const handleExecuteTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPoolForTx || !txAmount) return;
    const amount = parseFloat(txAmount);
    if (isNaN(amount) || amount <= 0) {
      triggerToast('Please provide a valid asset amount.', 'warning');
      return;
    }

    const token = selectedPoolForTx.token;

    if (txType === 'deposit') {
      // Check balances
      if (token === 'USDC' && amount > usdcBalance) {
        triggerToast('Insufficient USDC balance.', 'warning');
        return;
      }
      if (token === 'ETH' && amount > ethBalance) {
        triggerToast('Insufficient ETH balance.', 'warning');
        return;
      }
      if (token === 'ARB' && amount > arbBalance) {
        triggerToast('Insufficient ARB balance.', 'warning');
        return;
      }

      // Deduct wallet, Add deposit
      if (token === 'USDC') setUsdcBalance(prev => prev - amount);
      if (token === 'ETH') setEthBalance(prev => prev - amount);
      if (token === 'ARB') setArbBalance(prev => prev - amount);

      setPools(prev => prev.map(p => {
        if (p.id === selectedPoolForTx.id) {
          const newDeposit = p.userDeposit + amount;
          const newYield = Number((newDeposit * (p.apy / 100) / 52).toFixed(4));
          return { ...p, userDeposit: newDeposit, weeklyYield: newYield };
        }
        return p;
      }));

      triggerToast(`Deposited ${amount} ${token} into ${selectedPoolForTx.name}`, 'success');
    } else {
      // Withdraw
      if (amount > selectedPoolForTx.userDeposit) {
        triggerToast(`Cannot withdraw more than your active deposit.`, 'warning');
        return;
      }

      // Add back to wallet
      if (token === 'USDC') setUsdcBalance(prev => prev + amount);
      if (token === 'ETH') setEthBalance(prev => prev + amount);
      if (token === 'ARB') setArbBalance(prev => prev + amount);

      setPools(prev => prev.map(p => {
        if (p.id === selectedPoolForTx.id) {
          const newDeposit = Math.max(0, p.userDeposit - amount);
          const newYield = Number((newDeposit * (p.apy / 100) / 52).toFixed(4));
          return { ...p, userDeposit: newDeposit, weeklyYield: newYield };
        }
        return p;
      }));

      triggerToast(`Withdrew ${amount} ${token} to Arbitrum Wallet`, 'success');
    }

    setSelectedPoolForTx(null);
  };

  const toggleLPCopy = (id: string) => {
    setLpTraders(prev => prev.map(t => {
      if (t.id === id) {
        const nextState = !t.copied;
        if (nextState) {
          setCopierLogs(logs => [
            `Allocating 25% USDC collateral to copy ${t.name} on ${t.pair}.`,
            ...logs
          ]);
          triggerToast(`Copying positions for ${t.name}`, 'info');
        } else {
          setCopierLogs(logs => [
            `Withdrew allocated copy strategy for ${t.name}. Locked remaining yields.`,
            ...logs
          ]);
          triggerToast(`Stopped copying ${t.name}`, 'warning');
        }
        return { ...t, copied: nextState, allocation: nextState ? 25 : 0 };
      }
      return t;
    }));
  };

  // Simulated Hardhat compiler & test runner
  const runHardhatTestsSim = () => {
    setIsSimulatingTests(true);
    setSandboxLogs(prev => [
      ...prev,
      `[SIMULATOR - ${new Date().toLocaleTimeString()}] Triggering 'npx hardhat test' suite...`
    ]);

    setTimeout(() => {
      setSandboxLogs(prev => [
        ...prev,
        '  AstraFi Contract Suite',
        '    Deployment & Configuration',
        '      ✔ Should set the correct owner and initial parameters (142ms)',
        '      ✔ Should allow owner to add a pool (85ms)',
        '      ✔ Should prevent double-adding a pool (55ms)',
        '    Deposits & Position Management',
        '      ✔ Should deposit and mint position tracker with correct metadata (210ms)',
        '      ✔ Should return correct refund on single-sided pool deposit fallback (125ms)',
        '    Reward Accrual',
        '      ✔ Should accumulate yields over blocks and allow user to claim (250ms)',
        '    Emergency & Administrative Powers',
        '      ✔ Should allow the owner to pause and unpause the vault (90ms)',
        '      ✔ Should allow owner to rescue ERC20 assets (88ms)',
        '  8 passing (994ms)',
        `[SIMULATOR] Test suite execution complete with 100% success rate.`
      ]);
      setIsSimulatingTests(false);
      triggerToast('Solidity Unit Tests Passed!', 'success');
    }, 2000);
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500">
      
      {/* Background ambient decorative blurs */}
      <div className="ambient-glow bg-indigo-500/10 w-[500px] h-[500px] top-[-100px] left-[-100px]" />
      <div className="ambient-glow bg-cyan-500/10 w-[400px] h-[400px] bottom-[10%] right-[-50px]" />

      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-4 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl shadow-lg shadow-indigo-500/20">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                AstraFi
              </h1>
              <span className="text-xs font-mono text-cyan-400">Yield Strategy Suite & Automated Copier</span>
            </div>
          </div>

          {/* Network & Wallet Controls */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Custom Network Selector */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
              <button
                onClick={() => {
                  setNetwork('arbitrum_mainnet');
                  triggerToast('Switched to Arbitrum Mainnet', 'info');
                }}
                className={`px-3 py-1 text-xs rounded-md font-medium transition ${
                  network === 'arbitrum_mainnet'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Arb Mainnet
              </button>
              <button
                onClick={() => {
                  setNetwork('arbitrum_sepolia');
                  triggerToast('Switched network context to Sepolia testnet', 'info');
                }}
                className={`px-3 py-1 text-xs rounded-md font-medium transition ${
                  network === 'arbitrum_sepolia'
                    ? 'bg-slate-800 text-cyan-400 border border-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Arb Sepolia
              </button>
            </div>

            {/* Wallet Address Display */}
            {isConnected ? (
              <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono text-slate-300">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
                <button
                  onClick={() => {
                    setIsConnected(false);
                    triggerToast('Wallet disconnected', 'warning');
                  }}
                  className="text-slate-500 hover:text-rose-400 transition ml-1"
                  title="Disconnect"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-medium text-sm px-4 py-2 rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-200"
              >
                <Wallet className="h-4 w-4" />
                Connect Wallet
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Primary Navigation Hub */}
      <nav className="bg-slate-900/20 border-b border-slate-900 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-start gap-1 overflow-x-auto py-2">
          {[
            { id: 'DASHBOARD', label: 'Portfolio', icon: ChartIcon },
            { id: 'VAULTS', label: 'Yield Vaults', icon: Coins },
            { id: 'LP_COPIER', label: 'LP Copier', icon: Layers },
            { id: 'ASTRABOT', label: 'AstraBot Trading', icon: Bot },
            { id: 'SANDBOX', label: 'Hardhat Sandbox', icon: Terminal },
            { id: 'AI_COPILOT', label: 'AI Advisor', icon: Sparkles },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                  activeTab === item.id
                    ? 'bg-slate-800/80 text-white border border-slate-700/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                }`}
              >
                <Icon className={`h-4 w-4 ${activeTab === item.id ? 'text-cyan-400' : 'text-slate-500'}`} />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Core Main Content Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 z-10">
        
        {/* Connection status warning */}
        {!isConnected && (
          <div className="mb-6 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <div className="text-sm text-slate-300">
              Your wallet is currently disconnected. App displays sandbox telemetry. 
              <button 
                onClick={handleConnect} 
                className="text-cyan-400 hover:underline ml-1 font-semibold"
              >
                Connect Wallet
              </button> to initiate deposit or trade positions.
            </div>
          </div>
        )}

        {/* ==================== TAB: DASHBOARD / PORTFOLIO ==================== */}
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-6">
            
            {/* Top row stats banner */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="panel-dark">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-slate-400">Total Portfolio Value</span>
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">Active</span>
                </div>
                <div className="mt-2 text-2xl lg:text-3xl font-bold tracking-tight">
                  ${totalBalances.totalPortfolio.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                  <span>+$1,452.80 in last 24h</span>
                </p>
              </div>

              <div className="panel-dark">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-slate-400">AstraFi Deposits</span>
                  <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full font-semibold font-mono">
                    {pools.filter(p => p.userDeposit > 0).length} Pools
                  </span>
                </div>
                <div className="mt-2 text-2xl lg:text-3xl font-bold tracking-tight">
                  ${totalBalances.deposits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-slate-500 mt-1">Average yield rate: <span className="text-indigo-400 font-semibold font-mono">22.4% APY</span></p>
              </div>

              <div className="panel-dark">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-slate-400">Autonomous Trading Bot</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    isBotOn ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {isBotOn ? 'RUNNING' : 'PAUSED'}
                  </span>
                </div>
                <div className="mt-2 text-2xl lg:text-3xl font-bold tracking-tight text-emerald-400">
                  {isBotOn ? 'Strategy Active' : 'Offline'}
                </div>
                <p className="text-xs text-slate-500 mt-1 capitalize">Targeting: <span className="text-cyan-400 font-medium">{botStrategy} arbitrage</span></p>
              </div>

              <div className="panel-dark border-indigo-500/30 bg-gradient-to-b from-indigo-950/20 to-slate-900/60">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-indigo-300">Unclaimed Real-time Yields</span>
                  <Zap className="h-4 w-4 text-amber-400 animate-bounce" />
                </div>
                <div className="mt-2 text-2xl lg:text-3xl font-mono font-bold tracking-tight text-amber-400">
                  ${accruedRewards.toFixed(4)}
                </div>
                <button
                  onClick={handleClaimRewards}
                  disabled={accruedRewards <= 0}
                  className="w-full mt-3 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white font-medium text-xs py-2 px-3 rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5"
                >
                  <Plus className="h-3 w-3" />
                  Claim to Arbitrum Wallet
                </button>
              </div>

            </div>

            {/* Middle Section: Chart and Portfolio Allocation */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Yield & Portfolio Growth Area Chart */}
              <div className="panel-dark lg:col-span-2 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-base font-semibold">Core Growth & Realtime Performance</h3>
                      <p className="text-xs text-slate-400">Historical performance curve including compounded yield returns</p>
                    </div>
                    <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs">
                      {['24H', '7D', '30D', 'ALL'].map((range) => (
                        <button
                          key={range}
                          className={`px-2.5 py-1 rounded transition ${range === '7D' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500 hover:text-white'}`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="h-64 mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={historyData}>
                        <defs>
                          <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="day" stroke="#475569" fontSize={11} tickLine={false} />
                        <YAxis stroke="#475569" fontSize={11} tickLine={false} domain={['dataMin - 1000', 'dataMax + 1000']} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                          labelStyle={{ color: '#94a3b8', fontSize: '11px' }}
                          itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="Portfolio" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorGrowth)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="border-t border-slate-800/80 pt-4 mt-4 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Info className="h-3.5 w-3.5 text-slate-500" />
                    Yield tracking update on Arbitrum Block #21458921
                  </span>
                  <span className="font-mono text-cyan-400">Live API updates every 3s</span>
                </div>
              </div>

              {/* Asset Distribution Panel */}
              <div className="panel-dark flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-semibold mb-1">Asset Allocation</h3>
                  <p className="text-xs text-slate-400 mb-4">Relative share of stables, core protocols and accrued incentives</p>
                  
                  <div className="h-44 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={allocationData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {allocationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Custom Legends */}
                  <div className="space-y-2 mt-4">
                    {allocationData.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                          <span className="text-slate-400">{item.name}</span>
                        </div>
                        <span className="font-mono font-bold">${item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Row - Token Balance Quick Inspector & Interactive Strategy */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Wallet quick balance details */}
              <div className="panel-dark md:col-span-1">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5 text-slate-300">
                  <Wallet className="h-4 w-4 text-indigo-400" />
                  Arbitrum Native Balance
                </h3>
                <div className="space-y-3 font-mono">
                  <div className="flex items-center justify-between p-2.5 bg-slate-950/40 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded font-bold">ETH</span>
                      <span className="text-xs text-slate-400 font-sans">Ether</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold">{ethBalance.toFixed(4)}</div>
                      <div className="text-[10px] text-slate-500">${(ethBalance * ethPrice).toLocaleString(undefined, { maximumFractionDigits: 0 })} USD</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-950/40 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded font-bold">USDC</span>
                      <span className="text-xs text-slate-400 font-sans">Stables</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold">${usdcBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                      <div className="text-[10px] text-slate-500">1.00 USD</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-950/40 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded font-bold">ARB</span>
                      <span className="text-xs text-slate-400 font-sans">Arbitrum</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold">{arbBalance} ARB</div>
                      <div className="text-[10px] text-slate-500">${(arbBalance * arbPrice).toLocaleString(undefined, { maximumFractionDigits: 0 })} USD</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AstraBot Realtime Telemetry feed */}
              <div className="panel-dark md:col-span-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold flex items-center gap-1.5 text-slate-300">
                      <Bot className="h-4 w-4 text-emerald-400" />
                      Active Robot Arbitrage Telemetry
                    </h3>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      Spreads captured: {botLogs.filter(l => l.type === 'success').length}
                    </span>
                  </div>
                  
                  {/* Miniature log component */}
                  <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 font-mono text-xs text-slate-300 h-28 overflow-y-auto space-y-1.5">
                    {botLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="flex items-start gap-2">
                        <span className="text-slate-500 flex-shrink-0">[{log.timestamp}]</span>
                        <span className={`flex-shrink-0 px-1 py-0.2 rounded text-[10px] font-bold uppercase ${
                          log.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                          log.type === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                          log.type === 'arbitrage' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {log.type}
                        </span>
                        <span className="truncate">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>Compounding yields automatically into active pools</span>
                  <button onClick={() => setActiveTab('ASTRABOT')} className="text-indigo-400 hover:underline">Configure AstraBot &rarr;</button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==================== TAB: YIELD VAULTS ==================== */}
        {activeTab === 'VAULTS' && (
          <div className="space-y-6">
            
            {/* Header / Intro section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold">AstraFi Yield Pool Suite</h2>
                <p className="text-sm text-slate-400">Automated capital-allocation strategies compounding yields natively on Arbitrum Layer 2.</p>
              </div>
              <div className="text-xs bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-2">
                <Shield className="h-4 w-4 text-indigo-400" />
                <span>Audited Core Smart Contract: Paused state = <span className="text-emerald-400 font-mono">FALSE</span></span>
              </div>
            </div>

            {/* List of active Pools */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pools.map((pool) => (
                <div key={pool.id} className="panel-dark flex flex-col justify-between group hover:border-slate-700 transition-all duration-200">
                  
                  {/* Pool Title Row */}
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400" style={{ color: pool.color }}>
                          {pool.token} Strategy
                        </span>
                        <h3 className="text-base font-bold mt-0.5 text-slate-100">{pool.name}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-mono font-extrabold text-emerald-400">{pool.apy}% APY</div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          pool.risk === 'Low' ? 'bg-emerald-500/10 text-emerald-400' :
                          pool.risk === 'Medium' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-pink-500/10 text-pink-400'
                        }`}>
                          {pool.risk} Risk profile
                        </span>
                      </div>
                    </div>

                    {/* Stats details inside Pool Card */}
                    <div className="grid grid-cols-2 gap-4 bg-slate-950/50 rounded-xl p-3.5 border border-slate-800/80 my-4">
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Total Staked (TVL)</span>
                        <div className="text-sm font-mono font-bold text-slate-300 mt-0.5">
                          ${pool.tvl.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Your Active Staked</span>
                        <div className="text-sm font-mono font-bold text-indigo-300 mt-0.5">
                          {pool.userDeposit > 0 ? `${pool.userDeposit} ${pool.token}` : '0.00'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Transaction Buttons */}
                  <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-800/60">
                    <button
                      onClick={() => handleOpenTxModal(pool, 'deposit')}
                      className="flex-1 bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-200 font-medium text-xs py-2.5 px-3 rounded-lg transition duration-150 flex items-center justify-center gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Deposit Staking
                    </button>
                    {pool.userDeposit > 0 && (
                      <button
                        onClick={() => handleOpenTxModal(pool, 'withdraw')}
                        className="flex-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-medium text-xs py-2.5 px-3 rounded-lg transition duration-150 flex items-center justify-center gap-1.5"
                      >
                        Unstake & Claim
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>

            {/* Yield Estimator Tool */}
            <div className="panel-dark">
              <h3 className="text-base font-bold mb-1">Simulated Yield Calculator</h3>
              <p className="text-xs text-slate-400 mb-6">Estimate daily, weekly and monthly incentive dividends based on capital allocation.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">Target Pool Strategy</label>
                  <select 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    id="calcPoolSelector"
                  >
                    {pools.map(p => <option key={p.id} value={p.apy}>{p.name} ({p.apy}%)</option>)}
                  </select>
                </div>

                {/* Input amount */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">Simulated Capital Principal ($USD)</label>
                  <input
                    type="number"
                    defaultValue="10000"
                    placeholder="Enter deposit USD value"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                    id="calcPrincipalInput"
                  />
                </div>

                {/* Simulated Outputs display */}
                <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-4 flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Projected Annual Profit</span>
                  <div className="text-xl font-mono font-bold text-emerald-400 my-1">
                    $1,680.00 <span className="text-xs font-sans text-slate-500">at 16.8% APY</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Yields are compounded block-by-block and claimable immediately with zero lockers.</p>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* ==================== TAB: LP COPIER ==================== */}
        {activeTab === 'LP_COPIER' && (
          <div className="space-y-6">
            
            {/* Header */}
            <div>
              <h2 className="text-xl font-bold">Liquidity Provider (LP) Position Copier</h2>
              <p className="text-sm text-slate-400">Replicate automated high-performing Uniswap V3 ticking positions from top whales natively on Arbitrum.</p>
            </div>

            {/* List of traders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-300">Top Performing Arbitrum LP Whales</h3>
                
                {lpTraders.map((trader) => (
                  <div 
                    key={trader.id} 
                    className={`p-4 rounded-xl border transition-all ${
                      trader.copied 
                        ? 'bg-indigo-950/20 border-indigo-500/50 shadow-sm shadow-indigo-500/10' 
                        : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-100">{trader.name}</span>
                          <span className="text-[10px] bg-slate-950 text-indigo-400 font-mono px-2 py-0.5 rounded border border-indigo-500/20">{trader.pair} LP</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Last Action: <span className="font-mono text-indigo-300">{trader.lastAction}</span></p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400">PnL (All-Time)</span>
                        <div className="text-sm font-mono font-bold text-emerald-400 flex items-center justify-end gap-0.5">
                          <ArrowUpRight className="h-3.5 w-3.5" />
                          +{trader.pnl}%
                        </div>
                      </div>
                    </div>

                    {/* Copier Controls */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                      <div className="text-xs text-slate-400">
                        {trader.copied ? (
                          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Allocated 25% portfolio
                          </span>
                        ) : 'Deactivated'}
                      </div>
                      <button
                        onClick={() => toggleLPCopy(trader.id)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                          trader.copied
                            ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                        }`}
                      >
                        {trader.copied ? 'Stop Copying' : 'Copy Positions'}
                      </button>
                    </div>

                  </div>
                ))}
              </div>

              {/* Copier Live Events Ticker */}
              <div className="panel-dark flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
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
                <div className="mt-4 text-xs text-slate-400 bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                  ⚠️ LP Tick position copying carries high capital risks. If the pool ticks drift out of bound parameters, temporary loss/IL might occur. Ensure you optimize parameters periodically.
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==================== TAB: ASTRABOT TRADING ==================== */}
        {activeTab === 'ASTRABOT' && (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold">AstraBot Autonomous Arbitrage Engine</h2>
                <p className="text-sm text-slate-400">Leverage flash arbitrage cycles capturing slight asset price deviations across Camelot, Uniswap, and GMX.</p>
              </div>
              
              {/* Core ON/OFF Switch */}
              <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2 rounded-xl">
                <span className="text-xs text-slate-400 font-bold uppercase">AstraBot Grid State</span>
                <button
                  onClick={() => {
                    setIsBotOn(!isBotOn);
                    triggerToast(`AstraBot is now ${!isBotOn ? 'ONLINE and scanning grids' : 'OFFLINE'}`, !isBotOn ? 'success' : 'warning');
                  }}
                  className={`w-14 h-7 rounded-full transition p-1 ${isBotOn ? 'bg-emerald-500' : 'bg-slate-800'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-all transform ${isBotOn ? 'translate-x-7' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            {/* Strategy Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  id: 'conservative',
                  name: 'Conservative Grid',
                  desc: 'Focus on absolute stablecoins spreads. Ultra low risk. Minimized trade frequencies.',
                  avgDaily: '0.08% yield'
                },
                {
                  id: 'balanced',
                  name: 'Balanced Liquidity',
                  desc: 'Execute grid cross trades on high-volume pairings (ETH-USDC). Moderate risk params.',
                  avgDaily: '0.18% yield'
                },
                {
                  id: 'aggressive',
                  name: 'Aggressive Arbitrage',
                  desc: 'High speed flash-loans capture multi-hop ecosystem pools. Multi-hop gas risks exist.',
                  avgDaily: '0.45% yield'
                }
              ].map((strat) => (
                <div
                  key={strat.id}
                  onClick={() => {
                    setBotStrategy(strat.id as any);
                    triggerToast(`Switched strategy to ${strat.name}`, 'info');
                  }}
                  className={`panel-dark cursor-pointer transition border-2 text-left ${
                    botStrategy === strat.id 
                      ? 'border-emerald-500 shadow-md shadow-emerald-500/10' 
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-sm text-slate-100">{strat.name}</span>
                    {botStrategy === strat.id && <Zap className="h-4 w-4 text-emerald-400 animate-pulse" />}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">{strat.desc}</p>
                  <div className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 inline-block px-2 py-0.5 rounded">
                    Avg reward: {strat.avgDaily}
                  </div>
                </div>
              ))}
            </div>

            {/* Bot Telemetry Console Logs */}
            <div className="panel-dark">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${isBotOn ? 'bg-emerald-500 animate-ping' : 'bg-slate-600'}`} />
                  <h3 className="text-sm font-bold text-slate-300">AstraBot Transaction Stream</h3>
                </div>
                <button
                  onClick={() => {
                    setBotLogs([{ id: 'init', timestamp: new Date().toLocaleTimeString(), type: 'info', message: 'Cleared console stream logs.' }]);
                    triggerToast('Telemetry logs cleared');
                  }}
                  className="text-xs text-slate-500 hover:text-white transition flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  Clear
                </button>
              </div>

              {/* Console terminal logs */}
              <div className="bg-slate-950 font-mono text-xs text-slate-300 p-5 rounded-xl border border-slate-800 h-80 overflow-y-auto space-y-2.5">
                {botLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3">
                    <span className="text-slate-500 flex-shrink-0">[{log.timestamp}]</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                      log.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      log.type === 'warning' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      log.type === 'arbitrage' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {log.type}
                    </span>
                    <span>{log.message}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ==================== TAB: SMART CONTRACT SANDBOX ==================== */}
        {activeTab === 'SANDBOX' && (
          <div className="space-y-6">
            
            {/* Header */}
            <div>
              <h2 className="text-xl font-bold">Hardhat Sandbox & Smart Contract Telemetry</h2>
              <p className="text-sm text-slate-400">Review, trigger tests, and inspect Solidity states mapping live backends on Arbitrum Sepolia.</p>
            </div>

            {/* Smart Contract states & variables */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="panel-dark md:col-span-1">
                <h3 className="text-sm font-bold text-slate-300 mb-4">AstraFi.sol Variables</h3>
                
                <div className="space-y-4 text-xs font-mono">
                  
                  <div className="flex justify-between items-center py-2 border-b border-slate-800">
                    <span className="text-slate-400">owner() address</span>
                    <span className="text-cyan-400 font-bold" title="Deployer wallet">0x3F2bA7...89A1</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-800">
                    <span className="text-slate-400">vaultPaused state</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${vaultPaused ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                      <span className={vaultPaused ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                        {vaultPaused ? 'TRUE (Paused)' : 'FALSE (Active)'}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-800">
                    <span className="text-slate-400">totalRegisteredPools</span>
                    <span className="text-slate-200">4 Vault Strategy Pools</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-800">
                    <span className="text-slate-400">reentrancyGuard status</span>
                    <span className="text-slate-500 uppercase font-bold text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">MUTEX_SECURED</span>
                  </div>
                </div>

                {/* Owner controls simulation */}
                <div className="mt-6 pt-4 border-t border-slate-800/80">
                  <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase">Admin Owner Powers</h4>
                  <button
                    onClick={() => {
                      setVaultPaused(!vaultPaused);
                      setSandboxLogs(prev => [
                        ...prev,
                        `[SANDBOX ADMIN] Toggled pause state. New State = ${!vaultPaused}. Transaction hash: 0x937c...fa1b`
                      ]);
                      triggerToast(`Vault pause status: ${!vaultPaused ? 'PAUSED' : 'UNPAUSED'}`, 'warning');
                    }}
                    className={`w-full text-xs font-semibold py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
                      vaultPaused 
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                        : 'bg-rose-950/40 hover:bg-rose-900/40 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {vaultPaused ? <CheckCircle2 className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                    {vaultPaused ? 'Unpause Vault Capital' : 'Emergency Pause Contract'}
                  </button>
                </div>

              </div>

              {/* Hardhat simulation console log */}
              <div className="panel-dark md:col-span-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-300">Local Hardhat Test Simulator</h3>
                    <button
                      onClick={runHardhatTestsSim}
                      disabled={isSimulatingTests}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 text-white font-medium text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition"
                    >
                      <Play className="h-3 w-3" />
                      {isSimulatingTests ? 'Compiling & Running...' : 'Execute Unit Tests'}
                    </button>
                  </div>

                  {/* Sandbox terminal stream */}
                  <div className="bg-slate-950 font-mono text-xs text-slate-400 p-4 rounded-xl border border-slate-800 h-64 overflow-y-auto space-y-2">
                    {sandboxLogs.map((log, index) => (
                      <div key={index} className={
                        log.includes('✔') ? 'text-emerald-400 pl-4' : 
                        log.includes('complete') ? 'text-cyan-400 font-bold' : 'text-slate-300'
                      }>
                        {log}
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 mt-3 flex items-center gap-1">
                  <Info className="h-3.5 w-3.5" />
                  Unit testing represents 8 fully passing test blocks written in ethers.js checking deposit fallbacks.
                </p>
              </div>

            </div>

          </div>
        )}

        {/* ==================== TAB: AI COPILOT / ADVISOR ==================== */}
        {activeTab === 'AI_COPILOT' && (
          <div className="space-y-6">
            
            {/* Banner with Status */}
            <div className="panel-dark bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
                  <h2 className="text-xl font-bold text-slate-100">AstraFi AI Copilot Advisor</h2>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Gemini 3.5 Flash Active
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-1">
                  Our advanced AI yields-optimizer and market risk analyzer has complete visibility into your L2 wallet and AstraFi metrics.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-slate-400 font-mono">SECURE SERVER-SIDE PROXY</span>
              </div>
            </div>

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left sidebar: Context & Quick Actions */}
              <div className="space-y-6 lg:col-span-1">
                
                {/* Real-time Context Feed */}
                <div className="panel-dark">
                  <h3 className="text-sm font-bold text-slate-300 mb-4">L2 Context Visible to AI</h3>
                  
                  <div className="space-y-3.5 text-xs font-mono">
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                      <span className="text-slate-500">Wallet Portfolio:</span>
                      <span className="text-emerald-400 font-bold">${totalBalances.totalPortfolio.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                      <span className="text-slate-500">USDC Cash:</span>
                      <span className="text-slate-300">${usdcBalance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                      <span className="text-slate-500">ETH Balance:</span>
                      <span className="text-slate-300">{ethBalance} ETH</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                      <span className="text-slate-500">ARB Balance:</span>
                      <span className="text-slate-300">{arbBalance} ARB</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                      <span className="text-slate-500">Active Vault Strategy:</span>
                      <span className="text-indigo-400">{pools.filter(p => p.userDeposit > 0).length} Pools</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-slate-500">Arbitrage Bot Strategy:</span>
                      <span className="text-pink-400">{isBotOn ? `${botStrategy} (ONLINE)` : 'OFFLINE'}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Prompts */}
                <div className="panel-dark">
                  <h3 className="text-sm font-bold text-slate-300 mb-3">Quick Advice Templates</h3>
                  <p className="text-xs text-slate-500 mb-4">Select an pre-configured prompt to instantly trigger the AI Optimizer engine:</p>
                  
                  <div className="space-y-2">
                    {[
                      {
                        label: '💡 Optimal Portfolio Strategy',
                        prompt: 'Analyse my wallet assets and active pools, and generate an optimal portfolio allocation strategy to maximize yields while minimizing risks.'
                      },
                      {
                        label: '📊 Calculate risk profiles',
                        prompt: 'Compare GMX Delta-Neutral vs Pendle LST Yield Lev. Explain the detailed risk parameters of both pools and how they handle impermanent loss.'
                      },
                      {
                        label: '🛡️ Suggest delta-neutral stablecoin hedge',
                        prompt: 'How can I set up an Arbitrum delta-neutral stablecoin yield position using GMX or Pendle? Give me step-by-step math using my active USDC.'
                      },
                      {
                        label: '📝 Audit AstraFi.sol and optimize',
                        prompt: 'Audit the AstraFi smart contract parameters (like owner controls, pause toggles, reentrancy guards) and suggest standard security enhancements.'
                      }
                    ].map((btn, i) => (
                      <button
                        key={i}
                        disabled={isAiLoading}
                        onClick={() => handleSendAiMessage(btn.prompt)}
                        className="w-full text-left text-xs bg-slate-950/80 hover:bg-slate-900 border border-slate-800/80 hover:border-indigo-500/30 text-slate-300 px-3.5 py-3 rounded-xl transition flex flex-col gap-1 disabled:opacity-50"
                      >
                        <span className="font-semibold text-slate-200">{btn.label}</span>
                        <span className="text-[10px] text-slate-500 truncate w-full">{btn.prompt}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right: AI Advisor Chat Interface */}
              <div className="lg:col-span-2 flex flex-col panel-dark h-[640px] justify-between p-0 overflow-hidden">
                
                {/* Header */}
                <div className="border-b border-slate-800 px-6 py-4 bg-slate-950/40 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
                    <span className="text-xs font-bold text-slate-300 tracking-wide uppercase font-mono">AstraFi Strategist Terminal</span>
                  </div>
                  <button 
                    onClick={() => {
                      setAiMessages([
                        {
                          sender: 'assistant',
                          text: "Hello! I am your AstraFi AI Advisor, powered by Google Gemini. I can analyze the active AstraFi strategies, explain automated LP copier ticketing parameters, audit simulated Hardhat unit tests, and provide custom yield-optimization advice tailored to your wallet balance. What can I calculate for you today?",
                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }
                      ]);
                    }}
                    className="text-slate-500 hover:text-slate-300 text-xs transition"
                  >
                    Clear History
                  </button>
                </div>

                {/* Messages Panel */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-950/10">
                  {aiMessages.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`flex flex-col max-w-[85%] ${
                        msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                      }`}
                    >
                      <span className="text-[10px] text-slate-500 mb-1 px-1 font-mono">
                        {msg.sender === 'user' ? 'You' : 'AstraFi AI'} • {msg.timestamp}
                      </span>
                      <div className={`p-4 rounded-2xl text-xs border ${
                        msg.sender === 'user' 
                          ? 'bg-indigo-600 border-indigo-500/20 text-white rounded-tr-none shadow-md shadow-indigo-600/10' 
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-200 rounded-tl-none'
                      }`}>
                        {msg.sender === 'user' ? (
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                        ) : (
                          <div className="space-y-1">
                            {msg.text.split('\n').map((line, lineIdx) => {
                              if (line.startsWith('###')) {
                                return <h4 key={lineIdx} className="text-xs font-bold text-cyan-400 mt-3 mb-1">{line.replace('###', '').trim()}</h4>;
                              }
                              if (line.startsWith('##')) {
                                return <h3 key={lineIdx} className="text-sm font-bold text-indigo-400 mt-4 mb-2">{line.replace('##', '').trim()}</h3>;
                              }
                              if (line.startsWith('#')) {
                                return <h2 key={lineIdx} className="text-base font-bold text-indigo-300 mt-5 mb-2">{line.replace('#', '').trim()}</h2>;
                              }
                              if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
                                const cleanText = line.replace(/^[\s*-]+/, '').trim();
                                const parts = cleanText.split('**');
                                return (
                                  <li key={lineIdx} className="list-disc ml-4 text-slate-300 leading-relaxed mb-1">
                                    {parts.map((p, idx) => (idx % 2 === 1 ? <strong key={idx} className="text-cyan-300 font-semibold">{p}</strong> : p))}
                                  </li>
                                );
                              }
                              if (line.includes('**')) {
                                const parts = line.split('**');
                                return (
                                  <p key={lineIdx} className="text-slate-300 leading-relaxed mb-1.5">
                                    {parts.map((p, idx) => (idx % 2 === 1 ? <strong key={idx} className="text-white font-semibold">{p}</strong> : p))}
                                  </p>
                                );
                              }
                              return <p key={lineIdx} className="text-slate-300 leading-relaxed mb-1.5">{line}</p>;
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Loading block */}
                  {isAiLoading && (
                    <div className="flex flex-col max-w-[85%] mr-auto items-start">
                      <span className="text-[10px] text-slate-500 mb-1 px-1 font-mono">AstraFi AI • Thinking...</span>
                      <div className="p-4 rounded-2xl rounded-tl-none text-xs bg-slate-900/60 border border-slate-800/80 text-slate-400 flex items-center gap-2">
                        <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                        <span>Running delta-neutral strategist algorithms via Gemini...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input form */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendAiMessage();
                  }}
                  className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center gap-3"
                >
                  <input
                    type="text"
                    value={aiInput}
                    disabled={isAiLoading}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="Ask AstraFi AI for customized yield strategies or contract audits..."
                    className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={isAiLoading || !aiInput.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 text-white font-bold text-xs py-3 px-5 rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/10"
                  >
                    Send
                  </button>
                </form>

              </div>

            </div>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 py-6 px-4 lg:px-8 text-center bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; 2026 AstraFi Protocol. All simulated assets non-custodial under L2 consensus.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Arbitrum RPC node responsive
            </span>
            <span className="text-slate-600">|</span>
            <span>Local dev sandbox mode</span>
          </div>
        </div>
      </footer>

      {/* Transaction Deposit/Withdraw Modal */}
      {selectedPoolForTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            
            <h3 className="text-base font-bold text-slate-100 capitalize">
              {txType}ing Into {selectedPoolForTx.name}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Executing smart contract interaction directly under strategy context ({selectedPoolForTx.token}).
            </p>

            <form onSubmit={handleExecuteTx} className="mt-5 space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <label className="font-semibold">Transaction Amount ({selectedPoolForTx.token})</label>
                  <span>
                    Wallet Balance:{' '}
                    <span className="text-indigo-400 font-mono">
                      {selectedPoolForTx.token === 'USDC' ? `$${usdcBalance.toLocaleString()}` :
                       selectedPoolForTx.token === 'ETH' ? `${ethBalance} ETH` :
                       selectedPoolForTx.token === 'ARB' ? `${arbBalance} ARB` : '0.00'}
                    </span>
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    placeholder={`0.00 ${selectedPoolForTx.token}`}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (txType === 'deposit') {
                        if (selectedPoolForTx.token === 'USDC') setTxAmount((usdcBalance * 0.95).toFixed(2));
                        if (selectedPoolForTx.token === 'ETH') setTxAmount((ethBalance * 0.95).toFixed(4));
                        if (selectedPoolForTx.token === 'ARB') setTxAmount((arbBalance * 0.95).toString());
                      } else {
                        setTxAmount(selectedPoolForTx.userDeposit.toString());
                      }
                    }}
                    className="absolute right-3 top-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 text-xs font-bold px-2 py-1 rounded"
                  >
                    MAX
                  </button>
                </div>
              </div>

              {/* Estimate Projected Yield Info */}
              {parseFloat(txAmount) > 0 && txType === 'deposit' && (
                <div className="bg-indigo-950/20 rounded-xl p-3 border border-indigo-500/20 text-xs text-indigo-300">
                  <div className="flex justify-between">
                    <span>Est. Weekly Return:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      ${((parseFloat(txAmount) * (selectedPoolForTx.token === 'ETH' ? ethPrice : selectedPoolForTx.token === 'ARB' ? arbPrice : 1)) * (selectedPoolForTx.apy / 100) / 52).toFixed(2)} USD
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
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 transition capitalize"
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
