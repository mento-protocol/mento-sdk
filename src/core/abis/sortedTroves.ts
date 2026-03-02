import { parseAbi } from 'viem'

export const SORTED_TROVES_ABI = parseAbi([
  'function findInsertPosition(uint256 _annualInterestRate, uint256 _prevId, uint256 _nextId) view returns (uint256, uint256)',
  'function getSize() view returns (uint256)',
  'function getFirst() view returns (uint256)',
  'function getLast() view returns (uint256)',
  'function getNext(uint256 _id) view returns (uint256)',
  'function getPrev(uint256 _id) view returns (uint256)',
  'function contains(uint256 _id) view returns (bool)',
  'function isEmpty() view returns (bool)',
]) as any
