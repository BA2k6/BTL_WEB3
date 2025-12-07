// C:\Users\Admin\Downloads\DUANWEB(1)\client\src\components\UnauthorizedScreen.js

import React from 'react';
import { ShieldOff } from 'lucide-react';
import { roleToRoutes } from '../utils/constants'; // <-- Dùng để xác định trang mặc định

export const UnauthorizedScreen = ({ setPath }) => (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-lg m-6">
        <ShieldOff className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-4xl font-bold text-red-600 mb-2">403 - TRUY CẬP BỊ TỪ CHỐI</h1>
        <p className="text-lg text-gray-600 mb-6">
            Vai trò của bạn (
            {/* Lấy vai trò đã lưu trong localStorage */}
            <span className="font-semibold text-red-600">{localStorage.getItem('user_role_name')}</span>) 
            không có quyền truy cập trang này.
        </p>
        <button
            onClick={() => {
                // Lấy vai trò hiện tại
                const role = localStorage.getItem('user_role_name');
                // Xác định đường dẫn mặc định cho vai trò đó (từ constants)
                const defaultPath = roleToRoutes[role]?.[0]?.path || '/products';
                setPath(defaultPath); // Chuyển hướng
            }}
            className="bg-blue-100 hover:bg-blue-300 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-200"
        >
            Về trang chính
        </button>
    </div>
);