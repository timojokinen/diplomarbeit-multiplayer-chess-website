"use client";

import Board from "@/components/board";
import { BoardContext } from "@/components/board/board-context";
import MoveHistoryNavigation from "@/components/board/move-history-navigation";
import EvalBar from "@/components/board/stockfish/eval-bar";
import { StockfishContext } from "@/components/board/stockfish/stockfish-context";

import { getPieceColor } from "@/lib/utils";
import { Color, Move, squareToIndex } from "ks-engine";
import { useContext, useEffect, useState } from "react";

export default function EngineMatch() {
  const { bestMove } = useContext(StockfishContext);
  const [playerColor, setPlayerColor] = useState<Color>(Color.White);

  const { legalMoves, makeMove, boardSquares, activeColor } =
    useContext(BoardContext);

  const handleMove = (move: Move): void => {
    if (getPieceColor(move.piece) !== activeColor) return;
    if (playerColor !== activeColor) return;
    makeMove(move);
  };

  useEffect(() => {
    if (activeColor === playerColor || !bestMove) {
      return;
    }

    const origin = bestMove.slice(0, 2);
    const target = bestMove.slice(2, 4);
    const promotion = bestMove.slice(4, 5);

    const move = legalMoves.find(
      (move) =>
        move.sourceSquare === squareToIndex(origin) &&
        move.targetSquare === squareToIndex(target) &&
        (move.promotionPiece?.toLowerCase() ?? "" === promotion.toLowerCase())
    );

    if (move) {
      makeMove(move);
    }
  }, [activeColor, playerColor, bestMove, legalMoves, makeMove]);

  return (
    <section className="flex flex-col gap-4">
      <div className="grid 2xl:grid-cols-3 grid-cols-7 gap-16">
        <div className="2xl:col-span-2 col-span-4">
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: "24px 1fr" }}
          >
            <EvalBar />
            <Board
              activeColor={activeColor}
              legalMoves={legalMoves}
              onMove={handleMove}
              boardSquares={boardSquares}
            />
          </div>
        </div>
        <div className="col-span-2 2xl:col-span-1">
          <div>
            <MoveHistoryNavigation />
          </div>
        </div>
      </div>
    </section>
  );
}
