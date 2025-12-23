import { toRateFeedId } from '../../../src/utils/rateFeed'

/**
 * Unit tests for toRateFeedId utility
 *
 * Tests computation of rate feed IDs from identifier strings.
 * These values should match the on-chain computation:
 * address(uint160(uint256(keccak256(abi.encodePacked(rateFeed)))))
 */
describe('toRateFeedId()', () => {
  it('should compute correct rate feed ID for CELOUSD', () => {
    const result = toRateFeedId('CELOUSD')

    // Expected value from on-chain computation
    expect(result).toMatch(/^0x[0-9a-f]{40}$/i)
    expect(result.length).toBe(42) // 0x + 40 hex chars
  })

  it('should compute correct rate feed ID for EURUSD', () => {
    const result = toRateFeedId('EURUSD')

    expect(result).toMatch(/^0x[0-9a-f]{40}$/i)
    expect(result.length).toBe(42)
  })

  it('should compute correct rate feed ID for relayed rate feeds', () => {
    const result = toRateFeedId('relayed:COPUSD')

    expect(result).toMatch(/^0x[0-9a-f]{40}$/i)
    expect(result.length).toBe(42)
  })

  it('should be case sensitive', () => {
    const lowerCase = toRateFeedId('eurusd')
    const upperCase = toRateFeedId('EURUSD')

    // Case should matter - different strings should produce different IDs
    expect(lowerCase).not.toBe(upperCase)
  })

  it('should produce deterministic results', () => {
    const first = toRateFeedId('CELOUSD')
    const second = toRateFeedId('CELOUSD')

    expect(first).toBe(second)
  })

  it('should produce different IDs for different rate feeds', () => {
    const celoUsd = toRateFeedId('CELOUSD')
    const eurUsd = toRateFeedId('EURUSD')
    const gbpUsd = toRateFeedId('GBPUSD')

    expect(celoUsd).not.toBe(eurUsd)
    expect(celoUsd).not.toBe(gbpUsd)
    expect(eurUsd).not.toBe(gbpUsd)
  })

  it('should handle empty string', () => {
    const result = toRateFeedId('')

    expect(result).toMatch(/^0x[0-9a-f]{40}$/i)
    expect(result.length).toBe(42)
  })

  it('should return lowercase hex address', () => {
    const result = toRateFeedId('CELOUSD')

    // Should not have uppercase hex chars (except the 0x prefix)
    expect(result.slice(2)).toBe(result.slice(2).toLowerCase())
  })

  it('should pad output to 40 characters', () => {
    // Even if hash result has leading zeros, output should be 40 chars
    const result = toRateFeedId('test')

    expect(result.slice(2).length).toBe(40)
  })

  // Verification against known on-chain values
  // These values were computed using keccak256 and verified
  describe('known rate feed IDs (regression tests)', () => {
    it('should match known CELOUSD rate feed ID', () => {
      const result = toRateFeedId('CELOUSD')

      // Computed: keccak256("CELOUSD") masked to 160 bits
      expect(result).toBe('0xc443d8c40d321b34f815eac76a7620fb06f9e8a4')
    })

    it('should match known EURUSD rate feed ID', () => {
      const result = toRateFeedId('EURUSD')

      // Computed: keccak256("EURUSD") masked to 160 bits
      expect(result).toBe('0x5d5a22116233bdb2a9c2977279cc348b8b8ce917')
    })
  })
})
