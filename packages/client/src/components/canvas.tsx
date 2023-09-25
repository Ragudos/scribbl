import React from "react";

const DrawingCanvas = React.forwardRef<HTMLCanvasElement>((_, ref) => (
	<div>
		<canvas
			ref={ref}
			className="w-full h-auto"
			style={{ imageRendering: "pixelated" }}
			width={800}
			height={600}
		>
			Your browser does not support HTML5 Canvas.
		</canvas>
	</div>
));

DrawingCanvas.displayName = "DrawingCanvas";
export default DrawingCanvas;
