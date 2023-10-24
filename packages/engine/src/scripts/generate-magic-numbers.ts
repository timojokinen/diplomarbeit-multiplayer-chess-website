import fs from "fs";
import { findMagicNumber } from "../magic-numbers";

console.log("Computing magic numbers for bishops...");

let bishopMagicNumbers: bigint[] = [];
for (let i = 0; i < 64; i++) {
  bishopMagicNumbers.push(findMagicNumber(i, true));
}
console.log("found magic numbers for all bishop squares.");
console.log("Computing magic numbers for rooks...");

// Find rook magic numbers
let rookMagicNumbers: bigint[] = [];
for (let i = 0; i < 64; i++) {
  rookMagicNumbers.push(findMagicNumber(i, false));
}

console.log(
  "found magic numbers for all rook squares, writing to output file..."
);

// Write to JSON File
fs.writeFileSync(
  "./magics.json",
  JSON.stringify(
    { bishops: bishopMagicNumbers, rooks: rookMagicNumbers },
    (key, value) => (typeof value === "bigint" ? value.toString() : value)
  )
);

console.log("Done.");
