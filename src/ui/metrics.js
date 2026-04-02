import { distance3D, formatDistance, formatMissionTime, formatSpeed, magnitude3D } from "../core/math.js";

export function buildMetrics(samples, index) {
  const current = samples[index];
  const start = new Date(samples[0].timestamp).getTime();
  const now = new Date(current.timestamp).getTime();

  const earthDistance = magnitude3D(current);
  const moonDistance = distance3D(current, {
    x: current.moonX,
    y: current.moonY,
    z: 0
  });
  const speed = current.vx !== undefined
    ? magnitude3D({ x: current.vx, y: current.vy, z: current.vz })
    : NaN;

  return {
    timestamp: new Date(current.timestamp).toLocaleString("pt-BR", { timeZone: "UTC" }) + " UTC",
    indexLabel: `${index + 1} / ${samples.length}`,
    missionTime: formatMissionTime(now - start),
    earthDistance: formatDistance(earthDistance),
    moonDistance: formatDistance(moonDistance),
    speed: formatSpeed(speed)
  };
}
