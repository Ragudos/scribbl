import type { MiddlewareAuth, RunningGameInformationInClient } from "@scribbl/shared-types/";
import { socket } from "@/lib/socket";
import React from "react";
import { MAX_TIME_IN_SECONDS } from "@scribbl/shared-types/index";
import { RotatingLoader } from "./rotating-loader";

const ChooseWordsOverlay = React.lazy(() => import("./choose-words-overlay"));

type Props = {
  roomID: string,
  players: Array<MiddlewareAuth>,
}

const GameScreen: React.FC<Props> = React.memo(
  ({ roomID, players }) => {
    const [gameInfo, setGameInfo] = React.useState<RunningGameInformationInClient>();
    const [time, setTime] = React.useState(MAX_TIME_IN_SECONDS);

    const userToDraw = React.useMemo(() => {
      if (!gameInfo) {
        return undefined;
      }
      return players.filter(p => p.userID === gameInfo.playerToDraw.userID ? p : null)[0];
    },
      [gameInfo, players]
    );

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
      <div className="min-h-[15rem] shadow-md shadow-black/20 rounded-lg dark:border relative">
        {gameInfo && (
          <React.Fragment>
            <header className="py-2 px-4 border-b-2 flex justify-center items-center text-center">
              <div className="flex flex-col gap-1">
                <h3 className="font-bold">{userToDraw?.displayName}&apos;s turn</h3>

                <div className="flex flex-col gap-1">
                  <div className="text-sm">{gameInfo.wordToGuess ?? "???"}</div>
                  <time className="text-xs" dateTime={time + "seconds"}>
                    {time} s
                  </time>
                </div>
              </div>
            </header>

            {gameInfo.wordToGuess === null && userToDraw && (
              <React.Suspense fallback={<div className="w-full min-h-[15rem] grid place-items-center"><RotatingLoader /></div>}>
                <ChooseWordsOverlay
                  roomID={gameInfo.roomID}
                  userToDraw={userToDraw}
                />
              </React.Suspense>
            )}
          </React.Fragment>
        )}
      </div>
    );
  }
);

GameScreen.displayName = "GameScreen";
export default GameScreen;