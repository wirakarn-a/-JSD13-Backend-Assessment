import express from "express";
import cors from "cors";
import productsRouter from "./routes/products.js";

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Built-in and Third-Party Middlewares
app.use(cors()); // Allow requests from React frontend (e.g., http://localhost:5173)
app.use(express.json()); // Parse incoming JSON request bodies into req.body

// 2. Custom Middleware: Request Logger
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// Root Route
app.get("/", (req, res) => {
  res.json({ message: "Shopping Cart API is running smoothly!" });
});

// 3. Products Router
app.use("/products", productsRouter);

// 4. 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

// 5. Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Internal Server Error:", err.stack);
  res.status(500).json({
    message: "Something went wrong on the server!",
    error: process.env.NODE_ENV === "production" ? undefined : err.message
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
