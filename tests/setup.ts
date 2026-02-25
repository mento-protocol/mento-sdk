import { config } from 'dotenv'
config()

// BigInt serialization support for Jest worker communication
;(BigInt.prototype as any).toJSON = function () {
  return this.toString()
}
