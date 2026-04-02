export function distance3D(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function magnitude3D(vector) {
  return Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
}

export function interpolateScale(points) {
  let maxAbs = 1;
  for (const point of points) {
    maxAbs = Math.max(maxAbs, Math.abs(point.x), Math.abs(point.y));
  }
  return maxAbs;
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
