import { useHotkeys } from "react-hotkeys-hook";
import { app } from "../state/state";
import { Status } from "../types/app";

export const useKeyboardShortcuts = () => {
  useHotkeys("command+z,ctrl+z", () => {
    console.info("undo");
    app.undo();
  });

  useHotkeys("command+shift+z,ctrl+shift+z", () => {
    console.info("redo");
    app.redo();
  });

  useHotkeys("e,backspace", () => {
    app.onDeleteSelectedShapes();
  });

  useHotkeys("escape", () => {
    app.setStatus(Status.IDLE);
  });

  useHotkeys("d", () => {
    app.setStatus(Status.FREEHAND);
  });

  useHotkeys("l", () => {
    app.setStatus(Status.DRAW);
  });

  useHotkeys("p", () => {
    app.setStatus(Status.PEN);
  });

  useHotkeys("command+a", (e) => {
    e.preventDefault();
    app.onSelectAll();
  });

  // @TODO unjank
  useHotkeys("c", () => {
    app.setStatus(Status.CURVE);
  });
};
