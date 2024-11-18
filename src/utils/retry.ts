export interface RetryOptions {
  maxAttempts?: number
  initialDelayMs?: number
}

export async function retryOperation<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3
  const delayMs = options.initialDelayMs ?? 1000
  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      if (attempt === maxAttempts) break

      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt))
    }
  }

  throw new Error(
    `Operation failed after ${maxAttempts} attempts: ${lastError?.message}`
  )
}
