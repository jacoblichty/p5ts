import { useEffect, useState } from "react";
import P5Wrapper from "./components/P5Wrapper";
import {
  mainShapesSketch,
  setIntersectionEngine,
  type IntersectionEngine,
} from "./sketches/mainShapesSketch";
import "./App.css";

function App() {
  const [engine, setEngine] = useState<IntersectionEngine>("polygonClipping");

  useEffect(() => {
    setIntersectionEngine(engine);
  }, [engine]);

  return (
    <main className="app">
      <form
        className="tooling-overlay"
        aria-label="Intersection engine selector"
      >
        <fieldset>
          <legend>Overlap Engine</legend>

          <label>
            <input
              type="radio"
              name="intersectionEngine"
              value="polygonClipping"
              checked={engine === "polygonClipping"}
              onChange={() => setEngine("polygonClipping")}
            />
            polygonClipping
          </label>

          <label>
            <input
              type="radio"
              name="intersectionEngine"
              value="localPolygonIntersection"
              checked={engine === "localPolygonIntersection"}
              onChange={() => setEngine("localPolygonIntersection")}
            />
            local polygonIntersection
          </label>
        </fieldset>
      </form>

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
