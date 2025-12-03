/**
 * Base error class for all Mento SDK errors.
 * Provides consistent error naming and proper prototype chain setup.
 */
export class MentoError extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
    // Maintains proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
