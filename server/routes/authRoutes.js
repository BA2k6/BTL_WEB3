// C:\Users\Admin\Downloads\DUANWEB(1)\server\routes\authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 1. Import Middleware xác thực (File bạn vừa tạo ở bước trước)
const { verifyToken } = require('../middleware/authMiddleware'); 

// ============================================================
// CÁC ROUTE CÔNG KHAI (Public) - Không cần Token
// ============================================================
router.post('/login', authController.login);
router.post('/register', authController.register); 

// ============================================================
// CÁC ROUTE BẢO MẬT (Private) - Cần đăng nhập mới dùng được
// ============================================================

// Đổi mật khẩu chủ động (User tự đổi) -> Cần Token để biết ai đang đổi
router.post('/change-password', verifyToken, authController.changePassword);

// Reset mật khẩu (Trường hợp User bị bắt đổi mật khẩu lần đầu)
// Nếu đây là tính năng "Quên mật khẩu" qua Email thì không cần verifyToken.
// Nhưng nếu là tính năng "Force Change Password" sau khi Admin reset, thì CẦN Token.
router.post('/reset-password', verifyToken, authController.resetPassword);

module.exports = router;