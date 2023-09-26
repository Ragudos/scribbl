import type {
	ClientToServerEvents,
	MiddlewareAuth,
	ServerToClientEvents,
} from "../consts";
import type { ExtendedError } from "socket.io/dist/namespace";
import type { Server, Socket } from "socket.io";

declare module "socket.io" {
	interface Socket extends MiddlewareAuth {}
}

class SocketInstance {
	public server: Server<ClientToServerEvents, ServerToClientEvents>;

	constructor(server: Server<ClientToServerEvents, ServerToClientEvents>) {
		this.server = server;
	}

	middleware(socket: Socket, next: (err?: ExtendedError) => void) {
		const auth = socket.handshake.auth as MiddlewareAuth;

		if (!auth.displayName) {
			next(new Error("Please provide a username."));
			return;
		}

		if (!auth.displayImage) {
			next(new Error("Please provide a profile picture"));
			return;
		}

		if (!auth.userID) {
			socket.userID = socket.id;
		} else {
			socket.userID = auth.userID;
		}

		socket.displayName = auth.displayName;
		socket.displayImage = auth.displayImage;
		next();
	}
}

export default SocketInstance;
