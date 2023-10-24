import { ChessBoard } from "./board";
import { benchmark } from "./util/debugging";

function calculateAverage(array: number[]) {
  var total = 0;
  var count = 0;

  array.forEach(function (item) {
    total += item;
    count++;
  });

  return total / count;
}

const totalBenchmarks: number[] = [];
const benchmarkGame = () => {
  let board = ChessBoard.fromInitialPosition();

  while (!board.gameOutcome) {
    const move =
      board.legalMoves[Math.floor(Math.random() * board.legalMoves.length)];

    const stopBenchmark = benchmark();
    board.makeMove(move);
    const time = stopBenchmark();
    totalBenchmarks.push(time);
  }
};

for (let i = 0; i < 1000; i++) {
  benchmarkGame();
}

const totalAvg = calculateAverage(totalBenchmarks);
console.log("Total Average time in ms", totalAvg);
