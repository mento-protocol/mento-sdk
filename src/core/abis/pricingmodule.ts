import { parseAbi } from 'viem'

export const PRICING_MODULE_ABI = parseAbi(['function name() view returns (string)']) as any
