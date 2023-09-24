import { MAX_PLAYERS_PER_ROOM, MAX_ROUNDS } from "@scribbl/shared-types";
import React from "react";

type Props = {
  maxAmountOfPlayers: MAX_PLAYERS_PER_ROOM;
  maxRounds: MAX_ROUNDS;
}

const ReadOnlyRoomSettings: React.FC<Props> = React.memo(
  ({ maxAmountOfPlayers, maxRounds }) => (
    <React.Fragment>
      <div className="flex items-center gap-2">
        Maximum Players Allowed:
        <span className="font-bold">{maxAmountOfPlayers}</span>
      </div>

      <div className="flex items-center gap-2">
        Rounds Total:
        <span className="font-bold">{maxRounds}</span>
      </div>
    </React.Fragment>
  )
);

ReadOnlyRoomSettings.displayName = "ReadOnlyRoomSettings";
export default ReadOnlyRoomSettings;