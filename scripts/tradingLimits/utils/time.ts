/**
 * Format the timestamp to absolute time using Intl.DateTimeFormat
 *
 * @param timestamp - Unix timestamp (seconds)
 * @returns Formatted date/time string
 */
export function formatTimestamp(timestamp: number): string {
  try {
    const date = new Date(timestamp * 1000)

    // Use Intl.DateTimeFormat for consistent date/time formatting
    const formatter = new Intl.DateTimeFormat('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })

    return formatter.format(date)
  } catch (error) {
    console.error(`Error formatting timestamp: ${timestamp}`)
    return 'Invalid date'
  }
}

/**
 * Format a time difference in seconds to a human-readable relative format
 * using the Intl.RelativeTimeFormat API
 *
 * @param seconds - Seconds from now to format
 * @returns Human-readable relative time
 */
export function formatRelativeTime(seconds: number): string {
  if (seconds <= 0) {
    return 'Now'
  }

  // Create formatter with numeric style for brevity
  const formatter = new Intl.RelativeTimeFormat('en', {
    style: 'long',
    numeric: 'always',
  })

  // Convert seconds to the appropriate unit
  const units: [string, number][] = [
    ['year', 60 * 60 * 24 * 365],
    ['month', 60 * 60 * 24 * 30],
    ['week', 60 * 60 * 24 * 7],
    ['day', 60 * 60 * 24],
    ['hour', 60 * 60],
    ['minute', 60],
    ['second', 1],
  ]

  // Find the first appropriate unit
  for (const [unit, secondsInUnit] of units) {
    if (seconds >= secondsInUnit || unit === 'second') {
      const value = Math.round(seconds / secondsInUnit)

      return formatter.format(value, unit as Intl.RelativeTimeFormatUnit)
    }
  }

  // Fallback (shouldn't reach here)
  return `in ${seconds}s`
}

/**
 * Format a timeframe in seconds to a human-readable format
 *
 * @param seconds - Timeframe in seconds
 * @returns Human-readable timeframe string
 */
export function formatTimeframe(seconds: number): string {
  if (!seconds) return '—'

  const minutes = seconds / 60
  const hours = minutes / 60
  const days = hours / 24

  if (seconds < 60) {
    return `${seconds}s`
  } else if (minutes < 60) {
    return `${Math.round(minutes)}m`
  } else if (hours < 24) {
    return `${Math.round(hours)}h`
  } else {
    return `${Math.round(days)}d`
  }
}
