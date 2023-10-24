"use client";

import Board from "@/components/board";
import { BoardContext } from "@/components/board/board-context";
import MoveHistoryNavigation from "@/components/board/move-history-navigation";
import EvalBar from "@/components/board/stockfish/eval-bar";
import StockfishProvider from "@/components/board/stockfish/stockfish-context";
import { useContext } from "react";

export default function AnalysisBoard() {
  const { boardSquares, FEN, legalMoves, makeMove, activeColor } =
    useContext(BoardContext);

  return (
    <StockfishProvider FEN={FEN}>
      <section className="flex flex-col gap-4">
        <div className="grid 2xl:grid-cols-3 grid-cols-7 gap-16">
          <div className="2xl:col-span-2 col-span-4">
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: "24px 1fr" }}
            >
              <EvalBar />
              <Board
                boardSquares={boardSquares}
                legalMoves={legalMoves}
                onMove={makeMove}
                activeColor={activeColor}
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
    </StockfishProvider>
  );
}
