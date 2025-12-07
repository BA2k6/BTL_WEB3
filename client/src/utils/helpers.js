// /client/src/utils/helpers.js (Bản FIX cuối)

import { ROLES } from './constants';

/**
 * Định dạng giá trị tiền tệ sang VNĐ.
 * Trả về chuỗi rỗng ('') nếu giá trị là NULL, NaN, hoặc 0.
 */
export const formatCurrency = (amount) => {
    // 1. Ép kiểu sang số
    const numericAmount = parseFloat(amount);
    
    // 2. Kiểm tra nếu không phải là số hợp lệ (NaN, null, undefined)
    // Lưu ý: Đã XÓA điều kiện "numericAmount === 0" để cho phép hiển thị số 0
    if (isNaN(numericAmount) || amount === null || amount === undefined) {
        return '0 ₫'; 
    }
    
    // 3. Xử lý dấu âm
    const sign = numericAmount < 0 ? '-' : '';
    const absoluteAmount = Math.abs(numericAmount);
    
    // 4. Định dạng tiền tệ
    const formatted = new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND',
        minimumFractionDigits: 0,
    }).format(absoluteAmount);
    
    // Intl trả về dạng "100.000 ₫", ta ghép thêm dấu âm nếu có
    // Một số trình duyệt tự ghép dấu âm vào formatted, nhưng logic này đảm bảo an toàn
    return formatted.replace(/^₫/, '').replace(/\s?₫/, ' ₫'); // Đảm bảo format chuẩn
};

/**
 * Chuẩn hóa giá trị để hỗ trợ tìm kiếm không dấu.
 */
export const normalizeSearchableValue = (value) => {
    if (typeof value === 'boolean') {
        return value ? 'active true đang bán' : 'inactive false ngừng bán';
    }
    if (typeof value === 'number') {
        return String(value);
    }
    return String(value || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, 'd').replace(/[^\w\s]/gi, '');
};


// Các hàm tiện ích liên quan đến Vai trò (Roles)
export const getRoleName = (roleId) => {
    return Object.values(ROLES).find(r => r.id === roleId)?.name || 'Unknown';
};

export const getRoleId = (roleName) => {
    return Object.values(ROLES).find(r => r.name === roleName)?.id || 0;
};
