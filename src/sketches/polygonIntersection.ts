import polygonClipping from "polygon-clipping";

export type Vertex = [number, number];
export type Polygon = Vertex[];

const hasArea = (ring: Polygon): boolean => {
  if (ring.length < 3) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < ring.length; i += 1) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    sum += x1 * y2 - x2 * y1;
  }

  return Math.abs(sum) > Number.EPSILON;
};

/**
 * Intersects two simple polygons (convex or concave) and returns resulting rings.
 * This adapter keeps geometry logic isolated so callers can swap implementations later.
 */
export const intersectPolygons = (
  polygonA: Polygon,
  polygonB: Polygon,
): Polygon[] => {
  const raw = polygonClipping.intersection([polygonA], [polygonB]);
  const output: Polygon[] = [];

  for (const polygon of raw) {
    for (const ring of polygon) {
      const convertedRing = ring.map(([x, y]) => [x, y] as Vertex);
      if (hasArea(convertedRing)) {
        output.push(convertedRing);
      }
    }
  }

  return output;
};
