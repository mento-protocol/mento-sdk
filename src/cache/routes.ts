// This file is auto-generated. Do not edit manually.
// Generated on 2026-03-03T13:09:27.740Z

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
