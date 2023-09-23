import type { ClientToServerEvents, ServerToClientEvents } from "@scribbl/shared-types";
import { config } from "dotenv";

import express from "express";
import { Server } from "socket.io";

import Game from "./classes/Game";
import { createServer } from "http";

config({ path: ".env.local" });

const PORT = process.env.PORT || 5000;

const app = express();
const httpServer = createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN ?? `http://localhost:${process.env.CLIENT_PORT}`,
    methods: ["GET", "POST"],
  },
  cleanupEmptyChildNamespaces: true,
});

new Game(io);
httpServer.listen(PORT, () => {
  console.log("server running at *:" + PORT);
});
