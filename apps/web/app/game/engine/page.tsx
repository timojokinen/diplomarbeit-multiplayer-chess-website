"use client";

import BoardState, { BoardContext } from "@/components/board/board-context";
import StockfishProvider from "@/components/board/stockfish/stockfish-context";
import EngineMatch from "./_components/engine-match";

export default function Game() {
  return (
    <div>
      <BoardState>
        <BoardContext.Consumer>
          {({ FEN }) => (
            <StockfishProvider FEN={FEN}>
              <EngineMatch />
            </StockfishProvider>
          )}
        </BoardContext.Consumer>
      </BoardState>
    </div>
  );
}
