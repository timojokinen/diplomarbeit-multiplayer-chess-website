export enum ClientMessage {
  Move = "make_move",
  Resign = "resign",
  OfferDraw = "offer_draw",
  AcceptDraw = "accept_draw",
}

export enum ServerMessage {
  OpponentMove = "opponent_move",
  GameConcluded = "game_concluded",
}
