import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Routes will be mounted here in subsequent phases
// app.use("/auth", authRoutes);
// app.use("/products", catalogRoutes);
// app.use("/stock", inventoryRoutes);
// app.use("/sales", salesRoutes);
// app.use("/purchases", purchasesRoutes);
// app.use("/notifications", notificationRoutes);
// app.use("/refunds", refundRoutes);
// app.use("/reports", reportRoutes);
// app.use("/finance", financeRoutes);

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});

export default app;