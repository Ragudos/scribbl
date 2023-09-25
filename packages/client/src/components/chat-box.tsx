import type { Message, RoomInClient } from "@scribbl/shared-types";
import React from "react";
import { Input } from "./ui/input";
import toast from "react-hot-toast";
import { socket } from "@/lib/socket";
import { Button } from "./ui/button";
import { RotatingLoader } from "./rotating-loader";

type Props = Pick<RoomInClient, "roomID">;

const Chat = React.lazy(() => import("./chat"));

const ChatBox: React.FC<Props> = React.memo(({ roomID }) => {
	const [message, setMessage] = React.useState("");
	const [messages, setMessages] = React.useState<
		Pick<Message, "content" | "user" | "messageID" | "isSystemMessage">[]
	>([]);
	const [timer, setTimer] = React.useState<NodeJS.Timeout | null>(null);

	const handleSendMessage = (e: React.FormEvent) => {
		e.preventDefault();
		if (timer) {
			toast.error(
				"Spamming is not allowed. Please wait for at least 500 milliseconds.",
			);
			return;
		}
		if (!message) {
			toast.error("Please type in at least one character.");
			return;
		}

		const messageData = {
			userID: socket.id,
			roomID: roomID,
			content: message,
		};

		socket.emit("SendMessage", messageData);

		setMessage("");
		setTimer(
			setTimeout(() => {
				setTimer((prev) => {
					clearTimeout(prev as NodeJS.Timeout);
					return null;
				});
			}, 500),
		);
	};

	React.useEffect(() => {
		if (roomID) {
			socket.emit("RequestMessages", roomID);
		}
		socket.on("EmitMessages", setMessages);
		return () => {
			socket.off("EmitMessages", setMessages);
		};
	}, [roomID]);

	return (
		<form
			onSubmit={handleSendMessage}
			action=""
			className="max-h-[15rem] rounded-lg shadow-md shadow-black/20 dark:border flex flex-col gap-4"
		>
			{messages.length <= 0 && (
				<div className="p-4 text-center">
					{" "}
					There are no messages yet. Send one?
				</div>
			)}

			{messages.length > 0 && (
				<React.Suspense fallback={<RotatingLoader />}>
					<Chat messages={messages} />
				</React.Suspense>
			)}

			<div className="bg-accent/20 rounded-lg flex items-center border focus-within:ring-1 focus-within:ring-foreground/50 focus-within:ring-offset-2 focus-within:ring-offset-background">
				<Input
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					placeholder={
						timer !== null
							? "Please wait for a bit before sending another message"
							: "Type in your message..."
					}
					title="Send a message"
					aria-label="Send a message"
					className="focus-visible:outline-none focus-visible:ring-0 border-0 text-sm"
					required
				/>

				<div className="h-full">
					<Button
						size="sm"
						className=""
						title="Send Message"
						aria-label="Send Message"
						type="submit"
					>
						<svg
							width={16}
							height={16}
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="w-4 h-4"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
							/>
						</svg>
					</Button>
				</div>
			</div>
		</form>
	);
});

ChatBox.displayName = "ChatBox";
export default ChatBox;
