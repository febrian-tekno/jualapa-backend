const asyncHandler = require('../middleware/asyncHandler');
const models = require('../models/index');
const cloudinary = require('../utils/cloudinary');

const Packaging = models.Packaging;


const addPackagingHandler = asyncHandler(async (req, res) => {
  const { name, amount, price, image, image_public_id } = req.body;

  if (!name || !amount || !price || !image || !image_public_id) {
    return res.status(400).json({
      status: 'failed',
      message: 'Name, amount, price, image, dan image_public_id harus ada',
    });
  }

  const packaging = await Packaging.create({
    name,
    amount,
    price,
    image,
    image_public_id,
  });

  res.status(201).json({
    status: 'success',
    message: 'packaging added successfully',
    data: packaging,
  });
});

const getAllPackaging = asyncHandler(async (req, res, next) => {
  try {
    const searchQuery = req.query.q;

    // Filter jika ada query pencarian
    const filter = searchQuery
      ? { name: { $regex: searchQuery, $options: 'i' } } // case-insensitive search
      : {};

    const Packages = await Packaging.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', message: ' berhasil mendapatkan data packages', data: Packages });
  } catch (err) {
    console.error('Error fetching packages:', err);
    next(err);
  }
});

// DELETE packages by ID
const deletePackaging = asyncHandler(async (req, res,) => {
  const { id } = req.params;

  const packaging = await Packaging.findById(id);
  if (!packaging) {
    return res.status(404).json({ status: 'failed', message: 'packaging not found' });
  }

  // Hapus gambar dari Cloudinary jika ada public_id
  if (packaging.image_public_id) {
    try {
      await cloudinary.uploader.destroy(packaging.image_public_id);
    } catch (err) {
      console.error('Cloudinary deletion error:', err);
      return res.status(500).json({ status: 'failed', message: 'Gagal menghapus gambar di Cloudinary' });
    }
  }

  await packaging.deleteOne();

  res.status(200).json({ status: 'success', message: 'Packaging deleted successfully' });
});

const updatePackaging = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, amount, price, image, image_public_id } = req.body;

  const packaging = await Packaging.findById(id);
  if (!packaging) {
    return res.status(404).json({ status: 'failed', message: 'packaging not found' });
  }

  // Hapus gambar lama dari Cloudinary jika gambar baru dikirim dan public_id berbeda
  if (image && image_public_id && image_public_id !== packaging.image_public_id) {
    try {
      await cloudinary.uploader.destroy(packaging.image_public_id);
    } catch (err) {
      console.error('Cloudinary deletion error:', err);
      return res.status(500).json({ status: 'failed', message: 'Gagal menghapus gambar lama di Cloudinary' });
    }
  }

  // Update field jika dikirim
  if (name !== undefined) packaging.name = name;
  if (amount !== undefined) packaging.amount = amount;
  if (price !== undefined) packaging.price = price;
  if (image !== undefined) packaging.image = image;
  if (image_public_id !== undefined) packaging.image_public_id = image_public_id;

  await packaging.save();

  res.status(200).json({
    status: 'success',
    message: 'packaging updated successfully',
    data: packaging,
  });
});



const getPackagingById = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;

    const packaging = await Packaging.findById(id);
    if (!packaging) {
      return res.status(404).json({ message: 'packaging not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Berhasil mendapatkan data packaging',
      data: packaging,
    });
  } catch (err) {
    console.error('Error fetching packaging by ID:', err);
    next(err);
  }
});



module.exports = {
  addPackagingHandler,
  getAllPackaging,
  deletePackaging,
  updatePackaging,
  getPackagingById,
};
