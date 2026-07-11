import { ethers } from "hardhat";

async function main() {
  console.log("=================================================");
  console.log("AstraFi Deployer Core Active");
  console.log("=================================================");

  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with account: ${deployer.address}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Account balance: ${ethers.formatEther(balance)} ETH`);

  // 1. Deploy Mock Tokens if on Sepolia Testnet, otherwise use existing addresses
  let stakingTokenAddress;
  let rewardTokenAddress;

  const chainId = (await ethers.provider.getNetwork()).chainId;
  console.log(`Target Chain ID: ${chainId}`);

  if (chainId === 421614n) { // Arbitrum Sepolia Testnet
    console.log("\n[TESTNET DETECTED] Deploying mock staking and reward tokens...");
    
    // Deploy Mock USDC as staking token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const usdc = await MockERC20.deploy("Mock USDC", "mUSDC", 6, ethers.parseUnits("1000000", 6));
    await usdc.waitForDeployment();
    stakingTokenAddress = await usdc.getAddress();
    console.log(`Mock USDC (Staking) deployed at: ${stakingTokenAddress}`);

    // Deploy Mock AstraReward as reward token
    const ast = await MockERC20.deploy("Astra Incentive Reward", "AIR", 18, ethers.parseUnits("5000000", 18));
    await ast.waitForDeployment();
    rewardTokenAddress = await ast.getAddress();
    console.log(`Mock AIR (Reward) deployed at: ${rewardTokenAddress}`);
  } else { // Arbitrum One Mainnet
    console.log("\n[MAINNET DETECTED] Binding to official production contract tokens...");
    // Official USDC on Arbitrum One
    stakingTokenAddress = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
    // Official Reward token (could be ARB or USDC depending on strategy setup)
    rewardTokenAddress = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
  }

  // 2. Deploy AstraFi
  console.log("\nDeploying AstraFi yield manager core...");
  const AstraFi = await ethers.getContractFactory("AstraFi");
  const vault = await AstraFi.deploy(
    "AstraFi Delta-Neutral Maximizer",
    "AST-USDC",
    stakingTokenAddress,
    rewardTokenAddress
  );
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log(`AstraFi core contract deployed at: ${vaultAddress}`);

  // 3. Add default strategy yield pools
  console.log("\nInitializing strategy pools inside AstraFi...");
  
  // Pool 1: Arbitrum Delta-Neutral Maximizer (16.8% APY, max capacity 10M tokens)
  await (await vault.addPool(1680, ethers.parseUnits("10000000", 6))).wait();
  console.log("- Added Pool 1: Arbitrum Delta-Neutral Maximizer [APY: 16.8%]");

  // Pool 2: ETH Volatility Harvester V3 (28.4% APY, max capacity 5M tokens)
  await (await vault.addPool(2840, ethers.parseUnits("5000000", 6))).wait();
  console.log("- Added Pool 2: ETH Volatility Harvester V3 [APY: 28.4%]");

  // Pool 3: Astra Ecosystem High-Yield Compounder (34.5% APY, max capacity 2.5M tokens)
  await (await vault.addPool(3450, ethers.parseUnits("2500000", 6))).wait();
  console.log("- Added Pool 3: Astra Ecosystem Compounder [APY: 34.5%]");

  console.log("\n=================================================");
  console.log("DEPLOYMENT COMPLETE!");
  console.log("=================================================");
  console.log(`Contract verified status: ready to be verified on Arbiscan.`);
  console.log(`Usage: npx hardhat verify --network arbitrumSepolia ${vaultAddress} "AstraFi Delta-Neutral Maximizer" "AST-USDC" ${stakingTokenAddress} ${rewardTokenAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
