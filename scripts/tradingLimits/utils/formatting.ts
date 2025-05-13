import chalk from 'chalk'

/**
 * Format number for display (add commas, limit decimal places)
 *
 * @param num - Number to format
 * @returns Formatted string
 */
export function formatNumber(num: number): string {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

/**
 * Format netflow value with color based on netflow sign
 *
 * @param value - Netflow value to format
 * @returns Colored string representation
 */
export function formatNetflow(value: number): string {
  if (value > 0) {
    return chalk.green(value.toLocaleString())
  } else if (value < 0) {
    return chalk.red(value.toLocaleString())
  } else {
    return '0'
  }
}

/**
 * Format utilization percentage with color based on percentage
 *
 * @param percentage - Utilization percentage to format
 * @returns Formatted string with visual bar and colored percentage
 */
export function formatUtilizationPercentage(percentage: number): string {
  const barWidth = 10 // Number of characters in the bar
  const filledCount = Math.round((percentage / 100) * barWidth)
  const emptyCount = barWidth - filledCount

  // Create a visual bar representing the utilization
  let bar = ''

  // Filled portion of the bar
  if (filledCount > 0) {
    if (percentage >= 50) {
      bar += chalk.red('■'.repeat(filledCount))
    } else if (percentage >= 25) {
      bar += chalk.yellow('■'.repeat(filledCount))
    } else {
      bar += chalk.green('■'.repeat(filledCount))
    }
  }

  // Empty portion of the bar
  if (emptyCount > 0) {
    bar += chalk.gray('□'.repeat(emptyCount))
  }

  // Add percentage after the bar
  if (percentage >= 50) {
    return `${bar} ${chalk.red(`${percentage.toFixed(1)}%`)}`
  } else if (percentage >= 25) {
    return `${bar} ${chalk.yellow(`${percentage.toFixed(1)}%`)}`
  } else {
    return `${bar} ${chalk.green(`${percentage.toFixed(1)}%`)}`
  }
}

/**
 * Returns color-coded text for the given blocked percentage
 *
 * @param percentage - The percentage of blocked limits
 * @returns Color-coded string representation
 */
export function getBlockedPercentageColor(percentage: number): string {
  if (percentage >= 50) return chalk.red(`${percentage.toFixed(1)}%`)
  if (percentage >= 25) return chalk.yellow(`${percentage.toFixed(1)}%`)
  return chalk.green(`${percentage.toFixed(1)}%`)
}
