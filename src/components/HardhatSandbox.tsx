import React from 'react';
import { Shield, Play, ShieldAlert, CheckCircle2, Info } from 'lucide-react';

interface HardhatSandboxProps {
  isLiveMode: boolean;
  liveContractAddress: string;
  setLiveContractAddress: (val: string) => void;
  liveStakingTokenAddress: string;
  setLiveStakingTokenAddress: (val: string) => void;
  liveRewardTokenAddress: string;
  setLiveRewardTokenAddress: (val: string) => void;
  isConnected: boolean;
  vaultPaused: boolean;
  setVaultPaused: (val: boolean) => void;
  sandboxLogs: string[];
  setSandboxLogs: React.Dispatch<React.SetStateAction<string[]>>;
  isSimulatingTests: boolean;
  runHardhatTestsSim: () => void;
  loadLiveBlockchainData: () => void;
  triggerToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export default function HardhatSandbox({
  isLiveMode,
  liveContractAddress,
  setLiveContractAddress,
  liveStakingTokenAddress,
  setLiveStakingTokenAddress,
  liveRewardTokenAddress,
  setLiveRewardTokenAddress,
  isConnected,
  vaultPaused,
  setVaultPaused,
  sandboxLogs,
  setSandboxLogs,
  isSimulatingTests,
  runHardhatTestsSim,
  loadLiveBlockchainData,
  triggerToast
}: HardhatSandboxProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Hardhat Sandbox & Smart Contract Telemetry</h2>
        <p className="text-sm text-slate-400">Review, trigger tests, and inspect Solidity states mapping live backends on Arbitrum Sepolia.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="panel-dark lg:col-span-1">
          <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-emerald-400" />
            {isLiveMode ? 'Live Web3 Configuration' : 'Simulated Sandbox Variables'}
          </h3>

          {isLiveMode ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Specify your deployed contract addresses on Arbitrum Sepolia or Arbitrum One to interact on-chain.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">AstraFi Contract Address</label>
                  <input
                    type="text"
                    value={liveContractAddress}
                    onChange={(e) => {
                      setLiveContractAddress(e.target.value);
                      localStorage.setItem('astrafi_contract_address', e.target.value);
                    }}
                    placeholder="0x..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Staking Token (USDC) Address</label>
                  <input
                    type="text"
                    value={liveStakingTokenAddress}
                    onChange={(e) => {
                      setLiveStakingTokenAddress(e.target.value);
                      localStorage.setItem('astrafi_staking_token_address', e.target.value);
                    }}
                    placeholder="0x..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Reward Token (AIR) Address</label>
                  <input
                    type="text"
                    value={liveRewardTokenAddress}
                    onChange={(e) => {
                      setLiveRewardTokenAddress(e.target.value);
                      localStorage.setItem('astrafi_reward_token_address', e.target.value);
                    }}
                    placeholder="0x..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  triggerToast('Contract configurations saved to local storage!', 'success');
                  loadLiveBlockchainData();
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-black font-bold text-xs py-2 px-3 rounded-lg transition"
              >
                Apply & Load On-Chain Data
              </button>

              <div className="pt-2 border-t border-slate-800/60 text-[10px] text-slate-500 flex flex-col gap-1">
                <div className="flex justify-between">
                  <span>On-Chain Sync State:</span>
                  <span className={isConnected && liveContractAddress ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                    {isConnected && liveContractAddress ? 'SYNCED' : 'WAITING_FOR_CONTRACT'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3 text-xs font-mono">
                <div className="flex justify-between items-center py-2 border-b border-slate-800/80">
                  <span className="text-slate-400 font-sans">owner() address</span>
                  <span className="text-emerald-400 font-bold" title="Deployer wallet">0x3F2bA7...89A1</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-800/80">
                  <span className="text-slate-400 font-sans">vaultPaused state</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${vaultPaused ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                    <span className={vaultPaused ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {vaultPaused ? 'TRUE (Paused)' : 'FALSE (Active)'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-800/80">
                  <span className="text-slate-400 font-sans">totalRegisteredPools</span>
                  <span className="text-slate-200">4 Vault Strategy Pools</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-800/80">
                  <span className="text-slate-400 font-sans">reentrancyGuard status</span>
                  <span className="text-slate-500 uppercase font-bold text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">MUTEX_SECURED</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80">
                <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Admin Owner Powers</h4>
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
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-black font-bold'
                      : 'bg-rose-950/20 hover:bg-rose-900/20 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {vaultPaused ? <CheckCircle2 className="h-4 w-4 text-black" /> : <ShieldAlert className="h-4 w-4 text-rose-400" />}
                  {vaultPaused ? 'Unpause Vault Capital' : 'Emergency Pause Contract'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="panel-dark lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-300">
                {isLiveMode ? 'Arbitrum Sepolia Live Deployment Guide' : 'Local Hardhat Test Simulator'}
              </h3>
              {!isLiveMode && (
                <button
                  onClick={runHardhatTestsSim}
                  disabled={isSimulatingTests}
                  className="bg-emerald-600 hover:bg-emerald-700 text-black font-semibold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition"
                >
                  <Play className="h-3 w-3 fill-black" />
                  {isSimulatingTests ? 'Compiling & Running...' : 'Execute Unit Tests'}
                </button>
              )}
            </div>

            {isLiveMode ? (
              <div className="space-y-4 text-xs">
                <p className="text-slate-400">
                  Follow these steps to deploy AstraFi smart contracts securely onto Arbitrum Sepolia using your local machine:
                </p>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 font-mono text-slate-300 space-y-3.5">
                  <div>
                    <div className="text-emerald-400 font-bold mb-1">Step 1: Configure Environment Variables</div>
                    <p className="text-slate-400 text-[11px] mb-1">Open the <span className="text-amber-400">/blockchain/.env</span> file and enter your Sepolia deployer private key:</p>
                    <code className="block bg-slate-900 px-3 py-1.5 rounded text-rose-300 text-[11px] border border-slate-800">
                      PRIVATE_KEY="your_private_key_here"
                    </code>
                  </div>

                  <div>
                    <div className="text-emerald-400 font-bold mb-1">Step 2: Run Deployment Command</div>
                    <p className="text-slate-400 text-[11px] mb-1">Run Hardhat's deployer script on Arbitrum Sepolia:</p>
                    <code className="block bg-slate-900 px-3 py-1.5 rounded text-cyan-300 text-[11px] border border-slate-800 select-all">
                      npx hardhat run scripts/deploy.ts --network arbitrumSepolia
                    </code>
                  </div>

                  <div>
                    <div className="text-emerald-400 font-bold mb-1">Step 3: Copy Addresses</div>
                    <p className="text-slate-400 text-[11px]">The terminal will print the deployed contract addresses. Paste them in the configuration form on the left, click <strong>"Apply & Load"</strong>, and start earning on-chain yield immediately!</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950 font-mono text-xs text-slate-400 p-4 rounded-xl border border-slate-800 h-64 overflow-y-auto space-y-2">
                {sandboxLogs.map((log, index) => (
                  <div key={index} className={
                    log.includes('✔') ? 'text-emerald-400 pl-4' :
                    log.includes('complete') ? 'text-emerald-400 font-bold animate-pulse' : 'text-slate-300'
                  }>
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-[10px] text-slate-500 mt-3 flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-slate-500" />
            {isLiveMode
              ? 'AstraFi smart contracts are built on standard ERC-4626 Tokenized Vaults ensuring maximum security & composability.'
              : 'Unit testing represents 8 fully passing test blocks written in ethers.js checking deposit fallbacks.'}
          </p>
        </div>
      </div>
    </div>
  );
}
