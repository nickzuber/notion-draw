import { Fragment, useState } from "react";
import styled from "@emotion/styled";
import { Editor } from "./components/Editor";
import "./css/styles.css";

export default function App() {
  const [debug, setDebug] = useState(false);
  const [showFPS, setShowFPS] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  return (
    <Fragment>
      <Editor
        debug={debug}
        showFPS={showFPS}
        containerStyle={
          fullscreen
            ? {
                height: "100vh",
                width: "100%",
                borderRadius: 0,
                margin: 0,
              }
            : {}
        }
      />
      <Content>
        <DebugButton onClick={(): void => setDebug((s) => !s)}>
          {debug ? "Disable" : "Enable"} debug
        </DebugButton>
        <DebugButton onClick={(): void => setFullscreen((s) => !s)}>
          {fullscreen ? "Disable" : "Enable"} fullscreen
        </DebugButton>
        <DebugButton onClick={(): void => setShowFPS((s) => !s)}>
          {showFPS ? "Disable" : "Enable"} FPS
        </DebugButton>
        <h1>Hey-o 👋 — Welcome to Spectre</h1>
        <Paragraph>
          Spectre is a targeted experimental SVG editor, designed to explore
          specific interactions and UX shortcuts for creating certain SVG
          elements.
        </Paragraph>
        <Paragraph>
          The main focus with this project is to explore the user experience
          around what an editor tool can feel like when its designed for a
          specific audience.
        </Paragraph>
        <Paragraph>
          The tools and features will be very intentional and specific to assist
          in building simple SVGs that involve image tracing and other
          associated tasks.
        </Paragraph>

        <h2 style={{ marginTop: 36 }}>Interested in this kind of stuff?</h2>
        <Paragraph>
          Me too! Check out what else I'm up to these days —{" "}
          <Link target="_blank" href="https://nickzuber.com">
            nickzuber.com
          </Link>
        </Paragraph>
      </Content>
    </Fragment>
  );
}

const Content = styled.div`
  position: relative;
  width: 80%;
  max-width: 650px;
  margin: 48px auto 128px;
  cursor: unset !important;
`;

const Paragraph = styled.p`
  font-size: 16px;
  font-weight: 400;
  letter-spacing: -0.06px;
  line-height: 26.5px;
  margin-bottom: 22.5px;
`;

const DebugButton = styled.button`
  position: relative;
  margin-right: 8px;
  margin-bottom: 0;
  color: #ffffff;
  background: #e91e63;
  border: 1px solid #dd054e;
  border-radius: 4px;

  font-size: 13px;
  letter-spacing: -0.06px;
  font-weight: 600;
  line-height: 20.5px;

  cursor: pointer;
  transition: all 100ms ease;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    opacity: 0.8;
  }
`;

const Link = styled.a`
  color: #00a0f5;
  text-underline-offset: 4px;

  cursor: pointer;
  transition: all 100ms ease;
  &:hover {
    opacity: 0.75;
  }

  &:active {
    opacity: 0.5;
  }
`;
