import { Command } from "@colyseus/command";
import { Color } from "ks-engine";
import { ChessRoom } from "../chess.room";

type StopClockCommandPayload = {
  color: Color;
};

export class StopClockCommand extends Command<
  ChessRoom,
  StopClockCommandPayload
> {
  async execute(payload: StopClockCommandPayload) {
    if (
      !this.room.timer ||
      !this.room.timer.active ||
      !this.state.timeControl
    ) {
      return;
    }

    const remainingTime = payload.color
      ? this.state.timeControl.black
      : this.state.timeControl.white;

    this.room.state.timeControl.isTicking = false;
    this.room.timer.pause();
    this.room.timer.clear();

    const incrementMs = (this.room.metadata.timeControl?.increment ?? 0) * 1000;
    const newTime = remainingTime - this.room.timer.elapsedTime + incrementMs;

    this.state.timeControl.assign({
      [payload.color ? "black" : "white"]: newTime,
    });
  }
}
