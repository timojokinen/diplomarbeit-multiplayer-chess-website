import { Squares } from "../src/constants";
import { Move } from "../src/move";
import { BitboardsByPiece } from "../src/types";

describe("Move class", () => {
  describe("toString()", () => {
    it("should correctly format castling moves", () => {
      const bitboards = {};

      const move1 = new Move(
        bitboards as BitboardsByPiece,
        Squares.E1,
        Squares.G1,
        "K",
        null,
        false,
        false,
        false,
        true
      );

      const move2 = new Move(
        bitboards as BitboardsByPiece,
        Squares.E8,
        Squares.C8,
        "k",
        null,
        false,
        false,
        false,
        true
      );

      expect(move1.toString()).toBe("O-O");
      expect(move2.toString()).toBe("O-O-O");
    });
  });
});
