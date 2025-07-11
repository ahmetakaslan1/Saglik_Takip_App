const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    age: Number,
    gender: {
        type: String,
        enum: ['male', 'female']
    },
    height: Number,
    weight: Number,
    activityLevel: Number,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Şifreleme kısmını kaldırdık çünkü şu an ihtiyacımız yok
// userSchema.pre('save', async function(next) {
//     if (!this.isModified('password')) return next();
//     this.password = await bcrypt.hash(this.password, 10);
//     next();
// });

module.exports = mongoose.model('User', userSchema); 