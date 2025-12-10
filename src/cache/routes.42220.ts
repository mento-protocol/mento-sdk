// This file is auto-generated. Do not edit manually.
// Generated on 2025-12-10T10:41:50.046Z

import type { RouteWithCost } from '../core/types'

export const routes42220: RouteWithCost[] = [
  {
    "id": "cKES-cUSD",
    "tokens": [
      {
        "address": "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
        "symbol": "cKES"
      },
      {
        "address": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
        "symbol": "cUSD"
      }
    ],
    "path": [
      {
        "factoryAddr": "0x4d1568F2fEd9396941BB675714784934E77FbC52",
        "poolAddr": "0x5Ea8f4fCA7CB90F78A18A2564859564621949d34",
        "token0": "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
        "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
        "poolType": "FPMM"
      }
    ],
    "costData": {
      "totalCostPercent": 0.3,
      "hops": [
        {
          "poolAddress": "0x5Ea8f4fCA7CB90F78A18A2564859564621949d34",
          "costPercent": 0.3
        }
      ]
    }
  },
  {
    "id": "cGHS-cUSD",
    "tokens": [
      {
        "address": "0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313",
        "symbol": "cGHS"
      },
      {
        "address": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
        "symbol": "cUSD"
      }
    ],
    "path": [
      {
        "factoryAddr": "0xa7Ce17dA712C10b1eDd97a91679E3717bC50F4a8",
        "poolAddr": "0xC6275dDeCbc012Be9fC0195Bbff1A8331Ba85589",
        "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
        "token1": "0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313",
        "poolType": "Virtual"
      }
    ],
    "costData": {
      "totalCostPercent": 1,
      "hops": [
        {
          "poolAddress": "0xC6275dDeCbc012Be9fC0195Bbff1A8331Ba85589",
          "costPercent": 1
        }
      ]
    }
  },
  {
    "id": "cGHS-cKES",
    "tokens": [
      {
        "address": "0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313",
        "symbol": "cGHS"
      },
      {
        "address": "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
        "symbol": "cKES"
      }
    ],
    "path": [
      {
        "factoryAddr": "0x4d1568F2fEd9396941BB675714784934E77FbC52",
        "poolAddr": "0x5Ea8f4fCA7CB90F78A18A2564859564621949d34",
        "token0": "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
        "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
        "poolType": "FPMM"
      },
      {
        "factoryAddr": "0xa7Ce17dA712C10b1eDd97a91679E3717bC50F4a8",
        "poolAddr": "0xC6275dDeCbc012Be9fC0195Bbff1A8331Ba85589",
        "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
        "token1": "0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313",
        "poolType": "Virtual"
      }
    ],
    "costData": {
      "totalCostPercent": 1.297,
      "hops": [
        {
          "poolAddress": "0x5Ea8f4fCA7CB90F78A18A2564859564621949d34",
          "costPercent": 0.3
        },
        {
          "poolAddress": "0xC6275dDeCbc012Be9fC0195Bbff1A8331Ba85589",
          "costPercent": 1
        }
      ]
    }
  }
]
