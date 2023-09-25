import { socket } from "@/lib/socket";
import { RoomInClient } from "@scribbl/shared-types";
import React from "react";

type Props = Pick<RoomInClient, "roomOwnerID" | "players">;

const ListOfPlayers: React.FC<Props> = ({ players, roomOwnerID }) => (
	<section className="h-full shadow-md shadow-black/20 rounded-lg dark:border p-2">
		<h3 className="font-bold mb-2">Players</h3>

		<div className="flex flex-col gap-2 p-1">
			{players.map((p) => (
				<div
					key={p.userID}
					className="flex gap-4 items-center max-w-xs overflow-x-auto break-words whitespace-normal"
				>
					<div className="w-7 h-7 rounded-full">
						<img
							src={p.displayImage}
							alt={p.displayName + "'s avatar"}
							width={28}
							height={28}
							className="rounded-full w-full h-full"
						/>
					</div>
					<div className="max-w-[70%] overflow-x-auto break-words whitespace-normal flex gap-2 items-center">
						{roomOwnerID === p.userID && (
							<span className="text-xs italic">Owner</span>
						)}
						<div className="flex gap-2 items-center overflow-x-auto break-words whitespace-normal">
							<div className="text-sm overflow-x-auto break-words whitespace-normal">
								{p.displayName}
							</div>
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

export default ListOfPlayers;
