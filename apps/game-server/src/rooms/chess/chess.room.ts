import { Dispatcher } from "@colyseus/command";
import { Client, Delayed, Room, logger } from "colyseus";
import http from "http";
import ChessBoard, { EndGameType, GameResult } from "ks-engine";
import jwt from "jsonwebtoken";
import { OnJoinCommand } from "./commands/on-join.command";
import { OnMoveCommand } from "./commands/on-move.command";
import { ChessRoomSchema } from "./room-state";
import { ClientMessage } from "./constants";
import { OnResignCommand } from "./commands/on-resign.command";
import { OnOfferDrawCommand } from "./commands/on-offer-draw.command";
import { OnAcceptDrawCommand } from "./commands/on-accept-draw.game.command";
import { prismaClient } from "../../server";
import { ConcludeGameCommand } from "./commands/conclude-game.command";

export type TimeControl = {
  time: number;
  increment?: number;
};

export interface RoomOptions {
  timeControl: TimeControl | null;
  challenger: string;
}

export class ChessRoom extends Room<ChessRoomSchema, RoomOptions> {
  maxClients: number = 2;
  dispatcher = new Dispatcher(this);

  board: ChessBoard;
  gameId: string;

  timer: Delayed | null = null;

  onCreate(options: RoomOptions) {
    this.setState(new ChessRoomSchema());
    this.setMetadata({
      timeControl: options.timeControl,
    });

    this.onMessage<{ move: string }>(ClientMessage.Move, (client, payload) => {
      this.dispatcher.dispatch(new OnMoveCommand(), {
        sessionId: client.sessionId,
        move: payload.move,
      });
    });

    this.onMessage(ClientMessage.Resign, (client, payload) => {
      this.dispatcher.dispatch(new OnResignCommand(), {
        sessionId: client.sessionId,
      });
    });

    this.onMessage(ClientMessage.OfferDraw, (client, payload) => {
      this.dispatcher.dispatch(new OnOfferDrawCommand(), {
        sessionId: client.sessionId,
      });
    });

    this.onMessage(ClientMessage.AcceptDraw, (client, payload) => {
      this.dispatcher.dispatch(new OnAcceptDrawCommand(), {
        sessionId: client.sessionId,
      });
    });
  }

  async onAuth(client: Client, options: any, request: http.IncomingMessage) {
    if (!options.accessToken) return false;
    const secret = process.env.TOKEN_SECRET!;

    const verified = jwt.verify(options.accessToken, secret, {
      ignoreExpiration: false,
    });

    if (!verified || typeof verified !== "object") {
      return false;
    }

    if (verified.anonymous === true) {
      return { anonymous: true };
    } else if ("userId" in verified && typeof verified.userId === "string") {
      const user = await prismaClient.user.findFirstOrThrow({
        where: { id: verified.userId },
      });

      return user;
    }

    return false;
  }

  onJoin(client: Client, options: any, auth: any) {
    this.dispatcher.dispatch(new OnJoinCommand(), {
      sessionId: client.sessionId,
      user: auth,
    });
  }

  onLeave(client: Client, consented: boolean) {
    const player = this.state.players.get(client.sessionId);
    if (this.board && !this.board.gameOutcome) {
      this.board.setGameOutcome({
        result: player?.color ? GameResult.WhiteWins : GameResult.BlackWins,
        type: EndGameType.Abandonment,
      });

      this.dispatcher.dispatch(new ConcludeGameCommand());
    }

    logger.debug("Client disconnected", {
      sessionId: client.sessionId,
      consented,
    });
  }

  onDispose() {
    logger.debug("Disposing room ", { name: this.roomName, id: this.roomId });
    if (!this.board) return;
    if (!this.board.gameOutcome) {
      this.dispatcher.dispatch(new ConcludeGameCommand());
    }
  }
}
