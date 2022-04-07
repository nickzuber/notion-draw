import { StateManager } from "rko";
import { initialCamera, initialContent, initialMeta, initialTheme } from "../constants/state";
import { Action, App, Meta, StateSelector, Status, Theme } from "../types/app";
import { Point, PressuredPoint, Zoom } from "../types/canvas";
import { Freeform, ShapeType } from "../types/shape";
import { panCamera, resetZoom, updateCamera, zoomCameraTo } from "../utils/camera";
import { screenToCanvasPressured } from "../utils/canvas";
import { isValidShape, makeShapeId } from "../utils/shape";
import { endEditing } from "../utils/state";

export const initialAppState: App = {
  status: Status.FREEHAND,
  action: Action.IDLE,
  camera: initialCamera,
  content: initialContent,
  theme: initialTheme,
  meta: initialMeta,
};

export type SetStatus = (status: Status) => void;
export type Pan = (dx: number, dy: number) => void;
export type Pinch = (center: Point, dz: Zoom) => void;
export type SetTheme = (theme: Partial<Theme>) => void;
export type SetMeta = (meta: Partial<Meta>) => void;
export type ResetZoom = () => void;
export type ResetCamera = () => void;
export type DeleteAllShapes = () => void;
export type FreehandStart = (point: PressuredPoint) => void;
export type FreehandMove = (point: PressuredPoint) => void;
export type FreehandEnd = () => void;
export type EraseStart = (point: PressuredPoint) => void;
export type EraseMove = (point: PressuredPoint) => void;
export type EraseEnd = () => void;

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

  setMeta: SetMeta = (meta) => {
    this.setState({
      before: {
        meta: this.state.meta,
      },
      after: {
        meta,
      },
    });
  };

  onPan: Pan = (dx, dy) => {
    this.patchState({
      camera: updateCamera(this.state.camera, (camera) => panCamera(camera, dx, dy)),
    });
  };

  onPinch: Pinch = (center, dz) => {
    this.patchState({
      camera: updateCamera(this.state.camera, (camera) => zoomCameraTo(camera, center, dz)),
    });
  };

  onResetZoom: ResetZoom = () => {
    this.setState({
      before: {
        camera: this.state.camera,
      },
      after: {
        camera: updateCamera(this.state.camera, (camera) => resetZoom(camera)),
      },
    });
  };

  onResetCamera: ResetCamera = () => {
    this.setState({
      before: {
        camera: this.state.camera,
      },
      after: {
        camera: updateCamera(this.state.camera, () => initialCamera),
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
        const shouldElementBeDeleted =
          pathElement?.isPointInStroke(pointOnSvg) || pathElement?.isPointInFill(pointOnSvg);
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

    this.setState({
      before: {
        action: this.snapshot.action,
        status: this.snapshot.status,
        content: this.snapshot.content,
      },
      after: {
        action: Action.IDLE,
        status: Status.FREEHAND,
        content: {
          ...this.state.content,
          selectedIds: [],
          shapes: updatedShapes,
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
}

// export const app = new AppState(initialAppState, "notion-draw", 1);
const url = window.location.href;
export const app = new AppState(initialAppState, url, 1);

export const useAppState = (selector?: StateSelector<App, any>) => {
  if (selector) {
    return app.useStore(selector);
  }
  return app.useStore();
};
