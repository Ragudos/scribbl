import React from "react";

import toast, { Toaster } from "react-hot-toast";
import { Body } from "./components/body";
import { socket } from "./lib/socket";

const App: React.FC = () => {

	const handleConnectError = React.useCallback(
		(error: Error | string) => {
			if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error(error);
			}
			if (socket.connected) {
				socket.disconnect();
			}
		},
		[]
	);

	const handleNotification = React.useCallback(
		(message: string) => {
			toast(message);
		},
		[]
	);

	React.useEffect(() => {
		socket.on("connect_error", handleConnectError);
		socket.on("EmitError", handleConnectError);
		socket.on("EmitNotification", handleNotification);
		return () => {
			socket.off("connect_error", handleConnectError);
			socket.off("EmitError", handleConnectError);
			socket.off("EmitNotification", handleNotification);
		};
	}, [handleConnectError, handleNotification]);

	return (
		<React.Fragment>
			<Toaster position="top-right" toastOptions={{ duration: 5000 }} />
			<div className="container grid place-items-center min-h-screen">
				<Body />
			</div>
		</React.Fragment>
	);
};

export default App;
