// # ________________________________ROUTER FOR USER QUERIES______________________________________ # //
const express = require('express');
const userController = require('../controllers/userControllers');
const authController = require('../controllers/authController');
const router = express.Router();


router.route('/').get(userController.fetchUsers); // Retrieves all registered users
router.route('/login/cookie').get(authController.loginCookie); // Logs the user in with a cookie
router.route('/logout').get(authController.logout); // Logs the user out

// Middleware for validating "login" or "register" info
router.use(userController.validateInfo);

router.route('/login').post(userController.loginUser); // Logs the user in
router.route('/register').post(userController.registerUser); // Registersa  new user

module.exports = router;
