const express = require('express');
const router = express.Router();
const USDA_API_KEY = process.env.USDA_API_KEY;

router.get('/api/food/search', async (req, res) => {
    const { query } = req.query;
    try {
        const response = await fetch(
            `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${USDA_API_KEY}&query=${query}&pageSize=25&dataType=Survey (FNDDS)&sortBy=dataType.keyword&sortOrder=asc`
        );
        const data = await response.json();
        
        // Sadece gerekli bilgileri döndür
        const simplifiedData = data.foods.map(food => ({
            fdcId: food.fdcId,
            description: food.description,
            calories: food.foodNutrients.find(n => n.nutrientName === 'Energy')?.value || 0,
            protein: food.foodNutrients.find(n => n.nutrientName === 'Protein')?.value || 0,
            carbs: food.foodNutrients.find(n => n.nutrientName === 'Carbohydrate, by difference')?.value || 0,
            fat: food.foodNutrients.find(n => n.nutrientName === 'Total lipid (fat)')?.value || 0
        }));

        res.json(simplifiedData);
    } catch (error) {
        console.error('USDA API hatası:', error);
        res.status(500).json({ error: 'Besin bilgisi alınamadı' });
    }
});

module.exports = router; 