// server.js - Complete Express server for Week 2 assignment

// ----------------------
// Import required modules
// ----------------------
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');


// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ----------------------
// Middleware Setup
// ----------------------

// Parse JSON request bodies
app.use(bodyParser.json());

// ✅ Custom logger middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// ✅ Authentication middleware
// Checks for an API key in request headers (x-api-key)
//app.use((req, res, next) => {
  //const apiKey = req.headers['x-api-key'];
  //const validKey = process.env.API_KEY || '12345'; // fallback key
  //if (!apiKey || apiKey !== validKey) {
    //return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
  //}
  //next();
//});

// ----------------------
// In-memory products database
// ----------------------
let products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop with 16GB RAM',
    price: 1200,
    category: 'electronics',
    inStock: true
  },
  {
    id: '2',
    name: 'Smartphone',
    description: 'Latest model with 128GB storage',
    price: 800,
    category: 'electronics',
    inStock: true
  },
  {
    id: '3',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with timer',
    price: 50,
    category: 'kitchen',
    inStock: false
  }
];

// ----------------------
// Root Route
// ----------------------
app.get('/', (req, res) => {
  res.send('Hello world.');
});

// ----------------------
// RESTful API Routes
// ----------------------

// GET /api/products - Get all products (with optional filtering and pagination)
app.get('/api/products', (req, res) => {
  let result = [...products];

  // Filtering by category
  if (req.query.category) {
    result = result.filter(p => p.category === req.query.category.toLowerCase());
  }

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const start = (page - 1) * limit;
  const paginated = result.slice(start, start + limit);

  res.json({
    total: result.length,
    page,
    limit,
    products: paginated
  });
});

// GET /api/products/:id - Get a specific product by ID
app.get('/api/products/:id', (req, res, next) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    const error = new Error('Product not found');
    error.status = 404;
    return next(error);
  }
  res.json(product);
});

// POST /api/products - Create a new product
app.post('/api/products', (req, res, next) => {
  const { name, description, price, category, inStock } = req.body;

  if (!name || !description || price == null || !category || inStock == null) {
    const error = new Error('Missing required fields');
    error.status = 400;
    return next(error);
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

// PUT /api/products/:id - Update an existing product
app.put('/api/products/:id', (req, res, next) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    const error = new Error('Product not found');
    error.status = 404;
    return next(error);
  }

  const { name, description, price, category, inStock } = req.body;
  if (!name || !description || price == null || !category || inStock == null) {
    const error = new Error('Missing required fields');
    error.status = 400;
    return next(error);
  }

  products[index] = { id: req.params.id, name, description, price, category, inStock };
  res.json(products[index]);
});

// DELETE /api/products/:id - Delete a product
app.delete('/api/products/:id', (req, res, next) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    const error = new Error('Product not found');
    error.status = 404;
    return next(error);
  }

  products.splice(index, 1);
  res.status(204).send();
});

// ----------------------
// Advanced Feature Routes
// ----------------------

// GET /api/products/search?q=name - Search products by name
app.get('/api/products/search', (req, res) => {
  const query = req.query.q ? req.query.q.toLowerCase() : '';
  const results = products.filter(p => p.name.toLowerCase().includes(query));
  res.json(results);
});

// GET /api/products/stats - Product statistics (count by category)
app.get('/api/products/stats', (req, res) => {
  const stats = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {});
  res.json(stats);
});

app.get('/', (req, res) => {
  res.send('Server is running!');
});

// ----------------------
// Global Error Handling Middleware
// ----------------------
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// ----------------------
// Start Server
// ----------------------
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

// Export the app for testing
module.exports = app;
