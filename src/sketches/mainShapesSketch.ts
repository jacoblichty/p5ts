import polygonClipping from "polygon-clipping";
import { intersectPolygons } from "./polygonIntersection";

interface SketchShape {
  x: number;
  y: number;
  fill: [number, number, number];
  vertices: Array<[number, number]>;
}

const shapes: SketchShape[] = [];

export type IntersectionEngine = "polygonClipping" | "localPolygonIntersection";

let activeShapeIndex = -1;
let offsetX = 0;
let offsetY = 0;
let overlaps: Array<Array<[number, number]>> = [];
let intersectionEngine: IntersectionEngine = "polygonClipping";

export const setIntersectionEngine = (engine: IntersectionEngine) => {
  intersectionEngine = engine;
  computeOverlaps();
};

const getCanvasSize = (p5: any) => {
  const width = Math.max(
    480,
    Math.min(Math.floor(p5.windowWidth * 0.92), 1400),
  );
  const height = Math.max(
    420,
    Math.min(Math.floor(p5.windowHeight * 0.82), 900),
  );

  return { width, height };
};

const buildSpiralRibbonPoints = (
  cx: number,
  cy: number,
): Array<[number, number]> => {
  const centerline: Array<[number, number]> = [];
  const steps = 42;
  const maxAngle = Math.PI * 5.4;

  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const angle = t * maxAngle;
    const radius = 18 + t * 92;
    centerline.push([
      cx + Math.cos(angle) * radius,
      cy + Math.sin(angle) * radius,
    ]);
  }

  const left: Array<[number, number]> = [];
  const right: Array<[number, number]> = [];

  for (let i = 0; i < centerline.length; i += 1) {
    const t = i / (centerline.length - 1);
    const [x, y] = centerline[i];
    const [px, py] = centerline[Math.max(i - 1, 0)];
    const [nx, ny] = centerline[Math.min(i + 1, centerline.length - 1)];
    const dx = nx - px;
    const dy = ny - py;
    const length = Math.hypot(dx, dy) || 1;
    const normalX = -dy / length;
    const normalY = dx / length;
    const width = 2.5 + t * 6.5;

    left.push([x + normalX * width, y + normalY * width]);
    right.push([x - normalX * width, y - normalY * width]);
  }

  return [...left, ...right.reverse()];
};

const buildSquarePoints = (
  x: number,
  y: number,
  size: number,
): Array<[number, number]> => {
  const half = size / 2;
  return [
    [x - half, y - half],
    [x + half, y - half],
    [x + half, y + half],
    [x - half, y + half],
  ];
};

const buildTrianglePoints = (
  x: number,
  y: number,
  size: number,
): Array<[number, number]> => [
  [x, y - size / 2],
  [x - size / 2, y + size / 2],
  [x + size / 2, y + size / 2],
];

const buildStarPoints = (
  x: number,
  y: number,
  size: number,
): Array<[number, number]> => {
  const points: Array<[number, number]> = [];
  const outerRadius = size / 2;
  const innerRadius = outerRadius * 0.45;
  const step = Math.PI / 5;
  const rotation = -Math.PI / 2;

  for (let i = 0; i < 10; i += 1) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = rotation + i * step;
    points.push([x + Math.cos(angle) * radius, y + Math.sin(angle) * radius]);
  }

  return points;
};

const initShapes = (p5: any) => {
  shapes.length = 0;
  overlaps = [];
  activeShapeIndex = -1;

  const squareX = p5.width * 0.16;
  const squareY = p5.height * 0.24;
  const triangleX = p5.width * 0.5;
  const triangleY = p5.height * 0.2;
  const starX = p5.width * 0.84;
  const starY = p5.height * 0.24;
  const spiralX = p5.width * 0.28;
  const spiralY = p5.height * 0.72;
  const spiral2X = p5.width * 0.72;
  const spiral2Y = p5.height * 0.72;

  shapes.push(
    {
      x: squareX,
      y: squareY,
      fill: [100, 150, 255],
      vertices: buildSquarePoints(squareX, squareY, 90),
    },
    {
      x: triangleX,
      y: triangleY,
      fill: [255, 150, 90],
      vertices: buildTrianglePoints(triangleX, triangleY, 110),
    },
    {
      x: starX,
      y: starY,
      fill: [245, 215, 90],
      vertices: buildStarPoints(starX, starY, 95),
    },
    {
      x: spiralX,
      y: spiralY,
      fill: [90, 210, 170],
      vertices: buildSpiralRibbonPoints(spiralX, spiralY),
    },
    {
      x: spiral2X,
      y: spiral2Y,
      fill: [95, 165, 235],
      vertices: buildSpiralRibbonPoints(spiral2X, spiral2Y),
    },
  );
};

const pointInPolygon = (
  px: number,
  py: number,
  points: Array<[number, number]>,
) => {
  let inside = false;

  for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    const intersects =
      yi > py !== yj > py &&
      px < ((xj - xi) * (py - yi)) / (yj - yi + Number.EPSILON) + xi;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
};

const isPointerInShape = (p5: any, shape: SketchShape) =>
  pointInPolygon(p5.mouseX, p5.mouseY, shape.vertices);

const drawShape = (p5: any, shape: SketchShape, isActive: boolean) => {
  const [r, g, b] = shape.fill;
  p5.fill(r, g, b, isActive ? 140 : 255);
  p5.stroke(0);
  p5.strokeWeight(2);

  p5.beginShape();
  for (const [x, y] of shape.vertices) {
    p5.vertex(x, y);
  }
  p5.endShape(p5.CLOSE);
};

const computeOverlaps = () => {
  overlaps = [];

  for (let i = 0; i < shapes.length; i += 1) {
    for (let j = i + 1; j < shapes.length; j += 1) {
      const poly1 = shapes[i].vertices;
      const poly2 = shapes[j].vertices;

      if (intersectionEngine === "polygonClipping") {
        // polygon-clipping expects [ [ [x, y], ... ] ] for each polygon.
        const intersection = polygonClipping.intersection([poly1], [poly2]);

        for (const polygon of intersection) {
          for (const ring of polygon) {
            if (ring.length >= 3) {
              overlaps.push(ring as Array<[number, number]>);
            }
          }
        }
        continue;
      }

      const intersection = intersectPolygons(poly1, poly2);
      overlaps.push(...intersection);
    }
  }
};

const drawOverlaps = (p5: any) => {
  p5.fill(255, 0, 0, 200);
  p5.stroke(200, 0, 0);
  p5.strokeWeight(1);

  for (const polygon of overlaps) {
    p5.beginShape();
    for (const [x, y] of polygon) {
      p5.vertex(x, y);
    }
    p5.endShape(p5.CLOSE);
  }
};

const extractOverlapPolygons = (): Array<Array<[number, number]>> => {
  return [...overlaps];
};

export const mainShapesSketch = {
  setup: (p5: any, canvasParentRef: Element) => {
    const { width, height } = getCanvasSize(p5);
    p5.createCanvas(width, height).parent(canvasParentRef);
    p5.background(220);
    initShapes(p5);
  },

  windowResized: (p5: any) => {
    const { width, height } = getCanvasSize(p5);
    p5.resizeCanvas(width, height);
    initShapes(p5);
  },

  draw: (p5: any) => {
    p5.background(220);

    for (let i = 0; i < shapes.length; i += 1) {
      drawShape(p5, shapes[i], i === activeShapeIndex);
    }

    drawOverlaps(p5);
  },

  mousePressed: (p5: any) => {
    for (let i = shapes.length - 1; i >= 0; i -= 1) {
      const shape = shapes[i];
      if (isPointerInShape(p5, shape)) {
        activeShapeIndex = i;
        offsetX = p5.mouseX - shape.x;
        offsetY = p5.mouseY - shape.y;
        break;
      }
    }
  },

  mouseDragged: (p5: any) => {
    if (activeShapeIndex === -1) {
      return;
    }

    const shape = shapes[activeShapeIndex];
    const newX = p5.mouseX - offsetX;
    const newY = p5.mouseY - offsetY;
    const dx = newX - shape.x;
    const dy = newY - shape.y;

    shape.x = newX;
    shape.y = newY;

    for (const vertex of shape.vertices) {
      vertex[0] += dx;
      vertex[1] += dy;
    }

    computeOverlaps();
  },

  mouseReleased: () => {
    activeShapeIndex = -1;
    computeOverlaps();
  },

  keyPressed: (p5: any) => {
    if (p5.key === "c" || p5.key === "C") {
      const polygons = extractOverlapPolygons();

      for (const vertices of polygons) {
        shapes.push({ x: 0, y: 0, fill: [0, 200, 0], vertices });
      }
      computeOverlaps();
    }
  },
};
