import {
  getBishopAttacks,
  getQueenAttacks,
  getRookAttacks,
  isSquareAttacked,
  kingAttackTable,
  knightAttackTable,
  pawnAttackTables,
} from "./attack-tables/attacks";
import {
  CastlingAvailabily,
  Color,
  DrawType,
  EndGameType,
  GameResult,
  STARTING_FEN,
  Squares,
} from "./constants";
import { Move } from "./move";
import {
  BitboardsByPiece,
  BoardSquares,
  ColoredPieceString,
  GameOutcome,
} from "./types";
import { hasTriplets } from "./util";
import {
  and,
  clearBit,
  countTruthy,
  getBit,
  lsbIndex,
  not,
  shiftLeft,
} from "./util/bitwise-operations";
import {
  allPiecesBitboard,
  boardStateToFEN,
  generatePieceBitboards,
  getSquareColor,
  isPawnOnPromotionRank,
  isPawnOnStartingRank,
  isSquareOccupied,
  parseFEN,
} from "./util/board-utils";
import { computeZobristHash } from "./zobrist-hash";

class IllegalMoveError extends Error {
  constructor(move: Move | string) {
    super(`Move ${move instanceof Move ? move.toString() : move} is not legal`);
  }
}

export class ChessBoard {
  #activeColor: Color;
  public get activeColor(): Color {
    return this.#activeColor;
  }

  #boardSquares: BoardSquares;
  public get boardSquares(): BoardSquares {
    return this.#boardSquares;
  }

  #legalMoves: Array<Move> = [];
  public get legalMoves(): Array<Move> {
    return this.#legalMoves;
  }

  #gameOutcome: GameOutcome | null;
  public get gameOutcome(): GameOutcome | null {
    return this.#gameOutcome;
  }

  #capturedPieces: [ColoredPieceString[], ColoredPieceString[]];
  public get capturedPieces(): [ColoredPieceString[], ColoredPieceString[]] {
    return this.#capturedPieces;
  }

  #moveHistory: Array<Move> = [];
  public get moveHistory(): Array<Move> {
    return this.#moveHistory;
  }

  #positionHistory: Array<string> = [];
  public get positionHistory(): Array<string> {
    return this.#positionHistory;
  }

  #halfMoveClock: number = 0;
  public get halfMoveClock(): number {
    return this.#halfMoveClock;
  }

  #fullMoveNumber: number;
  public get fullMoveNumber(): number {
    return this.#fullMoveNumber;
  }

  #enPassantSquare: number | null;
  public get enPassantSquare(): number | null {
    return this.#enPassantSquare;
  }

  #castlingRights: number;
  public get castlingRights(): number {
    return this.#castlingRights;
  }

  #bitboards: BitboardsByPiece;

  #zobristHashHistory: Array<bigint> = [];

  /**
   * Callback function that is called after every move.
   * Can be used to update the UI.
   */
  public moveCallback?: (boardState: {
    activeColor: Color;
    boardSquares: BoardSquares;
    legalMoves: Array<Move>;
    castlingRights: number;
    moveHistory: Array<Move>;
    capturedPieces: [ColoredPieceString[], ColoredPieceString[]];
    gameOutcome: GameOutcome | null;
    positionHistory: Array<string>;
  }) => void;

  constructor(fen: string) {
    const boardState = parseFEN(fen);

    this.#activeColor = boardState.activeColor;
    this.#boardSquares = boardState.boardSquares;
    this.#castlingRights = boardState.castlingAvailability;
    this.#enPassantSquare = boardState.enPassantSquare;
    this.#halfMoveClock = boardState.halfMoveClock;
    this.#fullMoveNumber = boardState.fullMoveNumber;

    this.#zobristHashHistory.push(
      computeZobristHash(
        this.boardSquares,
        this.castlingRights,
        this.enPassantSquare,
        this.activeColor
      )
    );

    this.#capturedPieces = [[], []];
    this.#bitboards = generatePieceBitboards(this.boardSquares);
    this.generateMoves();

    this.#gameOutcome = this.detectGameResult();
  }

  public static fromInitialPosition() {
    return new ChessBoard(STARTING_FEN);
  }

  public static fromMoveArray(moves: string[]) {
    const board = ChessBoard.fromInitialPosition();

    for (let i = 0; i < moves.length; i++) {
      board.makeMove(moves[i]);
    }

    return board;
  }

  public getFEN(): string {
    return boardStateToFEN(
      this.boardSquares,
      this.activeColor,
      this.castlingRights,
      this.enPassantSquare,
      this.halfMoveClock,
      this.fullMoveNumber
    );
  }

  public makeMove(move: string | Move) {
    let m: Move | undefined;
    if (typeof move === "string") {
      m = this.legalMoves.find((m) => m.toString() === move);
    } else if (move instanceof Move) {
      m = move;
    }

    if (!m) {
      throw new IllegalMoveError(move);
    }

    this.executeMove(m, true);
  }

  private executeMove(move: Move, commit: boolean = true) {
    if (this.gameOutcome) {
      return;
    }

    if (!this.legalMoves?.includes(move) && commit) {
      throw new IllegalMoveError(move);
    }

    const enemyColor = this.activeColor ^ 1;
    const boardCopy = this.boardSquares.slice();

    if (move.capture && commit && boardCopy[move.targetSquare] !== null) {
      this.capturedPieces[this.activeColor].push(
        boardCopy[move.targetSquare] as ColoredPieceString
      );
    }

    // Clear source square and move the piece to the target square
    const sourcePiece = boardCopy[move.sourceSquare];
    boardCopy[move.sourceSquare] = null;
    boardCopy[move.targetSquare] = sourcePiece;

    // If the move is a promotion, replace the pawn with the promoted piece
    if (move.promotionPiece) {
      const promotionPieceColor = this.activeColor
        ? move.promotionPiece.toLowerCase()
        : move.promotionPiece;
      boardCopy[move.targetSquare] = promotionPieceColor as ColoredPieceString;
    }

    // If the move is en passant, remove the captured pawn
    if (move.enPassant && this.enPassantSquare) {
      const direction = this.activeColor ? -1 : 1;
      boardCopy[move.targetSquare + 8 * direction] = null;
      if (commit) this.#enPassantSquare = null;
    }

    // If the move is a double pawn push, set the en passant square
    if (move.doublePawnPush && commit) {
      const direction = this.activeColor ? -1 : 1;
      this.#enPassantSquare = move.targetSquare + 8 * direction;
    } else if (commit) {
      // Otherwise, clear the en passant square because it is no longer available
      this.#enPassantSquare = null;
    }

    // If the move is castling, move the rook to the supposed square
    if (move.castling) {
      if (move.targetSquare === Squares.G1) {
        // white castle kingside
        boardCopy[Squares.H1] = null;
        boardCopy[Squares.F1] = "R";
      }
      if (move.targetSquare === Squares.C1) {
        // white castle queenside
        boardCopy[Squares.A1] = null;
        boardCopy[Squares.D1] = "R";
      }
      if (move.targetSquare === Squares.G8) {
        // black castle kingside
        boardCopy[Squares.H8] = null;
        boardCopy[Squares.F8] = "r";
      }
      if (move.targetSquare === Squares.C8) {
        // black castle queenside
        boardCopy[Squares.A8] = null;
        boardCopy[Squares.D8] = "r";
      }
    }

    const newBitboards = generatePieceBitboards(boardCopy);

    // Check if king is in check after the move
    // If so, the move is illegal
    const kingPosition = lsbIndex(newBitboards.K[this.activeColor]);
    if (isSquareAttacked(kingPosition, enemyColor, newBitboards)) {
      throw new IllegalMoveError(move);
    }

    if (commit) {
      // Increment half move clock if the move is not a pawn move or a capture
      this.#halfMoveClock++;
      if (move.piece.toUpperCase() === "P" || move.capture) {
        this.#halfMoveClock = 0;
      }

      // Increment fullmove number
      if (this.activeColor === Color.White) {
        this.#fullMoveNumber = this.fullMoveNumber + 1;
      }

      // Clear castling rights for active color if the king moved
      if (move.piece.toUpperCase() === "K") {
        this.#castlingRights =
          this.castlingRights & (this.activeColor ? 0b1100 : 0b0011);
      }

      // Clear castling rights for the respective side when a rook moves from starting square
      if (move.piece.toUpperCase() === "R") {
        if (
          move.sourceSquare === Squares.A1 &&
          this.activeColor === Color.White
        ) {
          this.#castlingRights &= ~CastlingAvailabily.WhiteQueen;
        }

        if (
          move.sourceSquare === Squares.H1 &&
          this.activeColor === Color.White
        ) {
          this.#castlingRights &= ~CastlingAvailabily.WhiteKing;
        }

        if (
          move.sourceSquare === Squares.A8 &&
          this.activeColor === Color.Black
        ) {
          this.#castlingRights &= ~CastlingAvailabily.BlackQueen;
        }

        if (
          move.sourceSquare === Squares.H8 &&
          this.activeColor === Color.Black
        ) {
          this.#castlingRights &= ~CastlingAvailabily.BlackKing;
        }
      }

      this.#moveHistory = [...this.moveHistory, move];
      this.#activeColor = this.#activeColor ^ 1;
      this.#boardSquares = boardCopy;
      this.#bitboards = newBitboards;
      this.#zobristHashHistory.push(
        computeZobristHash(
          this.boardSquares,
          this.castlingRights,
          this.enPassantSquare,
          this.activeColor
        )
      );
      this.#positionHistory = [
        ...this.positionHistory,
        boardStateToFEN(
          this.boardSquares,
          this.activeColor,
          this.castlingRights,
          this.enPassantSquare,
          this.halfMoveClock,
          this.fullMoveNumber
        ),
      ];
      this.generateMoves();

      this.#gameOutcome = this.detectGameResult();
      if (this.moveCallback)
        this.moveCallback({
          activeColor: this.activeColor,
          capturedPieces: this.capturedPieces,
          boardSquares: this.boardSquares,
          moveHistory: this.moveHistory,
          gameOutcome: this.gameOutcome,
          legalMoves: this.legalMoves,
          castlingRights: this.castlingRights,
          positionHistory: this.positionHistory,
        });
    }
  }

  public resign(color: Color): void {
    const winner = color ? GameResult.WhiteWins : GameResult.BlackWins;
    this.setGameOutcome({
      result: winner,
      type: EndGameType.Resignation,
    });
  }

  public setGameOutcome(gameOutcome: GameOutcome): void {
    this.#gameOutcome = gameOutcome;
  }

  private generateMoves(color = this.activeColor) {
    const pseudoLegalMoves = [
      ...this.generatePawnMoves(color),
      ...this.generateKnightMoves(color),
      ...this.generateBishopMoves(color),
      ...this.generateRookMoves(color),
      ...this.generateQueenMoves(color),
      ...this.generateKingMoves(color),
    ];

    this.#legalMoves = pseudoLegalMoves.filter((move) => {
      try {
        this.executeMove(move, false);
        return true;
      } catch (e) {
        if (e instanceof IllegalMoveError) {
          return false;
        }
        throw e;
      }
    });
  }

  private generateKnightMoves(color = this.activeColor): Move[] {
    const pseudoLegalKnightMoves: Move[] = [];
    const enemyColor = color ^ 1;

    let knights = this.#bitboards.N[color];

    // Extract each individual knight from the bitboard.
    while (knights) {
      const fromSquare = lsbIndex(knights); // Get the position of the least significant set bit.
      const potentialAttacks = knightAttackTable[fromSquare];

      // Filter attacks to only those that don't capture pieces of the same color.
      let legalAttacks = and(
        potentialAttacks,
        not(allPiecesBitboard(this.#bitboards, color))
      );

      // Extract each individual attack move from the legalAttacks bitboard.
      while (legalAttacks) {
        const toSquare = lsbIndex(legalAttacks);
        const isCapture = !!getBit(
          allPiecesBitboard(this.#bitboards, enemyColor),
          toSquare
        );

        // Construct the move and add it to the list of moves.
        const move = new Move(
          this.#bitboards,
          fromSquare,
          toSquare,
          color ? "n" : "N",
          null,
          isCapture
        );
        pseudoLegalKnightMoves.push(move);

        // Remove the current attack move from the legalAttacks bitboard.
        legalAttacks = clearBit(legalAttacks, toSquare);
      }

      // Remove the current knight from the knights bitboard.
      knights = clearBit(knights, fromSquare);
    }

    return pseudoLegalKnightMoves;
  }

  private generateBishopMoves(color = this.activeColor) {
    const pseudoLegalBishopMoves: Move[] = [];
    const enemyColor = color ^ 1;

    let bishops = this.#bitboards.B[color];
    while (bishops) {
      const fromSquare = lsbIndex(bishops);
      const potentialAttacks = getBishopAttacks(
        fromSquare,
        allPiecesBitboard(this.#bitboards)
      );
      let legalAttacks = and(
        potentialAttacks,
        not(allPiecesBitboard(this.#bitboards, color))
      );

      while (legalAttacks) {
        const targetSquare = lsbIndex(legalAttacks);

        const isCapture = !!getBit(
          allPiecesBitboard(this.#bitboards, enemyColor),
          targetSquare
        );

        const move = new Move(
          this.#bitboards,
          fromSquare,
          targetSquare,
          color ? "b" : "B",
          null,
          isCapture
        );

        pseudoLegalBishopMoves.push(move);
        legalAttacks = clearBit(legalAttacks, targetSquare);
      }

      bishops = clearBit(bishops, fromSquare);
    }

    return pseudoLegalBishopMoves;
  }

  private generateRookMoves(color = this.activeColor) {
    const pseudoLegalRookMoves: Move[] = [];
    const enemyColor = color ^ 1;

    let rooks = this.#bitboards.R[color];
    while (rooks) {
      const fromSquare = lsbIndex(rooks);
      const potentialAttacks = getRookAttacks(
        fromSquare,
        allPiecesBitboard(this.#bitboards)
      );
      let legalAttacks = and(
        potentialAttacks,
        not(allPiecesBitboard(this.#bitboards, color))
      );
      while (legalAttacks) {
        const targetSquare = lsbIndex(legalAttacks);

        const isCapture = !!getBit(
          allPiecesBitboard(this.#bitboards, enemyColor),
          targetSquare
        );

        const move = new Move(
          this.#bitboards,
          fromSquare,
          targetSquare,
          color ? "r" : "R",
          null,
          isCapture
        );

        pseudoLegalRookMoves.push(move);
        legalAttacks = clearBit(legalAttacks, targetSquare);
      }

      rooks = clearBit(rooks, fromSquare);
    }

    return pseudoLegalRookMoves;
  }

  private generateQueenMoves(color = this.activeColor) {
    const pseudoLegalQueenMoves: Move[] = [];
    const enemyColor = color ^ 1;

    let queens = this.#bitboards.Q[color];
    while (queens) {
      const fromSquare = lsbIndex(queens);
      const potentialAttacks = getQueenAttacks(
        fromSquare,
        allPiecesBitboard(this.#bitboards)
      );
      let legalAttacks = and(
        potentialAttacks,
        not(allPiecesBitboard(this.#bitboards, color))
      );

      while (legalAttacks) {
        const targetSquare = lsbIndex(legalAttacks);

        const isCapture = !!getBit(
          allPiecesBitboard(this.#bitboards, enemyColor),
          targetSquare
        );

        const move = new Move(
          this.#bitboards,
          fromSquare,
          targetSquare,
          color ? "q" : "Q",
          null,
          isCapture
        );

        pseudoLegalQueenMoves.push(move);
        legalAttacks = clearBit(legalAttacks, targetSquare);
      }

      queens = clearBit(queens, fromSquare);
    }

    return pseudoLegalQueenMoves;
  }

  private generateKingMoves(color = this.activeColor) {
    const pseudoLegalKingMoves: Move[] = [];
    const enemyColor = color ^ 1;

    const king = this.#bitboards.K[color];
    const fromSquare = lsbIndex(king);

    const potentialAttacks = kingAttackTable[fromSquare];

    const enemyKing = lsbIndex(this.#bitboards.K[enemyColor]);
    const enemyKingRadius = kingAttackTable[enemyKing];

    let legalAttacks = and(
      potentialAttacks,
      not(allPiecesBitboard(this.#bitboards, color)),
      not(enemyKingRadius)
    );

    while (legalAttacks) {
      const targetSquare = lsbIndex(legalAttacks);
      const isCapture = !!getBit(
        allPiecesBitboard(this.#bitboards, enemyColor),
        targetSquare
      );

      const move = new Move(
        this.#bitboards,
        fromSquare,
        targetSquare,
        color ? "k" : "K",
        null,
        isCapture
      );

      pseudoLegalKingMoves.push(move);

      legalAttacks = clearBit(legalAttacks, targetSquare);
    }

    // Conditions for white king side castling
    if (
      color === Color.White &&
      this.castlingRights & CastlingAvailabily.WhiteKing &&
      this.boardSquares[Squares.E1] === "K" &&
      this.boardSquares[Squares.H1] === "R" &&
      !isSquareOccupied(Squares.F1, this.#bitboards) &&
      !isSquareOccupied(Squares.G1, this.#bitboards) &&
      !isSquareAttacked(Squares.E1, Color.Black, this.#bitboards) &&
      !isSquareAttacked(Squares.F1, Color.Black, this.#bitboards) &&
      !isSquareAttacked(Squares.G1, Color.Black, this.#bitboards)
    ) {
      pseudoLegalKingMoves.push(
        new Move(
          this.#bitboards,
          Squares.E1,
          Squares.G1,
          color ? "k" : "K",
          null,
          false,
          false,
          false,
          true
        )
      );
    }

    // Conditions for white queen side castling
    if (
      color === Color.White &&
      this.castlingRights & CastlingAvailabily.WhiteQueen &&
      this.boardSquares[Squares.E1] === "K" &&
      this.boardSquares[Squares.A1] === "R" &&
      !isSquareOccupied(Squares.D1, this.#bitboards) &&
      !isSquareOccupied(Squares.C1, this.#bitboards) &&
      !isSquareOccupied(Squares.B1, this.#bitboards) &&
      !isSquareAttacked(Squares.E1, Color.Black, this.#bitboards) &&
      !isSquareAttacked(Squares.D1, Color.Black, this.#bitboards) &&
      !isSquareAttacked(Squares.C1, Color.Black, this.#bitboards)
    ) {
      pseudoLegalKingMoves.push(
        new Move(
          this.#bitboards,
          Squares.E1,
          Squares.C1,
          color ? "k" : "K",
          null,
          false,
          false,
          false,
          true
        )
      );
    }

    // Conditions for black king side castling
    if (
      color === Color.Black &&
      this.castlingRights & CastlingAvailabily.BlackKing &&
      this.boardSquares[Squares.E8] === "k" &&
      this.boardSquares[Squares.H8] === "r" &&
      !isSquareOccupied(Squares.F8, this.#bitboards) &&
      !isSquareOccupied(Squares.G8, this.#bitboards) &&
      !isSquareAttacked(Squares.E8, Color.White, this.#bitboards) &&
      !isSquareAttacked(Squares.F8, Color.White, this.#bitboards) &&
      !isSquareAttacked(Squares.G8, Color.White, this.#bitboards)
    ) {
      pseudoLegalKingMoves.push(
        new Move(
          this.#bitboards,
          Squares.E8,
          Squares.G8,
          color ? "k" : "K",
          null,
          false,
          false,
          false,
          true
        )
      );
    }

    // Conditions for black queen side castling
    if (
      color === Color.Black &&
      this.castlingRights & CastlingAvailabily.BlackQueen &&
      this.boardSquares[Squares.E8] === "k" &&
      this.boardSquares[Squares.A8] === "r" &&
      !isSquareOccupied(Squares.D8, this.#bitboards) &&
      !isSquareOccupied(Squares.C8, this.#bitboards) &&
      !isSquareOccupied(Squares.B8, this.#bitboards) &&
      !isSquareAttacked(Squares.E8, Color.White, this.#bitboards) &&
      !isSquareAttacked(Squares.D8, Color.White, this.#bitboards) &&
      !isSquareAttacked(Squares.C8, Color.White, this.#bitboards)
    ) {
      pseudoLegalKingMoves.push(
        new Move(
          this.#bitboards,
          Squares.E8,
          Squares.C8,
          color ? "k" : "K",
          null,
          false,
          false,
          false,
          true
        )
      );
    }

    return pseudoLegalKingMoves;
  }

  private generatePawnMoves(color = this.activeColor): any[] {
    const pseudoLegalPawnMoves: Move[] = [];
    const pawns = this.#bitboards.P[color];
    const enemyColor = color ^ 1;

    const direction = color === Color.White ? -1 : 1;

    let pawn = pawns;
    while (pawn) {
      const fromSquare = lsbIndex(pawn);
      let targetSquare: number;

      targetSquare = fromSquare + 8 * direction;

      if (!isSquareOccupied(targetSquare, this.#bitboards)) {
        if (isPawnOnPromotionRank(fromSquare, color)) {
          pseudoLegalPawnMoves.push(
            new Move(
              this.#bitboards,
              fromSquare,
              targetSquare,
              color ? "p" : "P",
              "Q"
            ),
            new Move(
              this.#bitboards,
              fromSquare,
              targetSquare,
              color ? "p" : "P",
              "R"
            ),
            new Move(
              this.#bitboards,
              fromSquare,
              targetSquare,
              color ? "p" : "P",
              "N"
            ),
            new Move(
              this.#bitboards,
              fromSquare,
              targetSquare,
              color ? "p" : "P",
              "B"
            )
          );
        } else {
          pseudoLegalPawnMoves.push(
            new Move(
              this.#bitboards,
              fromSquare,
              targetSquare,
              color ? "p" : "P"
            )
          );

          if (isPawnOnStartingRank(fromSquare, color)) {
            targetSquare += 8 * direction;
            if (!isSquareOccupied(targetSquare, this.#bitboards)) {
              pseudoLegalPawnMoves.push(
                new Move(
                  this.#bitboards,
                  fromSquare,
                  targetSquare,
                  color ? "p" : "P",
                  null,
                  false,
                  true
                )
              );
            }
          }
        }
      }

      if (
        this.enPassantSquare &&
        pawnAttackTables[this.activeColor][fromSquare] &
          shiftLeft(1n, this.enPassantSquare)
      ) {
        pseudoLegalPawnMoves.push(
          new Move(
            this.#bitboards,
            fromSquare,
            this.enPassantSquare,
            color ? "p" : "P",
            null,
            true,
            false,
            true
          )
        );
      }

      let attacks = and(
        pawnAttackTables[color][fromSquare],
        allPiecesBitboard(this.#bitboards, enemyColor)
      );

      while (attacks) {
        targetSquare = lsbIndex(attacks);

        if (isPawnOnPromotionRank(fromSquare, color)) {
          pseudoLegalPawnMoves.push(
            new Move(
              this.#bitboards,
              fromSquare,
              targetSquare,
              color ? "p" : "P",
              "Q",
              true
            ),
            new Move(
              this.#bitboards,
              fromSquare,
              targetSquare,
              color ? "p" : "P",
              "R",
              true
            ),
            new Move(
              this.#bitboards,
              fromSquare,
              targetSquare,
              color ? "p" : "P",
              "N",
              true
            ),
            new Move(
              this.#bitboards,
              fromSquare,
              targetSquare,
              color ? "p" : "P",
              "B",
              true
            )
          );
        } else {
          pseudoLegalPawnMoves.push(
            new Move(
              this.#bitboards,
              fromSquare,
              targetSquare,
              color ? "p" : "P",
              null,
              true
            )
          );
        }

        attacks = clearBit(attacks, targetSquare);
      }

      pawn = clearBit(pawn, fromSquare);
    }

    return pseudoLegalPawnMoves;
  }

  /**
   * Checks if the current position is a checkmate or a draw
   * @returns The game result
   */
  private detectGameResult(): GameOutcome | null {
    if (this.detectCheckmate()) {
      return {
        result: this.activeColor ? GameResult.WhiteWins : GameResult.BlackWins,
        type: EndGameType.Checkmate,
      };
    }
    const drawType = this.detectDraw();
    if (drawType) {
      return drawType;
    }

    return null;
  }

  /**
   * Returns true if the king of the current active color is checkmated
   */
  private detectCheckmate() {
    const enemyColor = this.activeColor ^ 1;
    return (
      this.legalMoves.length === 0 &&
      isSquareAttacked(
        lsbIndex(this.#bitboards.K[this.activeColor]),
        enemyColor,
        this.#bitboards
      )
    );
  }

  private detectDraw(): GameOutcome | false {
    // Stalemate
    const kingPosition = lsbIndex(this.#bitboards.K[this.activeColor]);
    if (
      this.legalMoves.length === 0 &&
      !isSquareAttacked(kingPosition, this.activeColor ^ 1, this.#bitboards)
    ) {
      return { result: GameResult.Draw, type: DrawType.Stalemate };
    }

    // Fifty move rule
    if (this.halfMoveClock >= 50) {
      return { result: GameResult.Draw, type: DrawType.FiftyMoveRule };
    }

    // Threefold repetition
    if (hasTriplets(this.#zobristHashHistory)) {
      return { result: GameResult.Draw, type: DrawType.ThreefoldRepetition };
    }

    // Dead position / insufficient material
    if (this.detectDeadPosition()) {
      return { result: GameResult.Draw, type: DrawType.DeadPosition };
    }

    return false;
  }

  public detectDeadPosition() {
    // If there are any queens, pawns or rooks on the board, the position is not dead
    if (
      this.#bitboards.Q[Color.White] |
      this.#bitboards.Q[Color.Black] |
      this.#bitboards.P[Color.White] |
      this.#bitboards.P[Color.Black] |
      this.#bitboards.R[Color.White] |
      this.#bitboards.R[Color.Black]
    ) {
      return false;
    }

    // If it's a king vs king position, the position is dead
    if (
      !this.#bitboards.B[Color.White] &&
      !this.#bitboards.N[Color.White] &&
      !this.#bitboards.B[Color.Black] &&
      !this.#bitboards.N[Color.Black]
    ) {
      return true;
    }

    // If it's a king vs king and bishop position, the position is dead
    if (
      countTruthy(this.#bitboards.B[Color.White]) === 1 &&
      !this.#bitboards.N[Color.White] &&
      !this.#bitboards.B[Color.Black] &&
      !this.#bitboards.N[Color.Black]
    ) {
      return true;
    }

    if (
      countTruthy(this.#bitboards.B[Color.Black]) === 1 &&
      !this.#bitboards.N[Color.Black] &&
      !this.#bitboards.B[Color.White] &&
      !this.#bitboards.N[Color.White]
    ) {
      return true;
    }

    // If it's a king vs king and knight position, the position is dead
    if (
      countTruthy(this.#bitboards.N[Color.White]) === 1 &&
      !this.#bitboards.B[Color.White] &&
      !this.#bitboards.N[Color.Black] &&
      !this.#bitboards.B[Color.Black]
    ) {
      return true;
    }

    if (
      countTruthy(this.#bitboards.N[Color.Black]) === 1 &&
      !this.#bitboards.B[Color.Black] &&
      !this.#bitboards.N[Color.White] &&
      !this.#bitboards.B[Color.White]
    ) {
      return true;
    }

    // If it's a king vs king and bishops of the same color position, the position is dead
    if (!this.#bitboards.N[Color.White] && !this.#bitboards.N[Color.Black]) {
      let bishops =
        this.#bitboards.B[Color.White] | this.#bitboards.B[Color.Black];

      let darkSquaresCount = 0;
      let lightSquaresCount = 0;

      while (bishops) {
        const bishop = lsbIndex(bishops);
        bishops = clearBit(bishops, bishop);

        const squareColor = getSquareColor(bishop);
        if (squareColor === Color.Black) {
          darkSquaresCount++;
        } else {
          lightSquaresCount++;
        }
      }

      if (lightSquaresCount === 0 || darkSquaresCount === 0) {
        return true;
      }
    }

    return false;
  }
}
