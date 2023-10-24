import {
  clearBit, lsbIndex,
  shiftLeft
} from "./util/bitwise-operations";

/**
 * Sets the occupancy of a bitboard based on the given index, number of bits in the mask, and attack mask.
 * This function is used to generate all possible permutations of occupancies for a given attack mask.
 *
 * @param index - The index of the current permutation.
 * @param bitsInMask - The number of bits in the attack mask.
 * @param attackMask - The attack mask bitboard.
 * @returns A bitboard representing a specific permutation of possible occupancies for the given attack mask.
 */

export function generateOccupancyPermutation(
  index: number,
  bitsInMask: number,
  attackMask: bigint
): bigint {
  // Initialize the occupancy bitboard as an empty board.
  let occupancy = 0n;

  // Iterate over each bit within the attack mask.
  for (let count = 0; count < bitsInMask; count++) {
    // Find the index of the least significant bit in the attack mask.
    let square = lsbIndex(attackMask);

    // Remove the found bit from the attack mask.
    attackMask = clearBit(attackMask, square);

    // If the bit at the current index is set, add it to the occupancy bitboard.
    if (index & (1 << count)) {
      occupancy |= shiftLeft(1n, square);
    }
  }

  // Return the final occupancy bitboard that represents a specific permutation of possible occupancies for the given attack mask.
  return occupancy;
}
