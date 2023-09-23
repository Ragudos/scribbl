import type { RoomInClient } from "@scribbl/shared-types";
import React from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { CheckIcon, CopyIcon } from "@radix-ui/react-icons";
import { socket } from "@/lib/socket";

type Props = Omit<RoomInClient, "state" | "players">;

const WaitingRoom: React.FC<Props> = React.memo(
  ({ roomID, roomOwnerID }) => {
    const [didCopy, setDidCopy] = React.useState(false);
    const [, startTransition] = React.useTransition();

    const timer = React.useRef<NodeJS.Timeout | null>(null);

    const startGame = () => {

    };


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