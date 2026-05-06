const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 5501);
const ROOT = __dirname;
const NASA_API_BASE = "https://api.nasa.gov";
const NASA_IMAGES_BASE = "https://images-api.nasa.gov";
const JPL_SSD_BASE = "https://ssd-api.jpl.nasa.gov";
const EONET_BASE = "https://eonet.gsfc.nasa.gov";

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url, `http://${req.headers.host}`);

    if (requestUrl.pathname === "/health" || requestUrl.pathname === "/api/health") {
      sendJson(res, 200, {
        ok: true,
        service: "nasa-api-explorer",
        hasNasaApiKey: Boolean(process.env.NASA_API_KEY || readLocalApiKey()),
      });
      return;
    }

    if (requestUrl.pathname.startsWith("/api/nasa/")) {
      await proxyNasaApi(requestUrl, res);
      return;
    }

    if (requestUrl.pathname.startsWith("/api/images/")) {
      await proxyImagesApi(requestUrl, res);
      return;
    }

    if (requestUrl.pathname.startsWith("/api/jpl/")) {
      await proxyJplApi(requestUrl, res);
      return;
    }

    if (requestUrl.pathname.startsWith("/api/eonet/")) {
      await proxyEonetApi(requestUrl, res);
      return;
    }

    if (requestUrl.pathname === "/api/texture") {
      await proxyTexture(requestUrl, res);
      return;
    }

    serveStatic(requestUrl, res);
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`NASA explorer running at http://127.0.0.1:${PORT}/index.html`);
});

async function proxyNasaApi(requestUrl, res) {
  const targetPath = requestUrl.pathname.replace("/api/nasa", "");
  const targetUrl = new URL(targetPath, NASA_API_BASE);
  requestUrl.searchParams.forEach((value, key) => targetUrl.searchParams.set(key, value));

  if (!targetUrl.searchParams.get("api_key")) {
    targetUrl.searchParams.set("api_key", getLocalApiKey());
  }

  await proxyFetch(targetUrl, res);
}

async function proxyImagesApi(requestUrl, res) {
  const targetPath = requestUrl.pathname.replace("/api/images", "");
  const targetUrl = new URL(targetPath, NASA_IMAGES_BASE);
  requestUrl.searchParams.forEach((value, key) => targetUrl.searchParams.set(key, value));
  await proxyFetch(targetUrl, res);
}

async function proxyJplApi(requestUrl, res) {
  const targetPath = requestUrl.pathname.replace("/api/jpl", "");
  const targetUrl = new URL(targetPath, JPL_SSD_BASE);
  requestUrl.searchParams.forEach((value, key) => targetUrl.searchParams.set(key, value));
  await proxyFetch(targetUrl, res);
}

async function proxyEonetApi(requestUrl, res) {
  const targetPath = requestUrl.pathname.replace("/api/eonet", "");
  const targetUrl = new URL(targetPath, EONET_BASE);
  requestUrl.searchParams.forEach((value, key) => targetUrl.searchParams.set(key, value));
  await proxyFetch(targetUrl, res);
}

async function proxyFetch(targetUrl, res) {
  const response = await fetch(targetUrl);
  const body = Buffer.from(await response.arrayBuffer());

  res.writeHead(response.status, {
    "Content-Type": response.headers.get("content-type") || "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(body);
}

async function proxyTexture(requestUrl, res) {
  const rawUrl = requestUrl.searchParams.get("url");

  if (!rawUrl) {
    sendJson(res, 400, { error: "Missing texture url" });
    return;
  }

  const targetUrl = new URL(rawUrl);
  const allowedHosts = new Set(["www.solarsystemscope.com", "solarsystemscope.com"]);

  if (!allowedHosts.has(targetUrl.hostname)) {
    sendJson(res, 403, { error: "Texture host not allowed" });
    return;
  }

  await proxyFetch(targetUrl, res);
}

function serveStatic(requestUrl, res) {
  const requestedPath = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
  const safePath = path.normalize(decodeURIComponent(requestedPath)).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(ROOT, safePath);

  if (!filePath.startsWith(ROOT)) {
    sendJson(res, 403, { error: "Forbidden" });
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      sendJson(res, 404, { error: "Not found" });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": contentTypes[ext] || "application/octet-stream" });
    res.end(content);
  });
}

function getLocalApiKey() {
  if (process.env.NASA_API_KEY) {
    return process.env.NASA_API_KEY;
  }

  return readLocalApiKey() || "DEMO_KEY";
}

function readLocalApiKey() {
  const configPath = path.join(ROOT, "config.local.js");

  try {
    const config = fs.readFileSync(configPath, "utf8");
    const match = config.match(/NASA_API_KEY\s*=\s*["']([^"']+)["']/);
    return match?.[1] || "";
  } catch {
    return "";
  }
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}
