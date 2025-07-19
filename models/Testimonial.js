const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  picture: {
    type: String,
    required: true, 
    trim: true,
  },
}, {
  timestamps: true 
});

module.exports = mongoose.model('Testimonial', testimonialSchema);
