"use client";

import Board from "@/components/board";
import { BoardContext } from "@/components/board/board-context";
import { ColyseusContext } from "@/components/colyseus-context";

import { getPieceColor } from "@/lib/utils";
import { Color, GameOutcome, Move } from "ks-engine";
import { ClientMessage, ServerMessage } from "ks-game-server";
import { useContext, useEffect, useState } from "react";
import BoardControls from "./board-controls";
import GameConcludedDialog from "./game-concluded-dialog";
import Player from "./player";

export default function LiveMatch() {
  const { room, player, opponent } = useContext(ColyseusContext);
  const [conclusion, setConclusion] = useState<any>(null);
  const [conclusionModalOpen, setConclusionModalOpen] =
    useState<boolean>(false);

  const {
    legalMoves,
    makeMove,
    boardSquares,
    activeColor,
    capturedPieces,
    boardRef,
    isFlipped,
    setIsFlipped,
  } = useContext(BoardContext);

  useEffect(() => {
    setIsFlipped(player?.color === Color.Black);
  }, [player?.color, setIsFlipped]);

  useEffect(() => {
    let unlistenOpponentMove = room?.onMessage<{ move: string }>(
      ServerMessage.OpponentMove,
      ({ move }) => {
        makeMove(move);
      }
    );

    let unlistenConcluded = room?.onMessage<{ gameOutcome: GameOutcome }>(
      ServerMessage.GameConcluded,
      (c) => {
        setConclusion(c.gameOutcome);
        setConclusionModalOpen(true);
      }
    );

    return () => {
      unlistenOpponentMove?.();
      unlistenConcluded?.();
    };
  }, [makeMove, room]);

  const handleMove = (move: Move): void => {
    if (getPieceColor(move.piece) !== activeColor) return;
    if (player?.color !== activeColor) return;
    makeMove(move);
    room?.send(ClientMessage.Move, { move: move.toString() });
  };

  return (
    <section className="flex flex-col gap-4 pb-12">
      {opponent && (
        <Player
          player={opponent}
          capturedPieces={capturedPieces[isFlipped ? Color.White : Color.Black]}
        />
      )}
      <div className="grid 2xl:grid-cols-3 grid-cols-2 gap-16">
        <div className="2xl:col-span-2">
          <Board
            activeColor={activeColor}
            legalMoves={legalMoves}
            onMove={handleMove}
            boardSquares={boardSquares}
            flipped={isFlipped}
          />
          <GameConcludedDialog
            open={conclusion && conclusionModalOpen}
            conclusion={conclusion}
            boardContainer={boardRef?.current}
            onClose={() => setConclusionModalOpen(false)}
          />
        </div>
        <div>
          <BoardControls />
        </div>
      </div>
      {player && (
        <Player
          player={player}
          capturedPieces={capturedPieces[isFlipped ? Color.Black : Color.White]}
        />
      )}
    </section>
  );
}
