import React, { FC, createContext } from "react";
import { AnimationAPI, useAnimation } from "../hooks/useAnimation";

export const AnimationContext = createContext<AnimationAPI | null>(
  null,
) as React.Context<AnimationAPI>;

export const AnimationProvider: FC<{}> = ({ children }) => {
  const state = useAnimation();

  return (
    <AnimationContext.Provider value={state}>
      {children}
    </AnimationContext.Provider>
  );
};
