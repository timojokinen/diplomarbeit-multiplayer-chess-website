"use client";

import { useContext, useEffect, useMemo, useRef } from "react";
import { BoardContext } from "./board-context";
import { Move } from "ks-engine";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import {
  ArrowLeft,
  ArrowLeftToLine,
  ArrowRight,
  ArrowRightToLine,
} from "lucide-react";

type FullMoveRowProps = {
  fullMoveNumber: number;
  moveWhite: Move;
  moveBlack?: Move;
  selectedMove: Move | null;
  onSelect: (move: Move) => void;
};

/**
 * Renders a table row with the moves of both colors and highlights the currently selected move.
 * A particular move can be selected by clicking on it.
 */
function FullMoveRow({
  fullMoveNumber,
  moveWhite,
  moveBlack,
  onSelect,
  selectedMove,
}: FullMoveRowProps) {
  return (
    <TableRow className="table-fixed w-full table">
      <TableCell className="font-bold text-neutral-400">
        {fullMoveNumber}
      </TableCell>
      <TableCell>
        <Button
          size="sm"
          onClick={() => onSelect(moveWhite)}
          variant="link"
          className={clsx({
            "!font-extrabold": selectedMove === moveWhite,
          })}
        >
          {moveWhite.toString()}
        </Button>
      </TableCell>
      <TableCell>
        {moveBlack && (
          <Button
            onClick={() => onSelect(moveBlack)}
            size="sm"
            variant="link"
            className={clsx({
              "!font-extrabold": selectedMove === moveBlack,
            })}
          >
            {moveBlack?.toString()}
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}

/**
 * A navigation that can be used alongside a board component.
 * Allows for cycling through positions and viewing the position that resultet from a particular move.
 */
export default function MoveHistoryNavigation() {
  const {
    moveHistory,
    selectedMove,
    viewPositionAfterMove,
    viewPreviousPosition,
    viewNextPosition,
  } = useContext(BoardContext);

  const historyScrollAreaRef = useRef<HTMLTableSectionElement>(null);

  useEffect(() => {
    if (historyScrollAreaRef.current) {
      historyScrollAreaRef.current.scrollTo(
        0,
        historyScrollAreaRef.current?.scrollHeight
      );
    }
  }, [moveHistory]);

  const groupedMoveHistory: Array<Move[]> = useMemo(
    () =>
      moveHistory.reduce(
        (prev, _, idx, arr) => {
          if (idx % 2 === 0) {
            prev.push(arr.slice(idx, idx + 2));
          }
          return prev;
        },
        [] as Array<Move[]>
      ),
    [moveHistory]
  );

  return (
    <div className="w-full flex flex-col h-full">
      <div className="border rounded-lg flex-1 mb-2 bg-white">
        <Table className="w-full">
          <TableHeader className="bg-neutral-100 table-fixed w-full table">
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>
                <span className="px-3">White</span>
              </TableHead>
              <TableHead className="px-3">
                <span className="px-3">Black</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody
            className="bg-white h-[400px] xl:animate-none 2xl:h-[600px] overflow-y-auto block"
            ref={historyScrollAreaRef}
          >
            {groupedMoveHistory.map((fullMove, idx) => {
              return (
                <FullMoveRow
                  moveWhite={fullMove[0]}
                  moveBlack={fullMove[1]}
                  key={idx}
                  onSelect={viewPositionAfterMove}
                  selectedMove={selectedMove}
                  fullMoveNumber={idx + 1}
                />
              );
            })}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => viewPositionAfterMove(moveHistory[0])}
          >
            <ArrowLeftToLine />
          </Button>
          <Button variant="outline" size="icon" onClick={viewPreviousPosition}>
            <ArrowLeft />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={viewNextPosition}>
            <ArrowRight />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              viewPositionAfterMove(moveHistory[moveHistory.length - 1])
            }
          >
            <ArrowRightToLine />
          </Button>
        </div>
      </div>
    </div>
  );
}
