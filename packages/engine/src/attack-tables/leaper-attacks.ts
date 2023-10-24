import { setBit, shiftLeft, shiftRight } from "../util/bitwise-operations";
import { Bitboard } from "../types";
import { Color, Files, Ranks, Squares } from "../constants";
import { getRankFile } from "../util/board-utils";

/**
 * Generates a bitboard with bits set for all squares that the pawn on the given square attacks
 * @param square
 * @param color
 * @returns
 */
export const maskPawnAttacks = (square: number, color: Color): Bitboard => {
  const pawnOccupancy = setBit(0n, square);
  let attacks = 0n;

  const { file, rank } = getRankFile(square);

  if (color === Color.White) {
    if (file !== Files.A && rank !== Ranks.Eight) {
      attacks |= shiftRight(pawnOccupancy, 9); // up right
    }
    if (file !== Files.H && rank !== Ranks.Eight) {
      attacks |= shiftRight(pawnOccupancy, 7); // up left
    }
  } else {
    if (file !== Files.H && rank !== Ranks.One) {
      attacks |= shiftLeft(pawnOccupancy, 9); // down right
    }
    if (file !== Files.A && rank !== Ranks.One) {
      attacks |= shiftLeft(pawnOccupancy, 7); // down left
    }
  }

  return attacks;
};

/**
 * Generates a bitboard with bits set for all squares that the king on the given square attacks
 * @param square
 * @returns
 */
export const maskKingAttacks = (square: number): Bitboard => {
  const kingOccupancy = setBit(0n, square);
  let attacks = 0n;

  const { file, rank } = getRankFile(square);

  // horizontal and vertical attacks
  if (rank !== Ranks.Eight) attacks |= shiftRight(kingOccupancy, 8); // up
  if (rank !== Ranks.One) attacks |= shiftLeft(kingOccupancy, 8); // down
  if (file !== Files.H) attacks |= shiftLeft(kingOccupancy, 1); // right
  if (file !== Files.A) attacks |= shiftRight(kingOccupancy, 1); // left

  // diagonal attacks
  if (rank !== Ranks.Eight && file !== Files.H)
    attacks |= shiftRight(kingOccupancy, 7); // up right
  if (rank !== Ranks.Eight && file !== Files.A)
    attacks |= shiftRight(kingOccupancy, 9); // up left
  if (rank !== Ranks.One && file !== Files.H)
    attacks |= shiftLeft(kingOccupancy, 9); // down right
  if (rank !== Ranks.One && file !== Files.A)
    attacks |= shiftLeft(kingOccupancy, 7); // down left

  return attacks;
};

/**
 * Generates a bitboard with bits set for all squares that the knight on the given square attacks
 * @param square
 * @returns
 */
export const maskKnightAttacks = (square: number): Bitboard => {
  const knightOccupancy = setBit(0n, square);
  let attacks = 0n;

  const { file, rank } = getRankFile(square);

  if (rank > Ranks.Seven && file !== Files.H)
    attacks |= shiftRight(knightOccupancy, 15); // up 2 right 1
  if (rank > Ranks.Seven && file !== Files.A)
    attacks |= shiftRight(knightOccupancy, 17); // up 2 left 1

  if (rank !== Ranks.Eight && file > Files.B)
    attacks |= shiftRight(knightOccupancy, 10); // up 1 left 2
  if (rank !== Ranks.Eight && file < Files.G)
    attacks |= shiftRight(knightOccupancy, 6); // up 1 right 2

  if (rank < Ranks.Two && file !== Files.A)
    attacks |= shiftLeft(knightOccupancy, 15); // down 2 left 1
  if (rank < Ranks.Two && file !== Files.H)
    attacks |= shiftLeft(knightOccupancy, 17); // down 2 right 1

  if (rank !== Ranks.One && file < Files.G)
    attacks |= shiftLeft(knightOccupancy, 10); // down 1 right 2
  if (rank !== Ranks.One && file > Files.B)
    attacks |= shiftLeft(knightOccupancy, 6); // down 1 left 2

  return attacks;
};

/**
 * Creates a pawn attack table for both colors
 * @returns
 */
export function initPawnAttackTable() {
  // Initialize two tables of 64 squares, one for each color
  const table: [Bitboard[], Bitboard[]] = [
    new Array(64).fill(0n),
    new Array(64).fill(0n),
  ];

  for (let square = 0; square <= Squares.H1; square++) {
    table[Color.White][square] = maskPawnAttacks(square, Color.White);
    table[Color.Black][square] = maskPawnAttacks(square, Color.Black);
  }

  return table;
}

/**
 * Creates a knight attack table
 */
export function initKnightAttackTable() {
  const table: Bitboard[] = new Array(64).fill(0n);
  for (let square = 0; square <= Squares.H1; square++) {
    table[square] = maskKnightAttacks(square);
  }

  return table;
}

/**
 * Creates a king attack table
 * @returns
 */
export function initKingAttackTable() {
  const table: Bitboard[] = new Array(64).fill(0n);
  for (let square = 0; square <= Squares.H1; square++) {
    table[square] = maskKingAttacks(square);
  }

  return table;
}
