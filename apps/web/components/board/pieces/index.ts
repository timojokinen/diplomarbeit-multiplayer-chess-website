import { HTMLAttributes } from "react";
import DraggablePiece from "./piece";
import { Color } from "ks-engine";

export { Piece } from "./piece";

export type PieceProps = HTMLAttributes<HTMLDivElement> & {
  pieceColor: Color;
};

export default DraggablePiece;
