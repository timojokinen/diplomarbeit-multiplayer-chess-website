"use client";

import Board from "@/components/board";
import BoardProvider, { BoardContext } from "@/components/board/board-context";
import EvalBar from "@/components/board/stockfish/eval-bar";
import StockfishProvider from "@/components/board/stockfish/stockfish-context";
import Link from "next/link";

export default function Page() {
  // const session = await getServerSession(authOptions as any);
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <BoardProvider>
            <BoardContext.Consumer>
              {({ boardSquares, legalMoves, makeMove, FEN, activeColor }) => {
                return (
                  <StockfishProvider FEN={FEN}>
                    <div className="">
                      <div
                        className="grid gap-2"
                        style={{ gridTemplateColumns: "24px 1fr" }}
                      >
                        <EvalBar />
                        <Board
                          activeColor={activeColor}
                          boardSquares={boardSquares}
                          legalMoves={legalMoves}
                          onMove={makeMove}
                        />
                      </div>
                    </div>
                  </StockfishProvider>
                );
              }}
            </BoardContext.Consumer>
          </BoardProvider>
        </div>
        <div className="">
          <div className="grid grid-cols-3 p-4 gap-4">
            <Link
              href="/game/engine"
              className="aspect-square border rounded bg-white flex items-center justify-center flex-col hover:shadow hover:text-accent-foreground"
            >
              <div className="text-xl font-serif font-bold">Engine</div>
              <div>Play vs Stockfish</div>
            </Link>
            <Link
              href="/game/challenges"
              className="aspect-square border rounded bg-white flex items-center justify-center flex-col hover:shadow hover:text-accent-foreground"
            >
              <div className="text-xl font-serif font-bold">Online</div>
              <div>Play vs other players</div>
            </Link>
            <Link
              href="/analysis"
              className="aspect-square border rounded bg-white flex items-center justify-center flex-col hover:shadow hover:text-accent-foreground"
            >
              <div className="text-xl font-serif font-bold">Analysis</div>
              <div>Analyze positions</div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
