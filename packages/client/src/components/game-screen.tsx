import type {
	MiddlewareAuth,
	RunningGameInformationInClient,
} from "@scribbl/shared-types/";
import { socket } from "@/lib/socket";
import React from "react";
import { MAX_TIME_IN_SECONDS } from "@scribbl/shared-types/";
import { RotatingLoader } from "./rotating-loader";
import { cn } from "@/lib/utils";

const ChooseWordsOverlay = React.lazy(() => import("./choose-words-overlay"));
const HiddenWord = React.lazy(() => import("./hidden-word"));
const DrawingScreen = React.lazy(() => import("./drawing-screen"));
const NoDrawAccessCanvas = React.lazy(() => import("./no-draw-access-canvas"));

type Props = {
	roomID: string;
	players: Array<MiddlewareAuth>;
};

const GameScreen: React.FC<Props> = React.memo(({ roomID, players }) => {
	const [gameInfo, setGameInfo] =
		React.useState<RunningGameInformationInClient>();
	const [time, setTime] = React.useState(MAX_TIME_IN_SECONDS);

	const userToDraw = React.useMemo(() => {
		if (!gameInfo) {
			return undefined;
		}

		let player: MiddlewareAuth | undefined = undefined;
		for (let idx = 0; idx < players.length; ++idx) {
			if (players[idx].userID === gameInfo.playerToDraw.userID) {
				player = players[idx];
				break;
			}
		}

		return player;
	}, [gameInfo, players]);

	React.useEffect(() => {
		socket.on("EmitRunningGameInformation", setGameInfo);
		socket.on("UpdateTimer", setTime);
		return () => {
			socket.off("UpdateTimer", setTime);
			socket.off("EmitRunningGameInformation", setGameInfo);
		};
	}, []);

	React.useEffect(() => {
		if (roomID) {
			socket.emit("RequestRunningGameInformation", roomID);
		}
	}, [roomID]);

	return (
		<React.Fragment>
			<div className="mb-8 min-h-[10rem] shadow-md shadow-black/20 rounded-lg dark:border relative">
				{!gameInfo && <div className="mb-8">Loading...</div>}

				{gameInfo && (
					<section className="p-4">
						<h2 className="font-bold mb-2">Leaderboard</h2>

						<div className="flex flex-col">
							{gameInfo.players.map((p, idx) => (
								<div
									className={cn("p-1 flex gap-4 items-center rounded-sm", {
										"bg-green-800 text-white dark:bg-green-400 dark:text-black":
											p.didGuessCorrectly,
									})}
								>
									<span>{idx + 1}.</span>
									<div className="flex gap-2 items-center">
										<div className="overflow-x-auto break-words whitespace-normal max-w-xs">
											{p.displayName}
										</div>

										<div className="font-bold text-sm">{p.points} points</div>
									</div>
								</div>
							))}
						</div>
					</section>
				)}
			</div>
			<div className="min-h-[15rem] shadow-md shadow-black/20 rounded-lg dark:border relative">
				{gameInfo && (
					<React.Fragment>
						<header className="py-2 px-4 border-b-2 flex justify-center items-center text-center">
							<div className="flex flex-col gap-1">
								<h3 className="font-bold overflow-x-auto break-words whitespace-normal">
									{userToDraw?.displayName}&apos;s turn
								</h3>

								<div className="flex flex-col gap-1">
									<div className="text-sm">
										{userToDraw?.userID === socket.id && (
											<React.Fragment>
												{gameInfo.wordToGuess ?? "???"}
											</React.Fragment>
										)}

										{userToDraw?.userID !== socket.id && (
											<React.Suspense>
												<HiddenWord
													time={time}
													word={gameInfo.wordToGuess ?? "???"}
												/>
											</React.Suspense>
										)}
									</div>
									<time className="text-xs" dateTime={time + "seconds"}>
										{time} s
									</time>
								</div>
							</div>
						</header>

						{gameInfo.wordToGuess === null && userToDraw && (
							<React.Suspense
								fallback={
									<div className="w-full min-h-[15rem] grid place-items-center">
										<RotatingLoader />
									</div>
								}
							>
								<ChooseWordsOverlay
									roomID={gameInfo.roomID}
									userToDraw={userToDraw}
								/>
							</React.Suspense>
						)}

						{gameInfo.wordToGuess !== null && (
							<React.Fragment>
								{gameInfo.playerToDraw.userID === socket.id && (
									<React.Suspense
										fallback={
											<div className="w-full h-full min-h-[15rem] grid place-items-center">
												<RotatingLoader />
											</div>
										}
									>
										<DrawingScreen roomID={gameInfo.roomID} />
									</React.Suspense>
								)}

								{gameInfo.playerToDraw.userID !== socket.id && (
									<React.Suspense
										fallback={
											<div className="w-full h-full min-h-[15rem] grid place-items-center">
												<RotatingLoader />
											</div>
										}
									>
										<NoDrawAccessCanvas />
									</React.Suspense>
								)}
							</React.Fragment>
						)}
					</React.Fragment>
				)}
			</div>
		</React.Fragment>
	);
});

GameScreen.displayName = "GameScreen";
export default GameScreen;
