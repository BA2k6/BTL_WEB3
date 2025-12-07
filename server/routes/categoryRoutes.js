const express = require('express');
const router = express.Router();
const db = require('../config/db.config');

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM categories");
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
module.exports = router;