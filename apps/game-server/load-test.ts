import { Client } from "colyseus.js";
import { cli, Options } from "@colyseus/loadtest";
import { ChessRoomSchema } from "./src/rooms/chess/room-state";
import ChessBoard, { Color } from "ks-engine";
import { ClientMessage, ServerMessage } from "./src/rooms/chess/constants";

function random(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

async function main(options: Options) {
  let firstMoveMade = false;

  const board = ChessBoard.fromInitialPosition();
  const client = new Client("ws://localhost:8080");
  const room = await client.joinOrCreate<ChessRoomSchema>(options.roomName, {
    timeControl: {
      time: 300,
      increment: 2,
    },
  });

  const makeRandomMove = () => {
    setTimeout(
      () => {
        const move =
          board.legalMoves[Math.floor(Math.random() * board.legalMoves.length)];
        if (!board.gameOutcome) {
          board.makeMove(move);
          room.send(ClientMessage.Move, { move: move.toString() });
        }
      },
      random(1000, 6000)
    );
  };

  room.onMessage("*", (type, message) => {
    if (type === ServerMessage.OpponentMove) {
      board.makeMove(message.move);
      makeRandomMove();
    }

    if (type === ServerMessage.GameConcluded) {
      setTimeout(() => {
        room.leave();
      }, 1000);
    }
  });

  room.onStateChange((state) => {
    if (state.ready && !firstMoveMade) {
      const [_, player] = Array.from(state.players).find(
        ([clientId]) => clientId === room.sessionId
      )!;

      if (player.color === Color.White) {
        makeRandomMove();
        firstMoveMade = true;
      }
    }
  });
}

cli(main);
