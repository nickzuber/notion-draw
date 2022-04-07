import styled from "@emotion/styled";
import { FC, useRef } from "react";
import { useEraseEffect } from "../hooks/useEraseEffect";
import { useFreehandEffect } from "../hooks/useFreehandEffect";
import { useWheelEffect } from "../hooks/useWheelEffect";
import {
  FreehandStart,
  FreehandMove,
  FreehandEnd,
  Pan,
  Pinch,
  EraseStart,
  EraseMove,
  EraseEnd,
} from "../state/state";
import { Action, Content, EditorOptions, Meta, Status, Theme } from "../types/app";
import { Camera } from "../types/canvas";
import { Bounds } from "../utils/canvas";
import { drawShapesInDebugMode } from "../utils/debug";
import { drawShapes } from "../utils/shape";
import { AnimationRenderer } from "./helpers/AnimationRenderer";
import { ForeignObject } from "./helpers/Svg";

type RendererProps = {
  action: Action;
  status: Status;
  meta: Meta;
  camera: Camera;
  content: Content;
  theme: Theme;
  onPan: Pan;
  onPinch: Pinch;
  onFreehandStart: FreehandStart;
  onFreehandMove: FreehandMove;
  onFreehandEnd: FreehandEnd;
  onEraseStart: EraseStart;
  onEraseMove: EraseMove;
  onEraseEnd: EraseEnd;
  debug?: boolean;
  options: EditorOptions;
  svgStyle?: React.CSSProperties;
};

export const Renderer: FC<RendererProps> = ({
  camera,
  action,
  meta,
  status,
  content,
  onPan,
  onPinch,
  onFreehandStart,
  onFreehandMove,
  onFreehandEnd,
  onEraseStart,
  onEraseMove,
  onEraseEnd,
  debug,
  options,
  svgStyle = {},
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const { shapes } = content;

  // Panning
  useWheelEffect(svgRef, onPinch, onPan, options.disablePanning || meta.locked);

  // Controls
  useFreehandEffect(
    svgRef,
    status,
    onFreehandStart,
    onFreehandMove,
    onFreehandEnd,
    meta.locked,
  );
  useEraseEffect(svgRef, status, onEraseStart, onEraseMove, onEraseEnd, meta.locked);

  // Rendering variables.
  const transform = `scale(${camera.z}) translate(${camera.x}px, ${camera.y}px)`;

  return (
    <svg id="render-scene-svg" ref={svgRef} style={svgStyle}>
      {/* Actual content group */}
      <g style={{ transform }}>
        {/* Background Pattern */}
        {!options.hideBackgroundPattern && (
          <ForeignObject
            interactive={false}
            x={0}
            y={0}
            height={Bounds.maxY}
            width={Bounds.maxX}
          >
            <SVGBackground scale={camera.z} />
          </ForeignObject>
        )}

        {drawShapes(shapes)}

        <AnimationRenderer />
      </g>

      {/* Debugging group */}
      {debug && (
        <g style={{ transform, pointerEvents: "none" }}>
          <polyline className="debug-lines" points="2,1798, 3600,2" />
          <polyline className="debug-lines" points="2,2, 3600,1798" />
          {drawShapesInDebugMode(shapes, camera.z)}
        </g>
      )}
    </svg>
  );
};

// =============================================================================

function getSizeAndOffsetFromScale(scale: number): [number, number] {
  const size = 10;
  const offset = 0.75;

  let multiplier = 1;

  if (scale < 0.75) {
    multiplier = 1.5;
  }

  if (scale < 0.5) {
    multiplier = 2.5;
  }

  return [size * multiplier, offset * multiplier];
}

type Scalable = {
  scale: number;
};

const SVGBackground = styled.div<Scalable>(({ scale }) => {
  const [size, offset] = getSizeAndOffsetFromScale(scale);

  return `
  height: 100%;
  width: 100%;
  background-color: #ffffff;
  background-image: radial-gradient(#d7d7d7 ${offset}px, #ffffff ${offset}px);
  background-size: ${size}px ${size}px;
  pointer-events: none;
  user-select: none;
`;
});
