import { Camera } from "./canvas";
import { Shape, ShapeId } from "./shape";

export type EditorOptions = {
  hideBackgroundPattern: boolean;
  disablePanning: boolean;
};

export const defaultEditorOptions = {
  hideBackgroundPattern: false,
  disablePanning: false,
};

export type Selectable = {
  selected?: boolean;
};

export enum Status {
  FREEHAND = "freehand",
  ERASE = "erase",
}

export enum Action {
  IDLE,
  DRAWING_FREEHAND,
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

export type Meta = {
  locked: boolean;
};

export type App = {
  status: Status;
  action: Action;
  camera: Camera;
  content: Content;
  theme: Theme;
  meta: Meta;
};

export type StateSelector<T, U> = (state: T) => U;

export function statusToString(status: Status) {
  switch (status) {
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
    case Action.DRAWING_FREEHAND:
      return "Drawing Freehand";
    case Action.ERASING:
      return "Erasing";
  }
}
