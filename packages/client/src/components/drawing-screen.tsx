import type { Dimensions } from "@scribbl/shared-types";
import React from "react";

import DrawingCanvas from "./canvas";

import { getApproximatePosition, useDrawingLogic } from "@/lib/useDrawingLogic";
import { socket } from "@/lib/socket";
import { DrawingToolbar } from "./drawing-toolbar";

type Props = {
	roomID: string;
};

const DrawingScreen: React.FC<Props> = React.memo(({ roomID }) => {
	const canvasRef = React.useRef<HTMLCanvasElement>(null);
	const {
		state,
		changePointerState,
		resetLine,
		drawLine,
		fill,
		changeColor,
		changeLineCap,
		changeSize,
		changeMode,
	} = useDrawingLogic(canvasRef.current);

	const [isMounted, setIsMounted] = React.useState(false);

	React.useEffect(() => {
		setIsMounted(true);
	}, []);

	React.useEffect(() => {
		if (roomID && state.mode === "erase") {
			socket.emit("SendEraseCanvas", roomID);
		} else {
			socket.emit("SendUserNotErasing", roomID);
		}
	}, [roomID, state.mode]);

	const handlePointerMove = React.useCallback(
		(e: PointerEvent) => {
			const canvas = canvasRef.current;

			if (!state.isPointerDown || !canvas) {
				return;
			}

			const rect = canvas.getBoundingClientRect();
			const direction = {
				x: getApproximatePosition(e.clientX, rect.x, canvas.width, rect.width),
				y: getApproximatePosition(
					e.clientY,
					rect.y,
					canvas.height,
					rect.height,
				),
			} satisfies Dimensions;

			socket.emit("SendDrawingPacket", {
				lineCap: state.lineCap,
				color: state.color,
				size: state.size,
				dimensionsByDimensions: {
					start: state.currentLine ?? direction,
					end: direction,
				},
				roomID: roomID,
			});
			drawLine(direction);
		},
		[
			state.isPointerDown,
			state.lineCap,
			state.color,
			state.size,
			state.currentLine,
			roomID,
			drawLine,
		],
	);

	const handlePointerDown = React.useCallback(
		(e: PointerEvent) => {
			const canvas = canvasRef.current;
			if (!isMounted) {
				return;
			}

			if (!canvas) {
				return;
			}

			if (state.mode === "fill") {
				fill(state.color);
				socket.emit("SendFillCanvas", {
					color: state.color,
					roomID: roomID,
				});
				return;
			}

			changePointerState(true);

			const rect = canvas.getBoundingClientRect();
			const direction = {
				x: getApproximatePosition(e.clientX, rect.x, canvas.width, rect.width),
				y: getApproximatePosition(
					e.clientY,
					rect.y,
					canvas.height,
					rect.height,
				),
			} satisfies Dimensions;

			socket.emit("SendDrawingPacket", {
				lineCap: state.lineCap,
				color: state.color,
				size: state.size,
				dimensionsByDimensions: {
					start: state.currentLine ?? direction,
					end: direction,
				},
				roomID: roomID,
			});

			drawLine(direction);
		},
		[
			changePointerState,
			drawLine,
			fill,
			isMounted,
			roomID,
			state.color,
			state.currentLine,
			state.lineCap,
			state.mode,
			state.size,
		],
	);

	const handlePointerCancel = React.useCallback(() => {
		changePointerState(false);

		resetLine();
		socket.emit("SendUserStoppedDrawing", roomID);
	}, [changePointerState, resetLine, roomID]);

	const handlePointerLeave = React.useCallback(() => {
		resetLine();
		socket.emit("SendUserStoppedDrawing", roomID);
	}, [resetLine, roomID]);

	React.useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}

		canvas.addEventListener("pointerdown", handlePointerDown);
		canvas.addEventListener("pointermove", handlePointerMove);
		canvas.addEventListener("pointerleave", handlePointerLeave);
		window.addEventListener("pointerup", handlePointerCancel);
		window.addEventListener("pointercancel", handlePointerCancel);
		canvas.addEventListener("pointerout", handlePointerLeave);
		return () => {
			canvas.removeEventListener("pointerdown", handlePointerDown);
			canvas.removeEventListener("pointermove", handlePointerMove);
			canvas.addEventListener("pointerleave", handlePointerLeave);
			window.removeEventListener("pointerup", handlePointerCancel);
			window.removeEventListener("pointercancel", handlePointerCancel);
			canvas.removeEventListener("pointerout", handlePointerLeave);
		};
	}, [
		handlePointerDown,
		handlePointerCancel,
		handlePointerMove,
		handlePointerLeave,
	]);

	return (
		<React.Fragment>
			<div className="bg-white shadow-lg shadow-black/20 dark:border text-black flex flex-col">
				<DrawingCanvas ref={canvasRef} />
				<DrawingToolbar
					changeColor={changeColor}
					changeLineCap={changeLineCap}
					changeSize={changeSize}
					changeMode={changeMode}
					color={state.color}
					lineCap={state.lineCap}
					size={state.size}
					mode={state.mode}
				/>
			</div>
		</React.Fragment>
	);
});

DrawingScreen.displayName = "DrawingScreen";
export default DrawingScreen;
