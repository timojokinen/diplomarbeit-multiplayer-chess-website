import clsx from "clsx";
import { Color, ColoredPieceString, getSquareColor } from "ks-engine";
import { Piece } from "./pieces";

type Props = {
  index: number;
  piece: ColoredPieceString | null;
};

function NonInteractiveSquare({ index, piece }: Props) {
  const color = getSquareColor(index);

  return (
    <div
      className={clsx(
        "w-full h-full flex items-center justify-center relative aspect-square transition duration-75 p-0.5",
        {
          "bg-indigo-500": color === Color.Black,
          "bg-indigo-100": color === Color.White,
        }
      )}
    >
      <div className="relative w-full h-full">
        {typeof piece === "string" && (
          <Piece
            piece={piece}
            className="absolute inset-0 z-10 !cursor-default"
          />
        )}
      </div>
    </div>
  );
}

export default NonInteractiveSquare;
