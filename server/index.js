import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { initializeWebSocket } from "./config/websocket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Support loading environment variables from root (.env / .env.local) or server folder
dotenv.config({ path: path.resolve(__dirname, "..", ".env.local") });
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });
dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper to recursively scan app/api and register routes in Express
async function registerRoutes(dir, routePrefix = "/api") {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      await registerRoutes(fullPath, `${routePrefix}/${item}`);
    } else if (item === "route.js") {
      // Create a file:// URL to dynamically import ESM route files in Windows/Linux
      const fileUrl = `file://${path.resolve(fullPath).replace(/\\/g, "/")}`;
      const handler = await import(fileUrl);

      // Translate Next.js dynamic routing folder names to Express parameter colons
      // Example: /api/users/[id]/profile -> /api/users/:id/profile
      const expressRoute = routePrefix.replace(/\[([^\]]+)\]/g, ":$1");

      console.log(`Mounting route: ${expressRoute}`);

      const httpMethods = [
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "PATCH",
        "HEAD",
        "OPTIONS",
      ];
      for (const method of httpMethods) {
        if (handler[method]) {
          app[method.toLowerCase()](expressRoute, async (req, res) => {
            try {
              const requestUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

              // Convert Express headers to standard Web Headers
              const headers = new Headers();
              Object.entries(req.headers).forEach(([k, v]) => {
                if (v)
                  headers.set(k, Array.isArray(v) ? v.join(", ") : String(v));
              });

              // Build standard Request object expected by Next.js handlers
              const nextRequest = new Request(requestUrl, {
                method: req.method,
                headers: headers,
                body: ["GET", "HEAD"].includes(req.method)
                  ? undefined
                  : JSON.stringify(req.body),
              });

              // Next.js route handlers expect parameters in the second argument: (request, { params })
              const nextParams = { ...req.params };

              // Invoke the handler function
              const response = await handler[method](nextRequest, {
                params: nextParams,
              });

              const status = response.status || 200;

              // Forward response headers back to Express response
              response.headers.forEach((value, key) => {
                res.setHeader(key, value);
              });

              // Handle response data
              if (response.jsonData) {
                res.status(status).json(response.jsonData);
              } else {
                const text = await response.text();
                try {
                  res.status(status).json(JSON.parse(text));
                } catch {
                  res.status(status).send(text);
                }
              }
            } catch (err) {
              console.error(
                `Error in route ${req.method} ${expressRoute}:`,
                err,
              );
              res.status(500).json({ error: "Internal server error" });
            }
          });
        }
      }
    }
  }
}

async function startServer() {
  try {
    console.log("Loading API routes...");
    await registerRoutes(path.join(__dirname, "api"));

    app.get("/api/health", (req, res) => {
      res.json({ status: "healthy", message: "API server is running!" });
    });

    const server = createServer(app);

    console.log("Initializing WebSockets...");
    initializeWebSocket(server);

    server.listen(PORT, () => {
      console.log(`🚀 Express server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
}

startServer();
