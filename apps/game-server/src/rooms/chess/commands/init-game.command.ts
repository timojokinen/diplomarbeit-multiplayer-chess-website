import { Command } from "@colyseus/command";
import ChessBoard, { Color } from "ks-engine";
import { prismaClient } from "../../../server";
import { ChessRoom } from "../chess.room";
import { ConcludeGameCommand } from "./conclude-game.command";
import { TimeControlSchema } from "../room-state";

export class InitGameCommand extends Command<ChessRoom> {
  async execute() {
    let firstPlayerColor: Color;
    this.room.state.players.forEach((player) => {
      if (typeof firstPlayerColor !== "undefined") {
        player.color = firstPlayerColor ^ 1;
      } else {
        firstPlayerColor = Number(Math.random() < 0.5);
        player.color = firstPlayerColor;
      }
    });

    this.room.board = ChessBoard.fromInitialPosition();

    this.room.board.moveCallback = ({ gameOutcome }) => {
      if (gameOutcome) {
        this.room.dispatcher.dispatch(new ConcludeGameCommand());
      }
    };

    if (this.room.metadata.timeControl && this.room.metadata.timeControl.time) {
      this.state.timeControl = new TimeControlSchema().assign({
        white: this.room.metadata.timeControl.time * 1000,
        black: this.room.metadata.timeControl.time * 1000,
      });
    }

    const playerArray = Array.from(this.state.players.values());

    if (!playerArray.every((p) => p.anonymous)) {
      const game = await prismaClient.game.create({
        data: {
          baseTime: this.room.metadata.timeControl?.time,
          increment: this.room.metadata.timeControl?.increment,
          whitePlayerId:
            playerArray.find((p) => p.color === Color.White)?.userId ??
            undefined,
          blackPlayerId:
            playerArray.find((p) => p.color === Color.Black)?.userId ??
            undefined,
          moves: [],
          moveCount: 0,
        },
      });

      this.room.gameId = game.id;
    }

    this.clock.start();
    this.room.state.ready = true;
  }
}
