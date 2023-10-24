"use client";

import MoveHistoryNavigation from "@/components/board/move-history-navigation";
import { ColyseusContext } from "@/components/colyseus-context";
import { Button } from "@/components/ui/button";
import { ClientMessage } from "ks-game-server";
import { useContext, useEffect, useState } from "react";

export default function BoardControls() {
  const { room, player } = useContext(ColyseusContext);
  const [drawOffer, setDrawOffer] = useState<boolean>(false);

  useEffect(() => {
    let unlisten = room?.state.listen("drawOfferBy", (drawOfferBy) => {
      if (drawOfferBy && drawOfferBy !== player?.sessionId) {
        setDrawOffer(true);
      } else {
        setDrawOffer(false);
      }
    });
    return () => {
      unlisten?.();
    };
  }, [player?.sessionId, room]);

  const resign = () => {
    room?.send(ClientMessage.Resign);
  };

  const offerDraw = () => {
    if (drawOffer) {
      room?.send(ClientMessage.AcceptDraw);
    } else {
      room?.send(ClientMessage.OfferDraw);
    }
  };

  const acceptDraw = () => {
    room?.send(ClientMessage.AcceptDraw);
  };

  return (
    <div className="max-w-[300px] xl:max-w-[400px] w-full flex flex-col gap-4 h-full">
      <div className="flex-1 grow-0">
        <MoveHistoryNavigation />
      </div>
      {drawOffer && (
        <div className="border-4 border-indigo-500 rounded-lg p-4 flex justify-between items-center bg-white">
          <span>Your opponent offers a draw.</span>
          <Button onClick={acceptDraw}>Accept</Button>
        </div>
      )}
      <div className="grid grid-cols-2 justify-end w-full gap-4">
        <Button variant="outline" onClick={offerDraw}>
          Offer draw
        </Button>
        <Button variant="outline" onClick={resign}>
          Resign
        </Button>
      </div>
    </div>
  );
}
