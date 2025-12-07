// /server/routes/dashboardRoutes.js

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// 1. GET /api/dashboard/summary?year=... (Cho Biểu đồ và Bảng)
router.get('/summary', dashboardController.getDashboardData); 

// 2. GET /api/dashboard/current-stats (Cho Stat Cards)
router.get('/current-stats', dashboardController.getCurrentStats); 

module.exports = router;