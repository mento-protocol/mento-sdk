// This file is auto-generated. Do not edit manually.
// Generated on 2025-12-09T10:59:23.625Z

import type { RouteWithCost } from '../core/types'

export const routes42220: RouteWithCost[] = [
  {
    "id": "USDC-cUSD",
    "tokens": [
      {
        "address": "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
        "symbol": "USDC"
      },
      {
        "address": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
        "symbol": "cUSD"
      }
    ],
    "path": [
      {
        "factoryAddr": "0xd1C677e35EC813851C56438A92227C521A96331D",
        "poolAddr": "0xbe230E6aD4bBB1E6574509F0337f54F9f2fD5002",
        "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
        "token1": "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
        "poolType": "FPMM"
      }
    ],
    "costData": {
      "totalCostPercent": 0.3,
      "hops": [
        {
          "poolAddress": "0xbe230E6aD4bBB1E6574509F0337f54F9f2fD5002",
          "costPercent": 0.3
        }
      ]
    }
  },
  {
    "id": "cEUR-cUSD",
    "tokens": [
      {
        "address": "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73",
        "symbol": "cEUR"
      },
      {
        "address": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
        "symbol": "cUSD"
      }
    ],
    "path": [
      {
        "factoryAddr": "0x295B66bE7714458Af45E6A6Ea142A5358A6cA375",
        "poolAddr": "0x794CE26d2bAEf85035af6A886A5D7C2383d3F0F5",
        "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
        "token1": "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73",
        "poolType": "Virtual"
      }
    ],
    "costData": {
      "totalCostPercent": 0.5,
      "hops": [
        {
          "poolAddress": "0x794CE26d2bAEf85035af6A886A5D7C2383d3F0F5",
          "costPercent": 0.5
        }
      ]
    }
  },
  {
    "id": "USDC-cEUR",
    "tokens": [
      {
        "address": "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
        "symbol": "USDC"
      },
      {
        "address": "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73",
        "symbol": "cEUR"
      }
    ],
    "path": [
      {
        "factoryAddr": "0xd1C677e35EC813851C56438A92227C521A96331D",
        "poolAddr": "0xbe230E6aD4bBB1E6574509F0337f54F9f2fD5002",
        "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
        "token1": "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
        "poolType": "FPMM"
      },
      {
        "factoryAddr": "0x295B66bE7714458Af45E6A6Ea142A5358A6cA375",
        "poolAddr": "0x794CE26d2bAEf85035af6A886A5D7C2383d3F0F5",
        "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
        "token1": "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73",
        "poolType": "Virtual"
      }
    ],
    "costData": {
      "totalCostPercent": 0.7985,
      "hops": [
        {
          "poolAddress": "0xbe230E6aD4bBB1E6574509F0337f54F9f2fD5002",
          "costPercent": 0.3
        },
        {
          "poolAddress": "0x794CE26d2bAEf85035af6A886A5D7C2383d3F0F5",
          "costPercent": 0.5
        }
      ]
    }
  }
]
