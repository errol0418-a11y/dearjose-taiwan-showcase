import express from "express";
import { createServer } from "http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface SavedOrder {
  id: string;
  createdAt: string;
  customer: { phone?: string };
  items: unknown[];
  total: number;
  status: string;
}

const dataDir = path.resolve(process.cwd(), "data");
const ordersPath = path.join(dataDir, "orders.json");

function readOrders(): SavedOrder[] {
  try {
    if (!fs.existsSync(ordersPath)) return [];
    return JSON.parse(fs.readFileSync(ordersPath, "utf8"));
  } catch {
    return [];
  }
}

function writeOrders(orders: SavedOrder[]) {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json({ limit: "1mb" }));

  app.post("/api/orders", (req, res) => {
    const order = req.body as SavedOrder;
    if (!order?.id || !order?.customer?.phone || !Array.isArray(order.items)) {
      return res.status(400).json({ error: "invalid_order" });
    }
    const orders = readOrders();
    orders.unshift(order);
    writeOrders(orders.slice(0, 1000));
    res.json({ ok: true, order });
  });

  app.get("/api/orders", (req, res) => {
    const phone = String(req.query.phone || "").replace(/\D/g, "");
    if (!phone) return res.json({ orders: [] });
    const orders = readOrders().filter((order) => String(order.customer?.phone || "").replace(/\D/g, "") === phone);
    res.json({ orders });
  });

  const staticPath = process.env.NODE_ENV === "production" ? path.resolve(__dirname, "public") : path.resolve(__dirname, "..", "dist", "public");
  app.use(express.static(staticPath));
  app.get("*", (_req, res) => res.sendFile(path.join(staticPath, "index.html")));

  const port = process.env.PORT || 3000;
  server.listen(port, () => console.log(`Server running on http://localhost:${port}/`));
}

startServer().catch(console.error);