import React from 'react';
import { Sparkles, RefreshCw, Send } from 'lucide-react';
import { VaultPool, LPTrader } from '../types';

interface AiAdvisorProps {
  aiMessages: { sender: 'user' | 'assistant'; text: string; timestamp: string }[];
  aiInput: string;
  setAiInput: (val: string) => void;
  isAiLoading: boolean;
  aiError: string | null;
  handleSendAiMessage: (customPrompt?: string) => void;
  setAiMessages: React.Dispatch<React.SetStateAction<{ sender: 'user' | 'assistant'; text: string; timestamp: string }[]>>;
  totalPortfolio: number;
  usdcBalance: number;
  ethBalance: number;
  arbBalance: number;
  pools: VaultPool[];
  isBotOn: boolean;
  botStrategy: string;
}

export default function AiAdvisor({
  aiMessages,
  aiInput,
  setAiInput,
  isAiLoading,
  aiError,
  handleSendAiMessage,
  setAiMessages,
  totalPortfolio,
  usdcBalance,
  ethBalance,
  arbBalance,
  pools,
  isBotOn,
  botStrategy
}: AiAdvisorProps) {
  return (
    <div className="space-y-6">
      <div className="panel-dark bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/20 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-400 animate-pulse" />
            <h2 className="text-xl font-bold text-slate-100">AstraFi AI Copilot Advisor</h2>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Gemini 3.5 Flash Active
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Our advanced AI yield-optimizer and risk analyzer has complete visibility into your L2 wallet and AstraFi metrics.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-slate-400 font-mono">SECURE SERVER-SIDE PROXY</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6 lg:col-span-1">
          <div className="panel-dark">
            <h3 className="text-sm font-bold text-slate-300 mb-4">L2 Context Visible to AI</h3>
            <div className="space-y-3.5 text-xs font-mono">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-500">Wallet Portfolio:</span>
                <span className="text-emerald-400 font-bold">${totalPortfolio.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-500">USDC Cash:</span>
                <span className="text-slate-300">${usdcBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-500">ETH Balance:</span>
                <span className="text-slate-300">{ethBalance.toFixed(4)} ETH</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-500">ARB Balance:</span>
                <span className="text-slate-300">{arbBalance} ARB</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-500">Active Vault Strategy:</span>
                <span className="text-emerald-400">{pools.filter(p => p.userDeposit > 0).length} Pools</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-500">Arbitrage Bot Strategy:</span>
                <span className="text-emerald-400">{isBotOn ? `${botStrategy} (ONLINE)` : 'OFFLINE'}</span>
              </div>
            </div>
          </div>

          <div className="panel-dark">
            <h3 className="text-sm font-bold text-slate-300 mb-3">Quick Advice Templates</h3>
            <p className="text-xs text-slate-500 mb-4">Select a pre-configured prompt to instantly trigger the AI Optimizer engine:</p>
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
                  className="w-full text-left text-xs bg-slate-950/80 hover:bg-slate-900 border border-slate-800/80 hover:border-emerald-500/30 text-slate-300 px-3.5 py-3 rounded-xl transition flex flex-col gap-1 disabled:opacity-50"
                >
                  <span className="font-semibold text-slate-200">{btn.label}</span>
                  <span className="text-[10px] text-slate-500 truncate w-full">{btn.prompt}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col panel-dark h-[640px] justify-between p-0 overflow-hidden">
          <div className="border-b border-slate-800/80 px-6 py-4 bg-slate-950/40 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
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
                    ? 'bg-emerald-600/90 border-emerald-500/20 text-white rounded-tr-none shadow-md shadow-emerald-600/10'
                    : 'bg-[#15151b] border-slate-800/80 text-slate-200 rounded-tl-none'
                }`}>
                  {msg.sender === 'user' ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  ) : (
                    <div className="space-y-1">
                      {msg.text.split('\n').map((line, lineIdx) => {
                        if (line.startsWith('###')) {
                          return <h4 key={lineIdx} className="text-xs font-bold text-emerald-400 mt-3 mb-1">{line.replace('###', '').trim()}</h4>;
                        }
                        if (line.startsWith('##')) {
                          return <h3 key={lineIdx} className="text-sm font-bold text-emerald-500 mt-4 mb-2">{line.replace('##', '').trim()}</h3>;
                        }
                        if (line.startsWith('#')) {
                          return <h2 key={lineIdx} className="text-base font-bold text-slate-100 mt-5 mb-2">{line.replace('#', '').trim()}</h2>;
                        }
                        if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
                          const cleanText = line.replace(/^[\s*-]+/, '').trim();
                          const parts = cleanText.split('**');
                          return (
                            <li key={lineIdx} className="list-disc ml-4 text-slate-300 leading-relaxed mb-1">
                              {parts.map((p, idx) => (idx % 2 === 1 ? <strong key={idx} className="text-emerald-400 font-semibold">{p}</strong> : p))}
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

            {isAiLoading && (
              <div className="flex flex-col max-w-[85%] mr-auto items-start">
                <span className="text-[10px] text-slate-500 mb-1 px-1 font-mono">AstraFi AI • Thinking...</span>
                <div className="p-4 rounded-2xl rounded-tl-none text-xs bg-[#15151b] border border-slate-800/80 text-slate-400 flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                  <span>Running delta-neutral strategist algorithms via Gemini...</span>
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendAiMessage();
            }}
            className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex items-center gap-3"
          >
            <input
              type="text"
              value={aiInput}
              disabled={isAiLoading}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Ask AstraFi AI for customized yield strategies or contract audits..."
              className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isAiLoading || !aiInput.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-800 text-black font-bold text-xs py-3 px-5 rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/10"
            >
              <Send className="h-3.5 w-3.5" />
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
