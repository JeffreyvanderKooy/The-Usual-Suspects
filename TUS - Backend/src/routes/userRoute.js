const express = require('express');
const userController = require('../controllers/userControllers');
const authController = require('../controllers/authController');
const router = express.Router();

router.route('/').get(userController.fetchUsers);
router.route('/login/cookie').get(authController.loginCookie);
router.route('/logout').get(authController.logout);

router.use(userController.validateInfo);

router.route('/login').post(userController.loginUser);
router.route('/register').post(userController.registerUser);

module.exports = router;
