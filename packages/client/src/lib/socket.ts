import type {
	ClientToServerEvents,
	MiddlewareAuth,
	ServerToClientEvents,
} from "@scribbl/shared-types";
import io, { type Socket } from "socket.io-client";

const URL =
	import.meta.env.VITE_CORS_ORIGIN ??
	`http://localhost:${import.meta.env.VITE_SERVER_PORT}`;

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
	URL,
	{
		closeOnBeforeunload: true,
		autoConnect: false,
	},
);

export const connectToSocket = ({
	displayImage,
	displayName,
	userID,
}: MiddlewareAuth) => {
	socket.auth = {
		displayImage,
		displayName,
		userID,
	} as MiddlewareAuth;
	socket.connect();
};
