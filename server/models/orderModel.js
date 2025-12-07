const db = require('../config/db.config');

const orderModel = {
    getAllOrders: async () => {
        const query = `
            SELECT 
                o.order_id AS id, 
                c.full_name AS customerName,
                o.final_total AS totalAmount, 
                o.subtotal, 
                o.shipping_cost, 
                o.status AS status, 
                o.payment_status AS paymentStatus, 
                o.order_channel AS orderChannel, 
                o.delivery_staff_id AS shipperUserId,
                es.full_name AS staffName, /* Nhân viên bán hàng/tạo đơn */
                DATE_FORMAT(o.order_date, '%Y-%m-%d %H:%i:%s') AS orderDate
            FROM orders o
            LEFT JOIN customers c ON o.customer_id = c.customer_id
            LEFT JOIN employees es ON o.staff_id = es.user_id /* Đổi alias thành es */
            ORDER BY o.order_date DESC;
        `;
        try {
            const [rows] = await db.query(query);
            return rows;
        } catch (error) {
            console.error("SQL Error in orderModel:", error);
            throw new Error(`SQL Error in getAllOrders: ${error.message}`);
        }
    }
};

module.exports = orderModel;