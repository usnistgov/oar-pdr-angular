import "zone.js";
import { ngExpressEngine } from "@nguniversal/express-engine";
import * as express from "express";
import { createServer } from "http"; // --- fix: use raw HTTP server so we can attach 'error' before listen ---
import { join } from "path";
import { AppServerModule } from "./src/main.server";
import { APP_BASE_HREF } from "@angular/common";
import { existsSync } from "fs";
import * as cluster from "cluster";
import * as os from "os";

// --- logging helpers ---
function ts(): string {
  return new Date().toISOString();
}
function logInfo(...args: any[]) {
  console.log(ts(), "INFO", ...args);
}
function logWarn(...args: any[]) {
  console.warn(ts(), "WARN", ...args);
}
function logError(...args: any[]) {
  console.error(ts(), "ERROR", ...args);
}
// --- end helpers ---

export function app(): express.Express {
  const server = express();
  const distFolder = join(process.cwd(), "dist/browser");
  const indexHtml = existsSync(join(distFolder, "index.original.html"))
    ? "index.original.html"
    : "index";
  server.engine(
    "html",
    ngExpressEngine({
      bootstrap: AppServerModule,
    })
  );
  server.set("view engine", "html");
  server.set("views", distFolder);
  server.get(
    "*.*",
    express.static(distFolder, {
      maxAge: "1y",
    })
  );
  server.get("*", (req, res) => {
    res.render(indexHtml, {
      req,
      providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }],
    });
  });
  return server;
}

function run(): void {
  const port = parseInt(process.env["PORT"] || "4000", 10);
  const host = process.env["HOST"] || "0.0.0.0"; // --- fix: bind explicitly to 0.0.0.0 to avoid 'null:<port>' in errors ---
  const expressApp = app();
  const httpServer = createServer(expressApp);
  // --- fix: attach error handler BEFORE listen to catch EADDRINUSE cleanly ---
  httpServer.on("error", (err: any) => {
    logError("HTTP server error:", err && err.stack ? err.stack : err);
    if (err && (err.code === "EADDRINUSE" || err.code === "EACCES")) {
      // exit the worker so the cluster master can decide what to do
      process.exit(1);
    }
  });
  httpServer.listen(port, host, () => {
    logInfo(
      `Node Express server listening on http://${host}:${port} (pid=${process.pid})`
    );
  });
  // --- keep: hard exits on fatal async errors ---
  process.on("uncaughtException", (err) => {
    logError("uncaughtException:", err && err.stack ? err.stack : err);
    setTimeout(() => process.exit(1), 100);
  });
  process.on("unhandledRejection", (reason) => {
    logError("unhandledRejection:", reason);
    setTimeout(() => process.exit(1), 100);
  });
}

// ---- Cluster logic ----
const isPrimary =
  (cluster as any).isPrimary !== undefined
    ? (cluster as any).isPrimary
    : (cluster as any).isMaster;
const isWorker =
  (cluster as any).isWorker !== undefined
    ? (cluster as any).isWorker
    : !isPrimary;
const cpus = Math.max(
  1,
  parseInt(process.env["WEB_CONCURRENCY"] || String(os.cpus().length), 10)
);
const useCluster = cpus > 1 && !process.env["DISABLE_CLUSTER"]; // --- fix: allow disabling cluster via env and avoid useless multiworkers ---
logInfo("process started", {
  pid: process.pid,
  isPrimary,
  isWorker,
});

if (isPrimary && useCluster) {
  logInfo(`Primary ${process.pid} is starting ${cpus} worker(s)`);
  for (let i = 0; i < cpus; i++) {
    cluster.fork();
  }
  // --- fix: throttle restarts to avoid infinite crash loops when port is taken ---
  let restartCount = 0;
  let windowStart = Date.now();
  const windowMs = 10_000;
  const maxRestarts = 5;
  cluster.on("exit", (worker, code, signal) => {
    logWarn(
      `Worker ${worker.process.pid} died (code=${code}, signal=${signal}), forking a new one`
    );
    const now = Date.now();
    if (now - windowStart > windowMs) {
      windowStart = now;
      restartCount = 0;
    }
    restartCount++;
    if (restartCount > maxRestarts) {
      logError(
        `Too many worker restarts within ${windowMs}ms. Exiting master to surface the fault.`
      );
      process.exit(1);
    }
    setTimeout(() => cluster.fork(), 200);
  });
  cluster.on("online", (worker) => {
    logInfo(`Worker ${worker.process.pid} is online`);
  });
} else if (isWorker || !useCluster) {
  run();
}

export * from "./src/main.server";
