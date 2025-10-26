const express = require('express');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Temporary in-memory database
let products = [];

/**
 * GET /api/products
 * List all products
 */
router.get('/', (req, res) => {
  res.json(products);
});

/**
 * GET /api/products/:id
 * Get a product by ID
 */
router.get('/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

/**
 * POST /api/products
 * Create a new product
 */
router.post('/', (req, res) => {
  const { name, description, price, category, inStock } = req.body;

  if (!name || !description || price == null || !category || inStock == null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newProduct = {
    id: uuidv4(),
    name,
    description,
    price,
    category,
    inStock
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

/**
 * PUT /api/products/:id
 * Update an existing product
 */
router.put('/:id', (req, res) => {
  const { name, description, price, category, inStock } = req.body;
  const index = products.findIndex(p => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  if (!name || !description || price == null || !category || inStock == null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const updatedProduct = {
    id: req.params.id,
    name,
    description,
    price,
    category,
    inStock
  };

  products[index] = updatedProduct;
  res.json(updatedProduct);
});

/**
 * DELETE /api/products/:id
 * Delete a product
 */
router.delete('/:id', (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  products.splice(index, 1);
  res.status(204).send(); // No content
});

module.exports = router;
