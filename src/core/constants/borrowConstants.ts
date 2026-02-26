// Compile-time constants from Constants.sol
export const MAX_ANNUAL_INTEREST_RATE = 2_500_000_000_000_000_000n // 250%
export const UPFRONT_INTEREST_PERIOD = 604_800 // 7 days in seconds
export const INTEREST_RATE_ADJ_COOLDOWN = 604_800 // 7 days in seconds

// UI-level constants from Bold frontend (constants.ts)
export const MAX_LTV_ALLOWED_RATIO = 916n // 91.6% (per-mille)
export const LTV_RISK_MEDIUM = 540n // 54% of maxLtv
export const LTV_RISK_HIGH = 730n // 73% of maxLtv
export const REDEMPTION_RISK_MEDIUM = 50n // 5% of total debt
export const REDEMPTION_RISK_LOW = 600n // 60% of total debt

// Single branch index for Mento
export const COLL_INDEX = 0n
