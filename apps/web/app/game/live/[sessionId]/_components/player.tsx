import CapturedPieces from "@/components/board/captured-pieces";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ColoredPieceString } from "ks-engine";
import { PlayerState } from "ks-game-server";
import Clock from "./clock";
import { useContext } from "react";
import { ColyseusContext } from "@/components/colyseus-context";
import { BoardContext } from "@/components/board/board-context";

type Props = {
  player: PlayerState & { timeRemaining: number | null };
  capturedPieces: ColoredPieceString[];
};

export default function Player({ player, capturedPieces }: Props) {
  const { isClockTicking } = useContext(ColyseusContext);
  const { activeColor } = useContext(BoardContext);
  return (
    <div className="grid 2xl:grid-cols-3 grid-cols-2 gap-16">
      <div className="flex justify-between items-center 2xl:col-span-2">
        <div className="flex gap-4">
          <Avatar className="rounded-full">
            <AvatarImage src={player.avatar ?? undefined}></AvatarImage>
            <AvatarFallback>?</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="font-semibold leading-tight">{player.name}</div>
            <div className="flex">
              <CapturedPieces pieces={capturedPieces} />
            </div>
          </div>
        </div>
        <Clock
          timeRemaining={player.timeRemaining}
          color={player.color}
          isTicking={isClockTicking && activeColor === player.color}
        />
      </div>
    </div>
  );
}
