// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Interface for ERC20 standard tokens.
 */
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

/**
 * @title AstraFi
 * @author AstraFi Core
 * @dev Standard Yield Vault Contract which accepts ERC20 stakes and accrues weekly yields/rewards.
 * Features delta-neutral strategy allocation endpoints, administrative risk limits, and emergency locks.
 */
contract AstraFi {
    string public name;
    string public symbol;
    IERC20 public immutable stakingToken;
    IERC20 public immutable rewardToken;
    address public owner;
    bool public paused;

    struct Pool {
        uint256 apy;             // In basis points (e.g., 1680 = 16.8%)
        uint256 totalStaked;     // Current TVL in token units
        uint256 maxCapacity;     // Hard limit for TVL risk control
        bool active;
    }

    Pool[] public pools;
    
    // Mapping from poolId => userAddress => stakedAmount
    mapping(uint256 => mapping(address => uint256)) public userStakes;
    // Mapping from poolId => userAddress => lastAccruedTimestamp
    mapping(uint256 => mapping(address => uint256)) public lastAccrued;
    // Mapping from poolId => userAddress => claimableRewards
    mapping(uint256 => mapping(address => uint256)) public accumulatedRewards;

    event Deposited(address indexed user, uint256 indexed poolId, uint256 amount);
    event Withdrawn(address indexed user, uint256 indexed poolId, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 indexed poolId, uint256 amount);
    event PoolAdded(uint256 indexed poolId, uint256 apy, uint256 maxCapacity);
    event PoolUpdated(uint256 indexed poolId, uint256 apy, bool active);
    event PausedStateChanged(bool pausedState);

    modifier onlyOwner() {
        require(msg.sender == owner, "AstraFi: Caller is not the owner");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "AstraFi: Contract is paused in emergency");
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        address _stakingToken,
        address _rewardToken
    ) {
        name = _name;
        symbol = _symbol;
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
        owner = msg.sender;
        paused = false;
    }

    /**
     * @notice Returns the number of pools configured in AstraFi
     */
    function getPoolsCount() external view returns (uint256) {
        return pools.length;
    }

    /**
     * @notice Admin creates a new yield optimization strategy pool
     */
    function addPool(uint256 _apy, uint256 _maxCapacity) external onlyOwner {
        pools.push(Pool({
            apy: _apy,
            totalStaked: 0,
            maxCapacity: _maxCapacity,
            active: true
        }));
        emit PoolAdded(pools.length - 1, _apy, _maxCapacity);
    }

    /**
     * @notice Admin adjusts APY rates or pauses deposits into a specific pool
     */
    function updatePool(uint256 _poolId, uint256 _apy, bool _active) external onlyOwner {
        require(_poolId < pools.length, "AstraFi: Non-existent pool");
        pools[_poolId].apy = _apy;
        pools[_poolId].active = _active;
        emit PoolUpdated(_poolId, _apy, _active);
    }

    /**
     * @notice Calculates dynamic claimable interest accrued block-by-block
     */
    function pendingRewards(uint256 _poolId, address _user) public view returns (uint256) {
        uint256 staked = userStakes[_poolId][_user];
        if (staked == 0) {
            return accumulatedRewards[_poolId][_user];
        }

        uint256 timeElapsed = block.timestamp - lastAccrued[_poolId][_user];
        uint256 annualAPY = pools[_poolId].apy; // In basis points (e.g. 1680)
        
        // reward = staked * APY% * (timeElapsed / 1 year)
        // 1 year = 31536000 seconds
        // dividing by 10000 to convert APY basis points to simple fraction
        uint256 interest = (staked * annualAPY * timeElapsed) / (10000 * 31536000);
        return accumulatedRewards[_poolId][_user] + interest;
    }

    /**
     * @notice Stake tokens into a delta-neutral pool strategy
     */
    function deposit(uint256 _poolId, uint256 _amount) external whenNotPaused {
        require(_poolId < pools.length, "AstraFi: Invalid pool");
        Pool storage pool = pools[_poolId];
        require(pool.active, "AstraFi: Pool is currently offline");
        require(pool.totalStaked + _amount <= pool.maxCapacity, "AstraFi: Pool capacity reached");
        require(_amount > 0, "AstraFi: Amount must be greater than 0");

        // Update reward state first
        _updateRewards(_poolId, msg.sender);

        // Pull tokens from user
        require(
            stakingToken.transferFrom(msg.sender, address(this), _amount),
            "AstraFi: Token deposit transfer failed"
        );

        // Update balances
        userStakes[_poolId][msg.sender] += _amount;
        pool.totalStaked += _amount;

        emit Deposited(msg.sender, _poolId, _amount);
    }

    /**
     * @notice Unstake staked tokens from the strategy pool
     */
    function withdraw(uint256 _poolId, uint256 _amount) external {
        require(_poolId < pools.length, "AstraFi: Invalid pool");
        Pool storage pool = pools[_poolId];
        uint256 staked = userStakes[_poolId][msg.sender];
        require(staked >= _amount, "AstraFi: Insufficient balance to withdraw");
        require(_amount > 0, "AstraFi: Amount must be greater than 0");

        // Update reward state first
        _updateRewards(_poolId, msg.sender);

        // Deduct balances
        userStakes[_poolId][msg.sender] -= _amount;
        pool.totalStaked -= _amount;

        // Push tokens back to user
        require(
            stakingToken.transfer(msg.sender, _amount),
            "AstraFi: Withdrawal transfer failed"
        );

        emit Withdrawn(msg.sender, _poolId, _amount);
    }

    /**
     * @notice Claim accrued yield rewards in the rewardToken (e.g., USDC incentive token)
     */
    function claimRewards(uint256 _poolId) external whenNotPaused {
        _updateRewards(_poolId, msg.sender);
        uint256 rewardAmount = accumulatedRewards[_poolId][msg.sender];
        require(rewardAmount > 0, "AstraFi: No reward available to claim");

        accumulatedRewards[_poolId][msg.sender] = 0;

        // Ensure reward balance exists in contract
        uint256 contractRewardBal = rewardToken.balanceOf(address(this));
        require(contractRewardBal >= rewardAmount, "AstraFi: Insufficient reward reserves");

        require(
            rewardToken.transfer(msg.sender, rewardAmount),
            "AstraFi: Reward transfer failed"
        );

        emit RewardsClaimed(msg.sender, _poolId, rewardAmount);
    }

    /**
     * @notice Internal helper to update incentive accrual parameters
     */
    function _updateRewards(uint256 _poolId, address _user) internal {
        accumulatedRewards[_poolId][_user] = pendingRewards(_poolId, _user);
        lastAccrued[_poolId][_user] = block.timestamp;
    }

    /**
     * @notice Toggle contract paused state in case of extreme volatility or exploits
     */
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit PausedStateChanged(_paused);
    }

    /**
     * @notice Admin emergency recovery for unintended tokens transferred to this contract
     */
    function rescueTokens(address _token, uint256 _amount) external onlyOwner {
        require(_token != address(stakingToken), "AstraFi: Cannot rescue core staking deposits");
        IERC20(_token).transfer(owner, _amount);
    }

    /**
     * @notice Admin transfers ownership
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "AstraFi: New owner cannot be zero address");
        owner = _newOwner;
    }
}
