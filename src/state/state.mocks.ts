import { Line, ShapeType } from "../types/shape";
import {
  makeShapeId,
  getMidpointOfStraightLine,
  movePoint,
  movePointX,
  point,
  line,
} from "../utils/shape";

const InitialPosition = {
  x: 1650,
  y: 750,
};

const mockLine: Line = {
  id: makeShapeId(),
  type: ShapeType.LINE,
  editing: false,
  start: point(InitialPosition.x, InitialPosition.y),
  end: point(InitialPosition.x + 130, InitialPosition.y + 300),
  curve: getMidpointOfStraightLine(
    movePoint(point(InitialPosition.x, InitialPosition.y), -200, 200),
    movePointX(point(InitialPosition.x + 130, InitialPosition.y + 300), -200),
  ),
};

const mockCurvedLine: Line = {
  id: makeShapeId(),
  type: ShapeType.LINE,
  editing: false,
  start: movePointX(mockLine.start, 100),
  end: movePointX(mockLine.end, 100),
  curve: getMidpointOfStraightLine(
    movePointX(mockLine.start, 50),
    movePointX(mockLine.end, 50),
  ),
};

const mockStraightLineHorizontal: Line = line(
  point(InitialPosition.x - 200, InitialPosition.y + 150),
  point(InitialPosition.x - 100, InitialPosition.y + 150),
);

const mockStraightLineVertical: Line = line(
  point(InitialPosition.x - 0, InitialPosition.y - 100 + 50),
  point(InitialPosition.x - 0, InitialPosition.y + 50),
);

const mockStraightLineDiagonal: Line = {
  id: makeShapeId(),
  type: ShapeType.LINE,
  editing: false,
  start: mockStraightLineHorizontal.end,
  end: mockStraightLineVertical.end,
  curve: getMidpointOfStraightLine(
    mockStraightLineHorizontal.end,
    mockStraightLineVertical.end,
  ),
  // curve: diagonalCurve,
};

export const Mocks = {
  Lines: {
    Standard: mockLine,
    Curved: mockCurvedLine,
    Horizontal: mockStraightLineHorizontal,
    Vertical: mockStraightLineVertical,
    Diagonal: mockStraightLineDiagonal,
  },
};
