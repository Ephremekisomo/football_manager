const express = require('express');
const router = express.Router();
const tropheeController = require('../controllers/tropheeController');
const authMiddleware = require('../middlewares/auth');
const checkRoleMiddleware = require('../middlewares/checkRole');

router.get('/', authMiddleware, checkRoleMiddleware('super_admin', 'admin_sportif', 'responsable_club', 'visiteur'), tropheeController.getAll);
router.get('/:id', authMiddleware, checkRoleMiddleware('super_admin', 'admin_sportif', 'responsable_club', 'visiteur'), tropheeController.getById);

router.post('/champion/:competition_id', authMiddleware, checkRoleMiddleware('super_admin', 'admin_sportif'), tropheeController.createChampionTrophee);

module.exports = router;
