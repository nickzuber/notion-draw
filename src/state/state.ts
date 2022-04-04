import { StateManager } from "rko";
import { Palette } from "../constants/color";
import { Action, App, Content, StateSelector, Status, Theme } from "../types/app";
import { Camera, Point, PressuredPoint, Zoom } from "../types/canvas";
import { Line, Freeform, Shape, ShapeId, ShapeType } from "../types/shape";
import { panCamera, updateCamera, zoomCameraTo } from "../utils/camera";
import { screenToCanvas, screenToCanvasPressured } from "../utils/canvas";
import { notEmpty } from "../utils/general";
import {
  findConnectedLines,
  getAngleBetweenPoints,
  getAutoCurvePointFromTwoLines,
  getNearestMultiple,
  getNearestPointFromLines,
  rotatePoint,
} from "../utils/geometry";
import {
  isValidShape,
  makeShapeId,
  moveShapeBy,
  distanceBetweenPoints,
  getMidpointOfStraightLine,
  roundPoint,
} from "../utils/shape";
import { endEditing, beginEditing } from "../utils/state";

const initialCamera: Camera = {
  x: -1150,
  y: -650,
  z: 1,
};

const initialContent: Content = {
  shapes: [],
  selectedIds: [],
  hoveredIds: [],
};

const initialTheme: Theme = {
  penColor: Palette.Black,
  penSize: 4,
  eraserSize: 8,
};

export const initialAppState: App = {
  status: Status.FREEHAND,
  action: Action.IDLE,
  camera: initialCamera,
  content: initialContent,
  theme: initialTheme,
};

export type SetStatus = (status: Status) => void;
export type SelectAll = () => void;
export type Pan = (dx: number, dy: number) => void;
export type Pinch = (center: Point, dz: Zoom) => void;
export type DrawStart = (type: ShapeType, point: Point) => void;
export type DrawMove = (type: ShapeType, point: Point, snapToAngle?: boolean) => Point | null;
export type DrawEnd = () => void;
export type Select = (id: ShapeId | null, multiSelect?: boolean) => void;
export type MoveStart = () => void;
export type MoveSelectedShapes = (dx: number, dy: number) => void;
export type MoveEnd = () => void;
export type DeleteSelectedShapes = () => void;
export type DeleteAllShapes = () => void;
export type CurveStart = () => void;
export type CurveMove = (point: Point) => void;
export type CurveEnd = () => void;
export type SetHoveredShapes = (id: ShapeId | null) => void;
export type PenClick = ({
  point,
  isProjected,
  ignoreSnap,
}: {
  point: Point;
  isProjected: boolean;
  ignoreSnap?: boolean;
}) => void;
export type PenBegin = (point: Point, ignoreSnap?: boolean) => void;
export type PenFinish = (point: Point) => void;
export type PenMove = (
  point: Point,
  snapToAngle?: boolean,
) => {
  point: Point;
  snapped: boolean;
};
export type AutoCurveLine = (line: Line) => boolean;
export type FreehandStart = (point: PressuredPoint) => void;
export type FreehandMove = (point: PressuredPoint) => void;
export type FreehandEnd = () => void;
export type EraseStart = (point: PressuredPoint) => void;
export type EraseMove = (point: PressuredPoint) => void;
export type EraseEnd = () => void;
export type SetTheme = (theme: Partial<Theme>) => void;

export class AppState extends StateManager<App> {
  setStatus: SetStatus = (status) => {
    const validShapes = this.state.content.shapes.filter(isValidShape);
    const killedEditedShapes = validShapes.filter((shape) => !shape.editing);
    this.setState({
      before: {
        status: this.state.status,
        content: this.state.content,
      },
      after: {
        status,
        content: {
          ...this.state.content,
          shapes: killedEditedShapes,
        },
      },
    });
  };

  setTheme: SetTheme = (theme) => {
    this.setState({
      before: {
        theme: this.state.theme,
      },
      after: {
        theme,
      },
    });
  };

  onSelectAll: SelectAll = () => {
    this.setState({
      before: {
        action: this.state.action,
        status: this.state.status,
        content: this.state.content,
      },
      after: {
        action: Action.IDLE,
        status: Status.IDLE,
        content: {
          ...this.state.content,
          selectedIds: this.state.content.shapes.map((shape) => shape.id),
        },
      },
    });
  };

  onPan: Pan = (dx, dy) => {
    this.setState({
      before: {
        camera: this.state.camera,
      },
      after: {
        camera: updateCamera(this.state.camera, (camera) => panCamera(camera, dx, dy)),
      },
    });
  };

  onPinch: Pinch = (center, dz) => {
    this.setState({
      before: {
        camera: this.state.camera,
      },
      after: {
        camera: updateCamera(this.state.camera, (camera) => zoomCameraTo(camera, center, dz)),
      },
    });
  };

  onEraseStart: EraseStart = (point) => {
    this.setSnapshot();
    this.onEraseMove(point);
  };
  onEraseMove: EraseMove = (point) => {
    const pointOnCanvas = screenToCanvasPressured(point, this.state.camera);

    // @HACK
    // The web standards for this are wonky ATM - Chrome and FF seem to differ on the
    // type of point which `isPointInStroke` should accept. Chrome forces `SVGPoint` which
    // is already deprecated.
    const pointOnSvg = (document.getElementById("render-scene-svg") as any)?.createSVGPoint();
    pointOnSvg.x = pointOnCanvas.x;
    pointOnSvg.y = pointOnCanvas.y;

    const updatedShapes = this.state.content.shapes.map((shape) => {
      if (!shape.deleting && shape.type === ShapeType.FREEFORM) {
        const path = shape as Freeform;
        const pathElement = document.getElementById(path.id) as SVGGeometryElement | null;
        const shouldElementBeDeleted = pathElement?.isPointInStroke(pointOnSvg);
        return {
          ...path,
          deleting: shouldElementBeDeleted,
        };
      }
      return shape;
    });
    this.patchState({
      action: Action.ERASING,
      content: {
        ...this.state.content,
        shapes: updatedShapes,
      },
    });
  };
  onEraseEnd: EraseEnd = () => {
    const validShapes = this.state.content.shapes.filter(isValidShape);
    const updatedShapes = validShapes.map(endEditing);

    this.setState({
      before: {
        action: this.snapshot.action,
        status: this.snapshot.status,
        content: this.snapshot.content,
      },
      after: {
        action: Action.IDLE,
        status: Status.ERASE,
        content: {
          ...this.state.content,
          selectedIds: [],
          shapes: updatedShapes,
        },
      },
    });
  };

  onFreehandStart: FreehandStart = (point) => {
    this.setSnapshot();
    const pointOnCanvas = screenToCanvasPressured(point, this.state.camera);
    const id = makeShapeId();
    const shape = {
      id,
      type: ShapeType.FREEFORM,
      editing: true,
      points: [pointOnCanvas],
      color: this.state.theme.penColor,
      size: this.state.theme.penSize,
    } as Freeform;

    this.patchState({
      action: Action.DRAWING_FREEHAND,
      content: {
        ...this.state.content,
        selectedIds: [shape.id],
        shapes: [...this.state.content.shapes, shape],
      },
    });
  };
  onFreehandMove: FreehandMove = (point) => {
    const pointOnCanvas = screenToCanvasPressured(point, this.state.camera);
    const updatedShapes = this.state.content.shapes.map((shape) => {
      if (shape.editing && shape.type === ShapeType.FREEFORM) {
        const path = shape as Freeform;
        return {
          ...path,
          points: path.points.concat(pointOnCanvas),
        };
      }
      return shape;
    });
    this.patchState({
      action: Action.DRAWING_FREEHAND,
      content: {
        ...this.state.content,
        shapes: updatedShapes,
      },
    });
  };
  onFreehandEnd: FreehandEnd = () => {
    const validShapes = this.state.content.shapes.filter(isValidShape);
    const updatedShapes = validShapes.map(endEditing);

    // If the path just drawn was not valid, we assume the user is trying
    // to exit the drawing mode.
    const wasSomeEditedIdValid = this.state.content.shapes
      .filter((shape) => shape.editing)
      .some(isValidShape);

    this.setState({
      before: {
        action: this.snapshot.action,
        status: this.snapshot.status,
        content: this.snapshot.content,
      },
      after: {
        action: Action.IDLE,
        status: wasSomeEditedIdValid ? Status.FREEHAND : Status.IDLE,
        content: {
          ...this.state.content,
          selectedIds: [],
          shapes: updatedShapes,
        },
      },
    });
  };

  onDrawStart: DrawStart = (type, start) => {
    this.setSnapshot();
    const startOnCanvas = screenToCanvas(start, this.state.camera);
    const id = makeShapeId();

    let shape: Shape;

    switch (type) {
      case ShapeType.LINE:
      default: // Only handle lines for now.
        // @TODO refactor to use the snapping util.
        const delta = 7;
        let snappedPoint = startOnCanvas;
        const nonEditingLines = this.state.content.shapes
          .filter((shape) => !shape.editing)
          .filter((shape) => shape.type === ShapeType.LINE);

        for (const shape of nonEditingLines as Line[]) {
          if (distanceBetweenPoints(startOnCanvas, shape.start) <= delta) {
            snappedPoint = shape.start;
            break;
          } else if (distanceBetweenPoints(startOnCanvas, shape.end) <= delta) {
            snappedPoint = shape.end;
            break;
          }
        }

        shape = {
          id,
          type: ShapeType.LINE,
          editing: true,
          start: snappedPoint,
          end: snappedPoint,
          curve: snappedPoint,
        } as Line;
    }

    this.patchState({
      action: Action.DRAWING,
      content: {
        ...this.state.content,
        selectedIds: [shape.id],
        shapes: [...this.state.content.shapes, shape],
      },
    });
  };

  // If the draw action snapped to another line/point, we return that point.
  // Otherwise we return `null`.
  onDrawMove: DrawMove = (type, point, snapToAngle = false) => {
    const pointOnCanvas = screenToCanvas(point, this.state.camera);
    const getNearestSnapAngle = getNearestMultiple(15);

    // This is used for the return value. Only set to the snapped point
    // if its actually used in this function.
    let finalSnappedPoint = null;

    const nonEditingLines = this.state.content.shapes
      .filter((shape) => shape.type === ShapeType.LINE)
      .filter((shape) => !shape.editing) as Line[];

    const snappedPoint = getNearestPointFromLines(pointOnCanvas, nonEditingLines);

    const updatedShapes = this.state.content.shapes.map((shape) => {
      if (shape.editing) {
        switch (type) {
          case ShapeType.LINE:
            const line = shape as Line;

            // Initialize the end point as the simple place the cursor is.
            let endPoint = pointOnCanvas;

            // If we're snapping to an angle (shift is being held), do that work always.
            // This UX takes priority over other editing experiences.
            if (snapToAngle) {
              const angle = getAngleBetweenPoints(line.start, pointOnCanvas);
              const angleDelta = getNearestSnapAngle(angle) - angle;
              endPoint = rotatePoint(line.start, pointOnCanvas, angleDelta);
            }
            // Otherwise, check if there is a snapped point we can use instead
            // of the naive cursor position. If the snapped point is not the
            // start of the current line, use it.
            // This would've caused the snapped end point to create a 0 width line.
            else if (snappedPoint && distanceBetweenPoints(snappedPoint, line.start) > 0) {
              finalSnappedPoint = snappedPoint;
              endPoint = snappedPoint;
            }

            return {
              ...shape,
              curve: getMidpointOfStraightLine(line.start, endPoint),
              end: roundPoint(endPoint),
            };
          default:
            return shape;
        }
      }

      return shape;
    });

    this.patchState({
      action: Action.DRAWING,
      content: {
        ...this.state.content,
        shapes: updatedShapes,
      },
    });

    return finalSnappedPoint;
  };

  onDrawEnd: DrawEnd = () => {
    const validShapes = this.state.content.shapes.filter(isValidShape);
    const updatedShapes = validShapes.map(endEditing);
    const editedIds = validShapes
      .map((shape) => (shape.editing ? shape.id : null))
      .filter(notEmpty);

    this.setState({
      before: {
        action: this.snapshot.action,
        status: this.snapshot.status,
        content: this.snapshot.content,
      },
      after: {
        action: Action.IDLE,
        status: Status.IDLE,
        content: {
          ...this.state.content,
          selectedIds: editedIds,
          shapes: updatedShapes,
        },
      },
    });
  };

  onSelect: Select = (id, multiSelect = false) => {
    if (id && multiSelect) {
      const ids = this.state.content.selectedIds;
      this.patchState({
        // Avoid multi-selecting when curve is enabled.
        // Causes unexpected results.
        status: this.state.status === Status.CURVE ? Status.IDLE : this.state.status,
        content: {
          ...this.state.content,
          selectedIds: ids.includes(id) ? ids.filter((idx) => idx !== id) : ids.concat(id),
        },
      });
    } else if (id) {
      const ids = this.state.content.selectedIds;

      // @TODO might be a better way of handling this.
      // This is preventing a mousedown on a selection group
      // from selecting a single line when trying to move it.
      if (ids.includes(id)) return;

      this.setState({
        before: {
          content: this.state.content,
        },
        after: {
          content: {
            ...this.state.content,
            selectedIds: [id],
          },
        },
      });
    } else {
      this.setState({
        before: {
          status: this.state.status,
          content: this.state.content,
        },
        after: {
          status: Status.IDLE,
          content: {
            ...this.state.content,
            selectedIds: [],
          },
        },
      });
    }
  };

  onMoveStart = () => {
    this.setSnapshot();
  };

  onMove: MoveSelectedShapes = (dx, dy) => {
    const dxz = dx / this.state.camera.z;
    const dyz = dy / this.state.camera.z;

    this.patchState({
      action: Action.MOVING,
      content: {
        ...this.state.content,
        shapes: this.state.content.shapes.map((shape) => {
          return this.state.content.selectedIds.includes(shape.id)
            ? moveShapeBy(shape, dxz, dyz)
            : shape;
        }),
      },
    });
  };

  onMoveEnd: MoveEnd = () => {
    this.setState({
      before: {
        action: Action.IDLE,
        content: this.snapshot.content,
      },
      after: {
        action: Action.IDLE,
        content: this.state.content,
      },
    });
  };

  onDeleteSelectedShapes: DeleteSelectedShapes = () => {
    this.setState({
      before: {
        ...this.state,
      },
      after: {
        ...this.state,
        content: {
          ...this.state.content,
          selectedIds: [],
          shapes: this.state.content.shapes.filter(
            (shape) => !this.state.content.selectedIds.includes(shape.id),
          ),
        },
      },
    });
  };

  onDeleteAllShapes: DeleteAllShapes = () => {
    this.setState({
      before: {
        ...this.state,
      },
      after: {
        ...this.state,
        content: {
          ...this.state.content,
          selectedIds: [],
          shapes: [],
        },
      },
    });
  };

  onCurveStart: CurveStart = () => {
    this.setSnapshot();
    const updatedShapes = this.state.content.shapes.map((shape) => {
      return this.state.content.selectedIds.includes(shape.id) ? beginEditing(shape) : shape;
    });

    this.patchState({
      action: Action.CURVING,
      content: {
        ...this.state.content,
        shapes: updatedShapes,
      },
    });
  };

  onCurveMove: CurveMove = (point) => {
    const pointOnCanvas = screenToCanvas(point, this.state.camera);
    const updatedShapes = this.state.content.shapes.map((shape) => {
      if (this.state.content.selectedIds.includes(shape.id)) {
        return {
          ...shape,
          curve: pointOnCanvas,
        };
      }
      return shape;
    });

    this.patchState({
      action: Action.CURVING,
      content: {
        ...this.state.content,
        shapes: updatedShapes,
      },
    });
  };

  onCurveEnd: CurveEnd = () => {
    const updatedShapes = this.state.content.shapes.map(endEditing);

    this.setState({
      before: {
        action: this.snapshot.action,
        content: this.snapshot.content,
      },
      after: {
        action: Action.IDLE,
        content: {
          ...this.state.content,
          shapes: updatedShapes,
        },
      },
    });
  };

  onSetHoveredShapes: SetHoveredShapes = (id) => {
    // @TODO
    // Is there an more generic way to do this?
    if (this.state.content.hoveredIds[0] === id) return;
    if (this.state.content.hoveredIds.length === 0 && id === null) return;

    if (id) {
      this.patchState({
        action: Action.HOVERING,
        content: {
          ...this.state.content,
          hoveredIds: [id],
        },
      });
    } else {
      this.patchState({
        action: Action.IDLE,
        content: {
          ...this.state.content,
          hoveredIds: [],
        },
      });
    }
  };

  onPenClick: PenClick = ({ point, isProjected, ignoreSnap }) => {
    const pointOnCanvas = isProjected ? point : screenToCanvas(point, this.state.camera);

    const isEditingLine = this.state.content.shapes.some((shape) => shape.editing);

    if (isEditingLine) {
      this._onPenFinish(pointOnCanvas);
    } else {
      this._onPenBegin(pointOnCanvas, ignoreSnap);
    }
  };

  _onPenBegin: PenBegin = (point, ignoreSnap = false) => {
    this.setSnapshot();
    const id = makeShapeId();

    const nonEditingLines = this.state.content.shapes
      .filter((shape) => shape.type === ShapeType.LINE)
      .filter((shape) => !shape.editing) as Line[];

    const snappedPoint = !ignoreSnap
      ? getNearestPointFromLines(point, nonEditingLines)
      : point;
    const activePoint = snappedPoint || point;

    const shape = {
      id,
      type: ShapeType.LINE,
      editing: true,
      start: activePoint,
      end: activePoint,
      curve: activePoint,
    } as Line;

    this.patchState({
      action: Action.DRAWING_PEN,
      content: {
        ...this.state.content,
        selectedIds: [shape.id],
        shapes: [...this.state.content.shapes, shape],
      },
    });
  };

  _onPenFinish: PenFinish = (point) => {
    const hasInvalidShapes = !this.state.content.shapes.every(isValidShape);
    const validShapes = this.state.content.shapes.filter(isValidShape);
    const updatedShapes = validShapes.map(endEditing);
    const editedIds = validShapes
      .map((shape) => (shape.editing ? shape.id : null))
      .filter(notEmpty);

    if (hasInvalidShapes) {
      this.setState({
        before: {
          action: this.snapshot.action,
          status: this.snapshot.status,
          content: this.snapshot.content,
        },
        after: {
          action: Action.IDLE,
          status: Status.IDLE,
          content: {
            ...this.state.content,
            selectedIds: editedIds,
            shapes: updatedShapes,
          },
        },
      });
    } else {
      this.setState({
        before: {
          action: this.snapshot.action,
          status: this.snapshot.status,
          content: this.snapshot.content,
        },
        after: {
          action: Action.DRAWING_PEN,
          status: Status.PEN,
          content: {
            ...this.state.content,
            selectedIds: editedIds,
            shapes: updatedShapes,
          },
        },
      });
      this._onPenBegin(point);
    }
  };

  // Returns the final point of the move, regardless of a snap or not.
  onPenMove: PenMove = (point, snapToAngle = false) => {
    const pointOnCanvas = screenToCanvas(point, this.state.camera);
    const getNearestSnapAngle = getNearestMultiple(15);

    // This is used for the return value. Only set to the snapped point
    // if its actually used in this function.
    let finalSnappedPoint = pointOnCanvas;
    let finalSnappedStatus = false;

    const itemsAreBeingEdited = this.state.content.shapes.some((shape) => shape.editing);

    const nonEditingLines = this.state.content.shapes
      .filter((shape) => shape.type === ShapeType.LINE)
      .filter((shape) => !shape.editing) as Line[];

    const snappedPoint = getNearestPointFromLines(pointOnCanvas, nonEditingLines);

    const updatedShapes = this.state.content.shapes.map((shape) => {
      if (shape.editing) {
        const line = shape as Line;

        // Initialize the end point as the simple place the cursor is.
        let endPoint = pointOnCanvas;

        // If we're snapping to an angle (shift is being held), do that work always.
        // This UX takes priority over other editing experiences.
        if (snapToAngle) {
          const angle = getAngleBetweenPoints(line.start, pointOnCanvas);
          const angleDelta = getNearestSnapAngle(angle) - angle;
          endPoint = rotatePoint(line.start, pointOnCanvas, angleDelta);
        }
        // Otherwise, check if there is a snapped point we can use instead
        // of the naive cursor position. If the snapped point is not the
        // start of the current line, use it.
        // This would've caused the snapped end point to create a 0 width line.
        else if (snappedPoint && distanceBetweenPoints(snappedPoint, line.start) > 0) {
          finalSnappedStatus = true;
          endPoint = snappedPoint;
        }

        finalSnappedPoint = endPoint;
        return {
          ...shape,
          curve: getMidpointOfStraightLine(line.start, endPoint),
          end: roundPoint(endPoint),
        };
      }

      return shape;
    });

    this.patchState({
      action: Action.DRAWING_PEN,
      content: {
        ...this.state.content,
        shapes: updatedShapes,
      },
    });

    return {
      point: snapToAngle ? finalSnappedPoint : snappedPoint || finalSnappedPoint,
      snapped:
        !itemsAreBeingEdited && !snapToAngle
          ? //If no items are being edited and there was a snapped point,
            // we still want to consider this a snap
            Boolean(snappedPoint)
          : finalSnappedStatus,
    };
  };

  onAutoCurveLine: AutoCurveLine = (line) => {
    const restOfLines = this.state.content.shapes
      .filter((shape) => shape.type === ShapeType.LINE)
      .filter((shape) => shape.id !== line.id) as Line[];
    const startLines = findConnectedLines(line.start, restOfLines);
    const endLines = findConnectedLines(line.end, restOfLines);

    // If there are too many connected lines, we cannot choose which one to use without guessing.
    if (startLines.length !== 1 || endLines.length !== 1) {
      return false;
    }

    console.info(startLines, endLines);

    const startLine = startLines[0];
    const endLine = endLines[0];

    const curve = getAutoCurvePointFromTwoLines(line, startLine, endLine);

    // It's possible that we were unable to find a good curve.
    if (!curve) {
      return false;
    }

    const updatedShapes = this.state.content.shapes.map((shape) => {
      if (shape.id === line.id) {
        return {
          ...shape,
          curve,
        };
      }
      return shape;
    });

    this.patchState({
      action: Action.IDLE,
      content: {
        ...this.state.content,
        shapes: updatedShapes,
      },
    });

    return true;
  };
}

export const app = new AppState(initialAppState, "spectre", 4);

export const useAppState = (selector?: StateSelector<App, any>) => {
  if (selector) {
    return app.useStore(selector);
  }
  return app.useStore();
};
