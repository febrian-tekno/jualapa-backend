const express = require('express');
const { protectedMiddleware, isAdmin } = require('../middleware/authMiddleware');
const { getAllTools, addToolHandler, deleteTool, updateTool, getToolById } = require('../controllers/toolsController');

const router = express.Router();

router.get('/', getAllTools);

router.post('/', protectedMiddleware, addToolHandler);

router.put('/:id', protectedMiddleware, isAdmin, updateTool);

router.get('/:id', getToolById);

router.delete('/:id', protectedMiddleware, isAdmin, deleteTool);

module.exports = router;
