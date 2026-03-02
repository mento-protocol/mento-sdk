import { parseAbi } from 'viem'

export const TROVE_NFT_ABI = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
]) as any
