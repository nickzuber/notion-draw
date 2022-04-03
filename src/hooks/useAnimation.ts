import { useCallback, useEffect, useRef, useState } from "react";
import { Point } from "../types/canvas";
import { stringOfPoint } from "../utils/geometry";

export const ANIMATION_TIME = 1 * 1000;

export type AnimationAPI = {
  animateAt: (point: Point) => void;
  animateAtOnce: (point: Point) => void;
  position: Point | null;
  isAnimating: boolean;
};

type State = {
  position: Point | null;
  isAnimating: boolean;
};

const initialState = {
  position: null,
  isAnimating: false,
};

export const useAnimation = (): AnimationAPI => {
  const [state, setState] = useState<State>(initialState);
  const ts = useRef<NodeJS.Timeout>();

  function reset() {
    if (ts.current) {
      clearTimeout(ts.current);
    }
  }

  useEffect(() => {
    return () => reset();
  }, []);

  const animateAt = useCallback((position: Point) => {
    reset();

    setState({
      position,
      isAnimating: true,
    });

    ts.current = setTimeout(() => {
      setState({
        position: null,
        isAnimating: false,
      });
    }, ANIMATION_TIME);
  }, []);

  const animateAtOnce = useCallback(
    (position: Point) => {
      // If not animation, we're good to go.
      if (!state.isAnimating) {
        animateAt(position);
      }

      // If we are animating, only override if its a new animation.
      else if (state.position && !comparePoints(state.position, position)) {
        animateAt(position);
      }
    },
    [state.isAnimating, state.position, animateAt],
  );

  return {
    animateAt,
    animateAtOnce,
    position: state.position,
    isAnimating: state.isAnimating,
  };
};

function comparePoints(p1: Point, p2: Point) {
  return stringOfPoint(p1) === stringOfPoint(p2);
}
