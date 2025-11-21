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
]
