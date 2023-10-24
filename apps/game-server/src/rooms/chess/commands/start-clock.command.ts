import { Command } from "@colyseus/command";
import { Color, EndGameType, GameResult } from "ks-engine";
import { ChessRoom } from "../chess.room";
import { ConcludeGameCommand } from "./conclude-game.command";

type StartClockPayload = {
  color: Color;
};

export class StartClockCommand extends Command<ChessRoom, StartClockPayload> {
  async execute(payload: StartClockPayload) {
    if (!this.state.timeControl) return;

    const remainingTime = payload.color
      ? this.state.timeControl.black
      : this.state.timeControl.white;

    this.state.timeControl.isTicking = true;

    this.room.timer = this.clock.setTimeout(() => {
      const color = payload.color ? "black" : "white";
      this.state.timeControl[color] = 0;
      this.room.board.setGameOutcome({
        result: payload.color ? GameResult.WhiteWins : GameResult.BlackWins,
        type: EndGameType.Timeout,
      });
      this.room.dispatcher.dispatch(new ConcludeGameCommand());
    }, remainingTime);
  }
}
