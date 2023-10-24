import {
  bishopAttackMasks,
  bishopMagicNumbers,
  rookAttackMasks,
  rookMagicNumbers,
} from "./attacks";
import { countTruthy, shiftLeft } from "../util/bitwise-operations";
import { Bitboard } from "../types";
import { Files, Ranks, Squares } from "../constants";
import { getRankFile } from "../util/board-utils";
import { getSquareIndex } from "../util/board-utils";
import { generateOccupancyPermutation } from "../occupancy-permutation";

/**
 * Set all bits that the bishop on the given square attacks
 * except for the square itself and squares on the outer edges of the board.
 * The outer edges are excluded because the bishop cannot move past them.
 */
export function maskBishopAttacks(square: number): Bitboard {
  let attacks = 0n;

  let { rank, file } = getRankFile(square);

  for (let r = rank + 1, f = file + 1; r <= Ranks.Two && f <= Files.G; r++, f++)
    attacks |= shiftLeft(1n, getSquareIndex(r, f));
  for (
    let r = rank - 1, f = file + 1;
    r >= Ranks.Seven && f <= Files.G;
    r--, f++
  )
    attacks |= shiftLeft(1n, getSquareIndex(r, f));

  for (let r = rank + 1, f = file - 1; r <= Ranks.Two && f >= Files.B; r++, f--)
    attacks |= shiftLeft(1n, getSquareIndex(r, f));
  for (
    let r = rank - 1, f = file - 1;
    r >= Ranks.Seven && f >= Files.B;
    r--, f--
  )
    attacks |= shiftLeft(1n, getSquareIndex(r, f));

  return attacks;
}

/**
 * Set all bits that the rook on the given square attacks
 * incorporating the current occupancy of the board.
 * If a piece blocks the rook's path, the attack stops at that square.
 */
export function bishopAttacks(square: number, attackMask: Bitboard): Bitboard {
  let attacks = 0n;

  let { rank, file } = getRankFile(square);

  for (
    let r = rank + 1, f = file + 1;
    r <= Ranks.One && f <= Files.H;
    r++, f++
  ) {
    const attack = shiftLeft(1n, getSquareIndex(r, f));
    attacks |= attack;
    if (attackMask & attack) break;
  }

  for (
    let r = rank - 1, f = file + 1;
    r >= Ranks.Eight && f <= Files.H;
    r--, f++
  ) {
    const attack = shiftLeft(1n, getSquareIndex(r, f));
    attacks |= attack;
    if (attackMask & attack) break;
  }

  for (
    let r = rank + 1, f = file - 1;
    r <= Ranks.One && f >= Files.A;
    r++, f--
  ) {
    const attack = shiftLeft(1n, getSquareIndex(r, f));
    attacks |= attack;
    if (attackMask & attack) break;
  }

  for (
    let r = rank - 1, f = file - 1;
    r >= Ranks.Eight && f >= Files.A;
    r--, f--
  ) {
    const attack = shiftLeft(1n, getSquareIndex(r, f));
    attacks |= attack;
    if (attackMask & attack) break;
  }

  return attacks;
}

/**
 * Set all bits that the rook on the given square attacks
 * except for the square itself and squares on the outer edges of the board
 * The outer edges are excluded because the rook cannot move past them.
 * @param square
 * @returns
 */
export function maskRookAttacks(square: number): Bitboard {
  let attacks = 0n;
  let { rank, file } = getRankFile(square);

  // Set bits on the same rank except for the square itself
  for (let r = rank + 1; r <= Ranks.Two; r++)
    attacks |= shiftLeft(1n, getSquareIndex(r, file));
  for (let r = rank - 1; r >= Ranks.Seven; r--)
    attacks |= shiftLeft(1n, getSquareIndex(r, file));

  // Set bits on the same file except for the square itself
  for (let f = file + 1; f <= Ranks.Two; f++)
    attacks |= shiftLeft(1n, getSquareIndex(rank, f));
  for (let f = file - 1; f >= Ranks.Seven; f--)
    attacks |= shiftLeft(1n, getSquareIndex(rank, f));

  return attacks;
}

/**
 * Set all bits that the rook on the given square attacks
 * incorporating the current occupancy of the board.
 * If a piece blocks the rook's path, the attack stops at that square.
 */
export function rookAttacks(
  square: number,
  boardOccupancy: Bitboard
): Bitboard {
  let attacks = 0n;
  let { rank, file } = getRankFile(square);

  for (let r = rank + 1; r <= Ranks.One; r++) {
    const attack = shiftLeft(1n, getSquareIndex(r, file));
    attacks |= attack;
    if (boardOccupancy & attack) break;
  }
  for (let r = rank - 1; r >= Ranks.Eight; r--) {
    const attack = shiftLeft(1n, getSquareIndex(r, file));
    attacks |= attack;
    if (boardOccupancy & attack) break;
  }

  for (let f = file + 1; f <= Files.H; f++) {
    const attack = shiftLeft(1n, getSquareIndex(rank, f));
    attacks |= attack;
    if (boardOccupancy & attack) break;
  }
  for (let f = file - 1; f >= Files.A; f--) {
    const attack = shiftLeft(1n, getSquareIndex(rank, f));
    attacks |= attack;
    if (boardOccupancy & attack) break;
  }

  return attacks;
}

export function initBishopAttackMasks() {
  let bishopMasks: Bitboard[] = new Array(64).fill(0n);
  for (let square = 0; square <= Squares.H1; square++) {
    bishopMasks[square] = maskBishopAttacks(square);
  }

  return bishopMasks;
}

export function initRookAttackMasks() {
  let rookMasks: Bitboard[] = new Array(64).fill(0n);

  for (let square = 0; square <= Squares.H1; square++) {
    rookMasks[square] = maskRookAttacks(square);
  }

  return rookMasks;
}

export function initSliderAttacks(bishop: boolean) {
  const attackTable: bigint[][] = Array(64)
    .fill(null)
    .map(() => []);

  const hashIndexMask = bishop ? 0x1ffn : 0xfffn;

  for (let square = 0; square <= Squares.H1; square++) {
    const attackMask = bishop
      ? bishopAttackMasks[square]
      : rookAttackMasks[square];

    const relevantBits = countTruthy(attackMask);
    const attackCount = 1 << relevantBits;
    for (let i = 0; i < attackCount; i++) {
      const blockerConfiguration = generateOccupancyPermutation(i, relevantBits, attackMask);
      const hashIndex = Number(
        ((blockerConfiguration *
          (bishop ? bishopMagicNumbers[square] : rookMagicNumbers[square])) >>
          BigInt(64 - relevantBits)) &
          hashIndexMask
      );

      attackTable[square][hashIndex] = bishop
        ? bishopAttacks(square, blockerConfiguration)
        : rookAttacks(square, blockerConfiguration);
    }
  }

  return attackTable;
}
