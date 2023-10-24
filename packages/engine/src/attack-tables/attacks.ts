import { Color } from "../constants";
import { Bitboard, BitboardsByPiece } from "../types";
import { allPiecesBitboard } from "../util/board-utils";
import { and, countTruthy, or, shiftRight } from "../util/bitwise-operations";
import {
  initKingAttackTable,
  initKnightAttackTable,
  initPawnAttackTable,
} from "./leaper-attacks";
import {
  initBishopAttackMasks,
  initRookAttackMasks,
  initSliderAttacks,
} from "./slider-attacks";

import magics from "../../magics.json";

export const bishopMagicNumbers = magics.bishops.map(BigInt);
export const rookMagicNumbers = magics.rooks.map(BigInt);

export const bishopAttackMasks = initBishopAttackMasks();
export const rookAttackMasks = initRookAttackMasks();

export const pawnAttackTables = initPawnAttackTable();
export const knightAttackTable = initKnightAttackTable();
export const kingAttackTable = initKingAttackTable();

export const bishopAttackTable = initSliderAttacks(true);
export const rookAttackTable = initSliderAttacks(false);

function getSliderAttacks(
  square: number,
  board: Bitboard,
  bishop: boolean
): bigint {
  const magicNumber = bishop
    ? bishopMagicNumbers[square]
    : rookMagicNumbers[square];

  const attackMask = bishop
    ? bishopAttackMasks[square]
    : rookAttackMasks[square];

  const blockerConfiguration = and(board, attackMask);

  const relevantBits = countTruthy(
    bishop ? bishopAttackMasks[square] : rookAttackMasks[square]
  );

  const attackTable = bishop ? bishopAttackTable : rookAttackTable;

  const hashIndexMask = bishop ? 0x1ffn : 0xfffn;
  const hashIndex = and(
    shiftRight(blockerConfiguration * magicNumber, 64 - relevantBits),
    hashIndexMask
  );

  return attackTable[square][Number(hashIndex)];
}

export const getRookAttacks = (square: number, board: Bitboard) =>
  getSliderAttacks(square, board, false);

export const getBishopAttacks = (square: number, board: Bitboard) =>
  getSliderAttacks(square, board, true);

export const getQueenAttacks = (square: number, board: Bitboard) =>
  or(getRookAttacks(square, board), getBishopAttacks(square, board));

export const pawnsAttackingSquare = (
  square: number,
  color: Color,
  bitboards: BitboardsByPiece
) => and(pawnAttackTables[color ^ 1][square], bitboards.P[color]);

export const kingsAttackingSquare = (
  square: number,
  color: Color,
  bitboards: BitboardsByPiece
) => and(kingAttackTable[square], bitboards.K[color]);

export const knightsAttackingSquare = (
  square: number,
  color: Color,
  bitboards: BitboardsByPiece
) => and(knightAttackTable[square], bitboards.N[color]);

export const rooksAttackingSquare = (
  square: number,
  color: Color,
  bitboards: BitboardsByPiece
) =>
  and(getRookAttacks(square, allPiecesBitboard(bitboards)), bitboards.R[color]);

export const bishopsAttackingSquare = (
  square: number,
  color: Color,
  bitboards: BitboardsByPiece
) =>
  and(
    getBishopAttacks(square, allPiecesBitboard(bitboards)),
    bitboards.B[color]
  );

/**
 * Returns a bitboard with the position of all queens of the given color,
 * that are attacking the given square
 */
export const queensAttackingSquare = (
  square: number,
  color: Color,
  bitboards: BitboardsByPiece
) =>
  and(
    getQueenAttacks(square, allPiecesBitboard(bitboards)),
    bitboards.Q[color]
  );

/**
 * Returns true if the given square is attacked by the given color pieces
 */
export const isSquareAttacked = (
  square: number,
  color: Color,
  bitboards: BitboardsByPiece
) => {
  if (knightsAttackingSquare(square, color, bitboards)) return true;
  if (bishopsAttackingSquare(square, color, bitboards)) return true;
  if (queensAttackingSquare(square, color, bitboards)) return true;
  if (rooksAttackingSquare(square, color, bitboards)) return true;
  if (pawnsAttackingSquare(square, color, bitboards)) return true;
  if (kingsAttackingSquare(square, color, bitboards)) return true;

  return false;
};
