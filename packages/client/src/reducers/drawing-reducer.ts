import type { Dimensions, DrawMode, RGB, Sizes } from "@scribbl/shared-types";

export type DrawingProperties = {
  color: RGB;
  size: Sizes;
  lineCap: CanvasLineCap;
  currentLine: Dimensions | null;
};

export type DrawingState = {
  color: RGB;
  size: Sizes;
  lineCap: CanvasLineCap;
  currentLine: Dimensions | null;
  isPointerDown: boolean;
  mode: DrawMode;
};

export type DrawingStateAction =
  | {
    type: "change-color";
    payload: RGB;
  }
  | {
    type: "change-size";
    payload: Sizes;
  }
  | {
    type: "change-lineCap";
    payload: CanvasLineCap;
  }
  | {
    type: "changeCurrentLine";
    payload: Dimensions | null;
  }
  | {
    type: "changePointerState";
    payload: boolean;
  }
  | {
    type: "change-mode",
    payload: DrawMode
  };

export const initialDrawingState: DrawingState = {
  color: [0, 0, 0],
  size: 5,
  lineCap: "round",
  currentLine: null,
  isPointerDown: false,
  mode: "brush"
};

export const drawingReducer = (
  state: DrawingState,
  action: DrawingStateAction,
) => {
  switch (action.type) {
    case "change-color":
      state.color = action.payload;
      break;
    case "change-size":
      state.size = action.payload;
      break;
    case "change-lineCap":
      state.lineCap = action.payload;
      break;
    case "changeCurrentLine":
      state.currentLine = action.payload;
      break;
    case "changePointerState":
      state.isPointerDown = action.payload;
      break;
    case "change-mode":
      state.mode = action.payload;
      break;
  }

  return {
    color: state.color,
    size: state.size,
    lineCap: state.lineCap,
    currentLine: state.currentLine,
    isPointerDown: state.isPointerDown,
    mode: state.mode
  } satisfies DrawingState;
};
