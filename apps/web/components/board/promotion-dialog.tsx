import { Color, type Move } from "ks-engine";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Piece } from "./pieces";

type Props = {
  setClose: () => void;
  open: boolean;
  boardContainer: HTMLDivElement | null;
  promotionMoves: Move[];
  onSelectPromotion: (move: Move) => void;
  color: Color;
};

export default function PromotionDialog({
  setClose,
  open,
  promotionMoves,
  boardContainer,
  onSelectPromotion,
  color,
}: Props) {
  const handleSelectPromotion = (move: Move) => {
    onSelectPromotion(move);
    setClose();
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="!max-w-none !w-auto"
        onClose={setClose}
        container={boardContainer}
      >
        <DialogHeader>
          <DialogTitle>Promotion</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center items-center">
          <div className="inline-grid grid-cols-2 gap-4">
            {promotionMoves.map((move) => (
              <button
                onClick={() => {
                  handleSelectPromotion(move);
                }}
                className="w-24 h-24 inline border aspect-square rounded-md hover:bg-accent"
                key={move.toString()}
              >
                <Piece
                  className="w-full cursor-pointer"
                  piece={
                    color
                      ? move.promotionPiece!.toLowerCase()
                      : move.promotionPiece!
                  }
                />
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
