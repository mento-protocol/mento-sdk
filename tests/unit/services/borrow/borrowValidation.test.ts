/**
 * Unit tests for borrowValidation.ts utility functions.
 * These are pure functions and can be tested in isolation.
 */
import {
  ceilSqrt,
  formatTroveId,
  parseTroveId,
  requireDebtTokenSymbol,
  requireNonNegativeBigInt,
  requireNonNegativeInteger,
  requirePositiveBigInt,
  requireUint128,
} from '../../../../src/services/borrow/internal/borrowValidation'

describe('borrowValidation', () => {
  describe('requireDebtTokenSymbol', () => {
    it('returns trimmed symbol for valid input', () => {
      expect(requireDebtTokenSymbol('USDm')).toBe('USDm')
      expect(requireDebtTokenSymbol('  GBPm  ')).toBe('GBPm')
    })

    it('throws for empty string', () => {
      expect(() => requireDebtTokenSymbol('')).toThrow(
        'debtTokenSymbol must be a non-empty string'
      )
    })

    it('throws for whitespace-only string', () => {
      expect(() => requireDebtTokenSymbol('   ')).toThrow(
        'debtTokenSymbol must be a non-empty string'
      )
    })
  })

  describe('parseTroveId', () => {
    it('parses a valid decimal string trove ID', () => {
      expect(parseTroveId('12345')).toBe(12345n)
    })

    it('parses a valid hex string trove ID', () => {
      expect(parseTroveId('0x3039')).toBe(0x3039n)
    })

    it('parses zero', () => {
      expect(parseTroveId('0')).toBe(0n)
    })

    it('throws for empty string', () => {
      expect(() => parseTroveId('')).toThrow('troveId must be a non-empty string')
    })

    it('throws for whitespace-only string', () => {
      expect(() => parseTroveId('   ')).toThrow('troveId must be a non-empty string')
    })

    it('throws for non-numeric string', () => {
      expect(() => parseTroveId('abc')).toThrow('Invalid troveId: abc')
    })

    it('throws for negative value', () => {
      expect(() => parseTroveId('-1')).toThrow('troveId cannot be negative')
    })
  })

  describe('formatTroveId', () => {
    it('formats a bigint to a hex string', () => {
      expect(formatTroveId(255n)).toBe('0xff')
      expect(formatTroveId(0n)).toBe('0x0')
      expect(formatTroveId(12345n)).toBe(`0x${(12345n).toString(16)}`)
    })
  })

  describe('requireNonNegativeInteger', () => {
    it('returns the value for zero and positive integers', () => {
      expect(requireNonNegativeInteger(0, 'field')).toBe(0)
      expect(requireNonNegativeInteger(42, 'field')).toBe(42)
      expect(requireNonNegativeInteger(Number.MAX_SAFE_INTEGER, 'field')).toBe(
        Number.MAX_SAFE_INTEGER
      )
    })

    it('throws for negative integers', () => {
      expect(() => requireNonNegativeInteger(-1, 'field')).toThrow(
        'field must be a non-negative safe integer'
      )
    })

    it('throws for non-safe integers (Infinity, NaN, float)', () => {
      expect(() => requireNonNegativeInteger(Infinity, 'field')).toThrow(
        'field must be a non-negative safe integer'
      )
      expect(() => requireNonNegativeInteger(NaN, 'field')).toThrow(
        'field must be a non-negative safe integer'
      )
      expect(() => requireNonNegativeInteger(1.5, 'field')).toThrow(
        'field must be a non-negative safe integer'
      )
      expect(() => requireNonNegativeInteger(Number.MAX_SAFE_INTEGER + 1, 'field')).toThrow(
        'field must be a non-negative safe integer'
      )
    })
  })

  describe('requireNonNegativeBigInt', () => {
    it('returns the value for zero and positive bigints', () => {
      expect(requireNonNegativeBigInt(0n, 'field')).toBe(0n)
      expect(requireNonNegativeBigInt(999n, 'field')).toBe(999n)
    })

    it('throws for negative bigints', () => {
      expect(() => requireNonNegativeBigInt(-1n, 'field')).toThrow(
        'field must be a non-negative bigint'
      )
    })

    it('throws for non-bigint values', () => {
      // @ts-expect-error testing runtime type checking
      expect(() => requireNonNegativeBigInt(0, 'field')).toThrow(
        'field must be a non-negative bigint'
      )
    })
  })

  describe('requirePositiveBigInt', () => {
    it('returns the value for positive bigints', () => {
      expect(requirePositiveBigInt(1n, 'field')).toBe(1n)
      expect(requirePositiveBigInt(1000n, 'field')).toBe(1000n)
    })

    it('throws for zero', () => {
      expect(() => requirePositiveBigInt(0n, 'field')).toThrow('field must be a positive bigint')
    })

    it('throws for negative bigints', () => {
      expect(() => requirePositiveBigInt(-5n, 'field')).toThrow('field must be a positive bigint')
    })
  })

  describe('requireUint128', () => {
    const UINT128_MAX = (1n << 128n) - 1n

    it('accepts zero and values within uint128 range', () => {
      expect(requireUint128(0n, 'field')).toBe(0n)
      expect(requireUint128(UINT128_MAX, 'field')).toBe(UINT128_MAX)
      expect(requireUint128(100_000_000_000_000_000n, 'field')).toBe(100_000_000_000_000_000n)
    })

    it('throws when value exceeds uint128 max', () => {
      expect(() => requireUint128(UINT128_MAX + 1n, 'field')).toThrow(
        'field exceeds uint128 max value'
      )
    })

    it('throws for negative values', () => {
      expect(() => requireUint128(-1n, 'field')).toThrow('field must be a non-negative bigint')
    })
  })

  describe('ceilSqrt', () => {
    it('returns 0 for input 0', () => {
      expect(ceilSqrt(0n)).toBe(0n)
    })

    it('returns exact sqrt for perfect squares', () => {
      expect(ceilSqrt(1n)).toBe(1n)
      expect(ceilSqrt(4n)).toBe(2n)
      expect(ceilSqrt(9n)).toBe(3n)
      expect(ceilSqrt(100n)).toBe(10n)
      expect(ceilSqrt(10_000n)).toBe(100n)
    })

    it('returns ceil(sqrt) for non-perfect squares', () => {
      expect(ceilSqrt(2n)).toBe(2n) // sqrt(2) ≈ 1.41 → ceil = 2
      expect(ceilSqrt(3n)).toBe(2n) // sqrt(3) ≈ 1.73 → ceil = 2
      expect(ceilSqrt(5n)).toBe(3n) // sqrt(5) ≈ 2.24 → ceil = 3
      expect(ceilSqrt(8n)).toBe(3n) // sqrt(8) ≈ 2.83 → ceil = 3
      expect(ceilSqrt(10n)).toBe(4n) // sqrt(10) ≈ 3.16 → ceil = 4
      expect(ceilSqrt(99n)).toBe(10n) // sqrt(99) ≈ 9.95 → ceil = 10
    })
  })
})
