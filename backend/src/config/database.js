const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/food-calculator');
        console.log('MongoDB bağlantısı başarılı');
    } catch (error) {
        console.error('MongoDB bağlantı hatası:', error);
        process.exit(1);
    }
};

module.exports = connectDB; 