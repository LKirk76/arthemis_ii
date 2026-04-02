import { EARTH_RADIUS_KM, MOON_ORBIT_RADIUS_KM, MOON_RADIUS_KM } from "../core/constants.js";
import { computeOrbitalPlaneBasis, interpolateScale, projectToPlane } from "../core/math.js";

export class TrajectoryRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.samples = [];
    this.projectedSamples = [];
    this.scaleBaseKm = MOON_ORBIT_RADIUS_KM;
    this.orbitalPlane = computeOrbitalPlaneBasis([]);
  }

  setSamples(samples) {
    this.samples = samples;
    this.orbitalPlane = computeOrbitalPlaneBasis(samples);
    this.projectedSamples = samples.map((sample) => ({
      ...sample,
      projected: projectToPlane(sample, this.orbitalPlane),
      moonProjected: projectToPlane(
        { x: sample.moonX, y: sample.moonY, z: sample.moonZ ?? 0 },
        this.orbitalPlane
      )
    }));
    this.scaleBaseKm = Math.max(
      MOON_ORBIT_RADIUS_KM,
      interpolateScale(
        this.projectedSamples.flatMap((sample) => [sample.projected, sample.moonProjected])
      )
    );
    this.resize();
  }

  resize() {
    const ratio = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.floor(rect.width * ratio);
    this.canvas.height = Math.floor(rect.height * ratio);
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  toCanvas(point, centerX, centerY, worldScale, focusPoint) {
    return {
      x: centerX + (point.x - focusPoint.x) * worldScale,
      y: centerY - (point.y - focusPoint.y) * worldScale
    };
  }

  resolveFocusPoint(index, centerMode) {
    const current = this.projectedSamples[index];
    if (!current) {
      return { x: 0, y: 0 };
    }

    if (centerMode === "moon") {
      return current.moonProjected;
    }

    if (centerMode === "capsule") {
      return current.projected;
    }

    return { x: 0, y: 0 };
  }

  draw(index, options = {}) {
    const { ctx } = this;
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    const centerX = width / 2;
    const centerY = height / 2;
    const padding = 40;
    const zoom = options.zoom ?? 1;
    const worldScale = ((Math.min(width, height) / 2 - padding) / this.scaleBaseKm) * zoom;
    const focusPoint = this.resolveFocusPoint(index, options.centerMode ?? "earth");

    ctx.clearRect(0, 0, width, height);
    this.drawBackground(width, height, centerX, centerY, worldScale, focusPoint);

    if (!this.projectedSamples.length) {
      return;
    }

    this.drawGrid(width, height, centerX, centerY);
    this.drawTrajectory(centerX, centerY, worldScale, index, focusPoint);
    this.drawMoon(centerX, centerY, worldScale, index, focusPoint);
    this.drawEarth(centerX, centerY, worldScale, focusPoint);
    this.drawShip(centerX, centerY, worldScale, index, focusPoint);
  }

  drawBackground(width, height, centerX, centerY, worldScale, focusPoint) {
    const { ctx } = this;
    const earth = this.toCanvas({ x: 0, y: 0 }, centerX, centerY, worldScale, focusPoint);

    ctx.fillStyle = "#09111f";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(125, 211, 252, 0.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(earth.x, earth.y, MOON_ORBIT_RADIUS_KM * worldScale, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();
  }

  drawGrid(width, height, centerX, centerY) {
    const { ctx } = this;
    const spacing = 72;

    ctx.strokeStyle = "rgba(125, 211, 252, 0.08)";
    ctx.lineWidth = 1;

    for (let x = centerX % spacing; x <= width; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = centerY % spacing; y <= height; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  drawEarth(centerX, centerY, worldScale, focusPoint) {
    const { ctx } = this;
    const earth = this.toCanvas({ x: 0, y: 0 }, centerX, centerY, worldScale, focusPoint);

    ctx.fillStyle = "#4ade80";
    ctx.beginPath();
    ctx.arc(earth.x, earth.y, Math.max(6, EARTH_RADIUS_KM * worldScale), 0, Math.PI * 2);
    ctx.fill();
  }

  drawMoon(centerX, centerY, worldScale, index, focusPoint) {
    const { ctx } = this;
    const current = this.projectedSamples[index];
    const moon = this.toCanvas(
      current.moonProjected,
      centerX,
      centerY,
      worldScale,
      focusPoint
    );

    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.arc(moon.x, moon.y, Math.max(4, MOON_RADIUS_KM * worldScale), 0, Math.PI * 2);
    ctx.fill();
  }

  drawTrajectory(centerX, centerY, worldScale, index, focusPoint) {
    const { ctx } = this;

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(125, 211, 252, 0.22)";
    ctx.beginPath();

    this.projectedSamples.forEach((sample, sampleIndex) => {
      const point = this.toCanvas(sample.projected, centerX, centerY, worldScale, focusPoint);
      if (sampleIndex === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });

    ctx.stroke();

    ctx.lineWidth = 2.75;
    ctx.strokeStyle = "#7dd3fc";
    ctx.beginPath();

    this.projectedSamples.slice(0, index + 1).forEach((sample, sampleIndex) => {
      const point = this.toCanvas(sample.projected, centerX, centerY, worldScale, focusPoint);
      if (sampleIndex === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });

    ctx.stroke();
  }

  drawShip(centerX, centerY, worldScale, index, focusPoint) {
    const { ctx } = this;
    const point = this.toCanvas(
      this.projectedSamples[index].projected,
      centerX,
      centerY,
      worldScale,
      focusPoint
    );

    ctx.fillStyle = "#fb7185";
    ctx.beginPath();
    ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(251, 113, 133, 0.35)";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 10, 0, Math.PI * 2);
    ctx.stroke();
  }
}
