const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validationMiddleware = require('../middleware/validation.middleware');
const authMiddleware = require('../middleware/auth.middleware');

// Đăng ký
router.post('/register', validationMiddleware.validateRegister, authController.register);

// Đăng nhập
router.post('/login', validationMiddleware.validateLogin, authController.login);

// Xác thực token
router.get('/validate-token', authController.validateToken);

// Đăng xuất
router.post('/logout', authController.logout);

// Đổi mật khẩu
router.post('/change-password', validationMiddleware.validateChangePassword, authController.changePassword);

module.exports = router;