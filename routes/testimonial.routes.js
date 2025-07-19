const express = require('express');
const { createNewTestimonial, getAllTestimonials } = require('../controllers/testimonialController');
const router = express.Router();

router.get('/', getAllTestimonials);

router.post('/', createNewTestimonial);

module.exports = router;
