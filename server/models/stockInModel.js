const db = require('../config/db.config');

const stockInModel = {
    // 1. Lấy danh sách phiếu nhập (Master List)
    getAllStockInReceipts: async () => {
        const query = `
            SELECT 
                si.stock_in_id AS id, 
                si.supplier_name AS supplierName, 
                DATE_FORMAT(si.import_date, '%Y-%m-%d %H:%i') AS importDate, 
                si.total_cost AS totalCost, 
                
                -- Lấy mã nhân viên từ cột user_id
                si.user_id AS staffCode,
                
                -- Lấy tên nhân viên để hiển thị phụ nếu cần
                COALESCE(e.full_name, u.username) AS staffName
            FROM stock_in si
            LEFT JOIN users u ON si.user_id = u.user_id
            LEFT JOIN employees e ON si.user_id = e.user_id
            ORDER BY si.import_date DESC
        `;
        const [rows] = await db.query(query);
        return rows;
    },

    // 2. Lấy chi tiết của 1 phiếu
    getStockInDetailsById: async (stockInId) => {
        const query = `
            SELECT 
                sid.stock_in_id AS stockInId,
                sid.variant_id AS variantId,
                p.name AS productName,
                pv.color,
                pv.size,
                sid.quantity,
                sid.cost_price AS priceImport
            FROM stock_in_details sid
            JOIN product_variants pv ON sid.variant_id = pv.variant_id
            JOIN products p ON pv.product_id = p.product_id
            WHERE sid.stock_in_id = ?
        `;
        const [rows] = await db.query(query, [stockInId]);
        return rows;
    },

    // 3. Tạo phiếu nhập mới (Bulk Transaction)
    createStockInReceipt: async (payload) => {
        // userId: Mã nhân viên nhập từ Frontend (VD: WH01)
        const { stockInId: providedId, supplierName, userId: inputId, items } = payload;
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // [LOGIC] inputId là employee_id (VD: WH01) hoặc "OWNER"
            // Cần lấy user_id tương ứng từ bảng employees
            let finalUserId = inputId;
            
            // Kiểm tra nếu inputId là "OWNER", sử dụng "OWNER" làm user_id
            if (inputId === 'OWNER') {
                finalUserId = 'OWNER';
            } else {
                // Kiểm tra nếu inputId là employee_id, lấy user_id từ employees
                const [empCheck] = await connection.query(`
                    SELECT user_id FROM employees WHERE employee_id = ?
                `, [inputId]);
                
                if (empCheck.length > 0) {
                    finalUserId = empCheck[0].user_id; // Lấy user_id từ employees
                } else {
                    // Nếu không tìm thấy employee, giả sử inputId đã là user_id
                    finalUserId = inputId;
                }
            }

            // Kiểm tra user có tồn tại không
            const [check] = await connection.query(`
                SELECT 1 FROM users WHERE user_id = ?
            `, [finalUserId]);
            
            // Nếu user chưa tồn tại, tạo user ảo
            if (check.length === 0) {
                 try {
                     await connection.query(
                        `INSERT INTO users (user_id, username, password_hash, role_id, status) 
                         VALUES (?, ?, SHA2('123456', 256), 3, 'Active')`,
                        [finalUserId, finalUserId]
                     );
                 } catch (err) {
                     console.log(`User ${finalUserId} already exists or cannot be created`);
                 }
            }

            // B. Tạo hoặc Cập nhật Phiếu
            let stockInId = providedId;
            if (!stockInId) {
                 // Lấy tất cả mã phiếu từ database
                 const [allReceipts] = await connection.query(`
                    SELECT stock_in_id FROM stock_in WHERE stock_in_id LIKE 'SI%' ORDER BY stock_in_id
                 `);
                 
                 // Parse từ JavaScript để chắc chắn chỉ lấy format SI####
                 let maxNum = 0;
                 for (const receipt of allReceipts) {
                    const match = receipt.stock_in_id.match(/^SI(\d{4})$/);
                    if (match) {
                        const num = parseInt(match[1], 10);
                        if (num > maxNum) {
                            maxNum = num;
                        }
                    }
                 }
                 
                 let nextNum = maxNum + 1;
                 
                 // Kiểm tra không vượt quá SI9999
                 if (nextNum > 9999) {
                    throw new Error('Đã tạo quá nhiều phiếu nhập (SI9999)');
                 }
                 
                 stockInId = `SI${nextNum.toString().padStart(4, '0')}`; // SI0001, SI0002, ..., SI9999
                 
                 await connection.query(
                    `INSERT INTO stock_in (stock_in_id, supplier_name, import_date, total_cost, user_id)
                     VALUES (?, ?, NOW(), 0, ?)`,
                    [stockInId, supplierName, finalUserId] 
                );
            }

            let grandTotalAdd = 0;

            // C. Lặp qua sản phẩm
            for (const item of items) {
                const qty = parseInt(item.quantity);
                const price = parseFloat(item.priceImport);
                grandTotalAdd += (qty * price);

                // C1. Insert Detail
                await connection.query(
                    `INSERT INTO stock_in_details (stock_in_id, variant_id, quantity, cost_price)
                     VALUES (?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE
                     quantity = quantity + VALUES(quantity),
                     cost_price = VALUES(cost_price)`, 
                    [stockInId, item.variantId, qty, price]
                );

                // C2. Tính Giá Vốn (MAC)
                const [productInfo] = await connection.query(`
                    SELECT p.product_id, p.cost_price, 
                    COALESCE((SELECT SUM(stock_quantity) FROM product_variants WHERE product_id = p.product_id), 0) AS total_stock
                    FROM product_variants pv JOIN products p ON pv.product_id = p.product_id
                    WHERE pv.variant_id = ?
                `, [item.variantId]);

                if (productInfo.length > 0) {
                    const { product_id, cost_price, total_stock } = productInfo[0];
                    const oldStock = Number(total_stock);
                    const oldCost = Number(cost_price || 0);
                    
                    // Update kho
                    await connection.query(`UPDATE product_variants SET stock_quantity = stock_quantity + ? WHERE variant_id = ?`, [qty, item.variantId]);

                    // Update giá vốn
                    const newTotalStock = oldStock + qty;
                    let newAvg = price;
                    if (newTotalStock > 0) {
                        newAvg = ((oldStock * oldCost) + (qty * price)) / newTotalStock;
                    }
                    await connection.query(`UPDATE products SET cost_price = ? WHERE product_id = ?`, [newAvg, product_id]);
                }
            }

            // D. Cập nhật Tổng tiền
            await connection.query(
                'UPDATE stock_in SET total_cost = total_cost + ? WHERE stock_in_id = ?',
                [grandTotalAdd, stockInId]
            );

            await connection.commit();
            return { stockInId };

        } catch (error) {
            await connection.rollback();
            console.error(error);
            throw error;
        } finally {
            connection.release();
        }
    },

    // 4. Xóa
    deleteStockInItem: async (stockInId, variantId) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const [rows] = await connection.query(
                'SELECT quantity, cost_price FROM stock_in_details WHERE stock_in_id = ? AND variant_id = ?',
                [stockInId, variantId]
            );

            if (rows.length === 0) throw new Error("Chi tiết không tồn tại.");
            
            const { quantity, cost_price } = rows[0];
            const qtyToDelete = parseInt(quantity);
            const totalMoneyToDelete = qtyToDelete * parseFloat(cost_price);

            await connection.query('DELETE FROM stock_in_details WHERE stock_in_id = ? AND variant_id = ?', [stockInId, variantId]);
            await connection.query('UPDATE stock_in SET total_cost = total_cost - ? WHERE stock_in_id = ?', [totalMoneyToDelete, stockInId]);
            await connection.query('UPDATE product_variants SET stock_quantity = stock_quantity - ? WHERE variant_id = ?', [qtyToDelete, variantId]);

            const [remain] = await connection.query('SELECT count(*) as c FROM stock_in_details WHERE stock_in_id = ?', [stockInId]);
            if (remain[0].c === 0) {
                await connection.query('DELETE FROM stock_in WHERE stock_in_id = ?', [stockInId]);
            }

            await connection.commit();
            return { success: true };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    // 6. Xóa phiếu nhập (toàn bộ phiếu + chi tiết)
    deleteStockInReceipt: async (stockInId) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Xóa chi tiết phiếu trước
            await connection.query(
                'DELETE FROM stock_in_details WHERE stock_in_id = ?',
                [stockInId]
            );

            // Xóa phiếu master
            const [result] = await connection.query(
                'DELETE FROM stock_in WHERE stock_in_id = ?',
                [stockInId]
            );

            if (result.affectedRows === 0) {
                throw new Error(`Phiếu nhập ${stockInId} không tồn tại.`);
            }

            await connection.commit();
            return { success: true };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
};

module.exports = stockInModel;