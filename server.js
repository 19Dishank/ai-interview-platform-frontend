/**
 * Custom Next.js Server with WebSocket Proxy
 *
 * This allows the frontend (port 5173) to proxy WebSocket connections
 * for /ws/interview to the backend (localhost:3000). This way a single
 * tunnel URL for port 5173 is enough — no separate port 3000 tunnel needed.
 */

import { createServer } from "http";
import { parse } from "url";
import next from "next";
import httpProxy from "http-proxy";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "5173", 10);

const BACKEND_WS_TARGET = process.env.BACKEND_URL || "http://localhost:3000";

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Create a dedicated proxy for WebSocket connections
const wsProxy = httpProxy.createProxyServer({
  target: BACKEND_WS_TARGET,
  ws: true,
  changeOrigin: true,
});

wsProxy.on("error", (err, req, res) => {
  console.error("[WS Proxy Error]", err.message);
  // res may be a socket on WS upgrades — only call end() if it's a response
  if (res && typeof res.end === "function" && !res.writableEnded) {
    try { res.end(); } catch {}
  }
});

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  // Intercept WebSocket upgrade requests for /ws/interview
  server.on("upgrade", (req, socket, head) => {
    const { pathname } = parse(req.url || "");
    const path = (pathname || "").replace(/\/$/, "");

    if (path === "/ws/interview" || path.endsWith("/ws/interview")) {
      console.log(`[WS Proxy] Proxying WebSocket upgrade: ${req.url} → ${BACKEND_WS_TARGET}`);
      wsProxy.ws(req, socket, head);
    }
    // Note: Do not destroy socket for other paths so Next.js HMR works properly
  });

  server.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> WebSocket proxy active: /ws/interview → ${BACKEND_WS_TARGET}/ws/interview`);
  });
});
