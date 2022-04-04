import { Point, PressuredPoint } from "./canvas";

export enum PathItem {
  CURVE_START_HANDLE = "curve-start-handle",
  CURVE_END_HANDLE = "curve-end-handle",
  CURVE_HANDLE = "curve-handle",
  SELECTION_BOX = "selection-box",
}

export type ShapeId = string;

export enum ShapeType {
  LINE = "line",
  FREEFORM = "freeform",
}

export type Shape = {
  id: ShapeId;
  type: ShapeType;
  editing: boolean;
  deleting?: boolean;
  color?: string;
  size?: number;
};

export interface Line extends Shape {
  type: ShapeType.LINE;
  start: Point;
  end: Point;
  curve: Point | null;
}

export interface Freeform extends Shape {
  type: ShapeType.FREEFORM;
  points: PressuredPoint[];
}
