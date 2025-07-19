const express = require('express');
const { protectedMiddleware, isAdmin } = require('../middleware/authMiddleware');
const {
  getAllPackaging,
  addPackagingHandler,
  deletePackaging,
  updatePackaging,
  getPackagingById,
} = require('../controllers/packagingController');

const router = express.Router();

router.get('/', getAllPackaging);

router.post('/', protectedMiddleware, addPackagingHandler);

router.put('/:id', protectedMiddleware, isAdmin, updatePackaging);

router.get('/:id', getPackagingById);

router.delete('/:id', protectedMiddleware, isAdmin, deletePackaging);

module.exports = router;
