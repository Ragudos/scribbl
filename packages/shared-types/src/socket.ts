import { MAX_PLAYERS_PER_ROOM, MAX_ROUNDS } from "./consts";
import type { Dimensions, LineCap, RGB, Sizes } from "./drawing"
import type { GAME_STATE } from "./enums"

export interface MemoryStoreInterface<T> {
  add(_itemID: string, item: T): void,
  get(_itemID: string): T | undefined,
  delete(_itemID: string): boolean,
  getAll(): T[]
}

export type PlayersInGame =
| {
  points: number;
  userID: string;
  didGuessCorrectly: boolean;
} | {
  points: number;
  userID: string;
}

export type RunningGameInformationInClient = {
  roomID: string;
  round: number;
  players: Array<PlayersInGame>;
  wordToGuess: string | null;
  playerToDraw: {
    isPickingAWord: boolean,
    userID: string
  };
}

export type RunningGameInformation = {
  roomID: string;
  round: number;
  players: Map<string, PlayersInGame>;
  wordToGuess: string | null;
  playerToDraw: {
    isPickingAWord: boolean,
    userID: string
  };
  timerID: NodeJS.Timeout | null;
}

export type Room = {
  roomID: string,
  roomOwnerID: string,
  players: Map<string, MiddlewareAuth>,
  state: GAME_STATE,
  messages: Map<string, Message>,
  maxPlayerAmount: MAX_PLAYERS_PER_ROOM,
  maxRounds: MAX_ROUNDS,
  amountOfPlayersDrawnInARound: number
}

export type RoomInClient = Pick<Room, "maxPlayerAmount" | "roomID" | "state" | "roomOwnerID" | "maxRounds"> & {
  players: Array<MiddlewareAuth>,
}

export type Message = {
  messageID: string,
  user: MiddlewareAuth,
  roomID: string,
  content: string,
}

export type MiddlewareAuth = {
  displayName: string,
  displayImage: string,
  userID: string
}

export type MessagePayload = {
  userID: string,
  roomID: string,
  content: string
}

export type DrawingPacketPayload = {
  color: RGB,
  size: Sizes,
  lineCap: LineCap,
  dimensionsByDimensions: {
    start: Dimensions,
    end: Dimensions
  }
}

export type AuthorizedEmission = {
  userID: string,
  roomID: string
}

export type UpdateMaxPlayersInRoomPayload = {
  updatedAmount: MAX_PLAYERS_PER_ROOM
} & AuthorizedEmission;

export type UpdateMaxRoundsInRoomPayload = {
  updatedAmount: MAX_ROUNDS
} & AuthorizedEmission;

export interface ClientToServerEvents {
  SendDrawingPacket: (_payload: DrawingPacketPayload & { roomID: string }) => void,
  SendUserStoppedDrawing: (_roomID: string) => void,
  SendFillCanvas: (_payload: { color: RGB, roomID: string }) => void;

  SendMessage: (_payload: MessagePayload) => void;
  RequestMessages: (_roomID: string) => void;

  UpdateMaxPlayersInRoom: (_payload: UpdateMaxPlayersInRoomPayload) => void;
  UpdateMaxRoundsInRoom: (_payload: UpdateMaxRoundsInRoomPayload) => void;

  RequestWordsToDraw: (_roomID: string) => void;
  SendChosenWord: (_payload: { roomID: string, word: string }) => void;

  RequestRunningGameInformation: (_roomID: string) => void;

  StartGame: (_roomID: string) => void;

  CreateRoom: () => void;
  JoinRoom: (_roomID: string) => void;
}

export interface ServerToClientEvents {
  EmitReceivedDrawingPacket: (_payload: DrawingPacketPayload) => void;
  EmitUserStoppedDrawing: () => void;
  EmitReceivedFillCanvas: (_payload: RGB) => void;

  EmitRoomInformation: (_payload: RoomInClient) => void;

  EmitNotification: (_message: string) => void;

  EmitMessages: (_messages: Pick<Message, "content" | "user" | "messageID">[]) => void;

  EmitWordsToDraw: (_arrayOfWords: [string, string, string]) => void;

  EmitUpdatedMaxPlayersInRoom: (_amount: MAX_PLAYERS_PER_ROOM) => void;
  EmitUpdatedMaxRoundsInRoom: (_amount: MAX_ROUNDS) => void;

  EmitRunningGameInformation: (_payload: RunningGameInformationInClient) => void;

  UpdateTimer: (_time: number) => void;

  EmitError: (_errorMessage: string) => void;
}