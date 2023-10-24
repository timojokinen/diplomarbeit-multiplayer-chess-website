import { useDroppable } from "@dnd-kit/core";
import clsx from "clsx";
import { Color, ColoredPieceString, getSquareColor } from "ks-engine";
import { useId } from "react";
import DraggablePiece from "./pieces";
import React from "react";

type Props = {
  index: number;
  piece: ColoredPieceString | null;
  canDrop: boolean;
};

function Square({ index, piece, canDrop }: Props) {
  const color = getSquareColor(index);
  const id = useId();

  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      squareIndex: index,
    },
    disabled: !canDrop,
  });

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        "w-full h-full flex items-center justify-center relative aspect-square transition duration-75 p-0.5",
        {
          "bg-indigo-500": color === Color.Black,
          "bg-indigo-100": color === Color.White,
          "shadow-[inset_0px_0px_0px_5px_#fff]": isOver,
        }
      )}
    >
      <div className="relative w-full h-full">
        {typeof piece === "string" && (
          <DraggablePiece
            squareIndex={index}
            piece={piece}
            className="absolute inset-0 z-10"
          />
        )}
        {canDrop && (
          <div className="w-full h-full absolute inset-0 z-0 flex items-center justify-center">
            <div
              className={clsx({
                "rounded-full h-[30%] w-[30%] bg-black opacity-30":
                  canDrop && !piece,
                "rounded-full border-[6px] border-black opacity-20 bg-transparent w-full h-full p-4":
                  canDrop && piece,
              })}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(Square);
