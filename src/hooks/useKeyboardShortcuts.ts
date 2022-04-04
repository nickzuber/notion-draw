import { useHotkeys } from "react-hotkeys-hook";
import { app } from "../state/state";
import { Status } from "../types/app";

export const useKeyboardShortcuts = () => {
  useHotkeys("command+z,ctrl+z", () => {
    app.undo();
  });

  useHotkeys("command+shift+z,ctrl+shift+z", () => {
    app.redo();
  });

  useHotkeys("e,backspace", () => {
    app.onDeleteSelectedShapes();
  });

  useHotkeys("escape", () => {
    app.setStatus(Status.FREEHAND);
  });

  useHotkeys("d", () => {
    app.setStatus(Status.FREEHAND);
  });

  useHotkeys("e", () => {
    app.setStatus(Status.ERASE);
  });

  // useHotkeys("command+a", (e) => {
  //   e.preventDefault();
  //   app.onSelectAll();
  // });
};
