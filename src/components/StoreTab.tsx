import React from 'react';
import { ShoppingBag, Check, Lock } from 'lucide-react';
import { STORE_TIERS } from '../data';

interface StoreTabProps {
  currentTier: string;
  onSubscribe: (tierName: string, price: number) => void;
}

export default function StoreTab({ currentTier, onSubscribe }: StoreTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Premium dPro Store & Whitelist Licenses</h2>
        <p className="text-sm text-slate-400">Unlock autonomous grid volume, higher spending limits, and faster transaction priority routing paths.</p>
      </div>

      {/* Grid of Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {STORE_TIERS.map((tier) => {
          const isActive = currentTier === tier.name;
          return (
            <div
              key={tier.name}
              className={`panel-dark flex flex-col justify-between relative ${
                isActive
                  ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/5 bg-gradient-to-b from-emerald-950/10 to-transparent'
                  : tier.popular
                  ? 'border-[#2a2a38] bg-[#14141c]'
                  : 'bg-[#101014]'
              }`}
            >
              {tier.popular && (
                <span className="absolute top-3 right-3 text-[9px] font-bold text-black bg-emerald-400 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Popular Strategy
                </span>
              )}

              <div>
                <h3 className="text-base font-bold text-slate-100">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mt-2.5">
                  <span className="text-2xl font-extrabold text-slate-100 font-mono">${tier.price}</span>
                  <span className="text-xs text-slate-500">USDC / life</span>
                </div>

                <ul className="space-y-2 mt-5 border-t border-slate-800/80 pt-4 text-xs text-slate-400">
                  {tier.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-2">
                <button
                  onClick={() => onSubscribe(tier.name, tier.price)}
                  disabled={isActive}
                  className={`w-full text-xs font-bold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
                    isActive
                      ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-black shadow-md'
                  }`}
                >
                  {isActive ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
                  {isActive ? 'Current Subscription Active' : `Buy for $${tier.price} USDC`}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
