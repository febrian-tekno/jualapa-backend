const express = require('express');
const {
  addIngredientHandler,
  getAllIngredients,
  deleteIngredient,
  updateIngredient,
  getIngredientById,
} = require('../controllers/ingredientController');
const { protectedMiddleware, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getAllIngredients);

router.post('/', protectedMiddleware, isAdmin, addIngredientHandler);

router.put('/', protectedMiddleware, isAdmin, updateIngredient);

router.get('/:id', getIngredientById);

router.delete('/:id', protectedMiddleware, isAdmin, deleteIngredient);

module.exports = router;
