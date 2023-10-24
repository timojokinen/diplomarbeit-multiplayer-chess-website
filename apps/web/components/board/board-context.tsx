"use client";

import React, {
  ReactNode,
  RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import ChessBoard, {
  BoardSquares,
  Color,
  ColoredPieceString,
  parseFEN,
  type Move,
} from "ks-engine";
import { Game } from "ks-database";

type BoardStateValues = {
  boardRef: RefObject<HTMLDivElement>;
  isFlipped: boolean;
  setIsFlipped: (isFlipped: boolean) => void;
  activeColor: Color;
  boardSquares: BoardSquares;
  capturedPieces: [ColoredPieceString[], ColoredPieceString[]];
  legalMoves: Array<Move>;
  moveHistory: Array<Move>;
  positionHistory: Array<string>;
  makeMove: (move: Move | string) => void;
  selectedMove: Move | null;
  viewPositionAfterMove: (move: Move) => void;
  viewPreviousPosition: () => void;
  viewNextPosition: () => void;
  FEN: string;
};

type BoardStateProps = {
  children: ReactNode;
  game?: Game;
};

export const BoardContext = React.createContext<BoardStateValues>({} as any);

export default function BoardState({ children, game }: BoardStateProps) {
  const board = useMemo(() => {
    if (game) {
      return ChessBoard.fromMoveArray(game.moves as string[]);
    }
    return ChessBoard.fromInitialPosition();
  }, [game]);

  const boardRef = useRef<HTMLDivElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeColor, setActiveColor] = useState<Color>(board.activeColor);
  const [legalMoves, setLegalMoves] = useState<Array<Move>>(board.legalMoves);
  const [boardSquares, setBoardSquares] = useState(board.boardSquares);
  const [capturedPieces, setCapturedPieces] = useState(board.capturedPieces);
  const [moveHistory, setMoveHistory] = useState(board.moveHistory);
  const [positionHistory, setPositionHistory] = useState(board.positionHistory);
  const [selectedMove, setSelectedMove] = useState<Move | null>(null);
  const [FEN, setFEN] = useState<string>(board.getFEN());

  useEffect(() => {
    board.moveCallback = (boardState) => {
      setLegalMoves(boardState.legalMoves);
      setActiveColor(boardState.activeColor);
      setBoardSquares(boardState.boardSquares);
      setCapturedPieces(boardState.capturedPieces);
      setMoveHistory(boardState.moveHistory);
      setPositionHistory(boardState.positionHistory);
      setFEN(board.getFEN());
    };
  }, [board]);

  const currentPosition = useMemo(() => {
    if (!selectedMove) return boardSquares;

    const positionIndex = moveHistory.indexOf(selectedMove);
    return parseFEN(positionHistory[positionIndex]).boardSquares;
  }, [selectedMove, boardSquares, moveHistory, positionHistory]);

  const currentFEN = useMemo(() => {
    if (!selectedMove) return FEN;
    const positionIndex = moveHistory.indexOf(selectedMove);
    return positionHistory[positionIndex];
  }, [selectedMove, moveHistory, positionHistory, FEN]);

  const makeMove = (move: Move | string) => {
    board.makeMove(move);
    setSelectedMove(null);
  };

  const viewPositionAfterMove = (move: Move) => {
    if (moveHistory.indexOf(move) === moveHistory.length - 1) {
      setSelectedMove(null);
    } else {
      setSelectedMove(move);
    }
  };

  const viewPreviousPosition = () => {
    if (!selectedMove && moveHistory[moveHistory.length - 2]) {
      viewPositionAfterMove(moveHistory[moveHistory.length - 2]);
    } else if (selectedMove) {
      const index = moveHistory.indexOf(selectedMove);
      if (moveHistory[index - 1]) viewPositionAfterMove(moveHistory[index - 1]);
    }
  };

  const viewNextPosition = () => {
    if (!selectedMove) return;
    const index = moveHistory.indexOf(selectedMove);
    if (index >= 0 && moveHistory[index + 1]) {
      viewPositionAfterMove(moveHistory[index + 1]);
    }
  };

  return (
    <BoardContext.Provider
      value={{
        boardRef,
        isFlipped,
        setIsFlipped,
        activeColor,
        boardSquares: currentPosition,
        capturedPieces,
        makeMove,
        moveHistory,
        positionHistory,
        legalMoves: selectedMove ? [] : legalMoves,
        selectedMove: selectedMove ?? moveHistory[moveHistory.length - 1],
        viewPositionAfterMove,
        viewPreviousPosition,
        viewNextPosition,
        FEN: currentFEN,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
}
