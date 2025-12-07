// File: server/models/userModel.js
const db = require('../config/db.config');

const userModel = {

    // 1. LẤY DANH SÁCH USER
    getAllUsers: async () => {
        const query = `
            SELECT 
                u.user_id, u.username, u.status, u.created_at, r.role_name AS roleName,
                COALESCE(c.full_name, e.full_name, u.username) AS full_name 
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.role_id
            LEFT JOIN customers c ON u.user_id = c.user_id
            LEFT JOIN employees e ON u.user_id = e.user_id
            ORDER BY u.created_at DESC
        `;
        const [rows] = await db.query(query);
        return rows;
    },
    
    // 2. TÌM USER (LOGIN)
    findByUsername: async (username) => {
        const query = `
            SELECT 
                u.user_id, u.username, u.password_hash, u.token_version, u.status, u.role_id, u.must_change_password,
                r.role_name as roleName,
                COALESCE(c.full_name, e.full_name, u.username) AS full_name 
            FROM users u 
            LEFT JOIN roles r ON u.role_id = r.role_id 
            LEFT JOIN customers c ON u.user_id = c.user_id
            LEFT JOIN employees e ON u.user_id = e.user_id
            WHERE u.username = ? AND u.status != 'Deleted'
        `;
        const [rows] = await db.query(query, [username]);
        return rows[0];
    },

    // 3. TÌM THEO ID
    findById: async (id) => {
        const [rows] = await db.query("SELECT * FROM users WHERE user_id = ?", [id]);
        return rows[0];
    },

    // 4. NGƯỜI DÙNG TỰ ĐỔI MẬT KHẨU [ĐÃ SỬA]
    // ============================================================
    updatePassword: async (userId, newPass) => { 
        // 🟢 SỬA 1: Bỏ tham số mustChange, Gán cứng = 0 trong SQL
        // 🟢 SỬA 2: Dùng COALESCE để xử lý trường hợp token_version bị NULL
        const query = `
            UPDATE users 
            SET password_hash = ?, 
                must_change_password = 0, 
                token_version = COALESCE(token_version, 0) + 1 
            WHERE user_id = ?
        `;
        await db.query(query, [newPass, userId]);
    },
    // 5. ADMIN RESET MẬT KHẨU
    adminResetPassword: async (userId, newPass, newTokenVersion) => {
        const query = `
            UPDATE users 
            SET password_hash = ?, 
                must_change_password = 1, 
                token_version = ? 
            WHERE user_id = ?
        `;
        
        // Fallback: Nếu không có newTokenVersion (để tránh lỗi tràn số), dùng logic +1
        if (!newTokenVersion) {
             const fallbackQuery = `
                UPDATE users 
                SET password_hash = ?, 
                    must_change_password = 1, 
                    token_version = COALESCE(token_version, 0) + 1 
                WHERE user_id = ?
            `;
             const [result] = await db.query(fallbackQuery, [newPass, userId]);
             return result;
        }
        
        const [result] = await db.query(query, [newPass, newTokenVersion, userId]);
        return result;
    },

    // 6. CẬP NHẬT TRẠNG THÁI (KHÓA/MỞ)
    updateStatus: async (userId, newStatus, newTokenVersion) => {
        let query, params;
        
        if (newTokenVersion) {
            query = `UPDATE users SET status = ?, token_version = ? WHERE user_id = ?`;
            params = [newStatus, newTokenVersion, userId];
        } else {
            // Fallback: Tự động cộng 1
            query = `UPDATE users SET status = ?, token_version = COALESCE(token_version, 0) + 1 WHERE user_id = ?`;
            params = [newStatus, userId];
        }

        const [result] = await db.query(query, params);
        return result;
    },
getAllUsers: async () => { /*...*/ const [rows] = await db.query("SELECT u.user_id, u.username, u.status, u.created_at, r.role_name AS roleName, COALESCE(c.full_name, e.full_name, u.username) AS full_name FROM users u LEFT JOIN roles r ON u.role_id = r.role_id LEFT JOIN customers c ON u.user_id = c.user_id LEFT JOIN employees e ON u.user_id = e.user_id ORDER BY u.created_at DESC"); return rows; },
    findByUsername: async (username) => { /*...*/ const [rows] = await db.query("SELECT u.user_id, u.username, u.password_hash, u.token_version, u.status, u.role_id, u.must_change_password, r.role_name as roleName, COALESCE(c.full_name, e.full_name, u.username) AS full_name FROM users u LEFT JOIN roles r ON u.role_id = r.role_id LEFT JOIN customers c ON u.user_id = c.user_id LEFT JOIN employees e ON u.user_id = e.user_id WHERE u.username = ? AND u.status != 'Deleted'", [username]); return rows[0]; },
    findById: async (id) => { /*...*/ const [rows] = await db.query("SELECT * FROM users WHERE user_id = ?", [id]); return rows[0]; },
    updatePassword: async (userId, newPass) => { /*...*/ await db.query("UPDATE users SET password_hash = ?, must_change_password = 0, token_version = COALESCE(token_version, 0) + 1 WHERE user_id = ?", [newPass, userId]); },
    adminResetPassword: async (userId, newPass, newTokenVersion) => { /*...*/ if (!newTokenVersion) { const [result] = await db.query("UPDATE users SET password_hash = ?, must_change_password = 1, token_version = COALESCE(token_version, 0) + 1 WHERE user_id = ?", [newPass, userId]); return result; } const [result] = await db.query("UPDATE users SET password_hash = ?, must_change_password = 1, token_version = ? WHERE user_id = ?", [newPass, newTokenVersion, userId]); return result; },
    updateStatus: async (userId, newStatus, newTokenVersion) => { /*...*/ let query, params; if (newTokenVersion) { query = `UPDATE users SET status = ?, token_version = ? WHERE user_id = ?`; params = [newStatus, newTokenVersion, userId]; } else { query = `UPDATE users SET status = ?, token_version = COALESCE(token_version, 0) + 1 WHERE user_id = ?`; params = [newStatus, userId]; } const [result] = await db.query(query, params); return result; },
    updateCustomerProfile: async (userId, data) => { const query = `UPDATE customers SET full_name = ?, phone = ?, address = ?, date_of_birth = ?, email = ? WHERE user_id = ?`; const [result] = await db.query(query, [data.full_name, data.phone, data.address, data.date_of_birth, data.email, userId]); return result; },
    updateEmployeeProfile: async (userId, data) => { const query = `UPDATE employees SET full_name = ?, phone = ?, address = ?, date_of_birth = ?, email = ? WHERE user_id = ?`; const [result] = await db.query(query, [data.full_name, data.phone, data.address, data.date_of_birth, data.email, userId]); return result; },

    // ============================================================
    // 1. LẤY CHI TIẾT HỒ SƠ (Dùng cho hàm getProfile)
    // ============================================================
    getProfileById: async (userId) => {
        const query = `
            SELECT 
                u.user_id, u.username, u.status, u.role_id, r.role_name,
                -- Customer
                c.full_name AS c_name, c.email AS c_email, c.phone AS c_phone, c.address AS c_address, c.date_of_birth AS c_dob,
                -- Employee
                e.full_name AS e_name, e.email AS e_email, e.phone AS e_phone, e.address AS e_address, e.date_of_birth AS e_dob,
                e.department, e.employee_type, e.start_date,
                e.base_salary, e.commission_rate -- [MỚI] Lấy thêm lương
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.role_id
            LEFT JOIN customers c ON u.user_id = c.user_id
            LEFT JOIN employees e ON u.user_id = e.user_id
            WHERE u.user_id = ?
        `;
        
        const [rows] = await db.query(query, [userId]);
        const raw = rows[0];
        
        if (!raw) return null;

        return {
            user_id: raw.user_id,
            username: raw.username,
            status: raw.status,
            role_name: raw.role_name,
            
            full_name: raw.e_name || raw.c_name || raw.username,
            email: raw.e_email || raw.c_email,
            phone: raw.e_phone || raw.c_phone,
            address: raw.e_address || raw.c_address,
            date_of_birth: raw.e_dob || raw.c_dob,
            
            department: raw.department,
            employee_type: raw.employee_type,
            start_date: raw.start_date,
            base_salary: raw.base_salary,         // [MỚI]
            commission_rate: raw.commission_rate  // [MỚI]
        };
    },

};

module.exports = userModel;