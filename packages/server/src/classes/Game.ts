import type { ClientToServerEvents, MiddlewareAuth, PlayersInGame, Room, RunningGameInformation, ServerToClientEvents } from "@scribbl/shared-types";
import type { Server } from "socket.io";

import { MAX_TIME_IN_SECONDS, GAME_STATE } from "@scribbl/shared-types/";
import { v4 as uuidv4 } from "uuid";

import SocketInstance from "./SocketInstance";
import { MemoryStore } from "@/store/MemoryStore";
import Queue from "@/store/Queue";
import Timer from "@/store/Timer";

const WORDS = [
  "House",
  "Book",
  "Pencil",
  "Paper",
  "Bag",
  "Tree",
  "Bedroom",
  "Music Theatre"
]

const getRandomWord = (prevWord: string): string => {
  const randomWord = Math.floor(Math.random() * (WORDS.length - 1));
  return WORDS[randomWord] === prevWord
    ? getRandomWord(prevWord)
    : WORDS[randomWord];
};

class Game extends SocketInstance {
  public users: MemoryStore<MiddlewareAuth>;
  public rooms: MemoryStore<Room>;
  public runningGames: MemoryStore<RunningGameInformation>;
  public timers: Queue<NodeJS.Timeout>;

  constructor(
    server: Server<ClientToServerEvents, ServerToClientEvents>
  ) {
    super(server);

    this.users = new MemoryStore();
    this.rooms = new MemoryStore();
    this.runningGames = new MemoryStore();
    this.timers = new Queue();

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

      socket.on("SendDrawingPacket", (payload) => {
        socket.broadcast.emit("EmitReceivedDrawingPacket", payload);
      });

      socket.on("SendFillCanvas", (color) => {
        socket.broadcast.emit("EmitReceivedFillCanvas", color);
      });

      socket.on("SendUserStoppedDrawing", () => {
        socket.broadcast.emit("EmitUserStoppedDrawing");
      });

      socket.on("UpdateMaxPlayersInRoom", ({ roomID, userID, updatedAmount }) => {
        const room = this.rooms.get(roomID);

        if (!room) {
          console.log("Memory error. A room's player amount is being updated although it does not exist.");
          return;
        }

        if (userID !== room.roomOwnerID) {
          socket.to(roomID).emit("EmitNotification", "You are not authorized to change this room's settings.");
          return;
        };

        if (room.players.size >= updatedAmount) {
          socket.emit("EmitNotification", "The current amount of players in the room far exceeds the new limit. Please try kicking other players and try again.");
          socket.emit("EmitUpdatedMaxPlayersInRoom", room.maxPlayerAmount);
          return;
        }

        room.maxPlayerAmount = updatedAmount;
        socket.broadcast.to(roomID).emit("EmitUpdatedMaxPlayersInRoom", updatedAmount);
      });

      socket.on("UpdateMaxRoundsInRoom", ({ roomID, userID, updatedAmount }) => {
        const room = this.rooms.get(roomID);

        if (!room) {
          console.log("Memory error. A room's player amount is being updated although it does not exist.");
          return;
        }

        if (userID !== room.roomOwnerID) {
          socket.to(roomID).emit("EmitNotification", "You are not authorized to change this room's settings.");
          return;
        };

        room.maxRounds = updatedAmount;
        socket.broadcast.to(roomID).emit("EmitUpdatedMaxRoundsInRoom", updatedAmount);
      });

      socket.on("RequestWordsToDraw", (roomID) => {
        const runningGame = this.runningGames.get(roomID);

        if (!runningGame) {
          console.log("Running game not found but a user is trying to request words to choose for drawing.");
          return;
        }

        const arrayOfWords = [] as unknown as [string, string, string];

        for (let idx = 0; idx < 3; ++idx) {
          const word = getRandomWord(arrayOfWords[idx - 1] || "");
          arrayOfWords.push(word);
        }

        this.server.to(roomID).emit("EmitWordsToDraw", arrayOfWords);
      });

      socket.on("SendChosenWord", ({ roomID, word }) => {
        const room = this.rooms.get(roomID);
        const runningGame = this.runningGames.get(roomID);

        if (!room || !runningGame) {
          console.log("Room not found where it's supposed to start.");
          return;
        }

        const timeClass = new Timer(MAX_TIME_IN_SECONDS);

        const timer = setInterval(() => {
          this.server.to(roomID).emit("UpdateTimer", timeClass.time);
          timeClass.tick();
          console.log("ticking");
        }, 1000);

        runningGame.timerID = timer;
        runningGame.playerToDraw.isPickingAWord = false;
        runningGame.wordToGuess = word;

        this.server.to(room.roomID).emit("EmitRunningGameInformation", {
          roomID: room.roomID,
          round: 1,
          players: [...runningGame.players.values()],
          wordToGuess: word,
          playerToDraw: runningGame.playerToDraw
        });
      });

      socket.on("RequestRunningGameInformation", (roomID) => {
        const runningGameInformation = this.runningGames.get(roomID);
        if (!runningGameInformation) {
          console.log("Room not found where it's supposed to start.");
          return;
        }

        this.server.to(roomID).emit("EmitRunningGameInformation", {
          roomID: roomID,
          round: runningGameInformation.round,
          players: [...runningGameInformation.players.values()],
          wordToGuess: runningGameInformation.wordToGuess,
          playerToDraw: runningGameInformation.playerToDraw
        });
      });

      socket.on("StartGame", (roomID) => {
        const room = this.rooms.get(roomID);

        if (!room) {
          console.log("Room not found where it's supposed to start.");
          return;
        }

        const players = new Map<string, PlayersInGame>();

        const playersInfo = room.players.values();

        for (let idx = 0; idx < room.players.size; ++idx) {
          const info = playersInfo.next();
          const userID = info.value.userID;
          players.set(userID, {
            points: 0,
            userID: userID,
            didGuessCorrectly: idx === 0 ? undefined : false
          });
        }

        room.state = GAME_STATE.PLAYING;
        const runningGameInformation = {
          roomID: room.roomID,
          round: 1,
          players: players,
          wordToGuess: null,
          playerToDraw: {
            isPickingAWord: true,
            userID: players.values().next().value.userID
          },
          timerID: null
        } satisfies RunningGameInformation;

        this.runningGames.add(roomID, runningGameInformation);

        this.server.to(room.roomID).emit("EmitRoomInformation", {
          roomID: roomID,
          roomOwnerID: socket.userID,
          players: [...room.players.values()],
          state: GAME_STATE.PLAYING,
          maxPlayerAmount: room.maxPlayerAmount,
          maxRounds: room.maxRounds
        });
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
          const key = room.messages.keys();
          room.messages.delete(key.next().value);
        }

        room.messages.set(messageID, {
          roomID: room.roomID,
          user: user,
          content: content,
          messageID: messageID
        });

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
          state: GAME_STATE.WAITING,
          maxPlayerAmount: 8,
          maxRounds: 2
        } satisfies Room;

        this.rooms.add(roomID, room);
        socket.join(roomID);
        socket.emit("EmitRoomInformation", {
          roomID: roomID,
          roomOwnerID: socket.userID,
          players: [userSession],
          state: GAME_STATE.WAITING,
          maxPlayerAmount: 8,
          maxRounds: 2
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

        if (room.state === GAME_STATE.PLAYING) {
          socket.emit("EmitError", "The game for this room is already ongoing. Please try again later.");
          return;
        }

        if (room.players.size >= room.maxPlayerAmount) {
          socket.emit("EmitError", "The room is full. Please try again later.");
          return;
        }

        socket.join(room.roomID);
        room.players.set(socket.userID, user);
        socket.broadcast.to(room.roomID).emit("EmitNotification", socket.displayName + " has joined the room!");
        this.server.to(room.roomID).emit("EmitRoomInformation", {
          roomID: room.roomID,
          roomOwnerID: room.roomOwnerID,
          players: [...room.players.values()],
          state: GAME_STATE.WAITING,
          maxPlayerAmount: room.maxPlayerAmount,
          maxRounds: room.maxRounds
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
          const runningGame = this.runningGames.get(roomIDs[idx]);
          if (!room) {
            console.log("Memory handling error. Room does not exist where a user is in.");
            continue;
          }

          if (room.players.size <= 2 && room.state === GAME_STATE.PLAYING) {
            if (runningGame && runningGame.timerID) {
              clearInterval(runningGame.timerID);
            }
            this.runningGames.delete(room.roomID);

            room.state = GAME_STATE.WAITING;
            socket.broadcast.to(room.roomID).emit("EmitNotification", "Resetting the room state to waiting as you are the only player left.");
          }

          if (room.players.size <= 1) {
            this.rooms.delete(room.roomID);
            continue;
          }

          if (socket.userID === room?.roomOwnerID) {
            const values = room.players.values();
            values.next();
            room.roomOwnerID = values.next().value.userID;
          }

          room.players.delete(socket.userID);
          runningGame?.players.delete(socket.userID);
          socket.broadcast.to(room.roomID).emit("EmitNotification", socket.displayName + " has left the room");
          socket.broadcast.to(room.roomID).emit("EmitRoomInformation", {
            roomID: room.roomID,
            roomOwnerID: room.roomOwnerID,
            players: [...room.players.values()],
            state: room.state,
            maxPlayerAmount: room.maxPlayerAmount,
            maxRounds: room.maxRounds
          });
        }

        console.log(this.runningGames);
        this.users.delete(socket.userID);
      });

    });
  }
};

export default Game;