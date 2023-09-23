import type { Dimensions } from "@scribbl/shared-types";
import React from "react";

import DrawingCanvas from "./canvas";

import { getApproximatePosition, useDrawingLogic } from "@/lib/useDrawingLogic";
import { socket } from "@/lib/socket";
import { DrawingToolbar } from "./drawing-toolbar";

const DrawingScreen: React.FC = React.memo(() => {
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
	const handlePointerMove = React.useCallback(
		(e: PointerEvent) => {
			const canvas = canvasRef.current;
			if (!canvas || !state.isPointerDown) {
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
			});
			drawLine(direction);
		},
		[
			state.isPointerDown,
			state.lineCap,
			state.color,
			state.size,
			state.currentLine,
			drawLine,
		],
	);

	const handlePointerDown = React.useCallback(
		(e: PointerEvent) => {
			const canvas = canvasRef.current;
			if (!canvas) {
				return;
			}

			if (state.mode === "fill") {
				fill(state.color);
				socket.emit("SendFillCanvas", state.color);
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
			});

			drawLine(direction);
		},
		[changePointerState, drawLine, fill, state.color, state.currentLine, state.lineCap, state.mode, state.size],
	);

	const handlePointerCancel = React.useCallback(() => {
		changePointerState(false);

		resetLine();
		socket.emit("SendUserStoppedDrawing");
	}, [changePointerState, resetLine]);

	const handlePointerLeave = React.useCallback(() => {
		resetLine();
		socket.emit("SendUserStoppedDrawing");
	}, [resetLine]);

	React.useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}

		canvas.addEventListener("pointerdown", handlePointerDown);
		canvas.addEventListener("pointermove", handlePointerMove);
		canvas.addEventListener("pointerleave", handlePointerLeave);
		window.addEventListener("pointerup", handlePointerCancel);
		return () => {
			canvas.removeEventListener("pointerdown", handlePointerDown);
			canvas.removeEventListener("pointermove", handlePointerMove);
			canvas.addEventListener("pointerleave", handlePointerLeave);
			window.removeEventListener("pointerup", handlePointerCancel);
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
