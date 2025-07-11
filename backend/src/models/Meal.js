const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    foods: [{
        name: String,
        portion: Number,
        calories: Number,
        protein: Number,
        carbs: Number,
        fat: Number
    }],
    totalCalories: Number,
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Meal', mealSchema); 