import readline from "readline/promises";
import { ChessBoard } from "./board";
import { printBoard } from "./util/debugging";

let board = ChessBoard.fromInitialPosition();
printBoard(board.boardSquares);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const startLoop = async () => {
  while (!board.gameOutcome) {
    console.log(
      "Legal moves: " +
        board.legalMoves.map((move) => move.toString()).join(", ")
    );

    const moveNotation = await rl.question(
      "Enter move for " + (board.activeColor ? "black" : "white") + ": "
    );

    const move = board.legalMoves.find(
      (move) => move.toString() === moveNotation
    );
    if (!move) {
      console.log("Invalid move");
      continue;
    }

    board.makeMove(move);
    printBoard(board.boardSquares);
  }
};
startLoop().then(() => {
  rl.close();
});
