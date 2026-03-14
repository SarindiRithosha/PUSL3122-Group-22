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
const orderRoutes          = require("./routes/orderRoutes");
const analyticsRoutes      = require("./routes/analyticsRoutes");

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
app.use("/api/analytics", authenticateAdmin, analyticsRoutes);
// Order routes: POST / is public (guest checkout), GET / and PATCH /:id are admin-only.
// The router itself handles the split — admin middleware is applied here for the whole
// router, but createOrder explicitly allows guest via optional customerId.
app.use("/api/orders",    authenticateAdmin, orderRoutes);

// ── Public read-only endpoints (no auth) ──────────────────────────────────────
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
    const { category, search, sort, limit = 200 } = req.query;
    // ALWAYS filter by Published — draft items must never be visible to customers
    const filter = { status: "Published" };
    if (category && category !== "all") filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };
    let query = Furniture.find(filter).limit(Number(limit));
    if (sort === "price_asc")       query = query.sort({ price:  1 });
    else if (sort === "price_desc") query = query.sort({ price: -1 });
    else                            query = query.sort({ createdAt: -1 }); // default: newest
    const items = await query.lean();
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
});

app.get("/api/public/furniture/:id", async (req, res, next) => {
  try {
    const Furniture = require("./models/Furniture");
    const item = await Furniture.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ success: false, message: "Furniture not found." });
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
});

app.get("/api/public/designs", async (req, res, next) => {
  try {
    const Design = require("./models/Design");
    const { style, roomType, limit = 100 } = req.query;
    const filter = { status: "Published" };
    if (style)    filter.designStyle = style;
    if (roomType) filter.roomType    = roomType;
    const designs = await Design.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();
    res.json({ success: true, data: designs });
  } catch (err) { next(err); }
});

app.get("/api/public/designs/:id", async (req, res, next) => {
  try {
    const Design = require("./models/Design");
    const design = await Design.findOne({ _id: req.params.id, status: "Published" }).lean();
    if (!design) return res.status(404).json({ success: false, message: "Design not found." });
    res.json({ success: true, data: design });
  } catch (err) { next(err); }
});

// ── Public order creation (guest checkout — no auth required) ─────────────────
// Must be declared BEFORE the admin orderRoutes mount so it isn't blocked.
const orderController = require("./controllers/orderController");
app.post("/api/public/orders", orderController.createOrder);

// ── Customer-authenticated ────────────────────────────────────────────────────
app.use("/api/customer/designs", authenticateCustomer, customerDesignRoutes);
app.get("/api/customer/orders",  authenticateCustomer, orderController.getCustomerOrders);

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