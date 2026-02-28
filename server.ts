import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

const db = new Database("agriculture.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS crops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    variety TEXT,
    planted_date DATE,
    status TEXT DEFAULT 'growing'
  );
  
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    crop_id INTEGER,
    task_name TEXT NOT NULL,
    due_date DATE,
    completed INTEGER DEFAULT 0,
    FOREIGN KEY(crop_id) REFERENCES crops(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/crops", (req, res) => {
    const crops = db.prepare("SELECT * FROM crops").all();
    res.json(crops);
  });

  app.post("/api/crops", (req, res) => {
    const { name, variety, planted_date } = req.body;
    const info = db.prepare("INSERT INTO crops (name, variety, planted_date) VALUES (?, ?, ?)").run(name, variety, planted_date);
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/tasks", (req, res) => {
    const tasks = db.prepare(`
      SELECT tasks.*, crops.name as crop_name 
      FROM tasks 
      LEFT JOIN crops ON tasks.crop_id = crops.id
      ORDER BY due_date ASC
    `).all();
    res.json(tasks);
  });

  app.post("/api/tasks", (req, res) => {
    const { crop_id, task_name, due_date } = req.body;
    const info = db.prepare("INSERT INTO tasks (crop_id, task_name, due_date) VALUES (?, ?, ?)").run(crop_id, task_name, due_date);
    res.json({ id: info.lastInsertRowid });
  });

  app.patch("/api/tasks/:id", (req, res) => {
    const { completed } = req.body;
    db.prepare("UPDATE tasks SET completed = ? WHERE id = ?").run(completed ? 1 : 0, req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
