import { TradingMode } from './tradingMode'

describe('TradingMode enum', () => {
  it('should have BIDIRECTIONAL mode with value 0', () => {
    expect(TradingMode.BIDIRECTIONAL).toBe(0)
  })

  it('should have HALTED mode with value 1', () => {
    expect(TradingMode.HALTED).toBe(1)
  })

  it('should have DISABLED mode with value 2', () => {
    expect(TradingMode.DISABLED).toBe(2)
  })

  it('should allow type-safe usage', () => {
    const checkMode = (mode: TradingMode): boolean => {
      return mode === TradingMode.BIDIRECTIONAL
    }

    expect(checkMode(TradingMode.BIDIRECTIONAL)).toBe(true)
    expect(checkMode(TradingMode.HALTED)).toBe(false)
  })
})

