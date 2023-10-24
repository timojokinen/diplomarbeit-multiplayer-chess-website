"use client";

import { ColyseusContext } from "@/components/colyseus-context";
import { useContext } from "react";

export default function CreateChallenge() {
  const { createRoom } = useContext(ColyseusContext);

  return (
    <div className="bg-white rounded border p-4">
      <h2 className="mb-4 text-2xl font-bold tracking-tight">
        Create a challenge
      </h2>
      <div className=" grid grid-cols-3 gap-4">
        <button
          className="aspect-square border rounded bg-white flex items-center justify-center flex-col hover:shadow hover:text-accent-foreground p-2"
          onClick={() => createRoom({ time: 60 })}
        >
          <div className="font-bold">Bullet</div>
          <div>1 min</div>
        </button>
        <button
          className="aspect-square border rounded bg-white flex items-center justify-center flex-col hover:shadow hover:text-accent-foreground p-2"
          onClick={() => createRoom({ time: 60, increment: 1 })}
        >
          <div className="font-bold">Bullet</div>
          <div>1 min + 1</div>
        </button>
        <button
          className="aspect-square border rounded bg-white flex items-center justify-center flex-col hover:shadow hover:text-accent-foreground p-2"
          onClick={() => createRoom({ time: 180 })}
        >
          <div className="font-bold">Blitz</div>
          <div>3 min</div>
        </button>
        <button
          className="aspect-square border rounded bg-white flex items-center justify-center flex-col hover:shadow hover:text-accent-foreground p-2"
          onClick={() => createRoom({ time: 180, increment: 2 })}
        >
          <div className="font-bold">Blitz</div>
          <div>3 min + 2</div>
        </button>
        <button
          className="aspect-square border rounded bg-white flex items-center justify-center flex-col hover:shadow hover:text-accent-foreground p-2"
          onClick={() => createRoom({ time: 300 })}
        >
          <div className="font-bold">Rapid</div>
          <div>5 min</div>
        </button>
        <button
          className="aspect-square border rounded bg-white flex items-center justify-center flex-col hover:shadow hover:text-accent-foreground p-2"
          onClick={() => createRoom({ time: 300, increment: 3 })}
        >
          <div className="font-bold">Rapid</div>
          <div>5 min + 3</div>
        </button>
        <button
          className="aspect-square border rounded bg-white flex items-center justify-center flex-col hover:shadow hover:text-accent-foreground p-2"
          onClick={() => createRoom({ time: 600 })}
        >
          <div className="font-bold">Rapid</div>
          <div>10 min</div>
        </button>
        <button
          className="aspect-square border rounded bg-white flex items-center justify-center flex-col hover:shadow hover:text-accent-foreground p-2"
          onClick={() => createRoom({ time: 600, increment: 5 })}
        >
          <div className="font-bold">Rapid</div>
          <div>10 min + 5</div>
        </button>
        <button
          className="aspect-square border rounded bg-white flex items-center justify-center flex-col hover:shadow hover:text-accent-foreground p-2"
          onClick={() => createRoom()}
        >
          <div className="font-bold">No time control</div>
        </button>
      </div>
    </div>
  );
}
