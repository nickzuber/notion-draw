import { Camera } from "./canvas";
import { Shape, ShapeId } from "./shape";

export type EditorOptions = {
  hideHeader: boolean;
  hideControls: boolean;
  hideBackgroundPattern: boolean;
  disablePanning: boolean;
  embedMode: boolean;
};

export const defaultEditorOptions = {
  hideHeader: false,
  hideControls: false,
  hideBackgroundPattern: false,
  disablePanning: false,
  embedMode: false,
};

export type Selectable = {
  selected?: boolean;
};

export enum Status {
  PAN = "pan",
  IDLE = "idle",
  DRAW = "draw",
  CURVE = "curve",
  PEN = "pen",
  FREEHAND = "freehand",
  ERASE = "erase",
}

export enum Action {
  IDLE,
  DRAWING,
  DRAWING_PEN,
  DRAWING_FREEHAND,
  CURVING,
  HOVERING,
  MOVING,
  ERASING,
}

export type Content = {
  shapes: Shape[];
  selectedIds: ShapeId[];
  hoveredIds: ShapeId[];
};

export type Theme = {
  penColor: string;
  penSize: number;
  eraserSize: number;
};

export type App = {
  status: Status;
  action: Action;
  camera: Camera;
  content: Content;
  theme: Theme;
};

export type StateSelector<T, U> = (state: T) => U;

export function statusToString(status: Status) {
  switch (status) {
    case Status.IDLE:
      return "Idle";
    case Status.PAN:
      return "Pan";
    case Status.DRAW:
      return "Draw";
    case Status.CURVE:
      return "Curve";
    case Status.PEN:
      return "Pen";
    case Status.FREEHAND:
      return "Freehand";
    case Status.ERASE:
      return "Erase";
  }
}

export function actionToString(action: Action) {
  switch (action) {
    case Action.IDLE:
      return "Idle";
    case Action.DRAWING_PEN:
      return "Pen Drawing";
    case Action.DRAWING_FREEHAND:
      return "Freehand Drawing";
    case Action.DRAWING:
      return "Drawing";
    case Action.CURVING:
      return "Curving";
    case Action.HOVERING:
      return "Hovering";
    case Action.MOVING:
      return "Moving";
    case Action.ERASING:
      return "Erasing";
  }
}
