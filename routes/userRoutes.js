const express = require('express');
const router = express.Router();
const { getUsers, updateUserRole, deleteUser } = require('../controllers/userController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.use(protect);
router.use(admin);

router.route('/')
  .get(getUsers);

router.route('/:id')
  .delete(deleteUser);

router.route('/:id/role')
  .put(updateUserRole);

module.exports = router;
