const asyncHandler = require('../middleware/asyncHandler');
const models = require('../models/index');
const cloudinary = require('../utils/cloudinary');

const Ingredient = models.Ingredient;

const addIngredientHandler = asyncHandler(async (req, res) => {
  const { name, amount, price, image, image_public_id } = req.body;

  if (!name || !amount || !price || !image || !image_public_id) {
    return res.status(400).json({
      status: 'failed',
      message: 'Name, amount, price, image, dan image_public_id harus ada',
    });
  }

  const ingredient = await Ingredient.create({
    name,
    amount,
    price,
    image,
    image_public_id,
  });

  res.status(201).json({
    status: 'success',
    message: 'Ingredient added successfully',
    data: ingredient,
  });
});

const getAllIngredients = asyncHandler(async (req, res, next) => {
  try {
    const searchQuery = req.query.q;

    const filter = searchQuery
      ? { name: { $regex: searchQuery, $options: 'i' } }
      : {};

    const ingredients = await Ingredient.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', message: 'Berhasil mendapatkan data ingredients', data: ingredients });
  } catch (err) {
    console.error('Error fetching ingredients:', err);
    next(err);
  }
});

const deleteIngredient = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const ingredient = await Ingredient.findById(id);
  if (!ingredient) {
    return res.status(404).json({ status: 'failed', message: 'Ingredient not found' });
  }

  if (ingredient.image_public_id) {
    try {
      await cloudinary.uploader.destroy(ingredient.image_public_id);
    } catch (err) {
      console.error('Cloudinary deletion error:', err);
      return res.status(500).json({ status: 'failed', message: 'Gagal menghapus gambar di Cloudinary' });
    }
  }

  await ingredient.deleteOne();

  res.status(200).json({ status: 'success', message: 'Ingredient deleted successfully' });
});

const updateIngredient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, amount, price, image, image_public_id } = req.body;

  const ingredient = await Ingredient.findById(id);
  if (!ingredient) {
    return res.status(404).json({ status: 'failed', message: 'Ingredient not found' });
  }

  if (image && image_public_id && image_public_id !== ingredient.image_public_id) {
    try {
      await cloudinary.uploader.destroy(ingredient.image_public_id);
    } catch (err) {
      console.error('Cloudinary deletion error:', err);
      return res.status(500).json({ status: 'failed', message: 'Gagal menghapus gambar lama di Cloudinary' });
    }
  }

  if (name !== undefined) ingredient.name = name;
  if (amount !== undefined) ingredient.amount = amount;
  if (price !== undefined) ingredient.price = price;
  if (image !== undefined) ingredient.image = image;
  if (image_public_id !== undefined) ingredient.image_public_id = image_public_id;

  await ingredient.save();

  res.status(200).json({
    status: 'success',
    message: 'Ingredient updated successfully',
    data: ingredient,
  });
});

const getIngredientById = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;

    const ingredient = await Ingredient.findById(id);
    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Berhasil mendapatkan data ingredient',
      data: ingredient,
    });
  } catch (err) {
    console.error('Error fetching ingredient by ID:', err);
    next(err);
  }
});

module.exports = {
  addIngredientHandler,
  getAllIngredients,
  deleteIngredient,
  updateIngredient,
  getIngredientById,
};
