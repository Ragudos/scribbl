import type { MAX_PLAYERS_PER_ROOM, MAX_ROUNDS, RoomInClient } from "@scribbl/shared-types";
import React from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { CheckIcon, CopyIcon } from "@radix-ui/react-icons";
import { socket } from "@/lib/socket";

const ReadOnlyRoomSettings = React.lazy(() => import("./read-only-room-settings"));
const AdjustRoomSettings = React.lazy(() => import("./adjust-room-settings"));

type Props = Omit<RoomInClient, "state" | "players">;

const WaitingRoom: React.FC<Props> = React.memo(
  ({ roomID, roomOwnerID, maxPlayerAmount, maxRounds }) => {
    const [maxPlayerAmountState, setMaxPlayerAmount] = React.useState<MAX_PLAYERS_PER_ROOM>(maxPlayerAmount);
    const [maxRoundsState, setMaxRounds] = React.useState<MAX_ROUNDS>(maxRounds);
    const [didCopy, setDidCopy] = React.useState(false);
    const [, startTransition] = React.useTransition();

    const timer = React.useRef<NodeJS.Timeout | null>(null);

    const startGame = () => {
      socket.emit("StartGame", roomID);
    };

    React.useEffect(() => {
      socket.on("EmitUpdatedMaxPlayersInRoom", setMaxPlayerAmount);
      socket.on("EmitUpdatedMaxRoundsInRoom", setMaxRounds);
      return () => {
        socket.off("EmitUpdatedMaxPlayersInRoom", setMaxPlayerAmount);
        socket.off("EmitUpdatedMaxRoundsInRoom", setMaxRounds);
      };
    }, []);

    return (
      <React.Fragment>
        <div className="flex flex-col gap-8 shadow-md shadow-black/20 dark:border rounded-lg p-4">
          <div className="flex flex-col gap-2">
            <h3 className="font-bold">Room ID</h3>

            <div className="bg-accent/20 rounded-lg flex items-center border focus-within:ring-1 focus-within:ring-foreground/50 focus-within:ring-offset-2 focus-within:ring-offset-background">
              <Input
                readOnly
                value={roomID}
                title="Room ID"
                aria-label="Room ID"
                className="focus-visible:outline-none focus-visible:ring-0 border-0"
              />

              <div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-auto"
                  onClick={() => {
                    startTransition(() => {
                      void navigator.clipboard.writeText(roomID);
                    });
                    setDidCopy(true);
                    if (timer.current) {
                      clearTimeout(timer.current);
                      timer.current = null;
                      timer.current = setTimeout(() => {
                        setDidCopy(false);
                      }, 1000);
                    } else {
                      timer.current = setTimeout(() => {
                        setDidCopy(false);
                      }, 1000);
                    }
                  }}
                  title="Copy Room ID"
                  aria-label="Copy Room ID"
                >
                  {didCopy ? (
                    <div className="flex gap-2 items-center">
                      <span>Copied!</span>
                      <CheckIcon
                        className="w-4 h-4"
                      />
                    </div>
                  ) : (
                    <div className="flex gap-2 items-center">
                      <span>Copy</span>
                      <CopyIcon
                        className="w-4 h-4"
                      />
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <section>

            <h4 className="font-bold mb-4">
              Game settings:
            </h4>

            <div className="text-sm flex flex-col gap-2">
            {roomOwnerID === socket.id ? (
                <React.Suspense>
                  <AdjustRoomSettings
                    setMaxAmountOfPlayers={setMaxPlayerAmount}
                    setMaxRounds={setMaxRounds}
                    roomID={roomID}
                    maxAmountOfPlayers={maxPlayerAmountState}
                    maxRounds={maxRoundsState}
                  />
                </React.Suspense>
              ) : (
                <React.Suspense>
                  <ReadOnlyRoomSettings
                    maxAmountOfPlayers={maxPlayerAmountState}
                    maxRounds={maxRoundsState}
                  />
                </React.Suspense>
              )}
            </div>
          </section>

          {roomOwnerID === socket.id && (
            <div>
              <Button
                size="sm"
                className="w-full"
                title="Start Game"
                aria-label="Start Game"
                onClick={startGame}
              >
                Start Game
              </Button>
            </div>
          )}

          {roomOwnerID !== socket.id && (
            <div>
              Waiting for the room owner to start the game...
            </div>
          )}
        </div>
      </React.Fragment>
    );
  }
);

WaitingRoom.displayName = "WaitingRoom";
export default WaitingRoom;