import { Command } from "@colyseus/command";
import { ConcludeGameCommand } from "./conclude-game.command";
import { ChessRoom } from "../chess.room";

type Payload = {
  sessionId: string;
};

export class OnResignCommand extends Command<ChessRoom, Payload> {
  execute(payload: Payload) {
    if (!this.state.ready || this.room.board.gameOutcome) return; // Throw error

    const player = this.state.players.get(payload.sessionId);
    if (!player) return; // Throw error

    this.room.board.resign(player.color);
    this.room.dispatcher.dispatch(new ConcludeGameCommand());
  }
}
