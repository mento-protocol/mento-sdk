// This file is auto-generated. Do not edit manually.
// Generated on 2026-02-02T18:32:15.225Z

import type { RouteWithCost } from '../core/types'

/**
 * Cached routes indexed by chain ID
 * Routes that don't exist for a chain will return an empty array
 */
export const cachedRoutes: Record<number, RouteWithCost[]> = {
  // Chain 42220
  42220: [
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
          "factoryAddr": "0xB9732EB66406334F56E9d8c515d5af3da29b0654",
          "poolAddr": "0xc69D6bBA6785e76998f870609345aA2BE7F64d19",
          "token0": "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "FPMM"
        }
      ],
      "costData": {
        "totalCostPercent": 0.3,
        "hops": [
          {
            "poolAddress": "0xc69D6bBA6785e76998f870609345aA2BE7F64d19",
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
          "factoryAddr": "0x3268E4b75BEe60C400Eb4Dd8E44E9a3A76873f65",
          "poolAddr": "0xE6063Edac6EaBdF812286c6c4e2EDF27B9CBe648",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313",
          "poolType": "Virtual",
          "exchangeId": "0x3562f9d29eba092b857480a82b03375839c752346b9ebe93a57ab82410328187"
        }
      ],
      "costData": {
        "totalCostPercent": 1,
        "hops": [
          {
            "poolAddress": "0xE6063Edac6EaBdF812286c6c4e2EDF27B9CBe648",
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
          "factoryAddr": "0xB9732EB66406334F56E9d8c515d5af3da29b0654",
          "poolAddr": "0xc69D6bBA6785e76998f870609345aA2BE7F64d19",
          "token0": "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x3268E4b75BEe60C400Eb4Dd8E44E9a3A76873f65",
          "poolAddr": "0xE6063Edac6EaBdF812286c6c4e2EDF27B9CBe648",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313",
          "poolType": "Virtual",
          "exchangeId": "0x3562f9d29eba092b857480a82b03375839c752346b9ebe93a57ab82410328187"
        }
      ],
      "costData": {
        "totalCostPercent": 1.297,
        "hops": [
          {
            "poolAddress": "0xc69D6bBA6785e76998f870609345aA2BE7F64d19",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0xE6063Edac6EaBdF812286c6c4e2EDF27B9CBe648",
            "costPercent": 1
          }
        ]
      }
    }
  ],
}

/**
 * Get cached routes for a specific chain
 * @param chainId - The chain ID
 * @returns The cached routes array, or empty array if not available
 */
export function getCachedRoutes(chainId: number): RouteWithCost[] {
  return cachedRoutes[chainId] ?? []
}
