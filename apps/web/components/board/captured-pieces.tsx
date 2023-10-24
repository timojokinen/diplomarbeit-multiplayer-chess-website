import { ColoredPieceString } from "ks-engine";
import { Piece } from "./pieces";

type Props = {
  pieces: ColoredPieceString[];
};

/**
 * Displays a list of captured pieces sorted by their value (ASC)
 *
 * Pawn = 1
 * Bishop = 3
 * Knight = 3
 * Rook = 5
 * Queen = 9
 */
export default function CapturedPieces({ pieces }: Props) {
  const pieceValues = {
    p: 1,
    b: 3,
    n: 3,
    r: 5,
    q: 9,
  };

  return (
    <div className="flex">
      {pieces
        .sort(
          (a, b) => pieceValues[a.toLowerCase()] - pieceValues[b.toLowerCase()]
        )
        .map((piece, idx) => (
          <div key={idx} className="w-5">
            <Piece piece={piece} />
          </div>
        ))}
    </div>
  );
}
