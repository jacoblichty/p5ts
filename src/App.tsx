import P5Wrapper from "./components/P5Wrapper";
import { mainShapesSketch } from "./sketches/mainShapesSketch";
import "./App.css";

function App() {
  return (
    <main className="app">
      <P5Wrapper
        setup={mainShapesSketch.setup}
        draw={mainShapesSketch.draw}
        mousePressed={mainShapesSketch.mousePressed}
        mouseDragged={mainShapesSketch.mouseDragged}
        mouseReleased={mainShapesSketch.mouseReleased}
        keyPressed={mainShapesSketch.keyPressed}
        windowResized={mainShapesSketch.windowResized}
      />
    </main>
  );
}

export default App;
