import { APP_VERSION, PLAYBACK_INTERVAL_MS } from "./core/constants.js";
import {
  loadDatasetFromFile,
  loadDefaultDataset,
  loadOfficialNasaDataset
} from "./data/source.js";
import { buildMetrics } from "./ui/metrics.js";
import { TrajectoryRenderer } from "./ui/renderer.js";

const canvas = document.querySelector("#trajectory-canvas");
const playButton = document.querySelector("#play-button");
const timeSlider = document.querySelector("#time-slider");
const fileInput = document.querySelector("#file-input");
const resetDataButton = document.querySelector("#reset-data-button");
const nasaDataButton = document.querySelector("#nasa-data-button");
const dataSourceLabel = document.querySelector("#data-source-label");

const metricElements = {
  timestamp: document.querySelector("#current-timestamp"),
  indexLabel: document.querySelector("#current-index"),
  missionTime: document.querySelector("#mission-time"),
  earthDistance: document.querySelector("#distance-earth"),
  moonDistance: document.querySelector("#distance-moon"),
  speed: document.querySelector("#speed")
};

const renderer = new TrajectoryRenderer(canvas);

const state = {
  currentIndex: 0,
  isPlaying: false,
  playbackTimer: null,
  samples: []
};

function findCurrentIndex(samples) {
  const now = Date.now();
  let bestIndex = 0;
  let bestDelta = Number.POSITIVE_INFINITY;

  samples.forEach((sample, index) => {
    const delta = Math.abs(new Date(sample.timestamp).getTime() - now);
    if (delta < bestDelta) {
      bestDelta = delta;
      bestIndex = index;
    }
  });

  return bestIndex;
}

function syncMetricPanel() {
  const metrics = buildMetrics(state.samples, state.currentIndex);
  metricElements.timestamp.textContent = metrics.timestamp;
  metricElements.indexLabel.textContent = metrics.indexLabel;
  metricElements.missionTime.textContent = metrics.missionTime;
  metricElements.earthDistance.textContent = metrics.earthDistance;
  metricElements.moonDistance.textContent = metrics.moonDistance;
  metricElements.speed.textContent = metrics.speed;
}

function render() {
  renderer.draw(state.currentIndex);
  syncMetricPanel();
  timeSlider.value = String(state.currentIndex);
}

function stopPlayback() {
  state.isPlaying = false;
  playButton.textContent = "Play";
  if (state.playbackTimer) {
    clearInterval(state.playbackTimer);
    state.playbackTimer = null;
  }
}

function startPlayback() {
  stopPlayback();
  state.isPlaying = true;
  playButton.textContent = "Pause";
  state.playbackTimer = window.setInterval(() => {
    if (state.currentIndex >= state.samples.length - 1) {
      stopPlayback();
      return;
    }
    state.currentIndex += 1;
    render();
  }, PLAYBACK_INTERVAL_MS);
}

function updateDataset(samples, label, initialIndex = 0) {
  state.samples = samples;
  state.currentIndex = initialIndex;
  timeSlider.min = "0";
  timeSlider.max = String(Math.max(0, samples.length - 1));
  timeSlider.value = String(initialIndex);
  dataSourceLabel.textContent = label;
  renderer.setSamples(samples);
  render();
}

async function loadNasaData() {
  const { samples, sourceUrl } = await loadOfficialNasaDataset();
  updateDataset(
    samples,
    `Fonte atual: NASA oficial (${sourceUrl}).`,
    findCurrentIndex(samples)
  );
}

async function bootstrap() {
  document.title = `Artemis II Tracker ${APP_VERSION}`;

  try {
    await loadNasaData();
  } catch (error) {
    console.warn(error);
    const samples = await loadDefaultDataset();
    updateDataset(samples, "Fonte atual: mock local (`data/mock-state-vectors.csv`).");
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).catch(() => {});
  }
}

playButton.addEventListener("click", () => {
  if (state.isPlaying) {
    stopPlayback();
    return;
  }

  startPlayback();
});

timeSlider.addEventListener("input", (event) => {
  stopPlayback();
  state.currentIndex = Number(event.target.value);
  render();
});

fileInput.addEventListener("change", async (event) => {
  const [file] = event.target.files;
  if (!file) {
    return;
  }

  stopPlayback();

  try {
    const samples = await loadDatasetFromFile(file);
    updateDataset(samples, `Fonte atual: ${file.name}.`);
  } catch (error) {
    alert(error.message);
  }
});

resetDataButton.addEventListener("click", async () => {
  stopPlayback();
  const samples = await loadDefaultDataset();
  updateDataset(samples, "Fonte atual: mock local (`data/mock-state-vectors.csv`).");
});

nasaDataButton.addEventListener("click", async () => {
  stopPlayback();
  try {
    await loadNasaData();
  } catch (error) {
    alert(error.message);
  }
});

window.addEventListener("resize", () => {
  renderer.resize();
  render();
});

bootstrap().catch((error) => {
  console.error(error);
  alert("Nao foi possivel inicializar a aplicacao.");
});
