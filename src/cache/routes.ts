// This file is auto-generated. Do not edit manually.
// Generated on 2026-03-25T12:10:06.926Z

import type { RouteWithCost } from '../core/types'

/**
 * Cached routes indexed by chain ID
 * Routes that don't exist for a chain will return an empty array
 */
export const cachedRoutes: Record<number, RouteWithCost[]> = {
  // Chain 143
  143: [
    {
      "id": "USDC-USDm",
      "tokens": [
        {
          "address": "0x754704Bc059F8C67012fEd69BC8A327a5aafb603",
          "symbol": "USDC"
        },
        {
          "address": "0xBC69212B8E4d445b2307C9D32dD68E2A4Df00115",
          "symbol": "USDm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x463c0d1F04bcd99A1efCF94AC2a75bc19Ea4A7E5",
          "token0": "0x754704Bc059F8C67012fEd69BC8A327a5aafb603",
          "token1": "0xBC69212B8E4d445b2307C9D32dD68E2A4Df00115",
          "poolType": "FPMM"
        }
      ],
      "costData": {
        "totalCostPercent": 0.05,
        "hops": [
          {
            "poolAddress": "0x463c0d1F04bcd99A1efCF94AC2a75bc19Ea4A7E5",
            "costPercent": 0.05
          }
        ]
      }
    },
    {
      "id": "AUSD-USDm",
      "tokens": [
        {
          "address": "0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a",
          "symbol": "AUSD"
        },
        {
          "address": "0xBC69212B8E4d445b2307C9D32dD68E2A4Df00115",
          "symbol": "USDm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0xb0a0264Ce6847F101b76ba36A4a3083ba489F501",
          "token0": "0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a",
          "token1": "0xBC69212B8E4d445b2307C9D32dD68E2A4Df00115",
          "poolType": "FPMM"
        }
      ],
      "costData": {
        "totalCostPercent": 0.05,
        "hops": [
          {
            "poolAddress": "0xb0a0264Ce6847F101b76ba36A4a3083ba489F501",
            "costPercent": 0.05
          }
        ]
      }
    },
    {
      "id": "AUSD-USDC",
      "tokens": [
        {
          "address": "0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a",
          "symbol": "AUSD"
        },
        {
          "address": "0x754704Bc059F8C67012fEd69BC8A327a5aafb603",
          "symbol": "USDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x463c0d1F04bcd99A1efCF94AC2a75bc19Ea4A7E5",
          "token0": "0x754704Bc059F8C67012fEd69BC8A327a5aafb603",
          "token1": "0xBC69212B8E4d445b2307C9D32dD68E2A4Df00115",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0xb0a0264Ce6847F101b76ba36A4a3083ba489F501",
          "token0": "0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a",
          "token1": "0xBC69212B8E4d445b2307C9D32dD68E2A4Df00115",
          "poolType": "FPMM"
        }
      ],
      "costData": {
        "totalCostPercent": 0.099975,
        "hops": [
          {
            "poolAddress": "0x463c0d1F04bcd99A1efCF94AC2a75bc19Ea4A7E5",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0xb0a0264Ce6847F101b76ba36A4a3083ba489F501",
            "costPercent": 0.05
          }
        ]
      }
    },
    {
      "id": "GBPm-USDm",
      "tokens": [
        {
          "address": "0x39bb4E0a204412bB98e821d25e7d955e69d40Fd1",
          "symbol": "GBPm"
        },
        {
          "address": "0xBC69212B8E4d445b2307C9D32dD68E2A4Df00115",
          "symbol": "USDm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0xD0E9c1a718D2a693d41eacd4B2696180403Ce081",
          "token0": "0x39bb4E0a204412bB98e821d25e7d955e69d40Fd1",
          "token1": "0xBC69212B8E4d445b2307C9D32dD68E2A4Df00115",
          "poolType": "FPMM"
        }
      ],
      "costData": {
        "totalCostPercent": 0.15,
        "hops": [
          {
            "poolAddress": "0xD0E9c1a718D2a693d41eacd4B2696180403Ce081",
            "costPercent": 0.15
          }
        ]
      }
    },
    {
      "id": "GBPm-USDC",
      "tokens": [
        {
          "address": "0x39bb4E0a204412bB98e821d25e7d955e69d40Fd1",
          "symbol": "GBPm"
        },
        {
          "address": "0x754704Bc059F8C67012fEd69BC8A327a5aafb603",
          "symbol": "USDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0xD0E9c1a718D2a693d41eacd4B2696180403Ce081",
          "token0": "0x39bb4E0a204412bB98e821d25e7d955e69d40Fd1",
          "token1": "0xBC69212B8E4d445b2307C9D32dD68E2A4Df00115",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x463c0d1F04bcd99A1efCF94AC2a75bc19Ea4A7E5",
          "token0": "0x754704Bc059F8C67012fEd69BC8A327a5aafb603",
          "token1": "0xBC69212B8E4d445b2307C9D32dD68E2A4Df00115",
          "poolType": "FPMM"
        }
      ],
      "costData": {
        "totalCostPercent": 0.199925,
        "hops": [
          {
            "poolAddress": "0xD0E9c1a718D2a693d41eacd4B2696180403Ce081",
            "costPercent": 0.15
          },
          {
            "poolAddress": "0x463c0d1F04bcd99A1efCF94AC2a75bc19Ea4A7E5",
            "costPercent": 0.05
          }
        ]
      }
    },
    {
      "id": "AUSD-GBPm",
      "tokens": [
        {
          "address": "0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a",
          "symbol": "AUSD"
        },
        {
          "address": "0x39bb4E0a204412bB98e821d25e7d955e69d40Fd1",
          "symbol": "GBPm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0xD0E9c1a718D2a693d41eacd4B2696180403Ce081",
          "token0": "0x39bb4E0a204412bB98e821d25e7d955e69d40Fd1",
          "token1": "0xBC69212B8E4d445b2307C9D32dD68E2A4Df00115",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0xb0a0264Ce6847F101b76ba36A4a3083ba489F501",
          "token0": "0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a",
          "token1": "0xBC69212B8E4d445b2307C9D32dD68E2A4Df00115",
          "poolType": "FPMM"
        }
      ],
      "costData": {
        "totalCostPercent": 0.199925,
        "hops": [
          {
            "poolAddress": "0xD0E9c1a718D2a693d41eacd4B2696180403Ce081",
            "costPercent": 0.15
          },
          {
            "poolAddress": "0xb0a0264Ce6847F101b76ba36A4a3083ba489F501",
            "costPercent": 0.05
          }
        ]
      }
    }
  ],
  // Chain 10143
  10143: [
    {
      "id": "USDC-USDm",
      "tokens": [
        {
          "address": "0x534b2f3A21130d7a60830c2Df862319e593943A3",
          "symbol": "USDC"
        },
        {
          "address": "0x5eCc03111ad2A78F981A108759bc73BAE2AB31bc",
          "symbol": "USDm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x7109E0A9B4623e90755b7e5c4e10F089E5Bf8bDb",
          "token0": "0x534b2f3A21130d7a60830c2Df862319e593943A3",
          "token1": "0x5eCc03111ad2A78F981A108759bc73BAE2AB31bc",
          "poolType": "FPMM"
        }
      ],
      "costData": {
        "totalCostPercent": 0.05,
        "hops": [
          {
            "poolAddress": "0x7109E0A9B4623e90755b7e5c4e10F089E5Bf8bDb",
            "costPercent": 0.05
          }
        ]
      }
    },
    {
      "id": "AUSD-USDm",
      "tokens": [
        {
          "address": "0x502E67D3fE9302A5e4Ec1CFCDdbD6F34F9B9484B",
          "symbol": "AUSD"
        },
        {
          "address": "0x5eCc03111ad2A78F981A108759bc73BAE2AB31bc",
          "symbol": "USDm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x52716E8F44E417bE8F573F8A85cA8eD3DAe1eAE1",
          "token0": "0x502E67D3fE9302A5e4Ec1CFCDdbD6F34F9B9484B",
          "token1": "0x5eCc03111ad2A78F981A108759bc73BAE2AB31bc",
          "poolType": "FPMM"
        }
      ],
      "costData": {
        "totalCostPercent": 0.05,
        "hops": [
          {
            "poolAddress": "0x52716E8F44E417bE8F573F8A85cA8eD3DAe1eAE1",
            "costPercent": 0.05
          }
        ]
      }
    },
    {
      "id": "USDT0-USDm",
      "tokens": [
        {
          "address": "0xC304EE1876c32d1A194558B1000bE4842F960dF9",
          "symbol": "USDT0"
        },
        {
          "address": "0x5eCc03111ad2A78F981A108759bc73BAE2AB31bc",
          "symbol": "USDm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0xa51a83F0260a83A7F9AdFecC1Bc93C58DEf2c9A2",
          "token0": "0x5eCc03111ad2A78F981A108759bc73BAE2AB31bc",
          "token1": "0xC304EE1876c32d1A194558B1000bE4842F960dF9",
          "poolType": "FPMM"
        }
      ],
      "costData": {
        "totalCostPercent": 0.05,
        "hops": [
          {
            "poolAddress": "0xa51a83F0260a83A7F9AdFecC1Bc93C58DEf2c9A2",
            "costPercent": 0.05
          }
        ]
      }
    },
    {
      "id": "AUSD-USDC",
      "tokens": [
        {
          "address": "0x502E67D3fE9302A5e4Ec1CFCDdbD6F34F9B9484B",
          "symbol": "AUSD"
        },
        {
          "address": "0x534b2f3A21130d7a60830c2Df862319e593943A3",
          "symbol": "USDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x7109E0A9B4623e90755b7e5c4e10F089E5Bf8bDb",
          "token0": "0x534b2f3A21130d7a60830c2Df862319e593943A3",
          "token1": "0x5eCc03111ad2A78F981A108759bc73BAE2AB31bc",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x52716E8F44E417bE8F573F8A85cA8eD3DAe1eAE1",
          "token0": "0x502E67D3fE9302A5e4Ec1CFCDdbD6F34F9B9484B",
          "token1": "0x5eCc03111ad2A78F981A108759bc73BAE2AB31bc",
          "poolType": "FPMM"
        }
      ],
      "costData": {
        "totalCostPercent": 0.099975,
        "hops": [
          {
            "poolAddress": "0x7109E0A9B4623e90755b7e5c4e10F089E5Bf8bDb",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x52716E8F44E417bE8F573F8A85cA8eD3DAe1eAE1",
            "costPercent": 0.05
          }
        ]
      }
    },
    {
      "id": "AUSD-USDT0",
      "tokens": [
        {
          "address": "0x502E67D3fE9302A5e4Ec1CFCDdbD6F34F9B9484B",
          "symbol": "AUSD"
        },
        {
          "address": "0xC304EE1876c32d1A194558B1000bE4842F960dF9",
          "symbol": "USDT0"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0xa51a83F0260a83A7F9AdFecC1Bc93C58DEf2c9A2",
          "token0": "0x5eCc03111ad2A78F981A108759bc73BAE2AB31bc",
          "token1": "0xC304EE1876c32d1A194558B1000bE4842F960dF9",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x52716E8F44E417bE8F573F8A85cA8eD3DAe1eAE1",
          "token0": "0x502E67D3fE9302A5e4Ec1CFCDdbD6F34F9B9484B",
          "token1": "0x5eCc03111ad2A78F981A108759bc73BAE2AB31bc",
          "poolType": "FPMM"
        }
      ],
      "costData": {
        "totalCostPercent": 0.099975,
        "hops": [
          {
            "poolAddress": "0xa51a83F0260a83A7F9AdFecC1Bc93C58DEf2c9A2",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x52716E8F44E417bE8F573F8A85cA8eD3DAe1eAE1",
            "costPercent": 0.05
          }
        ]
      }
    },
    {
      "id": "GBPm-USDm",
      "tokens": [
        {
          "address": "0x04de554E875c9797dC4ceBd834A9e99fa8fD5Df9",
          "symbol": "GBPm"
        },
        {
          "address": "0x5eCc03111ad2A78F981A108759bc73BAE2AB31bc",
          "symbol": "USDm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x550D9EcB4C373510b8A41f5fB7D98E9E1c51A07e",
          "token0": "0x04de554E875c9797dC4ceBd834A9e99fa8fD5Df9",
          "token1": "0x5eCc03111ad2A78F981A108759bc73BAE2AB31bc",
          "poolType": "FPMM"
        }
      ],
      "costData": {
        "totalCostPercent": 0.15,
        "hops": [
          {
            "poolAddress": "0x550D9EcB4C373510b8A41f5fB7D98E9E1c51A07e",
            "costPercent": 0.15
          }
        ]
      }
    },
    {
      "id": "EURm-USDm",
      "tokens": [
        {
          "address": "0x666D0a83cDbf3eC62bDb624d9bFcD8F6345Ba7D0",
          "symbol": "EURm"
        },
        {
          "address": "0x5eCc03111ad2A78F981A108759bc73BAE2AB31bc",
          "symbol": "USDm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0xD74728994135734968b03EFc03448394BaCb1e5f",
          "token0": "0x5eCc03111ad2A78F981A108759bc73BAE2AB31bc",
          "token1": "0x666D0a83cDbf3eC62bDb624d9bFcD8F6345Ba7D0",
          "poolType": "FPMM"
        }
      ],
      "costData": {
        "totalCostPercent": 0.15,
        "hops": [
          {
            "poolAddress": "0xD74728994135734968b03EFc03448394BaCb1e5f",
            "costPercent": 0.15
          }
        ]
      }
    },
    {
      "id": "GBPm-USDC",
      "tokens": [
        {
          "address": "0x04de554E875c9797dC4ceBd834A9e99fa8fD5Df9",
          "symbol": "GBPm"
        },
        {
          "address": "0x534b2f3A21130d7a60830c2Df862319e593943A3",
          "symbol": "USDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x550D9EcB4C373510b8A41f5fB7D98E9E1c51A07e",
          "token0": "0x04de554E875c9797dC4ceBd834A9e99fa8fD5Df9",
          "token1": "0x5eCc03111ad2A78F981A108759bc73BAE2AB31bc",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x7109E0A9B4623e90755b7e5c4e10F089E5Bf8bDb",
          "token0": "0x534b2f3A21130d7a60830c2Df862319e593943A3",
          "token1": "0x5eCc03111ad2A78F981A108759bc73BAE2AB31bc",
          "poolType": "FPMM"
        }
      ],
      "costData": {
        "totalCostPercent": 0.199925,
        "hops": [
          {
            "poolAddress": "0x550D9EcB4C373510b8A41f5fB7D98E9E1c51A07e",
            "costPercent": 0.15
          },
          {
            "poolAddress": "0x7109E0A9B4623e90755b7e5c4e10F089E5Bf8bDb",
            "costPercent": 0.05
          }
        ]
      }
    },
    {
      "id": "AUSD-GBPm",
      "tokens": [
        {
          "address": "0x502E67D3fE9302A5e4Ec1CFCDdbD6F34F9B9484B",
          "symbol": "AUSD"
        },
        {
          "address": "0x04de554E875c9797dC4ceBd834A9e99fa8fD5Df9",
          "symbol": "GBPm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x550D9EcB4C373510b8A41f5fB7D98E9E1c51A07e",
          "token0": "0x04de554E875c9797dC4ceBd834A9e99fa8fD5Df9",
          "token1": "0x5eCc03111ad2A78F981A108759bc73BAE2AB31bc",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x52716E8F44E417bE8F573F8A85cA8eD3DAe1eAE1",
          "token0": "0x502E67D3fE9302A5e4Ec1CFCDdbD6F34F9B9484B",
          "token1": "0x5eCc03111ad2A78F981A108759bc73BAE2AB31bc",
          "poolType": "FPMM"
        }
      ],
      "costData": {
        "totalCostPercent": 0.199925,
        "hops": [
          {
            "poolAddress": "0x550D9EcB4C373510b8A41f5fB7D98E9E1c51A07e",
            "costPercent": 0.15
          },
          {
            "poolAddress": "0x52716E8F44E417bE8F573F8A85cA8eD3DAe1eAE1",
            "costPercent": 0.05
          }
        ]
      }
    },
    {
      "id": "GBPm-USDT0",
      "tokens": [
        {
          "address": "0x04de554E875c9797dC4ceBd834A9e99fa8fD5Df9",
          "symbol": "GBPm"
        },
        {
          "address": "0xC304EE1876c32d1A194558B1000bE4842F960dF9",
          "symbol": "USDT0"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x550D9EcB4C373510b8A41f5fB7D98E9E1c51A07e",
          "token0": "0x04de554E875c9797dC4ceBd834A9e99fa8fD5Df9",
          "token1": "0x5eCc03111ad2A78F981A108759bc73BAE2AB31bc",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0xa51a83F0260a83A7F9AdFecC1Bc93C58DEf2c9A2",
          "token0": "0x5eCc03111ad2A78F981A108759bc73BAE2AB31bc",
          "token1": "0xC304EE1876c32d1A194558B1000bE4842F960dF9",
          "poolType": "FPMM"
        }
      ],
      "costData": {
        "totalCostPercent": 0.199925,
        "hops": [
          {
            "poolAddress": "0x550D9EcB4C373510b8A41f5fB7D98E9E1c51A07e",
            "costPercent": 0.15
          },
          {
            "poolAddress": "0xa51a83F0260a83A7F9AdFecC1Bc93C58DEf2c9A2",
            "costPercent": 0.05
          }
        ]
      }
    },
    {
      "id": "EURm-GBPm",
      "tokens": [
        {
          "address": "0x666D0a83cDbf3eC62bDb624d9bFcD8F6345Ba7D0",
          "symbol": "EURm"
        },
        {
          "address": "0x04de554E875c9797dC4ceBd834A9e99fa8fD5Df9",
          "symbol": "GBPm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0xD74728994135734968b03EFc03448394BaCb1e5f",
          "token0": "0x5eCc03111ad2A78F981A108759bc73BAE2AB31bc",
          "token1": "0x666D0a83cDbf3eC62bDb624d9bFcD8F6345Ba7D0",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x550D9EcB4C373510b8A41f5fB7D98E9E1c51A07e",
          "token0": "0x04de554E875c9797dC4ceBd834A9e99fa8fD5Df9",
          "token1": "0x5eCc03111ad2A78F981A108759bc73BAE2AB31bc",
          "poolType": "FPMM"
        }
      ],
      "costData": {
        "totalCostPercent": 0.299775,
        "hops": [
          {
            "poolAddress": "0xD74728994135734968b03EFc03448394BaCb1e5f",
            "costPercent": 0.15
          },
          {
            "poolAddress": "0x550D9EcB4C373510b8A41f5fB7D98E9E1c51A07e",
            "costPercent": 0.15
          }
        ]
      }
    }
  ],
  // Chain 42220
  42220: [
    {
      "id": "USDm-axlUSDC",
      "tokens": [
        {
          "address": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "symbol": "USDm"
        },
        {
          "address": "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          "symbol": "axlUSDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0xb285d4C7133d6f27BfB29224fb0D22E7EC3ddD2D",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          "poolType": "FPMM"
        }
      ],
      "costData": {
        "totalCostPercent": 0.05,
        "hops": [
          {
            "poolAddress": "0xb285d4C7133d6f27BfB29224fb0D22E7EC3ddD2D",
            "costPercent": 0.05
          }
        ]
      }
    },
    {
      "id": "USDC-USDm",
      "tokens": [
        {
          "address": "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
          "symbol": "USDC"
        },
        {
          "address": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "symbol": "USDm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x462fe04b4FD719Cbd04C0310365D421D02AaA19E",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
          "poolType": "FPMM"
        }
      ],
      "costData": {
        "totalCostPercent": 0.05,
        "hops": [
          {
            "poolAddress": "0x462fe04b4FD719Cbd04C0310365D421D02AaA19E",
            "costPercent": 0.05
          }
        ]
      }
    },
    {
      "id": "USDm-USD₮",
      "tokens": [
        {
          "address": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "symbol": "USDm"
        },
        {
          "address": "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
          "symbol": "USD₮"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x0FEBa760d93423D127DE1B6ABECdB60E5253228D",
          "token0": "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "FPMM"
        }
      ],
      "costData": {
        "totalCostPercent": 0.05,
        "hops": [
          {
            "poolAddress": "0x0FEBa760d93423D127DE1B6ABECdB60E5253228D",
            "costPercent": 0.05
          }
        ]
      }
    },
    {
      "id": "USDC-axlUSDC",
      "tokens": [
        {
          "address": "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
          "symbol": "USDC"
        },
        {
          "address": "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          "symbol": "axlUSDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0xb285d4C7133d6f27BfB29224fb0D22E7EC3ddD2D",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x462fe04b4FD719Cbd04C0310365D421D02AaA19E",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
          "poolType": "FPMM"
        }
      ],
      "costData": {
        "totalCostPercent": 0.099975,
        "hops": [
          {
            "poolAddress": "0xb285d4C7133d6f27BfB29224fb0D22E7EC3ddD2D",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x462fe04b4FD719Cbd04C0310365D421D02AaA19E",
            "costPercent": 0.05
          }
        ]
      }
    },
    {
      "id": "USD₮-axlUSDC",
      "tokens": [
        {
          "address": "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
          "symbol": "USD₮"
        },
        {
          "address": "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          "symbol": "axlUSDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0xb285d4C7133d6f27BfB29224fb0D22E7EC3ddD2D",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x0FEBa760d93423D127DE1B6ABECdB60E5253228D",
          "token0": "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "FPMM"
        }
      ],
      "costData": {
        "totalCostPercent": 0.099975,
        "hops": [
          {
            "poolAddress": "0xb285d4C7133d6f27BfB29224fb0D22E7EC3ddD2D",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x0FEBa760d93423D127DE1B6ABECdB60E5253228D",
            "costPercent": 0.05
          }
        ]
      }
    },
    {
      "id": "USDC-USD₮",
      "tokens": [
        {
          "address": "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
          "symbol": "USDC"
        },
        {
          "address": "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
          "symbol": "USD₮"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x462fe04b4FD719Cbd04C0310365D421D02AaA19E",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x0FEBa760d93423D127DE1B6ABECdB60E5253228D",
          "token0": "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "FPMM"
        }
      ],
      "costData": {
        "totalCostPercent": 0.099975,
        "hops": [
          {
            "poolAddress": "0x462fe04b4FD719Cbd04C0310365D421D02AaA19E",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x0FEBa760d93423D127DE1B6ABECdB60E5253228D",
            "costPercent": 0.05
          }
        ]
      }
    },
    {
      "id": "AUDm-USDm",
      "tokens": [
        {
          "address": "0x7175504C455076F15c04A2F90a8e352281F492F9",
          "symbol": "AUDm"
        },
        {
          "address": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "symbol": "USDm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x1d013077b00B28038A3f1e7A29ABa34E12e562e9",
          "token0": "0x7175504C455076F15c04A2F90a8e352281F492F9",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0xd580d237231109e6a96d67d82450611c610a805a26660c90281bdc0cd04a95c7"
        }
      ],
      "costData": {
        "totalCostPercent": 0.15,
        "hops": [
          {
            "poolAddress": "0x1d013077b00B28038A3f1e7A29ABa34E12e562e9",
            "costPercent": 0.15
          }
        ]
      }
    },
    {
      "id": "CADm-USDm",
      "tokens": [
        {
          "address": "0xff4Ab19391af240c311c54200a492233052B6325",
          "symbol": "CADm"
        },
        {
          "address": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "symbol": "USDm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x62fA288e3AC844dCfcE5469af4f8feb7d6f7Ba61",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xff4Ab19391af240c311c54200a492233052B6325",
          "poolType": "Virtual",
          "exchangeId": "0x517ccc3bcab9f35e2e24143a0c1809068efc649f740846cfb6a1c5703735c1ee"
        }
      ],
      "costData": {
        "totalCostPercent": 0.15,
        "hops": [
          {
            "poolAddress": "0x62fA288e3AC844dCfcE5469af4f8feb7d6f7Ba61",
            "costPercent": 0.15
          }
        ]
      }
    },
    {
      "id": "AUDm-axlUSDC",
      "tokens": [
        {
          "address": "0x7175504C455076F15c04A2F90a8e352281F492F9",
          "symbol": "AUDm"
        },
        {
          "address": "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          "symbol": "axlUSDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0xb285d4C7133d6f27BfB29224fb0D22E7EC3ddD2D",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x1d013077b00B28038A3f1e7A29ABa34E12e562e9",
          "token0": "0x7175504C455076F15c04A2F90a8e352281F492F9",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0xd580d237231109e6a96d67d82450611c610a805a26660c90281bdc0cd04a95c7"
        }
      ],
      "costData": {
        "totalCostPercent": 0.199925,
        "hops": [
          {
            "poolAddress": "0xb285d4C7133d6f27BfB29224fb0D22E7EC3ddD2D",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x1d013077b00B28038A3f1e7A29ABa34E12e562e9",
            "costPercent": 0.15
          }
        ]
      }
    },
    {
      "id": "CADm-axlUSDC",
      "tokens": [
        {
          "address": "0xff4Ab19391af240c311c54200a492233052B6325",
          "symbol": "CADm"
        },
        {
          "address": "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          "symbol": "axlUSDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0xb285d4C7133d6f27BfB29224fb0D22E7EC3ddD2D",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x62fA288e3AC844dCfcE5469af4f8feb7d6f7Ba61",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xff4Ab19391af240c311c54200a492233052B6325",
          "poolType": "Virtual",
          "exchangeId": "0x517ccc3bcab9f35e2e24143a0c1809068efc649f740846cfb6a1c5703735c1ee"
        }
      ],
      "costData": {
        "totalCostPercent": 0.199925,
        "hops": [
          {
            "poolAddress": "0xb285d4C7133d6f27BfB29224fb0D22E7EC3ddD2D",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x62fA288e3AC844dCfcE5469af4f8feb7d6f7Ba61",
            "costPercent": 0.15
          }
        ]
      }
    },
    {
      "id": "AUDm-USDC",
      "tokens": [
        {
          "address": "0x7175504C455076F15c04A2F90a8e352281F492F9",
          "symbol": "AUDm"
        },
        {
          "address": "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
          "symbol": "USDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x462fe04b4FD719Cbd04C0310365D421D02AaA19E",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x1d013077b00B28038A3f1e7A29ABa34E12e562e9",
          "token0": "0x7175504C455076F15c04A2F90a8e352281F492F9",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0xd580d237231109e6a96d67d82450611c610a805a26660c90281bdc0cd04a95c7"
        }
      ],
      "costData": {
        "totalCostPercent": 0.199925,
        "hops": [
          {
            "poolAddress": "0x462fe04b4FD719Cbd04C0310365D421D02AaA19E",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x1d013077b00B28038A3f1e7A29ABa34E12e562e9",
            "costPercent": 0.15
          }
        ]
      }
    },
    {
      "id": "CADm-USDC",
      "tokens": [
        {
          "address": "0xff4Ab19391af240c311c54200a492233052B6325",
          "symbol": "CADm"
        },
        {
          "address": "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
          "symbol": "USDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x462fe04b4FD719Cbd04C0310365D421D02AaA19E",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x62fA288e3AC844dCfcE5469af4f8feb7d6f7Ba61",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xff4Ab19391af240c311c54200a492233052B6325",
          "poolType": "Virtual",
          "exchangeId": "0x517ccc3bcab9f35e2e24143a0c1809068efc649f740846cfb6a1c5703735c1ee"
        }
      ],
      "costData": {
        "totalCostPercent": 0.199925,
        "hops": [
          {
            "poolAddress": "0x462fe04b4FD719Cbd04C0310365D421D02AaA19E",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x62fA288e3AC844dCfcE5469af4f8feb7d6f7Ba61",
            "costPercent": 0.15
          }
        ]
      }
    },
    {
      "id": "AUDm-USD₮",
      "tokens": [
        {
          "address": "0x7175504C455076F15c04A2F90a8e352281F492F9",
          "symbol": "AUDm"
        },
        {
          "address": "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
          "symbol": "USD₮"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x0FEBa760d93423D127DE1B6ABECdB60E5253228D",
          "token0": "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x1d013077b00B28038A3f1e7A29ABa34E12e562e9",
          "token0": "0x7175504C455076F15c04A2F90a8e352281F492F9",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0xd580d237231109e6a96d67d82450611c610a805a26660c90281bdc0cd04a95c7"
        }
      ],
      "costData": {
        "totalCostPercent": 0.199925,
        "hops": [
          {
            "poolAddress": "0x0FEBa760d93423D127DE1B6ABECdB60E5253228D",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x1d013077b00B28038A3f1e7A29ABa34E12e562e9",
            "costPercent": 0.15
          }
        ]
      }
    },
    {
      "id": "CADm-USD₮",
      "tokens": [
        {
          "address": "0xff4Ab19391af240c311c54200a492233052B6325",
          "symbol": "CADm"
        },
        {
          "address": "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
          "symbol": "USD₮"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x0FEBa760d93423D127DE1B6ABECdB60E5253228D",
          "token0": "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x62fA288e3AC844dCfcE5469af4f8feb7d6f7Ba61",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xff4Ab19391af240c311c54200a492233052B6325",
          "poolType": "Virtual",
          "exchangeId": "0x517ccc3bcab9f35e2e24143a0c1809068efc649f740846cfb6a1c5703735c1ee"
        }
      ],
      "costData": {
        "totalCostPercent": 0.199925,
        "hops": [
          {
            "poolAddress": "0x0FEBa760d93423D127DE1B6ABECdB60E5253228D",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x62fA288e3AC844dCfcE5469af4f8feb7d6f7Ba61",
            "costPercent": 0.15
          }
        ]
      }
    },
    {
      "id": "AUDm-CADm",
      "tokens": [
        {
          "address": "0x7175504C455076F15c04A2F90a8e352281F492F9",
          "symbol": "AUDm"
        },
        {
          "address": "0xff4Ab19391af240c311c54200a492233052B6325",
          "symbol": "CADm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x1d013077b00B28038A3f1e7A29ABa34E12e562e9",
          "token0": "0x7175504C455076F15c04A2F90a8e352281F492F9",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0xd580d237231109e6a96d67d82450611c610a805a26660c90281bdc0cd04a95c7"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x62fA288e3AC844dCfcE5469af4f8feb7d6f7Ba61",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xff4Ab19391af240c311c54200a492233052B6325",
          "poolType": "Virtual",
          "exchangeId": "0x517ccc3bcab9f35e2e24143a0c1809068efc649f740846cfb6a1c5703735c1ee"
        }
      ],
      "costData": {
        "totalCostPercent": 0.299775,
        "hops": [
          {
            "poolAddress": "0x1d013077b00B28038A3f1e7A29ABa34E12e562e9",
            "costPercent": 0.15
          },
          {
            "poolAddress": "0x62fA288e3AC844dCfcE5469af4f8feb7d6f7Ba61",
            "costPercent": 0.15
          }
        ]
      }
    },
    {
      "id": "GBPm-USDm",
      "tokens": [
        {
          "address": "0xCCF663b1fF11028f0b19058d0f7B674004a40746",
          "symbol": "GBPm"
        },
        {
          "address": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "symbol": "USDm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x8C0014afe032E4574481D8934504100bF23fCB56",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xCCF663b1fF11028f0b19058d0f7B674004a40746",
          "poolType": "FPMM"
        }
      ],
      "costData": {
        "totalCostPercent": 0.3,
        "hops": [
          {
            "poolAddress": "0x8C0014afe032E4574481D8934504100bF23fCB56",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "USDm-ZARm",
      "tokens": [
        {
          "address": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "symbol": "USDm"
        },
        {
          "address": "0x4c35853A3B4e647fD266f4de678dCc8fEC410BF6",
          "symbol": "ZARm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x6dAa327E0CbE2CE84c0F312F20b9432Fe744ed58",
          "token0": "0x4c35853A3B4e647fD266f4de678dCc8fEC410BF6",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x4206e101b13bf29e40b2bfed4cf167271c41677720f2ee786ac1bf5efac101cb"
        }
      ],
      "costData": {
        "totalCostPercent": 0.3,
        "hops": [
          {
            "poolAddress": "0x6dAa327E0CbE2CE84c0F312F20b9432Fe744ed58",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "CHFm-USDm",
      "tokens": [
        {
          "address": "0xb55a79F398E759E43C95b979163f30eC87Ee131D",
          "symbol": "CHFm"
        },
        {
          "address": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "symbol": "USDm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xbe6d2165173A29889652c7bF2Dc3a02076a22f2A",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xb55a79F398E759E43C95b979163f30eC87Ee131D",
          "poolType": "Virtual",
          "exchangeId": "0x3ddbc61433314a4b7d3cbb56a001fc4cc0f1d52d64338336d5f2083a580ce4fc"
        }
      ],
      "costData": {
        "totalCostPercent": 0.3,
        "hops": [
          {
            "poolAddress": "0xbe6d2165173A29889652c7bF2Dc3a02076a22f2A",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "PHPm-USDm",
      "tokens": [
        {
          "address": "0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B",
          "symbol": "PHPm"
        },
        {
          "address": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "symbol": "USDm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x30214Efe28Ab44D6A5c739ebA5e0729B1d4213E4",
          "token0": "0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x7952984d7278ca3417febf52815c321984ac3147ced2c02bb6a02b0bcab08413"
        }
      ],
      "costData": {
        "totalCostPercent": 0.3,
        "hops": [
          {
            "poolAddress": "0x30214Efe28Ab44D6A5c739ebA5e0729B1d4213E4",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "JPYm-USDm",
      "tokens": [
        {
          "address": "0xc45eCF20f3CD864B32D9794d6f76814aE8892e20",
          "symbol": "JPYm"
        },
        {
          "address": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "symbol": "USDm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xEB433cE1f2ce4981b76fE7ca3a96070705D8eDe4",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xc45eCF20f3CD864B32D9794d6f76814aE8892e20",
          "poolType": "Virtual",
          "exchangeId": "0x7c3b41fbd140c6fb54ff9f8f7b7b0c954606682d44ed5e56b0080f40faaf652c"
        }
      ],
      "costData": {
        "totalCostPercent": 0.3,
        "hops": [
          {
            "poolAddress": "0xEB433cE1f2ce4981b76fE7ca3a96070705D8eDe4",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "COPm-USDm",
      "tokens": [
        {
          "address": "0x8A567e2aE79CA692Bd748aB832081C45de4041eA",
          "symbol": "COPm"
        },
        {
          "address": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "symbol": "USDm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x71f55035a49C972C5C3197e874f6b7Fd94672B6E",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0x8A567e2aE79CA692Bd748aB832081C45de4041eA",
          "poolType": "Virtual",
          "exchangeId": "0x1c9378bd0973ff313a599d3effc654ba759f8ccca655ab6d6ce5bd39a212943b"
        }
      ],
      "costData": {
        "totalCostPercent": 0.3,
        "hops": [
          {
            "poolAddress": "0x71f55035a49C972C5C3197e874f6b7Fd94672B6E",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "BRLm-USDm",
      "tokens": [
        {
          "address": "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
          "symbol": "BRLm"
        },
        {
          "address": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "symbol": "USDm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x62753eC2956f84AF240b4666a130C88a83933848",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
          "poolType": "Virtual",
          "exchangeId": "0xd11d52b973ddbb983cc2087aabcafd915fc3140cf9996aacc61db9710d1bde05"
        }
      ],
      "costData": {
        "totalCostPercent": 0.3,
        "hops": [
          {
            "poolAddress": "0x62753eC2956f84AF240b4666a130C88a83933848",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "GBPm-axlUSDC",
      "tokens": [
        {
          "address": "0xCCF663b1fF11028f0b19058d0f7B674004a40746",
          "symbol": "GBPm"
        },
        {
          "address": "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          "symbol": "axlUSDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x8C0014afe032E4574481D8934504100bF23fCB56",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xCCF663b1fF11028f0b19058d0f7B674004a40746",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0xb285d4C7133d6f27BfB29224fb0D22E7EC3ddD2D",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          "poolType": "FPMM"
        }
      ],
      "costData": {
        "totalCostPercent": 0.34985,
        "hops": [
          {
            "poolAddress": "0x8C0014afe032E4574481D8934504100bF23fCB56",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0xb285d4C7133d6f27BfB29224fb0D22E7EC3ddD2D",
            "costPercent": 0.05
          }
        ]
      }
    },
    {
      "id": "GBPm-USDC",
      "tokens": [
        {
          "address": "0xCCF663b1fF11028f0b19058d0f7B674004a40746",
          "symbol": "GBPm"
        },
        {
          "address": "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
          "symbol": "USDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x8C0014afe032E4574481D8934504100bF23fCB56",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xCCF663b1fF11028f0b19058d0f7B674004a40746",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x462fe04b4FD719Cbd04C0310365D421D02AaA19E",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
          "poolType": "FPMM"
        }
      ],
      "costData": {
        "totalCostPercent": 0.34985,
        "hops": [
          {
            "poolAddress": "0x8C0014afe032E4574481D8934504100bF23fCB56",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x462fe04b4FD719Cbd04C0310365D421D02AaA19E",
            "costPercent": 0.05
          }
        ]
      }
    },
    {
      "id": "GBPm-USD₮",
      "tokens": [
        {
          "address": "0xCCF663b1fF11028f0b19058d0f7B674004a40746",
          "symbol": "GBPm"
        },
        {
          "address": "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
          "symbol": "USD₮"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x8C0014afe032E4574481D8934504100bF23fCB56",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xCCF663b1fF11028f0b19058d0f7B674004a40746",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x0FEBa760d93423D127DE1B6ABECdB60E5253228D",
          "token0": "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "FPMM"
        }
      ],
      "costData": {
        "totalCostPercent": 0.34985,
        "hops": [
          {
            "poolAddress": "0x8C0014afe032E4574481D8934504100bF23fCB56",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x0FEBa760d93423D127DE1B6ABECdB60E5253228D",
            "costPercent": 0.05
          }
        ]
      }
    },
    {
      "id": "ZARm-axlUSDC",
      "tokens": [
        {
          "address": "0x4c35853A3B4e647fD266f4de678dCc8fEC410BF6",
          "symbol": "ZARm"
        },
        {
          "address": "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          "symbol": "axlUSDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0xb285d4C7133d6f27BfB29224fb0D22E7EC3ddD2D",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x6dAa327E0CbE2CE84c0F312F20b9432Fe744ed58",
          "token0": "0x4c35853A3B4e647fD266f4de678dCc8fEC410BF6",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x4206e101b13bf29e40b2bfed4cf167271c41677720f2ee786ac1bf5efac101cb"
        }
      ],
      "costData": {
        "totalCostPercent": 0.34985,
        "hops": [
          {
            "poolAddress": "0xb285d4C7133d6f27BfB29224fb0D22E7EC3ddD2D",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x6dAa327E0CbE2CE84c0F312F20b9432Fe744ed58",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "CHFm-axlUSDC",
      "tokens": [
        {
          "address": "0xb55a79F398E759E43C95b979163f30eC87Ee131D",
          "symbol": "CHFm"
        },
        {
          "address": "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          "symbol": "axlUSDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0xb285d4C7133d6f27BfB29224fb0D22E7EC3ddD2D",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xbe6d2165173A29889652c7bF2Dc3a02076a22f2A",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xb55a79F398E759E43C95b979163f30eC87Ee131D",
          "poolType": "Virtual",
          "exchangeId": "0x3ddbc61433314a4b7d3cbb56a001fc4cc0f1d52d64338336d5f2083a580ce4fc"
        }
      ],
      "costData": {
        "totalCostPercent": 0.34985,
        "hops": [
          {
            "poolAddress": "0xb285d4C7133d6f27BfB29224fb0D22E7EC3ddD2D",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0xbe6d2165173A29889652c7bF2Dc3a02076a22f2A",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "PHPm-axlUSDC",
      "tokens": [
        {
          "address": "0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B",
          "symbol": "PHPm"
        },
        {
          "address": "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          "symbol": "axlUSDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0xb285d4C7133d6f27BfB29224fb0D22E7EC3ddD2D",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x30214Efe28Ab44D6A5c739ebA5e0729B1d4213E4",
          "token0": "0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x7952984d7278ca3417febf52815c321984ac3147ced2c02bb6a02b0bcab08413"
        }
      ],
      "costData": {
        "totalCostPercent": 0.34985,
        "hops": [
          {
            "poolAddress": "0xb285d4C7133d6f27BfB29224fb0D22E7EC3ddD2D",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x30214Efe28Ab44D6A5c739ebA5e0729B1d4213E4",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "JPYm-axlUSDC",
      "tokens": [
        {
          "address": "0xc45eCF20f3CD864B32D9794d6f76814aE8892e20",
          "symbol": "JPYm"
        },
        {
          "address": "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          "symbol": "axlUSDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0xb285d4C7133d6f27BfB29224fb0D22E7EC3ddD2D",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xEB433cE1f2ce4981b76fE7ca3a96070705D8eDe4",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xc45eCF20f3CD864B32D9794d6f76814aE8892e20",
          "poolType": "Virtual",
          "exchangeId": "0x7c3b41fbd140c6fb54ff9f8f7b7b0c954606682d44ed5e56b0080f40faaf652c"
        }
      ],
      "costData": {
        "totalCostPercent": 0.34985,
        "hops": [
          {
            "poolAddress": "0xb285d4C7133d6f27BfB29224fb0D22E7EC3ddD2D",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0xEB433cE1f2ce4981b76fE7ca3a96070705D8eDe4",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "COPm-axlUSDC",
      "tokens": [
        {
          "address": "0x8A567e2aE79CA692Bd748aB832081C45de4041eA",
          "symbol": "COPm"
        },
        {
          "address": "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          "symbol": "axlUSDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0xb285d4C7133d6f27BfB29224fb0D22E7EC3ddD2D",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x71f55035a49C972C5C3197e874f6b7Fd94672B6E",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0x8A567e2aE79CA692Bd748aB832081C45de4041eA",
          "poolType": "Virtual",
          "exchangeId": "0x1c9378bd0973ff313a599d3effc654ba759f8ccca655ab6d6ce5bd39a212943b"
        }
      ],
      "costData": {
        "totalCostPercent": 0.34985,
        "hops": [
          {
            "poolAddress": "0xb285d4C7133d6f27BfB29224fb0D22E7EC3ddD2D",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x71f55035a49C972C5C3197e874f6b7Fd94672B6E",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "BRLm-axlUSDC",
      "tokens": [
        {
          "address": "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
          "symbol": "BRLm"
        },
        {
          "address": "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          "symbol": "axlUSDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0xb285d4C7133d6f27BfB29224fb0D22E7EC3ddD2D",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x62753eC2956f84AF240b4666a130C88a83933848",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
          "poolType": "Virtual",
          "exchangeId": "0xd11d52b973ddbb983cc2087aabcafd915fc3140cf9996aacc61db9710d1bde05"
        }
      ],
      "costData": {
        "totalCostPercent": 0.34985,
        "hops": [
          {
            "poolAddress": "0xb285d4C7133d6f27BfB29224fb0D22E7EC3ddD2D",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x62753eC2956f84AF240b4666a130C88a83933848",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "USDC-ZARm",
      "tokens": [
        {
          "address": "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
          "symbol": "USDC"
        },
        {
          "address": "0x4c35853A3B4e647fD266f4de678dCc8fEC410BF6",
          "symbol": "ZARm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x462fe04b4FD719Cbd04C0310365D421D02AaA19E",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x6dAa327E0CbE2CE84c0F312F20b9432Fe744ed58",
          "token0": "0x4c35853A3B4e647fD266f4de678dCc8fEC410BF6",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x4206e101b13bf29e40b2bfed4cf167271c41677720f2ee786ac1bf5efac101cb"
        }
      ],
      "costData": {
        "totalCostPercent": 0.34985,
        "hops": [
          {
            "poolAddress": "0x462fe04b4FD719Cbd04C0310365D421D02AaA19E",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x6dAa327E0CbE2CE84c0F312F20b9432Fe744ed58",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "CHFm-USDC",
      "tokens": [
        {
          "address": "0xb55a79F398E759E43C95b979163f30eC87Ee131D",
          "symbol": "CHFm"
        },
        {
          "address": "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
          "symbol": "USDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x462fe04b4FD719Cbd04C0310365D421D02AaA19E",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xbe6d2165173A29889652c7bF2Dc3a02076a22f2A",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xb55a79F398E759E43C95b979163f30eC87Ee131D",
          "poolType": "Virtual",
          "exchangeId": "0x3ddbc61433314a4b7d3cbb56a001fc4cc0f1d52d64338336d5f2083a580ce4fc"
        }
      ],
      "costData": {
        "totalCostPercent": 0.34985,
        "hops": [
          {
            "poolAddress": "0x462fe04b4FD719Cbd04C0310365D421D02AaA19E",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0xbe6d2165173A29889652c7bF2Dc3a02076a22f2A",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "PHPm-USDC",
      "tokens": [
        {
          "address": "0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B",
          "symbol": "PHPm"
        },
        {
          "address": "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
          "symbol": "USDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x462fe04b4FD719Cbd04C0310365D421D02AaA19E",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x30214Efe28Ab44D6A5c739ebA5e0729B1d4213E4",
          "token0": "0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x7952984d7278ca3417febf52815c321984ac3147ced2c02bb6a02b0bcab08413"
        }
      ],
      "costData": {
        "totalCostPercent": 0.34985,
        "hops": [
          {
            "poolAddress": "0x462fe04b4FD719Cbd04C0310365D421D02AaA19E",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x30214Efe28Ab44D6A5c739ebA5e0729B1d4213E4",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "JPYm-USDC",
      "tokens": [
        {
          "address": "0xc45eCF20f3CD864B32D9794d6f76814aE8892e20",
          "symbol": "JPYm"
        },
        {
          "address": "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
          "symbol": "USDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x462fe04b4FD719Cbd04C0310365D421D02AaA19E",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xEB433cE1f2ce4981b76fE7ca3a96070705D8eDe4",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xc45eCF20f3CD864B32D9794d6f76814aE8892e20",
          "poolType": "Virtual",
          "exchangeId": "0x7c3b41fbd140c6fb54ff9f8f7b7b0c954606682d44ed5e56b0080f40faaf652c"
        }
      ],
      "costData": {
        "totalCostPercent": 0.34985,
        "hops": [
          {
            "poolAddress": "0x462fe04b4FD719Cbd04C0310365D421D02AaA19E",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0xEB433cE1f2ce4981b76fE7ca3a96070705D8eDe4",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "COPm-USDC",
      "tokens": [
        {
          "address": "0x8A567e2aE79CA692Bd748aB832081C45de4041eA",
          "symbol": "COPm"
        },
        {
          "address": "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
          "symbol": "USDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x462fe04b4FD719Cbd04C0310365D421D02AaA19E",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x71f55035a49C972C5C3197e874f6b7Fd94672B6E",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0x8A567e2aE79CA692Bd748aB832081C45de4041eA",
          "poolType": "Virtual",
          "exchangeId": "0x1c9378bd0973ff313a599d3effc654ba759f8ccca655ab6d6ce5bd39a212943b"
        }
      ],
      "costData": {
        "totalCostPercent": 0.34985,
        "hops": [
          {
            "poolAddress": "0x462fe04b4FD719Cbd04C0310365D421D02AaA19E",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x71f55035a49C972C5C3197e874f6b7Fd94672B6E",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "BRLm-USDC",
      "tokens": [
        {
          "address": "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
          "symbol": "BRLm"
        },
        {
          "address": "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
          "symbol": "USDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x462fe04b4FD719Cbd04C0310365D421D02AaA19E",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x62753eC2956f84AF240b4666a130C88a83933848",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
          "poolType": "Virtual",
          "exchangeId": "0xd11d52b973ddbb983cc2087aabcafd915fc3140cf9996aacc61db9710d1bde05"
        }
      ],
      "costData": {
        "totalCostPercent": 0.34985,
        "hops": [
          {
            "poolAddress": "0x462fe04b4FD719Cbd04C0310365D421D02AaA19E",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x62753eC2956f84AF240b4666a130C88a83933848",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "USD₮-ZARm",
      "tokens": [
        {
          "address": "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
          "symbol": "USD₮"
        },
        {
          "address": "0x4c35853A3B4e647fD266f4de678dCc8fEC410BF6",
          "symbol": "ZARm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x0FEBa760d93423D127DE1B6ABECdB60E5253228D",
          "token0": "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x6dAa327E0CbE2CE84c0F312F20b9432Fe744ed58",
          "token0": "0x4c35853A3B4e647fD266f4de678dCc8fEC410BF6",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x4206e101b13bf29e40b2bfed4cf167271c41677720f2ee786ac1bf5efac101cb"
        }
      ],
      "costData": {
        "totalCostPercent": 0.34985,
        "hops": [
          {
            "poolAddress": "0x0FEBa760d93423D127DE1B6ABECdB60E5253228D",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x6dAa327E0CbE2CE84c0F312F20b9432Fe744ed58",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "CHFm-USD₮",
      "tokens": [
        {
          "address": "0xb55a79F398E759E43C95b979163f30eC87Ee131D",
          "symbol": "CHFm"
        },
        {
          "address": "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
          "symbol": "USD₮"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x0FEBa760d93423D127DE1B6ABECdB60E5253228D",
          "token0": "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xbe6d2165173A29889652c7bF2Dc3a02076a22f2A",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xb55a79F398E759E43C95b979163f30eC87Ee131D",
          "poolType": "Virtual",
          "exchangeId": "0x3ddbc61433314a4b7d3cbb56a001fc4cc0f1d52d64338336d5f2083a580ce4fc"
        }
      ],
      "costData": {
        "totalCostPercent": 0.34985,
        "hops": [
          {
            "poolAddress": "0x0FEBa760d93423D127DE1B6ABECdB60E5253228D",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0xbe6d2165173A29889652c7bF2Dc3a02076a22f2A",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "PHPm-USD₮",
      "tokens": [
        {
          "address": "0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B",
          "symbol": "PHPm"
        },
        {
          "address": "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
          "symbol": "USD₮"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x0FEBa760d93423D127DE1B6ABECdB60E5253228D",
          "token0": "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x30214Efe28Ab44D6A5c739ebA5e0729B1d4213E4",
          "token0": "0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x7952984d7278ca3417febf52815c321984ac3147ced2c02bb6a02b0bcab08413"
        }
      ],
      "costData": {
        "totalCostPercent": 0.34985,
        "hops": [
          {
            "poolAddress": "0x0FEBa760d93423D127DE1B6ABECdB60E5253228D",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x30214Efe28Ab44D6A5c739ebA5e0729B1d4213E4",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "JPYm-USD₮",
      "tokens": [
        {
          "address": "0xc45eCF20f3CD864B32D9794d6f76814aE8892e20",
          "symbol": "JPYm"
        },
        {
          "address": "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
          "symbol": "USD₮"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x0FEBa760d93423D127DE1B6ABECdB60E5253228D",
          "token0": "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xEB433cE1f2ce4981b76fE7ca3a96070705D8eDe4",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xc45eCF20f3CD864B32D9794d6f76814aE8892e20",
          "poolType": "Virtual",
          "exchangeId": "0x7c3b41fbd140c6fb54ff9f8f7b7b0c954606682d44ed5e56b0080f40faaf652c"
        }
      ],
      "costData": {
        "totalCostPercent": 0.34985,
        "hops": [
          {
            "poolAddress": "0x0FEBa760d93423D127DE1B6ABECdB60E5253228D",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0xEB433cE1f2ce4981b76fE7ca3a96070705D8eDe4",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "COPm-USD₮",
      "tokens": [
        {
          "address": "0x8A567e2aE79CA692Bd748aB832081C45de4041eA",
          "symbol": "COPm"
        },
        {
          "address": "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
          "symbol": "USD₮"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x0FEBa760d93423D127DE1B6ABECdB60E5253228D",
          "token0": "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x71f55035a49C972C5C3197e874f6b7Fd94672B6E",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0x8A567e2aE79CA692Bd748aB832081C45de4041eA",
          "poolType": "Virtual",
          "exchangeId": "0x1c9378bd0973ff313a599d3effc654ba759f8ccca655ab6d6ce5bd39a212943b"
        }
      ],
      "costData": {
        "totalCostPercent": 0.34985,
        "hops": [
          {
            "poolAddress": "0x0FEBa760d93423D127DE1B6ABECdB60E5253228D",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x71f55035a49C972C5C3197e874f6b7Fd94672B6E",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "BRLm-USD₮",
      "tokens": [
        {
          "address": "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
          "symbol": "BRLm"
        },
        {
          "address": "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
          "symbol": "USD₮"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x0FEBa760d93423D127DE1B6ABECdB60E5253228D",
          "token0": "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x62753eC2956f84AF240b4666a130C88a83933848",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
          "poolType": "Virtual",
          "exchangeId": "0xd11d52b973ddbb983cc2087aabcafd915fc3140cf9996aacc61db9710d1bde05"
        }
      ],
      "costData": {
        "totalCostPercent": 0.34985,
        "hops": [
          {
            "poolAddress": "0x0FEBa760d93423D127DE1B6ABECdB60E5253228D",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x62753eC2956f84AF240b4666a130C88a83933848",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "AUDm-GBPm",
      "tokens": [
        {
          "address": "0x7175504C455076F15c04A2F90a8e352281F492F9",
          "symbol": "AUDm"
        },
        {
          "address": "0xCCF663b1fF11028f0b19058d0f7B674004a40746",
          "symbol": "GBPm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x8C0014afe032E4574481D8934504100bF23fCB56",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xCCF663b1fF11028f0b19058d0f7B674004a40746",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x1d013077b00B28038A3f1e7A29ABa34E12e562e9",
          "token0": "0x7175504C455076F15c04A2F90a8e352281F492F9",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0xd580d237231109e6a96d67d82450611c610a805a26660c90281bdc0cd04a95c7"
        }
      ],
      "costData": {
        "totalCostPercent": 0.44955,
        "hops": [
          {
            "poolAddress": "0x8C0014afe032E4574481D8934504100bF23fCB56",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x1d013077b00B28038A3f1e7A29ABa34E12e562e9",
            "costPercent": 0.15
          }
        ]
      }
    },
    {
      "id": "CADm-GBPm",
      "tokens": [
        {
          "address": "0xff4Ab19391af240c311c54200a492233052B6325",
          "symbol": "CADm"
        },
        {
          "address": "0xCCF663b1fF11028f0b19058d0f7B674004a40746",
          "symbol": "GBPm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x8C0014afe032E4574481D8934504100bF23fCB56",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xCCF663b1fF11028f0b19058d0f7B674004a40746",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x62fA288e3AC844dCfcE5469af4f8feb7d6f7Ba61",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xff4Ab19391af240c311c54200a492233052B6325",
          "poolType": "Virtual",
          "exchangeId": "0x517ccc3bcab9f35e2e24143a0c1809068efc649f740846cfb6a1c5703735c1ee"
        }
      ],
      "costData": {
        "totalCostPercent": 0.44955,
        "hops": [
          {
            "poolAddress": "0x8C0014afe032E4574481D8934504100bF23fCB56",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x62fA288e3AC844dCfcE5469af4f8feb7d6f7Ba61",
            "costPercent": 0.15
          }
        ]
      }
    },
    {
      "id": "AUDm-ZARm",
      "tokens": [
        {
          "address": "0x7175504C455076F15c04A2F90a8e352281F492F9",
          "symbol": "AUDm"
        },
        {
          "address": "0x4c35853A3B4e647fD266f4de678dCc8fEC410BF6",
          "symbol": "ZARm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x6dAa327E0CbE2CE84c0F312F20b9432Fe744ed58",
          "token0": "0x4c35853A3B4e647fD266f4de678dCc8fEC410BF6",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x4206e101b13bf29e40b2bfed4cf167271c41677720f2ee786ac1bf5efac101cb"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x1d013077b00B28038A3f1e7A29ABa34E12e562e9",
          "token0": "0x7175504C455076F15c04A2F90a8e352281F492F9",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0xd580d237231109e6a96d67d82450611c610a805a26660c90281bdc0cd04a95c7"
        }
      ],
      "costData": {
        "totalCostPercent": 0.44955,
        "hops": [
          {
            "poolAddress": "0x6dAa327E0CbE2CE84c0F312F20b9432Fe744ed58",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x1d013077b00B28038A3f1e7A29ABa34E12e562e9",
            "costPercent": 0.15
          }
        ]
      }
    },
    {
      "id": "CADm-ZARm",
      "tokens": [
        {
          "address": "0xff4Ab19391af240c311c54200a492233052B6325",
          "symbol": "CADm"
        },
        {
          "address": "0x4c35853A3B4e647fD266f4de678dCc8fEC410BF6",
          "symbol": "ZARm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x6dAa327E0CbE2CE84c0F312F20b9432Fe744ed58",
          "token0": "0x4c35853A3B4e647fD266f4de678dCc8fEC410BF6",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x4206e101b13bf29e40b2bfed4cf167271c41677720f2ee786ac1bf5efac101cb"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x62fA288e3AC844dCfcE5469af4f8feb7d6f7Ba61",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xff4Ab19391af240c311c54200a492233052B6325",
          "poolType": "Virtual",
          "exchangeId": "0x517ccc3bcab9f35e2e24143a0c1809068efc649f740846cfb6a1c5703735c1ee"
        }
      ],
      "costData": {
        "totalCostPercent": 0.44955,
        "hops": [
          {
            "poolAddress": "0x6dAa327E0CbE2CE84c0F312F20b9432Fe744ed58",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x62fA288e3AC844dCfcE5469af4f8feb7d6f7Ba61",
            "costPercent": 0.15
          }
        ]
      }
    },
    {
      "id": "AUDm-CHFm",
      "tokens": [
        {
          "address": "0x7175504C455076F15c04A2F90a8e352281F492F9",
          "symbol": "AUDm"
        },
        {
          "address": "0xb55a79F398E759E43C95b979163f30eC87Ee131D",
          "symbol": "CHFm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x1d013077b00B28038A3f1e7A29ABa34E12e562e9",
          "token0": "0x7175504C455076F15c04A2F90a8e352281F492F9",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0xd580d237231109e6a96d67d82450611c610a805a26660c90281bdc0cd04a95c7"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xbe6d2165173A29889652c7bF2Dc3a02076a22f2A",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xb55a79F398E759E43C95b979163f30eC87Ee131D",
          "poolType": "Virtual",
          "exchangeId": "0x3ddbc61433314a4b7d3cbb56a001fc4cc0f1d52d64338336d5f2083a580ce4fc"
        }
      ],
      "costData": {
        "totalCostPercent": 0.44955,
        "hops": [
          {
            "poolAddress": "0x1d013077b00B28038A3f1e7A29ABa34E12e562e9",
            "costPercent": 0.15
          },
          {
            "poolAddress": "0xbe6d2165173A29889652c7bF2Dc3a02076a22f2A",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "AUDm-PHPm",
      "tokens": [
        {
          "address": "0x7175504C455076F15c04A2F90a8e352281F492F9",
          "symbol": "AUDm"
        },
        {
          "address": "0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B",
          "symbol": "PHPm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x1d013077b00B28038A3f1e7A29ABa34E12e562e9",
          "token0": "0x7175504C455076F15c04A2F90a8e352281F492F9",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0xd580d237231109e6a96d67d82450611c610a805a26660c90281bdc0cd04a95c7"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x30214Efe28Ab44D6A5c739ebA5e0729B1d4213E4",
          "token0": "0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x7952984d7278ca3417febf52815c321984ac3147ced2c02bb6a02b0bcab08413"
        }
      ],
      "costData": {
        "totalCostPercent": 0.44955,
        "hops": [
          {
            "poolAddress": "0x1d013077b00B28038A3f1e7A29ABa34E12e562e9",
            "costPercent": 0.15
          },
          {
            "poolAddress": "0x30214Efe28Ab44D6A5c739ebA5e0729B1d4213E4",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "AUDm-JPYm",
      "tokens": [
        {
          "address": "0x7175504C455076F15c04A2F90a8e352281F492F9",
          "symbol": "AUDm"
        },
        {
          "address": "0xc45eCF20f3CD864B32D9794d6f76814aE8892e20",
          "symbol": "JPYm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x1d013077b00B28038A3f1e7A29ABa34E12e562e9",
          "token0": "0x7175504C455076F15c04A2F90a8e352281F492F9",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0xd580d237231109e6a96d67d82450611c610a805a26660c90281bdc0cd04a95c7"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xEB433cE1f2ce4981b76fE7ca3a96070705D8eDe4",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xc45eCF20f3CD864B32D9794d6f76814aE8892e20",
          "poolType": "Virtual",
          "exchangeId": "0x7c3b41fbd140c6fb54ff9f8f7b7b0c954606682d44ed5e56b0080f40faaf652c"
        }
      ],
      "costData": {
        "totalCostPercent": 0.44955,
        "hops": [
          {
            "poolAddress": "0x1d013077b00B28038A3f1e7A29ABa34E12e562e9",
            "costPercent": 0.15
          },
          {
            "poolAddress": "0xEB433cE1f2ce4981b76fE7ca3a96070705D8eDe4",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "AUDm-COPm",
      "tokens": [
        {
          "address": "0x7175504C455076F15c04A2F90a8e352281F492F9",
          "symbol": "AUDm"
        },
        {
          "address": "0x8A567e2aE79CA692Bd748aB832081C45de4041eA",
          "symbol": "COPm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x1d013077b00B28038A3f1e7A29ABa34E12e562e9",
          "token0": "0x7175504C455076F15c04A2F90a8e352281F492F9",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0xd580d237231109e6a96d67d82450611c610a805a26660c90281bdc0cd04a95c7"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x71f55035a49C972C5C3197e874f6b7Fd94672B6E",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0x8A567e2aE79CA692Bd748aB832081C45de4041eA",
          "poolType": "Virtual",
          "exchangeId": "0x1c9378bd0973ff313a599d3effc654ba759f8ccca655ab6d6ce5bd39a212943b"
        }
      ],
      "costData": {
        "totalCostPercent": 0.44955,
        "hops": [
          {
            "poolAddress": "0x1d013077b00B28038A3f1e7A29ABa34E12e562e9",
            "costPercent": 0.15
          },
          {
            "poolAddress": "0x71f55035a49C972C5C3197e874f6b7Fd94672B6E",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "AUDm-BRLm",
      "tokens": [
        {
          "address": "0x7175504C455076F15c04A2F90a8e352281F492F9",
          "symbol": "AUDm"
        },
        {
          "address": "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
          "symbol": "BRLm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x1d013077b00B28038A3f1e7A29ABa34E12e562e9",
          "token0": "0x7175504C455076F15c04A2F90a8e352281F492F9",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0xd580d237231109e6a96d67d82450611c610a805a26660c90281bdc0cd04a95c7"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x62753eC2956f84AF240b4666a130C88a83933848",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
          "poolType": "Virtual",
          "exchangeId": "0xd11d52b973ddbb983cc2087aabcafd915fc3140cf9996aacc61db9710d1bde05"
        }
      ],
      "costData": {
        "totalCostPercent": 0.44955,
        "hops": [
          {
            "poolAddress": "0x1d013077b00B28038A3f1e7A29ABa34E12e562e9",
            "costPercent": 0.15
          },
          {
            "poolAddress": "0x62753eC2956f84AF240b4666a130C88a83933848",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "CADm-CHFm",
      "tokens": [
        {
          "address": "0xff4Ab19391af240c311c54200a492233052B6325",
          "symbol": "CADm"
        },
        {
          "address": "0xb55a79F398E759E43C95b979163f30eC87Ee131D",
          "symbol": "CHFm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xbe6d2165173A29889652c7bF2Dc3a02076a22f2A",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xb55a79F398E759E43C95b979163f30eC87Ee131D",
          "poolType": "Virtual",
          "exchangeId": "0x3ddbc61433314a4b7d3cbb56a001fc4cc0f1d52d64338336d5f2083a580ce4fc"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x62fA288e3AC844dCfcE5469af4f8feb7d6f7Ba61",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xff4Ab19391af240c311c54200a492233052B6325",
          "poolType": "Virtual",
          "exchangeId": "0x517ccc3bcab9f35e2e24143a0c1809068efc649f740846cfb6a1c5703735c1ee"
        }
      ],
      "costData": {
        "totalCostPercent": 0.44955,
        "hops": [
          {
            "poolAddress": "0xbe6d2165173A29889652c7bF2Dc3a02076a22f2A",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x62fA288e3AC844dCfcE5469af4f8feb7d6f7Ba61",
            "costPercent": 0.15
          }
        ]
      }
    },
    {
      "id": "CADm-PHPm",
      "tokens": [
        {
          "address": "0xff4Ab19391af240c311c54200a492233052B6325",
          "symbol": "CADm"
        },
        {
          "address": "0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B",
          "symbol": "PHPm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x62fA288e3AC844dCfcE5469af4f8feb7d6f7Ba61",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xff4Ab19391af240c311c54200a492233052B6325",
          "poolType": "Virtual",
          "exchangeId": "0x517ccc3bcab9f35e2e24143a0c1809068efc649f740846cfb6a1c5703735c1ee"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x30214Efe28Ab44D6A5c739ebA5e0729B1d4213E4",
          "token0": "0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x7952984d7278ca3417febf52815c321984ac3147ced2c02bb6a02b0bcab08413"
        }
      ],
      "costData": {
        "totalCostPercent": 0.44955,
        "hops": [
          {
            "poolAddress": "0x62fA288e3AC844dCfcE5469af4f8feb7d6f7Ba61",
            "costPercent": 0.15
          },
          {
            "poolAddress": "0x30214Efe28Ab44D6A5c739ebA5e0729B1d4213E4",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "CADm-JPYm",
      "tokens": [
        {
          "address": "0xff4Ab19391af240c311c54200a492233052B6325",
          "symbol": "CADm"
        },
        {
          "address": "0xc45eCF20f3CD864B32D9794d6f76814aE8892e20",
          "symbol": "JPYm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x62fA288e3AC844dCfcE5469af4f8feb7d6f7Ba61",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xff4Ab19391af240c311c54200a492233052B6325",
          "poolType": "Virtual",
          "exchangeId": "0x517ccc3bcab9f35e2e24143a0c1809068efc649f740846cfb6a1c5703735c1ee"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xEB433cE1f2ce4981b76fE7ca3a96070705D8eDe4",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xc45eCF20f3CD864B32D9794d6f76814aE8892e20",
          "poolType": "Virtual",
          "exchangeId": "0x7c3b41fbd140c6fb54ff9f8f7b7b0c954606682d44ed5e56b0080f40faaf652c"
        }
      ],
      "costData": {
        "totalCostPercent": 0.44955,
        "hops": [
          {
            "poolAddress": "0x62fA288e3AC844dCfcE5469af4f8feb7d6f7Ba61",
            "costPercent": 0.15
          },
          {
            "poolAddress": "0xEB433cE1f2ce4981b76fE7ca3a96070705D8eDe4",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "CADm-COPm",
      "tokens": [
        {
          "address": "0xff4Ab19391af240c311c54200a492233052B6325",
          "symbol": "CADm"
        },
        {
          "address": "0x8A567e2aE79CA692Bd748aB832081C45de4041eA",
          "symbol": "COPm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x62fA288e3AC844dCfcE5469af4f8feb7d6f7Ba61",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xff4Ab19391af240c311c54200a492233052B6325",
          "poolType": "Virtual",
          "exchangeId": "0x517ccc3bcab9f35e2e24143a0c1809068efc649f740846cfb6a1c5703735c1ee"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x71f55035a49C972C5C3197e874f6b7Fd94672B6E",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0x8A567e2aE79CA692Bd748aB832081C45de4041eA",
          "poolType": "Virtual",
          "exchangeId": "0x1c9378bd0973ff313a599d3effc654ba759f8ccca655ab6d6ce5bd39a212943b"
        }
      ],
      "costData": {
        "totalCostPercent": 0.44955,
        "hops": [
          {
            "poolAddress": "0x62fA288e3AC844dCfcE5469af4f8feb7d6f7Ba61",
            "costPercent": 0.15
          },
          {
            "poolAddress": "0x71f55035a49C972C5C3197e874f6b7Fd94672B6E",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "BRLm-CADm",
      "tokens": [
        {
          "address": "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
          "symbol": "BRLm"
        },
        {
          "address": "0xff4Ab19391af240c311c54200a492233052B6325",
          "symbol": "CADm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x62fA288e3AC844dCfcE5469af4f8feb7d6f7Ba61",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xff4Ab19391af240c311c54200a492233052B6325",
          "poolType": "Virtual",
          "exchangeId": "0x517ccc3bcab9f35e2e24143a0c1809068efc649f740846cfb6a1c5703735c1ee"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x62753eC2956f84AF240b4666a130C88a83933848",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
          "poolType": "Virtual",
          "exchangeId": "0xd11d52b973ddbb983cc2087aabcafd915fc3140cf9996aacc61db9710d1bde05"
        }
      ],
      "costData": {
        "totalCostPercent": 0.44955,
        "hops": [
          {
            "poolAddress": "0x62fA288e3AC844dCfcE5469af4f8feb7d6f7Ba61",
            "costPercent": 0.15
          },
          {
            "poolAddress": "0x62753eC2956f84AF240b4666a130C88a83933848",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "GBPm-ZARm",
      "tokens": [
        {
          "address": "0xCCF663b1fF11028f0b19058d0f7B674004a40746",
          "symbol": "GBPm"
        },
        {
          "address": "0x4c35853A3B4e647fD266f4de678dCc8fEC410BF6",
          "symbol": "ZARm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x8C0014afe032E4574481D8934504100bF23fCB56",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xCCF663b1fF11028f0b19058d0f7B674004a40746",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x6dAa327E0CbE2CE84c0F312F20b9432Fe744ed58",
          "token0": "0x4c35853A3B4e647fD266f4de678dCc8fEC410BF6",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x4206e101b13bf29e40b2bfed4cf167271c41677720f2ee786ac1bf5efac101cb"
        }
      ],
      "costData": {
        "totalCostPercent": 0.5991,
        "hops": [
          {
            "poolAddress": "0x8C0014afe032E4574481D8934504100bF23fCB56",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x6dAa327E0CbE2CE84c0F312F20b9432Fe744ed58",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "CHFm-GBPm",
      "tokens": [
        {
          "address": "0xb55a79F398E759E43C95b979163f30eC87Ee131D",
          "symbol": "CHFm"
        },
        {
          "address": "0xCCF663b1fF11028f0b19058d0f7B674004a40746",
          "symbol": "GBPm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x8C0014afe032E4574481D8934504100bF23fCB56",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xCCF663b1fF11028f0b19058d0f7B674004a40746",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xbe6d2165173A29889652c7bF2Dc3a02076a22f2A",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xb55a79F398E759E43C95b979163f30eC87Ee131D",
          "poolType": "Virtual",
          "exchangeId": "0x3ddbc61433314a4b7d3cbb56a001fc4cc0f1d52d64338336d5f2083a580ce4fc"
        }
      ],
      "costData": {
        "totalCostPercent": 0.5991,
        "hops": [
          {
            "poolAddress": "0x8C0014afe032E4574481D8934504100bF23fCB56",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0xbe6d2165173A29889652c7bF2Dc3a02076a22f2A",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "GBPm-PHPm",
      "tokens": [
        {
          "address": "0xCCF663b1fF11028f0b19058d0f7B674004a40746",
          "symbol": "GBPm"
        },
        {
          "address": "0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B",
          "symbol": "PHPm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x8C0014afe032E4574481D8934504100bF23fCB56",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xCCF663b1fF11028f0b19058d0f7B674004a40746",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x30214Efe28Ab44D6A5c739ebA5e0729B1d4213E4",
          "token0": "0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x7952984d7278ca3417febf52815c321984ac3147ced2c02bb6a02b0bcab08413"
        }
      ],
      "costData": {
        "totalCostPercent": 0.5991,
        "hops": [
          {
            "poolAddress": "0x8C0014afe032E4574481D8934504100bF23fCB56",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x30214Efe28Ab44D6A5c739ebA5e0729B1d4213E4",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "GBPm-JPYm",
      "tokens": [
        {
          "address": "0xCCF663b1fF11028f0b19058d0f7B674004a40746",
          "symbol": "GBPm"
        },
        {
          "address": "0xc45eCF20f3CD864B32D9794d6f76814aE8892e20",
          "symbol": "JPYm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x8C0014afe032E4574481D8934504100bF23fCB56",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xCCF663b1fF11028f0b19058d0f7B674004a40746",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xEB433cE1f2ce4981b76fE7ca3a96070705D8eDe4",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xc45eCF20f3CD864B32D9794d6f76814aE8892e20",
          "poolType": "Virtual",
          "exchangeId": "0x7c3b41fbd140c6fb54ff9f8f7b7b0c954606682d44ed5e56b0080f40faaf652c"
        }
      ],
      "costData": {
        "totalCostPercent": 0.5991,
        "hops": [
          {
            "poolAddress": "0x8C0014afe032E4574481D8934504100bF23fCB56",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0xEB433cE1f2ce4981b76fE7ca3a96070705D8eDe4",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "COPm-GBPm",
      "tokens": [
        {
          "address": "0x8A567e2aE79CA692Bd748aB832081C45de4041eA",
          "symbol": "COPm"
        },
        {
          "address": "0xCCF663b1fF11028f0b19058d0f7B674004a40746",
          "symbol": "GBPm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x8C0014afe032E4574481D8934504100bF23fCB56",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xCCF663b1fF11028f0b19058d0f7B674004a40746",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x71f55035a49C972C5C3197e874f6b7Fd94672B6E",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0x8A567e2aE79CA692Bd748aB832081C45de4041eA",
          "poolType": "Virtual",
          "exchangeId": "0x1c9378bd0973ff313a599d3effc654ba759f8ccca655ab6d6ce5bd39a212943b"
        }
      ],
      "costData": {
        "totalCostPercent": 0.5991,
        "hops": [
          {
            "poolAddress": "0x8C0014afe032E4574481D8934504100bF23fCB56",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x71f55035a49C972C5C3197e874f6b7Fd94672B6E",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "BRLm-GBPm",
      "tokens": [
        {
          "address": "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
          "symbol": "BRLm"
        },
        {
          "address": "0xCCF663b1fF11028f0b19058d0f7B674004a40746",
          "symbol": "GBPm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x8C0014afe032E4574481D8934504100bF23fCB56",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xCCF663b1fF11028f0b19058d0f7B674004a40746",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x62753eC2956f84AF240b4666a130C88a83933848",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
          "poolType": "Virtual",
          "exchangeId": "0xd11d52b973ddbb983cc2087aabcafd915fc3140cf9996aacc61db9710d1bde05"
        }
      ],
      "costData": {
        "totalCostPercent": 0.5991,
        "hops": [
          {
            "poolAddress": "0x8C0014afe032E4574481D8934504100bF23fCB56",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x62753eC2956f84AF240b4666a130C88a83933848",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "CHFm-ZARm",
      "tokens": [
        {
          "address": "0xb55a79F398E759E43C95b979163f30eC87Ee131D",
          "symbol": "CHFm"
        },
        {
          "address": "0x4c35853A3B4e647fD266f4de678dCc8fEC410BF6",
          "symbol": "ZARm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x6dAa327E0CbE2CE84c0F312F20b9432Fe744ed58",
          "token0": "0x4c35853A3B4e647fD266f4de678dCc8fEC410BF6",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x4206e101b13bf29e40b2bfed4cf167271c41677720f2ee786ac1bf5efac101cb"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xbe6d2165173A29889652c7bF2Dc3a02076a22f2A",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xb55a79F398E759E43C95b979163f30eC87Ee131D",
          "poolType": "Virtual",
          "exchangeId": "0x3ddbc61433314a4b7d3cbb56a001fc4cc0f1d52d64338336d5f2083a580ce4fc"
        }
      ],
      "costData": {
        "totalCostPercent": 0.5991,
        "hops": [
          {
            "poolAddress": "0x6dAa327E0CbE2CE84c0F312F20b9432Fe744ed58",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0xbe6d2165173A29889652c7bF2Dc3a02076a22f2A",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "PHPm-ZARm",
      "tokens": [
        {
          "address": "0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B",
          "symbol": "PHPm"
        },
        {
          "address": "0x4c35853A3B4e647fD266f4de678dCc8fEC410BF6",
          "symbol": "ZARm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x6dAa327E0CbE2CE84c0F312F20b9432Fe744ed58",
          "token0": "0x4c35853A3B4e647fD266f4de678dCc8fEC410BF6",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x4206e101b13bf29e40b2bfed4cf167271c41677720f2ee786ac1bf5efac101cb"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x30214Efe28Ab44D6A5c739ebA5e0729B1d4213E4",
          "token0": "0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x7952984d7278ca3417febf52815c321984ac3147ced2c02bb6a02b0bcab08413"
        }
      ],
      "costData": {
        "totalCostPercent": 0.5991,
        "hops": [
          {
            "poolAddress": "0x6dAa327E0CbE2CE84c0F312F20b9432Fe744ed58",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x30214Efe28Ab44D6A5c739ebA5e0729B1d4213E4",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "JPYm-ZARm",
      "tokens": [
        {
          "address": "0xc45eCF20f3CD864B32D9794d6f76814aE8892e20",
          "symbol": "JPYm"
        },
        {
          "address": "0x4c35853A3B4e647fD266f4de678dCc8fEC410BF6",
          "symbol": "ZARm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x6dAa327E0CbE2CE84c0F312F20b9432Fe744ed58",
          "token0": "0x4c35853A3B4e647fD266f4de678dCc8fEC410BF6",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x4206e101b13bf29e40b2bfed4cf167271c41677720f2ee786ac1bf5efac101cb"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xEB433cE1f2ce4981b76fE7ca3a96070705D8eDe4",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xc45eCF20f3CD864B32D9794d6f76814aE8892e20",
          "poolType": "Virtual",
          "exchangeId": "0x7c3b41fbd140c6fb54ff9f8f7b7b0c954606682d44ed5e56b0080f40faaf652c"
        }
      ],
      "costData": {
        "totalCostPercent": 0.5991,
        "hops": [
          {
            "poolAddress": "0x6dAa327E0CbE2CE84c0F312F20b9432Fe744ed58",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0xEB433cE1f2ce4981b76fE7ca3a96070705D8eDe4",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "COPm-ZARm",
      "tokens": [
        {
          "address": "0x8A567e2aE79CA692Bd748aB832081C45de4041eA",
          "symbol": "COPm"
        },
        {
          "address": "0x4c35853A3B4e647fD266f4de678dCc8fEC410BF6",
          "symbol": "ZARm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x6dAa327E0CbE2CE84c0F312F20b9432Fe744ed58",
          "token0": "0x4c35853A3B4e647fD266f4de678dCc8fEC410BF6",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x4206e101b13bf29e40b2bfed4cf167271c41677720f2ee786ac1bf5efac101cb"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x71f55035a49C972C5C3197e874f6b7Fd94672B6E",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0x8A567e2aE79CA692Bd748aB832081C45de4041eA",
          "poolType": "Virtual",
          "exchangeId": "0x1c9378bd0973ff313a599d3effc654ba759f8ccca655ab6d6ce5bd39a212943b"
        }
      ],
      "costData": {
        "totalCostPercent": 0.5991,
        "hops": [
          {
            "poolAddress": "0x6dAa327E0CbE2CE84c0F312F20b9432Fe744ed58",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x71f55035a49C972C5C3197e874f6b7Fd94672B6E",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "BRLm-ZARm",
      "tokens": [
        {
          "address": "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
          "symbol": "BRLm"
        },
        {
          "address": "0x4c35853A3B4e647fD266f4de678dCc8fEC410BF6",
          "symbol": "ZARm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x6dAa327E0CbE2CE84c0F312F20b9432Fe744ed58",
          "token0": "0x4c35853A3B4e647fD266f4de678dCc8fEC410BF6",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x4206e101b13bf29e40b2bfed4cf167271c41677720f2ee786ac1bf5efac101cb"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x62753eC2956f84AF240b4666a130C88a83933848",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
          "poolType": "Virtual",
          "exchangeId": "0xd11d52b973ddbb983cc2087aabcafd915fc3140cf9996aacc61db9710d1bde05"
        }
      ],
      "costData": {
        "totalCostPercent": 0.5991,
        "hops": [
          {
            "poolAddress": "0x6dAa327E0CbE2CE84c0F312F20b9432Fe744ed58",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x62753eC2956f84AF240b4666a130C88a83933848",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "CHFm-PHPm",
      "tokens": [
        {
          "address": "0xb55a79F398E759E43C95b979163f30eC87Ee131D",
          "symbol": "CHFm"
        },
        {
          "address": "0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B",
          "symbol": "PHPm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xbe6d2165173A29889652c7bF2Dc3a02076a22f2A",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xb55a79F398E759E43C95b979163f30eC87Ee131D",
          "poolType": "Virtual",
          "exchangeId": "0x3ddbc61433314a4b7d3cbb56a001fc4cc0f1d52d64338336d5f2083a580ce4fc"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x30214Efe28Ab44D6A5c739ebA5e0729B1d4213E4",
          "token0": "0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x7952984d7278ca3417febf52815c321984ac3147ced2c02bb6a02b0bcab08413"
        }
      ],
      "costData": {
        "totalCostPercent": 0.5991,
        "hops": [
          {
            "poolAddress": "0xbe6d2165173A29889652c7bF2Dc3a02076a22f2A",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x30214Efe28Ab44D6A5c739ebA5e0729B1d4213E4",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "CHFm-JPYm",
      "tokens": [
        {
          "address": "0xb55a79F398E759E43C95b979163f30eC87Ee131D",
          "symbol": "CHFm"
        },
        {
          "address": "0xc45eCF20f3CD864B32D9794d6f76814aE8892e20",
          "symbol": "JPYm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xbe6d2165173A29889652c7bF2Dc3a02076a22f2A",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xb55a79F398E759E43C95b979163f30eC87Ee131D",
          "poolType": "Virtual",
          "exchangeId": "0x3ddbc61433314a4b7d3cbb56a001fc4cc0f1d52d64338336d5f2083a580ce4fc"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xEB433cE1f2ce4981b76fE7ca3a96070705D8eDe4",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xc45eCF20f3CD864B32D9794d6f76814aE8892e20",
          "poolType": "Virtual",
          "exchangeId": "0x7c3b41fbd140c6fb54ff9f8f7b7b0c954606682d44ed5e56b0080f40faaf652c"
        }
      ],
      "costData": {
        "totalCostPercent": 0.5991,
        "hops": [
          {
            "poolAddress": "0xbe6d2165173A29889652c7bF2Dc3a02076a22f2A",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0xEB433cE1f2ce4981b76fE7ca3a96070705D8eDe4",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "CHFm-COPm",
      "tokens": [
        {
          "address": "0xb55a79F398E759E43C95b979163f30eC87Ee131D",
          "symbol": "CHFm"
        },
        {
          "address": "0x8A567e2aE79CA692Bd748aB832081C45de4041eA",
          "symbol": "COPm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xbe6d2165173A29889652c7bF2Dc3a02076a22f2A",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xb55a79F398E759E43C95b979163f30eC87Ee131D",
          "poolType": "Virtual",
          "exchangeId": "0x3ddbc61433314a4b7d3cbb56a001fc4cc0f1d52d64338336d5f2083a580ce4fc"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x71f55035a49C972C5C3197e874f6b7Fd94672B6E",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0x8A567e2aE79CA692Bd748aB832081C45de4041eA",
          "poolType": "Virtual",
          "exchangeId": "0x1c9378bd0973ff313a599d3effc654ba759f8ccca655ab6d6ce5bd39a212943b"
        }
      ],
      "costData": {
        "totalCostPercent": 0.5991,
        "hops": [
          {
            "poolAddress": "0xbe6d2165173A29889652c7bF2Dc3a02076a22f2A",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x71f55035a49C972C5C3197e874f6b7Fd94672B6E",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "BRLm-CHFm",
      "tokens": [
        {
          "address": "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
          "symbol": "BRLm"
        },
        {
          "address": "0xb55a79F398E759E43C95b979163f30eC87Ee131D",
          "symbol": "CHFm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xbe6d2165173A29889652c7bF2Dc3a02076a22f2A",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xb55a79F398E759E43C95b979163f30eC87Ee131D",
          "poolType": "Virtual",
          "exchangeId": "0x3ddbc61433314a4b7d3cbb56a001fc4cc0f1d52d64338336d5f2083a580ce4fc"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x62753eC2956f84AF240b4666a130C88a83933848",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
          "poolType": "Virtual",
          "exchangeId": "0xd11d52b973ddbb983cc2087aabcafd915fc3140cf9996aacc61db9710d1bde05"
        }
      ],
      "costData": {
        "totalCostPercent": 0.5991,
        "hops": [
          {
            "poolAddress": "0xbe6d2165173A29889652c7bF2Dc3a02076a22f2A",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x62753eC2956f84AF240b4666a130C88a83933848",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "JPYm-PHPm",
      "tokens": [
        {
          "address": "0xc45eCF20f3CD864B32D9794d6f76814aE8892e20",
          "symbol": "JPYm"
        },
        {
          "address": "0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B",
          "symbol": "PHPm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x30214Efe28Ab44D6A5c739ebA5e0729B1d4213E4",
          "token0": "0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x7952984d7278ca3417febf52815c321984ac3147ced2c02bb6a02b0bcab08413"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xEB433cE1f2ce4981b76fE7ca3a96070705D8eDe4",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xc45eCF20f3CD864B32D9794d6f76814aE8892e20",
          "poolType": "Virtual",
          "exchangeId": "0x7c3b41fbd140c6fb54ff9f8f7b7b0c954606682d44ed5e56b0080f40faaf652c"
        }
      ],
      "costData": {
        "totalCostPercent": 0.5991,
        "hops": [
          {
            "poolAddress": "0x30214Efe28Ab44D6A5c739ebA5e0729B1d4213E4",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0xEB433cE1f2ce4981b76fE7ca3a96070705D8eDe4",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "COPm-PHPm",
      "tokens": [
        {
          "address": "0x8A567e2aE79CA692Bd748aB832081C45de4041eA",
          "symbol": "COPm"
        },
        {
          "address": "0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B",
          "symbol": "PHPm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x30214Efe28Ab44D6A5c739ebA5e0729B1d4213E4",
          "token0": "0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x7952984d7278ca3417febf52815c321984ac3147ced2c02bb6a02b0bcab08413"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x71f55035a49C972C5C3197e874f6b7Fd94672B6E",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0x8A567e2aE79CA692Bd748aB832081C45de4041eA",
          "poolType": "Virtual",
          "exchangeId": "0x1c9378bd0973ff313a599d3effc654ba759f8ccca655ab6d6ce5bd39a212943b"
        }
      ],
      "costData": {
        "totalCostPercent": 0.5991,
        "hops": [
          {
            "poolAddress": "0x30214Efe28Ab44D6A5c739ebA5e0729B1d4213E4",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x71f55035a49C972C5C3197e874f6b7Fd94672B6E",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "BRLm-PHPm",
      "tokens": [
        {
          "address": "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
          "symbol": "BRLm"
        },
        {
          "address": "0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B",
          "symbol": "PHPm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x30214Efe28Ab44D6A5c739ebA5e0729B1d4213E4",
          "token0": "0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x7952984d7278ca3417febf52815c321984ac3147ced2c02bb6a02b0bcab08413"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x62753eC2956f84AF240b4666a130C88a83933848",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
          "poolType": "Virtual",
          "exchangeId": "0xd11d52b973ddbb983cc2087aabcafd915fc3140cf9996aacc61db9710d1bde05"
        }
      ],
      "costData": {
        "totalCostPercent": 0.5991,
        "hops": [
          {
            "poolAddress": "0x30214Efe28Ab44D6A5c739ebA5e0729B1d4213E4",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x62753eC2956f84AF240b4666a130C88a83933848",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "COPm-JPYm",
      "tokens": [
        {
          "address": "0x8A567e2aE79CA692Bd748aB832081C45de4041eA",
          "symbol": "COPm"
        },
        {
          "address": "0xc45eCF20f3CD864B32D9794d6f76814aE8892e20",
          "symbol": "JPYm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xEB433cE1f2ce4981b76fE7ca3a96070705D8eDe4",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xc45eCF20f3CD864B32D9794d6f76814aE8892e20",
          "poolType": "Virtual",
          "exchangeId": "0x7c3b41fbd140c6fb54ff9f8f7b7b0c954606682d44ed5e56b0080f40faaf652c"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x71f55035a49C972C5C3197e874f6b7Fd94672B6E",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0x8A567e2aE79CA692Bd748aB832081C45de4041eA",
          "poolType": "Virtual",
          "exchangeId": "0x1c9378bd0973ff313a599d3effc654ba759f8ccca655ab6d6ce5bd39a212943b"
        }
      ],
      "costData": {
        "totalCostPercent": 0.5991,
        "hops": [
          {
            "poolAddress": "0xEB433cE1f2ce4981b76fE7ca3a96070705D8eDe4",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x71f55035a49C972C5C3197e874f6b7Fd94672B6E",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "BRLm-JPYm",
      "tokens": [
        {
          "address": "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
          "symbol": "BRLm"
        },
        {
          "address": "0xc45eCF20f3CD864B32D9794d6f76814aE8892e20",
          "symbol": "JPYm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xEB433cE1f2ce4981b76fE7ca3a96070705D8eDe4",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xc45eCF20f3CD864B32D9794d6f76814aE8892e20",
          "poolType": "Virtual",
          "exchangeId": "0x7c3b41fbd140c6fb54ff9f8f7b7b0c954606682d44ed5e56b0080f40faaf652c"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x62753eC2956f84AF240b4666a130C88a83933848",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
          "poolType": "Virtual",
          "exchangeId": "0xd11d52b973ddbb983cc2087aabcafd915fc3140cf9996aacc61db9710d1bde05"
        }
      ],
      "costData": {
        "totalCostPercent": 0.5991,
        "hops": [
          {
            "poolAddress": "0xEB433cE1f2ce4981b76fE7ca3a96070705D8eDe4",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x62753eC2956f84AF240b4666a130C88a83933848",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "BRLm-COPm",
      "tokens": [
        {
          "address": "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
          "symbol": "BRLm"
        },
        {
          "address": "0x8A567e2aE79CA692Bd748aB832081C45de4041eA",
          "symbol": "COPm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x71f55035a49C972C5C3197e874f6b7Fd94672B6E",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0x8A567e2aE79CA692Bd748aB832081C45de4041eA",
          "poolType": "Virtual",
          "exchangeId": "0x1c9378bd0973ff313a599d3effc654ba759f8ccca655ab6d6ce5bd39a212943b"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x62753eC2956f84AF240b4666a130C88a83933848",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
          "poolType": "Virtual",
          "exchangeId": "0xd11d52b973ddbb983cc2087aabcafd915fc3140cf9996aacc61db9710d1bde05"
        }
      ],
      "costData": {
        "totalCostPercent": 0.5991,
        "hops": [
          {
            "poolAddress": "0x71f55035a49C972C5C3197e874f6b7Fd94672B6E",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x62753eC2956f84AF240b4666a130C88a83933848",
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
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xab945882018B81bDF62629e98fFdAfd9495a0076",
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
            "poolAddress": "0xab945882018B81bDF62629e98fFdAfd9495a0076",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "NGNm-USDm",
      "tokens": [
        {
          "address": "0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71",
          "symbol": "NGNm"
        },
        {
          "address": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "symbol": "USDm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xaEa92e8006e6edf0f9E9368Ee9Af36814B738855",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71",
          "poolType": "Virtual",
          "exchangeId": "0x67a5122dab72931be57196e0abba81690461f327bc60fb98ca7eef0ac58906cc"
        }
      ],
      "costData": {
        "totalCostPercent": 1,
        "hops": [
          {
            "poolAddress": "0xaEa92e8006e6edf0f9E9368Ee9Af36814B738855",
            "costPercent": 1
          }
        ]
      }
    },
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
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xa337a498e4e061F4029FCb3b9F4E3D535E885dc5",
          "token0": "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x89de88b8eb790de26f4649f543cb6893d93635c728ac857f0926e842fb0d298b"
        }
      ],
      "costData": {
        "totalCostPercent": 1,
        "hops": [
          {
            "poolAddress": "0xa337a498e4e061F4029FCb3b9F4E3D535E885dc5",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "GHSm-axlUSDC",
      "tokens": [
        {
          "address": "0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313",
          "symbol": "GHSm"
        },
        {
          "address": "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          "symbol": "axlUSDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0xb285d4C7133d6f27BfB29224fb0D22E7EC3ddD2D",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xab945882018B81bDF62629e98fFdAfd9495a0076",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313",
          "poolType": "Virtual",
          "exchangeId": "0x3562f9d29eba092b857480a82b03375839c752346b9ebe93a57ab82410328187"
        }
      ],
      "costData": {
        "totalCostPercent": 1.0495,
        "hops": [
          {
            "poolAddress": "0xb285d4C7133d6f27BfB29224fb0D22E7EC3ddD2D",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0xab945882018B81bDF62629e98fFdAfd9495a0076",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "NGNm-axlUSDC",
      "tokens": [
        {
          "address": "0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71",
          "symbol": "NGNm"
        },
        {
          "address": "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          "symbol": "axlUSDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0xb285d4C7133d6f27BfB29224fb0D22E7EC3ddD2D",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xaEa92e8006e6edf0f9E9368Ee9Af36814B738855",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71",
          "poolType": "Virtual",
          "exchangeId": "0x67a5122dab72931be57196e0abba81690461f327bc60fb98ca7eef0ac58906cc"
        }
      ],
      "costData": {
        "totalCostPercent": 1.0495,
        "hops": [
          {
            "poolAddress": "0xb285d4C7133d6f27BfB29224fb0D22E7EC3ddD2D",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0xaEa92e8006e6edf0f9E9368Ee9Af36814B738855",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "KESm-axlUSDC",
      "tokens": [
        {
          "address": "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
          "symbol": "KESm"
        },
        {
          "address": "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          "symbol": "axlUSDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0xb285d4C7133d6f27BfB29224fb0D22E7EC3ddD2D",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xa337a498e4e061F4029FCb3b9F4E3D535E885dc5",
          "token0": "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x89de88b8eb790de26f4649f543cb6893d93635c728ac857f0926e842fb0d298b"
        }
      ],
      "costData": {
        "totalCostPercent": 1.0495,
        "hops": [
          {
            "poolAddress": "0xb285d4C7133d6f27BfB29224fb0D22E7EC3ddD2D",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0xa337a498e4e061F4029FCb3b9F4E3D535E885dc5",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "GHSm-USDC",
      "tokens": [
        {
          "address": "0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313",
          "symbol": "GHSm"
        },
        {
          "address": "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
          "symbol": "USDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x462fe04b4FD719Cbd04C0310365D421D02AaA19E",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xab945882018B81bDF62629e98fFdAfd9495a0076",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313",
          "poolType": "Virtual",
          "exchangeId": "0x3562f9d29eba092b857480a82b03375839c752346b9ebe93a57ab82410328187"
        }
      ],
      "costData": {
        "totalCostPercent": 1.0495,
        "hops": [
          {
            "poolAddress": "0x462fe04b4FD719Cbd04C0310365D421D02AaA19E",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0xab945882018B81bDF62629e98fFdAfd9495a0076",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "NGNm-USDC",
      "tokens": [
        {
          "address": "0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71",
          "symbol": "NGNm"
        },
        {
          "address": "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
          "symbol": "USDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x462fe04b4FD719Cbd04C0310365D421D02AaA19E",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xaEa92e8006e6edf0f9E9368Ee9Af36814B738855",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71",
          "poolType": "Virtual",
          "exchangeId": "0x67a5122dab72931be57196e0abba81690461f327bc60fb98ca7eef0ac58906cc"
        }
      ],
      "costData": {
        "totalCostPercent": 1.0495,
        "hops": [
          {
            "poolAddress": "0x462fe04b4FD719Cbd04C0310365D421D02AaA19E",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0xaEa92e8006e6edf0f9E9368Ee9Af36814B738855",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "KESm-USDC",
      "tokens": [
        {
          "address": "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
          "symbol": "KESm"
        },
        {
          "address": "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
          "symbol": "USDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x462fe04b4FD719Cbd04C0310365D421D02AaA19E",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xa337a498e4e061F4029FCb3b9F4E3D535E885dc5",
          "token0": "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x89de88b8eb790de26f4649f543cb6893d93635c728ac857f0926e842fb0d298b"
        }
      ],
      "costData": {
        "totalCostPercent": 1.0495,
        "hops": [
          {
            "poolAddress": "0x462fe04b4FD719Cbd04C0310365D421D02AaA19E",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0xa337a498e4e061F4029FCb3b9F4E3D535E885dc5",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "GHSm-USD₮",
      "tokens": [
        {
          "address": "0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313",
          "symbol": "GHSm"
        },
        {
          "address": "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
          "symbol": "USD₮"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x0FEBa760d93423D127DE1B6ABECdB60E5253228D",
          "token0": "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xab945882018B81bDF62629e98fFdAfd9495a0076",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313",
          "poolType": "Virtual",
          "exchangeId": "0x3562f9d29eba092b857480a82b03375839c752346b9ebe93a57ab82410328187"
        }
      ],
      "costData": {
        "totalCostPercent": 1.0495,
        "hops": [
          {
            "poolAddress": "0x0FEBa760d93423D127DE1B6ABECdB60E5253228D",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0xab945882018B81bDF62629e98fFdAfd9495a0076",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "NGNm-USD₮",
      "tokens": [
        {
          "address": "0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71",
          "symbol": "NGNm"
        },
        {
          "address": "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
          "symbol": "USD₮"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x0FEBa760d93423D127DE1B6ABECdB60E5253228D",
          "token0": "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xaEa92e8006e6edf0f9E9368Ee9Af36814B738855",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71",
          "poolType": "Virtual",
          "exchangeId": "0x67a5122dab72931be57196e0abba81690461f327bc60fb98ca7eef0ac58906cc"
        }
      ],
      "costData": {
        "totalCostPercent": 1.0495,
        "hops": [
          {
            "poolAddress": "0x0FEBa760d93423D127DE1B6ABECdB60E5253228D",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0xaEa92e8006e6edf0f9E9368Ee9Af36814B738855",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "KESm-USD₮",
      "tokens": [
        {
          "address": "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
          "symbol": "KESm"
        },
        {
          "address": "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
          "symbol": "USD₮"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x0FEBa760d93423D127DE1B6ABECdB60E5253228D",
          "token0": "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xa337a498e4e061F4029FCb3b9F4E3D535E885dc5",
          "token0": "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x89de88b8eb790de26f4649f543cb6893d93635c728ac857f0926e842fb0d298b"
        }
      ],
      "costData": {
        "totalCostPercent": 1.0495,
        "hops": [
          {
            "poolAddress": "0x0FEBa760d93423D127DE1B6ABECdB60E5253228D",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0xa337a498e4e061F4029FCb3b9F4E3D535E885dc5",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "AUDm-GHSm",
      "tokens": [
        {
          "address": "0x7175504C455076F15c04A2F90a8e352281F492F9",
          "symbol": "AUDm"
        },
        {
          "address": "0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313",
          "symbol": "GHSm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xab945882018B81bDF62629e98fFdAfd9495a0076",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313",
          "poolType": "Virtual",
          "exchangeId": "0x3562f9d29eba092b857480a82b03375839c752346b9ebe93a57ab82410328187"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x1d013077b00B28038A3f1e7A29ABa34E12e562e9",
          "token0": "0x7175504C455076F15c04A2F90a8e352281F492F9",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0xd580d237231109e6a96d67d82450611c610a805a26660c90281bdc0cd04a95c7"
        }
      ],
      "costData": {
        "totalCostPercent": 1.1485,
        "hops": [
          {
            "poolAddress": "0xab945882018B81bDF62629e98fFdAfd9495a0076",
            "costPercent": 1
          },
          {
            "poolAddress": "0x1d013077b00B28038A3f1e7A29ABa34E12e562e9",
            "costPercent": 0.15
          }
        ]
      }
    },
    {
      "id": "CADm-GHSm",
      "tokens": [
        {
          "address": "0xff4Ab19391af240c311c54200a492233052B6325",
          "symbol": "CADm"
        },
        {
          "address": "0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313",
          "symbol": "GHSm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xab945882018B81bDF62629e98fFdAfd9495a0076",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313",
          "poolType": "Virtual",
          "exchangeId": "0x3562f9d29eba092b857480a82b03375839c752346b9ebe93a57ab82410328187"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x62fA288e3AC844dCfcE5469af4f8feb7d6f7Ba61",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xff4Ab19391af240c311c54200a492233052B6325",
          "poolType": "Virtual",
          "exchangeId": "0x517ccc3bcab9f35e2e24143a0c1809068efc649f740846cfb6a1c5703735c1ee"
        }
      ],
      "costData": {
        "totalCostPercent": 1.1485,
        "hops": [
          {
            "poolAddress": "0xab945882018B81bDF62629e98fFdAfd9495a0076",
            "costPercent": 1
          },
          {
            "poolAddress": "0x62fA288e3AC844dCfcE5469af4f8feb7d6f7Ba61",
            "costPercent": 0.15
          }
        ]
      }
    },
    {
      "id": "AUDm-NGNm",
      "tokens": [
        {
          "address": "0x7175504C455076F15c04A2F90a8e352281F492F9",
          "symbol": "AUDm"
        },
        {
          "address": "0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71",
          "symbol": "NGNm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x1d013077b00B28038A3f1e7A29ABa34E12e562e9",
          "token0": "0x7175504C455076F15c04A2F90a8e352281F492F9",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0xd580d237231109e6a96d67d82450611c610a805a26660c90281bdc0cd04a95c7"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xaEa92e8006e6edf0f9E9368Ee9Af36814B738855",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71",
          "poolType": "Virtual",
          "exchangeId": "0x67a5122dab72931be57196e0abba81690461f327bc60fb98ca7eef0ac58906cc"
        }
      ],
      "costData": {
        "totalCostPercent": 1.1485,
        "hops": [
          {
            "poolAddress": "0x1d013077b00B28038A3f1e7A29ABa34E12e562e9",
            "costPercent": 0.15
          },
          {
            "poolAddress": "0xaEa92e8006e6edf0f9E9368Ee9Af36814B738855",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "AUDm-KESm",
      "tokens": [
        {
          "address": "0x7175504C455076F15c04A2F90a8e352281F492F9",
          "symbol": "AUDm"
        },
        {
          "address": "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
          "symbol": "KESm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x1d013077b00B28038A3f1e7A29ABa34E12e562e9",
          "token0": "0x7175504C455076F15c04A2F90a8e352281F492F9",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0xd580d237231109e6a96d67d82450611c610a805a26660c90281bdc0cd04a95c7"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xa337a498e4e061F4029FCb3b9F4E3D535E885dc5",
          "token0": "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x89de88b8eb790de26f4649f543cb6893d93635c728ac857f0926e842fb0d298b"
        }
      ],
      "costData": {
        "totalCostPercent": 1.1485,
        "hops": [
          {
            "poolAddress": "0x1d013077b00B28038A3f1e7A29ABa34E12e562e9",
            "costPercent": 0.15
          },
          {
            "poolAddress": "0xa337a498e4e061F4029FCb3b9F4E3D535E885dc5",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "CADm-NGNm",
      "tokens": [
        {
          "address": "0xff4Ab19391af240c311c54200a492233052B6325",
          "symbol": "CADm"
        },
        {
          "address": "0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71",
          "symbol": "NGNm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xaEa92e8006e6edf0f9E9368Ee9Af36814B738855",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71",
          "poolType": "Virtual",
          "exchangeId": "0x67a5122dab72931be57196e0abba81690461f327bc60fb98ca7eef0ac58906cc"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x62fA288e3AC844dCfcE5469af4f8feb7d6f7Ba61",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xff4Ab19391af240c311c54200a492233052B6325",
          "poolType": "Virtual",
          "exchangeId": "0x517ccc3bcab9f35e2e24143a0c1809068efc649f740846cfb6a1c5703735c1ee"
        }
      ],
      "costData": {
        "totalCostPercent": 1.1485,
        "hops": [
          {
            "poolAddress": "0xaEa92e8006e6edf0f9E9368Ee9Af36814B738855",
            "costPercent": 1
          },
          {
            "poolAddress": "0x62fA288e3AC844dCfcE5469af4f8feb7d6f7Ba61",
            "costPercent": 0.15
          }
        ]
      }
    },
    {
      "id": "CADm-KESm",
      "tokens": [
        {
          "address": "0xff4Ab19391af240c311c54200a492233052B6325",
          "symbol": "CADm"
        },
        {
          "address": "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
          "symbol": "KESm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xa337a498e4e061F4029FCb3b9F4E3D535E885dc5",
          "token0": "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x89de88b8eb790de26f4649f543cb6893d93635c728ac857f0926e842fb0d298b"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x62fA288e3AC844dCfcE5469af4f8feb7d6f7Ba61",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xff4Ab19391af240c311c54200a492233052B6325",
          "poolType": "Virtual",
          "exchangeId": "0x517ccc3bcab9f35e2e24143a0c1809068efc649f740846cfb6a1c5703735c1ee"
        }
      ],
      "costData": {
        "totalCostPercent": 1.1485,
        "hops": [
          {
            "poolAddress": "0xa337a498e4e061F4029FCb3b9F4E3D535E885dc5",
            "costPercent": 1
          },
          {
            "poolAddress": "0x62fA288e3AC844dCfcE5469af4f8feb7d6f7Ba61",
            "costPercent": 0.15
          }
        ]
      }
    },
    {
      "id": "GBPm-GHSm",
      "tokens": [
        {
          "address": "0xCCF663b1fF11028f0b19058d0f7B674004a40746",
          "symbol": "GBPm"
        },
        {
          "address": "0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313",
          "symbol": "GHSm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x8C0014afe032E4574481D8934504100bF23fCB56",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xCCF663b1fF11028f0b19058d0f7B674004a40746",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xab945882018B81bDF62629e98fFdAfd9495a0076",
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
            "poolAddress": "0x8C0014afe032E4574481D8934504100bF23fCB56",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0xab945882018B81bDF62629e98fFdAfd9495a0076",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "GBPm-NGNm",
      "tokens": [
        {
          "address": "0xCCF663b1fF11028f0b19058d0f7B674004a40746",
          "symbol": "GBPm"
        },
        {
          "address": "0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71",
          "symbol": "NGNm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x8C0014afe032E4574481D8934504100bF23fCB56",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xCCF663b1fF11028f0b19058d0f7B674004a40746",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xaEa92e8006e6edf0f9E9368Ee9Af36814B738855",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71",
          "poolType": "Virtual",
          "exchangeId": "0x67a5122dab72931be57196e0abba81690461f327bc60fb98ca7eef0ac58906cc"
        }
      ],
      "costData": {
        "totalCostPercent": 1.297,
        "hops": [
          {
            "poolAddress": "0x8C0014afe032E4574481D8934504100bF23fCB56",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0xaEa92e8006e6edf0f9E9368Ee9Af36814B738855",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "GBPm-KESm",
      "tokens": [
        {
          "address": "0xCCF663b1fF11028f0b19058d0f7B674004a40746",
          "symbol": "GBPm"
        },
        {
          "address": "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
          "symbol": "KESm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x8C0014afe032E4574481D8934504100bF23fCB56",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xCCF663b1fF11028f0b19058d0f7B674004a40746",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xa337a498e4e061F4029FCb3b9F4E3D535E885dc5",
          "token0": "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x89de88b8eb790de26f4649f543cb6893d93635c728ac857f0926e842fb0d298b"
        }
      ],
      "costData": {
        "totalCostPercent": 1.297,
        "hops": [
          {
            "poolAddress": "0x8C0014afe032E4574481D8934504100bF23fCB56",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0xa337a498e4e061F4029FCb3b9F4E3D535E885dc5",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "GHSm-ZARm",
      "tokens": [
        {
          "address": "0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313",
          "symbol": "GHSm"
        },
        {
          "address": "0x4c35853A3B4e647fD266f4de678dCc8fEC410BF6",
          "symbol": "ZARm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xab945882018B81bDF62629e98fFdAfd9495a0076",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313",
          "poolType": "Virtual",
          "exchangeId": "0x3562f9d29eba092b857480a82b03375839c752346b9ebe93a57ab82410328187"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x6dAa327E0CbE2CE84c0F312F20b9432Fe744ed58",
          "token0": "0x4c35853A3B4e647fD266f4de678dCc8fEC410BF6",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x4206e101b13bf29e40b2bfed4cf167271c41677720f2ee786ac1bf5efac101cb"
        }
      ],
      "costData": {
        "totalCostPercent": 1.297,
        "hops": [
          {
            "poolAddress": "0xab945882018B81bDF62629e98fFdAfd9495a0076",
            "costPercent": 1
          },
          {
            "poolAddress": "0x6dAa327E0CbE2CE84c0F312F20b9432Fe744ed58",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "CHFm-GHSm",
      "tokens": [
        {
          "address": "0xb55a79F398E759E43C95b979163f30eC87Ee131D",
          "symbol": "CHFm"
        },
        {
          "address": "0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313",
          "symbol": "GHSm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xab945882018B81bDF62629e98fFdAfd9495a0076",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313",
          "poolType": "Virtual",
          "exchangeId": "0x3562f9d29eba092b857480a82b03375839c752346b9ebe93a57ab82410328187"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xbe6d2165173A29889652c7bF2Dc3a02076a22f2A",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xb55a79F398E759E43C95b979163f30eC87Ee131D",
          "poolType": "Virtual",
          "exchangeId": "0x3ddbc61433314a4b7d3cbb56a001fc4cc0f1d52d64338336d5f2083a580ce4fc"
        }
      ],
      "costData": {
        "totalCostPercent": 1.297,
        "hops": [
          {
            "poolAddress": "0xab945882018B81bDF62629e98fFdAfd9495a0076",
            "costPercent": 1
          },
          {
            "poolAddress": "0xbe6d2165173A29889652c7bF2Dc3a02076a22f2A",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "GHSm-PHPm",
      "tokens": [
        {
          "address": "0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313",
          "symbol": "GHSm"
        },
        {
          "address": "0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B",
          "symbol": "PHPm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xab945882018B81bDF62629e98fFdAfd9495a0076",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313",
          "poolType": "Virtual",
          "exchangeId": "0x3562f9d29eba092b857480a82b03375839c752346b9ebe93a57ab82410328187"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x30214Efe28Ab44D6A5c739ebA5e0729B1d4213E4",
          "token0": "0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x7952984d7278ca3417febf52815c321984ac3147ced2c02bb6a02b0bcab08413"
        }
      ],
      "costData": {
        "totalCostPercent": 1.297,
        "hops": [
          {
            "poolAddress": "0xab945882018B81bDF62629e98fFdAfd9495a0076",
            "costPercent": 1
          },
          {
            "poolAddress": "0x30214Efe28Ab44D6A5c739ebA5e0729B1d4213E4",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "GHSm-JPYm",
      "tokens": [
        {
          "address": "0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313",
          "symbol": "GHSm"
        },
        {
          "address": "0xc45eCF20f3CD864B32D9794d6f76814aE8892e20",
          "symbol": "JPYm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xab945882018B81bDF62629e98fFdAfd9495a0076",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313",
          "poolType": "Virtual",
          "exchangeId": "0x3562f9d29eba092b857480a82b03375839c752346b9ebe93a57ab82410328187"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xEB433cE1f2ce4981b76fE7ca3a96070705D8eDe4",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xc45eCF20f3CD864B32D9794d6f76814aE8892e20",
          "poolType": "Virtual",
          "exchangeId": "0x7c3b41fbd140c6fb54ff9f8f7b7b0c954606682d44ed5e56b0080f40faaf652c"
        }
      ],
      "costData": {
        "totalCostPercent": 1.297,
        "hops": [
          {
            "poolAddress": "0xab945882018B81bDF62629e98fFdAfd9495a0076",
            "costPercent": 1
          },
          {
            "poolAddress": "0xEB433cE1f2ce4981b76fE7ca3a96070705D8eDe4",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "COPm-GHSm",
      "tokens": [
        {
          "address": "0x8A567e2aE79CA692Bd748aB832081C45de4041eA",
          "symbol": "COPm"
        },
        {
          "address": "0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313",
          "symbol": "GHSm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xab945882018B81bDF62629e98fFdAfd9495a0076",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313",
          "poolType": "Virtual",
          "exchangeId": "0x3562f9d29eba092b857480a82b03375839c752346b9ebe93a57ab82410328187"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x71f55035a49C972C5C3197e874f6b7Fd94672B6E",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0x8A567e2aE79CA692Bd748aB832081C45de4041eA",
          "poolType": "Virtual",
          "exchangeId": "0x1c9378bd0973ff313a599d3effc654ba759f8ccca655ab6d6ce5bd39a212943b"
        }
      ],
      "costData": {
        "totalCostPercent": 1.297,
        "hops": [
          {
            "poolAddress": "0xab945882018B81bDF62629e98fFdAfd9495a0076",
            "costPercent": 1
          },
          {
            "poolAddress": "0x71f55035a49C972C5C3197e874f6b7Fd94672B6E",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "BRLm-GHSm",
      "tokens": [
        {
          "address": "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
          "symbol": "BRLm"
        },
        {
          "address": "0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313",
          "symbol": "GHSm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xab945882018B81bDF62629e98fFdAfd9495a0076",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313",
          "poolType": "Virtual",
          "exchangeId": "0x3562f9d29eba092b857480a82b03375839c752346b9ebe93a57ab82410328187"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x62753eC2956f84AF240b4666a130C88a83933848",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
          "poolType": "Virtual",
          "exchangeId": "0xd11d52b973ddbb983cc2087aabcafd915fc3140cf9996aacc61db9710d1bde05"
        }
      ],
      "costData": {
        "totalCostPercent": 1.297,
        "hops": [
          {
            "poolAddress": "0xab945882018B81bDF62629e98fFdAfd9495a0076",
            "costPercent": 1
          },
          {
            "poolAddress": "0x62753eC2956f84AF240b4666a130C88a83933848",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "NGNm-ZARm",
      "tokens": [
        {
          "address": "0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71",
          "symbol": "NGNm"
        },
        {
          "address": "0x4c35853A3B4e647fD266f4de678dCc8fEC410BF6",
          "symbol": "ZARm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x6dAa327E0CbE2CE84c0F312F20b9432Fe744ed58",
          "token0": "0x4c35853A3B4e647fD266f4de678dCc8fEC410BF6",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x4206e101b13bf29e40b2bfed4cf167271c41677720f2ee786ac1bf5efac101cb"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xaEa92e8006e6edf0f9E9368Ee9Af36814B738855",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71",
          "poolType": "Virtual",
          "exchangeId": "0x67a5122dab72931be57196e0abba81690461f327bc60fb98ca7eef0ac58906cc"
        }
      ],
      "costData": {
        "totalCostPercent": 1.297,
        "hops": [
          {
            "poolAddress": "0x6dAa327E0CbE2CE84c0F312F20b9432Fe744ed58",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0xaEa92e8006e6edf0f9E9368Ee9Af36814B738855",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "KESm-ZARm",
      "tokens": [
        {
          "address": "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
          "symbol": "KESm"
        },
        {
          "address": "0x4c35853A3B4e647fD266f4de678dCc8fEC410BF6",
          "symbol": "ZARm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x6dAa327E0CbE2CE84c0F312F20b9432Fe744ed58",
          "token0": "0x4c35853A3B4e647fD266f4de678dCc8fEC410BF6",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x4206e101b13bf29e40b2bfed4cf167271c41677720f2ee786ac1bf5efac101cb"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xa337a498e4e061F4029FCb3b9F4E3D535E885dc5",
          "token0": "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x89de88b8eb790de26f4649f543cb6893d93635c728ac857f0926e842fb0d298b"
        }
      ],
      "costData": {
        "totalCostPercent": 1.297,
        "hops": [
          {
            "poolAddress": "0x6dAa327E0CbE2CE84c0F312F20b9432Fe744ed58",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0xa337a498e4e061F4029FCb3b9F4E3D535E885dc5",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "CHFm-NGNm",
      "tokens": [
        {
          "address": "0xb55a79F398E759E43C95b979163f30eC87Ee131D",
          "symbol": "CHFm"
        },
        {
          "address": "0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71",
          "symbol": "NGNm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xbe6d2165173A29889652c7bF2Dc3a02076a22f2A",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xb55a79F398E759E43C95b979163f30eC87Ee131D",
          "poolType": "Virtual",
          "exchangeId": "0x3ddbc61433314a4b7d3cbb56a001fc4cc0f1d52d64338336d5f2083a580ce4fc"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xaEa92e8006e6edf0f9E9368Ee9Af36814B738855",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71",
          "poolType": "Virtual",
          "exchangeId": "0x67a5122dab72931be57196e0abba81690461f327bc60fb98ca7eef0ac58906cc"
        }
      ],
      "costData": {
        "totalCostPercent": 1.297,
        "hops": [
          {
            "poolAddress": "0xbe6d2165173A29889652c7bF2Dc3a02076a22f2A",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0xaEa92e8006e6edf0f9E9368Ee9Af36814B738855",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "CHFm-KESm",
      "tokens": [
        {
          "address": "0xb55a79F398E759E43C95b979163f30eC87Ee131D",
          "symbol": "CHFm"
        },
        {
          "address": "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
          "symbol": "KESm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xbe6d2165173A29889652c7bF2Dc3a02076a22f2A",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xb55a79F398E759E43C95b979163f30eC87Ee131D",
          "poolType": "Virtual",
          "exchangeId": "0x3ddbc61433314a4b7d3cbb56a001fc4cc0f1d52d64338336d5f2083a580ce4fc"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xa337a498e4e061F4029FCb3b9F4E3D535E885dc5",
          "token0": "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x89de88b8eb790de26f4649f543cb6893d93635c728ac857f0926e842fb0d298b"
        }
      ],
      "costData": {
        "totalCostPercent": 1.297,
        "hops": [
          {
            "poolAddress": "0xbe6d2165173A29889652c7bF2Dc3a02076a22f2A",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0xa337a498e4e061F4029FCb3b9F4E3D535E885dc5",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "NGNm-PHPm",
      "tokens": [
        {
          "address": "0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71",
          "symbol": "NGNm"
        },
        {
          "address": "0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B",
          "symbol": "PHPm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xaEa92e8006e6edf0f9E9368Ee9Af36814B738855",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71",
          "poolType": "Virtual",
          "exchangeId": "0x67a5122dab72931be57196e0abba81690461f327bc60fb98ca7eef0ac58906cc"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x30214Efe28Ab44D6A5c739ebA5e0729B1d4213E4",
          "token0": "0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x7952984d7278ca3417febf52815c321984ac3147ced2c02bb6a02b0bcab08413"
        }
      ],
      "costData": {
        "totalCostPercent": 1.297,
        "hops": [
          {
            "poolAddress": "0xaEa92e8006e6edf0f9E9368Ee9Af36814B738855",
            "costPercent": 1
          },
          {
            "poolAddress": "0x30214Efe28Ab44D6A5c739ebA5e0729B1d4213E4",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "JPYm-NGNm",
      "tokens": [
        {
          "address": "0xc45eCF20f3CD864B32D9794d6f76814aE8892e20",
          "symbol": "JPYm"
        },
        {
          "address": "0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71",
          "symbol": "NGNm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xaEa92e8006e6edf0f9E9368Ee9Af36814B738855",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71",
          "poolType": "Virtual",
          "exchangeId": "0x67a5122dab72931be57196e0abba81690461f327bc60fb98ca7eef0ac58906cc"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xEB433cE1f2ce4981b76fE7ca3a96070705D8eDe4",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xc45eCF20f3CD864B32D9794d6f76814aE8892e20",
          "poolType": "Virtual",
          "exchangeId": "0x7c3b41fbd140c6fb54ff9f8f7b7b0c954606682d44ed5e56b0080f40faaf652c"
        }
      ],
      "costData": {
        "totalCostPercent": 1.297,
        "hops": [
          {
            "poolAddress": "0xaEa92e8006e6edf0f9E9368Ee9Af36814B738855",
            "costPercent": 1
          },
          {
            "poolAddress": "0xEB433cE1f2ce4981b76fE7ca3a96070705D8eDe4",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "COPm-NGNm",
      "tokens": [
        {
          "address": "0x8A567e2aE79CA692Bd748aB832081C45de4041eA",
          "symbol": "COPm"
        },
        {
          "address": "0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71",
          "symbol": "NGNm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xaEa92e8006e6edf0f9E9368Ee9Af36814B738855",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71",
          "poolType": "Virtual",
          "exchangeId": "0x67a5122dab72931be57196e0abba81690461f327bc60fb98ca7eef0ac58906cc"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x71f55035a49C972C5C3197e874f6b7Fd94672B6E",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0x8A567e2aE79CA692Bd748aB832081C45de4041eA",
          "poolType": "Virtual",
          "exchangeId": "0x1c9378bd0973ff313a599d3effc654ba759f8ccca655ab6d6ce5bd39a212943b"
        }
      ],
      "costData": {
        "totalCostPercent": 1.297,
        "hops": [
          {
            "poolAddress": "0xaEa92e8006e6edf0f9E9368Ee9Af36814B738855",
            "costPercent": 1
          },
          {
            "poolAddress": "0x71f55035a49C972C5C3197e874f6b7Fd94672B6E",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "BRLm-NGNm",
      "tokens": [
        {
          "address": "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
          "symbol": "BRLm"
        },
        {
          "address": "0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71",
          "symbol": "NGNm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xaEa92e8006e6edf0f9E9368Ee9Af36814B738855",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71",
          "poolType": "Virtual",
          "exchangeId": "0x67a5122dab72931be57196e0abba81690461f327bc60fb98ca7eef0ac58906cc"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x62753eC2956f84AF240b4666a130C88a83933848",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
          "poolType": "Virtual",
          "exchangeId": "0xd11d52b973ddbb983cc2087aabcafd915fc3140cf9996aacc61db9710d1bde05"
        }
      ],
      "costData": {
        "totalCostPercent": 1.297,
        "hops": [
          {
            "poolAddress": "0xaEa92e8006e6edf0f9E9368Ee9Af36814B738855",
            "costPercent": 1
          },
          {
            "poolAddress": "0x62753eC2956f84AF240b4666a130C88a83933848",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "KESm-PHPm",
      "tokens": [
        {
          "address": "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
          "symbol": "KESm"
        },
        {
          "address": "0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B",
          "symbol": "PHPm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xa337a498e4e061F4029FCb3b9F4E3D535E885dc5",
          "token0": "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x89de88b8eb790de26f4649f543cb6893d93635c728ac857f0926e842fb0d298b"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x30214Efe28Ab44D6A5c739ebA5e0729B1d4213E4",
          "token0": "0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x7952984d7278ca3417febf52815c321984ac3147ced2c02bb6a02b0bcab08413"
        }
      ],
      "costData": {
        "totalCostPercent": 1.297,
        "hops": [
          {
            "poolAddress": "0xa337a498e4e061F4029FCb3b9F4E3D535E885dc5",
            "costPercent": 1
          },
          {
            "poolAddress": "0x30214Efe28Ab44D6A5c739ebA5e0729B1d4213E4",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "JPYm-KESm",
      "tokens": [
        {
          "address": "0xc45eCF20f3CD864B32D9794d6f76814aE8892e20",
          "symbol": "JPYm"
        },
        {
          "address": "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
          "symbol": "KESm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xa337a498e4e061F4029FCb3b9F4E3D535E885dc5",
          "token0": "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x89de88b8eb790de26f4649f543cb6893d93635c728ac857f0926e842fb0d298b"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xEB433cE1f2ce4981b76fE7ca3a96070705D8eDe4",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xc45eCF20f3CD864B32D9794d6f76814aE8892e20",
          "poolType": "Virtual",
          "exchangeId": "0x7c3b41fbd140c6fb54ff9f8f7b7b0c954606682d44ed5e56b0080f40faaf652c"
        }
      ],
      "costData": {
        "totalCostPercent": 1.297,
        "hops": [
          {
            "poolAddress": "0xa337a498e4e061F4029FCb3b9F4E3D535E885dc5",
            "costPercent": 1
          },
          {
            "poolAddress": "0xEB433cE1f2ce4981b76fE7ca3a96070705D8eDe4",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "COPm-KESm",
      "tokens": [
        {
          "address": "0x8A567e2aE79CA692Bd748aB832081C45de4041eA",
          "symbol": "COPm"
        },
        {
          "address": "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
          "symbol": "KESm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xa337a498e4e061F4029FCb3b9F4E3D535E885dc5",
          "token0": "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x89de88b8eb790de26f4649f543cb6893d93635c728ac857f0926e842fb0d298b"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x71f55035a49C972C5C3197e874f6b7Fd94672B6E",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0x8A567e2aE79CA692Bd748aB832081C45de4041eA",
          "poolType": "Virtual",
          "exchangeId": "0x1c9378bd0973ff313a599d3effc654ba759f8ccca655ab6d6ce5bd39a212943b"
        }
      ],
      "costData": {
        "totalCostPercent": 1.297,
        "hops": [
          {
            "poolAddress": "0xa337a498e4e061F4029FCb3b9F4E3D535E885dc5",
            "costPercent": 1
          },
          {
            "poolAddress": "0x71f55035a49C972C5C3197e874f6b7Fd94672B6E",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "BRLm-KESm",
      "tokens": [
        {
          "address": "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
          "symbol": "BRLm"
        },
        {
          "address": "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
          "symbol": "KESm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xa337a498e4e061F4029FCb3b9F4E3D535E885dc5",
          "token0": "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x89de88b8eb790de26f4649f543cb6893d93635c728ac857f0926e842fb0d298b"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x62753eC2956f84AF240b4666a130C88a83933848",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
          "poolType": "Virtual",
          "exchangeId": "0xd11d52b973ddbb983cc2087aabcafd915fc3140cf9996aacc61db9710d1bde05"
        }
      ],
      "costData": {
        "totalCostPercent": 1.297,
        "hops": [
          {
            "poolAddress": "0xa337a498e4e061F4029FCb3b9F4E3D535E885dc5",
            "costPercent": 1
          },
          {
            "poolAddress": "0x62753eC2956f84AF240b4666a130C88a83933848",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "GHSm-NGNm",
      "tokens": [
        {
          "address": "0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313",
          "symbol": "GHSm"
        },
        {
          "address": "0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71",
          "symbol": "NGNm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xab945882018B81bDF62629e98fFdAfd9495a0076",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313",
          "poolType": "Virtual",
          "exchangeId": "0x3562f9d29eba092b857480a82b03375839c752346b9ebe93a57ab82410328187"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xaEa92e8006e6edf0f9E9368Ee9Af36814B738855",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71",
          "poolType": "Virtual",
          "exchangeId": "0x67a5122dab72931be57196e0abba81690461f327bc60fb98ca7eef0ac58906cc"
        }
      ],
      "costData": {
        "totalCostPercent": 1.99,
        "hops": [
          {
            "poolAddress": "0xab945882018B81bDF62629e98fFdAfd9495a0076",
            "costPercent": 1
          },
          {
            "poolAddress": "0xaEa92e8006e6edf0f9E9368Ee9Af36814B738855",
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
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xab945882018B81bDF62629e98fFdAfd9495a0076",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313",
          "poolType": "Virtual",
          "exchangeId": "0x3562f9d29eba092b857480a82b03375839c752346b9ebe93a57ab82410328187"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xa337a498e4e061F4029FCb3b9F4E3D535E885dc5",
          "token0": "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x89de88b8eb790de26f4649f543cb6893d93635c728ac857f0926e842fb0d298b"
        }
      ],
      "costData": {
        "totalCostPercent": 1.99,
        "hops": [
          {
            "poolAddress": "0xab945882018B81bDF62629e98fFdAfd9495a0076",
            "costPercent": 1
          },
          {
            "poolAddress": "0xa337a498e4e061F4029FCb3b9F4E3D535E885dc5",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "KESm-NGNm",
      "tokens": [
        {
          "address": "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
          "symbol": "KESm"
        },
        {
          "address": "0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71",
          "symbol": "NGNm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xaEa92e8006e6edf0f9E9368Ee9Af36814B738855",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71",
          "poolType": "Virtual",
          "exchangeId": "0x67a5122dab72931be57196e0abba81690461f327bc60fb98ca7eef0ac58906cc"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xa337a498e4e061F4029FCb3b9F4E3D535E885dc5",
          "token0": "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x89de88b8eb790de26f4649f543cb6893d93635c728ac857f0926e842fb0d298b"
        }
      ],
      "costData": {
        "totalCostPercent": 1.99,
        "hops": [
          {
            "poolAddress": "0xaEa92e8006e6edf0f9E9368Ee9Af36814B738855",
            "costPercent": 1
          },
          {
            "poolAddress": "0xa337a498e4e061F4029FCb3b9F4E3D535E885dc5",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "USDm-XOFm",
      "tokens": [
        {
          "address": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "symbol": "USDm"
        },
        {
          "address": "0x73F93dcc49cB8A239e2032663e9475dd5ef29A08",
          "symbol": "XOFm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x3d6e023177Bac13D6E316d95161D4bB9DCf0E276",
          "token0": "0x73F93dcc49cB8A239e2032663e9475dd5ef29A08",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0xc9664df358594c5eaf2f410ab371e2deb8b532ca26162d2bc36d99b8d174567b"
        }
      ],
      "costData": {
        "totalCostPercent": 2,
        "hops": [
          {
            "poolAddress": "0x3d6e023177Bac13D6E316d95161D4bB9DCf0E276",
            "costPercent": 2
          }
        ]
      }
    },
    {
      "id": "XOFm-axlUSDC",
      "tokens": [
        {
          "address": "0x73F93dcc49cB8A239e2032663e9475dd5ef29A08",
          "symbol": "XOFm"
        },
        {
          "address": "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          "symbol": "axlUSDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0xb285d4C7133d6f27BfB29224fb0D22E7EC3ddD2D",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x3d6e023177Bac13D6E316d95161D4bB9DCf0E276",
          "token0": "0x73F93dcc49cB8A239e2032663e9475dd5ef29A08",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0xc9664df358594c5eaf2f410ab371e2deb8b532ca26162d2bc36d99b8d174567b"
        }
      ],
      "costData": {
        "totalCostPercent": 2.049,
        "hops": [
          {
            "poolAddress": "0xb285d4C7133d6f27BfB29224fb0D22E7EC3ddD2D",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x3d6e023177Bac13D6E316d95161D4bB9DCf0E276",
            "costPercent": 2
          }
        ]
      }
    },
    {
      "id": "USDC-XOFm",
      "tokens": [
        {
          "address": "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
          "symbol": "USDC"
        },
        {
          "address": "0x73F93dcc49cB8A239e2032663e9475dd5ef29A08",
          "symbol": "XOFm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x462fe04b4FD719Cbd04C0310365D421D02AaA19E",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x3d6e023177Bac13D6E316d95161D4bB9DCf0E276",
          "token0": "0x73F93dcc49cB8A239e2032663e9475dd5ef29A08",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0xc9664df358594c5eaf2f410ab371e2deb8b532ca26162d2bc36d99b8d174567b"
        }
      ],
      "costData": {
        "totalCostPercent": 2.049,
        "hops": [
          {
            "poolAddress": "0x462fe04b4FD719Cbd04C0310365D421D02AaA19E",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x3d6e023177Bac13D6E316d95161D4bB9DCf0E276",
            "costPercent": 2
          }
        ]
      }
    },
    {
      "id": "USD₮-XOFm",
      "tokens": [
        {
          "address": "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
          "symbol": "USD₮"
        },
        {
          "address": "0x73F93dcc49cB8A239e2032663e9475dd5ef29A08",
          "symbol": "XOFm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x0FEBa760d93423D127DE1B6ABECdB60E5253228D",
          "token0": "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x3d6e023177Bac13D6E316d95161D4bB9DCf0E276",
          "token0": "0x73F93dcc49cB8A239e2032663e9475dd5ef29A08",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0xc9664df358594c5eaf2f410ab371e2deb8b532ca26162d2bc36d99b8d174567b"
        }
      ],
      "costData": {
        "totalCostPercent": 2.049,
        "hops": [
          {
            "poolAddress": "0x0FEBa760d93423D127DE1B6ABECdB60E5253228D",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x3d6e023177Bac13D6E316d95161D4bB9DCf0E276",
            "costPercent": 2
          }
        ]
      }
    },
    {
      "id": "AUDm-XOFm",
      "tokens": [
        {
          "address": "0x7175504C455076F15c04A2F90a8e352281F492F9",
          "symbol": "AUDm"
        },
        {
          "address": "0x73F93dcc49cB8A239e2032663e9475dd5ef29A08",
          "symbol": "XOFm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x1d013077b00B28038A3f1e7A29ABa34E12e562e9",
          "token0": "0x7175504C455076F15c04A2F90a8e352281F492F9",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0xd580d237231109e6a96d67d82450611c610a805a26660c90281bdc0cd04a95c7"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x3d6e023177Bac13D6E316d95161D4bB9DCf0E276",
          "token0": "0x73F93dcc49cB8A239e2032663e9475dd5ef29A08",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0xc9664df358594c5eaf2f410ab371e2deb8b532ca26162d2bc36d99b8d174567b"
        }
      ],
      "costData": {
        "totalCostPercent": 2.147,
        "hops": [
          {
            "poolAddress": "0x1d013077b00B28038A3f1e7A29ABa34E12e562e9",
            "costPercent": 0.15
          },
          {
            "poolAddress": "0x3d6e023177Bac13D6E316d95161D4bB9DCf0E276",
            "costPercent": 2
          }
        ]
      }
    },
    {
      "id": "CADm-XOFm",
      "tokens": [
        {
          "address": "0xff4Ab19391af240c311c54200a492233052B6325",
          "symbol": "CADm"
        },
        {
          "address": "0x73F93dcc49cB8A239e2032663e9475dd5ef29A08",
          "symbol": "XOFm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x62fA288e3AC844dCfcE5469af4f8feb7d6f7Ba61",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xff4Ab19391af240c311c54200a492233052B6325",
          "poolType": "Virtual",
          "exchangeId": "0x517ccc3bcab9f35e2e24143a0c1809068efc649f740846cfb6a1c5703735c1ee"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x3d6e023177Bac13D6E316d95161D4bB9DCf0E276",
          "token0": "0x73F93dcc49cB8A239e2032663e9475dd5ef29A08",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0xc9664df358594c5eaf2f410ab371e2deb8b532ca26162d2bc36d99b8d174567b"
        }
      ],
      "costData": {
        "totalCostPercent": 2.147,
        "hops": [
          {
            "poolAddress": "0x62fA288e3AC844dCfcE5469af4f8feb7d6f7Ba61",
            "costPercent": 0.15
          },
          {
            "poolAddress": "0x3d6e023177Bac13D6E316d95161D4bB9DCf0E276",
            "costPercent": 2
          }
        ]
      }
    },
    {
      "id": "GBPm-XOFm",
      "tokens": [
        {
          "address": "0xCCF663b1fF11028f0b19058d0f7B674004a40746",
          "symbol": "GBPm"
        },
        {
          "address": "0x73F93dcc49cB8A239e2032663e9475dd5ef29A08",
          "symbol": "XOFm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0xa849b475FE5a4B5C9C3280152c7a1945b907613b",
          "poolAddr": "0x8C0014afe032E4574481D8934504100bF23fCB56",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xCCF663b1fF11028f0b19058d0f7B674004a40746",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x3d6e023177Bac13D6E316d95161D4bB9DCf0E276",
          "token0": "0x73F93dcc49cB8A239e2032663e9475dd5ef29A08",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0xc9664df358594c5eaf2f410ab371e2deb8b532ca26162d2bc36d99b8d174567b"
        }
      ],
      "costData": {
        "totalCostPercent": 2.294,
        "hops": [
          {
            "poolAddress": "0x8C0014afe032E4574481D8934504100bF23fCB56",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x3d6e023177Bac13D6E316d95161D4bB9DCf0E276",
            "costPercent": 2
          }
        ]
      }
    },
    {
      "id": "XOFm-ZARm",
      "tokens": [
        {
          "address": "0x73F93dcc49cB8A239e2032663e9475dd5ef29A08",
          "symbol": "XOFm"
        },
        {
          "address": "0x4c35853A3B4e647fD266f4de678dCc8fEC410BF6",
          "symbol": "ZARm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x6dAa327E0CbE2CE84c0F312F20b9432Fe744ed58",
          "token0": "0x4c35853A3B4e647fD266f4de678dCc8fEC410BF6",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x4206e101b13bf29e40b2bfed4cf167271c41677720f2ee786ac1bf5efac101cb"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x3d6e023177Bac13D6E316d95161D4bB9DCf0E276",
          "token0": "0x73F93dcc49cB8A239e2032663e9475dd5ef29A08",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0xc9664df358594c5eaf2f410ab371e2deb8b532ca26162d2bc36d99b8d174567b"
        }
      ],
      "costData": {
        "totalCostPercent": 2.294,
        "hops": [
          {
            "poolAddress": "0x6dAa327E0CbE2CE84c0F312F20b9432Fe744ed58",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x3d6e023177Bac13D6E316d95161D4bB9DCf0E276",
            "costPercent": 2
          }
        ]
      }
    },
    {
      "id": "CHFm-XOFm",
      "tokens": [
        {
          "address": "0xb55a79F398E759E43C95b979163f30eC87Ee131D",
          "symbol": "CHFm"
        },
        {
          "address": "0x73F93dcc49cB8A239e2032663e9475dd5ef29A08",
          "symbol": "XOFm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xbe6d2165173A29889652c7bF2Dc3a02076a22f2A",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xb55a79F398E759E43C95b979163f30eC87Ee131D",
          "poolType": "Virtual",
          "exchangeId": "0x3ddbc61433314a4b7d3cbb56a001fc4cc0f1d52d64338336d5f2083a580ce4fc"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x3d6e023177Bac13D6E316d95161D4bB9DCf0E276",
          "token0": "0x73F93dcc49cB8A239e2032663e9475dd5ef29A08",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0xc9664df358594c5eaf2f410ab371e2deb8b532ca26162d2bc36d99b8d174567b"
        }
      ],
      "costData": {
        "totalCostPercent": 2.294,
        "hops": [
          {
            "poolAddress": "0xbe6d2165173A29889652c7bF2Dc3a02076a22f2A",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x3d6e023177Bac13D6E316d95161D4bB9DCf0E276",
            "costPercent": 2
          }
        ]
      }
    },
    {
      "id": "PHPm-XOFm",
      "tokens": [
        {
          "address": "0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B",
          "symbol": "PHPm"
        },
        {
          "address": "0x73F93dcc49cB8A239e2032663e9475dd5ef29A08",
          "symbol": "XOFm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x30214Efe28Ab44D6A5c739ebA5e0729B1d4213E4",
          "token0": "0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x7952984d7278ca3417febf52815c321984ac3147ced2c02bb6a02b0bcab08413"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x3d6e023177Bac13D6E316d95161D4bB9DCf0E276",
          "token0": "0x73F93dcc49cB8A239e2032663e9475dd5ef29A08",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0xc9664df358594c5eaf2f410ab371e2deb8b532ca26162d2bc36d99b8d174567b"
        }
      ],
      "costData": {
        "totalCostPercent": 2.294,
        "hops": [
          {
            "poolAddress": "0x30214Efe28Ab44D6A5c739ebA5e0729B1d4213E4",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x3d6e023177Bac13D6E316d95161D4bB9DCf0E276",
            "costPercent": 2
          }
        ]
      }
    },
    {
      "id": "JPYm-XOFm",
      "tokens": [
        {
          "address": "0xc45eCF20f3CD864B32D9794d6f76814aE8892e20",
          "symbol": "JPYm"
        },
        {
          "address": "0x73F93dcc49cB8A239e2032663e9475dd5ef29A08",
          "symbol": "XOFm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xEB433cE1f2ce4981b76fE7ca3a96070705D8eDe4",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xc45eCF20f3CD864B32D9794d6f76814aE8892e20",
          "poolType": "Virtual",
          "exchangeId": "0x7c3b41fbd140c6fb54ff9f8f7b7b0c954606682d44ed5e56b0080f40faaf652c"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x3d6e023177Bac13D6E316d95161D4bB9DCf0E276",
          "token0": "0x73F93dcc49cB8A239e2032663e9475dd5ef29A08",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0xc9664df358594c5eaf2f410ab371e2deb8b532ca26162d2bc36d99b8d174567b"
        }
      ],
      "costData": {
        "totalCostPercent": 2.294,
        "hops": [
          {
            "poolAddress": "0xEB433cE1f2ce4981b76fE7ca3a96070705D8eDe4",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x3d6e023177Bac13D6E316d95161D4bB9DCf0E276",
            "costPercent": 2
          }
        ]
      }
    },
    {
      "id": "COPm-XOFm",
      "tokens": [
        {
          "address": "0x8A567e2aE79CA692Bd748aB832081C45de4041eA",
          "symbol": "COPm"
        },
        {
          "address": "0x73F93dcc49cB8A239e2032663e9475dd5ef29A08",
          "symbol": "XOFm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x71f55035a49C972C5C3197e874f6b7Fd94672B6E",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0x8A567e2aE79CA692Bd748aB832081C45de4041eA",
          "poolType": "Virtual",
          "exchangeId": "0x1c9378bd0973ff313a599d3effc654ba759f8ccca655ab6d6ce5bd39a212943b"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x3d6e023177Bac13D6E316d95161D4bB9DCf0E276",
          "token0": "0x73F93dcc49cB8A239e2032663e9475dd5ef29A08",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0xc9664df358594c5eaf2f410ab371e2deb8b532ca26162d2bc36d99b8d174567b"
        }
      ],
      "costData": {
        "totalCostPercent": 2.294,
        "hops": [
          {
            "poolAddress": "0x71f55035a49C972C5C3197e874f6b7Fd94672B6E",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x3d6e023177Bac13D6E316d95161D4bB9DCf0E276",
            "costPercent": 2
          }
        ]
      }
    },
    {
      "id": "BRLm-XOFm",
      "tokens": [
        {
          "address": "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
          "symbol": "BRLm"
        },
        {
          "address": "0x73F93dcc49cB8A239e2032663e9475dd5ef29A08",
          "symbol": "XOFm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x62753eC2956f84AF240b4666a130C88a83933848",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
          "poolType": "Virtual",
          "exchangeId": "0xd11d52b973ddbb983cc2087aabcafd915fc3140cf9996aacc61db9710d1bde05"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x3d6e023177Bac13D6E316d95161D4bB9DCf0E276",
          "token0": "0x73F93dcc49cB8A239e2032663e9475dd5ef29A08",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0xc9664df358594c5eaf2f410ab371e2deb8b532ca26162d2bc36d99b8d174567b"
        }
      ],
      "costData": {
        "totalCostPercent": 2.294,
        "hops": [
          {
            "poolAddress": "0x62753eC2956f84AF240b4666a130C88a83933848",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x3d6e023177Bac13D6E316d95161D4bB9DCf0E276",
            "costPercent": 2
          }
        ]
      }
    },
    {
      "id": "GHSm-XOFm",
      "tokens": [
        {
          "address": "0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313",
          "symbol": "GHSm"
        },
        {
          "address": "0x73F93dcc49cB8A239e2032663e9475dd5ef29A08",
          "symbol": "XOFm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xab945882018B81bDF62629e98fFdAfd9495a0076",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313",
          "poolType": "Virtual",
          "exchangeId": "0x3562f9d29eba092b857480a82b03375839c752346b9ebe93a57ab82410328187"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x3d6e023177Bac13D6E316d95161D4bB9DCf0E276",
          "token0": "0x73F93dcc49cB8A239e2032663e9475dd5ef29A08",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0xc9664df358594c5eaf2f410ab371e2deb8b532ca26162d2bc36d99b8d174567b"
        }
      ],
      "costData": {
        "totalCostPercent": 2.98,
        "hops": [
          {
            "poolAddress": "0xab945882018B81bDF62629e98fFdAfd9495a0076",
            "costPercent": 1
          },
          {
            "poolAddress": "0x3d6e023177Bac13D6E316d95161D4bB9DCf0E276",
            "costPercent": 2
          }
        ]
      }
    },
    {
      "id": "NGNm-XOFm",
      "tokens": [
        {
          "address": "0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71",
          "symbol": "NGNm"
        },
        {
          "address": "0x73F93dcc49cB8A239e2032663e9475dd5ef29A08",
          "symbol": "XOFm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xaEa92e8006e6edf0f9E9368Ee9Af36814B738855",
          "token0": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "token1": "0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71",
          "poolType": "Virtual",
          "exchangeId": "0x67a5122dab72931be57196e0abba81690461f327bc60fb98ca7eef0ac58906cc"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x3d6e023177Bac13D6E316d95161D4bB9DCf0E276",
          "token0": "0x73F93dcc49cB8A239e2032663e9475dd5ef29A08",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0xc9664df358594c5eaf2f410ab371e2deb8b532ca26162d2bc36d99b8d174567b"
        }
      ],
      "costData": {
        "totalCostPercent": 2.98,
        "hops": [
          {
            "poolAddress": "0xaEa92e8006e6edf0f9E9368Ee9Af36814B738855",
            "costPercent": 1
          },
          {
            "poolAddress": "0x3d6e023177Bac13D6E316d95161D4bB9DCf0E276",
            "costPercent": 2
          }
        ]
      }
    },
    {
      "id": "KESm-XOFm",
      "tokens": [
        {
          "address": "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
          "symbol": "KESm"
        },
        {
          "address": "0x73F93dcc49cB8A239e2032663e9475dd5ef29A08",
          "symbol": "XOFm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0xa337a498e4e061F4029FCb3b9F4E3D535E885dc5",
          "token0": "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0x89de88b8eb790de26f4649f543cb6893d93635c728ac857f0926e842fb0d298b"
        },
        {
          "factoryAddr": "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3",
          "poolAddr": "0x3d6e023177Bac13D6E316d95161D4bB9DCf0E276",
          "token0": "0x73F93dcc49cB8A239e2032663e9475dd5ef29A08",
          "token1": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
          "poolType": "Virtual",
          "exchangeId": "0xc9664df358594c5eaf2f410ab371e2deb8b532ca26162d2bc36d99b8d174567b"
        }
      ],
      "costData": {
        "totalCostPercent": 2.98,
        "hops": [
          {
            "poolAddress": "0xa337a498e4e061F4029FCb3b9F4E3D535E885dc5",
            "costPercent": 1
          },
          {
            "poolAddress": "0x3d6e023177Bac13D6E316d95161D4bB9DCf0E276",
            "costPercent": 2
          }
        ]
      }
    }
  ],
  // Chain 11142220
  11142220: [
    {
      "id": "USDm-axlUSDC",
      "tokens": [
        {
          "address": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "symbol": "USDm"
        },
        {
          "address": "0x6285De9DA7C1d329C0451628638908915002d9d1",
          "symbol": "axlUSDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0xF1B77Ffc1F71b21b6c69876CEDAf82340803dE75",
          "token0": "0x6285De9DA7C1d329C0451628638908915002d9d1",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        }
      ],
      "costData": {
        "totalCostPercent": 0.05,
        "hops": [
          {
            "poolAddress": "0xF1B77Ffc1F71b21b6c69876CEDAf82340803dE75",
            "costPercent": 0.05
          }
        ]
      }
    },
    {
      "id": "USDC-USDm",
      "tokens": [
        {
          "address": "0x01C5C0122039549AD1493B8220cABEdD739BC44E",
          "symbol": "USDC"
        },
        {
          "address": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "symbol": "USDm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x7109E0A9B4623e90755b7e5c4e10F089E5Bf8bDb",
          "token0": "0x01C5C0122039549AD1493B8220cABEdD739BC44E",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        }
      ],
      "costData": {
        "totalCostPercent": 0.05,
        "hops": [
          {
            "poolAddress": "0x7109E0A9B4623e90755b7e5c4e10F089E5Bf8bDb",
            "costPercent": 0.05
          }
        ]
      }
    },
    {
      "id": "USDm-USD₮",
      "tokens": [
        {
          "address": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "symbol": "USDm"
        },
        {
          "address": "0xd077A400968890Eacc75cdc901F0356c943e4fDb",
          "symbol": "USD₮"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0xd1a70F43B2A95384DD2a7D7b259293328B3974f8",
          "token0": "0xd077A400968890Eacc75cdc901F0356c943e4fDb",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        }
      ],
      "costData": {
        "totalCostPercent": 0.05,
        "hops": [
          {
            "poolAddress": "0xd1a70F43B2A95384DD2a7D7b259293328B3974f8",
            "costPercent": 0.05
          }
        ]
      }
    },
    {
      "id": "USDC-axlUSDC",
      "tokens": [
        {
          "address": "0x01C5C0122039549AD1493B8220cABEdD739BC44E",
          "symbol": "USDC"
        },
        {
          "address": "0x6285De9DA7C1d329C0451628638908915002d9d1",
          "symbol": "axlUSDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0xF1B77Ffc1F71b21b6c69876CEDAf82340803dE75",
          "token0": "0x6285De9DA7C1d329C0451628638908915002d9d1",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x7109E0A9B4623e90755b7e5c4e10F089E5Bf8bDb",
          "token0": "0x01C5C0122039549AD1493B8220cABEdD739BC44E",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        }
      ],
      "costData": {
        "totalCostPercent": 0.099975,
        "hops": [
          {
            "poolAddress": "0xF1B77Ffc1F71b21b6c69876CEDAf82340803dE75",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x7109E0A9B4623e90755b7e5c4e10F089E5Bf8bDb",
            "costPercent": 0.05
          }
        ]
      }
    },
    {
      "id": "USD₮-axlUSDC",
      "tokens": [
        {
          "address": "0xd077A400968890Eacc75cdc901F0356c943e4fDb",
          "symbol": "USD₮"
        },
        {
          "address": "0x6285De9DA7C1d329C0451628638908915002d9d1",
          "symbol": "axlUSDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0xF1B77Ffc1F71b21b6c69876CEDAf82340803dE75",
          "token0": "0x6285De9DA7C1d329C0451628638908915002d9d1",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0xd1a70F43B2A95384DD2a7D7b259293328B3974f8",
          "token0": "0xd077A400968890Eacc75cdc901F0356c943e4fDb",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        }
      ],
      "costData": {
        "totalCostPercent": 0.099975,
        "hops": [
          {
            "poolAddress": "0xF1B77Ffc1F71b21b6c69876CEDAf82340803dE75",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0xd1a70F43B2A95384DD2a7D7b259293328B3974f8",
            "costPercent": 0.05
          }
        ]
      }
    },
    {
      "id": "USDC-USD₮",
      "tokens": [
        {
          "address": "0x01C5C0122039549AD1493B8220cABEdD739BC44E",
          "symbol": "USDC"
        },
        {
          "address": "0xd077A400968890Eacc75cdc901F0356c943e4fDb",
          "symbol": "USD₮"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x7109E0A9B4623e90755b7e5c4e10F089E5Bf8bDb",
          "token0": "0x01C5C0122039549AD1493B8220cABEdD739BC44E",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0xd1a70F43B2A95384DD2a7D7b259293328B3974f8",
          "token0": "0xd077A400968890Eacc75cdc901F0356c943e4fDb",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        }
      ],
      "costData": {
        "totalCostPercent": 0.099975,
        "hops": [
          {
            "poolAddress": "0x7109E0A9B4623e90755b7e5c4e10F089E5Bf8bDb",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0xd1a70F43B2A95384DD2a7D7b259293328B3974f8",
            "costPercent": 0.05
          }
        ]
      }
    },
    {
      "id": "AUDm-USDm",
      "tokens": [
        {
          "address": "0x5873Faeb42F3563dcD77F0fbbdA818E6d6DA3139",
          "symbol": "AUDm"
        },
        {
          "address": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "symbol": "USDm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x8103Fb2db87AC96cc62FAA399B98e1173720aB19",
          "token0": "0x5873Faeb42F3563dcD77F0fbbdA818E6d6DA3139",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xd580d237231109e6a96d67d82450611c610a805a26660c90281bdc0cd04a95c7"
        }
      ],
      "costData": {
        "totalCostPercent": 0.15,
        "hops": [
          {
            "poolAddress": "0x8103Fb2db87AC96cc62FAA399B98e1173720aB19",
            "costPercent": 0.15
          }
        ]
      }
    },
    {
      "id": "CADm-USDm",
      "tokens": [
        {
          "address": "0xF151c9a13b78C84f93f50B8b3bC689fedc134F60",
          "symbol": "CADm"
        },
        {
          "address": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "symbol": "USDm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x62722497dc8992337117ee79A02015dcEa43b2C2",
          "token0": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "token1": "0xF151c9a13b78C84f93f50B8b3bC689fedc134F60",
          "poolType": "Virtual",
          "exchangeId": "0x517ccc3bcab9f35e2e24143a0c1809068efc649f740846cfb6a1c5703735c1ee"
        }
      ],
      "costData": {
        "totalCostPercent": 0.15,
        "hops": [
          {
            "poolAddress": "0x62722497dc8992337117ee79A02015dcEa43b2C2",
            "costPercent": 0.15
          }
        ]
      }
    },
    {
      "id": "AUDm-axlUSDC",
      "tokens": [
        {
          "address": "0x5873Faeb42F3563dcD77F0fbbdA818E6d6DA3139",
          "symbol": "AUDm"
        },
        {
          "address": "0x6285De9DA7C1d329C0451628638908915002d9d1",
          "symbol": "axlUSDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0xF1B77Ffc1F71b21b6c69876CEDAf82340803dE75",
          "token0": "0x6285De9DA7C1d329C0451628638908915002d9d1",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x8103Fb2db87AC96cc62FAA399B98e1173720aB19",
          "token0": "0x5873Faeb42F3563dcD77F0fbbdA818E6d6DA3139",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xd580d237231109e6a96d67d82450611c610a805a26660c90281bdc0cd04a95c7"
        }
      ],
      "costData": {
        "totalCostPercent": 0.199925,
        "hops": [
          {
            "poolAddress": "0xF1B77Ffc1F71b21b6c69876CEDAf82340803dE75",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x8103Fb2db87AC96cc62FAA399B98e1173720aB19",
            "costPercent": 0.15
          }
        ]
      }
    },
    {
      "id": "CADm-axlUSDC",
      "tokens": [
        {
          "address": "0xF151c9a13b78C84f93f50B8b3bC689fedc134F60",
          "symbol": "CADm"
        },
        {
          "address": "0x6285De9DA7C1d329C0451628638908915002d9d1",
          "symbol": "axlUSDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0xF1B77Ffc1F71b21b6c69876CEDAf82340803dE75",
          "token0": "0x6285De9DA7C1d329C0451628638908915002d9d1",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x62722497dc8992337117ee79A02015dcEa43b2C2",
          "token0": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "token1": "0xF151c9a13b78C84f93f50B8b3bC689fedc134F60",
          "poolType": "Virtual",
          "exchangeId": "0x517ccc3bcab9f35e2e24143a0c1809068efc649f740846cfb6a1c5703735c1ee"
        }
      ],
      "costData": {
        "totalCostPercent": 0.199925,
        "hops": [
          {
            "poolAddress": "0xF1B77Ffc1F71b21b6c69876CEDAf82340803dE75",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x62722497dc8992337117ee79A02015dcEa43b2C2",
            "costPercent": 0.15
          }
        ]
      }
    },
    {
      "id": "AUDm-USDC",
      "tokens": [
        {
          "address": "0x5873Faeb42F3563dcD77F0fbbdA818E6d6DA3139",
          "symbol": "AUDm"
        },
        {
          "address": "0x01C5C0122039549AD1493B8220cABEdD739BC44E",
          "symbol": "USDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x7109E0A9B4623e90755b7e5c4e10F089E5Bf8bDb",
          "token0": "0x01C5C0122039549AD1493B8220cABEdD739BC44E",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x8103Fb2db87AC96cc62FAA399B98e1173720aB19",
          "token0": "0x5873Faeb42F3563dcD77F0fbbdA818E6d6DA3139",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xd580d237231109e6a96d67d82450611c610a805a26660c90281bdc0cd04a95c7"
        }
      ],
      "costData": {
        "totalCostPercent": 0.199925,
        "hops": [
          {
            "poolAddress": "0x7109E0A9B4623e90755b7e5c4e10F089E5Bf8bDb",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x8103Fb2db87AC96cc62FAA399B98e1173720aB19",
            "costPercent": 0.15
          }
        ]
      }
    },
    {
      "id": "CADm-USDC",
      "tokens": [
        {
          "address": "0xF151c9a13b78C84f93f50B8b3bC689fedc134F60",
          "symbol": "CADm"
        },
        {
          "address": "0x01C5C0122039549AD1493B8220cABEdD739BC44E",
          "symbol": "USDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x7109E0A9B4623e90755b7e5c4e10F089E5Bf8bDb",
          "token0": "0x01C5C0122039549AD1493B8220cABEdD739BC44E",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x62722497dc8992337117ee79A02015dcEa43b2C2",
          "token0": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "token1": "0xF151c9a13b78C84f93f50B8b3bC689fedc134F60",
          "poolType": "Virtual",
          "exchangeId": "0x517ccc3bcab9f35e2e24143a0c1809068efc649f740846cfb6a1c5703735c1ee"
        }
      ],
      "costData": {
        "totalCostPercent": 0.199925,
        "hops": [
          {
            "poolAddress": "0x7109E0A9B4623e90755b7e5c4e10F089E5Bf8bDb",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x62722497dc8992337117ee79A02015dcEa43b2C2",
            "costPercent": 0.15
          }
        ]
      }
    },
    {
      "id": "AUDm-USD₮",
      "tokens": [
        {
          "address": "0x5873Faeb42F3563dcD77F0fbbdA818E6d6DA3139",
          "symbol": "AUDm"
        },
        {
          "address": "0xd077A400968890Eacc75cdc901F0356c943e4fDb",
          "symbol": "USD₮"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0xd1a70F43B2A95384DD2a7D7b259293328B3974f8",
          "token0": "0xd077A400968890Eacc75cdc901F0356c943e4fDb",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x8103Fb2db87AC96cc62FAA399B98e1173720aB19",
          "token0": "0x5873Faeb42F3563dcD77F0fbbdA818E6d6DA3139",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xd580d237231109e6a96d67d82450611c610a805a26660c90281bdc0cd04a95c7"
        }
      ],
      "costData": {
        "totalCostPercent": 0.199925,
        "hops": [
          {
            "poolAddress": "0xd1a70F43B2A95384DD2a7D7b259293328B3974f8",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x8103Fb2db87AC96cc62FAA399B98e1173720aB19",
            "costPercent": 0.15
          }
        ]
      }
    },
    {
      "id": "CADm-USD₮",
      "tokens": [
        {
          "address": "0xF151c9a13b78C84f93f50B8b3bC689fedc134F60",
          "symbol": "CADm"
        },
        {
          "address": "0xd077A400968890Eacc75cdc901F0356c943e4fDb",
          "symbol": "USD₮"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0xd1a70F43B2A95384DD2a7D7b259293328B3974f8",
          "token0": "0xd077A400968890Eacc75cdc901F0356c943e4fDb",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x62722497dc8992337117ee79A02015dcEa43b2C2",
          "token0": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "token1": "0xF151c9a13b78C84f93f50B8b3bC689fedc134F60",
          "poolType": "Virtual",
          "exchangeId": "0x517ccc3bcab9f35e2e24143a0c1809068efc649f740846cfb6a1c5703735c1ee"
        }
      ],
      "costData": {
        "totalCostPercent": 0.199925,
        "hops": [
          {
            "poolAddress": "0xd1a70F43B2A95384DD2a7D7b259293328B3974f8",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x62722497dc8992337117ee79A02015dcEa43b2C2",
            "costPercent": 0.15
          }
        ]
      }
    },
    {
      "id": "AUDm-CADm",
      "tokens": [
        {
          "address": "0x5873Faeb42F3563dcD77F0fbbdA818E6d6DA3139",
          "symbol": "AUDm"
        },
        {
          "address": "0xF151c9a13b78C84f93f50B8b3bC689fedc134F60",
          "symbol": "CADm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x8103Fb2db87AC96cc62FAA399B98e1173720aB19",
          "token0": "0x5873Faeb42F3563dcD77F0fbbdA818E6d6DA3139",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xd580d237231109e6a96d67d82450611c610a805a26660c90281bdc0cd04a95c7"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x62722497dc8992337117ee79A02015dcEa43b2C2",
          "token0": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "token1": "0xF151c9a13b78C84f93f50B8b3bC689fedc134F60",
          "poolType": "Virtual",
          "exchangeId": "0x517ccc3bcab9f35e2e24143a0c1809068efc649f740846cfb6a1c5703735c1ee"
        }
      ],
      "costData": {
        "totalCostPercent": 0.299775,
        "hops": [
          {
            "poolAddress": "0x8103Fb2db87AC96cc62FAA399B98e1173720aB19",
            "costPercent": 0.15
          },
          {
            "poolAddress": "0x62722497dc8992337117ee79A02015dcEa43b2C2",
            "costPercent": 0.15
          }
        ]
      }
    },
    {
      "id": "GBPm-USDm",
      "tokens": [
        {
          "address": "0x85F5181Abdbf0e1814Fc4358582Ae07b8eBA3aF3",
          "symbol": "GBPm"
        },
        {
          "address": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "symbol": "USDm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x550D9EcB4C373510b8A41f5fB7D98E9E1c51A07e",
          "token0": "0x85F5181Abdbf0e1814Fc4358582Ae07b8eBA3aF3",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        }
      ],
      "costData": {
        "totalCostPercent": 0.3,
        "hops": [
          {
            "poolAddress": "0x550D9EcB4C373510b8A41f5fB7D98E9E1c51A07e",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "PHPm-USDm",
      "tokens": [
        {
          "address": "0x0352976d940a2C3FBa0C3623198947Ee1d17869E",
          "symbol": "PHPm"
        },
        {
          "address": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "symbol": "USDm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x671334256a893fDBc4FfE55F98f156A168bD897a",
          "token0": "0x0352976d940a2C3FBa0C3623198947Ee1d17869E",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x7952984d7278ca3417febf52815c321984ac3147ced2c02bb6a02b0bcab08413"
        }
      ],
      "costData": {
        "totalCostPercent": 0.3,
        "hops": [
          {
            "poolAddress": "0x671334256a893fDBc4FfE55F98f156A168bD897a",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "USDm-ZARm",
      "tokens": [
        {
          "address": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "symbol": "USDm"
        },
        {
          "address": "0x10CCfB235b0E1Ed394bACE4560C3ed016697687e",
          "symbol": "ZARm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x68D19b5a48cbbFd11057E97DA9960B09D771E7B6",
          "token0": "0x10CCfB235b0E1Ed394bACE4560C3ed016697687e",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x4206e101b13bf29e40b2bfed4cf167271c41677720f2ee786ac1bf5efac101cb"
        }
      ],
      "costData": {
        "totalCostPercent": 0.3,
        "hops": [
          {
            "poolAddress": "0x68D19b5a48cbbFd11057E97DA9960B09D771E7B6",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "CHFm-USDm",
      "tokens": [
        {
          "address": "0x284E9b7B623eAE866914b7FA0eB720C2Bb3C2980",
          "symbol": "CHFm"
        },
        {
          "address": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "symbol": "USDm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x58F08739eA9764097b9500B6e4A4db64D168b807",
          "token0": "0x284E9b7B623eAE866914b7FA0eB720C2Bb3C2980",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x3ddbc61433314a4b7d3cbb56a001fc4cc0f1d52d64338336d5f2083a580ce4fc"
        }
      ],
      "costData": {
        "totalCostPercent": 0.3,
        "hops": [
          {
            "poolAddress": "0x58F08739eA9764097b9500B6e4A4db64D168b807",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "JPYm-USDm",
      "tokens": [
        {
          "address": "0x85Bee67D435A39f7467a8a9DE34a5B73D25Df426",
          "symbol": "JPYm"
        },
        {
          "address": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "symbol": "USDm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x284c2d99c5A12A65F10eFF7183c33C1217B65A56",
          "token0": "0x85Bee67D435A39f7467a8a9DE34a5B73D25Df426",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x7c3b41fbd140c6fb54ff9f8f7b7b0c954606682d44ed5e56b0080f40faaf652c"
        }
      ],
      "costData": {
        "totalCostPercent": 0.3,
        "hops": [
          {
            "poolAddress": "0x284c2d99c5A12A65F10eFF7183c33C1217B65A56",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "COPm-USDm",
      "tokens": [
        {
          "address": "0x5F8d55c3627d2dc0a2B4afa798f877242F382F67",
          "symbol": "COPm"
        },
        {
          "address": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "symbol": "USDm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0xCBfC8C84168D7F34FabA0018A3A63b998f1ffeCe",
          "token0": "0x5F8d55c3627d2dc0a2B4afa798f877242F382F67",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x1c9378bd0973ff313a599d3effc654ba759f8ccca655ab6d6ce5bd39a212943b"
        }
      ],
      "costData": {
        "totalCostPercent": 0.3,
        "hops": [
          {
            "poolAddress": "0xCBfC8C84168D7F34FabA0018A3A63b998f1ffeCe",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "BRLm-USDm",
      "tokens": [
        {
          "address": "0x2294298942fdc79417DE9E0D740A4957E0e7783a",
          "symbol": "BRLm"
        },
        {
          "address": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "symbol": "USDm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x49A968C539599385c69c2d528500DA58d933FafA",
          "token0": "0x2294298942fdc79417DE9E0D740A4957E0e7783a",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xd11d52b973ddbb983cc2087aabcafd915fc3140cf9996aacc61db9710d1bde05"
        }
      ],
      "costData": {
        "totalCostPercent": 0.3,
        "hops": [
          {
            "poolAddress": "0x49A968C539599385c69c2d528500DA58d933FafA",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "GBPm-axlUSDC",
      "tokens": [
        {
          "address": "0x85F5181Abdbf0e1814Fc4358582Ae07b8eBA3aF3",
          "symbol": "GBPm"
        },
        {
          "address": "0x6285De9DA7C1d329C0451628638908915002d9d1",
          "symbol": "axlUSDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x550D9EcB4C373510b8A41f5fB7D98E9E1c51A07e",
          "token0": "0x85F5181Abdbf0e1814Fc4358582Ae07b8eBA3aF3",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0xF1B77Ffc1F71b21b6c69876CEDAf82340803dE75",
          "token0": "0x6285De9DA7C1d329C0451628638908915002d9d1",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        }
      ],
      "costData": {
        "totalCostPercent": 0.34985,
        "hops": [
          {
            "poolAddress": "0x550D9EcB4C373510b8A41f5fB7D98E9E1c51A07e",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0xF1B77Ffc1F71b21b6c69876CEDAf82340803dE75",
            "costPercent": 0.05
          }
        ]
      }
    },
    {
      "id": "GBPm-USDC",
      "tokens": [
        {
          "address": "0x85F5181Abdbf0e1814Fc4358582Ae07b8eBA3aF3",
          "symbol": "GBPm"
        },
        {
          "address": "0x01C5C0122039549AD1493B8220cABEdD739BC44E",
          "symbol": "USDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x550D9EcB4C373510b8A41f5fB7D98E9E1c51A07e",
          "token0": "0x85F5181Abdbf0e1814Fc4358582Ae07b8eBA3aF3",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x7109E0A9B4623e90755b7e5c4e10F089E5Bf8bDb",
          "token0": "0x01C5C0122039549AD1493B8220cABEdD739BC44E",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        }
      ],
      "costData": {
        "totalCostPercent": 0.34985,
        "hops": [
          {
            "poolAddress": "0x550D9EcB4C373510b8A41f5fB7D98E9E1c51A07e",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x7109E0A9B4623e90755b7e5c4e10F089E5Bf8bDb",
            "costPercent": 0.05
          }
        ]
      }
    },
    {
      "id": "GBPm-USD₮",
      "tokens": [
        {
          "address": "0x85F5181Abdbf0e1814Fc4358582Ae07b8eBA3aF3",
          "symbol": "GBPm"
        },
        {
          "address": "0xd077A400968890Eacc75cdc901F0356c943e4fDb",
          "symbol": "USD₮"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x550D9EcB4C373510b8A41f5fB7D98E9E1c51A07e",
          "token0": "0x85F5181Abdbf0e1814Fc4358582Ae07b8eBA3aF3",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0xd1a70F43B2A95384DD2a7D7b259293328B3974f8",
          "token0": "0xd077A400968890Eacc75cdc901F0356c943e4fDb",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        }
      ],
      "costData": {
        "totalCostPercent": 0.34985,
        "hops": [
          {
            "poolAddress": "0x550D9EcB4C373510b8A41f5fB7D98E9E1c51A07e",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0xd1a70F43B2A95384DD2a7D7b259293328B3974f8",
            "costPercent": 0.05
          }
        ]
      }
    },
    {
      "id": "PHPm-axlUSDC",
      "tokens": [
        {
          "address": "0x0352976d940a2C3FBa0C3623198947Ee1d17869E",
          "symbol": "PHPm"
        },
        {
          "address": "0x6285De9DA7C1d329C0451628638908915002d9d1",
          "symbol": "axlUSDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0xF1B77Ffc1F71b21b6c69876CEDAf82340803dE75",
          "token0": "0x6285De9DA7C1d329C0451628638908915002d9d1",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x671334256a893fDBc4FfE55F98f156A168bD897a",
          "token0": "0x0352976d940a2C3FBa0C3623198947Ee1d17869E",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x7952984d7278ca3417febf52815c321984ac3147ced2c02bb6a02b0bcab08413"
        }
      ],
      "costData": {
        "totalCostPercent": 0.34985,
        "hops": [
          {
            "poolAddress": "0xF1B77Ffc1F71b21b6c69876CEDAf82340803dE75",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x671334256a893fDBc4FfE55F98f156A168bD897a",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "ZARm-axlUSDC",
      "tokens": [
        {
          "address": "0x10CCfB235b0E1Ed394bACE4560C3ed016697687e",
          "symbol": "ZARm"
        },
        {
          "address": "0x6285De9DA7C1d329C0451628638908915002d9d1",
          "symbol": "axlUSDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0xF1B77Ffc1F71b21b6c69876CEDAf82340803dE75",
          "token0": "0x6285De9DA7C1d329C0451628638908915002d9d1",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x68D19b5a48cbbFd11057E97DA9960B09D771E7B6",
          "token0": "0x10CCfB235b0E1Ed394bACE4560C3ed016697687e",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x4206e101b13bf29e40b2bfed4cf167271c41677720f2ee786ac1bf5efac101cb"
        }
      ],
      "costData": {
        "totalCostPercent": 0.34985,
        "hops": [
          {
            "poolAddress": "0xF1B77Ffc1F71b21b6c69876CEDAf82340803dE75",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x68D19b5a48cbbFd11057E97DA9960B09D771E7B6",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "CHFm-axlUSDC",
      "tokens": [
        {
          "address": "0x284E9b7B623eAE866914b7FA0eB720C2Bb3C2980",
          "symbol": "CHFm"
        },
        {
          "address": "0x6285De9DA7C1d329C0451628638908915002d9d1",
          "symbol": "axlUSDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0xF1B77Ffc1F71b21b6c69876CEDAf82340803dE75",
          "token0": "0x6285De9DA7C1d329C0451628638908915002d9d1",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x58F08739eA9764097b9500B6e4A4db64D168b807",
          "token0": "0x284E9b7B623eAE866914b7FA0eB720C2Bb3C2980",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x3ddbc61433314a4b7d3cbb56a001fc4cc0f1d52d64338336d5f2083a580ce4fc"
        }
      ],
      "costData": {
        "totalCostPercent": 0.34985,
        "hops": [
          {
            "poolAddress": "0xF1B77Ffc1F71b21b6c69876CEDAf82340803dE75",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x58F08739eA9764097b9500B6e4A4db64D168b807",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "JPYm-axlUSDC",
      "tokens": [
        {
          "address": "0x85Bee67D435A39f7467a8a9DE34a5B73D25Df426",
          "symbol": "JPYm"
        },
        {
          "address": "0x6285De9DA7C1d329C0451628638908915002d9d1",
          "symbol": "axlUSDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0xF1B77Ffc1F71b21b6c69876CEDAf82340803dE75",
          "token0": "0x6285De9DA7C1d329C0451628638908915002d9d1",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x284c2d99c5A12A65F10eFF7183c33C1217B65A56",
          "token0": "0x85Bee67D435A39f7467a8a9DE34a5B73D25Df426",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x7c3b41fbd140c6fb54ff9f8f7b7b0c954606682d44ed5e56b0080f40faaf652c"
        }
      ],
      "costData": {
        "totalCostPercent": 0.34985,
        "hops": [
          {
            "poolAddress": "0xF1B77Ffc1F71b21b6c69876CEDAf82340803dE75",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x284c2d99c5A12A65F10eFF7183c33C1217B65A56",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "COPm-axlUSDC",
      "tokens": [
        {
          "address": "0x5F8d55c3627d2dc0a2B4afa798f877242F382F67",
          "symbol": "COPm"
        },
        {
          "address": "0x6285De9DA7C1d329C0451628638908915002d9d1",
          "symbol": "axlUSDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0xF1B77Ffc1F71b21b6c69876CEDAf82340803dE75",
          "token0": "0x6285De9DA7C1d329C0451628638908915002d9d1",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0xCBfC8C84168D7F34FabA0018A3A63b998f1ffeCe",
          "token0": "0x5F8d55c3627d2dc0a2B4afa798f877242F382F67",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x1c9378bd0973ff313a599d3effc654ba759f8ccca655ab6d6ce5bd39a212943b"
        }
      ],
      "costData": {
        "totalCostPercent": 0.34985,
        "hops": [
          {
            "poolAddress": "0xF1B77Ffc1F71b21b6c69876CEDAf82340803dE75",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0xCBfC8C84168D7F34FabA0018A3A63b998f1ffeCe",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "BRLm-axlUSDC",
      "tokens": [
        {
          "address": "0x2294298942fdc79417DE9E0D740A4957E0e7783a",
          "symbol": "BRLm"
        },
        {
          "address": "0x6285De9DA7C1d329C0451628638908915002d9d1",
          "symbol": "axlUSDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0xF1B77Ffc1F71b21b6c69876CEDAf82340803dE75",
          "token0": "0x6285De9DA7C1d329C0451628638908915002d9d1",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x49A968C539599385c69c2d528500DA58d933FafA",
          "token0": "0x2294298942fdc79417DE9E0D740A4957E0e7783a",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xd11d52b973ddbb983cc2087aabcafd915fc3140cf9996aacc61db9710d1bde05"
        }
      ],
      "costData": {
        "totalCostPercent": 0.34985,
        "hops": [
          {
            "poolAddress": "0xF1B77Ffc1F71b21b6c69876CEDAf82340803dE75",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x49A968C539599385c69c2d528500DA58d933FafA",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "PHPm-USDC",
      "tokens": [
        {
          "address": "0x0352976d940a2C3FBa0C3623198947Ee1d17869E",
          "symbol": "PHPm"
        },
        {
          "address": "0x01C5C0122039549AD1493B8220cABEdD739BC44E",
          "symbol": "USDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x7109E0A9B4623e90755b7e5c4e10F089E5Bf8bDb",
          "token0": "0x01C5C0122039549AD1493B8220cABEdD739BC44E",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x671334256a893fDBc4FfE55F98f156A168bD897a",
          "token0": "0x0352976d940a2C3FBa0C3623198947Ee1d17869E",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x7952984d7278ca3417febf52815c321984ac3147ced2c02bb6a02b0bcab08413"
        }
      ],
      "costData": {
        "totalCostPercent": 0.34985,
        "hops": [
          {
            "poolAddress": "0x7109E0A9B4623e90755b7e5c4e10F089E5Bf8bDb",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x671334256a893fDBc4FfE55F98f156A168bD897a",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "USDC-ZARm",
      "tokens": [
        {
          "address": "0x01C5C0122039549AD1493B8220cABEdD739BC44E",
          "symbol": "USDC"
        },
        {
          "address": "0x10CCfB235b0E1Ed394bACE4560C3ed016697687e",
          "symbol": "ZARm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x7109E0A9B4623e90755b7e5c4e10F089E5Bf8bDb",
          "token0": "0x01C5C0122039549AD1493B8220cABEdD739BC44E",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x68D19b5a48cbbFd11057E97DA9960B09D771E7B6",
          "token0": "0x10CCfB235b0E1Ed394bACE4560C3ed016697687e",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x4206e101b13bf29e40b2bfed4cf167271c41677720f2ee786ac1bf5efac101cb"
        }
      ],
      "costData": {
        "totalCostPercent": 0.34985,
        "hops": [
          {
            "poolAddress": "0x7109E0A9B4623e90755b7e5c4e10F089E5Bf8bDb",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x68D19b5a48cbbFd11057E97DA9960B09D771E7B6",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "CHFm-USDC",
      "tokens": [
        {
          "address": "0x284E9b7B623eAE866914b7FA0eB720C2Bb3C2980",
          "symbol": "CHFm"
        },
        {
          "address": "0x01C5C0122039549AD1493B8220cABEdD739BC44E",
          "symbol": "USDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x7109E0A9B4623e90755b7e5c4e10F089E5Bf8bDb",
          "token0": "0x01C5C0122039549AD1493B8220cABEdD739BC44E",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x58F08739eA9764097b9500B6e4A4db64D168b807",
          "token0": "0x284E9b7B623eAE866914b7FA0eB720C2Bb3C2980",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x3ddbc61433314a4b7d3cbb56a001fc4cc0f1d52d64338336d5f2083a580ce4fc"
        }
      ],
      "costData": {
        "totalCostPercent": 0.34985,
        "hops": [
          {
            "poolAddress": "0x7109E0A9B4623e90755b7e5c4e10F089E5Bf8bDb",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x58F08739eA9764097b9500B6e4A4db64D168b807",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "JPYm-USDC",
      "tokens": [
        {
          "address": "0x85Bee67D435A39f7467a8a9DE34a5B73D25Df426",
          "symbol": "JPYm"
        },
        {
          "address": "0x01C5C0122039549AD1493B8220cABEdD739BC44E",
          "symbol": "USDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x7109E0A9B4623e90755b7e5c4e10F089E5Bf8bDb",
          "token0": "0x01C5C0122039549AD1493B8220cABEdD739BC44E",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x284c2d99c5A12A65F10eFF7183c33C1217B65A56",
          "token0": "0x85Bee67D435A39f7467a8a9DE34a5B73D25Df426",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x7c3b41fbd140c6fb54ff9f8f7b7b0c954606682d44ed5e56b0080f40faaf652c"
        }
      ],
      "costData": {
        "totalCostPercent": 0.34985,
        "hops": [
          {
            "poolAddress": "0x7109E0A9B4623e90755b7e5c4e10F089E5Bf8bDb",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x284c2d99c5A12A65F10eFF7183c33C1217B65A56",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "COPm-USDC",
      "tokens": [
        {
          "address": "0x5F8d55c3627d2dc0a2B4afa798f877242F382F67",
          "symbol": "COPm"
        },
        {
          "address": "0x01C5C0122039549AD1493B8220cABEdD739BC44E",
          "symbol": "USDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x7109E0A9B4623e90755b7e5c4e10F089E5Bf8bDb",
          "token0": "0x01C5C0122039549AD1493B8220cABEdD739BC44E",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0xCBfC8C84168D7F34FabA0018A3A63b998f1ffeCe",
          "token0": "0x5F8d55c3627d2dc0a2B4afa798f877242F382F67",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x1c9378bd0973ff313a599d3effc654ba759f8ccca655ab6d6ce5bd39a212943b"
        }
      ],
      "costData": {
        "totalCostPercent": 0.34985,
        "hops": [
          {
            "poolAddress": "0x7109E0A9B4623e90755b7e5c4e10F089E5Bf8bDb",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0xCBfC8C84168D7F34FabA0018A3A63b998f1ffeCe",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "BRLm-USDC",
      "tokens": [
        {
          "address": "0x2294298942fdc79417DE9E0D740A4957E0e7783a",
          "symbol": "BRLm"
        },
        {
          "address": "0x01C5C0122039549AD1493B8220cABEdD739BC44E",
          "symbol": "USDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x7109E0A9B4623e90755b7e5c4e10F089E5Bf8bDb",
          "token0": "0x01C5C0122039549AD1493B8220cABEdD739BC44E",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x49A968C539599385c69c2d528500DA58d933FafA",
          "token0": "0x2294298942fdc79417DE9E0D740A4957E0e7783a",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xd11d52b973ddbb983cc2087aabcafd915fc3140cf9996aacc61db9710d1bde05"
        }
      ],
      "costData": {
        "totalCostPercent": 0.34985,
        "hops": [
          {
            "poolAddress": "0x7109E0A9B4623e90755b7e5c4e10F089E5Bf8bDb",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x49A968C539599385c69c2d528500DA58d933FafA",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "PHPm-USD₮",
      "tokens": [
        {
          "address": "0x0352976d940a2C3FBa0C3623198947Ee1d17869E",
          "symbol": "PHPm"
        },
        {
          "address": "0xd077A400968890Eacc75cdc901F0356c943e4fDb",
          "symbol": "USD₮"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0xd1a70F43B2A95384DD2a7D7b259293328B3974f8",
          "token0": "0xd077A400968890Eacc75cdc901F0356c943e4fDb",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x671334256a893fDBc4FfE55F98f156A168bD897a",
          "token0": "0x0352976d940a2C3FBa0C3623198947Ee1d17869E",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x7952984d7278ca3417febf52815c321984ac3147ced2c02bb6a02b0bcab08413"
        }
      ],
      "costData": {
        "totalCostPercent": 0.34985,
        "hops": [
          {
            "poolAddress": "0xd1a70F43B2A95384DD2a7D7b259293328B3974f8",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x671334256a893fDBc4FfE55F98f156A168bD897a",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "USD₮-ZARm",
      "tokens": [
        {
          "address": "0xd077A400968890Eacc75cdc901F0356c943e4fDb",
          "symbol": "USD₮"
        },
        {
          "address": "0x10CCfB235b0E1Ed394bACE4560C3ed016697687e",
          "symbol": "ZARm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0xd1a70F43B2A95384DD2a7D7b259293328B3974f8",
          "token0": "0xd077A400968890Eacc75cdc901F0356c943e4fDb",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x68D19b5a48cbbFd11057E97DA9960B09D771E7B6",
          "token0": "0x10CCfB235b0E1Ed394bACE4560C3ed016697687e",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x4206e101b13bf29e40b2bfed4cf167271c41677720f2ee786ac1bf5efac101cb"
        }
      ],
      "costData": {
        "totalCostPercent": 0.34985,
        "hops": [
          {
            "poolAddress": "0xd1a70F43B2A95384DD2a7D7b259293328B3974f8",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x68D19b5a48cbbFd11057E97DA9960B09D771E7B6",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "CHFm-USD₮",
      "tokens": [
        {
          "address": "0x284E9b7B623eAE866914b7FA0eB720C2Bb3C2980",
          "symbol": "CHFm"
        },
        {
          "address": "0xd077A400968890Eacc75cdc901F0356c943e4fDb",
          "symbol": "USD₮"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0xd1a70F43B2A95384DD2a7D7b259293328B3974f8",
          "token0": "0xd077A400968890Eacc75cdc901F0356c943e4fDb",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x58F08739eA9764097b9500B6e4A4db64D168b807",
          "token0": "0x284E9b7B623eAE866914b7FA0eB720C2Bb3C2980",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x3ddbc61433314a4b7d3cbb56a001fc4cc0f1d52d64338336d5f2083a580ce4fc"
        }
      ],
      "costData": {
        "totalCostPercent": 0.34985,
        "hops": [
          {
            "poolAddress": "0xd1a70F43B2A95384DD2a7D7b259293328B3974f8",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x58F08739eA9764097b9500B6e4A4db64D168b807",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "JPYm-USD₮",
      "tokens": [
        {
          "address": "0x85Bee67D435A39f7467a8a9DE34a5B73D25Df426",
          "symbol": "JPYm"
        },
        {
          "address": "0xd077A400968890Eacc75cdc901F0356c943e4fDb",
          "symbol": "USD₮"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0xd1a70F43B2A95384DD2a7D7b259293328B3974f8",
          "token0": "0xd077A400968890Eacc75cdc901F0356c943e4fDb",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x284c2d99c5A12A65F10eFF7183c33C1217B65A56",
          "token0": "0x85Bee67D435A39f7467a8a9DE34a5B73D25Df426",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x7c3b41fbd140c6fb54ff9f8f7b7b0c954606682d44ed5e56b0080f40faaf652c"
        }
      ],
      "costData": {
        "totalCostPercent": 0.34985,
        "hops": [
          {
            "poolAddress": "0xd1a70F43B2A95384DD2a7D7b259293328B3974f8",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x284c2d99c5A12A65F10eFF7183c33C1217B65A56",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "COPm-USD₮",
      "tokens": [
        {
          "address": "0x5F8d55c3627d2dc0a2B4afa798f877242F382F67",
          "symbol": "COPm"
        },
        {
          "address": "0xd077A400968890Eacc75cdc901F0356c943e4fDb",
          "symbol": "USD₮"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0xd1a70F43B2A95384DD2a7D7b259293328B3974f8",
          "token0": "0xd077A400968890Eacc75cdc901F0356c943e4fDb",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0xCBfC8C84168D7F34FabA0018A3A63b998f1ffeCe",
          "token0": "0x5F8d55c3627d2dc0a2B4afa798f877242F382F67",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x1c9378bd0973ff313a599d3effc654ba759f8ccca655ab6d6ce5bd39a212943b"
        }
      ],
      "costData": {
        "totalCostPercent": 0.34985,
        "hops": [
          {
            "poolAddress": "0xd1a70F43B2A95384DD2a7D7b259293328B3974f8",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0xCBfC8C84168D7F34FabA0018A3A63b998f1ffeCe",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "BRLm-USD₮",
      "tokens": [
        {
          "address": "0x2294298942fdc79417DE9E0D740A4957E0e7783a",
          "symbol": "BRLm"
        },
        {
          "address": "0xd077A400968890Eacc75cdc901F0356c943e4fDb",
          "symbol": "USD₮"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0xd1a70F43B2A95384DD2a7D7b259293328B3974f8",
          "token0": "0xd077A400968890Eacc75cdc901F0356c943e4fDb",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x49A968C539599385c69c2d528500DA58d933FafA",
          "token0": "0x2294298942fdc79417DE9E0D740A4957E0e7783a",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xd11d52b973ddbb983cc2087aabcafd915fc3140cf9996aacc61db9710d1bde05"
        }
      ],
      "costData": {
        "totalCostPercent": 0.34985,
        "hops": [
          {
            "poolAddress": "0xd1a70F43B2A95384DD2a7D7b259293328B3974f8",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x49A968C539599385c69c2d528500DA58d933FafA",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "AUDm-GBPm",
      "tokens": [
        {
          "address": "0x5873Faeb42F3563dcD77F0fbbdA818E6d6DA3139",
          "symbol": "AUDm"
        },
        {
          "address": "0x85F5181Abdbf0e1814Fc4358582Ae07b8eBA3aF3",
          "symbol": "GBPm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x550D9EcB4C373510b8A41f5fB7D98E9E1c51A07e",
          "token0": "0x85F5181Abdbf0e1814Fc4358582Ae07b8eBA3aF3",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x8103Fb2db87AC96cc62FAA399B98e1173720aB19",
          "token0": "0x5873Faeb42F3563dcD77F0fbbdA818E6d6DA3139",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xd580d237231109e6a96d67d82450611c610a805a26660c90281bdc0cd04a95c7"
        }
      ],
      "costData": {
        "totalCostPercent": 0.44955,
        "hops": [
          {
            "poolAddress": "0x550D9EcB4C373510b8A41f5fB7D98E9E1c51A07e",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x8103Fb2db87AC96cc62FAA399B98e1173720aB19",
            "costPercent": 0.15
          }
        ]
      }
    },
    {
      "id": "CADm-GBPm",
      "tokens": [
        {
          "address": "0xF151c9a13b78C84f93f50B8b3bC689fedc134F60",
          "symbol": "CADm"
        },
        {
          "address": "0x85F5181Abdbf0e1814Fc4358582Ae07b8eBA3aF3",
          "symbol": "GBPm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x550D9EcB4C373510b8A41f5fB7D98E9E1c51A07e",
          "token0": "0x85F5181Abdbf0e1814Fc4358582Ae07b8eBA3aF3",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x62722497dc8992337117ee79A02015dcEa43b2C2",
          "token0": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "token1": "0xF151c9a13b78C84f93f50B8b3bC689fedc134F60",
          "poolType": "Virtual",
          "exchangeId": "0x517ccc3bcab9f35e2e24143a0c1809068efc649f740846cfb6a1c5703735c1ee"
        }
      ],
      "costData": {
        "totalCostPercent": 0.44955,
        "hops": [
          {
            "poolAddress": "0x550D9EcB4C373510b8A41f5fB7D98E9E1c51A07e",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x62722497dc8992337117ee79A02015dcEa43b2C2",
            "costPercent": 0.15
          }
        ]
      }
    },
    {
      "id": "AUDm-PHPm",
      "tokens": [
        {
          "address": "0x5873Faeb42F3563dcD77F0fbbdA818E6d6DA3139",
          "symbol": "AUDm"
        },
        {
          "address": "0x0352976d940a2C3FBa0C3623198947Ee1d17869E",
          "symbol": "PHPm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x671334256a893fDBc4FfE55F98f156A168bD897a",
          "token0": "0x0352976d940a2C3FBa0C3623198947Ee1d17869E",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x7952984d7278ca3417febf52815c321984ac3147ced2c02bb6a02b0bcab08413"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x8103Fb2db87AC96cc62FAA399B98e1173720aB19",
          "token0": "0x5873Faeb42F3563dcD77F0fbbdA818E6d6DA3139",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xd580d237231109e6a96d67d82450611c610a805a26660c90281bdc0cd04a95c7"
        }
      ],
      "costData": {
        "totalCostPercent": 0.44955,
        "hops": [
          {
            "poolAddress": "0x671334256a893fDBc4FfE55F98f156A168bD897a",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x8103Fb2db87AC96cc62FAA399B98e1173720aB19",
            "costPercent": 0.15
          }
        ]
      }
    },
    {
      "id": "CADm-PHPm",
      "tokens": [
        {
          "address": "0xF151c9a13b78C84f93f50B8b3bC689fedc134F60",
          "symbol": "CADm"
        },
        {
          "address": "0x0352976d940a2C3FBa0C3623198947Ee1d17869E",
          "symbol": "PHPm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x671334256a893fDBc4FfE55F98f156A168bD897a",
          "token0": "0x0352976d940a2C3FBa0C3623198947Ee1d17869E",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x7952984d7278ca3417febf52815c321984ac3147ced2c02bb6a02b0bcab08413"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x62722497dc8992337117ee79A02015dcEa43b2C2",
          "token0": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "token1": "0xF151c9a13b78C84f93f50B8b3bC689fedc134F60",
          "poolType": "Virtual",
          "exchangeId": "0x517ccc3bcab9f35e2e24143a0c1809068efc649f740846cfb6a1c5703735c1ee"
        }
      ],
      "costData": {
        "totalCostPercent": 0.44955,
        "hops": [
          {
            "poolAddress": "0x671334256a893fDBc4FfE55F98f156A168bD897a",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x62722497dc8992337117ee79A02015dcEa43b2C2",
            "costPercent": 0.15
          }
        ]
      }
    },
    {
      "id": "AUDm-ZARm",
      "tokens": [
        {
          "address": "0x5873Faeb42F3563dcD77F0fbbdA818E6d6DA3139",
          "symbol": "AUDm"
        },
        {
          "address": "0x10CCfB235b0E1Ed394bACE4560C3ed016697687e",
          "symbol": "ZARm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x8103Fb2db87AC96cc62FAA399B98e1173720aB19",
          "token0": "0x5873Faeb42F3563dcD77F0fbbdA818E6d6DA3139",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xd580d237231109e6a96d67d82450611c610a805a26660c90281bdc0cd04a95c7"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x68D19b5a48cbbFd11057E97DA9960B09D771E7B6",
          "token0": "0x10CCfB235b0E1Ed394bACE4560C3ed016697687e",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x4206e101b13bf29e40b2bfed4cf167271c41677720f2ee786ac1bf5efac101cb"
        }
      ],
      "costData": {
        "totalCostPercent": 0.44955,
        "hops": [
          {
            "poolAddress": "0x8103Fb2db87AC96cc62FAA399B98e1173720aB19",
            "costPercent": 0.15
          },
          {
            "poolAddress": "0x68D19b5a48cbbFd11057E97DA9960B09D771E7B6",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "AUDm-CHFm",
      "tokens": [
        {
          "address": "0x5873Faeb42F3563dcD77F0fbbdA818E6d6DA3139",
          "symbol": "AUDm"
        },
        {
          "address": "0x284E9b7B623eAE866914b7FA0eB720C2Bb3C2980",
          "symbol": "CHFm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x8103Fb2db87AC96cc62FAA399B98e1173720aB19",
          "token0": "0x5873Faeb42F3563dcD77F0fbbdA818E6d6DA3139",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xd580d237231109e6a96d67d82450611c610a805a26660c90281bdc0cd04a95c7"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x58F08739eA9764097b9500B6e4A4db64D168b807",
          "token0": "0x284E9b7B623eAE866914b7FA0eB720C2Bb3C2980",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x3ddbc61433314a4b7d3cbb56a001fc4cc0f1d52d64338336d5f2083a580ce4fc"
        }
      ],
      "costData": {
        "totalCostPercent": 0.44955,
        "hops": [
          {
            "poolAddress": "0x8103Fb2db87AC96cc62FAA399B98e1173720aB19",
            "costPercent": 0.15
          },
          {
            "poolAddress": "0x58F08739eA9764097b9500B6e4A4db64D168b807",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "AUDm-JPYm",
      "tokens": [
        {
          "address": "0x5873Faeb42F3563dcD77F0fbbdA818E6d6DA3139",
          "symbol": "AUDm"
        },
        {
          "address": "0x85Bee67D435A39f7467a8a9DE34a5B73D25Df426",
          "symbol": "JPYm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x8103Fb2db87AC96cc62FAA399B98e1173720aB19",
          "token0": "0x5873Faeb42F3563dcD77F0fbbdA818E6d6DA3139",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xd580d237231109e6a96d67d82450611c610a805a26660c90281bdc0cd04a95c7"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x284c2d99c5A12A65F10eFF7183c33C1217B65A56",
          "token0": "0x85Bee67D435A39f7467a8a9DE34a5B73D25Df426",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x7c3b41fbd140c6fb54ff9f8f7b7b0c954606682d44ed5e56b0080f40faaf652c"
        }
      ],
      "costData": {
        "totalCostPercent": 0.44955,
        "hops": [
          {
            "poolAddress": "0x8103Fb2db87AC96cc62FAA399B98e1173720aB19",
            "costPercent": 0.15
          },
          {
            "poolAddress": "0x284c2d99c5A12A65F10eFF7183c33C1217B65A56",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "AUDm-COPm",
      "tokens": [
        {
          "address": "0x5873Faeb42F3563dcD77F0fbbdA818E6d6DA3139",
          "symbol": "AUDm"
        },
        {
          "address": "0x5F8d55c3627d2dc0a2B4afa798f877242F382F67",
          "symbol": "COPm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x8103Fb2db87AC96cc62FAA399B98e1173720aB19",
          "token0": "0x5873Faeb42F3563dcD77F0fbbdA818E6d6DA3139",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xd580d237231109e6a96d67d82450611c610a805a26660c90281bdc0cd04a95c7"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0xCBfC8C84168D7F34FabA0018A3A63b998f1ffeCe",
          "token0": "0x5F8d55c3627d2dc0a2B4afa798f877242F382F67",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x1c9378bd0973ff313a599d3effc654ba759f8ccca655ab6d6ce5bd39a212943b"
        }
      ],
      "costData": {
        "totalCostPercent": 0.44955,
        "hops": [
          {
            "poolAddress": "0x8103Fb2db87AC96cc62FAA399B98e1173720aB19",
            "costPercent": 0.15
          },
          {
            "poolAddress": "0xCBfC8C84168D7F34FabA0018A3A63b998f1ffeCe",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "AUDm-BRLm",
      "tokens": [
        {
          "address": "0x5873Faeb42F3563dcD77F0fbbdA818E6d6DA3139",
          "symbol": "AUDm"
        },
        {
          "address": "0x2294298942fdc79417DE9E0D740A4957E0e7783a",
          "symbol": "BRLm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x8103Fb2db87AC96cc62FAA399B98e1173720aB19",
          "token0": "0x5873Faeb42F3563dcD77F0fbbdA818E6d6DA3139",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xd580d237231109e6a96d67d82450611c610a805a26660c90281bdc0cd04a95c7"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x49A968C539599385c69c2d528500DA58d933FafA",
          "token0": "0x2294298942fdc79417DE9E0D740A4957E0e7783a",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xd11d52b973ddbb983cc2087aabcafd915fc3140cf9996aacc61db9710d1bde05"
        }
      ],
      "costData": {
        "totalCostPercent": 0.44955,
        "hops": [
          {
            "poolAddress": "0x8103Fb2db87AC96cc62FAA399B98e1173720aB19",
            "costPercent": 0.15
          },
          {
            "poolAddress": "0x49A968C539599385c69c2d528500DA58d933FafA",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "CADm-ZARm",
      "tokens": [
        {
          "address": "0xF151c9a13b78C84f93f50B8b3bC689fedc134F60",
          "symbol": "CADm"
        },
        {
          "address": "0x10CCfB235b0E1Ed394bACE4560C3ed016697687e",
          "symbol": "ZARm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x62722497dc8992337117ee79A02015dcEa43b2C2",
          "token0": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "token1": "0xF151c9a13b78C84f93f50B8b3bC689fedc134F60",
          "poolType": "Virtual",
          "exchangeId": "0x517ccc3bcab9f35e2e24143a0c1809068efc649f740846cfb6a1c5703735c1ee"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x68D19b5a48cbbFd11057E97DA9960B09D771E7B6",
          "token0": "0x10CCfB235b0E1Ed394bACE4560C3ed016697687e",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x4206e101b13bf29e40b2bfed4cf167271c41677720f2ee786ac1bf5efac101cb"
        }
      ],
      "costData": {
        "totalCostPercent": 0.44955,
        "hops": [
          {
            "poolAddress": "0x62722497dc8992337117ee79A02015dcEa43b2C2",
            "costPercent": 0.15
          },
          {
            "poolAddress": "0x68D19b5a48cbbFd11057E97DA9960B09D771E7B6",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "CADm-CHFm",
      "tokens": [
        {
          "address": "0xF151c9a13b78C84f93f50B8b3bC689fedc134F60",
          "symbol": "CADm"
        },
        {
          "address": "0x284E9b7B623eAE866914b7FA0eB720C2Bb3C2980",
          "symbol": "CHFm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x62722497dc8992337117ee79A02015dcEa43b2C2",
          "token0": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "token1": "0xF151c9a13b78C84f93f50B8b3bC689fedc134F60",
          "poolType": "Virtual",
          "exchangeId": "0x517ccc3bcab9f35e2e24143a0c1809068efc649f740846cfb6a1c5703735c1ee"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x58F08739eA9764097b9500B6e4A4db64D168b807",
          "token0": "0x284E9b7B623eAE866914b7FA0eB720C2Bb3C2980",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x3ddbc61433314a4b7d3cbb56a001fc4cc0f1d52d64338336d5f2083a580ce4fc"
        }
      ],
      "costData": {
        "totalCostPercent": 0.44955,
        "hops": [
          {
            "poolAddress": "0x62722497dc8992337117ee79A02015dcEa43b2C2",
            "costPercent": 0.15
          },
          {
            "poolAddress": "0x58F08739eA9764097b9500B6e4A4db64D168b807",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "CADm-JPYm",
      "tokens": [
        {
          "address": "0xF151c9a13b78C84f93f50B8b3bC689fedc134F60",
          "symbol": "CADm"
        },
        {
          "address": "0x85Bee67D435A39f7467a8a9DE34a5B73D25Df426",
          "symbol": "JPYm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x62722497dc8992337117ee79A02015dcEa43b2C2",
          "token0": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "token1": "0xF151c9a13b78C84f93f50B8b3bC689fedc134F60",
          "poolType": "Virtual",
          "exchangeId": "0x517ccc3bcab9f35e2e24143a0c1809068efc649f740846cfb6a1c5703735c1ee"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x284c2d99c5A12A65F10eFF7183c33C1217B65A56",
          "token0": "0x85Bee67D435A39f7467a8a9DE34a5B73D25Df426",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x7c3b41fbd140c6fb54ff9f8f7b7b0c954606682d44ed5e56b0080f40faaf652c"
        }
      ],
      "costData": {
        "totalCostPercent": 0.44955,
        "hops": [
          {
            "poolAddress": "0x62722497dc8992337117ee79A02015dcEa43b2C2",
            "costPercent": 0.15
          },
          {
            "poolAddress": "0x284c2d99c5A12A65F10eFF7183c33C1217B65A56",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "CADm-COPm",
      "tokens": [
        {
          "address": "0xF151c9a13b78C84f93f50B8b3bC689fedc134F60",
          "symbol": "CADm"
        },
        {
          "address": "0x5F8d55c3627d2dc0a2B4afa798f877242F382F67",
          "symbol": "COPm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x62722497dc8992337117ee79A02015dcEa43b2C2",
          "token0": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "token1": "0xF151c9a13b78C84f93f50B8b3bC689fedc134F60",
          "poolType": "Virtual",
          "exchangeId": "0x517ccc3bcab9f35e2e24143a0c1809068efc649f740846cfb6a1c5703735c1ee"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0xCBfC8C84168D7F34FabA0018A3A63b998f1ffeCe",
          "token0": "0x5F8d55c3627d2dc0a2B4afa798f877242F382F67",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x1c9378bd0973ff313a599d3effc654ba759f8ccca655ab6d6ce5bd39a212943b"
        }
      ],
      "costData": {
        "totalCostPercent": 0.44955,
        "hops": [
          {
            "poolAddress": "0x62722497dc8992337117ee79A02015dcEa43b2C2",
            "costPercent": 0.15
          },
          {
            "poolAddress": "0xCBfC8C84168D7F34FabA0018A3A63b998f1ffeCe",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "BRLm-CADm",
      "tokens": [
        {
          "address": "0x2294298942fdc79417DE9E0D740A4957E0e7783a",
          "symbol": "BRLm"
        },
        {
          "address": "0xF151c9a13b78C84f93f50B8b3bC689fedc134F60",
          "symbol": "CADm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x62722497dc8992337117ee79A02015dcEa43b2C2",
          "token0": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "token1": "0xF151c9a13b78C84f93f50B8b3bC689fedc134F60",
          "poolType": "Virtual",
          "exchangeId": "0x517ccc3bcab9f35e2e24143a0c1809068efc649f740846cfb6a1c5703735c1ee"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x49A968C539599385c69c2d528500DA58d933FafA",
          "token0": "0x2294298942fdc79417DE9E0D740A4957E0e7783a",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xd11d52b973ddbb983cc2087aabcafd915fc3140cf9996aacc61db9710d1bde05"
        }
      ],
      "costData": {
        "totalCostPercent": 0.44955,
        "hops": [
          {
            "poolAddress": "0x62722497dc8992337117ee79A02015dcEa43b2C2",
            "costPercent": 0.15
          },
          {
            "poolAddress": "0x49A968C539599385c69c2d528500DA58d933FafA",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "GBPm-PHPm",
      "tokens": [
        {
          "address": "0x85F5181Abdbf0e1814Fc4358582Ae07b8eBA3aF3",
          "symbol": "GBPm"
        },
        {
          "address": "0x0352976d940a2C3FBa0C3623198947Ee1d17869E",
          "symbol": "PHPm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x550D9EcB4C373510b8A41f5fB7D98E9E1c51A07e",
          "token0": "0x85F5181Abdbf0e1814Fc4358582Ae07b8eBA3aF3",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x671334256a893fDBc4FfE55F98f156A168bD897a",
          "token0": "0x0352976d940a2C3FBa0C3623198947Ee1d17869E",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x7952984d7278ca3417febf52815c321984ac3147ced2c02bb6a02b0bcab08413"
        }
      ],
      "costData": {
        "totalCostPercent": 0.5991,
        "hops": [
          {
            "poolAddress": "0x550D9EcB4C373510b8A41f5fB7D98E9E1c51A07e",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x671334256a893fDBc4FfE55F98f156A168bD897a",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "GBPm-ZARm",
      "tokens": [
        {
          "address": "0x85F5181Abdbf0e1814Fc4358582Ae07b8eBA3aF3",
          "symbol": "GBPm"
        },
        {
          "address": "0x10CCfB235b0E1Ed394bACE4560C3ed016697687e",
          "symbol": "ZARm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x550D9EcB4C373510b8A41f5fB7D98E9E1c51A07e",
          "token0": "0x85F5181Abdbf0e1814Fc4358582Ae07b8eBA3aF3",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x68D19b5a48cbbFd11057E97DA9960B09D771E7B6",
          "token0": "0x10CCfB235b0E1Ed394bACE4560C3ed016697687e",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x4206e101b13bf29e40b2bfed4cf167271c41677720f2ee786ac1bf5efac101cb"
        }
      ],
      "costData": {
        "totalCostPercent": 0.5991,
        "hops": [
          {
            "poolAddress": "0x550D9EcB4C373510b8A41f5fB7D98E9E1c51A07e",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x68D19b5a48cbbFd11057E97DA9960B09D771E7B6",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "CHFm-GBPm",
      "tokens": [
        {
          "address": "0x284E9b7B623eAE866914b7FA0eB720C2Bb3C2980",
          "symbol": "CHFm"
        },
        {
          "address": "0x85F5181Abdbf0e1814Fc4358582Ae07b8eBA3aF3",
          "symbol": "GBPm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x550D9EcB4C373510b8A41f5fB7D98E9E1c51A07e",
          "token0": "0x85F5181Abdbf0e1814Fc4358582Ae07b8eBA3aF3",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x58F08739eA9764097b9500B6e4A4db64D168b807",
          "token0": "0x284E9b7B623eAE866914b7FA0eB720C2Bb3C2980",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x3ddbc61433314a4b7d3cbb56a001fc4cc0f1d52d64338336d5f2083a580ce4fc"
        }
      ],
      "costData": {
        "totalCostPercent": 0.5991,
        "hops": [
          {
            "poolAddress": "0x550D9EcB4C373510b8A41f5fB7D98E9E1c51A07e",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x58F08739eA9764097b9500B6e4A4db64D168b807",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "GBPm-JPYm",
      "tokens": [
        {
          "address": "0x85F5181Abdbf0e1814Fc4358582Ae07b8eBA3aF3",
          "symbol": "GBPm"
        },
        {
          "address": "0x85Bee67D435A39f7467a8a9DE34a5B73D25Df426",
          "symbol": "JPYm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x550D9EcB4C373510b8A41f5fB7D98E9E1c51A07e",
          "token0": "0x85F5181Abdbf0e1814Fc4358582Ae07b8eBA3aF3",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x284c2d99c5A12A65F10eFF7183c33C1217B65A56",
          "token0": "0x85Bee67D435A39f7467a8a9DE34a5B73D25Df426",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x7c3b41fbd140c6fb54ff9f8f7b7b0c954606682d44ed5e56b0080f40faaf652c"
        }
      ],
      "costData": {
        "totalCostPercent": 0.5991,
        "hops": [
          {
            "poolAddress": "0x550D9EcB4C373510b8A41f5fB7D98E9E1c51A07e",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x284c2d99c5A12A65F10eFF7183c33C1217B65A56",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "COPm-GBPm",
      "tokens": [
        {
          "address": "0x5F8d55c3627d2dc0a2B4afa798f877242F382F67",
          "symbol": "COPm"
        },
        {
          "address": "0x85F5181Abdbf0e1814Fc4358582Ae07b8eBA3aF3",
          "symbol": "GBPm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x550D9EcB4C373510b8A41f5fB7D98E9E1c51A07e",
          "token0": "0x85F5181Abdbf0e1814Fc4358582Ae07b8eBA3aF3",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0xCBfC8C84168D7F34FabA0018A3A63b998f1ffeCe",
          "token0": "0x5F8d55c3627d2dc0a2B4afa798f877242F382F67",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x1c9378bd0973ff313a599d3effc654ba759f8ccca655ab6d6ce5bd39a212943b"
        }
      ],
      "costData": {
        "totalCostPercent": 0.5991,
        "hops": [
          {
            "poolAddress": "0x550D9EcB4C373510b8A41f5fB7D98E9E1c51A07e",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0xCBfC8C84168D7F34FabA0018A3A63b998f1ffeCe",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "BRLm-GBPm",
      "tokens": [
        {
          "address": "0x2294298942fdc79417DE9E0D740A4957E0e7783a",
          "symbol": "BRLm"
        },
        {
          "address": "0x85F5181Abdbf0e1814Fc4358582Ae07b8eBA3aF3",
          "symbol": "GBPm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x550D9EcB4C373510b8A41f5fB7D98E9E1c51A07e",
          "token0": "0x85F5181Abdbf0e1814Fc4358582Ae07b8eBA3aF3",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x49A968C539599385c69c2d528500DA58d933FafA",
          "token0": "0x2294298942fdc79417DE9E0D740A4957E0e7783a",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xd11d52b973ddbb983cc2087aabcafd915fc3140cf9996aacc61db9710d1bde05"
        }
      ],
      "costData": {
        "totalCostPercent": 0.5991,
        "hops": [
          {
            "poolAddress": "0x550D9EcB4C373510b8A41f5fB7D98E9E1c51A07e",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x49A968C539599385c69c2d528500DA58d933FafA",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "PHPm-ZARm",
      "tokens": [
        {
          "address": "0x0352976d940a2C3FBa0C3623198947Ee1d17869E",
          "symbol": "PHPm"
        },
        {
          "address": "0x10CCfB235b0E1Ed394bACE4560C3ed016697687e",
          "symbol": "ZARm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x671334256a893fDBc4FfE55F98f156A168bD897a",
          "token0": "0x0352976d940a2C3FBa0C3623198947Ee1d17869E",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x7952984d7278ca3417febf52815c321984ac3147ced2c02bb6a02b0bcab08413"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x68D19b5a48cbbFd11057E97DA9960B09D771E7B6",
          "token0": "0x10CCfB235b0E1Ed394bACE4560C3ed016697687e",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x4206e101b13bf29e40b2bfed4cf167271c41677720f2ee786ac1bf5efac101cb"
        }
      ],
      "costData": {
        "totalCostPercent": 0.5991,
        "hops": [
          {
            "poolAddress": "0x671334256a893fDBc4FfE55F98f156A168bD897a",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x68D19b5a48cbbFd11057E97DA9960B09D771E7B6",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "CHFm-PHPm",
      "tokens": [
        {
          "address": "0x284E9b7B623eAE866914b7FA0eB720C2Bb3C2980",
          "symbol": "CHFm"
        },
        {
          "address": "0x0352976d940a2C3FBa0C3623198947Ee1d17869E",
          "symbol": "PHPm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x671334256a893fDBc4FfE55F98f156A168bD897a",
          "token0": "0x0352976d940a2C3FBa0C3623198947Ee1d17869E",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x7952984d7278ca3417febf52815c321984ac3147ced2c02bb6a02b0bcab08413"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x58F08739eA9764097b9500B6e4A4db64D168b807",
          "token0": "0x284E9b7B623eAE866914b7FA0eB720C2Bb3C2980",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x3ddbc61433314a4b7d3cbb56a001fc4cc0f1d52d64338336d5f2083a580ce4fc"
        }
      ],
      "costData": {
        "totalCostPercent": 0.5991,
        "hops": [
          {
            "poolAddress": "0x671334256a893fDBc4FfE55F98f156A168bD897a",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x58F08739eA9764097b9500B6e4A4db64D168b807",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "JPYm-PHPm",
      "tokens": [
        {
          "address": "0x85Bee67D435A39f7467a8a9DE34a5B73D25Df426",
          "symbol": "JPYm"
        },
        {
          "address": "0x0352976d940a2C3FBa0C3623198947Ee1d17869E",
          "symbol": "PHPm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x671334256a893fDBc4FfE55F98f156A168bD897a",
          "token0": "0x0352976d940a2C3FBa0C3623198947Ee1d17869E",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x7952984d7278ca3417febf52815c321984ac3147ced2c02bb6a02b0bcab08413"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x284c2d99c5A12A65F10eFF7183c33C1217B65A56",
          "token0": "0x85Bee67D435A39f7467a8a9DE34a5B73D25Df426",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x7c3b41fbd140c6fb54ff9f8f7b7b0c954606682d44ed5e56b0080f40faaf652c"
        }
      ],
      "costData": {
        "totalCostPercent": 0.5991,
        "hops": [
          {
            "poolAddress": "0x671334256a893fDBc4FfE55F98f156A168bD897a",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x284c2d99c5A12A65F10eFF7183c33C1217B65A56",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "COPm-PHPm",
      "tokens": [
        {
          "address": "0x5F8d55c3627d2dc0a2B4afa798f877242F382F67",
          "symbol": "COPm"
        },
        {
          "address": "0x0352976d940a2C3FBa0C3623198947Ee1d17869E",
          "symbol": "PHPm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x671334256a893fDBc4FfE55F98f156A168bD897a",
          "token0": "0x0352976d940a2C3FBa0C3623198947Ee1d17869E",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x7952984d7278ca3417febf52815c321984ac3147ced2c02bb6a02b0bcab08413"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0xCBfC8C84168D7F34FabA0018A3A63b998f1ffeCe",
          "token0": "0x5F8d55c3627d2dc0a2B4afa798f877242F382F67",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x1c9378bd0973ff313a599d3effc654ba759f8ccca655ab6d6ce5bd39a212943b"
        }
      ],
      "costData": {
        "totalCostPercent": 0.5991,
        "hops": [
          {
            "poolAddress": "0x671334256a893fDBc4FfE55F98f156A168bD897a",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0xCBfC8C84168D7F34FabA0018A3A63b998f1ffeCe",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "BRLm-PHPm",
      "tokens": [
        {
          "address": "0x2294298942fdc79417DE9E0D740A4957E0e7783a",
          "symbol": "BRLm"
        },
        {
          "address": "0x0352976d940a2C3FBa0C3623198947Ee1d17869E",
          "symbol": "PHPm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x671334256a893fDBc4FfE55F98f156A168bD897a",
          "token0": "0x0352976d940a2C3FBa0C3623198947Ee1d17869E",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x7952984d7278ca3417febf52815c321984ac3147ced2c02bb6a02b0bcab08413"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x49A968C539599385c69c2d528500DA58d933FafA",
          "token0": "0x2294298942fdc79417DE9E0D740A4957E0e7783a",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xd11d52b973ddbb983cc2087aabcafd915fc3140cf9996aacc61db9710d1bde05"
        }
      ],
      "costData": {
        "totalCostPercent": 0.5991,
        "hops": [
          {
            "poolAddress": "0x671334256a893fDBc4FfE55F98f156A168bD897a",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x49A968C539599385c69c2d528500DA58d933FafA",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "CHFm-ZARm",
      "tokens": [
        {
          "address": "0x284E9b7B623eAE866914b7FA0eB720C2Bb3C2980",
          "symbol": "CHFm"
        },
        {
          "address": "0x10CCfB235b0E1Ed394bACE4560C3ed016697687e",
          "symbol": "ZARm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x68D19b5a48cbbFd11057E97DA9960B09D771E7B6",
          "token0": "0x10CCfB235b0E1Ed394bACE4560C3ed016697687e",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x4206e101b13bf29e40b2bfed4cf167271c41677720f2ee786ac1bf5efac101cb"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x58F08739eA9764097b9500B6e4A4db64D168b807",
          "token0": "0x284E9b7B623eAE866914b7FA0eB720C2Bb3C2980",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x3ddbc61433314a4b7d3cbb56a001fc4cc0f1d52d64338336d5f2083a580ce4fc"
        }
      ],
      "costData": {
        "totalCostPercent": 0.5991,
        "hops": [
          {
            "poolAddress": "0x68D19b5a48cbbFd11057E97DA9960B09D771E7B6",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x58F08739eA9764097b9500B6e4A4db64D168b807",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "JPYm-ZARm",
      "tokens": [
        {
          "address": "0x85Bee67D435A39f7467a8a9DE34a5B73D25Df426",
          "symbol": "JPYm"
        },
        {
          "address": "0x10CCfB235b0E1Ed394bACE4560C3ed016697687e",
          "symbol": "ZARm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x68D19b5a48cbbFd11057E97DA9960B09D771E7B6",
          "token0": "0x10CCfB235b0E1Ed394bACE4560C3ed016697687e",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x4206e101b13bf29e40b2bfed4cf167271c41677720f2ee786ac1bf5efac101cb"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x284c2d99c5A12A65F10eFF7183c33C1217B65A56",
          "token0": "0x85Bee67D435A39f7467a8a9DE34a5B73D25Df426",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x7c3b41fbd140c6fb54ff9f8f7b7b0c954606682d44ed5e56b0080f40faaf652c"
        }
      ],
      "costData": {
        "totalCostPercent": 0.5991,
        "hops": [
          {
            "poolAddress": "0x68D19b5a48cbbFd11057E97DA9960B09D771E7B6",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x284c2d99c5A12A65F10eFF7183c33C1217B65A56",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "COPm-ZARm",
      "tokens": [
        {
          "address": "0x5F8d55c3627d2dc0a2B4afa798f877242F382F67",
          "symbol": "COPm"
        },
        {
          "address": "0x10CCfB235b0E1Ed394bACE4560C3ed016697687e",
          "symbol": "ZARm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x68D19b5a48cbbFd11057E97DA9960B09D771E7B6",
          "token0": "0x10CCfB235b0E1Ed394bACE4560C3ed016697687e",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x4206e101b13bf29e40b2bfed4cf167271c41677720f2ee786ac1bf5efac101cb"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0xCBfC8C84168D7F34FabA0018A3A63b998f1ffeCe",
          "token0": "0x5F8d55c3627d2dc0a2B4afa798f877242F382F67",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x1c9378bd0973ff313a599d3effc654ba759f8ccca655ab6d6ce5bd39a212943b"
        }
      ],
      "costData": {
        "totalCostPercent": 0.5991,
        "hops": [
          {
            "poolAddress": "0x68D19b5a48cbbFd11057E97DA9960B09D771E7B6",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0xCBfC8C84168D7F34FabA0018A3A63b998f1ffeCe",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "BRLm-ZARm",
      "tokens": [
        {
          "address": "0x2294298942fdc79417DE9E0D740A4957E0e7783a",
          "symbol": "BRLm"
        },
        {
          "address": "0x10CCfB235b0E1Ed394bACE4560C3ed016697687e",
          "symbol": "ZARm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x68D19b5a48cbbFd11057E97DA9960B09D771E7B6",
          "token0": "0x10CCfB235b0E1Ed394bACE4560C3ed016697687e",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x4206e101b13bf29e40b2bfed4cf167271c41677720f2ee786ac1bf5efac101cb"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x49A968C539599385c69c2d528500DA58d933FafA",
          "token0": "0x2294298942fdc79417DE9E0D740A4957E0e7783a",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xd11d52b973ddbb983cc2087aabcafd915fc3140cf9996aacc61db9710d1bde05"
        }
      ],
      "costData": {
        "totalCostPercent": 0.5991,
        "hops": [
          {
            "poolAddress": "0x68D19b5a48cbbFd11057E97DA9960B09D771E7B6",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x49A968C539599385c69c2d528500DA58d933FafA",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "CHFm-JPYm",
      "tokens": [
        {
          "address": "0x284E9b7B623eAE866914b7FA0eB720C2Bb3C2980",
          "symbol": "CHFm"
        },
        {
          "address": "0x85Bee67D435A39f7467a8a9DE34a5B73D25Df426",
          "symbol": "JPYm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x58F08739eA9764097b9500B6e4A4db64D168b807",
          "token0": "0x284E9b7B623eAE866914b7FA0eB720C2Bb3C2980",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x3ddbc61433314a4b7d3cbb56a001fc4cc0f1d52d64338336d5f2083a580ce4fc"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x284c2d99c5A12A65F10eFF7183c33C1217B65A56",
          "token0": "0x85Bee67D435A39f7467a8a9DE34a5B73D25Df426",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x7c3b41fbd140c6fb54ff9f8f7b7b0c954606682d44ed5e56b0080f40faaf652c"
        }
      ],
      "costData": {
        "totalCostPercent": 0.5991,
        "hops": [
          {
            "poolAddress": "0x58F08739eA9764097b9500B6e4A4db64D168b807",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x284c2d99c5A12A65F10eFF7183c33C1217B65A56",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "CHFm-COPm",
      "tokens": [
        {
          "address": "0x284E9b7B623eAE866914b7FA0eB720C2Bb3C2980",
          "symbol": "CHFm"
        },
        {
          "address": "0x5F8d55c3627d2dc0a2B4afa798f877242F382F67",
          "symbol": "COPm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x58F08739eA9764097b9500B6e4A4db64D168b807",
          "token0": "0x284E9b7B623eAE866914b7FA0eB720C2Bb3C2980",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x3ddbc61433314a4b7d3cbb56a001fc4cc0f1d52d64338336d5f2083a580ce4fc"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0xCBfC8C84168D7F34FabA0018A3A63b998f1ffeCe",
          "token0": "0x5F8d55c3627d2dc0a2B4afa798f877242F382F67",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x1c9378bd0973ff313a599d3effc654ba759f8ccca655ab6d6ce5bd39a212943b"
        }
      ],
      "costData": {
        "totalCostPercent": 0.5991,
        "hops": [
          {
            "poolAddress": "0x58F08739eA9764097b9500B6e4A4db64D168b807",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0xCBfC8C84168D7F34FabA0018A3A63b998f1ffeCe",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "BRLm-CHFm",
      "tokens": [
        {
          "address": "0x2294298942fdc79417DE9E0D740A4957E0e7783a",
          "symbol": "BRLm"
        },
        {
          "address": "0x284E9b7B623eAE866914b7FA0eB720C2Bb3C2980",
          "symbol": "CHFm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x58F08739eA9764097b9500B6e4A4db64D168b807",
          "token0": "0x284E9b7B623eAE866914b7FA0eB720C2Bb3C2980",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x3ddbc61433314a4b7d3cbb56a001fc4cc0f1d52d64338336d5f2083a580ce4fc"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x49A968C539599385c69c2d528500DA58d933FafA",
          "token0": "0x2294298942fdc79417DE9E0D740A4957E0e7783a",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xd11d52b973ddbb983cc2087aabcafd915fc3140cf9996aacc61db9710d1bde05"
        }
      ],
      "costData": {
        "totalCostPercent": 0.5991,
        "hops": [
          {
            "poolAddress": "0x58F08739eA9764097b9500B6e4A4db64D168b807",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x49A968C539599385c69c2d528500DA58d933FafA",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "COPm-JPYm",
      "tokens": [
        {
          "address": "0x5F8d55c3627d2dc0a2B4afa798f877242F382F67",
          "symbol": "COPm"
        },
        {
          "address": "0x85Bee67D435A39f7467a8a9DE34a5B73D25Df426",
          "symbol": "JPYm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x284c2d99c5A12A65F10eFF7183c33C1217B65A56",
          "token0": "0x85Bee67D435A39f7467a8a9DE34a5B73D25Df426",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x7c3b41fbd140c6fb54ff9f8f7b7b0c954606682d44ed5e56b0080f40faaf652c"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0xCBfC8C84168D7F34FabA0018A3A63b998f1ffeCe",
          "token0": "0x5F8d55c3627d2dc0a2B4afa798f877242F382F67",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x1c9378bd0973ff313a599d3effc654ba759f8ccca655ab6d6ce5bd39a212943b"
        }
      ],
      "costData": {
        "totalCostPercent": 0.5991,
        "hops": [
          {
            "poolAddress": "0x284c2d99c5A12A65F10eFF7183c33C1217B65A56",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0xCBfC8C84168D7F34FabA0018A3A63b998f1ffeCe",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "BRLm-JPYm",
      "tokens": [
        {
          "address": "0x2294298942fdc79417DE9E0D740A4957E0e7783a",
          "symbol": "BRLm"
        },
        {
          "address": "0x85Bee67D435A39f7467a8a9DE34a5B73D25Df426",
          "symbol": "JPYm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x284c2d99c5A12A65F10eFF7183c33C1217B65A56",
          "token0": "0x85Bee67D435A39f7467a8a9DE34a5B73D25Df426",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x7c3b41fbd140c6fb54ff9f8f7b7b0c954606682d44ed5e56b0080f40faaf652c"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x49A968C539599385c69c2d528500DA58d933FafA",
          "token0": "0x2294298942fdc79417DE9E0D740A4957E0e7783a",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xd11d52b973ddbb983cc2087aabcafd915fc3140cf9996aacc61db9710d1bde05"
        }
      ],
      "costData": {
        "totalCostPercent": 0.5991,
        "hops": [
          {
            "poolAddress": "0x284c2d99c5A12A65F10eFF7183c33C1217B65A56",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x49A968C539599385c69c2d528500DA58d933FafA",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "BRLm-COPm",
      "tokens": [
        {
          "address": "0x2294298942fdc79417DE9E0D740A4957E0e7783a",
          "symbol": "BRLm"
        },
        {
          "address": "0x5F8d55c3627d2dc0a2B4afa798f877242F382F67",
          "symbol": "COPm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0xCBfC8C84168D7F34FabA0018A3A63b998f1ffeCe",
          "token0": "0x5F8d55c3627d2dc0a2B4afa798f877242F382F67",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x1c9378bd0973ff313a599d3effc654ba759f8ccca655ab6d6ce5bd39a212943b"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x49A968C539599385c69c2d528500DA58d933FafA",
          "token0": "0x2294298942fdc79417DE9E0D740A4957E0e7783a",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xd11d52b973ddbb983cc2087aabcafd915fc3140cf9996aacc61db9710d1bde05"
        }
      ],
      "costData": {
        "totalCostPercent": 0.5991,
        "hops": [
          {
            "poolAddress": "0xCBfC8C84168D7F34FabA0018A3A63b998f1ffeCe",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x49A968C539599385c69c2d528500DA58d933FafA",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "GHSm-USDm",
      "tokens": [
        {
          "address": "0x5e94B8C872bD47BC4255E60ECBF44D5E66e7401C",
          "symbol": "GHSm"
        },
        {
          "address": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "symbol": "USDm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x917eE035bF0A964ACC75539f919A5B4F16336373",
          "token0": "0x5e94B8C872bD47BC4255E60ECBF44D5E66e7401C",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x3562f9d29eba092b857480a82b03375839c752346b9ebe93a57ab82410328187"
        }
      ],
      "costData": {
        "totalCostPercent": 1,
        "hops": [
          {
            "poolAddress": "0x917eE035bF0A964ACC75539f919A5B4F16336373",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "NGNm-USDm",
      "tokens": [
        {
          "address": "0x3d5ae86F34E2a82771496D140daFAEf3789dF888",
          "symbol": "NGNm"
        },
        {
          "address": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "symbol": "USDm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x6B66271811615F4b6daDb8620ED71a1E90f41Deb",
          "token0": "0x3d5ae86F34E2a82771496D140daFAEf3789dF888",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x67a5122dab72931be57196e0abba81690461f327bc60fb98ca7eef0ac58906cc"
        }
      ],
      "costData": {
        "totalCostPercent": 1,
        "hops": [
          {
            "poolAddress": "0x6B66271811615F4b6daDb8620ED71a1E90f41Deb",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "KESm-USDm",
      "tokens": [
        {
          "address": "0xC7e4635651E3e3Af82b61d3E23c159438daE3BbF",
          "symbol": "KESm"
        },
        {
          "address": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "symbol": "USDm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x22118009665B1d6810d4560A098D3E67bbcb934f",
          "token0": "0xC7e4635651E3e3Af82b61d3E23c159438daE3BbF",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x89de88b8eb790de26f4649f543cb6893d93635c728ac857f0926e842fb0d298b"
        }
      ],
      "costData": {
        "totalCostPercent": 1,
        "hops": [
          {
            "poolAddress": "0x22118009665B1d6810d4560A098D3E67bbcb934f",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "GHSm-axlUSDC",
      "tokens": [
        {
          "address": "0x5e94B8C872bD47BC4255E60ECBF44D5E66e7401C",
          "symbol": "GHSm"
        },
        {
          "address": "0x6285De9DA7C1d329C0451628638908915002d9d1",
          "symbol": "axlUSDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0xF1B77Ffc1F71b21b6c69876CEDAf82340803dE75",
          "token0": "0x6285De9DA7C1d329C0451628638908915002d9d1",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x917eE035bF0A964ACC75539f919A5B4F16336373",
          "token0": "0x5e94B8C872bD47BC4255E60ECBF44D5E66e7401C",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x3562f9d29eba092b857480a82b03375839c752346b9ebe93a57ab82410328187"
        }
      ],
      "costData": {
        "totalCostPercent": 1.0495,
        "hops": [
          {
            "poolAddress": "0xF1B77Ffc1F71b21b6c69876CEDAf82340803dE75",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x917eE035bF0A964ACC75539f919A5B4F16336373",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "NGNm-axlUSDC",
      "tokens": [
        {
          "address": "0x3d5ae86F34E2a82771496D140daFAEf3789dF888",
          "symbol": "NGNm"
        },
        {
          "address": "0x6285De9DA7C1d329C0451628638908915002d9d1",
          "symbol": "axlUSDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0xF1B77Ffc1F71b21b6c69876CEDAf82340803dE75",
          "token0": "0x6285De9DA7C1d329C0451628638908915002d9d1",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x6B66271811615F4b6daDb8620ED71a1E90f41Deb",
          "token0": "0x3d5ae86F34E2a82771496D140daFAEf3789dF888",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x67a5122dab72931be57196e0abba81690461f327bc60fb98ca7eef0ac58906cc"
        }
      ],
      "costData": {
        "totalCostPercent": 1.0495,
        "hops": [
          {
            "poolAddress": "0xF1B77Ffc1F71b21b6c69876CEDAf82340803dE75",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x6B66271811615F4b6daDb8620ED71a1E90f41Deb",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "KESm-axlUSDC",
      "tokens": [
        {
          "address": "0xC7e4635651E3e3Af82b61d3E23c159438daE3BbF",
          "symbol": "KESm"
        },
        {
          "address": "0x6285De9DA7C1d329C0451628638908915002d9d1",
          "symbol": "axlUSDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0xF1B77Ffc1F71b21b6c69876CEDAf82340803dE75",
          "token0": "0x6285De9DA7C1d329C0451628638908915002d9d1",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x22118009665B1d6810d4560A098D3E67bbcb934f",
          "token0": "0xC7e4635651E3e3Af82b61d3E23c159438daE3BbF",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x89de88b8eb790de26f4649f543cb6893d93635c728ac857f0926e842fb0d298b"
        }
      ],
      "costData": {
        "totalCostPercent": 1.0495,
        "hops": [
          {
            "poolAddress": "0xF1B77Ffc1F71b21b6c69876CEDAf82340803dE75",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x22118009665B1d6810d4560A098D3E67bbcb934f",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "GHSm-USDC",
      "tokens": [
        {
          "address": "0x5e94B8C872bD47BC4255E60ECBF44D5E66e7401C",
          "symbol": "GHSm"
        },
        {
          "address": "0x01C5C0122039549AD1493B8220cABEdD739BC44E",
          "symbol": "USDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x7109E0A9B4623e90755b7e5c4e10F089E5Bf8bDb",
          "token0": "0x01C5C0122039549AD1493B8220cABEdD739BC44E",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x917eE035bF0A964ACC75539f919A5B4F16336373",
          "token0": "0x5e94B8C872bD47BC4255E60ECBF44D5E66e7401C",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x3562f9d29eba092b857480a82b03375839c752346b9ebe93a57ab82410328187"
        }
      ],
      "costData": {
        "totalCostPercent": 1.0495,
        "hops": [
          {
            "poolAddress": "0x7109E0A9B4623e90755b7e5c4e10F089E5Bf8bDb",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x917eE035bF0A964ACC75539f919A5B4F16336373",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "NGNm-USDC",
      "tokens": [
        {
          "address": "0x3d5ae86F34E2a82771496D140daFAEf3789dF888",
          "symbol": "NGNm"
        },
        {
          "address": "0x01C5C0122039549AD1493B8220cABEdD739BC44E",
          "symbol": "USDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x7109E0A9B4623e90755b7e5c4e10F089E5Bf8bDb",
          "token0": "0x01C5C0122039549AD1493B8220cABEdD739BC44E",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x6B66271811615F4b6daDb8620ED71a1E90f41Deb",
          "token0": "0x3d5ae86F34E2a82771496D140daFAEf3789dF888",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x67a5122dab72931be57196e0abba81690461f327bc60fb98ca7eef0ac58906cc"
        }
      ],
      "costData": {
        "totalCostPercent": 1.0495,
        "hops": [
          {
            "poolAddress": "0x7109E0A9B4623e90755b7e5c4e10F089E5Bf8bDb",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x6B66271811615F4b6daDb8620ED71a1E90f41Deb",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "KESm-USDC",
      "tokens": [
        {
          "address": "0xC7e4635651E3e3Af82b61d3E23c159438daE3BbF",
          "symbol": "KESm"
        },
        {
          "address": "0x01C5C0122039549AD1493B8220cABEdD739BC44E",
          "symbol": "USDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x7109E0A9B4623e90755b7e5c4e10F089E5Bf8bDb",
          "token0": "0x01C5C0122039549AD1493B8220cABEdD739BC44E",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x22118009665B1d6810d4560A098D3E67bbcb934f",
          "token0": "0xC7e4635651E3e3Af82b61d3E23c159438daE3BbF",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x89de88b8eb790de26f4649f543cb6893d93635c728ac857f0926e842fb0d298b"
        }
      ],
      "costData": {
        "totalCostPercent": 1.0495,
        "hops": [
          {
            "poolAddress": "0x7109E0A9B4623e90755b7e5c4e10F089E5Bf8bDb",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x22118009665B1d6810d4560A098D3E67bbcb934f",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "GHSm-USD₮",
      "tokens": [
        {
          "address": "0x5e94B8C872bD47BC4255E60ECBF44D5E66e7401C",
          "symbol": "GHSm"
        },
        {
          "address": "0xd077A400968890Eacc75cdc901F0356c943e4fDb",
          "symbol": "USD₮"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0xd1a70F43B2A95384DD2a7D7b259293328B3974f8",
          "token0": "0xd077A400968890Eacc75cdc901F0356c943e4fDb",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x917eE035bF0A964ACC75539f919A5B4F16336373",
          "token0": "0x5e94B8C872bD47BC4255E60ECBF44D5E66e7401C",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x3562f9d29eba092b857480a82b03375839c752346b9ebe93a57ab82410328187"
        }
      ],
      "costData": {
        "totalCostPercent": 1.0495,
        "hops": [
          {
            "poolAddress": "0xd1a70F43B2A95384DD2a7D7b259293328B3974f8",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x917eE035bF0A964ACC75539f919A5B4F16336373",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "NGNm-USD₮",
      "tokens": [
        {
          "address": "0x3d5ae86F34E2a82771496D140daFAEf3789dF888",
          "symbol": "NGNm"
        },
        {
          "address": "0xd077A400968890Eacc75cdc901F0356c943e4fDb",
          "symbol": "USD₮"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0xd1a70F43B2A95384DD2a7D7b259293328B3974f8",
          "token0": "0xd077A400968890Eacc75cdc901F0356c943e4fDb",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x6B66271811615F4b6daDb8620ED71a1E90f41Deb",
          "token0": "0x3d5ae86F34E2a82771496D140daFAEf3789dF888",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x67a5122dab72931be57196e0abba81690461f327bc60fb98ca7eef0ac58906cc"
        }
      ],
      "costData": {
        "totalCostPercent": 1.0495,
        "hops": [
          {
            "poolAddress": "0xd1a70F43B2A95384DD2a7D7b259293328B3974f8",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x6B66271811615F4b6daDb8620ED71a1E90f41Deb",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "KESm-USD₮",
      "tokens": [
        {
          "address": "0xC7e4635651E3e3Af82b61d3E23c159438daE3BbF",
          "symbol": "KESm"
        },
        {
          "address": "0xd077A400968890Eacc75cdc901F0356c943e4fDb",
          "symbol": "USD₮"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0xd1a70F43B2A95384DD2a7D7b259293328B3974f8",
          "token0": "0xd077A400968890Eacc75cdc901F0356c943e4fDb",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x22118009665B1d6810d4560A098D3E67bbcb934f",
          "token0": "0xC7e4635651E3e3Af82b61d3E23c159438daE3BbF",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x89de88b8eb790de26f4649f543cb6893d93635c728ac857f0926e842fb0d298b"
        }
      ],
      "costData": {
        "totalCostPercent": 1.0495,
        "hops": [
          {
            "poolAddress": "0xd1a70F43B2A95384DD2a7D7b259293328B3974f8",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x22118009665B1d6810d4560A098D3E67bbcb934f",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "AUDm-GHSm",
      "tokens": [
        {
          "address": "0x5873Faeb42F3563dcD77F0fbbdA818E6d6DA3139",
          "symbol": "AUDm"
        },
        {
          "address": "0x5e94B8C872bD47BC4255E60ECBF44D5E66e7401C",
          "symbol": "GHSm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x8103Fb2db87AC96cc62FAA399B98e1173720aB19",
          "token0": "0x5873Faeb42F3563dcD77F0fbbdA818E6d6DA3139",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xd580d237231109e6a96d67d82450611c610a805a26660c90281bdc0cd04a95c7"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x917eE035bF0A964ACC75539f919A5B4F16336373",
          "token0": "0x5e94B8C872bD47BC4255E60ECBF44D5E66e7401C",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x3562f9d29eba092b857480a82b03375839c752346b9ebe93a57ab82410328187"
        }
      ],
      "costData": {
        "totalCostPercent": 1.1485,
        "hops": [
          {
            "poolAddress": "0x8103Fb2db87AC96cc62FAA399B98e1173720aB19",
            "costPercent": 0.15
          },
          {
            "poolAddress": "0x917eE035bF0A964ACC75539f919A5B4F16336373",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "AUDm-NGNm",
      "tokens": [
        {
          "address": "0x5873Faeb42F3563dcD77F0fbbdA818E6d6DA3139",
          "symbol": "AUDm"
        },
        {
          "address": "0x3d5ae86F34E2a82771496D140daFAEf3789dF888",
          "symbol": "NGNm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x8103Fb2db87AC96cc62FAA399B98e1173720aB19",
          "token0": "0x5873Faeb42F3563dcD77F0fbbdA818E6d6DA3139",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xd580d237231109e6a96d67d82450611c610a805a26660c90281bdc0cd04a95c7"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x6B66271811615F4b6daDb8620ED71a1E90f41Deb",
          "token0": "0x3d5ae86F34E2a82771496D140daFAEf3789dF888",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x67a5122dab72931be57196e0abba81690461f327bc60fb98ca7eef0ac58906cc"
        }
      ],
      "costData": {
        "totalCostPercent": 1.1485,
        "hops": [
          {
            "poolAddress": "0x8103Fb2db87AC96cc62FAA399B98e1173720aB19",
            "costPercent": 0.15
          },
          {
            "poolAddress": "0x6B66271811615F4b6daDb8620ED71a1E90f41Deb",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "AUDm-KESm",
      "tokens": [
        {
          "address": "0x5873Faeb42F3563dcD77F0fbbdA818E6d6DA3139",
          "symbol": "AUDm"
        },
        {
          "address": "0xC7e4635651E3e3Af82b61d3E23c159438daE3BbF",
          "symbol": "KESm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x8103Fb2db87AC96cc62FAA399B98e1173720aB19",
          "token0": "0x5873Faeb42F3563dcD77F0fbbdA818E6d6DA3139",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xd580d237231109e6a96d67d82450611c610a805a26660c90281bdc0cd04a95c7"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x22118009665B1d6810d4560A098D3E67bbcb934f",
          "token0": "0xC7e4635651E3e3Af82b61d3E23c159438daE3BbF",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x89de88b8eb790de26f4649f543cb6893d93635c728ac857f0926e842fb0d298b"
        }
      ],
      "costData": {
        "totalCostPercent": 1.1485,
        "hops": [
          {
            "poolAddress": "0x8103Fb2db87AC96cc62FAA399B98e1173720aB19",
            "costPercent": 0.15
          },
          {
            "poolAddress": "0x22118009665B1d6810d4560A098D3E67bbcb934f",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "CADm-GHSm",
      "tokens": [
        {
          "address": "0xF151c9a13b78C84f93f50B8b3bC689fedc134F60",
          "symbol": "CADm"
        },
        {
          "address": "0x5e94B8C872bD47BC4255E60ECBF44D5E66e7401C",
          "symbol": "GHSm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x62722497dc8992337117ee79A02015dcEa43b2C2",
          "token0": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "token1": "0xF151c9a13b78C84f93f50B8b3bC689fedc134F60",
          "poolType": "Virtual",
          "exchangeId": "0x517ccc3bcab9f35e2e24143a0c1809068efc649f740846cfb6a1c5703735c1ee"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x917eE035bF0A964ACC75539f919A5B4F16336373",
          "token0": "0x5e94B8C872bD47BC4255E60ECBF44D5E66e7401C",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x3562f9d29eba092b857480a82b03375839c752346b9ebe93a57ab82410328187"
        }
      ],
      "costData": {
        "totalCostPercent": 1.1485,
        "hops": [
          {
            "poolAddress": "0x62722497dc8992337117ee79A02015dcEa43b2C2",
            "costPercent": 0.15
          },
          {
            "poolAddress": "0x917eE035bF0A964ACC75539f919A5B4F16336373",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "CADm-NGNm",
      "tokens": [
        {
          "address": "0xF151c9a13b78C84f93f50B8b3bC689fedc134F60",
          "symbol": "CADm"
        },
        {
          "address": "0x3d5ae86F34E2a82771496D140daFAEf3789dF888",
          "symbol": "NGNm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x62722497dc8992337117ee79A02015dcEa43b2C2",
          "token0": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "token1": "0xF151c9a13b78C84f93f50B8b3bC689fedc134F60",
          "poolType": "Virtual",
          "exchangeId": "0x517ccc3bcab9f35e2e24143a0c1809068efc649f740846cfb6a1c5703735c1ee"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x6B66271811615F4b6daDb8620ED71a1E90f41Deb",
          "token0": "0x3d5ae86F34E2a82771496D140daFAEf3789dF888",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x67a5122dab72931be57196e0abba81690461f327bc60fb98ca7eef0ac58906cc"
        }
      ],
      "costData": {
        "totalCostPercent": 1.1485,
        "hops": [
          {
            "poolAddress": "0x62722497dc8992337117ee79A02015dcEa43b2C2",
            "costPercent": 0.15
          },
          {
            "poolAddress": "0x6B66271811615F4b6daDb8620ED71a1E90f41Deb",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "CADm-KESm",
      "tokens": [
        {
          "address": "0xF151c9a13b78C84f93f50B8b3bC689fedc134F60",
          "symbol": "CADm"
        },
        {
          "address": "0xC7e4635651E3e3Af82b61d3E23c159438daE3BbF",
          "symbol": "KESm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x62722497dc8992337117ee79A02015dcEa43b2C2",
          "token0": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "token1": "0xF151c9a13b78C84f93f50B8b3bC689fedc134F60",
          "poolType": "Virtual",
          "exchangeId": "0x517ccc3bcab9f35e2e24143a0c1809068efc649f740846cfb6a1c5703735c1ee"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x22118009665B1d6810d4560A098D3E67bbcb934f",
          "token0": "0xC7e4635651E3e3Af82b61d3E23c159438daE3BbF",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x89de88b8eb790de26f4649f543cb6893d93635c728ac857f0926e842fb0d298b"
        }
      ],
      "costData": {
        "totalCostPercent": 1.1485,
        "hops": [
          {
            "poolAddress": "0x62722497dc8992337117ee79A02015dcEa43b2C2",
            "costPercent": 0.15
          },
          {
            "poolAddress": "0x22118009665B1d6810d4560A098D3E67bbcb934f",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "GBPm-GHSm",
      "tokens": [
        {
          "address": "0x85F5181Abdbf0e1814Fc4358582Ae07b8eBA3aF3",
          "symbol": "GBPm"
        },
        {
          "address": "0x5e94B8C872bD47BC4255E60ECBF44D5E66e7401C",
          "symbol": "GHSm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x550D9EcB4C373510b8A41f5fB7D98E9E1c51A07e",
          "token0": "0x85F5181Abdbf0e1814Fc4358582Ae07b8eBA3aF3",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x917eE035bF0A964ACC75539f919A5B4F16336373",
          "token0": "0x5e94B8C872bD47BC4255E60ECBF44D5E66e7401C",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x3562f9d29eba092b857480a82b03375839c752346b9ebe93a57ab82410328187"
        }
      ],
      "costData": {
        "totalCostPercent": 1.297,
        "hops": [
          {
            "poolAddress": "0x550D9EcB4C373510b8A41f5fB7D98E9E1c51A07e",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x917eE035bF0A964ACC75539f919A5B4F16336373",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "GBPm-NGNm",
      "tokens": [
        {
          "address": "0x85F5181Abdbf0e1814Fc4358582Ae07b8eBA3aF3",
          "symbol": "GBPm"
        },
        {
          "address": "0x3d5ae86F34E2a82771496D140daFAEf3789dF888",
          "symbol": "NGNm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x550D9EcB4C373510b8A41f5fB7D98E9E1c51A07e",
          "token0": "0x85F5181Abdbf0e1814Fc4358582Ae07b8eBA3aF3",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x6B66271811615F4b6daDb8620ED71a1E90f41Deb",
          "token0": "0x3d5ae86F34E2a82771496D140daFAEf3789dF888",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x67a5122dab72931be57196e0abba81690461f327bc60fb98ca7eef0ac58906cc"
        }
      ],
      "costData": {
        "totalCostPercent": 1.297,
        "hops": [
          {
            "poolAddress": "0x550D9EcB4C373510b8A41f5fB7D98E9E1c51A07e",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x6B66271811615F4b6daDb8620ED71a1E90f41Deb",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "GBPm-KESm",
      "tokens": [
        {
          "address": "0x85F5181Abdbf0e1814Fc4358582Ae07b8eBA3aF3",
          "symbol": "GBPm"
        },
        {
          "address": "0xC7e4635651E3e3Af82b61d3E23c159438daE3BbF",
          "symbol": "KESm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x550D9EcB4C373510b8A41f5fB7D98E9E1c51A07e",
          "token0": "0x85F5181Abdbf0e1814Fc4358582Ae07b8eBA3aF3",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x22118009665B1d6810d4560A098D3E67bbcb934f",
          "token0": "0xC7e4635651E3e3Af82b61d3E23c159438daE3BbF",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x89de88b8eb790de26f4649f543cb6893d93635c728ac857f0926e842fb0d298b"
        }
      ],
      "costData": {
        "totalCostPercent": 1.297,
        "hops": [
          {
            "poolAddress": "0x550D9EcB4C373510b8A41f5fB7D98E9E1c51A07e",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x22118009665B1d6810d4560A098D3E67bbcb934f",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "GHSm-PHPm",
      "tokens": [
        {
          "address": "0x5e94B8C872bD47BC4255E60ECBF44D5E66e7401C",
          "symbol": "GHSm"
        },
        {
          "address": "0x0352976d940a2C3FBa0C3623198947Ee1d17869E",
          "symbol": "PHPm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x671334256a893fDBc4FfE55F98f156A168bD897a",
          "token0": "0x0352976d940a2C3FBa0C3623198947Ee1d17869E",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x7952984d7278ca3417febf52815c321984ac3147ced2c02bb6a02b0bcab08413"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x917eE035bF0A964ACC75539f919A5B4F16336373",
          "token0": "0x5e94B8C872bD47BC4255E60ECBF44D5E66e7401C",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x3562f9d29eba092b857480a82b03375839c752346b9ebe93a57ab82410328187"
        }
      ],
      "costData": {
        "totalCostPercent": 1.297,
        "hops": [
          {
            "poolAddress": "0x671334256a893fDBc4FfE55F98f156A168bD897a",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x917eE035bF0A964ACC75539f919A5B4F16336373",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "NGNm-PHPm",
      "tokens": [
        {
          "address": "0x3d5ae86F34E2a82771496D140daFAEf3789dF888",
          "symbol": "NGNm"
        },
        {
          "address": "0x0352976d940a2C3FBa0C3623198947Ee1d17869E",
          "symbol": "PHPm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x671334256a893fDBc4FfE55F98f156A168bD897a",
          "token0": "0x0352976d940a2C3FBa0C3623198947Ee1d17869E",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x7952984d7278ca3417febf52815c321984ac3147ced2c02bb6a02b0bcab08413"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x6B66271811615F4b6daDb8620ED71a1E90f41Deb",
          "token0": "0x3d5ae86F34E2a82771496D140daFAEf3789dF888",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x67a5122dab72931be57196e0abba81690461f327bc60fb98ca7eef0ac58906cc"
        }
      ],
      "costData": {
        "totalCostPercent": 1.297,
        "hops": [
          {
            "poolAddress": "0x671334256a893fDBc4FfE55F98f156A168bD897a",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x6B66271811615F4b6daDb8620ED71a1E90f41Deb",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "KESm-PHPm",
      "tokens": [
        {
          "address": "0xC7e4635651E3e3Af82b61d3E23c159438daE3BbF",
          "symbol": "KESm"
        },
        {
          "address": "0x0352976d940a2C3FBa0C3623198947Ee1d17869E",
          "symbol": "PHPm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x671334256a893fDBc4FfE55F98f156A168bD897a",
          "token0": "0x0352976d940a2C3FBa0C3623198947Ee1d17869E",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x7952984d7278ca3417febf52815c321984ac3147ced2c02bb6a02b0bcab08413"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x22118009665B1d6810d4560A098D3E67bbcb934f",
          "token0": "0xC7e4635651E3e3Af82b61d3E23c159438daE3BbF",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x89de88b8eb790de26f4649f543cb6893d93635c728ac857f0926e842fb0d298b"
        }
      ],
      "costData": {
        "totalCostPercent": 1.297,
        "hops": [
          {
            "poolAddress": "0x671334256a893fDBc4FfE55F98f156A168bD897a",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x22118009665B1d6810d4560A098D3E67bbcb934f",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "GHSm-ZARm",
      "tokens": [
        {
          "address": "0x5e94B8C872bD47BC4255E60ECBF44D5E66e7401C",
          "symbol": "GHSm"
        },
        {
          "address": "0x10CCfB235b0E1Ed394bACE4560C3ed016697687e",
          "symbol": "ZARm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x68D19b5a48cbbFd11057E97DA9960B09D771E7B6",
          "token0": "0x10CCfB235b0E1Ed394bACE4560C3ed016697687e",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x4206e101b13bf29e40b2bfed4cf167271c41677720f2ee786ac1bf5efac101cb"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x917eE035bF0A964ACC75539f919A5B4F16336373",
          "token0": "0x5e94B8C872bD47BC4255E60ECBF44D5E66e7401C",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x3562f9d29eba092b857480a82b03375839c752346b9ebe93a57ab82410328187"
        }
      ],
      "costData": {
        "totalCostPercent": 1.297,
        "hops": [
          {
            "poolAddress": "0x68D19b5a48cbbFd11057E97DA9960B09D771E7B6",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x917eE035bF0A964ACC75539f919A5B4F16336373",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "NGNm-ZARm",
      "tokens": [
        {
          "address": "0x3d5ae86F34E2a82771496D140daFAEf3789dF888",
          "symbol": "NGNm"
        },
        {
          "address": "0x10CCfB235b0E1Ed394bACE4560C3ed016697687e",
          "symbol": "ZARm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x68D19b5a48cbbFd11057E97DA9960B09D771E7B6",
          "token0": "0x10CCfB235b0E1Ed394bACE4560C3ed016697687e",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x4206e101b13bf29e40b2bfed4cf167271c41677720f2ee786ac1bf5efac101cb"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x6B66271811615F4b6daDb8620ED71a1E90f41Deb",
          "token0": "0x3d5ae86F34E2a82771496D140daFAEf3789dF888",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x67a5122dab72931be57196e0abba81690461f327bc60fb98ca7eef0ac58906cc"
        }
      ],
      "costData": {
        "totalCostPercent": 1.297,
        "hops": [
          {
            "poolAddress": "0x68D19b5a48cbbFd11057E97DA9960B09D771E7B6",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x6B66271811615F4b6daDb8620ED71a1E90f41Deb",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "KESm-ZARm",
      "tokens": [
        {
          "address": "0xC7e4635651E3e3Af82b61d3E23c159438daE3BbF",
          "symbol": "KESm"
        },
        {
          "address": "0x10CCfB235b0E1Ed394bACE4560C3ed016697687e",
          "symbol": "ZARm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x68D19b5a48cbbFd11057E97DA9960B09D771E7B6",
          "token0": "0x10CCfB235b0E1Ed394bACE4560C3ed016697687e",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x4206e101b13bf29e40b2bfed4cf167271c41677720f2ee786ac1bf5efac101cb"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x22118009665B1d6810d4560A098D3E67bbcb934f",
          "token0": "0xC7e4635651E3e3Af82b61d3E23c159438daE3BbF",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x89de88b8eb790de26f4649f543cb6893d93635c728ac857f0926e842fb0d298b"
        }
      ],
      "costData": {
        "totalCostPercent": 1.297,
        "hops": [
          {
            "poolAddress": "0x68D19b5a48cbbFd11057E97DA9960B09D771E7B6",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x22118009665B1d6810d4560A098D3E67bbcb934f",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "CHFm-GHSm",
      "tokens": [
        {
          "address": "0x284E9b7B623eAE866914b7FA0eB720C2Bb3C2980",
          "symbol": "CHFm"
        },
        {
          "address": "0x5e94B8C872bD47BC4255E60ECBF44D5E66e7401C",
          "symbol": "GHSm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x58F08739eA9764097b9500B6e4A4db64D168b807",
          "token0": "0x284E9b7B623eAE866914b7FA0eB720C2Bb3C2980",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x3ddbc61433314a4b7d3cbb56a001fc4cc0f1d52d64338336d5f2083a580ce4fc"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x917eE035bF0A964ACC75539f919A5B4F16336373",
          "token0": "0x5e94B8C872bD47BC4255E60ECBF44D5E66e7401C",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x3562f9d29eba092b857480a82b03375839c752346b9ebe93a57ab82410328187"
        }
      ],
      "costData": {
        "totalCostPercent": 1.297,
        "hops": [
          {
            "poolAddress": "0x58F08739eA9764097b9500B6e4A4db64D168b807",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x917eE035bF0A964ACC75539f919A5B4F16336373",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "CHFm-NGNm",
      "tokens": [
        {
          "address": "0x284E9b7B623eAE866914b7FA0eB720C2Bb3C2980",
          "symbol": "CHFm"
        },
        {
          "address": "0x3d5ae86F34E2a82771496D140daFAEf3789dF888",
          "symbol": "NGNm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x58F08739eA9764097b9500B6e4A4db64D168b807",
          "token0": "0x284E9b7B623eAE866914b7FA0eB720C2Bb3C2980",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x3ddbc61433314a4b7d3cbb56a001fc4cc0f1d52d64338336d5f2083a580ce4fc"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x6B66271811615F4b6daDb8620ED71a1E90f41Deb",
          "token0": "0x3d5ae86F34E2a82771496D140daFAEf3789dF888",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x67a5122dab72931be57196e0abba81690461f327bc60fb98ca7eef0ac58906cc"
        }
      ],
      "costData": {
        "totalCostPercent": 1.297,
        "hops": [
          {
            "poolAddress": "0x58F08739eA9764097b9500B6e4A4db64D168b807",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x6B66271811615F4b6daDb8620ED71a1E90f41Deb",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "CHFm-KESm",
      "tokens": [
        {
          "address": "0x284E9b7B623eAE866914b7FA0eB720C2Bb3C2980",
          "symbol": "CHFm"
        },
        {
          "address": "0xC7e4635651E3e3Af82b61d3E23c159438daE3BbF",
          "symbol": "KESm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x58F08739eA9764097b9500B6e4A4db64D168b807",
          "token0": "0x284E9b7B623eAE866914b7FA0eB720C2Bb3C2980",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x3ddbc61433314a4b7d3cbb56a001fc4cc0f1d52d64338336d5f2083a580ce4fc"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x22118009665B1d6810d4560A098D3E67bbcb934f",
          "token0": "0xC7e4635651E3e3Af82b61d3E23c159438daE3BbF",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x89de88b8eb790de26f4649f543cb6893d93635c728ac857f0926e842fb0d298b"
        }
      ],
      "costData": {
        "totalCostPercent": 1.297,
        "hops": [
          {
            "poolAddress": "0x58F08739eA9764097b9500B6e4A4db64D168b807",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x22118009665B1d6810d4560A098D3E67bbcb934f",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "GHSm-JPYm",
      "tokens": [
        {
          "address": "0x5e94B8C872bD47BC4255E60ECBF44D5E66e7401C",
          "symbol": "GHSm"
        },
        {
          "address": "0x85Bee67D435A39f7467a8a9DE34a5B73D25Df426",
          "symbol": "JPYm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x284c2d99c5A12A65F10eFF7183c33C1217B65A56",
          "token0": "0x85Bee67D435A39f7467a8a9DE34a5B73D25Df426",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x7c3b41fbd140c6fb54ff9f8f7b7b0c954606682d44ed5e56b0080f40faaf652c"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x917eE035bF0A964ACC75539f919A5B4F16336373",
          "token0": "0x5e94B8C872bD47BC4255E60ECBF44D5E66e7401C",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x3562f9d29eba092b857480a82b03375839c752346b9ebe93a57ab82410328187"
        }
      ],
      "costData": {
        "totalCostPercent": 1.297,
        "hops": [
          {
            "poolAddress": "0x284c2d99c5A12A65F10eFF7183c33C1217B65A56",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x917eE035bF0A964ACC75539f919A5B4F16336373",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "JPYm-NGNm",
      "tokens": [
        {
          "address": "0x85Bee67D435A39f7467a8a9DE34a5B73D25Df426",
          "symbol": "JPYm"
        },
        {
          "address": "0x3d5ae86F34E2a82771496D140daFAEf3789dF888",
          "symbol": "NGNm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x284c2d99c5A12A65F10eFF7183c33C1217B65A56",
          "token0": "0x85Bee67D435A39f7467a8a9DE34a5B73D25Df426",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x7c3b41fbd140c6fb54ff9f8f7b7b0c954606682d44ed5e56b0080f40faaf652c"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x6B66271811615F4b6daDb8620ED71a1E90f41Deb",
          "token0": "0x3d5ae86F34E2a82771496D140daFAEf3789dF888",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x67a5122dab72931be57196e0abba81690461f327bc60fb98ca7eef0ac58906cc"
        }
      ],
      "costData": {
        "totalCostPercent": 1.297,
        "hops": [
          {
            "poolAddress": "0x284c2d99c5A12A65F10eFF7183c33C1217B65A56",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x6B66271811615F4b6daDb8620ED71a1E90f41Deb",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "JPYm-KESm",
      "tokens": [
        {
          "address": "0x85Bee67D435A39f7467a8a9DE34a5B73D25Df426",
          "symbol": "JPYm"
        },
        {
          "address": "0xC7e4635651E3e3Af82b61d3E23c159438daE3BbF",
          "symbol": "KESm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x284c2d99c5A12A65F10eFF7183c33C1217B65A56",
          "token0": "0x85Bee67D435A39f7467a8a9DE34a5B73D25Df426",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x7c3b41fbd140c6fb54ff9f8f7b7b0c954606682d44ed5e56b0080f40faaf652c"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x22118009665B1d6810d4560A098D3E67bbcb934f",
          "token0": "0xC7e4635651E3e3Af82b61d3E23c159438daE3BbF",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x89de88b8eb790de26f4649f543cb6893d93635c728ac857f0926e842fb0d298b"
        }
      ],
      "costData": {
        "totalCostPercent": 1.297,
        "hops": [
          {
            "poolAddress": "0x284c2d99c5A12A65F10eFF7183c33C1217B65A56",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x22118009665B1d6810d4560A098D3E67bbcb934f",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "COPm-GHSm",
      "tokens": [
        {
          "address": "0x5F8d55c3627d2dc0a2B4afa798f877242F382F67",
          "symbol": "COPm"
        },
        {
          "address": "0x5e94B8C872bD47BC4255E60ECBF44D5E66e7401C",
          "symbol": "GHSm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0xCBfC8C84168D7F34FabA0018A3A63b998f1ffeCe",
          "token0": "0x5F8d55c3627d2dc0a2B4afa798f877242F382F67",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x1c9378bd0973ff313a599d3effc654ba759f8ccca655ab6d6ce5bd39a212943b"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x917eE035bF0A964ACC75539f919A5B4F16336373",
          "token0": "0x5e94B8C872bD47BC4255E60ECBF44D5E66e7401C",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x3562f9d29eba092b857480a82b03375839c752346b9ebe93a57ab82410328187"
        }
      ],
      "costData": {
        "totalCostPercent": 1.297,
        "hops": [
          {
            "poolAddress": "0xCBfC8C84168D7F34FabA0018A3A63b998f1ffeCe",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x917eE035bF0A964ACC75539f919A5B4F16336373",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "COPm-NGNm",
      "tokens": [
        {
          "address": "0x5F8d55c3627d2dc0a2B4afa798f877242F382F67",
          "symbol": "COPm"
        },
        {
          "address": "0x3d5ae86F34E2a82771496D140daFAEf3789dF888",
          "symbol": "NGNm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0xCBfC8C84168D7F34FabA0018A3A63b998f1ffeCe",
          "token0": "0x5F8d55c3627d2dc0a2B4afa798f877242F382F67",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x1c9378bd0973ff313a599d3effc654ba759f8ccca655ab6d6ce5bd39a212943b"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x6B66271811615F4b6daDb8620ED71a1E90f41Deb",
          "token0": "0x3d5ae86F34E2a82771496D140daFAEf3789dF888",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x67a5122dab72931be57196e0abba81690461f327bc60fb98ca7eef0ac58906cc"
        }
      ],
      "costData": {
        "totalCostPercent": 1.297,
        "hops": [
          {
            "poolAddress": "0xCBfC8C84168D7F34FabA0018A3A63b998f1ffeCe",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x6B66271811615F4b6daDb8620ED71a1E90f41Deb",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "COPm-KESm",
      "tokens": [
        {
          "address": "0x5F8d55c3627d2dc0a2B4afa798f877242F382F67",
          "symbol": "COPm"
        },
        {
          "address": "0xC7e4635651E3e3Af82b61d3E23c159438daE3BbF",
          "symbol": "KESm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0xCBfC8C84168D7F34FabA0018A3A63b998f1ffeCe",
          "token0": "0x5F8d55c3627d2dc0a2B4afa798f877242F382F67",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x1c9378bd0973ff313a599d3effc654ba759f8ccca655ab6d6ce5bd39a212943b"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x22118009665B1d6810d4560A098D3E67bbcb934f",
          "token0": "0xC7e4635651E3e3Af82b61d3E23c159438daE3BbF",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x89de88b8eb790de26f4649f543cb6893d93635c728ac857f0926e842fb0d298b"
        }
      ],
      "costData": {
        "totalCostPercent": 1.297,
        "hops": [
          {
            "poolAddress": "0xCBfC8C84168D7F34FabA0018A3A63b998f1ffeCe",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x22118009665B1d6810d4560A098D3E67bbcb934f",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "BRLm-GHSm",
      "tokens": [
        {
          "address": "0x2294298942fdc79417DE9E0D740A4957E0e7783a",
          "symbol": "BRLm"
        },
        {
          "address": "0x5e94B8C872bD47BC4255E60ECBF44D5E66e7401C",
          "symbol": "GHSm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x49A968C539599385c69c2d528500DA58d933FafA",
          "token0": "0x2294298942fdc79417DE9E0D740A4957E0e7783a",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xd11d52b973ddbb983cc2087aabcafd915fc3140cf9996aacc61db9710d1bde05"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x917eE035bF0A964ACC75539f919A5B4F16336373",
          "token0": "0x5e94B8C872bD47BC4255E60ECBF44D5E66e7401C",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x3562f9d29eba092b857480a82b03375839c752346b9ebe93a57ab82410328187"
        }
      ],
      "costData": {
        "totalCostPercent": 1.297,
        "hops": [
          {
            "poolAddress": "0x49A968C539599385c69c2d528500DA58d933FafA",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x917eE035bF0A964ACC75539f919A5B4F16336373",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "BRLm-NGNm",
      "tokens": [
        {
          "address": "0x2294298942fdc79417DE9E0D740A4957E0e7783a",
          "symbol": "BRLm"
        },
        {
          "address": "0x3d5ae86F34E2a82771496D140daFAEf3789dF888",
          "symbol": "NGNm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x49A968C539599385c69c2d528500DA58d933FafA",
          "token0": "0x2294298942fdc79417DE9E0D740A4957E0e7783a",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xd11d52b973ddbb983cc2087aabcafd915fc3140cf9996aacc61db9710d1bde05"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x6B66271811615F4b6daDb8620ED71a1E90f41Deb",
          "token0": "0x3d5ae86F34E2a82771496D140daFAEf3789dF888",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x67a5122dab72931be57196e0abba81690461f327bc60fb98ca7eef0ac58906cc"
        }
      ],
      "costData": {
        "totalCostPercent": 1.297,
        "hops": [
          {
            "poolAddress": "0x49A968C539599385c69c2d528500DA58d933FafA",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x6B66271811615F4b6daDb8620ED71a1E90f41Deb",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "BRLm-KESm",
      "tokens": [
        {
          "address": "0x2294298942fdc79417DE9E0D740A4957E0e7783a",
          "symbol": "BRLm"
        },
        {
          "address": "0xC7e4635651E3e3Af82b61d3E23c159438daE3BbF",
          "symbol": "KESm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x49A968C539599385c69c2d528500DA58d933FafA",
          "token0": "0x2294298942fdc79417DE9E0D740A4957E0e7783a",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xd11d52b973ddbb983cc2087aabcafd915fc3140cf9996aacc61db9710d1bde05"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x22118009665B1d6810d4560A098D3E67bbcb934f",
          "token0": "0xC7e4635651E3e3Af82b61d3E23c159438daE3BbF",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x89de88b8eb790de26f4649f543cb6893d93635c728ac857f0926e842fb0d298b"
        }
      ],
      "costData": {
        "totalCostPercent": 1.297,
        "hops": [
          {
            "poolAddress": "0x49A968C539599385c69c2d528500DA58d933FafA",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x22118009665B1d6810d4560A098D3E67bbcb934f",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "GHSm-NGNm",
      "tokens": [
        {
          "address": "0x5e94B8C872bD47BC4255E60ECBF44D5E66e7401C",
          "symbol": "GHSm"
        },
        {
          "address": "0x3d5ae86F34E2a82771496D140daFAEf3789dF888",
          "symbol": "NGNm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x917eE035bF0A964ACC75539f919A5B4F16336373",
          "token0": "0x5e94B8C872bD47BC4255E60ECBF44D5E66e7401C",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x3562f9d29eba092b857480a82b03375839c752346b9ebe93a57ab82410328187"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x6B66271811615F4b6daDb8620ED71a1E90f41Deb",
          "token0": "0x3d5ae86F34E2a82771496D140daFAEf3789dF888",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x67a5122dab72931be57196e0abba81690461f327bc60fb98ca7eef0ac58906cc"
        }
      ],
      "costData": {
        "totalCostPercent": 1.99,
        "hops": [
          {
            "poolAddress": "0x917eE035bF0A964ACC75539f919A5B4F16336373",
            "costPercent": 1
          },
          {
            "poolAddress": "0x6B66271811615F4b6daDb8620ED71a1E90f41Deb",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "GHSm-KESm",
      "tokens": [
        {
          "address": "0x5e94B8C872bD47BC4255E60ECBF44D5E66e7401C",
          "symbol": "GHSm"
        },
        {
          "address": "0xC7e4635651E3e3Af82b61d3E23c159438daE3BbF",
          "symbol": "KESm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x917eE035bF0A964ACC75539f919A5B4F16336373",
          "token0": "0x5e94B8C872bD47BC4255E60ECBF44D5E66e7401C",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x3562f9d29eba092b857480a82b03375839c752346b9ebe93a57ab82410328187"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x22118009665B1d6810d4560A098D3E67bbcb934f",
          "token0": "0xC7e4635651E3e3Af82b61d3E23c159438daE3BbF",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x89de88b8eb790de26f4649f543cb6893d93635c728ac857f0926e842fb0d298b"
        }
      ],
      "costData": {
        "totalCostPercent": 1.99,
        "hops": [
          {
            "poolAddress": "0x917eE035bF0A964ACC75539f919A5B4F16336373",
            "costPercent": 1
          },
          {
            "poolAddress": "0x22118009665B1d6810d4560A098D3E67bbcb934f",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "KESm-NGNm",
      "tokens": [
        {
          "address": "0xC7e4635651E3e3Af82b61d3E23c159438daE3BbF",
          "symbol": "KESm"
        },
        {
          "address": "0x3d5ae86F34E2a82771496D140daFAEf3789dF888",
          "symbol": "NGNm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x6B66271811615F4b6daDb8620ED71a1E90f41Deb",
          "token0": "0x3d5ae86F34E2a82771496D140daFAEf3789dF888",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x67a5122dab72931be57196e0abba81690461f327bc60fb98ca7eef0ac58906cc"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x22118009665B1d6810d4560A098D3E67bbcb934f",
          "token0": "0xC7e4635651E3e3Af82b61d3E23c159438daE3BbF",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x89de88b8eb790de26f4649f543cb6893d93635c728ac857f0926e842fb0d298b"
        }
      ],
      "costData": {
        "totalCostPercent": 1.99,
        "hops": [
          {
            "poolAddress": "0x6B66271811615F4b6daDb8620ED71a1E90f41Deb",
            "costPercent": 1
          },
          {
            "poolAddress": "0x22118009665B1d6810d4560A098D3E67bbcb934f",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "USDm-XOFm",
      "tokens": [
        {
          "address": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "symbol": "USDm"
        },
        {
          "address": "0x5505b70207aE3B826c1A7607F19F3Bf73444A082",
          "symbol": "XOFm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x1e2506EdCa4eF3030E51bE8B571B935d55677604",
          "token0": "0x5505b70207aE3B826c1A7607F19F3Bf73444A082",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xc9664df358594c5eaf2f410ab371e2deb8b532ca26162d2bc36d99b8d174567b"
        }
      ],
      "costData": {
        "totalCostPercent": 2,
        "hops": [
          {
            "poolAddress": "0x1e2506EdCa4eF3030E51bE8B571B935d55677604",
            "costPercent": 2
          }
        ]
      }
    },
    {
      "id": "XOFm-axlUSDC",
      "tokens": [
        {
          "address": "0x5505b70207aE3B826c1A7607F19F3Bf73444A082",
          "symbol": "XOFm"
        },
        {
          "address": "0x6285De9DA7C1d329C0451628638908915002d9d1",
          "symbol": "axlUSDC"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0xF1B77Ffc1F71b21b6c69876CEDAf82340803dE75",
          "token0": "0x6285De9DA7C1d329C0451628638908915002d9d1",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x1e2506EdCa4eF3030E51bE8B571B935d55677604",
          "token0": "0x5505b70207aE3B826c1A7607F19F3Bf73444A082",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xc9664df358594c5eaf2f410ab371e2deb8b532ca26162d2bc36d99b8d174567b"
        }
      ],
      "costData": {
        "totalCostPercent": 2.049,
        "hops": [
          {
            "poolAddress": "0xF1B77Ffc1F71b21b6c69876CEDAf82340803dE75",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x1e2506EdCa4eF3030E51bE8B571B935d55677604",
            "costPercent": 2
          }
        ]
      }
    },
    {
      "id": "USDC-XOFm",
      "tokens": [
        {
          "address": "0x01C5C0122039549AD1493B8220cABEdD739BC44E",
          "symbol": "USDC"
        },
        {
          "address": "0x5505b70207aE3B826c1A7607F19F3Bf73444A082",
          "symbol": "XOFm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x7109E0A9B4623e90755b7e5c4e10F089E5Bf8bDb",
          "token0": "0x01C5C0122039549AD1493B8220cABEdD739BC44E",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x1e2506EdCa4eF3030E51bE8B571B935d55677604",
          "token0": "0x5505b70207aE3B826c1A7607F19F3Bf73444A082",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xc9664df358594c5eaf2f410ab371e2deb8b532ca26162d2bc36d99b8d174567b"
        }
      ],
      "costData": {
        "totalCostPercent": 2.049,
        "hops": [
          {
            "poolAddress": "0x7109E0A9B4623e90755b7e5c4e10F089E5Bf8bDb",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x1e2506EdCa4eF3030E51bE8B571B935d55677604",
            "costPercent": 2
          }
        ]
      }
    },
    {
      "id": "USD₮-XOFm",
      "tokens": [
        {
          "address": "0xd077A400968890Eacc75cdc901F0356c943e4fDb",
          "symbol": "USD₮"
        },
        {
          "address": "0x5505b70207aE3B826c1A7607F19F3Bf73444A082",
          "symbol": "XOFm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0xd1a70F43B2A95384DD2a7D7b259293328B3974f8",
          "token0": "0xd077A400968890Eacc75cdc901F0356c943e4fDb",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x1e2506EdCa4eF3030E51bE8B571B935d55677604",
          "token0": "0x5505b70207aE3B826c1A7607F19F3Bf73444A082",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xc9664df358594c5eaf2f410ab371e2deb8b532ca26162d2bc36d99b8d174567b"
        }
      ],
      "costData": {
        "totalCostPercent": 2.049,
        "hops": [
          {
            "poolAddress": "0xd1a70F43B2A95384DD2a7D7b259293328B3974f8",
            "costPercent": 0.05
          },
          {
            "poolAddress": "0x1e2506EdCa4eF3030E51bE8B571B935d55677604",
            "costPercent": 2
          }
        ]
      }
    },
    {
      "id": "AUDm-XOFm",
      "tokens": [
        {
          "address": "0x5873Faeb42F3563dcD77F0fbbdA818E6d6DA3139",
          "symbol": "AUDm"
        },
        {
          "address": "0x5505b70207aE3B826c1A7607F19F3Bf73444A082",
          "symbol": "XOFm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x1e2506EdCa4eF3030E51bE8B571B935d55677604",
          "token0": "0x5505b70207aE3B826c1A7607F19F3Bf73444A082",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xc9664df358594c5eaf2f410ab371e2deb8b532ca26162d2bc36d99b8d174567b"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x8103Fb2db87AC96cc62FAA399B98e1173720aB19",
          "token0": "0x5873Faeb42F3563dcD77F0fbbdA818E6d6DA3139",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xd580d237231109e6a96d67d82450611c610a805a26660c90281bdc0cd04a95c7"
        }
      ],
      "costData": {
        "totalCostPercent": 2.147,
        "hops": [
          {
            "poolAddress": "0x1e2506EdCa4eF3030E51bE8B571B935d55677604",
            "costPercent": 2
          },
          {
            "poolAddress": "0x8103Fb2db87AC96cc62FAA399B98e1173720aB19",
            "costPercent": 0.15
          }
        ]
      }
    },
    {
      "id": "CADm-XOFm",
      "tokens": [
        {
          "address": "0xF151c9a13b78C84f93f50B8b3bC689fedc134F60",
          "symbol": "CADm"
        },
        {
          "address": "0x5505b70207aE3B826c1A7607F19F3Bf73444A082",
          "symbol": "XOFm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x1e2506EdCa4eF3030E51bE8B571B935d55677604",
          "token0": "0x5505b70207aE3B826c1A7607F19F3Bf73444A082",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xc9664df358594c5eaf2f410ab371e2deb8b532ca26162d2bc36d99b8d174567b"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x62722497dc8992337117ee79A02015dcEa43b2C2",
          "token0": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "token1": "0xF151c9a13b78C84f93f50B8b3bC689fedc134F60",
          "poolType": "Virtual",
          "exchangeId": "0x517ccc3bcab9f35e2e24143a0c1809068efc649f740846cfb6a1c5703735c1ee"
        }
      ],
      "costData": {
        "totalCostPercent": 2.147,
        "hops": [
          {
            "poolAddress": "0x1e2506EdCa4eF3030E51bE8B571B935d55677604",
            "costPercent": 2
          },
          {
            "poolAddress": "0x62722497dc8992337117ee79A02015dcEa43b2C2",
            "costPercent": 0.15
          }
        ]
      }
    },
    {
      "id": "GBPm-XOFm",
      "tokens": [
        {
          "address": "0x85F5181Abdbf0e1814Fc4358582Ae07b8eBA3aF3",
          "symbol": "GBPm"
        },
        {
          "address": "0x5505b70207aE3B826c1A7607F19F3Bf73444A082",
          "symbol": "XOFm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x353ED52bF8482027C0e0b9e3c0e5d96A9F680980",
          "poolAddr": "0x550D9EcB4C373510b8A41f5fB7D98E9E1c51A07e",
          "token0": "0x85F5181Abdbf0e1814Fc4358582Ae07b8eBA3aF3",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "FPMM"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x1e2506EdCa4eF3030E51bE8B571B935d55677604",
          "token0": "0x5505b70207aE3B826c1A7607F19F3Bf73444A082",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xc9664df358594c5eaf2f410ab371e2deb8b532ca26162d2bc36d99b8d174567b"
        }
      ],
      "costData": {
        "totalCostPercent": 2.294,
        "hops": [
          {
            "poolAddress": "0x550D9EcB4C373510b8A41f5fB7D98E9E1c51A07e",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x1e2506EdCa4eF3030E51bE8B571B935d55677604",
            "costPercent": 2
          }
        ]
      }
    },
    {
      "id": "PHPm-XOFm",
      "tokens": [
        {
          "address": "0x0352976d940a2C3FBa0C3623198947Ee1d17869E",
          "symbol": "PHPm"
        },
        {
          "address": "0x5505b70207aE3B826c1A7607F19F3Bf73444A082",
          "symbol": "XOFm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x671334256a893fDBc4FfE55F98f156A168bD897a",
          "token0": "0x0352976d940a2C3FBa0C3623198947Ee1d17869E",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x7952984d7278ca3417febf52815c321984ac3147ced2c02bb6a02b0bcab08413"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x1e2506EdCa4eF3030E51bE8B571B935d55677604",
          "token0": "0x5505b70207aE3B826c1A7607F19F3Bf73444A082",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xc9664df358594c5eaf2f410ab371e2deb8b532ca26162d2bc36d99b8d174567b"
        }
      ],
      "costData": {
        "totalCostPercent": 2.294,
        "hops": [
          {
            "poolAddress": "0x671334256a893fDBc4FfE55F98f156A168bD897a",
            "costPercent": 0.3
          },
          {
            "poolAddress": "0x1e2506EdCa4eF3030E51bE8B571B935d55677604",
            "costPercent": 2
          }
        ]
      }
    },
    {
      "id": "XOFm-ZARm",
      "tokens": [
        {
          "address": "0x5505b70207aE3B826c1A7607F19F3Bf73444A082",
          "symbol": "XOFm"
        },
        {
          "address": "0x10CCfB235b0E1Ed394bACE4560C3ed016697687e",
          "symbol": "ZARm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x1e2506EdCa4eF3030E51bE8B571B935d55677604",
          "token0": "0x5505b70207aE3B826c1A7607F19F3Bf73444A082",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xc9664df358594c5eaf2f410ab371e2deb8b532ca26162d2bc36d99b8d174567b"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x68D19b5a48cbbFd11057E97DA9960B09D771E7B6",
          "token0": "0x10CCfB235b0E1Ed394bACE4560C3ed016697687e",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x4206e101b13bf29e40b2bfed4cf167271c41677720f2ee786ac1bf5efac101cb"
        }
      ],
      "costData": {
        "totalCostPercent": 2.294,
        "hops": [
          {
            "poolAddress": "0x1e2506EdCa4eF3030E51bE8B571B935d55677604",
            "costPercent": 2
          },
          {
            "poolAddress": "0x68D19b5a48cbbFd11057E97DA9960B09D771E7B6",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "CHFm-XOFm",
      "tokens": [
        {
          "address": "0x284E9b7B623eAE866914b7FA0eB720C2Bb3C2980",
          "symbol": "CHFm"
        },
        {
          "address": "0x5505b70207aE3B826c1A7607F19F3Bf73444A082",
          "symbol": "XOFm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x1e2506EdCa4eF3030E51bE8B571B935d55677604",
          "token0": "0x5505b70207aE3B826c1A7607F19F3Bf73444A082",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xc9664df358594c5eaf2f410ab371e2deb8b532ca26162d2bc36d99b8d174567b"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x58F08739eA9764097b9500B6e4A4db64D168b807",
          "token0": "0x284E9b7B623eAE866914b7FA0eB720C2Bb3C2980",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x3ddbc61433314a4b7d3cbb56a001fc4cc0f1d52d64338336d5f2083a580ce4fc"
        }
      ],
      "costData": {
        "totalCostPercent": 2.294,
        "hops": [
          {
            "poolAddress": "0x1e2506EdCa4eF3030E51bE8B571B935d55677604",
            "costPercent": 2
          },
          {
            "poolAddress": "0x58F08739eA9764097b9500B6e4A4db64D168b807",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "JPYm-XOFm",
      "tokens": [
        {
          "address": "0x85Bee67D435A39f7467a8a9DE34a5B73D25Df426",
          "symbol": "JPYm"
        },
        {
          "address": "0x5505b70207aE3B826c1A7607F19F3Bf73444A082",
          "symbol": "XOFm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x1e2506EdCa4eF3030E51bE8B571B935d55677604",
          "token0": "0x5505b70207aE3B826c1A7607F19F3Bf73444A082",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xc9664df358594c5eaf2f410ab371e2deb8b532ca26162d2bc36d99b8d174567b"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x284c2d99c5A12A65F10eFF7183c33C1217B65A56",
          "token0": "0x85Bee67D435A39f7467a8a9DE34a5B73D25Df426",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x7c3b41fbd140c6fb54ff9f8f7b7b0c954606682d44ed5e56b0080f40faaf652c"
        }
      ],
      "costData": {
        "totalCostPercent": 2.294,
        "hops": [
          {
            "poolAddress": "0x1e2506EdCa4eF3030E51bE8B571B935d55677604",
            "costPercent": 2
          },
          {
            "poolAddress": "0x284c2d99c5A12A65F10eFF7183c33C1217B65A56",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "COPm-XOFm",
      "tokens": [
        {
          "address": "0x5F8d55c3627d2dc0a2B4afa798f877242F382F67",
          "symbol": "COPm"
        },
        {
          "address": "0x5505b70207aE3B826c1A7607F19F3Bf73444A082",
          "symbol": "XOFm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x1e2506EdCa4eF3030E51bE8B571B935d55677604",
          "token0": "0x5505b70207aE3B826c1A7607F19F3Bf73444A082",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xc9664df358594c5eaf2f410ab371e2deb8b532ca26162d2bc36d99b8d174567b"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0xCBfC8C84168D7F34FabA0018A3A63b998f1ffeCe",
          "token0": "0x5F8d55c3627d2dc0a2B4afa798f877242F382F67",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x1c9378bd0973ff313a599d3effc654ba759f8ccca655ab6d6ce5bd39a212943b"
        }
      ],
      "costData": {
        "totalCostPercent": 2.294,
        "hops": [
          {
            "poolAddress": "0x1e2506EdCa4eF3030E51bE8B571B935d55677604",
            "costPercent": 2
          },
          {
            "poolAddress": "0xCBfC8C84168D7F34FabA0018A3A63b998f1ffeCe",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "BRLm-XOFm",
      "tokens": [
        {
          "address": "0x2294298942fdc79417DE9E0D740A4957E0e7783a",
          "symbol": "BRLm"
        },
        {
          "address": "0x5505b70207aE3B826c1A7607F19F3Bf73444A082",
          "symbol": "XOFm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x1e2506EdCa4eF3030E51bE8B571B935d55677604",
          "token0": "0x5505b70207aE3B826c1A7607F19F3Bf73444A082",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xc9664df358594c5eaf2f410ab371e2deb8b532ca26162d2bc36d99b8d174567b"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x49A968C539599385c69c2d528500DA58d933FafA",
          "token0": "0x2294298942fdc79417DE9E0D740A4957E0e7783a",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xd11d52b973ddbb983cc2087aabcafd915fc3140cf9996aacc61db9710d1bde05"
        }
      ],
      "costData": {
        "totalCostPercent": 2.294,
        "hops": [
          {
            "poolAddress": "0x1e2506EdCa4eF3030E51bE8B571B935d55677604",
            "costPercent": 2
          },
          {
            "poolAddress": "0x49A968C539599385c69c2d528500DA58d933FafA",
            "costPercent": 0.3
          }
        ]
      }
    },
    {
      "id": "GHSm-XOFm",
      "tokens": [
        {
          "address": "0x5e94B8C872bD47BC4255E60ECBF44D5E66e7401C",
          "symbol": "GHSm"
        },
        {
          "address": "0x5505b70207aE3B826c1A7607F19F3Bf73444A082",
          "symbol": "XOFm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x1e2506EdCa4eF3030E51bE8B571B935d55677604",
          "token0": "0x5505b70207aE3B826c1A7607F19F3Bf73444A082",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xc9664df358594c5eaf2f410ab371e2deb8b532ca26162d2bc36d99b8d174567b"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x917eE035bF0A964ACC75539f919A5B4F16336373",
          "token0": "0x5e94B8C872bD47BC4255E60ECBF44D5E66e7401C",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x3562f9d29eba092b857480a82b03375839c752346b9ebe93a57ab82410328187"
        }
      ],
      "costData": {
        "totalCostPercent": 2.98,
        "hops": [
          {
            "poolAddress": "0x1e2506EdCa4eF3030E51bE8B571B935d55677604",
            "costPercent": 2
          },
          {
            "poolAddress": "0x917eE035bF0A964ACC75539f919A5B4F16336373",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "NGNm-XOFm",
      "tokens": [
        {
          "address": "0x3d5ae86F34E2a82771496D140daFAEf3789dF888",
          "symbol": "NGNm"
        },
        {
          "address": "0x5505b70207aE3B826c1A7607F19F3Bf73444A082",
          "symbol": "XOFm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x1e2506EdCa4eF3030E51bE8B571B935d55677604",
          "token0": "0x5505b70207aE3B826c1A7607F19F3Bf73444A082",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xc9664df358594c5eaf2f410ab371e2deb8b532ca26162d2bc36d99b8d174567b"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x6B66271811615F4b6daDb8620ED71a1E90f41Deb",
          "token0": "0x3d5ae86F34E2a82771496D140daFAEf3789dF888",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x67a5122dab72931be57196e0abba81690461f327bc60fb98ca7eef0ac58906cc"
        }
      ],
      "costData": {
        "totalCostPercent": 2.98,
        "hops": [
          {
            "poolAddress": "0x1e2506EdCa4eF3030E51bE8B571B935d55677604",
            "costPercent": 2
          },
          {
            "poolAddress": "0x6B66271811615F4b6daDb8620ED71a1E90f41Deb",
            "costPercent": 1
          }
        ]
      }
    },
    {
      "id": "KESm-XOFm",
      "tokens": [
        {
          "address": "0xC7e4635651E3e3Af82b61d3E23c159438daE3BbF",
          "symbol": "KESm"
        },
        {
          "address": "0x5505b70207aE3B826c1A7607F19F3Bf73444A082",
          "symbol": "XOFm"
        }
      ],
      "path": [
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x1e2506EdCa4eF3030E51bE8B571B935d55677604",
          "token0": "0x5505b70207aE3B826c1A7607F19F3Bf73444A082",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0xc9664df358594c5eaf2f410ab371e2deb8b532ca26162d2bc36d99b8d174567b"
        },
        {
          "factoryAddr": "0x887955f28723B0e9Bddc358448CB5B1FDe692da4",
          "poolAddr": "0x22118009665B1d6810d4560A098D3E67bbcb934f",
          "token0": "0xC7e4635651E3e3Af82b61d3E23c159438daE3BbF",
          "token1": "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b",
          "poolType": "Virtual",
          "exchangeId": "0x89de88b8eb790de26f4649f543cb6893d93635c728ac857f0926e842fb0d298b"
        }
      ],
      "costData": {
        "totalCostPercent": 2.98,
        "hops": [
          {
            "poolAddress": "0x1e2506EdCa4eF3030E51bE8B571B935d55677604",
            "costPercent": 2
          },
          {
            "poolAddress": "0x22118009665B1d6810d4560A098D3E67bbcb934f",
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
