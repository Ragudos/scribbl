import type { DrawingPacketPayload } from "@scribbl/shared-types";
import React from "react";

import { socket } from "@/lib/socket";

import { useDrawingLogic } from "@/lib/useDrawingLogic";
import DrawingCanvas from "./canvas";

const NoDrawAccessCanvas = React.memo(() => {
	const canvasRef = React.useRef<HTMLCanvasElement>(null);
	const { changeCurrentLine, resetLine, drawLine, fill, changeMode } =
		useDrawingLogic(canvasRef.current);

	const handleDrawingPacketReceived = React.useCallback(
		({
			color,
			size,
			lineCap,
			dimensionsByDimensions,
		}: DrawingPacketPayload) => {
			changeCurrentLine(dimensionsByDimensions.start);

			drawLine(
				{
					x: dimensionsByDimensions.end.x,
					y: dimensionsByDimensions.end.y,
				},
				color,
				size,
				lineCap,
			);
		},
		[changeCurrentLine, drawLine],
	);

	const handleUserErasingCanvas = React.useCallback(() => {
		changeMode("erase");
	}, [changeMode]);

	const handleUserStoppedErasingCanvas = React.useCallback(() => {
		changeMode("brush");
	}, [changeMode]);

	React.useEffect(() => {
		socket.on("EmitReceivedDrawingPacket", handleDrawingPacketReceived);
		socket.on("EmitUserStoppedDrawing", resetLine);
		socket.on("EmitReceivedFillCanvas", fill);
		socket.on("EmitUserErasingCanvas", handleUserErasingCanvas);
		socket.on("EmitUserStoppedErasingCanvas", handleUserStoppedErasingCanvas);
		return () => {
			socket.off("EmitReceivedDrawingPacket", handleDrawingPacketReceived);
			socket.off("EmitUserStoppedDrawing", resetLine);
			socket.off("EmitReceivedFillCanvas", fill);
			socket.off("EmitUserErasingCanvas", handleUserErasingCanvas);
			socket.off(
				"EmitUserStoppedErasingCanvas",
				handleUserStoppedErasingCanvas,
			);
		};
	}, [
		fill,
		handleDrawingPacketReceived,
		handleUserErasingCanvas,
		handleUserStoppedErasingCanvas,
		resetLine,
	]);

	return (
		<div className="bg-white shadow-lg shadow-black/20 dark:border text-black flex flex-col gap-8">
			<DrawingCanvas ref={canvasRef} />
		</div>
	);
});

NoDrawAccessCanvas.displayName = "NoDrawAccessCanvas";
export default NoDrawAccessCanvas;
