import "zone.js";

import { ngExpressEngine } from "@nguniversal/express-engine";
import * as express from "express";
import { join } from "path";

import { AppServerModule } from "./src/main.server";
import { APP_BASE_HREF } from "@angular/common";
import { existsSync } from "fs";

import * as cluster from "cluster";
import * as os from "os";

// --- added: simple timestamped logging helpers ---
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
// --- end added logging helpers ---

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
  const port = process.env["PORT"] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    logInfo(`Node Express server listening on http://localhost:${port} (pid=${process.pid})`);
  });
}

// Replace the single-process startup with a cluster-based startup
if (cluster.isMaster) {
  const cpus = parseInt(
    process.env["WEB_CONCURRENCY"] || String(os.cpus().length),
    10
  );
  logInfo(`Master ${process.pid} is starting ${cpus} workers`);
  for (let i = 0; i < cpus; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    logWarn(
      `Worker ${worker.process.pid} died (code=${code}, signal=${signal}), forking a new one`
    );
    cluster.fork();
  });
} else {
  // Worker processes run the server
  run();
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = (mainModule && mainModule.filename) || "";

const isMainModule =
  moduleFilename === __filename || moduleFilename.includes("iisnode");
// cluster.isPrimary is available in newer Node versions; fall back to isMaster if needed
const isClusterMaster =
  (cluster as any).isPrimary !== undefined
    ? (cluster as any).isPrimary
    : (cluster as any).isMaster;

// --- added: immediate startup role log to aid debugging ---
logInfo("process started", { pid: process.pid, isMainModule, isClusterMaster });
// --- end added startup log ---

// Only start the server here if this invocation is the main module AND this process
// is not the cluster master (workers already call run() in the cluster branch above).
if (isMainModule && !isClusterMaster) {
  run();
}

export * from "./src/main.server";
