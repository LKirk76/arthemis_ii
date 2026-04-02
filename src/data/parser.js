function parseNumber(value, fieldName, lineNumber) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Valor invalido em ${fieldName} na linha ${lineNumber}.`);
  }
  return parsed;
}

function normalizeHeader(header) {
  return header.trim().toLowerCase();
}

export function parseStateVectorText(rawText) {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error("Arquivo sem dados suficientes.");
  }

  const headers = lines[0].split(",").map(normalizeHeader);
  const timestampIndex = headers.indexOf("timestamp");
  const xIndex = headers.indexOf("x");
  const yIndex = headers.indexOf("y");
  const zIndex = headers.indexOf("z");
  const vxIndex = headers.indexOf("vx");
  const vyIndex = headers.indexOf("vy");
  const vzIndex = headers.indexOf("vz");

  if ([timestampIndex, xIndex, yIndex, zIndex].some((index) => index === -1)) {
    throw new Error("Cabecalho obrigatorio: timestamp,x,y,z.");
  }

  const samples = lines.slice(1).map((line, lineOffset) => {
    const columns = line.split(",").map((column) => column.trim());
    const timestamp = new Date(columns[timestampIndex]);
    const lineNumber = lineOffset + 2;

    if (Number.isNaN(timestamp.getTime())) {
      throw new Error(`Timestamp invalido na linha ${lineNumber}.`);
    }

    const sample = {
      timestamp: timestamp.toISOString(),
      x: parseNumber(columns[xIndex], "x", lineNumber),
      y: parseNumber(columns[yIndex], "y", lineNumber),
      z: parseNumber(columns[zIndex], "z", lineNumber)
    };

    if (vxIndex !== -1 && vyIndex !== -1 && vzIndex !== -1) {
      sample.vx = parseNumber(columns[vxIndex], "vx", lineNumber);
      sample.vy = parseNumber(columns[vyIndex], "vy", lineNumber);
      sample.vz = parseNumber(columns[vzIndex], "vz", lineNumber);
    }

    return sample;
  });

  samples.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  return samples;
}

export function parseNasaOemText(rawText) {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const samples = [];

  lines.forEach((line, index) => {
    if (
      line.startsWith("CCSDS_") ||
      line.startsWith("COMMENT") ||
      line.startsWith("META_") ||
      line.includes("=")
    ) {
      return;
    }

    const columns = line.split(/\s+/);
    if (columns.length < 7) {
      return;
    }

    const lineNumber = index + 1;
    const timestamp = new Date(columns[0]);

    if (Number.isNaN(timestamp.getTime())) {
      return;
    }

    samples.push({
      timestamp: timestamp.toISOString(),
      x: parseNumber(columns[1], "x", lineNumber),
      y: parseNumber(columns[2], "y", lineNumber),
      z: parseNumber(columns[3], "z", lineNumber),
      vx: parseNumber(columns[4], "vx", lineNumber),
      vy: parseNumber(columns[5], "vy", lineNumber),
      vz: parseNumber(columns[6], "vz", lineNumber)
    });
  });

  if (!samples.length) {
    throw new Error("Arquivo OEM da NASA sem samples utilizaveis.");
  }

  samples.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  return samples;
}
