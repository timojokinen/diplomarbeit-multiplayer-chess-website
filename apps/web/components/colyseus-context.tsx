"use client";

import { retrieveGameServerAccessToken } from "@/lib/auth";
import { Client, RoomAvailable, type Room } from "colyseus.js";
import type {
  ChessRoomSchema,
  ChessRoomState,
  PlayerState,
  TimeControlState,
} from "ks-game-server";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";

type ColyseusContextState = {
  colyseusClient: Client;
  room: Room<ChessRoomSchema> | null;
  player: (PlayerState & { timeRemaining: number | null }) | null;
  opponent: (PlayerState & { timeRemaining: number | null }) | null;
  joinRoom: (roomId: string) => Promise<void>;
  createRoom: (timeFormat?: {
    time: number;
    increment?: number;
  }) => Promise<void>;
  getAvailableRooms: () => Promise<RoomAvailable<any>[]>;
  isClockTicking: boolean;
};

export const ColyseusContext = React.createContext<ColyseusContextState>(
  undefined as any
);

export default function ColyseusProvider({ children }) {
  const colyseus = useRef(new Client("ws://localhost:8080"));
  const [room, setRoom] = useState<Room<ChessRoomSchema> | null>(null);
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [clock, setClock] = useState<TimeControlState | null>(null);
  const router = useRouter();

  const player = useMemo(() => {
    const player = players.find((p) => p.sessionId === room?.sessionId) ?? null;
    if (!player) {
      return null;
    }

    const timeRemaining = clock
      ? clock[player.color ? "black" : "white"]
      : null;

    return { ...player, timeRemaining };
  }, [players, room, clock]);

  const opponent = useMemo(() => {
    const player = players.find((p) => p.sessionId !== room?.sessionId) ?? null;
    if (!player) {
      return null;
    }

    const timeRemaining = clock
      ? clock[player.color ? "black" : "white"]
      : null;

    return { ...player, timeRemaining };
  }, [players, room, clock]);

  const joinRoom = async (roomId: string) => {
    const accessToken = await retrieveGameServerAccessToken();
    const connectedRoom = await colyseus.current.joinById<ChessRoomState>(
      roomId,
      { accessToken }
    );
    setRoom(connectedRoom as any);
  };

  const createRoom = async (args?: { time: number; increment?: number }) => {
    const accessToken = await retrieveGameServerAccessToken();
    const createdRoom = await colyseus.current.create<ChessRoomState>("chess", {
      timeControl: args ? { ...args } : undefined,
      accessToken,
    });
    setRoom(createdRoom as any);
  };

  const getAvailableRooms = () => {
    return colyseus.current.getAvailableRooms("chess");
  };

  useEffect(() => {
    room?.onStateChange((state) => {
      setPlayers(Array.from(state.players.values()));
      setClock(state.timeControl);
    });

    return () => {
      room?.removeAllListeners();
    };
  }, [room]);

  useEffect(() => {
    let unlisten = room?.state.listen("ready", (ready) => {
      if (ready) {
        router.push("/game/live/" + room.roomId);
        unlisten?.();
      }
    });
    return () => {
      unlisten?.();
    };
  }, [room, router]);

  return (
    <ColyseusContext.Provider
      value={{
        colyseusClient: colyseus.current,
        joinRoom,
        createRoom,
        getAvailableRooms,
        room,
        player,
        opponent,
        isClockTicking: clock?.isTicking || false,
      }}
    >
      {children}
    </ColyseusContext.Provider>
  );
}
