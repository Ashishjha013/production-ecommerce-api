const express = require('express');
const dotenv = require('dotenv');
// Load environment variables from .env file
dotenv.config();

// Security and data sanitization packages
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const connectDB = require('./config/db');
require('./utils/redisClient');

// Route files
const cartRoutes = require('./routes/cartRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Initialize Express app
const app = express();

// Connect to database
connectDB();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  })
);

// Set security HTTP headers
app.use(helmet());
// Data sanitization against NoSQL injection attacks
app.use(mongoSanitize());
// Data sanitization against XSS attacks
app.use(xss());

// Rate limiting middleware to limit repeated requests to public APIs and endpoints
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
  })
);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('E-Commerce API is running smoothly! 🚀');
});

// Mount route files
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Start the server
app.listen(process.env.PORT || 8080, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT || 8080}`);
});
