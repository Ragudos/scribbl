import type { Dimensions, LineCap, RGB, Sizes } from "./drawing"
import type { GAME_STATE } from "./enums"

export interface MemoryStoreInterface<T> {
  add(_itemID: string, item: T): void,
  get(_itemID: string): T | undefined,
  delete(_itemID: string): boolean,
  getAll(): T[]
}

export type Room = {
  roomID: string,
  roomOwnerID: string,
  players: Map<string, MiddlewareAuth>,
  state: GAME_STATE,
  messages: Map<string, Message>,
  messageIDs: Array<string>
}

export type RoomInClient = {
  roomID: string,
  roomOwnerID: string,
  players: Array<MiddlewareAuth>,
  state: GAME_STATE,
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

export interface ClientToServerEvents {
  SendDrawingPacket: (_payload: DrawingPacketPayload) => void,
  SendUserStoppedDrawing: () => void,
  SendFillCanvas: (_payload: RGB) => void;

  SendMessage: (_payload: MessagePayload) => void;
  RequestMessages: (_roomID: string) => void;

  CreateRoom: () => void;
  JoinRoom: (_roomID: string) => void;
}

export interface ServerToClientEvents {
  EmitReceivedDrawingPacket: (_payload: DrawingPacketPayload) => void
  EmitUserStoppedDrawing: () => void;
  EmitReceivedFillCanvas: (_payload: RGB) => void;

  EmitRoomInformation: (_payload: RoomInClient) => void;

  EmitNotification: (_message: string) => void;

  EmitMessages: (_messages: Pick<Message, "content" | "user" | "messageID">[]) => void

  EmitError: (_errorMessage: string) => void;
}