const Product = require('../models/productModel');
const cloudinary = require('../utils/cloudinary');
const redis = require('../utils/redisClient');

// Create product with Cloudinary upload (works with memoryStorage multer)
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, image, createdBy } = req.body;

    // 1) Validate normal fields
    // Verify required fields quickly
    if (!name || !description || !price || !category || stock === null) {
      return res.status(400).json({
        message: 'name , description, price, category, and stock are required fields.',
      });
    }

    let imageUrl = null;
    let imagePublicId = null;

    // If multer saved file in memory, req.file.buffer exists
    if (req.file && req.file.buffer) {
      // Upload via stream and wait for result
      const uploaded = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'ecommerce-products' },
          (err, result) => {
            if (err) return reject(err);
            resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      imageUrl = uploaded.secure_url;
      imagePublicId = uploaded.public_id;
    } else {
      return res.status(400).json({
        message: 'Product image is required.',
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock: stock || 0,
      createdBy: req.user ? req.user._id : null,
      image: imageUrl,
      imagePublicId: imagePublicId, // optional, useful for deletion later
    });

    res.status(201).json({
      message: 'Product created successfully',
      product,
    });
  } catch (err) {
    console.error('Create product error: ', err);
    res.status(500).json({
      message: err.message || 'Server Error while creating product',
    });
  }
};

// Get all products with search, filter, sort, pagination
// GET /api/products
// Public
exports.getProducts = async (req, res) => {
  try {
    // Extract query parameters
    let { page = 1, limit = 10, category, minPrice, maxPrice, search, sort } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    // Redis
    const cacheKey = `products:${JSON.stringify({
      page,
      limit,
      category,
      minPrice,
      maxPrice,
      search,
      sort,
    })}`;

    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return res.json({
        ...JSON.parse(cachedData),
        fromCache: true,
      });
    }

    const filter = {};

    if (category) filter.category = category;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    let sortOption = { createdAt: -1 }; // Default sort by newest
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortOption).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    const result = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      products,
    };

    res.json(result);

    await redis.set(cacheKey, JSON.stringify(result), 'EX', 600); // Cache for 60 seconds
  } catch (err) {
    console.log('Get products error: ', err);
    res.status(500).json({
      message: err.message || 'Server Error while fetching products',
    });
  }
};

// Get single product
// GET /api/products/:id
// Public
exports.getProductById = async (req, res) => {
  try {
    const id = req.params.id;

    // Redis
    const cacheKey = `product:${id}`;
    // Check Redis cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({
        ...JSON.parse(cached),
        fromCache: true,
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: 'Product not found',
      });
    }

    // Cache the product data in Redis
    await redis.set(cacheKey, JSON.stringify(product), 'EX', 60); // Cache for 60 seconds

    res.json(product);
  } catch (err) {
    console.log('Get product by ID error: ', err);
    res.status(500).json({
      message: err.message || 'Server Error while fetching product',
    });
  }
};

// UPDATE product (Admin Only)
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    const productId = req.params.id;

    let product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        message: 'Product not found',
      });
    }

    // Update text fields if provided
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;
    if (stock !== undefined) product.stock = stock;

    // Handle new image
    if (req.file && req.file.buffer) {
      // Delete old image from Cloudinary
      if (product.imagePublicId) {
        await cloudinary.uploader.destroy(product.imagePublicId).catch(() => {});
      }

      const uploaded = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'ecommerce-products' },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        stream.end(req.file.buffer);
      });

      product.image = uploaded.secure_url;
      product.imagePublicId = uploaded.public_id;
    }

    await product.save();

    // Clear Redis cache
    await redis.del(`product:${productId}`);
    const keys = await redis.keys('products:*');
    if (keys.length) await redis.del(keys);

    res.json({
      message: 'Product updated successfully',
      product,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || 'Server Error while updating product',
    });
  }
};

// DELETE product (Admin Only)
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        message: 'Product not found',
      });
    }

    // Delete image from Cloudinary
    if (product.imagePublicId) {
      await cloudinary.uploader.destroy(product.imagePublicId).catch(() => {});
    }

    await Product.deleteOne({ _id: productId });

    // Clear Redis cache
    await redis.del(`product:${productId}`);
    const keys = await redis.keys('products:*');
    if (keys.length) await redis.del(keys);

    res.json({
      message: 'Product deleted successfully',
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || 'Server Error while deleting product',
    });
  }
};
