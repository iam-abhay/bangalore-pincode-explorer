import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 5000);

const dataPath = path.join(__dirname, "../data/bangalore-pincodes.json");
const records = JSON.parse(fs.readFileSync(dataPath, "utf8"));

app.disable("x-powered-by");
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "bangalore-pincode-explorer-api",
    records: records.length,
    timestamp: new Date().toISOString()
  });
});

app.get("/api/pincodes", (req, res) => {
  const pincode = String(req.query.pincode || "").trim();
  const area = String(req.query.area || "").trim();
  const query = String(req.query.query || "").trim();

  const page = Math.max(Number.parseInt(req.query.page || "1", 10) || 1, 1);
  const limit = Math.min(
    Math.max(Number.parseInt(req.query.limit || "12", 10) || 12, 1),
    50
  );

  const sort = ["area", "pincode"].includes(req.query.sort)
    ? req.query.sort
    : "area";

  const order = req.query.order === "desc" ? "desc" : "asc";

  if (pincode && !/^\d{6}$/.test(pincode)) {
    return res.status(400).json({
      message: "PIN code must contain exactly 6 digits."
    });
  }

  const searchText = (area || query).toLowerCase();

  let filtered = records.filter((record) => {
    const matchesPin = !pincode || record.pincode === pincode;
    const matchesText =
      !searchText ||
      record.area.toLowerCase().includes(searchText) ||
      record.pincode.includes(searchText);

    return matchesPin && matchesText;
  });

  filtered.sort((a, b) => {
    const first = String(a[sort]).toLowerCase();
    const second = String(b[sort]).toLowerCase();
    const comparison = first.localeCompare(second, undefined, { numeric: true });
    return order === "desc" ? -comparison : comparison;
  });

  const total = filtered.length;
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * limit;

  res.json({
    count: filtered.slice(start, start + limit).length,
    total,
    page: safePage,
    limit,
    totalPages,
    data: filtered.slice(start, start + limit)
  });
});

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error." });
});

app.listen(PORT, () => {
  console.log(`Bangalore Pincode API running on http://localhost:${PORT}`);
});
