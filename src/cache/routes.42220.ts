// This file is auto-generated. Do not edit manually.
// Generated on 2025-12-17T12:12:43.212Z

import type { RouteWithCost } from '../core/types'

export const routes42220: RouteWithCost[] = [
  {
    "id": "KESm-USDm",
    "tokens": [
      {
        "address": "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
        "symbol": "KESm"
      },
      {
        "address": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
        "symbol": "USDm"
      }
    ],
    "path": [
      {
        "factoryAddr": "0x65A67cb93a3e035C32f131e911A0d6b46a5f3Bd0",
        "poolAddr": "0x5c3919258a040D203260880401E3201a82d224c4",
        "token0": "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
        "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
        "poolType": "FPMM"
      }
    ],
    "costData": {
      "totalCostPercent": 0.3,
      "hops": [
        {
          "poolAddress": "0x5c3919258a040D203260880401E3201a82d224c4",
          "costPercent": 0.3
        }
      ]
    }
  },
  {
    "id": "GHSm-USDm",
    "tokens": [
      {
        "address": "0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313",
        "symbol": "GHSm"
      },
      {
        "address": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
        "symbol": "USDm"
      }
    ],
    "path": [
      {
        "factoryAddr": "0x6CE2dFC48b2688075A804835757a734e3316E0a2",
        "poolAddr": "0x21243E9F64815D86Eeb38d80a212295a39634e70",
        "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
        "token1": "0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313",
        "poolType": "Virtual"
      }
    ],
    "costData": {
      "totalCostPercent": 1,
      "hops": [
        {
          "poolAddress": "0x21243E9F64815D86Eeb38d80a212295a39634e70",
          "costPercent": 1
        }
      ]
    }
  },
  {
    "id": "GHSm-KESm",
    "tokens": [
      {
        "address": "0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313",
        "symbol": "GHSm"
      },
      {
        "address": "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
        "symbol": "KESm"
      }
    ],
    "path": [
      {
        "factoryAddr": "0x65A67cb93a3e035C32f131e911A0d6b46a5f3Bd0",
        "poolAddr": "0x5c3919258a040D203260880401E3201a82d224c4",
        "token0": "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
        "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
        "poolType": "FPMM"
      },
      {
        "factoryAddr": "0x6CE2dFC48b2688075A804835757a734e3316E0a2",
        "poolAddr": "0x21243E9F64815D86Eeb38d80a212295a39634e70",
        "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
        "token1": "0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313",
        "poolType": "Virtual"
      }
    ],
    "costData": {
      "totalCostPercent": 1.297,
      "hops": [
        {
          "poolAddress": "0x5c3919258a040D203260880401E3201a82d224c4",
          "costPercent": 0.3
        },
        {
          "poolAddress": "0x21243E9F64815D86Eeb38d80a212295a39634e70",
          "costPercent": 1
        }
      ]
    }
  }
]
