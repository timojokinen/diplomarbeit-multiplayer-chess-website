import { BoardSquares } from "ks-engine";
import NonInteractiveSquare from "./non-interactive-square";

type Props = {
  boardSquares: BoardSquares;
};

export default function NonInteractiveBoard({ boardSquares }: Props) {
  return (
    <div className="grid grid-cols-8 grid-rows-8 w-full aspect-square rounded overflow-hidden transform relative">
      {boardSquares.map((_, i) => {
        return (
          <NonInteractiveSquare piece={boardSquares[i]} key={i} index={i} />
        );
      })}
    </div>
  );
}
