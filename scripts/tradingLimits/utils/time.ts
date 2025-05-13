import { format, formatDistance, fromUnixTime } from 'date-fns'

/**
 * Format the timestamp to absolute time
 *
 * @param timestamp - Unix timestamp (seconds)
 * @returns Formatted date/time string
 */
export function formatTimestamp(timestamp: number): string {
  try {
    return format(fromUnixTime(timestamp), 'MM/dd/yyyy, hh:mm:ss a')
  } catch (error) {
    console.error(`Error formatting timestamp: ${timestamp}`)
    return 'Invalid date'
  }
}

/**
 * Format a time difference in seconds to a human-readable relative format
 *
 * @param seconds - Seconds from now to format
 * @returns Human-readable relative time
 */
export function formatRelativeTime(seconds: number): string {
  if (seconds <= 0) {
    return 'Now'
  }

  const futureDate = new Date(Date.now() + seconds * 1000)
  return `in ${formatDistance(futureDate, new Date(), { addSuffix: false })}`
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
