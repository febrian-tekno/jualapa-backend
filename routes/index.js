const express = require('express');
const router = express.Router();
const userRoutes = require('./user.routes');
const authRoutes = require('./auth.routes');
const productRoutes = require('./product.routes');
const ingredientRoutes = require('./ingredient.routes');
const packagingRoutes = require('./packaging.routes');
const toolRoutes = require('./tools.routes');
const testimonialRoutes = require('./testimonial.routes');

// endpoint user
router.use('/users', userRoutes);

// endpoint auth
router.use('/auth', authRoutes);

//endpoint products
router.use('/products', productRoutes);

// endpoint ingredients
router.use('/ingredients', ingredientRoutes);

router.use('/packages', packagingRoutes);

router.use('/tools', toolRoutes);

router.use('/testimonials', testimonialRoutes);
module.exports = router;
