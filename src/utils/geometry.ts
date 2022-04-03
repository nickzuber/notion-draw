import { Point } from "../types/canvas";
import { Line } from "../types/shape";
import { distanceBetweenPoints, line } from "./shape";

export function stringOfPoint(point: Point) {
  return `${point.x.toFixed(3)},${point.x.toFixed(3)}}`;
}

export function arePointsEqual(p1: Point, p2: Point): boolean {
  return stringOfPoint(p1) === stringOfPoint(p2);
}

export function getNearestMultiple(target: number) {
  return (n: number) => Math.round(n / target) * target;
}

export function ensureAngleWithinBounds(angle: number) {
  return ((angle % 360) + 360) % 360;
}

export function getAngleBetweenPoints(p1: Point, p2: Point) {
  return ensureAngleWithinBounds(
    180 - (Math.atan2(p1.y - p2.y, p1.x - p2.x) * 180) / Math.PI,
  );
}

export function rotatePoint(pivot: Point, point: Point, angle: number): Point {
  const radians = (Math.PI / 180) * angle;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const nx = cos * (point.x - pivot.x) + sin * (point.y - pivot.y) + pivot.x;
  const ny = cos * (point.y - pivot.y) - sin * (point.x - pivot.x) + pivot.y;
  return {
    x: nx,
    y: ny,
  };
}

export function rotateLine(pivot: Point, line: Line, angle: number): Line {
  return {
    ...line,
    start: rotatePoint(pivot, line.start, angle),
    end: rotatePoint(pivot, line.end, angle),
    curve: line.curve ? rotatePoint(pivot, line.curve, angle) : line.curve,
  };
}

export function getNearestPointFromLines(
  point: Point,
  lines: Line[],
  delta = 7,
) {
  let snappedPoint: Point | null = null;
  for (const line of lines) {
    if (
      distanceBetweenPoints(point, line.start) <= delta &&
      distanceBetweenPoints(point, line.start) > 0
    ) {
      snappedPoint = line.start;
      break;
    } else if (
      distanceBetweenPoints(point, line.end) <= delta &&
      distanceBetweenPoints(point, line.end) > 0
    ) {
      snappedPoint = line.end;
      break;
    }
  }

  return snappedPoint;
}

export function getIntersectionBetweenTwoLineSegments(
  l1: Line,
  l2: Line,
): Point | null {
  // Check if none of the lines are of length 0
  if (
    (l1.start.x === l1.end.x && l1.start.y === l1.end.y) ||
    (l2.start.x === l2.end.x && l2.start.y === l2.end.y)
  ) {
    return null;
  }

  const denominator =
    (l2.end.y - l2.start.y) * (l1.end.x - l1.start.x) -
    (l2.end.x - l2.start.x) * (l1.end.y - l1.start.y);

  // Lines are parallel
  if (denominator === 0) {
    return null;
  }

  const ua =
    ((l2.end.x - l2.start.x) * (l1.start.y - l2.start.y) -
      (l2.end.y - l2.start.y) * (l1.start.x - l2.start.x)) /
    denominator;
  const ub =
    ((l1.end.x - l1.start.x) * (l1.start.y - l2.start.y) -
      (l1.end.y - l1.start.y) * (l1.start.x - l2.start.x)) /
    denominator;

  // Is the intersection along the segments
  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
    return null;
  }

  // Return a object with the x and y coordinates of the intersection
  const x = l1.start.x + ua * (l1.end.x - l1.start.x);
  const y = l1.start.y + ua * (l1.end.y - l1.start.y);

  return {
    x,
    y,
  };
}

export function getIntersectionBetweenTwoLines(
  l1: Line,
  l2: Line,
): Point | null {
  const denominator =
    (l2.end.y - l2.start.y) * (l1.end.x - l1.start.x) -
    (l2.end.x - l2.start.x) * (l1.end.y - l1.start.y);

  if (denominator === 0) {
    return null;
  }

  let a = l1.start.y - l2.start.y;
  let b = l1.start.x - l2.start.x;
  let numerator1 = (l2.end.x - l2.start.x) * a - (l2.end.y - l2.start.y) * b;
  let numerator2 = (l1.end.x - l1.start.x) * a - (l1.end.y - l1.start.y) * b;
  a = numerator1 / denominator;
  b = numerator2 / denominator;

  // if we cast these lines infinitely in both directions, they intersect here:
  const x = l1.start.x + a * (l1.end.x - l1.start.x);
  const y = l1.start.y + a * (l1.end.y - l1.start.y);

  return {
    x,
    y,
  };
}

export function getAutoCurvePointFromTwoLines(
  target: Line,
  startConnection: Line,
  endConnection: Line,
): Point | null {
  // Trivial curve is where the two lines form a simple joint.
  const trivialCurve = getIntersectionBetweenTwoLines(
    line(startConnection.curve as Point, target.start),
    line(endConnection.curve as Point, target.end),
  );

  return trivialCurve;
}

export function findConnectedLines(
  point: Point,
  lines: Line[],
  equalityThreshold = 1,
): Line[] {
  const connections = [];
  for (const line of lines) {
    if (
      distanceBetweenPoints(line.start, point) < equalityThreshold ||
      distanceBetweenPoints(line.end, point) < equalityThreshold
    ) {
      connections.push(line);
    }
  }

  return connections;
}
