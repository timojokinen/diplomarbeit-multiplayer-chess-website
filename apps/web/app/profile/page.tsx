import NonInteractiveBoard from "@/components/board/non-interactive-board";
import { Button } from "@/components/ui/button";
import { prisma } from "@/db";
import { authOptions } from "@/lib/auth";
import { resultTextMap, resultTypeTextMap } from "@/lib/utils";
import { parsePiecePlacement } from "ks-engine";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Profile() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/api/auth/signin");
  }

  const games = await prisma.game.findMany({
    where: {
      AND: {
        NOT: {
          result: null,
        },
        OR: [
          { blackPlayerId: session?.user.id },
          { whitePlayerId: session?.user.id },
        ],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      blackPlayer: true,
      whitePlayer: true,
    },
  });

  return (
    <div className="pb-32 grid grid-cols-3 gap-8">
      <div className="col-span-2">
        <div className="divide-y bg-white p-8 rounded border">
          {games.length === 0 && (
            <span>
              No online matches found. Play online to see your recent matches
              here.
            </span>
          )}
          {games.map((game) => {
            const boardSquares = parsePiecePlacement(
              game.lastPositionSnapshot!
            );
            return (
              <div
                className="flex items-center justify-between py-4 text-lg"
                key={game.id}
              >
                <div className="flex gap-8">
                  <div className="w-[200px]">
                    <NonInteractiveBoard boardSquares={boardSquares} />
                  </div>
                  <div className="p-2 flex flex-col justify-between">
                    <div>
                      <div className="font-bold text-xl font-serif leading-tight">
                        {game.whitePlayer?.name} (white){" "}
                        <span className="font-normal">vs</span>{" "}
                        {game.blackPlayer?.name} (black)
                      </div>
                      <div className="mb-2 leading-tight">
                        {resultTextMap[game.result!]}{" "}
                        {resultTypeTextMap[game.resultType!]}
                      </div>
                    </div>
                    <div className="mb-2 leading-tight">
                      <div>Moves: {game.moveCount}</div>
                      {game.baseTime ? (
                        <div>
                          Time control: {game.baseTime / 60}
                          {game.increment ? "+" + game.increment : ""}
                        </div>
                      ) : (
                        <div>Time control: None</div>
                      )}
                    </div>
                    <div className="leading-tight text-neutral-500">
                      {game.createdAt.toLocaleDateString("en-CH")}
                    </div>
                  </div>
                </div>
                <div>
                  <Button asChild>
                    <Link href={"/analysis/" + game.id}>Analysis</Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
