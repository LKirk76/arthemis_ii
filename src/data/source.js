import {
  MOON_ORBITAL_PERIOD_DAYS,
  MOON_ORBIT_RADIUS_KM
} from "../core/constants.js";
import { parseNasaOemText, parseStateVectorText } from "./parser.js";

export const DEFAULT_DATA_PATH = "/data/mock-state-vectors.csv";
export const NASA_DATA_PATH = "/api/nasa/oem";

function enrichSamples(samples) {
  if (samples.length === 0) {
    return [];
  }

  const missionStart = new Date(samples[0].timestamp).getTime();

  return samples.map((sample) => {
    const elapsedMs = new Date(sample.timestamp).getTime() - missionStart;
    const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);
    const moonAngle = (elapsedDays / MOON_ORBITAL_PERIOD_DAYS) * Math.PI * 2;

    return {
      ...sample,
      moonX: Math.cos(moonAngle) * MOON_ORBIT_RADIUS_KM,
      moonY: Math.sin(moonAngle) * MOON_ORBIT_RADIUS_KM
    };
  });
}

export async function loadDefaultDataset() {
  const response = await fetch(DEFAULT_DATA_PATH);
  if (!response.ok) {
    throw new Error("Falha ao carregar o dataset mock.");
  }

  const rawText = await response.text();
  return enrichSamples(parseStateVectorText(rawText));
}

export async function loadDatasetFromFile(file) {
  const rawText = await file.text();
  const parser = rawText.includes("CCSDS_OEM_VERS") ? parseNasaOemText : parseStateVectorText;
  return enrichSamples(parser(rawText));
}

export async function loadOfficialNasaDataset() {
  const response = await fetch(NASA_DATA_PATH, { cache: "no-store" });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || "Falha ao carregar dados oficiais da NASA.");
  }

  return {
    samples: enrichSamples(parseNasaOemText(payload.rawText)),
    sourceUrl: payload.sourceUrl
  };
}
