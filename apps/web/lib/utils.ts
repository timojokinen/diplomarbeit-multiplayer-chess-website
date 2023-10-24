import { clsx, type ClassValue } from "clsx";
import { Color, DrawType, EndGameType, GameResult } from "ks-engine";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function getPieceColor(piece: string | null) {
  if (!piece) return null;
  return piece.toUpperCase() === piece ? Color.White : Color.Black;
}

export const resultTextMap = {
  [GameResult.BlackWins]: "Black wins",
  [GameResult.WhiteWins]: "White wins",
  [GameResult.Draw]: "Draw",
};

export const resultTypeTextMap = {
  [EndGameType.Abandonment]: "by abandonment",
  [EndGameType.Checkmate]: "by checkmate",
  [EndGameType.Resignation]: "by resignation",
  [EndGameType.Timeout]: "on time",
  [DrawType.Agreement]: "by agreement",
  [DrawType.DeadPosition]: "by insufficient material",
  [DrawType.FiftyMoveRule]: "by Fifty move rule",
  [DrawType.Stalemate]: "by stalemate",
  [DrawType.ThreefoldRepetition]: "by threefold repetition",
};
