const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const aiController = require('./src/controllers/aiController');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// AI Controller'ı kullan
app.use(aiController);

// MongoDB Bağlantısı
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB bağlantısı başarılı'))
    .catch(err => console.error('MongoDB bağlantı hatası:', err));

// Controllers
const foodController = require('./src/controllers/foodController');
const translationController = require('./src/controllers/translationController');

// Routes
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/health-records', require('./src/routes/healthRecordRoutes'));
app.use('/api/health', aiController);
app.use('/api/food', foodController);
app.use('/api/translate', translationController);

// Health check endpoint
app.get('/api/health-check', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Backend is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server http://localhost:${PORT} portunda çalışıyor`);
}); 