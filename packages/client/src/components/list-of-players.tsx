import { socket } from "@/lib/socket";
import { RoomInClient } from "@scribbl/shared-types";
import React from "react";

type Props = Pick<RoomInClient, "roomOwnerID" | "players">;

const ListOfPlayers: React.FC<Props> = ({
  players,
  roomOwnerID
}) => {

  const handleVote = () => {

  };

  return (
    <section className="h-full shadow-md shadow-black/20 rounded-lg dark:border p-2">
      <h3 className="font-bold mb-2">Players</h3>

      <div className="flex flex-col gap-2 p-1">
        {players.map(p => (
          <div
            key={p.userID}
            className="flex gap-4 items-center max-w-xs overflow-auto break-words whitespace-pre-wrap"
          >
            <div className="w-6 h-6 rounded-full">
              <img
                src={p.displayImage}
                alt={p.displayName + "'s avatar"}
                width={28}
                height={28}
                className="rounded-full w-full h-full"
              />
            </div>
            <div className="flex gap-2 items-center">
              {roomOwnerID === p.userID && (
                <span className="text-xs italic">Owner</span>
              )}
              <div className="flex gap-1 items-center">
                <div className="text-sm">{p.displayName}</div>
                {p.userID === socket.id && (
                  <span className="text-xs">&#40;You&#41;</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ListOfPlayers;