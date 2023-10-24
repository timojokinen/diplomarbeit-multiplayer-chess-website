import zkeys from "../zobrist-keys.json";
import { Color } from "./constants";
import { BoardSquares } from "./types";
import { getRankFile } from "./util/board-utils";
import { xor } from "./util/bitwise-operations";

/**
 * Parsed zobrist keys from JSON
 * JSON does not support bigint, so need to parse it from string
 */
export const zobristKeys = {
  pieces: Object.entries(zkeys.pieces).reduce<Record<string, bigint>>(
    (prev, curr) => {
      return {
        ...prev,
        [curr[0]]: BigInt(curr[1]),
      };
    },
    {}
  ),
  enPassant: zkeys.enPassant.map(BigInt),
  castling: zkeys.castling.map(BigInt),
  side: zkeys.side.map(BigInt),
};

/**
 * Computes the zobrist hash for the given position
 * @param boardSquares
 * @param castlingRights
 * @param enPassantSquare
 * @param side
 * @see Algorithm: https://www.chessprogramming.org/Zobrist_Hashing
 * @returns Zobrist Hash as BigInt
 */
export function computeZobristHash(
  boardSquares: BoardSquares,
  castlingRights: number,
  enPassantSquare: number | null,
  side: Color
): bigint {
  let hash = 0n;

  for (let square = 0; square < 64; square++) {
    const piece = boardSquares[square];
    if (!piece) continue;
    hash = xor(hash, zobristKeys.pieces[`${piece}${square}`]);
  }

  if (enPassantSquare) {
    const { file } = getRankFile(enPassantSquare);
    hash ^= zobristKeys.enPassant[file];
  }

  hash ^= zobristKeys.castling[castlingRights];
  hash ^= zobristKeys.side[side];

  return hash;
}
