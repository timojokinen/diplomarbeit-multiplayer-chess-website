import {
  bishopsAttackingSquare,
  knightsAttackingSquare,
  pawnsAttackingSquare,
  queensAttackingSquare,
  rooksAttackingSquare,
} from "./attack-tables/attacks";
import { Color, Squares } from "./constants";
import { BitboardsByPiece, ColoredPieceString, PieceString } from "./types";
import { getRankFile } from "./util/board-utils";
import { countTruthy } from "./util/bitwise-operations";
import { fileMaskForSquare, rankMaskForSquare } from "./util/board-utils";

/**
 * The Move class represents a move in a chess game.
 *
 * Each instance of the Move class represents a single move, and includes information about:
 * - The piece that is moving (piece)
 * - The square the piece is moving from (sourceSquare)
 * - The square the piece is moving to (targetSquare)
 * - Whether the move is a capture (capture)
 * - Whether the move is a double pawn push (doublePawnPush), which is relevant for en passant
 * - Whether the move is an en passant capture (enPassant)
 * - Whether the move is a castling move (castling)
 * - The piece that the pawn is promoted to, if applicable (promotionPiece)
 *
 */

export class Move {
  constructor(
    public bitboards: BitboardsByPiece,
    public sourceSquare: number,
    public targetSquare: number,
    public piece: ColoredPieceString,
    public promotionPiece: PieceString | null = null,
    public capture: boolean = false,
    public doublePawnPush: boolean = false,
    public enPassant: boolean = false,
    public castling: boolean = false
  ) {}

  private isKingSideCastle(): boolean {
    return (
      this.castling &&
      (this.targetSquare === Squares.G1 || this.targetSquare === Squares.G8)
    );
  }

  private isQueenSideCastle(): boolean {
    return (
      this.castling &&
      (this.targetSquare === Squares.C1 || this.targetSquare === Squares.C8)
    );
  }

  /**
   * This function is used to get the disambiguation for a move in a chess game.
   * Disambiguation is necessary when more than one piece of the same type can move to the same square.
   * In such cases, the disambiguation helps to identify which piece is actually moving.
   * The disambiguation is either the file (if they differ), rank (if they differ), or both.
   */
  private getDisambiguation(): string {
    let disambiguation = "";

    // Get the source square's file and rank
    const source = getRankFile(this.sourceSquare);
    const sourceFile = String.fromCharCode(97 + source.file);
    const sourceRank = 8 - source.rank;

    // Determine the color of the piece
    const color =
      this.piece.toUpperCase() === this.piece ? Color.White : Color.Black;

    // Get the rank and file masks for the source square
    const rankMask = rankMaskForSquare(this.sourceSquare);
    const fileMask = fileMaskForSquare(this.sourceSquare);

    // Map of pieces and their corresponding attacking square functions
    const squareAttackersByPiece = new Map([
      ["B", bishopsAttackingSquare],
      ["N", knightsAttackingSquare],
      ["Q", queensAttackingSquare],
      ["R", rooksAttackingSquare],
    ]);

    // If the piece is a pawn and it captures, check for disambiguation
    if (this.piece.toUpperCase() === "P" && this.capture) {
      const squareAttackers = pawnsAttackingSquare(
        this.targetSquare,
        color,
        this.bitboards
      );
      if (countTruthy(squareAttackers) >= 1) {
        disambiguation = sourceFile.toString();
      }
    } else if (["N", "B", "R", "Q"].includes(this.piece.toUpperCase())) {
      // If the piece is a knight, bishop, rook, or queen, check for disambiguation
      const squareAttackers = squareAttackersByPiece.get(
        this.piece.toUpperCase()
      )!(this.targetSquare, color, this.bitboards);

      const attackersCount = countTruthy(squareAttackers);
      const sameFileAttackerCount = countTruthy(squareAttackers & fileMask);
      const sameRankAttackerCount = countTruthy(squareAttackers & rankMask);

      if (attackersCount > 1) {
        if (sameFileAttackerCount === 1 && sameRankAttackerCount === 1) {
          disambiguation = sourceFile.toString();
        } else {
          // If there are multiple attackers on the same file or rank
          // add the source file or rank to the disambiguation
          if (sameRankAttackerCount > 1) {
            disambiguation += sourceFile;
          }
          if (sameFileAttackerCount > 1) {
            disambiguation += sourceRank;
          }
        }
      }
    }

    return disambiguation;
  }

  /**
   * This function is used to convert the move to a string representation.
   * The string representation follows the standard algebraic notation (SAN) used in chess.
   * Castling moves are represented as "O-O" for king-side castling and "O-O-O" for queen-side castling.
   * Pawn moves are represented by the target square (e.g., "e5").
   * Captures are represented by "x", followed by the target square (e.g., "dxe5").
   * Piece moves are represented by the piece letter (N, B, R, Q, or K), followed by the target square (e.g., "Nf3").
   * Disambiguation, if necessary, is added before the target square (e.g., "Nbd7").
   * Pawn promotions are represented by the promotion piece letter after the target square (e.g., "e8Q").
   * En passant captures are represented by "e.p." after the target square (e.g., "dxe5 e.p.").
   *
   * @returns {string} The string representation of the move.
   */
  public toString(): string {
    if (this.isKingSideCastle()) {
      return "O-O";
    }

    if (this.isQueenSideCastle()) {
      return "O-O-O";
    }

    const target = getRankFile(this.targetSquare);

    const targetRank = 8 - target.rank;
    const targetFile = String.fromCharCode(97 + target.file);

    const piece =
      this.piece.toUpperCase() === "P" ? "" : this.piece.toUpperCase();
    const promotion = this.promotionPiece
      ? "=" + this.promotionPiece.toUpperCase()
      : "";
    const capture = this.capture ? "x" : "";
    const enPassant = this.enPassant ? "e.p." : "";

    const disambiguation = this.getDisambiguation();

    return `${piece}${disambiguation}${capture}${targetFile}${targetRank}${promotion}${enPassant}`;
  }
}
