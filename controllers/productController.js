// productController.js
const asyncHandler = require('../middleware/asyncHandler');
const mongoose = require('mongoose');
const cloudinary = require('../utils/cloudinary');
const Product = require('../models/Product');

/**
 * Send standardized error response
 */
const sendError = (res, statusCode, message) =>
  res.status(statusCode).json({ status: 'error', message });

/**
 * Validate array of items (each should have `item` and `qty`)
 */
const validateItemArray = (arr = [], fieldName) => {
  for (let i = 0; i < arr.length; i++) {
    const { item, qty } = arr[i] || {};
    if (!item || qty == null) {
      return `${fieldName}: setiap elemen harus ada properti 'item' dan 'qty'`;
    }
    const qtyNum = Number(qty);
    if (!Number.isFinite(qtyNum) || qtyNum < 1) {
      return `${fieldName}: 'qty' harus angka ≥ 1 pada elemen ke-${i}`;
    }
    const rawId =
      typeof item === 'string'
        ? item
        : item._id && typeof item._id === 'string'
        ? item._id
        : null;
    if (!rawId || !mongoose.Types.ObjectId.isValid(rawId)) {
      return `${fieldName}: item harus valid ObjectId pada elemen ke-${i}`;
    }
  }
  return null;
};

/**
 * Convert list of {item, qty} to {item: ObjectId, qty: Number}
 */
const mapToObjectIdItems = (arr = []) =>
  arr.map(({ item, qty }) => ({
    item: new mongoose.Types.ObjectId(
      typeof item === 'string' ? item : item._id
    ),
    qty: Number(qty),
  }));

/**
 * Parse and validate numeric fields
 */
const parseNumbers = ({
  estimatedSellingPrice,
  productionYield,
  dailySalesTarget,
  capital,
}) => {
  const nums = {
    estimatedSellingPrice: Number(estimatedSellingPrice),
    productionYield: Number(productionYield),
    dailySalesTarget: Number(dailySalesTarget),
    capital: Number(capital),
  };
  if (!Number.isFinite(nums.estimatedSellingPrice) || nums.estimatedSellingPrice < 0) {
    throw new Error('Estimated selling price harus angka ≥ 0');
  }
  if (!Number.isFinite(nums.productionYield) || nums.productionYield < 1) {
    throw new Error('Production yield harus angka ≥ 1');
  }
  if (!Number.isFinite(nums.dailySalesTarget) || nums.dailySalesTarget < 1) {
    throw new Error('Daily sales target harus angka ≥ 1');
  }
  if (!Number.isFinite(nums.capital) || nums.capital < 0) {
    throw new Error('Capital harus angka ≥ 0');
  }
  return nums;
};

/**
 * Controller: Create a new product
 */
const createProduct = asyncHandler(async (req, res) => {
  const {
    title,
    category,
    tags = [],
    steps = [],
    tips = [],
    ingredients = [],
    packaging = [],
    tools = [],
    estimatedSellingPrice,
    productionYield,
    dailySalesTarget,
    capital,
    image,
    image_public_id,
  } = req.body;

  // Validate title & category
  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    return sendError(res, 400, 'Title wajib diisi minimal 3 karakter');
  }
  const catValue = String(category || '').trim().toLowerCase();
  if (!['food', 'drink'].includes(catValue)) {
    return sendError(res, 400, "Field 'category' wajib 'food' atau 'drink'");
  }

  // Validate image fields
  if (!image || typeof image !== 'string') {
    return sendError(res, 400, 'Field image (URL) wajib diisi');
  }
  if (!image_public_id || typeof image_public_id !== 'string') {
    return sendError(res, 400, 'Field image_public_id wajib diisi');
  }

  // Parse and validate numeric inputs
  let nums;
  try {
    nums = parseNumbers({ estimatedSellingPrice, productionYield, dailySalesTarget, capital });
  } catch (err) {
    return sendError(res, 400, err.message);
  }

  // Validate item arrays
  for (const [arr, name] of [
    [ingredients, 'Ingredients'],
    [packaging, 'Packaging'],
    [tools, 'Tools'],
  ]) {
    const errMsg = validateItemArray(arr, name);
    if (errMsg) return sendError(res, 400, errMsg);
  }

  // Build and save product
  const productData = {
    title: title.trim(),
    category: catValue,
    image,
    image_public_id,
    tags,
    steps,
    tips,
    ingredients: mapToObjectIdItems(ingredients),
    packaging: mapToObjectIdItems(packaging),
    tools: mapToObjectIdItems(tools),
    ...nums,
    createdBy: new mongoose.Types.ObjectId(req.user._id),
    isVerified: false,
  };

  const newProduct = new Product(productData);
  const savedProduct = await newProduct.save();

  res.status(201).json({
    status: 'success',
    message: 'Product berhasil dibuat',
    data: savedProduct,
  });
});

/**
 * Controller: Get list of products with filters
 */
const getAllProducts = asyncHandler(async (req, res) => {
  const { q, sort, order = 'asc', page = 1, limit = 12, category, maxCapital, createdBy } = req.query;
  const filter = {};
  if (q) filter.title = { $regex: q, $options: 'i' };
  if (category) filter.category = category;
  if (maxCapital && !isNaN(Number(maxCapital))) {
    filter.capital = { $lte: Number(maxCapital) };
  }
  if (createdBy) filter.createdBy = createdBy;

  const direction = order === 'desc' ? -1 : 1;
  const sortOptions =
    sort === 'popularity'
      ? { views: direction }
      : ['profit', 'capital'].includes(sort)
      ? { [sort]: direction }
      : { createdAt: -1 };

  const pageNum = Math.max(parseInt(page, 10), 1);
  const perPage = Math.max(parseInt(limit, 10), 1);
  const skip = (pageNum - 1) * perPage;

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .select('views title image stars capital isVerified')
    .sort(sortOptions)
    .skip(skip)
    .limit(perPage);

  res.json({
    status: 'success',
    data: {
      totalDocs: total,
      totalPages: Math.ceil(total / perPage),
      page: pageNum,
      perPage,
      products,
    },
  });
});

/**
 * Controller: Get product detail by ID
 */
const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, 'Invalid product ID');
  }

  const product = await Product.findById(id)
    .populate('ingredients.item', 'name price image amount')
    .populate('packaging.item', 'name price image amount')
    .populate('tools.item', 'name price image amount')
    .populate('createdBy', 'username');

  if (!product) {
    return sendError(res, 404, 'Product not found');
  }

  product.views = (product.views || 0) + 1;
  await product.save();

  res.json({ status: 'success', data: product });
});

/**
 * Controller: Update product (including image swap)
 */
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, 'Invalid product ID');
  }

  const existing = await Product.findById(id);
  if (!existing) {
    return sendError(res, 404, 'Product not found');
  }

  const updates = { ...req.body };

  // If new image provided, destroy old one
  if (updates.image && updates.image_public_id) {
    await cloudinary.uploader.destroy(existing.image_public_id);
  } else {
    delete updates.image;
    delete updates.image_public_id;
  }

  // Parse and validate numeric updates
  if (
    updates.estimatedSellingPrice != null ||
    updates.productionYield != null ||
    updates.dailySalesTarget != null ||
    updates.capital != null
  ) {
    try {
      const nums = parseNumbers(updates);
      Object.assign(updates, nums);
    } catch (err) {
      return sendError(res, 400, err.message);
    }
  }

  // Validate and map arrays if present
  for (const [key, name] of [
    ['ingredients', 'Ingredients'],
    ['packaging', 'Packaging'],
    ['tools', 'Tools'],
  ]) {
    if (updates[key]) {
      const errMsg = validateItemArray(updates[key], name);
      if (errMsg) return sendError(res, 400, errMsg);
      updates[key] = mapToObjectIdItems(updates[key]);
    }
  }

  existing.set(updates);
  const saved = await existing.save();

  res.json({ status: 'success', message: 'Product updated', data: saved });
});

/**
 * Controller: Delete product (destroy Cloudinary image)
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, 'Invalid product ID');
  }

  const product = await Product.findById(id);
  if (!product) {
    return sendError(res, 404, 'Product not found');
  }

  if (product.image_public_id) {
    await cloudinary.uploader.destroy(product.image_public_id);
  }

  await Product.findByIdAndDelete(id);
  res.json({ status: 'success', message: 'Product deleted' });
});

/**
 * Controller: Verify product
 */
const verifyProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return sendError(res, 400, 'Invalid product ID');

  const product = await Product.findById(id);
  if (!product) return sendError(res, 404, 'Product not found');

  product.isVerified = true;
  await product.save();
  res.json({ status: 'success', message: 'Product verified', data: product });
});

/**
 * Controller: Unverify product
 */
const unverifyProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return sendError(res, 400, 'Invalid product ID');

  const product = await Product.findById(id);
  if (!product) return sendError(res, 404, 'Product not found');

  product.isVerified = false;
  await product.save();
  res.json({ status: 'success', message: 'Product unverified', data: product });
});

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  verifyProduct,
  unverifyProduct,
};
