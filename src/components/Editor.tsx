import { FC } from "react";
import styled from "@emotion/styled";
import { app, useAppState } from "../state/state";
// import { Renderer } from "./Renderer";
import { Controls } from "./Controls";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useSpaceBar } from "../hooks/useSpaceBar";
// import { getBox, getViewport } from "../utils/canvas";
// import { AnimationProvider } from "../contexts/animation";
// import { CursorPreviewProvider } from "../contexts/preview";
// import { MouseProvider } from "../contexts/mouse";
import { defaultEditorOptions, EditorOptions } from "../types/app";
// import { ActivityProvider } from "../contexts/activity";

const Container = styled.div`
  position: relative;
  height: 80vh;
  min-height: 560px;
  width: 90%;
  margin: 24px auto 0;
  background: #ffffff;
  box-sizing: border-box;
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
  border-radius: 4px;
  overflow: hidden;
`;

type EditorProps = {
  debug?: boolean;
  showFPS?: boolean;
  containerStyle?: React.CSSProperties;
  svgStyle?: React.CSSProperties;
  options?: EditorOptions;
};

export const Editor: FC<EditorProps> = ({
  debug = false,
  showFPS = false,
  containerStyle = {},
  svgStyle = {},
  options = defaultEditorOptions,
}) => {
  const {
    // onPan,
    onPinch,
    // onDrawStart,
    // onDrawMove,
    // onDrawEnd,
    // onSelect,
    // onCurveStart,
    // onCurveMove,
    // onCurveEnd,
    // onMoveStart,
    // onMove,
    // onMoveEnd,
    // onSetHoveredShapes,
    onDeleteSelectedShapes,
    // onPenClick,
    // onPenMove,
    // onFreehandStart,
    // onFreehandMove,
    // onFreehandEnd,
    // onEraseStart,
    // onEraseMove,
    // onEraseEnd,
    setTheme,
  } = app;

  const { status, action, content, camera, theme, meta } = useAppState();
  // const box = getBox();
  // const viewport = getViewport(camera, box);

  useKeyboardShortcuts();
  useSpaceBar();

  return (
    <Container id="canvas" style={containerStyle}>
      {/* <Renderer
                status={status}
                action={action}
                meta={meta}
                camera={camera}
                theme={theme}
                onDrawStart={onDrawStart}
                onDrawMove={onDrawMove}
                onDrawEnd={onDrawEnd}
                content={content}
                onPan={onPan}
                onPinch={onPinch}
                onSelect={onSelect}
                onCurveStart={onCurveStart}
                onCurveMove={onCurveMove}
                onCurveEnd={onCurveEnd}
                onMoveStart={onMoveStart}
                onMove={onMove}
                onMoveEnd={onMoveEnd}
                onSetHoveredShapes={onSetHoveredShapes}
                onPenClick={onPenClick}
                onPenMove={onPenMove}
                onFreehandStart={onFreehandStart}
                onFreehandMove={onFreehandMove}
                onFreehandEnd={onFreehandEnd}
                onEraseStart={onEraseStart}
                onEraseMove={onEraseMove}
                onEraseEnd={onEraseEnd}
                debug={debug}
                options={options}
                svgStyle={svgStyle}
              /> */}
      <Controls
        status={status}
        camera={camera}
        action={action}
        meta={meta}
        shapes={content.shapes}
        theme={theme}
        setTheme={setTheme}
        selectedIds={content.selectedIds}
        onDeleteSelectedShapes={onDeleteSelectedShapes}
        onPinch={onPinch}
        options={options}
      />
    </Container>
  );
};
