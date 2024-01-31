export const MAX_ROOMS = 10;
export const MAX_TIME_IN_SECONDS = 60;
export const TIME_TO_CHOOSE_WORD = 10;
export type  MAX_PLAYERS_PER_ROOM = 2 | 4 | 6 | 8;
export type MAX_ROUNDS = 2 | 4 | 6;
export const maxRoundsArray: MAX_ROUNDS[] = [2, 4, 6];
export const maxAmountOfPlayersArray: MAX_PLAYERS_PER_ROOM[] = [2, 4, 6, 8];
export type RGB = [number, number, number];
export type Sizes = 5 | 10 | 15 | 20;
export type LineCap = CanvasLineCap;
export type DrawMode = "brush" | "fill" | "erase";

export type Dimensions = {
  x: number,
  y: number
}

export enum POINTS {
  FIRST_GUESS = 100,
  DRAWING_GOT_GUESSED = 125,
  DRAWING_GOT_GUESSED_ABOVE_FOURTY_SECONDS = 175,
  GUESS = 75,
  GUESS_BELOW_TWENTY_SECONDS = 50
};

export enum GAME_STATE {
  WAITING = "waiting",
  PLAYING = "playing"
};
export interface MemoryStoreInterface<T> {
  add(_itemID: string, item: T): void,
  get(_itemID: string): T | undefined,
  delete(_itemID: string): boolean,
  getAll(): T[]
}

interface Timer {
  time: number,
  tick(): void;
}

export type PlayersInGame = {
  points: number;
  userID: string;
  displayName: string;
  didGuessCorrectly: boolean;
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
  timerID: string | null;
  time: Timer | null
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
  isSystemMessage: false
} | {
  messageID: string,
  user: null,
  roomID: string,
  content: string,
  isSystemMessage: true
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

  SendEraseCanvas: (_roomID: string) => void;

  SendUserNotErasing: (_roomID: string) => void;

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

  EmitUserErasingCanvas: () => void;
  EmitUserStoppedErasingCanvas: () => void;

  EmitRoomInformation: (_payload: RoomInClient) => void;

  EmitNotification: (_message: string) => void;

  EmitMessages: (_messages: Pick<Message, "content" | "user" | "messageID" | "isSystemMessage">[]) => void;

  EmitWordsToDraw: (_arrayOfWords: [string, string, string]) => void;

  EmitUpdatedMaxPlayersInRoom: (_amount: MAX_PLAYERS_PER_ROOM) => void;
  EmitUpdatedMaxRoundsInRoom: (_amount: MAX_ROUNDS) => void;

  EmitRunningGameInformation: (_payload: RunningGameInformationInClient) => void;

  UpdateTimer: (_time: number) => void;
  UpdateChooseWordTimer: (_time: number) => void;

  EmitError: (_errorMessage: string) => void;
}