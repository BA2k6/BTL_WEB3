import React, { useEffect, useState, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import ActionMenu from "../components/ActionMenu";
import { getOrders, getOrderById, updateOrderStatus, updatePaymentStatus, deleteOrder } from "../services/api";

export const OrdersScreen = ({ setPath, currentUserId, userRoleName }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    
    const [searchQuery, setSearchQuery] = useState("");
    const [filterChannel, setFilterChannel] = useState('all'); 

    const [orderDetails, setOrderDetails] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusUpdateData, setStatusUpdateData] = useState(null); 

    const ORDER_STATUSES = ["Đang Xử Lý", "Đang Giao", "Hoàn Thành", "Đã Hủy"];
    const PAYMENT_STATUSES = ["Chưa Thanh Toán", "Đã Thanh Toán", "Đã Hoàn Tiền"];

    const rolePermissions = {
        'Owner':        { canCreate: true, canEdit: true, canDelete: true, canUpdateStatus: true, canView: true },
        'Sales':        { canCreate: true, canEdit: true, canDelete: false, canUpdateStatus: false, canView: true },
        'Online Sales': { canCreate: true, canEdit: true, canDelete: false, canApprove: false, canUpdateStatus: true, canView: true },
        'Warehouse':    { canCreate: false, canEdit: false, canDelete: false, canApprove: false, canUpdateStatus: false, canView: true },
        'Shipper':      { canCreate: false, canEdit: false, canDelete: false, canApprove: false, canUpdateStatus: true, canView: true },
    };
    const currentPermissions = rolePermissions[userRoleName] || { canCreate: false, canEdit: false, canDelete: false, canApprove: false, canUpdateStatus: false, canView: false };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await getOrders(); 
            setOrders(data);
        } catch (err) {
            console.error("Error loading orders:", err);
            alert("Lỗi tải danh sách đơn hàng: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const openStatusModal = (orderId, currentValue, statusType) => {
        if (!currentPermissions.canUpdateStatus) {
            return alert("Bạn không có quyền cập nhật trạng thái.");
        }
        
        const options = statusType === 'order' ? ORDER_STATUSES : PAYMENT_STATUSES;
        setStatusUpdateData({ orderId, currentValue, statusType, options });
        setShowStatusModal(true);
    };

    const handleModalStatusConfirm = async (newStatus) => {
        if (!statusUpdateData || newStatus === statusUpdateData.currentValue) {
            setShowStatusModal(false);
            return;
        }

        const isOrderUpdate = statusUpdateData.statusType === 'order';
        const updateFunction = isOrderUpdate ? updateOrderStatus : updatePaymentStatus;
        const payload = newStatus;

        try {
            await updateFunction(statusUpdateData.orderId, payload);
            
            alert(`Cập nhật trạng thái ${isOrderUpdate ? 'ĐƠN HÀNG' : 'THANH TOÁN'} thành công: ${newStatus}!`);
            setShowStatusModal(false);
            setRefreshTrigger(prev => prev + 1);
        } catch (err) {
            alert("Lỗi cập nhật trạng thái: " + err.message);
            setShowStatusModal(false);
        }
    };

    const handleUpdateStatusClick = (orderId, currentStatus) => {
        openStatusModal(orderId, currentStatus, 'order');
    };

    const handlePaymentStatusClick = (orderId, currentPaymentStatus) => {
        openStatusModal(orderId, currentPaymentStatus, 'payment');
    };


    const handleViewDetails = async (orderId) => {
        try {
            const data = await getOrderById(orderId);
            console.log('[OrdersScreen] getOrderById response:', data);
            if (!data) throw new Error('Không nhận được dữ liệu chi tiết đơn hàng từ server.');

            // Bảo vệ: đảm bảo items luôn là mảng để tránh lỗi khi render
            if (!data.items) {
                data.items = [];
            } else if (!Array.isArray(data.items)) {
                data.items = [data.items];
            }

            setOrderDetails(data);
            setShowDetails(true);
        } catch (err) {
            console.error('Lỗi tải chi tiết đơn hàng:', err);
            const message = err?.message || err?.response?.data?.message || JSON.stringify(err);
            alert("Lỗi tải chi tiết đơn hàng: " + message);
        }
    };
    
    const handleEdit = (orderId) => { 
        // ĐIỂM SỬA 1: Kiểm tra an toàn trước khi điều hướng
        if (typeof setPath === 'function') {
            setPath(`/orders/${orderId}/edit`);
        } else { console.error("Lỗi điều hướng: setPath không phải là hàm hoặc không được truyền."); }
    };
    
    const handleDelete = async (orderId) => {
        if (!currentPermissions.canDelete && userRoleName !== 'Owner') return alert("Bạn không có quyền xóa đơn hàng này.");
        if (!window.confirm(`Bạn chắc chắn muốn xóa đơn hàng ${orderId}? Hành động này sẽ hoàn lại tồn kho.`)) return;

        try {
            await deleteOrder(orderId);
            alert("Đã xóa đơn hàng thành công!");
            setRefreshTrigger(prev => prev + 1);
        } catch (err) {
            alert("Lỗi xóa đơn hàng: " + err.message);
        }
    };
    
    const filteredOrders = useMemo(() => {
        let list = orders;
        const query = searchQuery.toLowerCase();
        if (filterChannel !== 'all') {
            list = list.filter(o => o.orderChannel === filterChannel);
        }
        if (query) {
            list = list.filter(o => 
                o.id.toLowerCase().includes(query) ||
                (o.customerName && o.customerName.toLowerCase().includes(query))
            );
        }
        return list;
    }, [orders, searchQuery, filterChannel]);

    useEffect(() => {
        fetchOrders();
    }, [refreshTrigger]);

    if (loading)
        return (
            <p className="p-6 text-center text-xl">Đang tải đơn hàng...</p>
        );

    return (
        <div className="space-y-6 p-4 md:p-6">
            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Quản lý Đơn hàng</h1>
                    <p className="text-sm text-gray-600 mt-1">Vai trò: <span className="font-semibold">{userRoleName}</span></p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setRefreshTrigger(prev => prev + 1)}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-700"
                    >
                        🔄 Làm mới
                    </button>
                    {currentPermissions.canCreate && (
                        <button
                            onClick={() => {
                                // ĐIỂM SỬA 2: Kiểm tra an toàn trước khi điều hướng
                                if (typeof setPath === 'function') {
                                    setPath("/orders/create");
                                } else {
                                    console.error("Lỗi điều hướng: setPath không phải là hàm.");
                                }
                            }}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Tạo đơn hàng
                        </button>
                    )}
                </div>
            </div>

            {/* BỘ LỌC VÀ TÌM KIẾM (Giữ nguyên) */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Tìm theo Mã đơn, Tên khách hàng..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                
                <select
                    value={filterChannel}
                    onChange={(e) => setFilterChannel(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg w-full md:w-48"
                >
                    <option value="all">-- Tất cả Kênh bán hàng --</option>
                    <option value="Trực tiếp">Trực tiếp</option>
                    <option value="Online">Online</option>
                </select>
            </div>


            {/* TABLE (Giữ nguyên) */}
            <div className="bg-white p-4 rounded-xl shadow-md overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left font-medium">Mã đơn</th>
                            <th className="px-6 py-3 text-left font-medium">Khách hàng</th>
                            <th className="px-6 py-3 text-left font-medium">Kênh bán</th>
                            <th className="px-6 py-3 text-left font-medium">Ngày đặt</th>
                            <th className="px-6 py-3 text-left font-medium">Tổng thanh toán</th> 
                            <th className="px-6 py-3 text-left font-medium">TT Đơn hàng</th>
                            <th className="px-6 py-3 text-left font-medium">TT Thanh toán</th>
                            <th className="px-6 py-3 text-right font-medium">Hành động</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {filteredOrders.map((o) => {
                            const isOwner = userRoleName === 'Owner';
                            const showEditDelete = (o.status === 'Đang Xử Lý') || (isOwner && o.status !== 'Đã Hủy');
                            
                            return (
                            <tr key={o.id} className="hover:bg-gray-50">

                                {/* Dữ liệu cột (Giữ nguyên) */}
                                <td className="px-6 py-4 text-blue-600 font-semibold">{o.id}</td>
                                <td className="px-6 py-4">{o.customerName}</td>
                                <td className="px-6 py-4">{/* Kênh bán */}
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${o.orderChannel === 'Online' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-200 text-gray-800'}`}>
                                        {o.orderChannel}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm">{o.orderDate ? new Date(o.orderDate).toLocaleDateString('vi-VN') : 'N/A'}</td>
                                <td className="px-6 py-4 font-semibold">{Number(o.totalAmount).toLocaleString()} đ</td>
                                
                                {/* CỘT TRẠNG THÁI ĐƠN HÀNG (CLICKABLE) */}
                                <td 
                                    className="px-6 py-4 cursor-pointer"
                                    onClick={() => handleUpdateStatusClick(o.id, o.status)}
                                >
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                        o.status === 'Hoàn Thành' ? 'bg-green-100 text-green-800' :
                                        o.status === 'Đang Giao' ? 'bg-blue-100 text-blue-800' :
                                        o.status === 'Đang Xử Lý' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {o.status}
                                    </span>
                                </td>
                                
                                {/* CỘT TRẠNG THÁI THANH TOÁN (CLICKABLE) */}
                                <td 
                                    className="px-6 py-4 cursor-pointer"
                                    onClick={() => handlePaymentStatusClick(o.id, o.paymentStatus)}
                                >
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        o.paymentStatus === 'Đã Thanh Toán' ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-700'
                                    }`}>
                                        {o.paymentStatus}
                                    </span>
                                </td>

                                {/* Nút hành động: gom các hành động vào menu để gọn giao diện */}
                                <td className="px-6 py-4 text-right text-sm font-medium">
                                    <ActionMenu
                                        buttonLabel={"⋯"}
                                        items={[
                                            { label: 'Xem chi tiết', onClick: () => handleViewDetails(o.id) },
                                            ...(currentPermissions.canEdit && showEditDelete ? [{ label: 'Sửa', onClick: () => handleEdit(o.id) }] : []),
                                            ...(currentPermissions.canUpdateStatus && o.status !== 'Hoàn Thành' && o.status !== 'Đã Hủy' ? [{ label: 'Cập nhật trạng thái', onClick: () => handleUpdateStatusClick(o.id, o.status) }] : []),
                                            ...(currentPermissions.canDelete && showEditDelete ? [{ label: 'Xóa', onClick: () => handleDelete(o.id), danger: true }] : []),
                                        ]}
                                    />
                                </td>

                            </tr>
                            );
                        })}
                    </tbody>
                </table>

                {filteredOrders.length === 0 && (
                    <p className="text-center py-4 text-gray-500">
                        Không tìm thấy đơn hàng nào khớp với tiêu chí lọc.
                    </p>
                )}
            </div>

            {/* MODAL CẬP NHẬT TRẠNG THÁI (Giữ nguyên) */}
            {showStatusModal && statusUpdateData && (
                <StatusUpdateModal 
                    data={statusUpdateData} 
                    onConfirm={handleModalStatusConfirm} 
                    onClose={() => setShowStatusModal(false)}
                />
            )}
            
            {/* ORDER DETAILS MODAL (Giữ nguyên) */}
            {showDetails && orderDetails && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-3xl overflow-y-auto max-h-[90vh]">
                        <h3 className="text-2xl font-bold mb-4">Chi tiết Đơn hàng {orderDetails.id}</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="bg-gray-50 p-4 rounded">
                                <h4 className="font-semibold mb-2">Khách hàng</h4>
                                <p className="text-sm"><strong>{orderDetails.customerName || 'Khách lẻ'}</strong></p>
                                <p className="text-sm text-gray-600">SĐT: {orderDetails.phone || 'N/A'}</p>
                                <p className="text-sm text-gray-600">Địa chỉ: {orderDetails.address || 'N/A'}</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded">
                                <h4 className="font-semibold mb-2">Thông tin đơn</h4>
                                <p className="text-sm">Kênh: <span className="font-semibold">{orderDetails.order_channel || orderDetails.orderChannel || 'N/A'}</span></p>
                                <p className="text-sm">Ngày đặt: <span className="font-semibold">{orderDetails.orderDate || 'N/A'}</span></p>
                                <p className="text-sm">Trạng thái đơn: <span className="font-semibold">{orderDetails.status || 'N/A'}</span></p>
                                <p className="text-sm">Trạng thái thanh toán: <span className="font-semibold">{orderDetails.payment_status || orderDetails.paymentStatus || 'N/A'}</span></p>
                                <p className="text-sm">Phương thức thanh toán: <span className="font-semibold">{orderDetails.payment_method || orderDetails.paymentMethod || 'N/A'}</span></p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="p-4 bg-white rounded border">
                                <p className="text-sm text-gray-600">Tổng tiền hàng (Subtotal)</p>
                                <p className="font-semibold">{(orderDetails.items ? orderDetails.items.reduce((acc, it) => {
                                    const qty = parseFloat(it.quantity) || 0;
                                    const price = parseFloat(it.price_at_order) || 0;
                                    const itemTotal = it.itemTotal ? parseFloat(it.itemTotal) : qty * price;
                                    return acc + itemTotal;
                                }, 0) : 0).toLocaleString('vi-VN')} đ</p>
                            </div>
                            <div className="p-4 bg-white rounded border">
                                <p className="text-sm text-gray-600">Phí giao hàng</p>
                                <p className="font-semibold">{(parseFloat(orderDetails.shipping_cost || orderDetails.shippingCost || 0)).toLocaleString('vi-VN')} đ</p>
                            </div>
                            <div className="p-4 bg-white rounded border">
                                <p className="text-sm text-gray-600">Tổng thanh toán</p>
                                <p className="font-semibold text-red-600">{(parseFloat(orderDetails.totalAmount || orderDetails.finalTotal || 0)).toLocaleString('vi-VN')} đ</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded mb-4">
                            <h4 className="font-semibold mb-2">Nhân viên</h4>
                            <p className="text-sm">Người tạo: <span className="font-semibold">{orderDetails.staffName || orderDetails.employeeName || orderDetails.staff_id || 'N/A'}</span></p>
                            <p className="text-sm">Người giao: <span className="font-semibold">{orderDetails.deliveryStaffName || orderDetails.delivery_staff_id || 'N/A'}</span></p>
                        </div>

                        <h4 className="text-xl font-semibold mt-2 mb-2">Sản phẩm</h4>
                        <div className="overflow-auto max-h-60 border rounded">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-white">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-sm font-medium">Sản phẩm</th>
                                        <th className="px-4 py-2 text-sm text-left">Biến thể</th>
                                        <th className="px-4 py-2 text-right text-sm">SL</th>
                                        <th className="px-4 py-2 text-right text-sm">Giá</th>
                                        <th className="px-4 py-2 text-right text-sm">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {orderDetails.items && orderDetails.items.length > 0 ? orderDetails.items.map((item, idx) => {
                                        const qty = parseFloat(item.quantity) || 0;
                                        const price = parseFloat(item.price_at_order) || 0;
                                        const itemTotal = item.itemTotal ? parseFloat(item.itemTotal) : qty * price;
                                        return (
                                            <tr key={idx}>
                                                <td className="px-4 py-2 text-sm">{item.product_name || 'N/A'}</td>
                                                <td className="px-4 py-2 text-sm">{item.color || '-'} / {item.size || '-'}</td>
                                                <td className="px-4 py-2 text-right text-sm">{qty}</td>
                                                <td className="px-4 py-2 text-right text-sm">{price.toLocaleString('vi-VN')} đ</td>
                                                <td className="px-4 py-2 text-right text-sm">{itemTotal.toLocaleString('vi-VN')} đ</td>
                                            </tr>
                                        );
                                    }) : <tr><td colSpan="5" className="px-4 py-2 text-center text-sm text-gray-500">Không có sản phẩm nào</td></tr>}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end mt-6">
                            <button onClick={() => setShowDetails(false)} className="px-4 py-2 bg-gray-600 text-white rounded-lg">Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ... (StatusUpdateModal component giữ nguyên)

const StatusUpdateModal = ({ data, onConfirm, onClose }) => {
    const [selectedStatus, setSelectedStatus] = useState(data.currentValue);
    const title = data.statusType === 'order' ? 'ĐƠN HÀNG' : 'THANH TOÁN';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-sm">
                <h3 className="text-xl font-bold mb-4">Cập nhật trạng thái {title}</h3>
                <p className="mb-2 text-sm text-gray-600">Đơn hàng: **{data.orderId}**</p>
                
                <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg mb-4 text-base"
                >
                    {data.options.map(status => (
                        <option key={status} value={status}>
                            {status} {status === data.currentValue ? '(Hiện tại)' : ''}
                        </option>
                    ))}
                </select>

                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Hủy</button>
                    <button 
                        onClick={() => onConfirm(selectedStatus)} 
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                        disabled={selectedStatus === data.currentValue}
                    >
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
    );
};