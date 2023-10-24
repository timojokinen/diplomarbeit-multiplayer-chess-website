import { DrawType, EndGameType, GameResult } from "./constants";

/**
 * Bitboard type
 * Javascript doesn't support 64 bit integers, so using BigInt instead
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
 */
export type Bitboard = bigint;

/**
 * String literal representing a chess piece
 *
 * P = Pawn
 * K = King
 * N = Knight
 * R = Rook
 * B = Bishop
 * Q = Queen
 */
export type PieceString = "P" | "K" | "N" | "R" | "B" | "Q";

/**
 * String literal representing a chess piece with color.
 *
 * Lowercase = Black
 * Uppercase = White
 */
export type ColoredPieceString = PieceString | Lowercase<PieceString>;

/**
 * Array of 64 squares (8x8 board), each square is either a piece string or null
 *
 * It's impractical to type the length of the array in typescript, so we just assume it's 64
 */
export type BoardSquares = Array<ColoredPieceString | null>;

/**
 * An object with two bitboards (one for each color) by piece type
 */
export type BitboardsByPiece = Record<PieceString, [Bitboard, Bitboard]>;

/**
 * An object encapsulating both the result of a game and the means of the result (checkmate, stalemate, etc.)
 */
export type GameOutcome = {
  result: GameResult;
  type: DrawType | EndGameType;
};
