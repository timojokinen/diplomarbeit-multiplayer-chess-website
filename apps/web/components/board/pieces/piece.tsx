"use client";

import { cn, getPieceColor } from "@/lib/utils";
import { useDraggable } from "@dnd-kit/core";
import React, { HTMLAttributes, useEffect, useId, useState } from "react";
import Bishop from "./bishop";
import King from "./king";
import Knight from "./knight";
import Pawn from "./pawn";
import Queen from "./queen";
import Rook from "./rook";

export type PieceDragItem = {
  piece: string;
  width?: number;
  height?: number;
  fromSquare: number;
};

export type PieceProps = {
  squareIndex: number;
  piece: string;
  className?: string;
};

const resolvePiece = (piece: string) => {
  switch (piece.toUpperCase()) {
    case "K":
      return King;
    case "Q":
      return Queen;
    case "R":
      return Rook;
    case "P":
      return Pawn;
    case "N":
      return Knight;
    case "B":
      return Bishop;
    default:
      return null;
  }
};

function DraggablePiece({ squareIndex, piece, className }: PieceProps) {
  const [mounted, setMounted] = useState(false);
  const id = useId();

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: {
      fromSquare: squareIndex,
      piece,
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Piece
      ref={setNodeRef}
      piece={piece}
      className={cn(className, "cursor-grab", {
        "opacity-0": isDragging,
      })}
      {...attributes}
      aria-describedby={mounted ? attributes["aria-describedby"] : undefined}
      {...listeners}
    ></Piece>
  );
}

export const Piece = React.forwardRef<
  HTMLDivElement,
  Omit<HTMLAttributes<HTMLDivElement>, "color"> &
    Omit<PieceProps, "squareIndex">
>(({ piece, className, ...rest }, ref) => {
  const color = getPieceColor(piece);

  const InternalPiece = resolvePiece(piece);

  return InternalPiece && color !== null ? (
    <InternalPiece
      pieceColor={color}
      ref={ref}
      className={className}
      {...rest}
    />
  ) : null;
});

Piece.displayName = "Piece";

export default React.memo(DraggablePiece);
