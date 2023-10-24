import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { resultTextMap, resultTypeTextMap } from "@/lib/utils";
import { type GameOutcome } from "ks-engine";

type Props = {
  conclusion: GameOutcome;
  boardContainer: HTMLDivElement | null;
  open: boolean;
  onClose: () => void;
};

export default function GameConcludedDialog({
  conclusion,
  boardContainer,
  open,
  onClose,
}: Props) {
  return (
    <Dialog open={open}>
      <DialogContent
        onClose={onClose}
        className="!w-auto !max-w-auto min-w-[300px]"
        container={boardContainer}
      >
        <DialogHeader>
          <DialogTitle>{resultTextMap[conclusion?.result]}</DialogTitle>
          <DialogDescription>
            {resultTypeTextMap[conclusion?.type]}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center items-center">
          <Button>Go back to matchmaking</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
