import { Bitboard, BoardSquares, ColoredPieceString } from "../types";
import { getSquareIndex } from "./board-utils";
import { getBit } from "./bitwise-operations";

/**
 * Prints a board to the console for debugging purposes
 * @param board
 */
export const printBoard = (board: BoardSquares) => {
  const asciiPieces: Record<ColoredPieceString, string> = {
    r: "♜",
    n: "♞",
    b: "♝",
    q: "♛",
    k: "♚",
    p: "♟",
    R: "♖",
    N: "♘",
    B: "♗",
    Q: "♕",
    K: "♔",
    P: "♙",
  };

  for (let rank = 0; rank < 8; rank++) {
    let rankBits: any[] = [8 - rank + " "];
    for (let file = 0; file < 8; file++) {
      const square = rank * 8 + file;
      if (board[square] === null) {
        rankBits.push("·");
      } else {
        rankBits.push(asciiPieces[board[square] as ColoredPieceString]);
      }
    }
    console.log(rankBits.join(" "));
  }

  console.log("\n   A B C D E F G H \n\n");
};

/**
 * Prints a bitboard to the console for debugging purposes
 * @param bitboard
 * @param markSquare - optional square to mark with an asterisk
 * @returns void
 */
export const printBitboard = (bitboard: Bitboard, markSquare?: number) => {
  for (let rank = 0; rank < 8; rank++) {
    let rankBits: any[] = [8 - rank + " "];
    for (let file = 0; file < 8; file++) {
      if (
        markSquare !== undefined &&
        getSquareIndex(rank, file) === markSquare
      ) {
        rankBits.push("*");
      } else {
        const square = rank * 8 + file;
        rankBits.push(Number(getBit(bitboard, square)));
      }
    }
    console.log(rankBits.join(" "));
  }

  console.log("\n   A B C D E F G H \n\n");
};

export const benchmark = () => {
  const time = process.hrtime();

  return () => {
    const diff = process.hrtime(time);
    return diff[0] * 1000 + diff[1] / 1000000;
  };
};
