import type { Address } from 'viem'
import { encodeRoutePath } from '../../../src/utils/pathEncoder'
import type { Pool } from '../../../src/core/types'

describe('encodeRoutePath', () => {
  const tokenA = '0x1000000000000000000000000000000000000001' as Address
  const tokenB = '0x2000000000000000000000000000000000000002' as Address
  const tokenC = '0x3000000000000000000000000000000000000003' as Address
  const tokenD = '0x4000000000000000000000000000000000000004' as Address
  const tokenE = '0x5000000000000000000000000000000000000005' as Address
  const factory = '0x7000000000000000000000000000000000000007' as Address

  const path: Pool[] = [
    makePool('0x5100000000000000000000000000000000000051', tokenA, tokenB),
    makePool('0x5200000000000000000000000000000000000052', tokenB, tokenC),
    makePool('0x5300000000000000000000000000000000000053', tokenC, tokenD),
  ]

  it('encodes a connected three-pool path from the first token to the last', () => {
    expect(encodeRoutePath(path, tokenA, tokenD)).toEqual([
      { from: tokenA, to: tokenB, factory },
      { from: tokenB, to: tokenC, factory },
      { from: tokenC, to: tokenD, factory },
    ])
  })

  it('encodes the same connected three-pool path in reverse', () => {
    expect(encodeRoutePath(path, tokenD, tokenA)).toEqual([
      { from: tokenD, to: tokenC, factory },
      { from: tokenC, to: tokenB, factory },
      { from: tokenB, to: tokenA, factory },
    ])
  })

  it('encodes a connected four-pool path for compatibility with the Router', () => {
    const fourHopPath = [...path, makePool('0x5400000000000000000000000000000000000054', tokenD, tokenE)]

    expect(encodeRoutePath(fourHopPath, tokenA, tokenE)).toEqual([
      { from: tokenA, to: tokenB, factory },
      { from: tokenB, to: tokenC, factory },
      { from: tokenC, to: tokenD, factory },
      { from: tokenD, to: tokenE, factory },
    ])
  })
})

function makePool(poolAddr: string, token0: Address, token1: Address): Pool {
  return {
    factoryAddr: '0x7000000000000000000000000000000000000007',
    poolAddr,
    token0,
    token1,
    poolType: 'FPMM',
  }
}
