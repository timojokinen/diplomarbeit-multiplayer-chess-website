import { Command } from "@colyseus/command";
import { PlayerSchema } from "../room-state";
import { InitGameCommand } from "./init-game.command";
import { logger } from "colyseus";
import { User } from "ks-database";
import { ChessRoom } from "../chess.room";

type Payload = {
  sessionId: string;
  user: User | { anonymous: boolean };
};

export class OnJoinCommand extends Command<ChessRoom, Payload> {
  execute(payload: Payload) {
    const player = new PlayerSchema().assign({
      sessionId: payload.sessionId,
      ...this.getUserState(payload.user),
    });
    this.state.players.set(payload.sessionId, player);

    // Assign colors randomly
    if (this.state.players.size === 2) {
      logger.debug("Room populated, locking...", { id: this.room.roomId });
      this.room.lock();
      this.room.dispatcher.dispatch(new InitGameCommand());
    } else {
      if ("anonymous" in payload.user && payload.user.anonymous) {
        this.room.setMetadata({ challenger: "Anonymous" });
      } else if ("name" in payload.user && payload.user.name) {
        this.room.setMetadata({ challenger: payload.user.name });
      }
    }
  }

  private getUserState(user: User | { anonymous: boolean }) {
    if ("anonymous" in user) {
      return { anonymous: true, name: "Anonymous opponent", avatar: null };
    } else {
      return {
        userId: user.id!,
        name: user.name!,
        avatar: user.image,
        anonymous: false,
      };
    }
  }
}
