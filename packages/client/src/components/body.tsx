import type { RoomInClient } from "@scribbl/shared-types";
import React from "react";
import { GAME_STATE } from "@scribbl/shared-types/src/enums";

import { RotatingLoader } from "./rotating-loader";
import { socket } from "@/lib/socket";
import ChatBox from "./chat-box";

const JoinCard = React.lazy(() => import("./join-card"));
const WaitingRoom = React.lazy(() => import("./waiting-room"));
const GameScreen = React.lazy(() => import("./game-screen"));
const ListOfPlayers = React.lazy(() => import("./list-of-players"));

export const Body: React.FC = () => {
  const [room, setRoom] = React.useState<RoomInClient>();

  React.useEffect(() => {
    socket.on("EmitRoomInformation", setRoom);
    return () => {
      socket.off("EmitRoomInformation", setRoom);
    };
  }, []);

  return (
    <React.Fragment>
      {!room && (
        <React.Suspense fallback={<RotatingLoader />}>
          <JoinCard />
        </React.Suspense>
      )}

      {room && (
        <div className="w-full flex flex-col gap-8">
          <div className="w-full flex flex-wrap md:flex-nowrap gap-8">
            {room.state === GAME_STATE.WAITING && (
              <React.Suspense fallback={<RotatingLoader />}>
                <div className="w-full md:w-[75%]">
                  <WaitingRoom
                    roomID={room.roomID}
                    roomOwnerID={room.roomOwnerID}
                    maxPlayerAmount={room.maxPlayerAmount}
                    maxRounds={room.maxRounds}
                    playersLength={room.players.length}
                  />
                </div>
              </React.Suspense>
            )}

            {room.state === GAME_STATE.PLAYING && (
              <React.Suspense fallback={<RotatingLoader />}>
                <div className="w-full md:w-[75%]">
                  <GameScreen
                    roomID={room.roomID}
                    players={room.players}
                  />
                </div>
              </React.Suspense>
            )}

            <React.Suspense>
              <div className="w-full md:w-[25%]">
                <ListOfPlayers
                  roomOwnerID={room.roomOwnerID}
                  players={room.players}
                />
              </div>
            </React.Suspense>
          </div>
          <React.Suspense>
            <ChatBox
              roomID={room.roomID}
            />
          </React.Suspense>
        </div>
      )}
    </React.Fragment>
  );
};