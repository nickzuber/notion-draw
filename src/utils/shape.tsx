import { Fragment } from "react";
import { v4 as uuidv4 } from "uuid";
import { getStroke } from "perfect-freehand";
import { DimensionsText } from "../components/helpers/DimensionsText";
import { Handle, HandleType } from "../components/helpers/Handle";
import { Popup } from "../components/helpers/Popup";
import { Rect, Path } from "../components/helpers/Svg";
import { Color, withOpacity } from "../constants/color";
import {
  // MAX_VALID_FREEFORM_SIZE,
  FREEFORM_STROKE_WIDTH,
  LINE_STROKE_WIDTH,
  MAX_VALID_LINE_LENGTH,
  SELECTION_BOX_PADDING,
} from "../constants/shapes";
import { Action, Status } from "../types/app";
import { Point, PressuredPoint } from "../types/canvas";
import { Line, Freeform, PathItem, Shape, ShapeId, ShapeType } from "../types/shape";
import { notEmpty } from "./general";
import { getAngleBetweenPoints } from "./geometry";

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
  switch (shape.type) {
    case ShapeType.LINE:
      const line = shape as Line;
      return distanceBetweenPoints(line.start, line.end) > MAX_VALID_LINE_LENGTH;
    case ShapeType.FREEFORM:
      // Just consider all markings as valid shapes for now as we see how people use this.
      return true;
    // const path = shape as Freeform;
    // return getApproximateSizeOfFreeform(path) > MAX_VALID_FREEFORM_SIZE;
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
      strokeWidth={LINE_STROKE_WIDTH}
      strokeLinecap="round"
      stroke={Color.Shape.Primary}
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
      strokeWidth={LINE_STROKE_WIDTH}
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
    thinning: 0,
    smoothing: 0.5,
    streamline: 0.5,
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
      strokeWidth={FREEFORM_STROKE_WIDTH}
      strokeLinecap="round"
      stroke={path.color || Color.Shape.Primary}
      fill={Color.Shape.Secondary}
      d={`
        ${getFreeformSvgPath(path)}
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

export function renderCurvingToolForLine(line: Line, z: number) {
  if (!line.curve) {
    return null;
  }

  const padding = 2;
  const boxWidth = 1 / z;

  const { minX, minY, maxX, maxY } = calculateBoundsFromShapes([line], padding);

  const center = getMidpointOfLine(line);

  const height = maxY - minY;
  const width = maxX - minX;

  const controlStart = distanceBetweenPoints(line.start, line.curve);
  const controlEnd = distanceBetweenPoints(line.end, line.curve);

  return (
    <Fragment key={line.id}>
      {/* Box */}
      <Rect
        id={PathItem.SELECTION_BOX}
        stroke={Color.CurveTool.Primary}
        strokeDasharray={2 / z}
        strokeOpacity={0.5}
        fill={withOpacity(Color.CurveTool.Primary)}
        strokeWidth={boxWidth}
        x={minX}
        y={minY}
        height={height}
        width={width}
      />

      {/* Dimensions */}
      <DimensionsText
        color={Color.CurveTool.Primary}
        dimensions={[controlStart, controlEnd]}
        x={(maxX + minX) / 2}
        y={maxY + 15 / z}
        z={z}
      />

      {/* Lines */}
      <Path
        stroke={Color.CurveTool.Primary}
        strokeWidth={boxWidth * 2}
        d={`
          M ${pointToPathSegment(line.start)}
          L ${pointToPathSegment(line.curve)}
      `}
      />
      <Path
        stroke={Color.CurveTool.Primary}
        strokeWidth={boxWidth * 2}
        d={`
          M ${pointToPathSegment(line.curve)}
          L ${pointToPathSegment(line.end)}
      `}
      />
      <Path
        stroke={Color.CurveTool.Primary}
        strokeDasharray={2 / z}
        strokeOpacity={0.5}
        fill={withOpacity(Color.CurveTool.Primary)}
        strokeWidth={boxWidth}
        d={`
          M ${pointToPathSegment(center)}
          L ${pointToPathSegment(line.curve)}
      `}
      />

      {/* Handles */}
      <Handle
        id={PathItem.CURVE_START_HANDLE}
        outerColor={Color.CurveTool.Secondary}
        innerColor={Color.CurveTool.Primary}
        x={line.start.x}
        y={line.start.y}
        z={z}
      />
      <Handle
        id={PathItem.CURVE_END_HANDLE}
        outerColor={Color.CurveTool.Secondary}
        innerColor={Color.CurveTool.Primary}
        x={line.end.x}
        y={line.end.y}
        z={z}
      />
      <Handle
        id={PathItem.CURVE_HANDLE}
        outerColor={Color.CurveTool.Secondary}
        innerColor={Color.CurveTool.Primary}
        x={line.curve.x}
        y={line.curve.y}
        z={z}
      />
    </Fragment>
  );
}

export function renderCurvingToolForShape(shape: Shape, z: number) {
  switch (shape.type) {
    case ShapeType.LINE:
      return renderCurvingToolForLine(shape as Line, z);
    default:
      return null;
  }
}

export function drawShapeTools(status: Status, shapes: Shape[], z: number) {
  switch (status) {
    case Status.CURVE:
      return shapes.map((shape) => renderCurvingToolForShape(shape, z)).filter(notEmpty);
    default:
      return null;
  }
}

// NOTE:
// Because of the laws of SVG rendering, we need to render the selection box
// separately from the rest of the selection state since we need it to be under
// the shapes (for click-event-reasons).
// https://www.w3.org/TR/SVG11/render.html#RenderingOrder
export function drawSelectionStateForBox(status: Status, shapes: Shape[], z: number) {
  if (shapes.length === 0) {
    return null;
  }

  switch (status) {
    case Status.PAN:
    case Status.IDLE:
      return shapes.length > 1 ? (
        <Fragment>{drawSelectionBox(shapes, z)}</Fragment>
      ) : // #drawSelectionState
      null;
    default:
      return null;
  }
}

// NOTE:
// Because of the laws of SVG rendering, we need to render the selection box
// separately from the rest of the selection state since we need it to be under
// the shapes (for click-event-reasons).
// https://www.w3.org/TR/SVG11/render.html#RenderingOrder
export function drawSelectionStateForBoxHandles(status: Status, shapes: Shape[], z: number) {
  if (shapes.length === 0) {
    return null;
  }

  switch (status) {
    case Status.PAN:
    case Status.IDLE:
      return shapes.length > 1 ? (
        <Fragment>{drawSelectionBoxHandles(shapes, z)}</Fragment>
      ) : // #drawSelectionState
      null;
    default:
      return null;
  }
}

// NOTE:
// Because of the laws of SVG rendering, we need to render the selection box
// separately from the rest of the selection state since we need it to be under
// the shapes (for click-event-reasons).
// https://www.w3.org/TR/SVG11/render.html#RenderingOrder
export function drawSelectionState(
  status: Status,
  action: Action,
  shapes: Shape[],
  z: number,
) {
  if (shapes.length === 0) {
    return null;
  }

  switch (status) {
    case Status.PAN:
    case Status.IDLE:
      return shapes.length > 1
        ? shapes.map((shape) => renderTraceForShape(shape, z))
        : renderActiveTraceForShape(shapes[0], z);
    case Status.DRAW:
    case Status.PEN:
    case Status.FREEHAND:
      return action === Action.DRAWING ||
        action === Action.DRAWING_FREEHAND ||
        action === Action.DRAWING_PEN ? (
        <Fragment>{shapes.map((shape) => renderDrawingTraceForShape(shape, z))}</Fragment>
      ) : (
        <Fragment>{shapes.map((shape) => renderActiveTraceForShape(shape, z))}</Fragment>
      );
    default:
      return null;
  }
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

export function drawSelectionBox(shapes: Shape[], z: number) {
  if (shapes.length === 0) {
    return null;
  }

  const boxWidth = 4 / z;
  const boxBorderWidth = 8 / z;

  const { minX, minY, maxX, maxY } = calculateBoundsFromShapes(shapes, SELECTION_BOX_PADDING);

  const height = maxY - minY;
  const width = maxX - minX;

  return (
    <Fragment>
      {/* Box */}
      <Rect
        id={`${PathItem.SELECTION_BOX}-border`}
        stroke={Color.SelectionBox.Secondary}
        fill={"none"}
        strokeWidth={boxBorderWidth}
        x={minX}
        y={minY}
        height={height}
        width={width}
      />
      <Rect
        id={PathItem.SELECTION_BOX}
        stroke={Color.SelectionBox.Primary}
        fill={withOpacity(Color.SelectionBox.Primary)}
        strokeWidth={boxWidth}
        x={minX}
        y={minY}
        height={height}
        width={width}
      />
    </Fragment>
  );
}

export function drawSelectionBoxHandles(shapes: Shape[], z: number) {
  if (shapes.length === 0) {
    return null;
  }

  const { minX, minY, maxX, maxY } = calculateBoundsFromShapes(shapes, SELECTION_BOX_PADDING);

  const height = maxY - minY;
  const width = maxX - minX;

  return (
    <Fragment>
      {/* Dimensions */}
      <DimensionsText
        color={Color.SelectionBox.Primary}
        dimensions={[width, height]}
        x={(maxX + minX) / 2}
        y={maxY + 15 / z}
        z={z}
      />

      {/* Handles */}
      <Handle
        outerColor={Color.SelectionBox.Secondary}
        innerColor={Color.SelectionBox.Primary}
        x={minX}
        y={minY}
        z={z}
      />
      <Handle
        outerColor={Color.SelectionBox.Secondary}
        innerColor={Color.SelectionBox.Primary}
        x={maxX}
        y={maxY}
        z={z}
      />
      <Handle
        outerColor={Color.SelectionBox.Secondary}
        innerColor={Color.SelectionBox.Primary}
        x={minX}
        y={maxY}
        z={z}
      />
      <Handle
        outerColor={Color.SelectionBox.Secondary}
        innerColor={Color.SelectionBox.Primary}
        x={maxX}
        y={minY}
        z={z}
      />
    </Fragment>
  );
}

export function renderTraceForShape(shape: Shape, z: number) {
  switch (shape.type) {
    case ShapeType.LINE:
      return renderTraceForLine(shape as Line, z);
    default:
      return null;
  }
}

export function renderActiveTraceForShape(shape: Shape, z: number) {
  switch (shape.type) {
    case ShapeType.LINE:
      return renderActiveTraceForLine(shape as Line, z);
    case ShapeType.FREEFORM:
      return renderActiveTraceForFreeform(shape as Freeform, z);
    default:
      return null;
  }
}

export function renderDrawingTraceForShape(shape: Shape, z: number) {
  switch (shape.type) {
    case ShapeType.LINE:
      return renderDrawingTraceForLine(shape as Line, z);
    default:
      return null;
  }
}

export function renderTraceForLine(line: Line, z: number, baseWidth = 1.5) {
  const strokeWidth = baseWidth / z;

  return line.curve ? (
    <Path
      key={`${line.id}-line-trace`}
      id={line.id} // ID is same as its original line for mouse events.
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      stroke={Color.HoverState.Primary}
      fill={Color.HoverState.Empty}
      d={`
        M ${pointToPathSegment(line.start)}
        Q ${pointToPathSegment(line.curve)} ${pointToPathSegment(line.end)}
    `}
    />
  ) : (
    <Path
      key={`${line.id}-line-trace`}
      id={line.id} // ID is same as its original line for mouse events.
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      stroke={Color.HoverState.Primary}
      fill={Color.HoverState.Empty}
      d={`
        M ${pointToPathSegment(line.start)}
        L ${pointToPathSegment(line.end)}
    `}
    />
  );
}

export function renderTraceForFreeform(path: Freeform, z: number, baseWidth = 1.5) {
  const strokeWidth = baseWidth / z;

  return (
    <Path
      key={`${path.id}-path-trace`}
      id={path.id} // ID is same as its original path for mouse events.
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      fill={Color.HoverState.Primary}
      d={`
        ${getFreeformSvgPath(path, strokeWidth)}
    `}
    />
  );
}

export function renderActiveTraceForLine(line: Line, z: number) {
  const center = getMidpointOfLine(line);
  const length = getLengthOfLine(line);

  const rotation = -Math.round(getAngleBetweenPoints(line.start, line.end));

  const distance = 15 / z + LINE_STROKE_WIDTH / 2;
  const flipPosition = rotation < -90 && rotation > -270;

  const angleValue = Math.atan2(line.end.y - line.start.y, line.end.x - line.start.x);

  const anchorPoint = flipPosition
    ? {
        x: Math.sin(angleValue) * distance + center.x,
        y: -Math.cos(angleValue) * distance + center.y,
      }
    : {
        x: -Math.sin(angleValue) * distance + center.x,
        y: Math.cos(angleValue) * distance + center.y,
      };

  return (
    <Fragment key={line.id}>
      {renderTraceForLine(line, z, 2)}
      <Handle
        type={HandleType.CIRCLE}
        x={line.start.x}
        y={line.start.y}
        z={z}
        outerColor={Color.SelectionBox.Secondary}
        innerColor={Color.SelectionBox.Primary}
      />
      <Handle
        type={HandleType.CIRCLE}
        x={line.end.x}
        y={line.end.y}
        z={z}
        outerColor={Color.SelectionBox.Secondary}
        innerColor={Color.SelectionBox.Primary}
      />
      <DimensionsText
        color={Color.SelectionBox.Primary}
        dimensions={[length, LINE_STROKE_WIDTH]}
        rotate={flipPosition ? rotation + 180 : rotation}
        x={anchorPoint.x}
        y={anchorPoint.y}
        z={z}
      />
    </Fragment>
  );
}

export function renderDrawingTraceForLine(line: Line, z: number) {
  const center = getMidpointOfLine(line);
  const length = getLengthOfLine(line);

  const rotation = -Math.round(getAngleBetweenPoints(line.start, line.end));

  const distance = 15 / z + LINE_STROKE_WIDTH / 2;
  const flipPosition = rotation < -90 && rotation > -270;

  const angleValue = Math.atan2(line.end.y - line.start.y, line.end.x - line.start.x);

  const anchorPoint = flipPosition
    ? {
        x: Math.sin(angleValue) * distance + center.x,
        y: -Math.cos(angleValue) * distance + center.y,
      }
    : {
        x: -Math.sin(angleValue) * distance + center.x,
        y: Math.cos(angleValue) * distance + center.y,
      };

  return (
    <Fragment key={line.id}>
      {renderTraceForLine(line, z, 3)}
      <DimensionsText
        color={Color.SelectionBox.Primary}
        dimensions={[length, LINE_STROKE_WIDTH]}
        rotate={flipPosition ? rotation + 180 : rotation}
        x={anchorPoint.x}
        y={anchorPoint.y}
        z={z}
      />
    </Fragment>
  );
}

export function renderActiveTraceForFreeform(path: Freeform, z: number) {
  // const center = getMidpointOfLine(line);
  // const length = getLengthOfLine(line);

  // const rotation = -Math.round(getAngleBetweenPoints(line.start, line.end));

  // const distance = 15 / z + LINE_STROKE_WIDTH / 2;
  // const flipPosition = rotation < -90 && rotation > -270;

  // const angleValue = Math.atan2(line.end.y - line.start.y, line.end.x - line.start.x);

  // const anchorPoint = flipPosition
  //   ? {
  //       x: Math.sin(angleValue) * distance + center.x,
  //       y: -Math.cos(angleValue) * distance + center.y,
  //     }
  //   : {
  //       x: -Math.sin(angleValue) * distance + center.x,
  //       y: Math.cos(angleValue) * distance + center.y,
  //     };

  return (
    <Fragment key={path.id}>
      {renderTraceForFreeform(path, z, 2)}
      {/* <DimensionsText
        color={Color.SelectionBox.Primary}
        dimensions={[length, LINE_STROKE_WIDTH]}
        rotate={flipPosition ? rotation + 180 : rotation}
        x={anchorPoint.x}
        y={anchorPoint.y}
        z={z}
      /> */}
    </Fragment>
  );
}

export function renderHoverStateForLine(line: Line, z: number) {
  return renderTraceForLine(line, z, 3);
}

export function renderHoverStateForFreeform(path: Freeform, z: number) {
  return renderTraceForFreeform(path, z, 3);
}

export function renderHoverStateForShape(shape: Shape, selectedIds: ShapeId[], z: number) {
  // Selected state takes priority over hover state.
  // We do this logic here in case we ever want to change it in the future.
  if (selectedIds.includes(shape.id)) return;

  switch (shape.type) {
    case ShapeType.LINE:
      return renderHoverStateForLine(shape as Line, z);
    case ShapeType.FREEFORM:
      return renderHoverStateForFreeform(shape as Freeform, z);
    default:
      return null;
  }
}

export function drawShapeHoverState(
  status: Status,
  shapes: Shape[],
  selectedIds: ShapeId[],
  z: number,
) {
  switch (status) {
    default:
      return shapes
        .map((shape) => renderHoverStateForShape(shape, selectedIds, z))
        .filter(notEmpty);
  }
}

export function drawMetaItems(status: Status, action: Action, shapes: Shape[], z: number) {
  switch (status) {
    case Status.IDLE:
    case Status.PAN:
      return [Action.IDLE, Action.HOVERING].includes(action)
        ? renderSelectionPopup(shapes, z)
        : null;
    default:
      return null;
  }
}

export function renderSelectionPopup(shapes: Shape[], z: number) {
  if (shapes.length === 0) return;

  const padding = 2;
  const { minX, maxX, minY } = calculateBoundsFromShapes(shapes, padding);

  return <Popup shapes={shapes} x={(maxX + minX) / 2} y={minY - 44} z={z} />;
}
