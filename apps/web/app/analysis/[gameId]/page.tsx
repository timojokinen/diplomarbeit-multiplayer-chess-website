import BoardProvider from "@/components/board/board-context";
import { prisma } from "@/db";
import AnalysisBoard from "../_components/analysis-board";

export default async function Page({ params }: { params: { gameId: string } }) {
  const game = await prisma.game.findFirst({ where: { id: params.gameId } });
  if (!game) {
    return null;
  }

  return (
    <BoardProvider game={game}>
      <AnalysisBoard />
    </BoardProvider>
  );
}
