export const BROKER_ABI = [
  'function tradingLimitsConfig(bytes32) view returns (uint32 timestep0, uint32 timestep1, int48 limit0, int48 limit1, int48 limitGlobal, uint8 flags)',
  'function tradingLimitsState(bytes32) view returns (uint32 lastUpdated0, uint32 lastUpdated1, int48 netflow0, int48 netflow1, int48 netflowGlobal)',
]
