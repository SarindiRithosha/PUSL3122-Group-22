// server/server.js
const express    = require("express");
const cors       = require("cors");
const dotenv     = require("dotenv");
const path       = require("path");
const helmet     = require("helmet");
const rateLimit  = require("express-rate-limit");
const connectDB  = require("./config/db");

const authRoutes           = require("./routes/authRoutes");
const furnitureRoutes      = require("./routes/furnitureRoutes");
const roomTemplateRoutes   = require("./routes/roomTemplateRoutes");
const uploadRoutes         = require("./routes/uploadRoutes");
const designRoutes         = require("./routes/designRoutes");
const customerDesignRoutes = require("./routes/customerDesignRoutes");

const { authenticateAdmin, authenticateCustomer } = require("./middleware/authMiddleware");

dotenv.config();
connectDB();

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit:    300,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: "Too many requests. Please try again later." },
}));

app.use(cors({
  origin:      process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Health ────────────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) =>
  res.json({ success: true, message: "Furniture backend is running.", timestamp: new Date().toISOString() })
);

// ── Auth (admin + customer JWT) ────────────────────────────────────────────────
app.use("/api/auth", authRoutes);

// ── Admin-only ────────────────────────────────────────────────────────────────
app.use("/api/furniture", authenticateAdmin, furnitureRoutes);
app.use("/api/rooms",     authenticateAdmin, roomTemplateRoutes);
app.use("/api/uploads",   authenticateAdmin, uploadRoutes);
app.use("/api/designs",   authenticateAdmin, designRoutes);

// ── Public read-only endpoints (no auth) ──────────────────────────────────────
// Customers need to browse published room templates and the furniture catalog
// without requiring an admin token.

app.get("/api/public/rooms", async (req, res, next) => {
  try {
    const RoomTemplate = require("./models/RoomTemplate");
    const rooms = await RoomTemplate.find({ status: "Published" }).lean();
    res.json({ success: true, data: rooms });
  } catch (err) { next(err); }
});

app.get("/api/public/rooms/:id", async (req, res, next) => {
  try {
    const RoomTemplate = require("./models/RoomTemplate");
    const room = await RoomTemplate.findOne({ _id: req.params.id, status: "Published" }).lean();
    if (!room) return res.status(404).json({ success: false, message: "Room not found." });
    res.json({ success: true, data: room });
  } catch (err) { next(err); }
});

app.get("/api/public/furniture", async (req, res, next) => {
  try {
    const Furniture = require("./models/Furniture");
    const { category, limit = 200 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    const items = await Furniture.find(filter).limit(Number(limit)).lean();
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
});

// ── Customer-authenticated ────────────────────────────────────────────────────
app.use("/api/customer/designs", authenticateCustomer, customerDesignRoutes);

// ── 404 + global error ────────────────────────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({ success: false, message: "Route not found." })
);

app.use((error, _req, res, _next) => {
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal server error.",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));