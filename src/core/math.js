export function distance3D(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function dot3D(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function cross3D(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  };
}

export function magnitude3D(vector) {
  return Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
}

export function normalize3D(vector) {
  const length = magnitude3D(vector);
  if (!length) {
    return { x: 0, y: 0, z: 1 };
  }

  return {
    x: vector.x / length,
    y: vector.y / length,
    z: vector.z / length
  };
}

export function subtract3D(a, b) {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z
  };
}

export function interpolateScale(points) {
  let maxAbs = 1;
  for (const point of points) {
    maxAbs = Math.max(maxAbs, Math.abs(point.x), Math.abs(point.y));
  }
  return maxAbs;
}

export function computeOrbitalPlaneBasis(points) {
  if (!points.length) {
    return {
      basisX: { x: 1, y: 0, z: 0 },
      basisY: { x: 0, y: 1, z: 0 },
      normal: { x: 0, y: 0, z: 1 }
    };
  }

  const reference = points.find((point) => magnitude3D(point) > 0) ?? { x: 1, y: 0, z: 0 };
  let normal = { x: 0, y: 0, z: 0 };

  for (let index = 1; index < points.length; index += 1) {
    const candidate = cross3D(reference, points[index]);
    if (magnitude3D(candidate) > 1e-6) {
      normal = candidate;
      break;
    }
  }

  if (magnitude3D(normal) <= 1e-6) {
    normal = cross3D(reference, { x: 0, y: 0, z: 1 });
    if (magnitude3D(normal) <= 1e-6) {
      normal = { x: 0, y: 1, z: 0 };
    }
  }

  const basisX = normalize3D(reference);
  const basisY = normalize3D(cross3D(normalize3D(normal), basisX));

  return {
    basisX,
    basisY,
    normal: normalize3D(normal)
  };
}

export function projectToPlane(point, basis, origin = { x: 0, y: 0, z: 0 }) {
  const relativePoint = subtract3D(point, origin);
  return {
    x: dot3D(relativePoint, basis.basisX),
    y: dot3D(relativePoint, basis.basisY)
  };
}

export function formatDistance(km) {
  return `${km.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} km`;
}

export function formatSpeed(speedKmPerSec) {
  if (Number.isFinite(speedKmPerSec)) {
    return `${speedKmPerSec.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} km/s`;
  }
  return "n/d";
}

export function formatMissionTime(milliseconds) {
  const totalMinutes = Math.max(0, Math.floor(milliseconds / 60000));
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;
  return `${days}d ${hours}h ${minutes}m`;
}
