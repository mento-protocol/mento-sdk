import type { Chain } from 'viem'
import * as upstream from 'viem/chains'
import * as selected from '../../../src/utils/selectedChains'
import { getChainConfig } from '../../../src/utils/chainConfig'

// defineChain creates a fresh extend closure for every instance. Compare all
// metadata and hook references, then compare the closure's observable result.
function withoutExtend(chain: Chain) {
  return Object.fromEntries(Object.entries(chain).filter(([key]) => key !== 'extend'))
}

function extend(chain: Chain) {
  const fn = Reflect.get(chain, 'extend') as (override: { name: string }) => Chain
  expect(fn).toBeInstanceOf(Function)
  return fn({ name: 'custom chain' })
}

describe('selected chain snapshots', () => {
  it.each(['celo', 'polygon', 'polygonAmoy', 'baseSepolia'] as const)(
    '%s retains upstream metadata, runtime hooks and extension behavior',
    (name) => {
      const actual = selected[name]
      const expected = upstream[name]
      expect(withoutExtend(actual)).toEqual(withoutExtend(expected))
      expect(getChainConfig(actual.id)).toBe(actual)
      expect(withoutExtend(extend(actual))).toEqual(withoutExtend(extend(expected)))
    }
  )
})
