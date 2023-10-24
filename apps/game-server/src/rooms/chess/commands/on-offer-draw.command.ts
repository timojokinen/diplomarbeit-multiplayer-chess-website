import { Command } from "@colyseus/command";
import { ChessRoom } from "../chess.room";

type Payload = {
  sessionId: string;
};

export class OnOfferDrawCommand extends Command<ChessRoom, Payload> {
  execute(payload: Payload) {
    if (!this.state.ready || this.room.board.gameOutcome) return;

    const player = this.state.players.get(payload.sessionId);
    if (!player) return;

    // Set draw offer session id
    this.room.state.drawOfferBy = payload.sessionId;
  }
}
