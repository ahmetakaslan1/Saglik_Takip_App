const express = require('express');
const router = express.Router();

// Backend tarafında
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

router.post('/api/health-analysis', async (req, res) => {
    try {
        const { profile, meals } = req.body;
        // OpenAI API çağrısı burada yapılır
    } catch (error) {
        console.error('Health analysis error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/api/exercise-plan', async (req, res) => {
    try {
        // ... mevcut kod ...
    } catch (error) {
        console.error('Exercise plan error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;  // Router'ı dışa aktar 