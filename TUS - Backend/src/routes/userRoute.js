const express = require('express');
const userController = require('../controllers/userControllers');
const router = express.Router();

router.route('/').get(userController.fetchUsers);
router
  .route('/login')
  .post(userController.validateInfo, userController.loginUser);
router
  .route('/register')
  .post(userController.validateInfo, userController.registerUser);

module.exports = router;
