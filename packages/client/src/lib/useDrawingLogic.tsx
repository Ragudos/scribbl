import type { Dimensions, DrawMode, RGB, Sizes } from "@scribbl/shared-types";
import React from "react";
import {
	drawingReducer,
	initialDrawingState,
} from "@/reducers/drawing-reducer";

export const getApproximatePosition = (
	cursorPosition: number,
	rect: number,
	dimensions: number,
	rectDimensions: number,
) => Math.floor((cursorPosition - rect) * (dimensions / rectDimensions));

export const useDrawingLogic = (canvas: HTMLCanvasElement | null) => {
	const [ctx, setCtx] = React.useState<CanvasRenderingContext2D | null>(null);
	const [state, dispatch] = React.useReducer(
		drawingReducer,
		initialDrawingState,
	);

	const fill = React.useCallback(
		(color: RGB | string) => {
			if (!ctx || !canvas) {
				return;
			}

			if (
				state.mode !== "erase" &&
				ctx.globalCompositeOperation === "destination-out"
			) {
				ctx.globalCompositeOperation = "source-over";
			}

			ctx.fillStyle =
				typeof color === "string"
					? color
					: `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		},
		[canvas, ctx, state.mode],
	);

	const drawLine = React.useCallback(
		(
			direction: Dimensions,
			color?: RGB,
			size?: Sizes,
			lineCap?: CanvasLineCap,
		) => {
			if (!ctx) {
				return;
			}

			if (
				state.mode !== "erase" &&
				ctx.globalCompositeOperation === "destination-out"
			) {
				ctx.globalCompositeOperation = "source-over";
			}

			ctx.beginPath();

			if (!size) {
				ctx.lineWidth = state.size;
			} else {
				ctx.lineWidth = size;
			}

			if (!lineCap) {
				ctx.lineCap = state.lineCap;
			} else {
				ctx.lineCap = lineCap;
			}

			if (!color) {
				ctx.strokeStyle = `rgb(${state.color[0]}, ${state.color[1]}, ${state.color[2]})`;
			} else {
				ctx.strokeStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
			}

			if (state.currentLine === null) {
				ctx.moveTo(direction.x, direction.y);
			} else {
				ctx.moveTo(state.currentLine.x, state.currentLine.y);
			}

			dispatch({ type: "changeCurrentLine", payload: direction });

			ctx.lineTo(direction.x, direction.y);

			ctx.stroke();
		},
		[
			ctx,
			state.color,
			state.currentLine,
			state.lineCap,
			state.mode,
			state.size,
		],
	);

	const resetLine = React.useCallback(() => {
		dispatch({ type: "changeCurrentLine", payload: null });
	}, []);

	const changeMode = React.useCallback(
		(mode: DrawMode) => {
			dispatch({
				type: "change-mode",
				payload: mode,
			});

			if (ctx) {
				if (mode === "erase") {
					ctx.globalCompositeOperation = "destination-out";
				} else {
					ctx.globalCompositeOperation = "source-over";
				}
			}
		},
		[ctx],
	);

	const changeColor = React.useCallback((color: RGB) => {
		dispatch({
			type: "change-color",
			payload: color,
		});
	}, []);

	const changeSize = React.useCallback((size: Sizes) => {
		dispatch({
			type: "change-size",
			payload: size,
		});
	}, []);

	const changeLineCap = React.useCallback((lineCap: CanvasLineCap) => {
		dispatch({
			type: "change-lineCap",
			payload: lineCap,
		});
	}, []);

	const changePointerState = React.useCallback((state: boolean) => {
		dispatch({
			type: "changePointerState",
			payload: state,
		});
	}, []);

	const changeCurrentLine = React.useCallback((direction: Dimensions) => {
		dispatch({
			type: "changeCurrentLine",
			payload: direction,
		});
	}, []);

	React.useEffect(() => {
		if (!canvas) {
			return;
		}

		setCtx(canvas.getContext("2d"));
	}, [canvas]);

	return {
		state,
		changeColor,
		changeLineCap,
		changePointerState,
		changeSize,
		resetLine,
		changeCurrentLine,
		drawLine,
		fill,
		changeMode,
	};
};
