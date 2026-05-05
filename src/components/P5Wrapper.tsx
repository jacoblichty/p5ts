import React from "react";
import Sketch from "react-p5";

interface P5WrapperProps {
  setup: (p5: any, canvasParentRef: Element) => void;
  draw?: (p5: any) => void;
  mousePressed?: (p5: any) => void;
  mouseDragged?: (p5: any) => void;
  mouseReleased?: (p5: any) => void;
  keyPressed?: (p5: any) => void;
  windowResized?: (p5: any, event?: UIEvent) => void;
}

const P5Wrapper: React.FC<P5WrapperProps> = ({
  setup,
  draw,
  mousePressed,
  mouseDragged,
  mouseReleased,
  keyPressed,
  windowResized,
}) => {
  return (
    <div className="sketch-container">
      <Sketch
        setup={setup}
        draw={draw}
        mousePressed={mousePressed}
        mouseDragged={mouseDragged}
        mouseReleased={mouseReleased}
        keyPressed={keyPressed}
        windowResized={windowResized}
      />
    </div>
  );
};

export default P5Wrapper;
