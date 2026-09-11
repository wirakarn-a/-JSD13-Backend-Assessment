import { Router } from "express";
import { products } from "../models/Product.js";

const router = Router();

// 1. GET /products (Supports query params: search, sortBy)
router.get("/", (req, res) => {
  const { search, sortBy } = req.query;
  let result = [...products];

  // Query filter: search by product name
  if (search) {
    result = result.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase().trim())
    );
  }

  // Query sort: sort by price
  if (sortBy === "price_asc") {
    result.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price_desc") {
    result.sort((a, b) => b.price - a.price);
  }

  res.status(200).json(result);
});

// 2. GET /products/:id (Get a single product)
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const product = products.find((p) => p.id === id);

  if (!product) {
    return res.status(404).json({ message: `Product with ID '${id}' not found` });
  }

  res.status(200).json(product);
});

// 3. POST /products (Create a new product)
router.post("/", (req, res) => {
  const { name, price, quantity } = req.body;

  // Server-side validation
  if (!name || typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ message: "Product name is required and cannot be empty." });
  }

  if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
    return res.status(400).json({ message: "A valid positive price is required." });
  }

  const parsedQuantity = quantity !== undefined ? Number(quantity) : 1;
  if (isNaN(parsedQuantity) || parsedQuantity < 1) {
    return res.status(400).json({ message: "Quantity must be a positive number (minimum 1)." });
  }

  const newProduct = {
    id: String(Date.now()),
    name: name.trim(),
    price: Number(Number(price).toFixed(2)),
    quantity: parsedQuantity
  };

  products.push(newProduct);

  res.status(201).json({
    message: "Product created successfully",
    product: newProduct
  });
});

// 4. PUT /products/:id (Update an existing product)
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, price, quantity } = req.body;

  const productIndex = products.findIndex((p) => p.id === id);

  if (productIndex === -1) {
    return res.status(404).json({ message: `Product with ID '${id}' not found` });
  }

  // Validation if fields are provided
  if (name !== undefined) {
    if (typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({ message: "Product name cannot be empty." });
    }
  }

  if (price !== undefined) {
    if (isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({ message: "Price must be a valid positive number." });
    }
  }

  if (quantity !== undefined) {
    if (isNaN(Number(quantity)) || Number(quantity) < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1." });
    }
  }

  const current = products[productIndex];
  const updatedProduct = {
    ...current,
    name: name !== undefined ? name.trim() : current.name,
    price: price !== undefined ? Number(Number(price).toFixed(2)) : current.price,
    quantity: quantity !== undefined ? Number(quantity) : current.quantity
  };

  products[productIndex] = updatedProduct;

  res.status(200).json({
    message: "Product updated successfully",
    product: updatedProduct
  });
});

// 5. DELETE /products/:id (Delete a product)
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const productIndex = products.findIndex((p) => p.id === id);

  if (productIndex === -1) {
    return res.status(404).json({ message: `Product with ID '${id}' not found` });
  }

  const [deletedProduct] = products.splice(productIndex, 1);

  res.status(200).json({
    message: "Product deleted successfully",
    product: deletedProduct
  });
});

export default router;
