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

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const distFolder = join(process.cwd(), "dist/browser");
  const indexHtml = existsSync(join(distFolder, "index.original.html"))
    ? "index.original.html"
    : "index";

  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
  server.engine(
    "html",
    ngExpressEngine({
      bootstrap: AppServerModule,
    })
  );

  server.set("view engine", "html");
  server.set("views", distFolder);

  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });

  // Serve static files from /browser
  server.get(
    "*.*",
    express.static(distFolder, {
      maxAge: "1y",
    })
  );

  // All regular routes use the Universal engine
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

  // Start up the Node server
  const server = app();

  // attach error handler to the server to avoid unhandled 'error' events
  server.on("error", (err: any) => {
    logError("Server 'error' event:", err && err.stack ? err.stack : err);
  });

  // listen and log; catch errors synchronously to avoid unhandled 'error' throws
  let httpServer;
  try {
    httpServer = server.listen(port, () => {
      logInfo(`Node Express server listening on http://0.0.0.0:${port} (pid=${process.pid})`);
    });
  } catch (err: any) {
    // listen can throw synchronously in some cluster setups
    logError("listen() threw:", err && err.stack ? err.stack : err);
    if (err && (err.code === "EADDRINUSE" || err.code === "EACCES")) {
      // Exit so the supervisor / master can handle restarting/forking logic
      process.exit(1);
    }
    throw err;
  }

  // also handle async errors on the http server object
  if (httpServer) {
    httpServer.on("error", (err: any) => {
      logError("HTTP server error:", err && err.stack ? err.stack : err);
      if (err && (err.code === "EADDRINUSE" || err.code === "EACCES")) {
        // Exit on bind errors to avoid silent failure and respawn cleanly
        process.exit(1);
      }
    });
  }
}

// ---- Startup/cluster logic ----
// Gate startup on being the main module (prevents double-start when required)
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = (mainModule && mainModule.filename) || "";
const isMainModule = moduleFilename === __filename || moduleFilename.includes("iisnode");

// Immediate startup log to clarify role
logInfo("process started", {
  pid: process.pid,
  isMainModule,
  isPrimary: (cluster as any).isPrimary ?? (cluster as any).isMaster,
  isWorker: (cluster as any).isWorker ?? false,
});

// If this is not the main module, don't start the server/cluster here
if (!isMainModule) {
  // Export only; caller will manage server lifecycle
  export * from "./src/main.server";
  // stop further startup actions
  // (Note: the above export is for bundlers; nothing else to do here)
} else {
  // This is the main module: set up cluster or run directly
  const isPrimary = (cluster as any).isPrimary !== undefined
    ? (cluster as any).isPrimary
    : (cluster as any).isMaster;

  const cpus = Math.max(1, parseInt(process.env["WEB_CONCURRENCY"] || String(os.cpus().length), 10));

  if (isPrimary) {
    // Primary / master process: fork workers
    logInfo(`Primary ${process.pid} is starting ${cpus} worker(s)`);
    for (let i = 0; i < cpus; i++) {
      cluster.fork();
    }

    cluster.on("exit", (worker, code, signal) => {
      logWarn(`Worker ${worker.process.pid} died (code=${code}, signal=${signal}), forking a new one`);
      // small backoff to avoid tight fork loop
      setTimeout(() => cluster.fork(), 100);
    });

    // optional: listen for worker messages for health reporting
    cluster.on("online", (worker) => {
      logInfo(`Worker ${worker.process.pid} is online`);
    });
  } else {
    // This is a worker process: start the HTTP server
    run();
  }

  // graceful logging for uncaught errors in both primary/workers
  process.on("uncaughtException", (err) => {
    logError("uncaughtException:", err && err.stack ? err.stack : err);
    // exit to let master/supervisor restart this process
    setTimeout(() => process.exit(1), 100);
  });
  process.on("unhandledRejection", (reason) => {
    logError("unhandledRejection:", reason);
    setTimeout(() => process.exit(1), 100);
  });

  // export for bundlers/other importers
  export * from "./src/main.server";
}