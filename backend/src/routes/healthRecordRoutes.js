const express = require('express');
const router = express.Router();
const HealthRecord = require('../models/HealthRecord');

// Yeni kayıt oluştur
router.post('/', async (req, res) => {
    try {
        const record = new HealthRecord(req.body);
        await record.save();
        res.status(201).json(record);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Tüm kayıtları getir
router.get('/', async (req, res) => {
    try {
        const records = await HealthRecord.find().sort({ date: -1 });
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Son kaydı getir
router.get('/latest', async (req, res) => {
    try {
        const record = await HealthRecord.findOne().sort({ date: -1 });
        res.json(record);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 