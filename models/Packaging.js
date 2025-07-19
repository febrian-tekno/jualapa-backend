const mongoose = require('mongoose');

const packagingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: false,
    },
    image_public_id: { 
      type: String, 
      default: '' },
  },
  {
    timestamps: true,
  }
);

const Packaging = mongoose.model('Packaging', packagingSchema);
module.exports = Packaging;
