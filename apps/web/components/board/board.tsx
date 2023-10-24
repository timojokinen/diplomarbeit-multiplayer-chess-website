"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import { BoardSquares, Color, ColoredPieceString, Move } from "ks-engine";
import { useContext, useState } from "react";
import { BoardContext } from "./board-context";
import Coordinates from "./coordinates";
import { Piece } from "./pieces";
import PromotionDialog from "./promotion-dialog";
import InteractiveSquare from "./square";

type Props = {
  flipped?: boolean;
  boardSquares: BoardSquares;
  onMove: (move: Move) => void;
  legalMoves: Array<Move>;
  activeColor: Color;
};

/**
 *
 */
export default function Board({
  flipped,
  boardSquares,
  onMove,
  legalMoves,
  activeColor,
}: Props) {
  const [draggingPiece, setDraggingPiece] = useState<{
    piece: ColoredPieceString;
    fromSquare: number;
  } | null>();

  const { boardRef } = useContext(BoardContext);

  const [promotionMoves, setPromotionMoves] = useState<Move[]>([]);

  function handleDragStart(event: DragStartEvent) {
    setDraggingPiece((event.active.data.current ?? null) as any);
  }

  function handleDragEnd(event: DragEndEvent) {
    const fromSquare: number = event.active.data.current?.fromSquare;
    const targetSquare: number = event.over?.data.current?.squareIndex;
    if (
      typeof fromSquare !== "undefined" &&
      typeof targetSquare !== "undefined" &&
      fromSquare !== targetSquare
    ) {
      const currentSquareLegalMoves = legalMoves.filter(
        (move) =>
          move.sourceSquare === fromSquare && move.targetSquare === targetSquare
      );

      if (
        currentSquareLegalMoves.length > 1 &&
        currentSquareLegalMoves.every((move) => move.promotionPiece)
      ) {
        setPromotionMoves(currentSquareLegalMoves);
      } else if (currentSquareLegalMoves.length === 1) {
        onMove(currentSquareLegalMoves[0]);
      }
    }
    setDraggingPiece(null);
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <DragOverlay>
        {draggingPiece && <Piece piece={draggingPiece.piece} />}
      </DragOverlay>
      <div
        className="grid grid-cols-8 grid-rows-8 w-full aspect-square rounded overflow-hidden transform relative"
        ref={boardRef}
      >
        {boardSquares.map((_, i) => {
          const index = flipped ? 63 - i : i;
          const canDrop = legalMoves.some(
            (m) =>
              m.targetSquare === index &&
              m.sourceSquare === draggingPiece?.fromSquare
          );
          return (
            <InteractiveSquare
              canDrop={canDrop}
              piece={boardSquares[index]}
              key={index}
              index={index}
            />
          );
        })}
        <Coordinates flipped={flipped ?? false} />
      </div>
      <PromotionDialog
        boardContainer={boardRef?.current}
        open={promotionMoves.length > 0}
        onSelectPromotion={onMove}
        promotionMoves={promotionMoves}
        setClose={() => setPromotionMoves([])}
        color={activeColor}
      />
    </DndContext>
  );
}
