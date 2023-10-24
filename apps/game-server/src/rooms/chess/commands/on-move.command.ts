import { Command } from "@colyseus/command";
import { ServerMessage } from "../constants";
import { logger } from "colyseus";
import { prismaClient } from "../../../server";
import { Prisma } from "ks-database";
import { StartClockCommand } from "./start-clock.command";
import { StopClockCommand } from "./stop-clock.command";
import { ChessRoom } from "../chess.room";

type Payload = {
  sessionId: string;
  move: string;
};

export class OnMoveCommand extends Command<ChessRoom, Payload> {
  async execute(payload: Payload) {
    if (!this.state.ready || this.room.board.gameOutcome) return; // Throw error

    const player = this.state.players.get(payload.sessionId);
    if (!player) return; // Throw error

    if (player.color !== this.room.board.activeColor) return; // Throw error

    // Reset draw offer on opponent move
    if (
      this.room.state.drawOfferBy &&
      this.room.state.drawOfferBy !== payload.sessionId
    ) {
      this.room.state.drawOfferBy = null;
    }

    try {
      this.room.board.makeMove(payload.move);

      this.room.dispatcher.dispatch(new StopClockCommand(), {
        color: player.color,
      });

      this.room.dispatcher.dispatch(new StartClockCommand(), {
        color: player.color ^ 1,
      });

      const opponentClient = this.room.clients.find(
        (c) => c.sessionId !== payload.sessionId
      );

      // Send move to opponent
      opponentClient?.send(ServerMessage.OpponentMove, {
        move: payload.move,
      });

      if (this.room.gameId) {
        const moves = this.room.board.moveHistory.map((move) =>
          move.toString()
        ) as Prisma.JsonArray;

        await prismaClient.game.update({
          where: {
            id: this.room.gameId,
          },
          data: {
            moves,
            moveCount: Math.ceil(moves.length / 2),
          },
        });
      }
    } catch (err) {
      // TODO: Handle illegal moves and uncaught exceptions
      logger.error(err);
    }
  }
}
