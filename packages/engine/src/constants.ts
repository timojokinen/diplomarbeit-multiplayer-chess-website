/**
 * The standard initial position of a game of chess, represented in Forsyth-Edwards Notation (FEN).
 */
export const STARTING_FEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

/**
 * Enum representing the 64 squares of a chess board.
 * The squares are ordered from top left (A8) to bottom right (H1) as viewed from White's perspective.
 */
// prettier-ignore
export enum Squares {
  A8, B8, C8, D8, E8, F8, G8, H8,
  A7, B7, C7, D7, E7, F7, G7, H7,
  A6, B6, C6, D6, E6, F6, G6, H6,
  A5, B5, C5, D5, E5, F5, G5, H5,
  A4, B4, C4, D4, E4, F4, G4, H4,
  A3, B3, C3, D3, E3, F3, G3, H3,
  A2, B2, C2, D2, E2, F2, G2, H2,
  A1, B1, C1, D1, E1, F1, G1, H1,
}

/**
 * Enum representing the eight files of a chessboard
 */
// prettier-ignore
export const enum Files {
  A, B, C, D, E, F ,G, H
}

/**
 * Enum representing the eight ranks of a chessboard
 * Starting at 8 as viewed from White's perspective.
 */
// prettier-ignore
export enum Ranks {
  Eight, Seven, Six, Five, Four, Three, Two, One
}

/**
 * Enum representing piece colors.
 * 0 => White, 1 => Black
 */
export enum Color {
  White, // 0
  Black, // 1
}

export enum GameResult {
  InProgress = "in_progress",
  WhiteWins = "white_wins",
  BlackWins = "black_wins",
  Draw = "draw",
}

export enum DrawType {
  Agreement = "agreement",
  Stalemate = "stalemate",
  DeadPosition = "dead_position",
  FiftyMoveRule = "fifty_move_rule",
  ThreefoldRepetition = "threefold_repetition",
}

export enum EndGameType {
  Resignation = "resignation",
  Timeout = "timeout",
  Abandonment = "abandonment",
  Checkmate = "checkmate",
}

/**
 * Binary numbers representing castling availability
 */
export const CastlingAvailabily = {
  WhiteKing: 0b1000,
  WhiteQueen: 0b0100,
  BlackKing: 0b0010,
  BlackQueen: 0b0001,
} as const;
