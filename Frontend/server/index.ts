import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  log("Starting server initialization...");
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    log("Setting up Vite middleware...");
    await setupVite(app, server);
    log("Vite middleware setup complete");
  } else {
    serveStatic(app);
  }

  // Try ports starting from 5000 until we find an available one
  const startPort = 5000;
  let currentPort = startPort;
  const maxAttempts = 10;

  const tryListen = (port: number): Promise<number> => {
    return new Promise((resolve, reject) => {
      log(`Attempting to start server on port ${port}...`);
      server.listen(port, "0.0.0.0")
        .once('listening', () => {
          log(`Server successfully started on port ${port}`);
          resolve(port);
        })
        .once('error', (err: any) => {
          if (err.code === 'EADDRINUSE') {
            log(`Port ${port} is in use, trying next port...`);
            reject(err);
          } else {
            log(`Error starting server: ${err.message}`);
            reject(err);
          }
        });
    });
  };

  let port = startPort;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      port = await tryListen(currentPort);
      break;
    } catch (err: any) {
      if (err.code === 'EADDRINUSE') {
        currentPort++;
        server.close();
      } else {
        throw err;
      }
    }
  }

  if (port !== startPort) {
    log(`Note: Using port ${port} instead of default port ${startPort}`);
  }
})();