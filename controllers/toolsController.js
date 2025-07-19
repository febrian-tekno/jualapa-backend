const asyncHandler = require('../middleware/asyncHandler');
const models = require('../models/index');
const cloudinary = require('../utils/cloudinary');

const Tool = models.Tool;

const addToolHandler = asyncHandler(async (req, res) => {
  const { name, amount, price, image, image_public_id } = req.body;

  if (!name || !amount || !price || !image || !image_public_id) {
    return res.status(400).json({
      status: 'failed',
      message: 'Name, amount, price, image, dan image_public_id harus ada',
    });
  }

  const tool = await Tool.create({
    name,
    amount,
    price,
    image,
    image_public_id,
  });

  res.status(201).json({
    status: 'success',
    message: 'Tool added successfully',
    data: tool,
  });
});

const getAllTools = asyncHandler(async (req, res, next) => {
  try {
    const searchQuery = req.query.q;

    // Filter jika ada query pencarian
    const filter = searchQuery
      ? { name: { $regex: searchQuery, $options: 'i' } } // case-insensitive search
      : {};

    const Tools = await Tool.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', message: ' berhasil mendapatkan data tools', data: Tools });
  } catch (err) {
    console.error('Error fetching ingredients:', err);
    next(err);
  }
});

// DELETE ingredient by ID
const deleteTool = asyncHandler(async (req, res,) => {
  const { id } = req.params;

  const tool = await Tool.findById(id);
  if (!tool) {
    return res.status(404).json({ status: 'failed', message: 'Tool not found' });
  }

  // Hapus gambar dari Cloudinary jika ada public_id
  if (tool.image_public_id) {
    try {
      await cloudinary.uploader.destroy(tool.image_public_id);
    } catch (err) {
      console.error('Cloudinary deletion error:', err);
      return res.status(500).json({ status: 'failed', message: 'Gagal menghapus gambar di Cloudinary' });
    }
  }

  await tool.deleteOne();

  res.status(200).json({ status: 'success', message: 'Tool deleted successfully' });
});

const updateTool = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, amount, price, image, image_public_id } = req.body;

  const tool = await Tool.findById(id);
  if (!tool) {
    return res.status(404).json({ status: 'failed', message: 'Tool not found' });
  }

  // Hapus gambar lama dari Cloudinary jika gambar baru dikirim dan public_id berbeda
  if (image && image_public_id && image_public_id !== tool.image_public_id) {
    try {
      await cloudinary.uploader.destroy(tool.image_public_id);
    } catch (err) {
      console.error('Cloudinary deletion error:', err);
      return res.status(500).json({ status: 'failed', message: 'Gagal menghapus gambar lama di Cloudinary' });
    }
  }

  // Update field jika dikirim
  if (name !== undefined) tool.name = name;
  if (amount !== undefined) tool.amount = amount;
  if (price !== undefined) tool.price = price;
  if (image !== undefined) tool.image = image;
  if (image_public_id !== undefined) tool.image_public_id = image_public_id;

  await tool.save();

  res.status(200).json({
    status: 'success',
    message: 'Tool updated successfully',
    data: tool,
  });
});



const getToolById = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;

    const tool = await Tool.findById(id);
    if (!tool) {
      return res.status(404).json({ message: 'Tool not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Berhasil mendapatkan data tool',
      data: tool,
    });
  } catch (err) {
    console.error('Error fetching tool by ID:', err);
    next(err);
  }
});

module.exports = {
  addToolHandler,
  deleteTool,
  getAllTools,
  updateTool,
  getToolById,
};
