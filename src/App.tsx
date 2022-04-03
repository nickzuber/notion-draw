// import { Editor } from "./components/Editor";
import "./css/styles.css";

export default function Notion() {
  // console.info("[notion-draw] test");
  // console.info("[notion-draw]", window);
  // console.info("[notion-draw]", window.parent);
  document.open();
  document.write(["[parent props]", JSON.stringify(window.parent[0])].join("<br />"));
  document.close();
  return null;
  // return (
  //   <Editor
  //     svgStyle={{
  //       background: "#fff",
  //     }}
  //     options={{
  //       hideBackgroundPattern: true,
  //       hideControls: true,
  //       hideHeader: true,
  //       disablePanning: true,
  //       embedMode: true,
  //     }}
  //     containerStyle={{
  //       height: "100vh",
  //       minHeight: "100vh",
  //       width: "100%",
  //       borderRadius: 0,
  //       margin: 0,
  //     }}
  //   />
  // );
}
