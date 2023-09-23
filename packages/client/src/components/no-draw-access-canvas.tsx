import type { DrawingPacketPayload } from "@scribbl/shared-types";
import React from "react";

import { socket } from "@/lib/socket";

import { useDrawingLogic } from "@/lib/useDrawingLogic";
import DrawingCanvas from "./canvas";

const NoDrawAccessCanvas = React.memo(() => {
	const canvasRef = React.useRef<HTMLCanvasElement>(null);
	const { changeCurrentLine, resetLine, drawLine, fill } = useDrawingLogic(
		canvasRef.current,
	);

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

	React.useEffect(() => {
		socket.on("EmitReceivedDrawingPacket", handleDrawingPacketReceived);
		socket.on("EmitUserStoppedDrawing", resetLine);
    socket.on("EmitReceivedFillCanvas", fill);
		return () => {
			socket.off("EmitReceivedDrawingPacket", handleDrawingPacketReceived);
			socket.off("EmitUserStoppedDrawing", resetLine);
      socket.off("EmitReceivedFillCanvas", fill);
		};
	}, [fill, handleDrawingPacketReceived, resetLine]);

	return (
		<div className="bg-white shadow-lg shadow-black/20 dark:border text-black flex flex-col gap-8">
			<DrawingCanvas ref={canvasRef} />
		</div>
	);
});

NoDrawAccessCanvas.displayName = "NoDrawAccessCanvas";
export default NoDrawAccessCanvas;
