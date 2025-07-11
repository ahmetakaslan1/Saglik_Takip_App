const express = require('express');
const router = express.Router();

router.get('/api/translate', async (req, res) => {
    const { text, from, to } = req.query;
    try {
        const response = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`
        );
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Çeviri yapılamadı' });
    }
});

module.exports = router; 