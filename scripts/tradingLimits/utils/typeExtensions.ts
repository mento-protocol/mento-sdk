/**
 * TypeScript declaration extensions for global objects
 */

// FIXME: This workaround should not be necessary much longer as native groupBy support should be in latest TS already
// https://github.com/microsoft/TypeScript/pull/56805
declare global {
  interface ObjectConstructor {
    groupBy<T, K extends PropertyKey>(
      items: Iterable<T>,
      keySelector: (item: T) => K
    ): Record<K, T[]>
  }
}

// This export is necessary to make the file a module
export {}
