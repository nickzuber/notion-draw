import { v4 as uuidv4 } from "uuid";
import { getStroke } from "perfect-freehand";
import { Path } from "../components/helpers/Svg";
import { Color } from "../constants/color";
import {
  FREEFORM_STROKE_WIDTH,
  LINE_STROKE_WIDTH,
  MAX_VALID_LINE_LENGTH,
} from "../constants/shapes";
import { Point, PressuredPoint } from "../types/canvas";
import { Line, Freeform, Shape, ShapeType } from "../types/shape";
import { notEmpty } from "./general";

export function makeShapeId() {
  return `shape-${uuidv4()}`;
}

export function moveLineBy(line: Line, dx: number, dy: number) {
  return {
    ...line,
    start: movePoint(line.start, dx, dy),
    end: movePoint(line.end, dx, dy),
    curve: line.curve ? movePoint(line.curve, dx, dy) : null,
  };
}

export function moveFreeformBy(path: Freeform, dx: number, dy: number) {
  return {
    ...path,
    points: path.points.map((point) => movePressuredPoint(point, dx, dy)),
  };
}

export function moveShapeBy(shape: Shape, dx: number, dy: number) {
  switch (shape.type) {
    case ShapeType.LINE:
      return moveLineBy(shape as Line, dx, dy);
    case ShapeType.FREEFORM:
      return moveFreeformBy(shape as Freeform, dx, dy);
    default:
      return shape;
  }
}

export function point(x: number, y: number): Point {
  return {
    x,
    y,
  };
}

export function line(p1: Point, p2: Point, p3?: Point): Line {
  return {
    id: makeShapeId(),
    type: ShapeType.LINE,
    editing: false,
    start: p1,
    end: p2,
    curve: p3 || getMidpointOfStraightLine(p1, p2),
  };
}

export function distanceBetweenPoints(p1: Point, p2: Point) {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

export function getApproximateSizeOfFreeform(path: Freeform) {
  const { minX, minY, maxX, maxY } = calculateBoundsFromShapes([path]);
  const xDelta = Math.abs(minX - maxX);
  const yDelta = Math.abs(minY - maxY);
  return Math.max(xDelta, yDelta);
}

export function getLengthOfLine(line: Line) {
  return distanceBetweenPoints(line.start, line.end);
}

export function getSvgPathFromStroke(stroke: number[][]) {
  if (!stroke.length) return "";

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"],
  );

  d.push("Z");
  return d.join(" ");
}

export function isValidShape(shape: Shape) {
  if (shape.deleting) return false;

  switch (shape.type) {
    case ShapeType.LINE:
      const line = shape as Line;
      return distanceBetweenPoints(line.start, line.end) > MAX_VALID_LINE_LENGTH;
    case ShapeType.FREEFORM:
      const path = shape as Freeform;
      // If the user simply clicks on the screen, let's not
      // consider this to be a valid shape.
      return getApproximateSizeOfFreeform(path) > 0;
    default:
      return true;
  }
}

export function roundPoint(p: Point): Point {
  return {
    x: Math.round(p.x),
    y: Math.round(p.y),
  };
}

export function movePressuredPoint(p: PressuredPoint, dx: number, dy: number): PressuredPoint {
  return {
    x: p.x + dx,
    y: p.y + dy,
    pressure: p.pressure,
  };
}

export function movePoint(p: Point, dx: number, dy: number): Point {
  return {
    x: p.x + dx,
    y: p.y + dy,
  };
}

export function movePointX(p: Point, dx: number): Point {
  return {
    x: p.x + dx,
    y: p.y,
  };
}

export function movePointY(p: Point, dy: number): Point {
  return {
    y: p.y + dy,
    x: p.x,
  };
}

export function getMidpointOfStraightLine(p1: Point, p2: Point): Point {
  return {
    x: (p2.x + p1.x) / 2,
    y: (p2.y + p1.y) / 2,
  };
}

export function getPointOnQuadraticLine(p1: Point, p2: Point, c: Point, t = 0.5): Point {
  return {
    x: (1 - t) ** 2 * p1.x + 2 * (1 - t) * t * c.x + t ** 2 * p2.x,
    y: (1 - t) ** 2 * p1.y + 2 * (1 - t) * t * c.y + t ** 2 * p2.y,
  };
}

export function getMidpointOfLine(line: Line) {
  return line.curve
    ? getPointOnQuadraticLine(line.start, line.end, line.curve)
    : getMidpointOfStraightLine(line.start, line.end);
}

export function getPointsFromLine(line: Line) {
  return line.curve
    ? [
        line.start,
        getPointOnQuadraticLine(line.start, line.end, line.curve, 0.1),
        getPointOnQuadraticLine(line.start, line.end, line.curve, 0.2),
        getPointOnQuadraticLine(line.start, line.end, line.curve, 0.3),
        getPointOnQuadraticLine(line.start, line.end, line.curve, 0.4),
        getPointOnQuadraticLine(line.start, line.end, line.curve, 0.5),
        getPointOnQuadraticLine(line.start, line.end, line.curve, 0.6),
        getPointOnQuadraticLine(line.start, line.end, line.curve, 0.7),
        getPointOnQuadraticLine(line.start, line.end, line.curve, 0.8),
        getPointOnQuadraticLine(line.start, line.end, line.curve, 0.9),
        line.end,
      ]
    : [line.start, line.end];
}

export function getPointsFromFreeform(path: Freeform) {
  return path.points;
}

export function getDistanceFromPointToLine(
  { x, y }: Point,
  [{ x: x1, y: y1 }, { x: x2, y: y2 }]: Point[],
): number {
  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const len_sq = C * C + D * D;
  let param = -1;

  // Edge case for length line of zero.
  if (len_sq !== 0) {
    param = dot / len_sq;
  }

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = x - xx;
  const dy = y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

export function pointToPathSegment(point: Point) {
  return `${point.x} ${point.y}`;
}

export function renderLineShape(line: Line) {
  return line.curve ? (
    <Path
      key={line.id}
      id={line.id}
      strokeWidth={line.size || LINE_STROKE_WIDTH}
      strokeLinecap="round"
      stroke={line.color || Color.Shape.Primary}
      fill={Color.Shape.Secondary}
      d={`
        M ${pointToPathSegment(line.start)}
        Q ${pointToPathSegment(line.curve)} ${pointToPathSegment(line.end)}
    `}
    />
  ) : (
    <Path
      key={line.id}
      id={line.id}
      strokeWidth={line.size || LINE_STROKE_WIDTH}
      strokeLinecap="round"
      stroke={line.color || Color.Shape.Primary}
      fill={Color.Shape.Secondary}
      d={`
        M ${pointToPathSegment(line.start)}
        L ${pointToPathSegment(line.end)}
    `}
    />
  );
}

function pressuredPointToArray(points: PressuredPoint[]): number[][] {
  return points.map(({ x, y, pressure }) => [x, y, pressure]);
}

export function getFreeformSvgPath(path: Freeform, size = FREEFORM_STROKE_WIDTH) {
  const options = {
    size,
    thinning: -0.55,
    streamline: 0.5,
    smoothing: 0.45,
    easing: (t: number) => t,
    start: {
      taper: 0,
      easing: (t: number) => t,
      cap: true,
    },
    end: {
      taper: 0,
      easing: (t: number) => t,
      cap: true,
    },
  };

  const pointsArr = pressuredPointToArray(path.points);
  const stroke = getStroke(pointsArr, options);

  return getSvgPathFromStroke(stroke);
}

export function renderFreeformShape(path: Freeform) {
  return (
    <Path
      key={path.id}
      id={path.id}
      stroke="none"
      strokeLinecap="round"
      fill={path.color || Color.Shape.Primary}
      opacity={path.deleting ? 0.5 : 1}
      d={`
        ${getFreeformSvgPath(path, path.size)}
      `}
    />
  );
}

export function renderShape(shape: Shape) {
  switch (shape.type) {
    case ShapeType.LINE:
      return renderLineShape(shape as Line);
    case ShapeType.FREEFORM:
      return renderFreeformShape(shape as Freeform);
    default:
      return null;
  }
}

export function drawShapes(shapes: Shape[]) {
  return shapes.map(renderShape).filter(notEmpty);
}

function calculateBoundsFromShapes(shapes: Shape[], padding = 0) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  // @TODO support freeform path
  for (const shape of shapes) {
    let points = [];
    switch (shape.type) {
      case ShapeType.LINE:
        points = getPointsFromLine(shape as Line);
        break;
      case ShapeType.FREEFORM:
        points = getPointsFromFreeform(shape as Freeform);
        break;
    }

    const pointsX = points.map((point) => point.x);
    const pointsY = points.map((point) => point.y);

    minX = Math.min(minX, ...pointsX, Infinity);
    minY = Math.min(minY, ...pointsY, Infinity);
    maxX = Math.max(maxX, ...pointsX, -Infinity);
    maxY = Math.max(maxY, ...pointsY, -Infinity);
  }

  minX = minX - padding;
  minY = minY - padding;
  maxX = maxX + padding;
  maxY = maxY + padding;

  return {
    minX,
    minY,
    maxX,
    maxY,
  };
}
