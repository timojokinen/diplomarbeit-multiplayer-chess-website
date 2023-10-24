import BoardContext from "@/components/board/board-context";
import LiveMatch from "./_components/live-match";

export default async function Game() {
  return (
    <div>
      <BoardContext>
        <LiveMatch />
      </BoardContext>
    </div>
  );
}
