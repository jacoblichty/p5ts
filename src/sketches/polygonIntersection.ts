export type Vertex = [number, number];
export type Polygon = Vertex[];

const EPSILON = 1e-9;

const almostEqual = (a: number, b: number): boolean =>
  Math.abs(a - b) <= EPSILON;

const samePoint = (a: Vertex, b: Vertex): boolean =>
  almostEqual(a[0], b[0]) && almostEqual(a[1], b[1]);

const cross = (a: Vertex, b: Vertex, c: Vertex): number => {
  const abx = b[0] - a[0];
  const aby = b[1] - a[1];
  const acx = c[0] - a[0];
  const acy = c[1] - a[1];
  return abx * acy - aby * acx;
};

const signedArea = (ring: Polygon): number => {
  let sum = 0;
  for (let i = 0; i < ring.length; i += 1) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    sum += x1 * y2 - x2 * y1;
  }
  return sum / 2;
};

const hasArea = (ring: Polygon): boolean => {
  if (ring.length < 3) {
    return false;
  }

  return Math.abs(signedArea(ring)) > EPSILON;
};

const normalizeInputPolygon = (polygon: Polygon): Polygon => {
  if (polygon.length === 0) {
    return [];
  }

  const deduped: Polygon = [];
  for (const point of polygon) {
    if (
      deduped.length === 0 ||
      !samePoint(deduped[deduped.length - 1], point)
    ) {
      deduped.push([point[0], point[1]]);
    }
  }

  if (
    deduped.length > 1 &&
    samePoint(deduped[0], deduped[deduped.length - 1])
  ) {
    deduped.pop();
  }

  return deduped;
};

const ensureCCW = (polygon: Polygon): Polygon => {
  if (signedArea(polygon) < 0) {
    return [...polygon].reverse();
  }

  return [...polygon];
};

const pointInTriangle = (
  p: Vertex,
  a: Vertex,
  b: Vertex,
  c: Vertex,
): boolean => {
  const c1 = cross(a, b, p);
  const c2 = cross(b, c, p);
  const c3 = cross(c, a, p);

  const hasNeg = c1 < -EPSILON || c2 < -EPSILON || c3 < -EPSILON;
  const hasPos = c1 > EPSILON || c2 > EPSILON || c3 > EPSILON;
  return !(hasNeg && hasPos);
};

const triangulatePolygon = (polygon: Polygon): Polygon[] => {
  const ring = ensureCCW(normalizeInputPolygon(polygon));
  if (ring.length < 3 || !hasArea(ring)) {
    return [];
  }

  if (ring.length === 3) {
    return [ring];
  }

  const triangles: Polygon[] = [];
  const indices = ring.map((_, idx) => idx);
  let guard = 0;

  while (indices.length > 3 && guard < ring.length * ring.length) {
    guard += 1;
    let earFound = false;

    for (let i = 0; i < indices.length; i += 1) {
      const prevIndex = indices[(i + indices.length - 1) % indices.length];
      const currIndex = indices[i];
      const nextIndex = indices[(i + 1) % indices.length];

      const a = ring[prevIndex];
      const b = ring[currIndex];
      const c = ring[nextIndex];

      if (cross(a, b, c) <= EPSILON) {
        continue;
      }

      let containsOtherPoint = false;
      for (const index of indices) {
        if (index === prevIndex || index === currIndex || index === nextIndex) {
          continue;
        }

        if (pointInTriangle(ring[index], a, b, c)) {
          containsOtherPoint = true;
          break;
        }
      }

      if (containsOtherPoint) {
        continue;
      }

      triangles.push([a, b, c]);
      indices.splice(i, 1);
      earFound = true;
      break;
    }

    if (!earFound) {
      break;
    }
  }

  if (indices.length === 3) {
    triangles.push([ring[indices[0]], ring[indices[1]], ring[indices[2]]]);
  }

  return triangles;
};

const insideHalfPlane = (
  p: Vertex,
  edgeStart: Vertex,
  edgeEnd: Vertex,
): boolean => cross(edgeStart, edgeEnd, p) >= -EPSILON;

const lineIntersection = (
  a: Vertex,
  b: Vertex,
  c: Vertex,
  d: Vertex,
): Vertex => {
  const a1 = b[1] - a[1];
  const b1 = a[0] - b[0];
  const c1 = a1 * a[0] + b1 * a[1];

  const a2 = d[1] - c[1];
  const b2 = c[0] - d[0];
  const c2 = a2 * c[0] + b2 * c[1];

  const det = a1 * b2 - a2 * b1;
  if (Math.abs(det) <= EPSILON) {
    return [b[0], b[1]];
  }

  return [(b2 * c1 - b1 * c2) / det, (a1 * c2 - a2 * c1) / det];
};

const clipConvexPolygon = (subject: Polygon, clip: Polygon): Polygon => {
  let output = [...subject];

  for (let i = 0; i < clip.length; i += 1) {
    if (output.length === 0) {
      return [];
    }

    const edgeStart = clip[i];
    const edgeEnd = clip[(i + 1) % clip.length];
    const input = output;
    output = [];

    for (let j = 0; j < input.length; j += 1) {
      const current = input[j];
      const previous = input[(j + input.length - 1) % input.length];

      const currentInside = insideHalfPlane(current, edgeStart, edgeEnd);
      const previousInside = insideHalfPlane(previous, edgeStart, edgeEnd);

      if (previousInside && currentInside) {
        output.push(current);
      } else if (previousInside && !currentInside) {
        output.push(lineIntersection(previous, current, edgeStart, edgeEnd));
      } else if (!previousInside && currentInside) {
        output.push(lineIntersection(previous, current, edgeStart, edgeEnd));
        output.push(current);
      }
    }
  }

  return normalizeInputPolygon(output);
};

const polygonKey = (polygon: Polygon): string => {
  const normalized = normalizeInputPolygon(ensureCCW(polygon));
  if (normalized.length === 0) {
    return "";
  }

  let start = 0;
  for (let i = 1; i < normalized.length; i += 1) {
    const [x, y] = normalized[i];
    const [sx, sy] = normalized[start];
    if (x < sx - EPSILON || (almostEqual(x, sx) && y < sy - EPSILON)) {
      start = i;
    }
  }

  const rotated = normalized.map(
    (_, idx) => normalized[(start + idx) % normalized.length],
  );
  return rotated
    .map(
      ([x, y]) => `${Math.round(x * 1e6) / 1e6},${Math.round(y * 1e6) / 1e6}`,
    )
    .join(";");
};

/**
 * Intersects two simple polygons (convex or concave) and returns resulting rings.
 * Local implementation:
 * 1) Triangulate each polygon with ear clipping.
 * 2) Intersect each triangle pair using convex clipping.
 */
export const intersectPolygons = (
  polygonA: Polygon,
  polygonB: Polygon,
): Polygon[] => {
  const trianglesA = triangulatePolygon(polygonA);
  const trianglesB = triangulatePolygon(polygonB);
  const output: Polygon[] = [];
  const seen = new Set<string>();

  for (const triA of trianglesA) {
    for (const triB of trianglesB) {
      const clipped = clipConvexPolygon(triA, triB);
      if (!hasArea(clipped)) {
        continue;
      }

      const key = polygonKey(clipped);
      if (!key || seen.has(key)) {
        continue;
      }

      seen.add(key);
      output.push(clipped);
    }
  }

  return output;
};
