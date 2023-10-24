import {
  Bitboard,
  BitboardsByPiece,
  BoardSquares,
  ColoredPieceString,
  PieceString,
} from "../types";
import { getBit, or, shiftLeft } from "./bitwise-operations";
import { CastlingAvailabily, Color, Squares } from "../constants";

/**
 * Parses the piece placement part of a FEN to boardsquares

* @param piecePlacement Example: rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR 
 * @returns 
 */
export const parsePiecePlacement = (piecePlacement: string) => {
  const rows = piecePlacement.split("/");

  let boardSquares: BoardSquares = [];

  for (let i = 0; i < rows.length; i++) {
    for (let char of rows[i]) {
      const num = parseInt(char);
      if (!isNaN(num)) {
        for (let j = 0; j < num; j++) {
          boardSquares.push(null);
        }
      } else {
        boardSquares.push(char as ColoredPieceString);
      }
    }
  }

  return boardSquares;
};

/**
 * Parses a chess position as Forsyth–Edwards Notation (FEN) and returns a board state
 *
 * @param fen Example: rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
 */
export const parseFEN = (fen: string) => {
  const parts = fen.split(" ");
  if (parts.length < 6) throw new Error("Invalid FEN string");

  const boardSquares = parsePiecePlacement(parts[0]);

  const activeColor = parts[1] === "w" ? Color.White : Color.Black;

  let castlingAvailability = 0b0000;
  if (parts[2].includes("K"))
    castlingAvailability |= CastlingAvailabily.WhiteKing;
  if (parts[2].includes("Q"))
    castlingAvailability |= CastlingAvailabily.WhiteQueen;
  if (parts[2].includes("k"))
    castlingAvailability |= CastlingAvailabily.BlackKing;
  if (parts[2].includes("q"))
    castlingAvailability |= CastlingAvailabily.BlackQueen;

  let enPassantSquare: number | null = null;

  if (parts[3] !== "-") {
    enPassantSquare = squareToIndex(parts[3]);
  }

  const halfMoveClock = parseInt(parts[4]);

  const fullMoveNumber = parseInt(parts[5]);

  return {
    boardSquares,
    activeColor,
    castlingAvailability,
    enPassantSquare,
    halfMoveClock,
    fullMoveNumber,
  };
};

export function boardSquaresToPiecePlacement(boardSquares: BoardSquares) {
  let piecePlacement = "";
  for (let rank = 0; rank < 8; rank++) {
    let emptyCount = 0;
    for (let file = 0; file < 8; file++) {
      const piece = boardSquares[rank * 8 + file];
      if (piece) {
        if (emptyCount > 0) {
          piecePlacement += emptyCount;
          emptyCount = 0;
        }
        piecePlacement += piece;
      } else {
        emptyCount++;
      }
    }
    if (emptyCount > 0) {
      piecePlacement += emptyCount;
    }
    if (rank < 7) {
      piecePlacement += "/";
    }
  }

  return piecePlacement;
}

export function boardStateToFEN(
  boardSquares: BoardSquares,
  activeColor: Color,
  castlingAvailability: number,
  enPassantSquare: number | null,
  halfMoveClock: number,
  fullMoveNumber: number
) {
  let fen: string = "";

  // 1. Piece placement
  fen += boardSquaresToPiecePlacement(boardSquares);

  // 2. Active color
  fen += ` ${activeColor ? "b" : "w"} `;

  // 3. Castling availability
  const castlingChars = ["K", "Q", "k", "q"];
  let castlingStr = "";
  for (let i = 0; i < 4; i++) {
    if ((castlingAvailability & (1 << i)) !== 0) {
      castlingStr += castlingChars[i];
    }
  }
  fen += castlingStr || "-";

  // 4. En passant target square
  if (enPassantSquare !== null) {
    const file = enPassantSquare % 8;
    const rank = Math.floor(enPassantSquare / 8);
    const files = "abcdefgh";
    fen += ` ${files[file]}${8 - rank}`;
  } else {
    fen += " -";
  }

  // 5. Halfmove clock
  fen += ` ${halfMoveClock}`;

  // 6. Fullmove number
  fen += ` ${fullMoveNumber}`;

  return fen;
}

/**
 * Returns a bitboard with the bits set for the rank of the given square
 * @param square
 */
export const rankMaskForSquare = (square: number) =>
  0xffn << BigInt(square & ~7);

/**
 * Returns a bitboard with the bits set for the file of the given square
 * @param square
 */
export const fileMaskForSquare = (square: number) =>
  0x0101010101010101n << BigInt(square & 7);

/**
 * Determines if a square is occupied by any piece
 * @param square
 * @param bitboards
 * @returns
 */
export function isSquareOccupied(square: number, bitboards: BitboardsByPiece) {
  let bb = allPiecesBitboard(bitboards);
  return getBit(bb, square) === 1n;
}

/**
 * Combines all bitboards into one
 * @param bitboards All bitboards
 * @param color (Optional) Limit to a specific color
 */
export function allPiecesBitboard(
  bitboards: BitboardsByPiece,
  color?: Color
): Bitboard {
  if (typeof color === "undefined")
    return or(
      allPiecesBitboard(bitboards, Color.White),
      allPiecesBitboard(bitboards, Color.Black)
    );

  return (
    bitboards.P[color] |
    bitboards.N[color] |
    bitboards.B[color] |
    bitboards.R[color] |
    bitboards.Q[color] |
    bitboards.K[color]
  );
}

/**
 * Generates bitboards for all pieces
 * @param boardSquares Board representation
 */
export function generatePieceBitboards(
  boardSquares: BoardSquares
): BitboardsByPiece {
  const pieces: PieceString[] = ["P", "N", "B", "R", "Q", "K"];

  const bitboardsByPiece = pieces.reduce((acc, piece) => {
    const lowerCasePiece = piece.toLowerCase() as PieceString;
    acc[piece] = [
      bitboardForPiece(boardSquares, piece),
      bitboardForPiece(boardSquares, lowerCasePiece),
    ];
    return acc;
  }, {} as BitboardsByPiece);

  return bitboardsByPiece;
}

/**
 * Generates a bitboard for a given piece
 * @param boardSquares
 * @param piece
 * @returns
 */
export const bitboardForPiece = (
  boardSquares: BoardSquares,
  piece: ColoredPieceString
): Bitboard => {
  let bitboard = 0n;

  for (let i = 0; i < boardSquares.length; i++) {
    if (boardSquares[i] === piece) {
      bitboard |= shiftLeft(1n, i);
    }
  }
  return bitboard;
};

/**
 * Helper function that returns if a pawn is on the rank before promotion
 * @param square
 * @param color
 */
export const isPawnOnPromotionRank = (square: number, color: Color) => {
  if (color === Color.White) {
    return square >= Squares.A7 && square <= Squares.H7;
  } else {
    return square >= Squares.A2 && square <= Squares.H2;
  }
};

/**
 * Helper function that returns if a pawn is on its starting square
 * @param square
 * @param color
 * @returns
 */
export const isPawnOnStartingRank = (square: number, color: Color) => {
  if (color === Color.White) {
    return square >= Squares.A2 && square <= Squares.H2;
  } else {
    return square >= Squares.A7 && square <= Squares.H7;
  }
};

/**
 * Returns the index of the square for a given rank and file
 * Does not map to a real chess board since the least significant bit is the a8 square (upside down)
 *
 * Algorithm: https://www.chessprogramming.org/Squares
 * @param rank
 * @param file
 */
export const getSquareIndex = (rank: number, file: number) => {
  return (rank << 3) + file;
};

/**
 * Turns a square notation e.g. e4 to an index in the 64 entries board array
 * @param square
 * @returns
 */
export const squareToIndex = (square: string): number => {
  const file = square[0].charCodeAt(0) - "a".charCodeAt(0);
  const rank = 8 - parseInt(square[1]);

  return getSquareIndex(rank, file);
};

/**
 * Returns rank and file index for a given square
 * Does not map to a real chess board since the least significant bit is the a8 square (upside down)
 *
 * Example: Square: 0 (A8) => Rank: 0, File: 0
 * Algorithm: https://www.chessprogramming.org/Squares
 *
 * @param square
 * @returns
 */
export const getRankFile = (square: number): { rank: number; file: number } => {
  const rank = square >> 3;
  const file = square & 7;

  return { rank, file };
};

/**
 * Returns the color of a square
 * @param square
 */
export const getSquareColor = (square: number) => {
  const { rank, file } = getRankFile(square);
  return (rank + file) % 2;
};
