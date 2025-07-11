const express = require('express');
const router = express.Router();
const HealthRecord = require('../models/healthRecord');

router.post('/api/health-records', async (req, res) => {
    try {
        console.log('Gelen veri:', req.body); // Debug için

        const healthRecord = new HealthRecord(req.body);
        const savedRecord = await healthRecord.save();
        
        res.status(201).json(savedRecord);
    } catch (error) {
        console.error('Kayıt hatası:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 