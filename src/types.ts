export interface VaultPool {
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

export interface LPTrader {
  id: string;
  name: string;
  pair: string;
  pnl: number;
  copied: boolean;
  allocation: number;
  lastAction: string;
}

export interface BotLog {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'arbitrage';
  message: string;
}

export interface PositionItem {
  id: string;
  name: string;
  status: 'In Range' | 'Out of Range' | 'Closed';
  currentValue: number;
  pnlDollar: number;
  pnlPercent: number;
  investedAmount: number;
  type: 'Bot' | 'Manual';
  depositStrategy: 'Two-sided' | 'Quote only' | 'Base only';
  timestamp: string;
}

export interface DiscoverPoolItem {
  name: string;
  status: 'Active' | 'Low Liq' | 'Dead';
  vol1h: string;
  fees1h: string;
  tvl: string;
  mcap: string;
  score: number;
  price: string;
  hasLp: boolean;
}

export interface StoreTierItem {
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
}
