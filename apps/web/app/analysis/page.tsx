"use client";

import BoardProvider, { BoardContext } from "@/components/board/board-context";
import StockfishProvider from "@/components/board/stockfish/stockfish-context";
import AnalysisBoard from "./_components/analysis-board";

export default function Page() {
  return (
    <BoardProvider>
      <BoardContext.Consumer>
        {({ FEN }) => {
          return (
            <StockfishProvider FEN={FEN}>
              <AnalysisBoard />
            </StockfishProvider>
          );
        }}
      </BoardContext.Consumer>
    </BoardProvider>
  );
}
