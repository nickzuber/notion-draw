import React, { FC, createContext } from "react";
import { useActivity } from "../hooks/useActivity";

export const ActivityContext = createContext<boolean | null>(null) as React.Context<boolean>;

export const ActivityProvider: FC<{}> = ({ children }) => {
  const state = useActivity();

  return <ActivityContext.Provider value={state}>{children}</ActivityContext.Provider>;
};
