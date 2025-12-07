// /server/routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// ============================================================
// 1. CÁC ROUTE CHUNG VÀ TẠO MỚI (NON-ID PARAM)
// ============================================================
// Lấy danh sách đơn hàng
router.get('/', orderController.listOrders);

// Tạo đơn hàng mới
router.post('/', orderController.createOrder);


// ============================================================
// 2. CÁC ROUTES CỤ THỂ (DÙNG /:orderId/ACTION) - ĐẶT TRƯỚC /:orderId
// ============================================================

// Cập nhật trạng thái Đơn hàng (Order Status)
// Endpoint: PATCH /orders/:orderId/status
router.patch('/:orderId/status', orderController.updateOrderStatus);

// THÊM: Cập nhật trạng thái THANH TOÁN (Payment Status)
// Endpoint: PATCH /orders/:orderId/payment-status
router.patch('/:orderId/payment-status', orderController.updatePaymentStatus);


// ============================================================
// 3. CÁC ROUTES CHUNG (DÙNG /:orderId) - ĐẶT CUỐI CÙNG
// ============================================================

// Xóa đơn hàng (DELETE /:orderId)
router.delete('/:orderId', orderController.deleteOrder);

// Lấy chi tiết đơn hàng (GET /:orderId)
router.get('/:orderId', orderController.getOrderById);

// Cập nhật đơn hàng (PATCH /:orderId)
router.patch('/:orderId', orderController.updateOrder);

module.exports = router;