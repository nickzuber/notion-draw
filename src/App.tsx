import { Editor } from "./components/Editor";
import "./css/styles.css";

export default function Notion() {
  return (
    <Editor
      svgStyle={{
        background: "#fff",
      }}
      options={{
        hideBackgroundPattern: true,
        hideControls: true,
        hideHeader: true,
        disablePanning: true,
        embedMode: true,
      }}
      containerStyle={{
        height: "100vh",
        minHeight: "100vh",
        width: "100%",
        borderRadius: 0,
        margin: 0,
      }}
    />
  );
}
