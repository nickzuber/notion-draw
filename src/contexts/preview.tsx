import React, { FC, createContext } from "react";
import { CursorPreviewAPI, useCursorPreview } from "../hooks/useCursorPreview";

export const CursorPreviewContext = createContext<CursorPreviewAPI | null>(
  null,
) as React.Context<CursorPreviewAPI>;

export const CursorPreviewProvider: FC<{}> = ({ children }) => {
  const state = useCursorPreview();

  return (
    <CursorPreviewContext.Provider value={state}>
      {children}
    </CursorPreviewContext.Provider>
  );
};
