const Profile = require('../models/Profile');

exports.createProfile = async (req, res) => {
    try {
        const profile = new Profile({
            userId: req.user.id, // JWT'den gelen kullanıcı ID'si
            ...req.body
        });
        await profile.save();
        res.status(201).json(profile);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const profile = await Profile.findOne({ userId: req.user.id });
        if (!profile) {
            return res.status(404).json({ message: 'Profil bulunamadı' });
        }
        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}; 