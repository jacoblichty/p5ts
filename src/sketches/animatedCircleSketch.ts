export const animatedCircleSketch = {
  setup: (p5: any, canvasParentRef: Element) => {
    p5.createCanvas(400, 400).parent(canvasParentRef);
  },

  draw: (p5: any) => {
    // Create a dynamic background
    p5.background(20, 25, 40);

    // Calculate time-based position
    const time = p5.millis() * 0.001;
    const x = p5.width / 2 + Math.cos(time) * 100;
    const y = p5.height / 2 + Math.sin(time * 1.5) * 60;

    // Draw animated circle
    p5.fill(100, 200, 255, 200);
    p5.noStroke();
    p5.circle(x, y, 50);

    // Add a trailing effect
    p5.fill(255, 100, 150, 100);
    p5.circle(x - Math.cos(time) * 20, y - Math.sin(time * 1.5) * 20, 30);
  },
};
