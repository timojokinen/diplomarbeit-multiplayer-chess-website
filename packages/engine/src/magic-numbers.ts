import {
  bishopAttacks,
  maskBishopAttacks,
  maskRookAttacks,
  rookAttacks,
} from "./attack-tables/slider-attacks";
import { generateOccupancyPermutation } from "./occupancy-permutation";
import { Bitboard } from "./types";
import {
  countTruthy,
} from "./util/bitwise-operations";
import { random64 } from "./util/rng";

/**
 * Generates a candidate for a magic number.
 * Magic numbers are used in bitboards to calculate sliding piece attacks.
 * The function generates a random 64-bit integer and performs a bitwise AND operation with another random 64-bit integer.
 */
function generateMagicNumberCandidate(): bigint {
  return random64() & random64();
}

/**
 * Finds a magic number for a given square and piece type (bishop or rook).
 * Magic numbers are used in bitboards to calculate sliding piece attacks.
 * The function generates all possible permutations of occupancies for a given attack mask,
 * then attempts to find a magic number that can be used to index into a table of attack bitboards.
 */
export function findMagicNumber(square: number, bishop: boolean): bigint {
  let blockerConfigurations: Bitboard[] = [];
  let attacks: Bitboard[] = [];

  // Determine the attack mask based on the piece type.
  const attackMask: Bitboard = bishop
    ? maskBishopAttacks(square)
    : maskRookAttacks(square);

  // Determine the hash index mask based on the piece type.
  const hashIndexMask = bishop ? 0x1ffn : 0xfffn;

  // Count the number of bits set in the attack mask.
  const relevantBits = countTruthy(attackMask);

  // Calculate the number of possible permutations of occupancies for the given attack mask.
  const occupancyVariationsCount = 1 << relevantBits; // 2 ^ relevantBits

  // Generate all possible permutations of occupancies and their corresponding attack bitboards.
  for (let index = 0; index < occupancyVariationsCount; index++) {
    const occupancy = generateOccupancyPermutation(index, relevantBits, attackMask);
    blockerConfigurations[index] = occupancy;
    attacks[index] = bishop
      ? bishopAttacks(square, occupancy)
      : rookAttacks(square, occupancy);
  }

  // Attempt to find a magic number.
  for (let attempt = 0; attempt < 10000000; attempt++) {
    const magicCandidate = generateMagicNumberCandidate();
    let usedAttacks: Bitboard[] = [];

    // Skip this candidate if it does not have at least 6 bits set in the upper 8 bytes.
    if (countTruthy((attackMask * magicCandidate) & 0xff00000000000000n) < 6) {
      continue;
    }

    let fail: boolean = false;
    // Test the magic candidate against all possible occupancies.
    for (let index = 0; index < occupancyVariationsCount; index++) {
      const hashIndex = Number(
        ((blockerConfigurations[index] * magicCandidate) >>
          BigInt(64 - relevantBits)) &
          hashIndexMask
      );

      // If this hash index has not been used yet, store the attack bitboard.
      if (usedAttacks[hashIndex] === undefined) {
        usedAttacks[hashIndex] = attacks[index];
      } else if (usedAttacks[hashIndex] != attacks[index]) {
        // If this hash index has been used and the stored attack bitboard does not match the current one, this candidate fails.
        fail = true;
        break;
      }
    }

    // If the candidate passed all tests, return it as the magic number.
    if (!fail) {
      return magicCandidate;
    }
  }

  // If no magic number was found after 10,000,000 attempts, return 0n.
  return 0n;
}
