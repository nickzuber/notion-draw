export type Zoom = number;

export interface Point {
  x: number;
  y: number;
}

export interface PressuredPoint extends Point {
  pressure: number;
}

export interface Camera {
  x: number;
  y: number;
  z: Zoom;
}

export interface Viewport {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export interface Box extends Viewport {
  left: number;
  top: number;
}
