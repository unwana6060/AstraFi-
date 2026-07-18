import { DiscoverPoolItem, StoreTierItem } from './types';

export const DISCOVER_POOLS: DiscoverPoolItem[] = [
  { name: 'SAYLOR / SOL', status: 'Dead', vol1h: '$1.43M', fees1h: '$0', tvl: '$0', mcap: '$584k', score: 50, price: '$0.0005842', hasLp: false },
  { name: 'Vaaland / SOL', status: 'Low Liq', vol1h: '$191k', fees1h: '-', tvl: '$54k', mcap: '$412k', score: 10, price: '$0.0004118', hasLp: false },
  { name: 'CZBULL / SOL', status: 'Low Liq', vol1h: '$191k', fees1h: '-', tvl: '$22k', mcap: '$78k', score: 15, price: '$0.00007836', hasLp: false },
  { name: 'ANSEM / SOL', status: 'Active', vol1h: '$530k', fees1h: '$966', tvl: '$3.52M', mcap: '$402.2M', score: 37, price: '$0.4021', hasLp: true },
  { name: 'BULL / SOL', status: 'Low Liq', vol1h: '$4k', fees1h: '$3', tvl: '$13k', mcap: '$1.37M', score: 28, price: '$0.01372', hasLp: true },
  { name: 'LEVI / SOL', status: 'Active', vol1h: '$437k', fees1h: '$676', tvl: '$178k', mcap: '$12.4M', score: 38, price: '$0.0124', hasLp: true },
  { name: 'BLACKOUT / SOL', status: 'Dead', vol1h: '$35k', fees1h: '-', tvl: '$0', mcap: '$151k', score: 35, price: '$0.0001513', hasLp: false },
  { name: 'CATWIF / USDC', status: 'Low Liq', vol1h: '$106k', fees1h: '$54', tvl: '$65k', mcap: '$1.22M', score: 38, price: '$0.001269', hasLp: true },
  { name: 'MENSA / SOL', status: 'Active', vol1h: '$215k', fees1h: '$2k', tvl: '$327k', mcap: '$5.82M', score: 31, price: '$0.0002473', hasLp: true },
];

export const STORE_TIERS: StoreTierItem[] = [
  {
    name: 'Tester Bot',
    price: 3,
    features: [
      '1,000 dPro scans',
      'Manual LP positions enabled',
      'Copy LP: Recommended LP pairings only'
    ]
  },
  {
    name: 'D-Protocol Basic',
    price: 15,
    features: [
      '5,000 dPro scans',
      'Basic autonomous bot active',
      'Manual LP positions enabled',
      'Slippage protection standard'
    ],
    popular: false
  },
  {
    name: 'D-Protocol Starter',
    price: 55,
    features: [
      '12,000 dPro scans',
      '5 max concurrent pools',
      '$1,250 max capital input',
      'Priority routing parameters'
    ],
    popular: false
  },
  {
    name: 'D-Protocol Growth',
    price: 150,
    features: [
      'Everything in Starter, plus:',
      '75,000 dPro scans',
      'Copy LPing access enabled',
      'Autonomous scanner execution',
      '10 max concurrent pools',
      '$2,500 max capital input'
    ],
    popular: true
  },
  {
    name: 'D-Protocol Pro',
    price: 250,
    features: [
      'Everything in Growth, plus:',
      '220,000 dPro scans',
      '15 max concurrent pools',
      '$5,000 max capital input',
      'Free DeFi Speed premium routing',
      'AstraFi D-VIP 2 priority access'
    ]
  },
  {
    name: 'D-Protocol Elite',
    price: 400,
    features: [
      'Everything in Pro, plus:',
      '395,000 dPro scans',
      '25 max concurrent pools',
      '$10,000 max capital input',
      'Free DeFi Speed 3 (Fastest)',
      'AstraFi D-VIP 3 priority rewards'
    ]
  }
];
