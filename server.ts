import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Initializing database...");
const db = new Database("ecotwin.db");

// Initialize database
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      confidence REAL,
      location_lat REAL,
      location_lng REAL,
      image_url TEXT,
      description TEXT,
      status TEXT DEFAULT 'pending', -- pending, assigned, resolved, verified
      worker_id TEXT,
      assigned_at DATETIME,
      resolved_at DATETIME,
      proof_image_url TEXT,
      verification_status TEXT, -- verified, rejected
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("Database initialized successfully.");
} catch (err) {
  console.error("Database initialization failed:", err);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

  // Logging middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  // API Routes
  app.get("/api/reports", (req, res) => {
    try {
      const reports = db.prepare("SELECT * FROM reports ORDER BY created_at DESC").all();
      res.json(reports);
    } catch (err) {
      console.error("Error fetching reports:", err);
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });

  app.post("/api/reports", (req, res) => {
    try {
      const { type, confidence, location_lat, location_lng, image_url, description } = req.body;
      const info = db.prepare(`
        INSERT INTO reports (type, confidence, location_lat, location_lng, image_url, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(type, confidence, location_lat, location_lng, image_url, description);
      
      res.json({ id: info.lastInsertRowid, status: 'success' });
    } catch (err) {
      console.error("Error creating report:", err);
      res.status(500).json({ error: "Failed to create report" });
    }
  });

  app.get("/api/analytics/summary", (req, res) => {
    try {
      const summary = db.prepare(`
        SELECT type, COUNT(*) as count 
        FROM reports 
        GROUP BY type
      `).all();
      res.json(summary);
    } catch (err) {
      console.error("Error fetching summary:", err);
      res.status(500).json({ error: "Failed to fetch summary" });
    }
  });

  app.post("/api/reports/:id/assign", (req, res) => {
    try {
      const { id } = req.params;
      const { worker_id } = req.body;
      db.prepare("UPDATE reports SET status = 'assigned', worker_id = ?, assigned_at = CURRENT_TIMESTAMP WHERE id = ?")
        .run(worker_id, id);
      res.json({ status: 'success' });
    } catch (err) {
      res.status(500).json({ error: "Failed to assign task" });
    }
  });

  app.post("/api/reports/:id/resolve", (req, res) => {
    try {
      const { id } = req.params;
      const { proof_image_url } = req.body;
      db.prepare("UPDATE reports SET status = 'resolved', proof_image_url = ?, resolved_at = CURRENT_TIMESTAMP WHERE id = ?")
        .run(proof_image_url, id);
      res.json({ status: 'success' });
    } catch (err) {
      res.status(500).json({ error: "Failed to resolve task" });
    }
  });

  app.post("/api/reports/:id/verify", (req, res) => {
    try {
      const { id } = req.params;
      const { verification_status } = req.body;
      db.prepare("UPDATE reports SET status = ?, verification_status = ? WHERE id = ?")
        .run(verification_status === 'verified' ? 'verified' : 'pending', verification_status, id);
      res.json({ status: 'success' });
    } catch (err) {
      res.status(500).json({ error: "Failed to verify task" });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting Vite in middleware mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static files from dist...");
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
