import type { MiddlewareAuth } from "@scribbl/shared-types";
import { socket } from "@/lib/socket";
import React from "react";

type Props = {
	roomID: string;
	userToDraw: MiddlewareAuth;
};

const ChooseWord = React.lazy(() => import("./choose-word"));

const ChooseWordsOverlay: React.FC<Props> = React.memo(
	({ roomID, userToDraw }) => (
		<div className="z-10 absolute inset-0 m-auto h-full min-h-[15rem] w-full rounded-lg bg-accent/20 backdrop-blur-lg grid place-items-center">
			<div className="text-center">
				{userToDraw.userID === socket.id ? (
					<React.Suspense>
						<ChooseWord roomID={roomID} />
					</React.Suspense>
				) : (
					<div className="px-2 overflow-x-auto break-words whitespace-normal">
						{userToDraw.displayName} is choosing a word to draw...
					</div>
				)}
			</div>
		</div>
	),
);

ChooseWordsOverlay.displayName = "ChooseWordsOverlay";
export default ChooseWordsOverlay;
