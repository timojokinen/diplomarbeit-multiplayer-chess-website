import gamesDb from "../games-db.json";
import { ChessBoard } from "../src/board";

describe("ChessBoard Class", () => {
  it("should play the full game without errors", () => {
    gamesDb.forEach((game) => {
      const board = ChessBoard.fromInitialPosition();

      game.forEach((move) => {
        board.makeMove(move);
      });
    });
  });
});
