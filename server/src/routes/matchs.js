const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');
const { validateMatchScheduling } = require('../middlewares/matchValidator');

const {
  getAllMatchs,
  getMatchById,
  createMatch,
  updateMatch,
  deleteMatch,
  postponeMatch,
  cancelMatch,
  getMatchsByArbitre,
  getCalendar
} = require('../controllers/matchController');

router.use(auth);

router.get('/calendar', getCalendar);
router.get('/arbitre/:arbitreId', getMatchsByArbitre);
router.get('/', getAllMatchs);
router.get('/:id', getMatchById);
router.post('/', checkRole('super_admin', 'admin_sportif'), validateMatchScheduling, createMatch);
router.put('/:id', checkRole('super_admin', 'admin_sportif', 'arbitre'), validateMatchScheduling, updateMatch);
router.delete('/:id', checkRole('super_admin', 'admin_sportif'), deleteMatch);
router.patch('/:id/postpone', checkRole('super_admin', 'admin_sportif'), postponeMatch);
router.patch('/:id/cancel', checkRole('super_admin', 'admin_sportif'), cancelMatch);

module.exports = router;