// import { Editor } from "./components/Editor";
import "./css/styles.css";

export default function Notion() {
  // console.info("[notion-draw] test");
  // console.info("[notion-draw]", window);
  // console.info("[notion-draw]", window.parent);
  document.open();
  let cache: any = [];
  const str = JSON.stringify(
    window.parent,
    (key, value) => {
      if (typeof value === "object" && value !== null) {
        // Duplicate reference found, discard key
        if (cache.includes(value)) return;

        // Store value in our collection
        cache.push(value);
      }
      return value;
    },
    2,
  );
  cache = null;
  document.write(str.split("\n").join("<br />"));
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
