import {
  EARTH_RADIUS_KM,
  MOON_ORBIT_RADIUS_KM,
  MOON_RADIUS_KM
} from "../core/constants.js";
import { interpolateScale } from "../core/math.js";

export class TrajectoryRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.samples = [];
    this.scaleBaseKm = MOON_ORBIT_RADIUS_KM;
  }

  setSamples(samples) {
    this.samples = samples;
    this.scaleBaseKm = Math.max(MOON_ORBIT_RADIUS_KM, interpolateScale(samples));
    this.resize();
  }

  resize() {
    const ratio = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.floor(rect.width * ratio);
    this.canvas.height = Math.floor(rect.height * ratio);
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  toCanvas(point, centerX, centerY, worldScale) {
    return {
      x: centerX + point.x * worldScale,
      y: centerY - point.y * worldScale
    };
  }

  draw(index) {
    const { ctx } = this;
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    const centerX = width / 2;
    const centerY = height / 2;
    const padding = 40;
    const worldScale = (Math.min(width, height) / 2 - padding) / this.scaleBaseKm;

    ctx.clearRect(0, 0, width, height);
    this.drawBackground(width, height, centerX, centerY, worldScale);

    if (!this.samples.length) {
      return;
    }

    this.drawTrajectory(centerX, centerY, worldScale, index);
    this.drawMoon(centerX, centerY, worldScale, index);
    this.drawEarth(centerX, centerY, worldScale);
    this.drawShip(centerX, centerY, worldScale, index);
  }

  drawBackground(width, height, centerX, centerY, worldScale) {
    const { ctx } = this;

    ctx.fillStyle = "#09111f";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(125, 211, 252, 0.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, MOON_ORBIT_RADIUS_KM * worldScale, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();
  }

  drawEarth(centerX, centerY, worldScale) {
    const { ctx } = this;
    ctx.fillStyle = "#4ade80";
    ctx.beginPath();
    ctx.arc(centerX, centerY, Math.max(6, EARTH_RADIUS_KM * worldScale), 0, Math.PI * 2);
    ctx.fill();
  }

  drawMoon(centerX, centerY, worldScale, index) {
    const { ctx } = this;
    const current = this.samples[index];
    const moon = this.toCanvas({ x: current.moonX, y: current.moonY }, centerX, centerY, worldScale);

    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.arc(moon.x, moon.y, Math.max(4, MOON_RADIUS_KM * worldScale), 0, Math.PI * 2);
    ctx.fill();
  }

  drawTrajectory(centerX, centerY, worldScale, index) {
    const { ctx } = this;
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(125, 211, 252, 0.28)";
    ctx.beginPath();

    this.samples.forEach((sample, sampleIndex) => {
      const point = this.toCanvas(sample, centerX, centerY, worldScale);
      if (sampleIndex === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });

    ctx.stroke();

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#7dd3fc";
    ctx.beginPath();

    this.samples.slice(0, index + 1).forEach((sample, sampleIndex) => {
      const point = this.toCanvas(sample, centerX, centerY, worldScale);
      if (sampleIndex === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });

    ctx.stroke();
  }

  drawShip(centerX, centerY, worldScale, index) {
    const { ctx } = this;
    const point = this.toCanvas(this.samples[index], centerX, centerY, worldScale);

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
