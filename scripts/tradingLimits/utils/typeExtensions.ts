/**
 * TypeScript declaration extensions for global objects
 */

// FIXME: This workaround for Object.groupBy should be removable once the project updates to TypeScript 5.4+
// which includes built-in support for this method (see https://github.com/microsoft/TypeScript/pull/56805)
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
