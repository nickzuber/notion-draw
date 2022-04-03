import { useEffect } from "react";
import { SetHoveredShapes } from "../state/state";
import { Status } from "../types/app";
import {
  CanvasTarget,
  getCanvasTargetFromEvent,
  getIdFromEventTarget,
} from "../utils/canvas";

export const useHoverEffect = (
  status: Status,
  onSetHoveredShapes: SetHoveredShapes,
) => {
  useEffect(() => {
    function handleMouseMove(event: MouseEvent) {
      const target = getCanvasTargetFromEvent(event);

      switch (status) {
        case Status.IDLE:
        case Status.CURVE:
          return setIdleHoverState(target, event, onSetHoveredShapes);
        default:
          return onSetHoveredShapes(null);
      }
    }

    document.addEventListener("mousemove", handleMouseMove, {
      passive: false,
    });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [status, onSetHoveredShapes]);
};

function setIdleHoverState(
  target: CanvasTarget,
  event: MouseEvent,
  onSetHoveredShapes: SetHoveredShapes,
) {
  switch (target) {
    case CanvasTarget.SHAPE:
      const id = getIdFromEventTarget(event.target);
      return onSetHoveredShapes(id);
    default:
      return onSetHoveredShapes(null);
  }
}
