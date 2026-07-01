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

export interface ReportV4 {
  feedID: string
  validFromTimestamp: number
  observationsTimestamp: number
  nativeFee: bigint
  linkFee: bigint
  expiresAt: number
  price: bigint
  marketStatus: 0 | 1 | 2
  fullReport: string
}

export type DataStreamsReport = ReportV3 | ReportV4
