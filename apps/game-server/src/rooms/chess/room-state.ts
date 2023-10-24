import { MapSchema, Schema, type } from "@colyseus/schema";
import { Color } from "ks-engine";

export interface PlayerState {
  userId: string;
  name: string;
  avatar: string | null;
  anonymous: boolean;
  sessionId: string;
  color: Color;
}

export class PlayerSchema extends Schema implements PlayerState {
  @type("string") userId: string; // User ID in database
  @type("string") name: string;
  @type("string") avatar: string | null;
  @type("boolean") anonymous: boolean; // If user is authenticated or not
  @type("string") sessionId: string; // Colyseus Session ID
  @type("number") color: Color; // Color of pieces
}

export interface TimeControlState {
  white: number;
  black: number;
  isTicking: boolean;
}

export class TimeControlSchema extends Schema implements TimeControlState {
  @type("number") white: number;
  @type("number") black: number;
  @type("boolean") isTicking: boolean = false;
}

export interface ChessRoomState {
  players: MapSchema<PlayerSchema>;
  timeControl: TimeControlSchema;
  ready: boolean;
  drawOfferBy: string | null;
}

export class ChessRoomSchema extends Schema implements ChessRoomState {
  @type({ map: PlayerSchema }) players = new MapSchema<PlayerSchema>();
  @type(TimeControlSchema) timeControl: TimeControlSchema;
  // TODO: Document: https://github.com/colyseus/colyseus/issues/510
  // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#the-usedefineforclassfields-flag-and-the-declare-property-modifier
  @type("boolean") ready: boolean = false; // Flag to be set when both players are ready to play

  @type("string") drawOfferBy: string | null; // Colyseus Session ID of the player who offered draw
}
