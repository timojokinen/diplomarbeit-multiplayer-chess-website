import { BoardSquares, ColoredPieceString } from "./types";

/**
 * Determine if there are any triplets in an array
 */
export function hasTriplets(arr: Array<any>) {
  const hashCounts: Record<any, number> = {};

  for (let hash of arr) {
    if (hashCounts[hash] === undefined) {
      hashCounts[hash] = 1;
    } else {
      hashCounts[hash] += 1;
    }

    if (hashCounts[hash] >= 3) {
      return true; // Found a value that occurs at least 3 times
    }
  }

  return false; // No value found that occurs at least 3 times
}
