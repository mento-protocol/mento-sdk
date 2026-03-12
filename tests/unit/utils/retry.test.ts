import { retryOperation } from '../../../src/utils/retry'

describe('retryOperation()', () => {
  it('returns result immediately on first-try success', async () => {
    const operation = jest.fn().mockResolvedValue('ok')

    const result = await retryOperation(operation)

    expect(result).toBe('ok')
    expect(operation).toHaveBeenCalledTimes(1)
  })

  it('retries on transient failure and returns result on eventual success', async () => {
    const operation = jest
      .fn()
      .mockRejectedValueOnce(new Error('transient'))
      .mockRejectedValueOnce(new Error('transient'))
      .mockResolvedValue('recovered')

    const result = await retryOperation(operation, { maxAttempts: 3, initialDelayMs: 0 })

    expect(result).toBe('recovered')
    expect(operation).toHaveBeenCalledTimes(3)
  })

  it('throws after exhausting all retries', async () => {
    const operation = jest.fn().mockRejectedValue(new Error('always fails'))

    await expect(
      retryOperation(operation, { maxAttempts: 3, initialDelayMs: 0 })
    ).rejects.toThrow('Operation failed after 3 attempts: always fails')

    expect(operation).toHaveBeenCalledTimes(3)
  })

  it('uses default maxAttempts of 3 when not specified', async () => {
    const operation = jest.fn().mockRejectedValue(new Error('fail'))

    await expect(
      retryOperation(operation, { initialDelayMs: 0 })
    ).rejects.toThrow('Operation failed after 3 attempts')

    expect(operation).toHaveBeenCalledTimes(3)
  })

  it('respects custom maxAttempts', async () => {
    const operation = jest.fn().mockRejectedValue(new Error('fail'))

    await expect(
      retryOperation(operation, { maxAttempts: 5, initialDelayMs: 0 })
    ).rejects.toThrow('Operation failed after 5 attempts')

    expect(operation).toHaveBeenCalledTimes(5)
  })

  it('succeeds with maxAttempts of 1 when operation succeeds on first try', async () => {
    const operation = jest.fn().mockResolvedValue('done')

    const result = await retryOperation(operation, { maxAttempts: 1 })

    expect(result).toBe('done')
    expect(operation).toHaveBeenCalledTimes(1)
  })

  it('throws immediately with maxAttempts of 1 when operation fails', async () => {
    const operation = jest.fn().mockRejectedValue(new Error('immediate fail'))

    await expect(
      retryOperation(operation, { maxAttempts: 1, initialDelayMs: 0 })
    ).rejects.toThrow('Operation failed after 1 attempts: immediate fail')

    expect(operation).toHaveBeenCalledTimes(1)
  })

  it('error message includes the last error message when all retries exhausted', async () => {
    const operation = jest
      .fn()
      .mockRejectedValueOnce(new Error('first error'))
      .mockRejectedValueOnce(new Error('second error'))
      .mockRejectedValue(new Error('last error'))

    await expect(
      retryOperation(operation, { maxAttempts: 3, initialDelayMs: 0 })
    ).rejects.toThrow('last error')
  })

  it('returns a typed result', async () => {
    const operation = jest.fn().mockResolvedValue(42)

    const result = await retryOperation<number>(operation, { maxAttempts: 1 })

    expect(typeof result).toBe('number')
    expect(result).toBe(42)
  })

  describe('exponential backoff timing', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('applies exponential backoff between attempts', async () => {
      // attempt 1 fails → delay = 1000 * 1 = 1000ms
      // attempt 2 fails → delay = 1000 * 2 = 2000ms
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('fail1'))
        .mockRejectedValueOnce(new Error('fail2'))
        .mockResolvedValue('ok')

      const promise = retryOperation(operation, { maxAttempts: 3, initialDelayMs: 1000 })

      // Advancing 999ms should not yet trigger the second attempt
      await jest.advanceTimersByTimeAsync(999)
      expect(operation).toHaveBeenCalledTimes(1)

      // Crossing 1000ms triggers second attempt
      await jest.advanceTimersByTimeAsync(1)
      expect(operation).toHaveBeenCalledTimes(2)

      // Advancing another 1999ms should not yet trigger third attempt (needs 2000ms)
      await jest.advanceTimersByTimeAsync(1999)
      expect(operation).toHaveBeenCalledTimes(2)

      // Crossing 2000ms triggers third attempt
      await jest.advanceTimersByTimeAsync(1)
      const result = await promise
      expect(result).toBe('ok')
      expect(operation).toHaveBeenCalledTimes(3)
    })

    it('does not wait after the final failed attempt', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('always fails'))

      // With maxAttempts=2: attempt 1 fails, waits delayMs*1, attempt 2 fails, throws immediately
      const rejected = retryOperation(operation, { maxAttempts: 2, initialDelayMs: 1000 })
        .then(() => false)
        .catch(() => true)

      // After first failure, advance past the delay for second attempt
      await jest.advanceTimersByTimeAsync(1000)

      // No more timers should be pending (no delay after final attempt)
      expect(jest.getTimerCount()).toBe(0)
      expect(await rejected).toBe(true)
      expect(operation).toHaveBeenCalledTimes(2)
    })
  })
})
