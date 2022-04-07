import { Disabled } from "./components/Disabled";
import { Editor } from "./components/Editor";
import { isMobile } from "./constants/app";
import "./css/styles.css";

export default function Notion() {
  return isMobile ? (
    <Disabled />
  ) : (
    <Editor
      svgStyle={{
        background: "#fff",
      }}
      containerStyle={{
        height: "100vh",
        minHeight: "100vh",
        width: "100%",
        borderRadius: 0,
        margin: 0,
      }}
      options={{
        hideBackgroundPattern: true,
        disablePanning: false,
      }}
      debug={false}
      showFPS={false}
    />
  );
}
