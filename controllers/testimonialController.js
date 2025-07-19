const asyncHandler = require('../middleware/asyncHandler');
const models = require('../models/index');
const Testimonial = models.Testimonial;

// POST /api/testimonials
const createNewTestimonial = asyncHandler(async (req, res) => {
  const { name, text, picture } = req.body;

  if (!name || !text || !picture) {
    return res.status(400).json({
      status: 'failed',
      message: 'Semua field (name, text, picture) wajib diisi.',
      data: null
    });
  }

  const testimonial = await Testimonial.create({ name, text, picture });

  res.status(201).json({
    status: 'success',
    message: 'Berhasil membuat testimoni.',
    data: { testimonial }
  });
});

// GET /api/testimonials
const getAllTestimonials = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 12;

  const testimonials = await Testimonial.find()
    .sort({ createdAt: -1 })
    .limit(limit);

  res.status(200).json({
    status: 'success',
    message: 'Berhasil mengambil testimoni.',
    data: { testimonials }
  });
});


module.exports = {
  createNewTestimonial,
  getAllTestimonials,
};
