import { Command } from "@colyseus/command";
import { prismaClient } from "../../../server";
import { ServerMessage } from "../constants";
import { boardSquaresToPiecePlacement } from "ks-engine";
import { ChessRoom } from "../chess.room";

export class ConcludeGameCommand extends Command<ChessRoom> {
  async execute() {
    const gameOutcome = this.room.board.gameOutcome;
    if (!gameOutcome) return; // Game is still in progress

    this.state.drawOfferBy = null;
    this.clock.clear();
    this.room.timer?.clear();
    if (this.state.timeControl) {
      this.state.timeControl.isTicking = false;
    }

    if (this.room.gameId) {
      await prismaClient.game.update({
        where: {
          id: this.room.gameId,
        },
        data: {
          lastPositionSnapshot: boardSquaresToPiecePlacement(
            this.room.board.boardSquares
          ),
          result: gameOutcome.result,
          resultType: gameOutcome.type,
        },
      });
    }

    this.room.broadcast(ServerMessage.GameConcluded, {
      gameOutcome,
    });
  }
}
