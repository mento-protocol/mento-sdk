import { ethers } from "ethers";


export function toRateFeedId(rateFeed: string): string {
  // 1. Calculate keccak256 hash
  const hashedBytes = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(rateFeed))

  // 2. Convert to BigInt (equivalent to uint256)
  const hashAsBigInt = BigInt(hashedBytes);

  // 3. Mask to 160 bits (equivalent to uint160)
  const maskedToUint160 = hashAsBigInt & ((1n << 160n) - 1n);

  // 4. Convert to address (hex string)
  const addressHex = "0x" + maskedToUint160.toString(16).padStart(40, "0");

  // 5. Return calculated rate feed ID
  return addressHex;
}
