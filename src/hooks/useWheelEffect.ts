import { useEffect } from "react";
import { Pan, Pinch } from "../state/state";
import { getBox } from "../utils/canvas";

export const useWheelEffect = (
  svgRef: React.RefObject<SVGSVGElement>,
  onPinch: Pinch,
  onPan: Pan,
  disable = false,
) => {
  useEffect(() => {
    if (disable) return;

    function handleWheel(event: WheelEvent) {
      event.preventDefault();

      // Should be zooming when holding Ctrl.
      if (event.ctrlKey) {
        const { clientX, clientY, deltaY } = event;
        const { left, top } = getBox();
        const center = { x: clientX - left, y: clientY - top };
        const dz = deltaY / 100;
        onPinch(center, dz);
      } else {
        const { deltaX, deltaY } = event;
        onPan(deltaX, deltaY);
      }
    }

    const svgElement = svgRef.current;
    if (!svgElement) return;
    svgElement.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      svgElement.removeEventListener("wheel", handleWheel);
    };
  }, [svgRef, onPan, onPinch, disable]);

  return null;
};
