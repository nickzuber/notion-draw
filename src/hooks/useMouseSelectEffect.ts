import { useEffect, useRef } from "react";
import withRequestAnimationFrame from "raf-schd";
import {
  Select,
  MoveSelectedShapes,
  CurveStart,
  CurveMove,
  CurveEnd,
  MoveEnd,
  MoveStart,
} from "../state/state";
import { Status } from "../types/app";
import { Point } from "../types/canvas";
import {
  CanvasTarget,
  getBox,
  getIdFromEventTarget,
  getCanvasTargetFromEvent,
} from "../utils/canvas";
import { compare } from "../utils/general";
import { distanceBetweenPoints } from "../utils/shape";

enum Mode {
  IDLE = "idle",
  DRAGGING = "acting",
  CURVING = "curving",
}

export const useMouseSelectEffect = (
  svgRef: React.RefObject<SVGSVGElement>,
  status: Status,
  onSelect: Select,
  onCurveStart: CurveStart,
  onCurveMove: CurveMove,
  onCurveEnd: CurveEnd,
  onMoveStart: MoveStart,
  onMove: MoveSelectedShapes,
  onMoveEnd: MoveEnd,
) => {
  const mouseStartRef = useRef<Point | null>(null);
  const mouseRef = useRef<Point | null>(null);
  const modeRef = useRef<Mode | null>(null);
  const isMovingRef = useRef<boolean>(false);

  useEffect(() => {
    if (!compare(status, Status.IDLE, Status.CURVE)) return;

    function handleMouseDown(event: MouseEvent) {
      event.preventDefault();
      const target = getCanvasTargetFromEvent(event);

      if (target === CanvasTarget.OTHER) {
        return;
      }

      switch (status) {
        case Status.IDLE:
          if (target === CanvasTarget.SHAPE) {
            const id = getIdFromEventTarget(event.target);
            onSelect(id, event.shiftKey);
          }
          break;
        case Status.CURVE:
          if (target === CanvasTarget.CURVE_HANDLE) {
            onCurveStart();
          } else if (target === CanvasTarget.SHAPE) {
            const id = getIdFromEventTarget(event.target);
            onSelect(id, event.shiftKey);
          }
          break;
      }

      if (compare(target, CanvasTarget.SHAPE, CanvasTarget.SELECTION_BOX)) {
        modeRef.current = Mode.DRAGGING;
      } else if (compare(target, CanvasTarget.CURVE_HANDLE)) {
        modeRef.current = Mode.CURVING;
      } else {
        modeRef.current = Mode.IDLE;
      }

      const { clientX, clientY } = event;
      mouseRef.current = { x: clientX, y: clientY };
      mouseStartRef.current = { x: clientX, y: clientY };
    }

    function handleMouseMove(event: MouseEvent) {
      if (!mouseRef.current || !mouseStartRef.current) return;

      const { clientX, clientY } = event;
      const deltaX = mouseRef.current.x - clientX;
      const deltaY = mouseRef.current.y - clientY;

      switch (modeRef.current) {
        case Mode.DRAGGING:
          // @TODO
          // This is a temporary fix. We really want to change movements from delta based
          // to position based.
          // This current workaround isn't perfect because it just causes a lag between
          // the cursor and moved item.
          const initDeltaX = Math.abs(mouseStartRef.current.x - mouseRef.current.x);
          const initDeltaY = Math.abs(mouseStartRef.current.y - mouseRef.current.y);
          if (initDeltaX > 3 || initDeltaY > 3) {
            onMove(-deltaX, -deltaY);

            // If we haven't tracked a move yet, this is when we begin moving.
            if (!isMovingRef.current) {
              isMovingRef.current = true;
              onMoveStart();
            }
          }
          break;
        case Mode.CURVING:
          const { clientX, clientY } = event;
          const { left, top } = getBox();
          const point = { x: clientX - left, y: clientY - top };
          onCurveMove(point);
          break;
      }

      mouseRef.current = { x: clientX, y: clientY };
    }

    function handleMouseUp(event: MouseEvent) {
      // Special case.
      // If you click while idle, unselect things.
      if (modeRef.current === Mode.IDLE && mouseStartRef.current) {
        const { clientX, clientY } = event;
        const point = { x: clientX, y: clientY };
        if (distanceBetweenPoints(mouseStartRef.current, point) < 3) {
          onSelect(null);
        }
      }

      switch (modeRef.current) {
        case Mode.CURVING:
          onCurveEnd();
          break;
        case Mode.DRAGGING:
          onMoveEnd();
          isMovingRef.current = false;
          break;
      }

      mouseRef.current = null;
      mouseStartRef.current = null;
      modeRef.current = null;
    }

    const svgElement = svgRef.current;
    if (!svgElement) return;

    const handleMouseDownPerf = withRequestAnimationFrame(handleMouseDown);
    const handleMouseMovePerf = withRequestAnimationFrame(handleMouseMove);
    const handleMouseUpPerf = withRequestAnimationFrame(handleMouseUp);

    svgElement.addEventListener("mousedown", handleMouseDownPerf, {
      passive: false,
    });
    document.addEventListener("mousemove", handleMouseMovePerf, {
      passive: false,
    });
    document.addEventListener("mouseup", handleMouseUpPerf, {
      passive: false,
    });

    return () => {
      svgElement.removeEventListener("mousedown", handleMouseDownPerf);
      document.removeEventListener("mousemove", handleMouseMovePerf);
      document.removeEventListener("mouseup", handleMouseUpPerf);
    };
  }, [
    svgRef,
    status,
    onSelect,
    onMoveStart,
    onMove,
    onMoveEnd,
    onCurveStart,
    onCurveMove,
    onCurveEnd,
  ]);

  return null;
};
