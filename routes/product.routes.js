const express = require('express');
const { protectedMiddleware, isAdmin } = require('../middleware/authMiddleware');
const { createProduct, getAllProducts, getProductById, updateProduct, verifyProduct, deleteProduct, unverifyProduct } = require('../controllers/productController');
const router = express.Router();


router.get('/', getAllProducts);

router.post('/', protectedMiddleware, createProduct);

router.get('/:id', getProductById);

router.put('/:id', protectedMiddleware, isAdmin, updateProduct);

router.delete('/:id', protectedMiddleware, isAdmin, deleteProduct);

router.patch('/:id/verify', protectedMiddleware, isAdmin, verifyProduct);

router.patch('/:id/unverify', protectedMiddleware, isAdmin, unverifyProduct);

module.exports = router;
