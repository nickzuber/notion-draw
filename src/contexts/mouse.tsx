import React, { FC, createContext } from "react";
import { MouseAPI, useMouse } from "../hooks/useMouse";

export const MouseContext = createContext<MouseAPI | null>(
  null,
) as React.Context<MouseAPI>;

export const MouseProvider: FC<{}> = ({ children }) => {
  const state = useMouse();

  return (
    <MouseContext.Provider value={state}>{children}</MouseContext.Provider>
  );
};
