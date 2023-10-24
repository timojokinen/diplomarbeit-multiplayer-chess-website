import fs from "fs";
import { random64 } from "../util/rng";

console.log("Generating zobrist keys...");
const pieces = ["P", "N", "B", "R", "Q", "K", "p", "n", "b", "r", "q", "k"];

const pieceKeys: Record<string, bigint> = {};

console.log("Generating keys for pieces...");
for (let i = 0; i < 64; i++) {
  for (const piece of pieces) {
    const key = `${piece}${i}`;
    pieceKeys[key] = random64();
  }
}

console.log("Generating keys for enpassant files...");
const enPassantKeys: bigint[] = [];

for (let i = 0; i < 8; i++) {
  enPassantKeys[i] = random64();
}

console.log("Generating keys for castling rights...");
const castlingKeys: bigint[] = [];

for (let i = 0; i < 16; i++) {
  castlingKeys[i] = random64();
}

console.log("Generating side keys...");
const sideKeys = [random64(), random64()];

fs.writeFileSync(
  "./zobrist-keys.json",
  JSON.stringify(
    {
      pieces: pieceKeys,
      enPassant: enPassantKeys,
      side: sideKeys,
      castling: castlingKeys,
    },
    (_, value) => (typeof value === "bigint" ? value.toString() : value)
  )
);

console.log("Done.");
