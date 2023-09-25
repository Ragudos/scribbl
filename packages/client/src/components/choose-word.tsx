import { socket } from "@/lib/socket";
import { Button } from "./ui/button";
import React from "react";
import { TIME_TO_CHOOSE_WORD } from "@scribbl/shared-types";

type Props = {
	roomID: string;
};

const ChooseWord: React.FC<Props> = ({ roomID }) => {
	const [wordsToDraw, setWordsToDraw] =
		React.useState<[string, string, string]>();
	const [time, setTime] = React.useState<number>(TIME_TO_CHOOSE_WORD);

	React.useEffect(() => {
		if (roomID) {
			socket.emit("RequestWordsToDraw", roomID);
		}
	}, [roomID]);

	React.useEffect(() => {
		socket.on("EmitWordsToDraw", setWordsToDraw);
		return () => {
			socket.off("EmitWordsToDraw", setWordsToDraw);
		};
	}, []);

	React.useEffect(() => {
		const interval = setInterval(() => {
			setTime((prev) => {
				const newTime = prev - 1;

				if (newTime <= 0) {
					if (wordsToDraw) {
						socket.emit("SendChosenWord", {
							roomID: roomID,
							word: wordsToDraw[Math.floor(Math.random() * wordsToDraw.length)],
						});
					}
					clearInterval(interval);
				}

				return newTime;
			});
		}, 1000);
		return () => {
			clearInterval(interval);
		};
	}, [roomID, wordsToDraw]);

	return (
		<React.Fragment>
			{time && (
				<div className="flex justify-center">
					<div className="border rounded-full h-1 w-12">
						<div
							className="transition-[width] duration-400 ease-in-out bg-foreground rounded-full h-full shadow-sm shadow-black/20"
							style={{
								width: `${(time / TIME_TO_CHOOSE_WORD) * 100}%`,
							}}
						/>
					</div>
				</div>
			)}
			<h4 className="mb-2 font-bold">Pick a word to draw</h4>
			<div className="flex gap-2 items-center">
				{wordsToDraw &&
					wordsToDraw.map((w) => (
						<Button
							key={w}
							onClick={() => socket.emit("SendChosenWord", { roomID, word: w })}
							title={"Choose " + w}
							aria-label={"Choose " + w}
							size="sm"
						>
							{w}
						</Button>
					))}
			</div>
		</React.Fragment>
	);
};

export default ChooseWord;
