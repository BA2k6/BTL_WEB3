const dashboardModel = require('../models/dashboardModel');

// Hàm Helper tạo khung 12 tháng
const generate12MonthsForYear = (targetYear) => {
    const months = [];
    for (let i = 1; i <= 12; i++) {
        const month = String(i).padStart(2, '0');
        months.push(`${targetYear}-${month}`); 
    }
    return months; 
};

// Hàm Helper: Luôn lấy tháng hiện tại
const getCurrentMonthStats = (processedData) => {
    const today = new Date();
    const currentYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const currentMonthData = processedData.find(item => item.month === currentYearMonth);

    if (currentMonthData) {
        return currentMonthData;
    } 
    return { 
        month: currentYearMonth, 
        salesRevenue: 0, totalCOGS: 0, totalSalariesPaid: 0, netProfit: 0, 
        directRevenue: 0, onlineRevenue: 0, totalOrders: 0 
    };
};

const dashboardController = {
    // API 1: Lấy dữ liệu biểu đồ
    getDashboardData: async (req, res) => {
        try {
            const targetYear = parseInt(req.query.year) || new Date().getFullYear(); 
            
            const [monthlyData, salaryData, categoryData] = await Promise.all([
                dashboardModel.getMonthlySummary(targetYear), 
                dashboardModel.getMonthlySalaries(targetYear),
                dashboardModel.getRevenueByCategory(targetYear)
            ]);
            
            const full12Months = generate12MonthsForYear(targetYear);
            const dataMap = monthlyData.reduce((map, item) => { map[item.month] = item; return map; }, {});
            const salaryMap = salaryData.reduce((map, item) => { map[item.month] = item.totalSalaries; return map; }, {});

            const summary = full12Months.map(monthKey => {
                const item = dataMap[monthKey] || {}; 
                const totalSalariesPaid = parseFloat(salaryMap[monthKey] || 0);
                const salesRevenue = parseFloat(item.salesRevenue) || 0;
                const totalCOGS = parseFloat(item.totalCOGS) || 0;
                const totalOrders = parseFloat(item.totalOrders) || 0;
                
                // Lấy dữ liệu thật từ SQL
                const directRevenue = parseFloat(item.directRevenue) || 0;
                const onlineRevenue = parseFloat(item.onlineRevenue) || 0;
                
                const netProfit = salesRevenue - totalCOGS - totalSalariesPaid;
                
                return {
                    month: monthKey,
                    salesRevenue, totalCOGS, totalSalariesPaid, netProfit, 
                    directRevenue, onlineRevenue, totalOrders
                };
            });

            res.status(200).json({
                summary: summary,
                categoryData: categoryData 
            }); 

        } catch (error) {
            console.error("Dashboard controller error:", error);
            res.status(500).json({ message: 'Lỗi server', details: error.message });
        }
    },

    // API 2: Lấy chỉ số tháng hiện tại & Thông tin bổ sung (Năm, Tồn kho...)
    getCurrentStats: async (req, res) => {
        try {
            const today = new Date();
            const currentYear = today.getFullYear();
            const currentMonth = today.getMonth() + 1; 
            
            // --- CẬP NHẬT TẠI ĐÂY: Thêm dashboardModel.getTotalInventoryValue() ---
            const [monthlyData, salaryData, monthlyActiveCustomers, earliestYear, totalInventoryValue] = await Promise.all([
                dashboardModel.getMonthlySummary(currentYear), 
                dashboardModel.getMonthlySalaries(currentYear),
                dashboardModel.getCustomersByMonth(currentYear, currentMonth),
                dashboardModel.getEarliestOrderYear(),
                dashboardModel.getTotalInventoryValue() // <--- MỚI: Lấy giá trị tồn kho
            ]);
            
            const full12Months = generate12MonthsForYear(currentYear);
            const dataMap = monthlyData.reduce((map, item) => { map[item.month] = item; return map; }, {});
            const salaryMap = salaryData.reduce((map, item) => { map[item.month] = item.totalSalaries; return map; }, {});

            const summary = full12Months.map(monthKey => {
                const item = dataMap[monthKey] || {}; 
                const totalSalariesPaid = parseFloat(salaryMap[monthKey] || 0); 
                const salesRevenue = parseFloat(item.salesRevenue) || 0;
                const totalCOGS = parseFloat(item.totalCOGS) || 0;             
                
                const directRevenue = parseFloat(item.directRevenue) || 0;
                const onlineRevenue = parseFloat(item.onlineRevenue) || 0;

                const netProfit = salesRevenue - totalCOGS - totalSalariesPaid;
                const totalOrders = parseFloat(item.totalOrders) || 0;

                return { month: monthKey, salesRevenue, totalCOGS, totalSalariesPaid, netProfit, directRevenue, onlineRevenue, totalOrders };
            });

            const statsMonthData = getCurrentMonthStats(summary); 

            const statsResponse = {
                totalOrders: statsMonthData.totalOrders,
                totalCustomers: monthlyActiveCustomers, 
                directRevenue: statsMonthData.directRevenue,
                onlineRevenue: statsMonthData.onlineRevenue,
                totalRevenue: statsMonthData.salesRevenue,
                totalCOGS: statsMonthData.totalCOGS,
                totalSalariesPaid: statsMonthData.totalSalariesPaid,
                netProfit: statsMonthData.netProfit,
                earliestYear: earliestYear,
                
                // --- TRẢ VỀ CHO FRONTEND ---
                totalInventoryValue: totalInventoryValue 
            };

            res.status(200).json(statsResponse);
        } catch (error) {
            console.error("Error fetching current stats:", error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }
};

module.exports = dashboardController;