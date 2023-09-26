import type {
	ClientToServerEvents,
	ServerToClientEvents,
} from "./consts";
import { config } from "dotenv";
import express from "express";
import { Server } from "socket.io";
import Game from "./classes/Game";
import { createServer } from "https";
config({ path: ".env.local" });

const PORT = 3000;

const app = express();
const httpServer = createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
	cors: {
		origin:
			process.env.CORS_ORIGIN ?? `http://localhost:${process.env.CLIENT_PORT}`,
		methods: ["GET", "POST"],
	},
	cleanupEmptyChildNamespaces: true,
});

new Game(io);

io.listen(+PORT);