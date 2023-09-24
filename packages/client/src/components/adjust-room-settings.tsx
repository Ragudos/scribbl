import { maxRoundsArray, type MAX_PLAYERS_PER_ROOM, type MAX_ROUNDS, maxAmountOfPlayersArray } from "@scribbl/shared-types";
import { socket } from "@/lib/socket";
import React from "react";

type Props = {
  maxAmountOfPlayers: MAX_PLAYERS_PER_ROOM;
  maxRounds: MAX_ROUNDS;
  roomID: string,
  setMaxAmountOfPlayers: (maxAmountOfPlayers: MAX_PLAYERS_PER_ROOM) => void;
  setMaxRounds: (maxRounds: MAX_ROUNDS) => void;
}

const AdjustRoomSettings: React.FC<Props> = React.memo(
  ({ maxAmountOfPlayers, maxRounds, roomID, setMaxAmountOfPlayers, setMaxRounds }) => {

    const changeAmountOfPlayers = (e: React.FormEvent<HTMLSelectElement>) => {
      const target = e.target as HTMLSelectElement;
      switch (target.value) {
        case "2":
        case "4":
        case "6":
        case "8":
          setMaxAmountOfPlayers(+target.value as MAX_PLAYERS_PER_ROOM);
          socket.emit("UpdateMaxPlayersInRoom", {
            userID: socket.id,
            roomID: roomID,
            updatedAmount: (+target.value as MAX_PLAYERS_PER_ROOM)
          });
          break;
      }
    };

    const changeAmountOfRounds = (e: React.FormEvent<HTMLSelectElement>) => {
      const target = e.target as HTMLSelectElement;

      switch (target.value) {
        case "2":
        case "4":
        case "6":
          setMaxRounds(+target.value as MAX_ROUNDS);
          socket.emit("UpdateMaxRoundsInRoom", {
            userID: socket.id,
            roomID: roomID,
            updatedAmount: (+target.value as MAX_ROUNDS)
          });
          break;
      }
    };

    return (
      <React.Fragment>
        <div className="flex items-center gap-2">
          Maximum Players Allowed:
          <select onChange={changeAmountOfPlayers} value={maxAmountOfPlayers} className="py-1 px-2 rounded-lg bg-background border focus-visible:ring-2 focus-visible:ring-accent/20 focus-visible:ring-offset-background focus-visible:ring-offset-2">
            {maxAmountOfPlayersArray.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          Rounds Total:
          <select onChange={changeAmountOfRounds} value={maxRounds} className="py-1 px-2 rounded-lg bg-background border focus-visible:ring-2 focus-visible:ring-accent/20 focus-visible:ring-offset-background focus-visible:ring-offset-2">
            {maxRoundsArray.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </React.Fragment>
    );
  }
);

AdjustRoomSettings.displayName = "AdjustRoomSettings";
export default AdjustRoomSettings;