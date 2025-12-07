const jwt = require('jsonwebtoken');
const db = require('../config/db.config');

const verifyToken = async (req, res, next) => {
    const tokenHeader = req.headers.authorization;
    if (!tokenHeader) return res.status(401).json({ message: 'No Token' });

    const token = tokenHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
        
        // Query lấy thông tin User
        const query = `
            SELECT u.token_version, u.status, u.role_id, r.role_name 
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.role_id
            WHERE u.user_id = ?
        `;
        const [users] = await db.query(query, [decoded.userId]);
        
        if (users.length === 0) return res.status(401).json({ message: 'User not found' });
        const userInDB = users[0];

        // 1. So sánh version (Dùng ép kiểu Number để tránh lỗi 0 != "0")
        if (Number(decoded.tokenVersion || 0) !== Number(userInDB.token_version || 0)) {
            console.log("Lệch Version -> Đá User");
            return res.status(403).json({ message: 'Session expired' });
        }

        // 2. Kiểm tra Active (Cho phép cả tiếng Anh và Việt)
        const status = (userInDB.status || '').toLowerCase();
        // Nếu status là locked hoặc inactive thì chặn, còn lại cho qua
        if (status === 'locked' || status === 'inactive' || status === 'đã khóa') {
             return res.status(403).json({ message: 'Account Locked/Inactive' });
        }

        req.user = { ...decoded, roleName: userInDB.role_name };
        next();

    } catch (error) {
        console.error("Token Error:", error.message);
        return res.status(401).json({ message: 'Invalid Token' });
    }
};

const verifyAdmin = (req, res, next) => {
    const role = (req.user.roleName || '').toLowerCase();
    // In ra xem ông này là ai mà không vào được?
    console.log(`[CHECK ADMIN] User: ${req.user.userId} - Role: ${role}`); 

    if (role === 'owner' || role === 'admin') {
        next(); 
    } else {
        return res.status(403).json({ message: 'Require Admin Role' });
    }
};

module.exports = { verifyToken, verifyAdmin };