import "zone.js";
import { ngExpressEngine } from "@nguniversal/express-engine";
import * as express from "express";
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
  const server = app();

  server.on("error", (err: any) => {
    logError("Server 'error' event:", err && err.stack ? err.stack : err);
  });

  let httpServer;
  try {
    httpServer = server.listen(port, () => {
      logInfo(`Node Express server listening on http://0.0.0.0:${port} (pid=${process.pid})`);
    });
  } catch (err: any) {
    logError("listen() threw:", err && err.stack ? err.stack : err);
    if (err && (err.code === "EADDRINUSE" || err.code === "EACCES")) {
      process.exit(1);
    }
    throw err;
  }

  if (httpServer) {
    httpServer.on("error", (err: any) => {
      logError("HTTP server error:", err && err.stack ? err.stack : err);
      if (err && (err.code === "EADDRINUSE" || err.code === "EACCES")) {
        process.exit(1);
      }
    });
  }
}

// ---- Cluster logic ----
const isPrimary = (cluster as any).isPrimary !== undefined
  ? (cluster as any).isPrimary
  : (cluster as any).isMaster;

const isWorker = (cluster as any).isWorker !== undefined
  ? (cluster as any).isWorker
  : !isPrimary;

const cpus = Math.max(1, parseInt(process.env["WEB_CONCURRENCY"] || String(os.cpus().length), 10));

logInfo("process started", {
  pid: process.pid,
  isPrimary,
  isWorker,
});

if (isPrimary) {
  logInfo(`Primary ${process.pid} is starting ${cpus} worker(s)`);
  for (let i = 0; i < cpus; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    logWarn(`Worker ${worker.process.pid} died (code=${code}, signal=${signal}), forking a new one`);
    setTimeout(() => cluster.fork(), 100);
  });

  cluster.on("online", (worker) => {
    logInfo(`Worker ${worker.process.pid} is online`);
  });
} else if (isWorker) {
  run();

  process.on("uncaughtException", (err) => {
    logError("uncaughtException:", err && err.stack ? err.stack : err);
    setTimeout(() => process.exit(1), 100);
  });
  process.on("unhandledRejection", (reason) => {
    logError("unhandledRejection:", reason);
    setTimeout(() => process.exit(1), 100);
  });
}

export * from "./src/main.server";