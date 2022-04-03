import { Box, Camera, Point, PressuredPoint, Viewport } from "../types/canvas";
import { PathItem } from "../types/shape";

export const Bounds = {
  minX: 0,
  minY: 0,
  maxX: 3600,
  maxY: 1800,
  minZ: 0.1,
  maxZ: 5,
};

export function getBox(): Box {
  const elm = document.querySelector("#canvas");
  if (elm) {
    const rect = elm.getBoundingClientRect();
    return {
      minX: rect.left - rect.x,
      minY: rect.top - rect.y,
      maxX: rect.right - rect.x,
      maxY: rect.bottom - rect.y,
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    };
  } else {
    return {
      minX: 0,
      minY: 0,
      maxX: window.innerWidth,
      maxY: window.innerHeight,
      left: 0,
      top: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }
}

export function screenToCanvasPressured(
  point: PressuredPoint,
  camera: Camera,
): PressuredPoint {
  return {
    x: point.x / camera.z - camera.x,
    y: point.y / camera.z - camera.y,
    pressure: point.pressure,
  };
}

export function canvasToScreenPressured(
  point: PressuredPoint,
  camera: Camera,
): PressuredPoint {
  return {
    x: (point.x - camera.x) * camera.z,
    y: (point.y - camera.y) * camera.z,
    pressure: point.pressure,
  };
}

export function screenToCanvas(point: Point, camera: Camera): Point {
  return {
    x: point.x / camera.z - camera.x,
    y: point.y / camera.z - camera.y,
  };
}

export function canvasToScreen(point: Point, camera: Camera): Point {
  return {
    x: (point.x - camera.x) * camera.z,
    y: (point.y - camera.y) * camera.z,
  };
}

export function getViewport(camera: Camera, box: Box): Viewport {
  const topLeft = screenToCanvas({ x: box.minX, y: box.minY }, camera);
  const bottomRight = screenToCanvas({ x: box.maxX, y: box.maxY }, camera);

  return {
    minX: topLeft.x,
    minY: topLeft.y,
    maxX: bottomRight.x,
    maxY: bottomRight.y,
    height: bottomRight.y - topLeft.y,
    width: bottomRight.x - topLeft.x,
  };
}

export function getIdFromEventTarget(target: EventTarget | null) {
  const t = target as HTMLElement;
  return t.id;
}

export function isValidSelectionTarget(target: HTMLElement | null, allowSelectionBox = false) {
  const isShapeElement = target?.tagName === "path" && target?.id;
  const isSelectionBoxElement = target?.tagName === "rect" && target?.id === "selection-box";
  return allowSelectionBox ? isShapeElement || isSelectionBoxElement : isShapeElement;
}

export function isEventTargetShape(target: HTMLElement | null) {
  const isShapeElement = target?.tagName === "path" && target?.id;
  return isShapeElement;
}

export function isEventTargetSelectionBox(target: HTMLElement | null) {
  const isSelectionBoxElement =
    target?.tagName === "rect" && target?.id === PathItem.SELECTION_BOX;
  return isSelectionBoxElement;
}

export function isEventTargetCurveHandle(target: HTMLElement | null) {
  const isSelectionBoxElement =
    target?.tagName === "rect" && target?.id === PathItem.CURVE_HANDLE;
  return isSelectionBoxElement;
}

export function isEventTargetOnCanvas(target: HTMLElement | null) {
  return target instanceof SVGElement;
}

export enum CanvasTarget {
  SHAPE = "shape",
  SELECTION_BOX = "selection-box",
  CURVE_HANDLE = "curve-handle",
  SVG_ELEMENT = "svg-element",
  OTHER = "other",
}

export function getCanvasTargetFromEvent(event: MouseEvent): CanvasTarget {
  const t = event.target as HTMLElement | null;
  if (isEventTargetShape(t)) return CanvasTarget.SHAPE;
  if (isEventTargetSelectionBox(t)) return CanvasTarget.SELECTION_BOX;
  if (isEventTargetCurveHandle(t)) return CanvasTarget.CURVE_HANDLE;
  if (isEventTargetOnCanvas(t)) return CanvasTarget.SVG_ELEMENT;
  return CanvasTarget.OTHER;
}
