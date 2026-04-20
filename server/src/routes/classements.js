const express = require('express');
const router = express.Router();
const classementController = require('../controllers/classementController');
const authMiddleware = require('../middlewares/auth');
const checkRoleMiddleware = require('../middlewares/checkRole');

router.get('/', classementController.getClassement);

module.exports = router;
