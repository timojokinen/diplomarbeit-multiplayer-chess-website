"use client";
import { ColyseusContext } from "@/components/colyseus-context";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RoomAvailable } from "colyseus.js";
import { useCallback, useContext, useEffect, useState } from "react";

type RoomMetadata = {
  challenger: string;
  timeControl?: {
    time: number;
    increment?: number;
  };
};

function ChallengeListItem({ room }: { room: RoomAvailable<RoomMetadata> }) {
  const { joinRoom } = useContext(ColyseusContext);

  if (!room.metadata)
    throw new Error("Corrupt room without metadata => " + room.roomId);

  const { timeControl, challenger } = room.metadata;

  const time = timeControl ? timeControl.time / 60 + " minutes" : "-";
  const increment = timeControl?.increment
    ? timeControl?.increment + " seconds"
    : "-";

  return (
    <TableRow key={room.roomId}>
      <TableCell>{room.roomId}</TableCell>
      <TableCell>{challenger}</TableCell>
      <TableCell>{time}</TableCell>
      <TableCell>{increment}</TableCell>
      <TableCell>
        <Button variant="outline" onClick={() => joinRoom(room.roomId)}>
          Join
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default function ChallengeList() {
  const { getAvailableRooms } = useContext(ColyseusContext);

  const [availableRooms, setAvailableRooms] = useState<
    RoomAvailable<{
      challenger: string;
    }>[]
  >([]);

  const fetchRooms = useCallback(async () => {
    const rooms = await getAvailableRooms();
    setAvailableRooms(rooms);
  }, [getAvailableRooms]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return (
    <div className="bg-white p-4 rounded border">
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold tracking-tight">Join a game</h2>
        <Button onClick={getAvailableRooms}>Refresh</Button>
      </div>
      <Table>
        <TableCaption>Available rooms</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>RoomId</TableHead>
            <TableHead>Challenger</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Increment</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {availableRooms.map((room) => (
            <ChallengeListItem key={room.roomId} room={room} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
