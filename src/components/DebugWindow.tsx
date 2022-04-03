import { FC, useEffect } from "react";
import { Action, actionToString, Status, statusToString } from "../types/app";
import { Camera, Viewport } from "../types/canvas";
import { getBox } from "../utils/canvas";

type DebugWindowProps = {
  camera: Camera;
  status: Status;
  action: Action;
  onReset: () => void;
  onUndo: () => void;
  onRedo: () => void;
  viewport: Viewport;
};

export const DebugWindow: FC<DebugWindowProps> = ({
  camera,
  status,
  action,
  onReset,
  onUndo,
  onRedo,
  viewport,
}) => {
  const box = getBox();

  useEffect(() => {
    document.styleSheets[0].insertRule(
      `#canvas * { outline: 1px solid #6c6c6c11; }`,
      0,
    );
    return () => document.styleSheets[0].deleteRule(0);
  });

  return (
    <div className="debug-sticky">
      <button
        style={{ display: "block", margin: "0 0 10px" }}
        onClick={onReset}
      >
        Reset
      </button>
      <button style={{ display: "block", margin: "0 0 10px" }} onClick={onUndo}>
        Undo
      </button>
      <button style={{ display: "block", margin: "0 0 10px" }} onClick={onRedo}>
        Redo
      </button>

      <h4 style={{ marginBottom: 4 }}>Status</h4>
      <div>{statusToString(status)}</div>

      <h4 style={{ marginBottom: 4 }}>Action</h4>
      <div>{actionToString(action)}</div>

      <h4 style={{ marginBottom: 4 }}>Zoom</h4>
      <div>{Math.floor(camera.z * 100)}%</div>

      <h4 style={{ marginBottom: 4 }}>Camera</h4>
      <div>x: {Math.floor(camera.x)}</div>
      <div>y: {Math.floor(camera.y)}</div>

      <h4 style={{ marginBottom: 4 }}>Viewport</h4>
      <div>minX: {Math.floor(viewport.minX)}</div>
      <div>minY: {Math.floor(viewport.minY)}</div>
      <div>maxX: {Math.floor(viewport.maxX)}</div>
      <div>maxY: {Math.floor(viewport.maxY)}</div>
      <div>width: {Math.floor(viewport.width)}</div>
      <div>height: {Math.floor(viewport.height)}</div>

      <h4 style={{ marginBottom: 4 }}>Box</h4>
      <div>minX: {Math.floor(box.minX)}</div>
      <div>minY: {Math.floor(box.minY)}</div>
      <div>maxX: {Math.floor(box.maxX)}</div>
      <div>maxY: {Math.floor(box.maxY)}</div>
      <div>width: {Math.floor(box.width)}</div>
      <div>height: {Math.floor(box.height)}</div>
    </div>
  );
};
