import { socket } from "@/lib/socket";
import React from "react";
import { Button } from "./ui/button";
import { MiddlewareAuth } from "@scribbl/shared-types";

type Props = {
  roomID: string,
  userToDraw: MiddlewareAuth
}

const ChooseWordsOverlay: React.FC<Props> = React.memo(
  ({ roomID, userToDraw }) => {
    const [wordsToDraw, setWordsToDraw] = React.useState<[string, string, string]>();

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

    const handleClick = (w: string) => {
      socket.emit("SendChosenWord", { roomID, word: w });
    };

    return (
      <div className="z-10 absolute inset-0 m-auto h-full min-h-[15rem] w-full rounded-lg bg-accent/20 backdrop-blur-lg grid place-items-center">
        <div className="text-center">
          {userToDraw.userID === socket.id ? (
            <React.Fragment>
              <h4 className="mb-2 font-bold">Pick a word to draw</h4>
              <div className="flex gap-2 items-center">
                {wordsToDraw && wordsToDraw.map((w) => (
                  <Button
                    key={w}
                    onClick={() => handleClick(w)}
                    title={"Choose " + w}
                    aria-label={"Choose " + w}
                    size="sm"
                  >
                    {w}
                  </Button>
                ))}
              </div>
            </React.Fragment>
          ) : (
            <div>
              {userToDraw.displayName} is choosing a word to draw...
            </div>
          )}
        </div>
      </div>
    );
  }
);

ChooseWordsOverlay.displayName = "ChooseWordsOverlay";
export default ChooseWordsOverlay;