export const BIPOOL_MANAGER_ABI = [
  {
    name: 'getExchanges',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      {
        name: 'exchanges',
        type: 'tuple[]',
        components: [
          {
            name: 'exchangeId',
            type: 'bytes32',
          },
          {
            name: 'assets',
            type: 'address[]',
          },
        ],
      },
    ],
  },
  {
    name: 'getPoolExchange',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      {
        name: 'exchangeId',
        type: 'bytes32',
      },
    ],
    outputs: [
      {
        name: 'exchange',
        type: 'tuple',
        components: [
          { name: 'asset0', type: 'address' },
          { name: 'asset1', type: 'address' },
          { name: 'pricingModule', type: 'address' },
          { name: 'bucket0', type: 'uint256' },
          { name: 'bucket1', type: 'uint256' },
          { name: 'lastBucketUpdate', type: 'uint256' },
          {
            name: 'config',
            type: 'tuple',
            components: [
              {
                name: 'spread',
                type: 'tuple',
                components: [{ name: 'value', type: 'uint256' }],
              },
              { name: 'referenceRateFeedID', type: 'address' },
              { name: 'referenceRateResetFrequency', type: 'uint256' },
              { name: 'minimumReports', type: 'uint256' },
              {
                name: 'stablePoolResetSize',
                type: 'tuple',
                components: [{ name: 'value', type: 'uint256' }],
              },
            ],
          },
        ],
      },
    ],
  },
]
