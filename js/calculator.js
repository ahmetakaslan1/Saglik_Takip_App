class Calculator {
    constructor(profile) {
        this.profile = profile;
    }

    calculateBMI() {
        const heightInMeters = this.profile.height / 100;
        const bmi = this.profile.weight / (heightInMeters * heightInMeters);
        
        let category;
        if (bmi < 18.5) category = 'Zayıf';
        else if (bmi < 25) category = 'Normal';
        else if (bmi < 30) category = 'Fazla Kilolu';
        else category = 'Obez';

        return {
            bmi: bmi.toFixed(1),
            category: category
        };
    }

    calculateBMR() {
        let bmr;
        if (this.profile.gender === 'male') {
            // Erkekler için Harris-Benedict Formülü
            bmr = 88.36 + 
                  (13.4 * this.profile.weight) + 
                  (4.8 * this.profile.height) - 
                  (5.7 * this.profile.age);
        } else {
            // Kadınlar için Harris-Benedict Formülü
            bmr = 447.6 + 
                  (9.2 * this.profile.weight) + 
                  (3.1 * this.profile.height) - 
                  (4.3 * this.profile.age);
        }

        // Günlük kalori ihtiyacı (TDEE)
        const tdee = bmr * this.profile.activityLevel;

        return {
            bmr: Math.round(bmr),
            dailyCalories: Math.round(tdee)
        };
    }

    getActivityLevelDescription() {
        const levels = {
            '1.2': 'Hareketsiz',
            '1.375': 'Az Hareketli',
            '1.55': 'Orta Aktif',
            '1.725': 'Çok Aktif',
            '1.9': 'Aşırı Aktif'
        };
        return levels[this.profile.activityLevel] || 'Bilinmiyor';
    }
}

// Yemek ekleme fonksiyonu
function addNewFoodEntry() {
    const foodList = document.getElementById('foodList');
    const foodEntry = document.createElement('div');
    foodEntry.className = 'food-entry';
    
    foodEntry.innerHTML = `
        <div class="input-group">
            <input type="text" class="food-input" placeholder="Yemek adını giriniz...">
            <input type="number" class="portion-input" placeholder="Gram" value="100">
            <button class="remove-food" onclick="removeFoodEntry(this)">×</button>
        </div>
    `;
    
    foodList.appendChild(foodEntry);

    // Animasyon efekti
    foodEntry.style.opacity = '0';
    foodEntry.style.transform = 'translateX(-20px)';
    setTimeout(() => {
        foodEntry.style.transition = 'all 0.3s ease';
        foodEntry.style.opacity = '1';
        foodEntry.style.transform = 'translateX(0)';
    }, 10);
}

// Yemek silme fonksiyonu
function removeFoodEntry(button) {
    const foodEntry = button.closest('.food-entry');
    
    // Silme animasyonu
    foodEntry.style.transition = 'all 0.3s ease';
    foodEntry.style.opacity = '0';
    foodEntry.style.transform = 'translateX(20px)';
    
    setTimeout(() => {
        foodEntry.remove();
    }, 300);
}

// Türkçe-İngilizce çeviri sözlüğü
const translations = {
    'elma': 'apple',
    'muz': 'banana',
    'ekmek': 'bread',
    'tavuk': 'chicken',
    'pilav': 'rice',
    'makarna': 'pasta',
    'süt': 'milk',
    'yumurta': 'egg',
    'peynir': 'cheese',
    // ... daha fazla çeviri eklenebilir
};

// Dil seçimi işlemi
let currentLanguage = 'tr';

document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Aktif butonu güncelle
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Dili güncelle
        currentLanguage = btn.dataset.lang;
    });
});

// Google Translate API fonksiyonu
async function translateToEnglish(text) {
    try {
        // MyMemory API - Ücretsiz
        const response = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=tr|en`
        );
        const data = await response.json();
        return data.responseData.translatedText;
    } catch (error) {
        console.error('Çeviri hatası:', error);
        return null;
    }
}

// API anahtarını doğrudan tanımla
const API_KEY = 'BPKplxXhb2txHBOjcmYtG3yRdPzlgekVIKS229XR';

// Besin değerlerini alma fonksiyonunu güncelle
async function getFoodNutrients(foodName, portion) {
    try {
        let searchTerm = foodName.toLowerCase();

        // Eğer Türkçe seçiliyse ve kelime İngilizce değilse çevir
        if (currentLanguage === 'tr') {
            // Önce yerel sözlüğe bak
            if (translations[searchTerm]) {
                searchTerm = translations[searchTerm];
            } else {
                // Yerel sözlükte yoksa çeviri API'sini kullan
                const translatedTerm = await translateToEnglish(searchTerm);
                if (translatedTerm) {
                    searchTerm = translatedTerm.toLowerCase();
                }
            }
        }

        // Önce varsayılan değerlere bak
        const defaultValues = getDefaultNutrients(searchTerm);
        if (defaultValues) {
            return {
                calories: parseFloat((defaultValues.calories * (portion / 100)).toFixed(1)),
                protein: parseFloat((defaultValues.protein * (portion / 100)).toFixed(1)),
                carbs: parseFloat((defaultValues.carbs * (portion / 100)).toFixed(1)),
                fat: parseFloat((defaultValues.fat * (portion / 100)).toFixed(1))
            };
        }

        // API'ye istek at
        const API_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search';
        const response = await fetch(
            `${API_URL}?api_key=${API_KEY}&query=${encodeURIComponent(searchTerm)}`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error('API yanıt vermedi');
        }

        const data = await response.json();

        if (!data.foods || data.foods.length === 0) {
            throw new Error(`"${foodName}" için besin değeri bulunamadı`);
        }

        const food = data.foods[0];
        const nutrients = food.foodNutrients;

        // Besin değerlerini bul
        const calories = nutrients.find(n => n.nutrientId === 1008)?.value || 0;
        const protein = nutrients.find(n => n.nutrientId === 1003)?.value || 0;
        const fat = nutrients.find(n => n.nutrientId === 1004)?.value || 0;
        const carbs = nutrients.find(n => n.nutrientId === 1005)?.value || 0;

        // Porsiyon miktarına göre hesapla
        const multiplier = portion / 100;
        return {
            calories: parseFloat((calories * multiplier).toFixed(1)),
            protein: parseFloat((protein * multiplier).toFixed(1)),
            carbs: parseFloat((carbs * multiplier).toFixed(1)),
            fat: parseFloat((fat * multiplier).toFixed(1))
        };

    } catch (error) {
        console.error('Besin değerleri alınırken hata:', error);
        
        // Varsayılan değerleri dene
        const defaultValues = getDefaultNutrients(foodName.toLowerCase());
        if (defaultValues) {
            return {
                calories: parseFloat((defaultValues.calories * (portion / 100)).toFixed(1)),
                protein: parseFloat((defaultValues.protein * (portion / 100)).toFixed(1)),
                carbs: parseFloat((defaultValues.carbs * (portion / 100)).toFixed(1)),
                fat: parseFloat((defaultValues.fat * (portion / 100)).toFixed(1))
            };
        }
        
        throw new Error(`${foodName} için besin değerleri bulunamadı`);
    }
}

// Yaygın yemekler için varsayılan değerler (Türkçe isimlerle)
function getDefaultNutrients(foodName) {
    const defaultFoods = {
        'elma': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
        'muz': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
        'ekmek': { calories: 265, protein: 9, carbs: 49, fat: 3.2 },
        'tavuk': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
        'pilav': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
        'makarna': { calories: 158, protein: 5.8, carbs: 31, fat: 0.9 },
        'süt': { calories: 42, protein: 3.4, carbs: 5, fat: 1 },
        'yumurta': { calories: 155, protein: 13, carbs: 1.1, fat: 11 },
        'peynir': { calories: 264, protein: 17, carbs: 1.3, fat: 21 },
        // İngilizce karşılıklar
        'apple': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
        'banana': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
        'bread': { calories: 265, protein: 9, carbs: 49, fat: 3.2 },
        'chicken': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
        'rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
        'pasta': { calories: 158, protein: 5.8, carbs: 31, fat: 0.9 },
        'milk': { calories: 42, protein: 3.4, carbs: 5, fat: 1 },
        'egg': { calories: 155, protein: 13, carbs: 1.1, fat: 11 },
        'cheese': { calories: 264, protein: 17, carbs: 1.3, fat: 21 }
    };

    return defaultFoods[foodName];
}

// Hesaplama fonksiyonu
async function calculateTotal() {
    const foodEntries = document.querySelectorAll('.food-entry');
    const nutritionSummary = document.getElementById('nutritionSummary');
    
    // Loading spinner göster
    nutritionSummary.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Besin değerleri hesaplanıyor...</p>
        </div>
    `;

    let totalNutrients = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
    };

    let meals = [];
    let hasError = false;

    try {
        for (const entry of foodEntries) {
            const foodName = entry.querySelector('.food-input').value;
            const portion = parseFloat(entry.querySelector('.portion-input').value) || 100;
            
            if (!foodName) continue;

            try {
                const nutrients = await getFoodNutrients(foodName, portion);
                totalNutrients.calories += nutrients.calories;
                totalNutrients.protein += nutrients.protein;
                totalNutrients.carbs += nutrients.carbs;
                totalNutrients.fat += nutrients.fat;

                // Başarılı işlem göstergesi
                entry.style.borderLeft = '4px solid #2ecc71';

                // Meal'i diziye ekle
                meals.push({
                    name: foodName,
                    portion: portion,
                    ...nutrients
                });

            } catch (error) {
                hasError = true;
                entry.style.borderLeft = '4px solid #e74c3c';
                console.error(`${foodName} için hata:`, error);
            }
        }

        // Besin değerlerini göster
        nutritionSummary.innerHTML = `
            <h3>Toplam Besin Değerleri</h3>
            <div class="nutrient-grid">
                <div class="nutrient-item">
                    <span class="nutrient-label">Kalori</span>
                    <span class="nutrient-value">${totalNutrients.calories.toFixed(1)} kcal</span>
                </div>
                <div class="nutrient-item">
                    <span class="nutrient-label">Protein</span>
                    <span class="nutrient-value">${totalNutrients.protein.toFixed(1)} g</span>
                </div>
                <div class="nutrient-item">
                    <span class="nutrient-label">Karbonhidrat</span>
                    <span class="nutrient-value">${totalNutrients.carbs.toFixed(1)} g</span>
                </div>
                <div class="nutrient-item">
                    <span class="nutrient-label">Yağ</span>
                    <span class="nutrient-value">${totalNutrients.fat.toFixed(1)} g</span>
                </div>
            </div>
        `;

        // Hesaplanan verileri localStorage'a kaydet
        const calculatorData = {
            meals: meals.map(meal => ({
                name: meal.name,
                portion: meal.portion,
                calories: meal.calories,
                protein: meal.protein,
                carbs: meal.carbs,
                fat: meal.fat
            })),
            totalNutrients: totalNutrients
        };
        
        localStorage.setItem('calculatorData', JSON.stringify(calculatorData));

        // Profil verilerini al ve metrikleri güncelle
        const db = new Database();
        const profile = await db.getProfile();
        if (profile) {
            updateProfileMetrics(profile);
        }

        // Besin özetini göster
        displayNutritionSummary(totalNutrients);

    } catch (error) {
        nutritionSummary.innerHTML = `
            <div class="error-message">
                <span class="error-icon">❌</span>
                <p>Hata oluştu</p>
                <p class="error-details">${error.message}</p>
            </div>
        `;
    }
}

// Sayfa yüklendiğinde çalışacak kod
document.addEventListener('DOMContentLoaded', () => {
    // LocalStorage'dan profil verilerini al
    const profileData = JSON.parse(localStorage.getItem('userProfile'));
    
    if (!profileData) {
        window.location.href = 'profile.html';
        return;
    }

    // Profil verilerini kullanarak hesaplamaları yap
    updateProfileMetrics(profileData);

    // Varsa önceki besin verilerini göster
    const calculatorData = JSON.parse(localStorage.getItem('calculatorData') || '{}');
    if (calculatorData.meals && calculatorData.meals.length > 0) {
        displayNutritionSummary(calculatorData.totalNutrients);
    }
});

// Profil metriklerini hesaplama ve gösterme fonksiyonu
function updateProfileMetrics(profileData) {
    if (!profileData) return;

    // Calculator sınıfını kullanarak hesaplamalar yap
    const calculator = new Calculator(profileData);
    const bmi = calculator.calculateBMI();
    const metabolicRates = calculator.calculateBMR();

    // BMI değerlerini güncelle
    const bmiValueEl = document.getElementById('bmiValue');
    const bmiCategoryEl = document.getElementById('bmiCategory');
    if (bmiValueEl) bmiValueEl.textContent = `${bmi.bmi} kg/m²`;
    if (bmiCategoryEl) bmiCategoryEl.textContent = bmi.category;

    // BMR ve günlük kalori ihtiyacını güncelle
    const bmrValueEl = document.getElementById('bmrValue');
    const dailyCaloriesEl = document.getElementById('dailyCalories');
    if (bmrValueEl) bmrValueEl.textContent = `${metabolicRates.bmr} kcal`;
    if (dailyCaloriesEl) dailyCaloriesEl.textContent = `${metabolicRates.dailyCalories} kcal`;
}

// Besin değerlerini gösterme fonksiyonu
function displayNutritionSummary(totalNutrients) {
    const nutritionSummary = document.getElementById('nutritionSummary');
    if (nutritionSummary && totalNutrients) {
        nutritionSummary.innerHTML = `
            <h3>Toplam Besin Değerleri</h3>
            <div class="nutrient-grid">
                <div class="nutrient-item">
                    <span class="nutrient-label">Kalori</span>
                    <span class="nutrient-value">${totalNutrients.calories.toFixed(1)} kcal</span>
                </div>
                <div class="nutrient-item">
                    <span class="nutrient-label">Protein</span>
                    <span class="nutrient-value">${totalNutrients.protein.toFixed(1)} g</span>
                </div>
                <div class="nutrient-item">
                    <span class="nutrient-label">Karbonhidrat</span>
                    <span class="nutrient-value">${totalNutrients.carbs.toFixed(1)} g</span>
                </div>
                <div class="nutrient-item">
                    <span class="nutrient-label">Yağ</span>
                    <span class="nutrient-value">${totalNutrients.fat.toFixed(1)} g</span>
                </div>
            </div>
        `;
    }
} 