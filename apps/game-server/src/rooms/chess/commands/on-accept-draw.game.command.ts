import { Command } from "@colyseus/command";
import { DrawType, GameResult } from "ks-engine";
import { ConcludeGameCommand } from "./conclude-game.command";
import { ChessRoom } from "../chess.room";

type Payload = {
  sessionId: string;
};

export class OnAcceptDrawCommand extends Command<ChessRoom, Payload> {
  execute(payload: Payload) {
    if (!this.state.ready || this.room.board.gameOutcome) return;

    const player = this.state.players.get(payload.sessionId);
    if (!player) return;

    if (player.sessionId === this.room.state.drawOfferBy) return;

    // Set draw offer session id
    this.room.state.drawOfferBy = null;
    this.room.board.setGameOutcome({
      result: GameResult.Draw,
      type: DrawType.Agreement,
    });

    this.room.dispatcher.dispatch(new ConcludeGameCommand());
  }
}
