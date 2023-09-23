import type { ClientToServerEvents, MiddlewareAuth, Room, ServerToClientEvents } from "@scribbl/shared-types";
import type { Server } from "socket.io";

import { v4 as uuidv4 } from "uuid";

import SocketInstance from "./SocketInstance";
import { MemoryStore } from "@/store/MemoryStore";
import { GAME_STATE } from "@scribbl/shared-types/src/enums";

class Game extends SocketInstance {
  public users: MemoryStore<MiddlewareAuth>;
  public rooms: MemoryStore<Room>;

  constructor(
    server: Server<ClientToServerEvents, ServerToClientEvents>
  ) {
    super(server);

    this.users = new MemoryStore();
    this.rooms = new MemoryStore();

    this.server.use(this.middleware);
    this.init();
  }

  private init() {
    this.server.on("connection", (socket) => {
      this.users.add(
        socket.userID,
        {
          userID: socket.userID,
          displayImage: socket.displayImage,
          displayName: socket.displayName
        }
      );

      console.log(this.users);

      socket.on("SendDrawingPacket", (payload) => {
        socket.broadcast.emit("EmitReceivedDrawingPacket", payload);
      });
    
      socket.on("SendFillCanvas", (color) => {
        socket.broadcast.emit("EmitReceivedFillCanvas", color);
      });

      socket.on("SendUserStoppedDrawing", () => {
        socket.broadcast.emit("EmitUserStoppedDrawing");
      });

      socket.on("RequestMessages", (roomID) => {
        const room = this.rooms.get(roomID);

        if (!room) {
          console.log("The room where a user is trying to send a message to does not exist.");
          return;
        }

        this.server.to(roomID).emit("EmitMessages", [...room.messages.values()]);
      });

      socket.on("SendMessage", ({ content, roomID, userID }) => {
        const user = this.users.get(userID);

        if (!user) {
          console.log("Session error! A user is sending a message while their session does not exist.");
          return;
        }

        const room = this.rooms.get(roomID);

        if (!room || !room.players.get(userID)) {
          console.log("The room where a user is trying to send a message to does not exist or a player is not included in the list of players stored in room memory.");
          return;
        }

        const messageID = uuidv4();

        if (room.messages.size >= 20) {
          const removedItem = room.messageIDs.shift();
          if (removedItem) {
            room.messages.delete(removedItem);
          }
        }
        
        room.messages.set(messageID, {
          roomID: room.roomID,
          user: user,
          content: content,
          messageID: messageID
        });

        room.messageIDs.push(messageID);

        this.server.to(roomID).emit("EmitMessages", [...room.messages.values()]);
      });

      socket.on("CreateRoom", () => {
        const roomID = uuidv4();

        const players = new Map<string, MiddlewareAuth>();
        const userSession = this.users.get(socket.userID);

        if (!userSession) {
          console.log("Session error! A user is creating a room but their session does not exist.");
          return;
        }

        players.set(socket.userID, userSession);
        const room = {
          roomID,
          roomOwnerID: socket.userID,
          players: players,
          messages: new Map(),
          messageIDs: [],
          state: GAME_STATE.WAITING
        } satisfies Room;

        this.rooms.add(roomID, room);
        socket.join(roomID);
        socket.emit("EmitRoomInformation", {
          roomID: roomID,
          roomOwnerID: socket.userID,
          players: [userSession],
          state: GAME_STATE.WAITING
        });
      });

      socket.on("JoinRoom", (roomID) => {
        const room = this.rooms.get(roomID);
        const user = this.users.get(socket.userID);

        if (!room) {
          const error = "No room was found with this ID.";
          socket.emit("EmitError", error);
          return;
        }

        if (!user) {
          console.log("Session error! User not found while trying to joing a room.");
          return;
        }

        socket.join(room.roomID);
        room.players.set(socket.userID, user);
        socket.broadcast.to(room.roomID).emit("EmitNotification", socket.displayName + " has joined the room!");
        this.server.to(room.roomID).emit("EmitRoomInformation", {
          roomID: room.roomID,
          roomOwnerID: room.roomOwnerID,
          players: [...room.players.values()],
          state: GAME_STATE.WAITING
        });
      });

      socket.on("disconnecting", (reason) => {
        console.log("Disconnected because of: ", reason);

        const roomIDs = [...socket.rooms.values()];

        for (let idx = 0; idx < roomIDs.length; ++idx) {
          if (idx === 0) {
            continue;
          }
          const room = this.rooms.get(roomIDs[idx]);

          if (!room) {
            console.log("Memory handling error. Room does not exist where a user is in.");
            continue;
          }

          if ([...room.players.values()].length <= 1) {
            this.rooms.delete(room.roomID);

            continue;
          }

          if (socket.userID === room?.roomOwnerID) {
            const values = room.players.values();
            values.next();
            room.roomOwnerID = values.next().value.userID;
          }

          room.players.delete(socket.userID);
          socket.broadcast.to(room.roomID).emit("EmitRoomInformation",{
            roomID: room.roomID,
            roomOwnerID: room.roomOwnerID,
            players: [...room.players.values()],
            state: GAME_STATE.WAITING
          });
          socket.broadcast.to(room.roomID).emit("EmitNotification", socket.displayName + " has left the room");
        }

        this.users.delete(socket.userID);
      });
    
    });
  }
};

export default Game;