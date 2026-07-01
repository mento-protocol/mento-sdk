export interface DataStreamsCredentials {
  apiKey: string
  userSecret: string
  baseUrl?: string
}

export interface ReportV3 {
  feedID: string
  validFromTimestamp: number
  observationsTimestamp: number
  nativeFee: bigint
  linkFee: bigint
  expiresAt: number
  price: bigint
  bid: bigint
  ask: bigint
  fullReport: string
}

/**
 * V8 (RWA / forex) report. Supersedes the deprecated V4 schema. The on-chain report struct inserts a
 * `uint64 lastUpdateTimestamp` before the price, and the price field is named `midPrice` in the raw
 * report — we surface it as `price` for parity with V3.
 */
export interface ReportV8 {
  feedID: string
  validFromTimestamp: number
  observationsTimestamp: number
  nativeFee: bigint
  linkFee: bigint
  expiresAt: number
  /** DON last-update time, nanoseconds (V8-specific). */
  lastUpdateTimestamp: number
  /** The report's `midPrice`, surfaced as `price` for parity with V3. */
  price: bigint
  marketStatus: 0 | 1 | 2
  fullReport: string
}

export type DataStreamsReport = ReportV3 | ReportV8
