const http = require("http");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "0.0.0.0";
const ROOT = __dirname;
const NASA_TRACKING_PAGE =
  "https://www.nasa.gov/missions/artemis/artemis-2/track-nasas-artemis-ii-mission-in-real-time/";
const NASA_ZIP_REGEX =
  /https:\/\/www\.nasa\.gov\/wp-content\/uploads\/[^"' ]*artemis-ii[^"' ]*\.zip(?:\?[^"' ]*)?/i;
const NASA_CACHE_TTL_MS = 5 * 60 * 1000;

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json; charset=utf-8"
};

let nasaCache = null;

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

function sendFile(filePath, res) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath);
    const shouldDisableCache =
      ext === ".html" || ext === ".js" || ext === ".webmanifest" || path.basename(filePath) === "sw.js";

    res.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
      "Cache-Control": shouldDisableCache ? "no-store" : "public, max-age=3600"
    });
    res.end(data);
  });
}

function extractSingleFileFromZip(buffer) {
  const localHeaderSignature = 0x04034b50;
  const centralHeaderSignature = 0x02014b50;
  const endOfCentralDirectorySignature = 0x06054b50;
  const endOffset = buffer.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));

  if (endOffset === -1) {
    throw new Error("Fim do diretorio central do ZIP nao encontrado.");
  }

  const endSignature = buffer.readUInt32LE(endOffset);
  if (endSignature !== endOfCentralDirectorySignature) {
    throw new Error("Diretorio central do ZIP invalido.");
  }

  const centralDirectoryOffset = buffer.readUInt32LE(endOffset + 16);
  const centralSignature = buffer.readUInt32LE(centralDirectoryOffset);

  if (centralSignature !== centralHeaderSignature) {
    throw new Error("Header central do ZIP invalido.");
  }

  const compressionMethod = buffer.readUInt16LE(centralDirectoryOffset + 10);
  const compressedSize = buffer.readUInt32LE(centralDirectoryOffset + 20);
  const localHeaderOffset = buffer.readUInt32LE(centralDirectoryOffset + 42);
  const localSignature = buffer.readUInt32LE(localHeaderOffset);

  if (localSignature !== localHeaderSignature) {
    throw new Error("ZIP NASA invalido.");
  }

  const localFileNameLength = buffer.readUInt16LE(localHeaderOffset + 26);
  const localExtraFieldLength = buffer.readUInt16LE(localHeaderOffset + 28);
  const dataStart = localHeaderOffset + 30 + localFileNameLength + localExtraFieldLength;
  const dataEnd = dataStart + compressedSize;
  const compressedData = buffer.subarray(dataStart, dataEnd);

  if (compressionMethod === 0) {
    return compressedData.toString("utf8");
  }

  if (compressionMethod === 8) {
    return zlib.inflateRawSync(compressedData).toString("utf8");
  }

  throw new Error(`Metodo de compressao ZIP nao suportado: ${compressionMethod}.`);
}

async function fetchLatestNasaOemText() {
  if (nasaCache && Date.now() - nasaCache.timestamp < NASA_CACHE_TTL_MS) {
    return nasaCache;
  }

  const pageResponse = await fetch(NASA_TRACKING_PAGE);
  if (!pageResponse.ok) {
    throw new Error(`Falha ao carregar a pagina oficial da NASA (${pageResponse.status}).`);
  }

  const pageHtml = await pageResponse.text();
  const zipUrlMatch = pageHtml.match(NASA_ZIP_REGEX);

  if (!zipUrlMatch) {
    throw new Error("Nao encontrei o link oficial da ephemeris da Artemis II na pagina da NASA.");
  }

  const zipUrl = zipUrlMatch[0];
  const zipResponse = await fetch(zipUrl);

  if (!zipResponse.ok) {
    throw new Error(`Falha ao baixar a ephemeris oficial da NASA (${zipResponse.status}).`);
  }

  const zipBuffer = Buffer.from(await zipResponse.arrayBuffer());
  const rawText = extractSingleFileFromZip(zipBuffer);

  nasaCache = {
    rawText,
    sourceUrl: zipUrl,
    timestamp: Date.now()
  };

  return nasaCache;
}

const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, `http://${req.headers.host || "localhost"}`).pathname;

  if (pathname === "/api/nasa/oem") {
    fetchLatestNasaOemText()
      .then((payload) => sendJson(res, 200, payload))
      .catch((error) => {
        sendJson(res, 502, {
          error: error.message
        });
      });
    return;
  }

  const url = pathname === "/" ? "/index.html" : pathname;
  const safePath = path.normalize(decodeURIComponent(url)).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(ROOT, safePath);

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  sendFile(filePath, res);
});

server.listen(PORT, HOST, () => {
  console.log(`Artemis II viewer available at http://${HOST}:${PORT}`);
});
