import { useMemo, useState } from "react";
import withRequestAnimationFrame from "raf-schd";
import { Point } from "../types/canvas";

export const ANIMATION_TIME = 1 * 1000;

export type CursorPreviewAPI = {
  renderPenPreviewAt: (point: Point) => void;
  removePreview: () => void;
  position: Point | null;
};

type State = {
  position: Point | null;
};

const initialState = {
  position: null,
};

export const useCursorPreview = (): CursorPreviewAPI => {
  const [state, setState] = useState<State>(initialState);

  const renderPenPreviewAt = (position: Point) => {
    setState({
      position,
    });
  };

  const removePreview = () => {
    setState({
      position: null,
    });
  };

  const renderPenPreviewAtPerf = useMemo(
    () => withRequestAnimationFrame(renderPenPreviewAt),
    [],
  );
  const removePreviewPerf = useMemo(() => withRequestAnimationFrame(removePreview), []);

  return {
    renderPenPreviewAt: renderPenPreviewAtPerf,
    removePreview: removePreviewPerf,
    position: state.position,
  };
};
