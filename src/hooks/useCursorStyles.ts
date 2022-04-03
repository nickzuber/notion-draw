import { useEffect, useRef } from "react";
import { Status } from "../types/app";
import { CanvasTarget, getCanvasTargetFromEvent } from "../utils/canvas";
import { setCursor } from "../utils/general";

const Cursors = {
  GRABBING: "grabbing",
  GRAB: "grab",
  MOVE: "move",
  DEFAULT: "default",
};

export const useCursorStyles = (svgRef: React.RefObject<SVGSVGElement>, status: Status) => {
  const isMouseDown = useRef(false);

  useEffect(() => {
    function handleMouseDown(event: MouseEvent) {
      switch (status) {
        case Status.PAN:
          isMouseDown.current = true;
          return setCursor(Cursors.GRABBING);
        default:
          return setCursor(Cursors.DEFAULT);
      }
    }

    function handleMouseMove(event?: MouseEvent) {
      const target = event ? getCanvasTargetFromEvent(event) : CanvasTarget.OTHER;

      switch (status) {
        case Status.PAN:
          return isMouseDown.current ? setCursor(Cursors.GRABBING) : setCursor(Cursors.GRAB);
        case Status.IDLE:
          return setIdleCursorState(target);
        case Status.CURVE:
          return setCurvingCursorState(target);
        default:
          return setCursor(Cursors.DEFAULT);
      }
    }

    function handleMouseUp(event: MouseEvent) {
      isMouseDown.current = false;

      switch (status) {
        case Status.PAN:
          setCursor(Cursors.GRAB);
          break;
        default:
          return;
      }
    }

    function handleMouseOut(event: MouseEvent) {
      isMouseDown.current = false;
      setCursor(null);
    }

    const svgElement = svgRef.current;
    if (!svgElement) return;

    // Run this logic whenever this component mounts.
    // This will effectively update the cursor without needing to move it after
    // something like the status changes from idle to pan, etc.
    handleMouseMove();

    svgElement.addEventListener("mousedown", handleMouseDown, {
      passive: false,
    });

    svgElement.addEventListener("mousemove", handleMouseMove, {
      passive: false,
    });

    svgElement.addEventListener("mouseup", handleMouseUp, {
      passive: false,
    });

    svgElement.addEventListener("mouseout", handleMouseOut, {
      passive: false,
    });

    return () => {
      svgElement.removeEventListener("mousedown", handleMouseDown);
      svgElement.removeEventListener("mousemove", handleMouseMove);
      svgElement.removeEventListener("mouseup", handleMouseUp);
      svgElement.removeEventListener("mouseout", handleMouseOut);
    };
  }, [svgRef, status]);
};

function setIdleCursorState(target: CanvasTarget) {
  switch (target) {
    default:
      return setCursor(Cursors.DEFAULT);
  }
}

function setCurvingCursorState(target: CanvasTarget) {
  switch (target) {
    case CanvasTarget.CURVE_HANDLE:
      return setCursor(Cursors.MOVE);
    default:
      return setCursor(Cursors.DEFAULT);
  }
}
