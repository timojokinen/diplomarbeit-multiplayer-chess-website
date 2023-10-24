import { Bitboard } from "../types";

/**
 * Set bit at given index to 1
 * @param bitboard
 * @param index
 * @returns
 */
export const setBit = (bitboard: Bitboard, index: number) => {
  return bitboard | (1n << BigInt(index));
};

export const getBit = (bitboard: Bitboard, index: number) =>
  (bitboard >> BigInt(index)) & 1n;

export const clearBit = (bitboard: Bitboard, index: number) =>
  bitboard & ~(1n << BigInt(index));

export const or = (bitboard1: Bitboard, bitboard2: Bitboard) =>
  bitboard1 | bitboard2;

export const and = (...bitboards: Bitboard[]) =>
  bitboards.reduce((acc, bitboard) => acc & bitboard, ~0n);

export const xor = (bitboard1: Bitboard, bitboard2: Bitboard) =>
  bitboard1 ^ bitboard2;

export const not = (bitboard: Bitboard) => ~bitboard;

export const shiftLeft = (bitboard: Bitboard, shift: number) =>
  bitboard << BigInt(shift);

export const shiftRight = (bitboard: Bitboard, shift: number) =>
  bitboard >> BigInt(shift);

// Counts the number of bits set to 1 in the given bitboard.
export const countTruthy = (bitboard: Bitboard) =>
  bitboard.toString(2).split("1").length - 1;

export function popBit(bitboard: bigint, bit: number): bigint {
  return (bitboard &= ~(1n << BigInt(bit)));
}

/**
 * Calculate the least significant bit
 */
export const lsb = (bitboard: Bitboard) => bitboard & -bitboard;

/**
 * Get the index of the least significant bit
 */
export const lsbIndex = (bitboard: Bitboard) =>
  Math.log2(Number(lsb(bitboard)));
