async function searchFood() {
    const searchTerm = document.getElementById('foodInput').value;
    if (!searchTerm) return;

    try {
        const response = await fetch(`${API_URL}/foods/search?api_key=${API_KEY}&query=${searchTerm}`);
        const data = await response.json();
        
        displayResults(data.foods);
    } catch (error) {
        console.error('Hata:', error);
        alert('Yemek arama sırasında bir hata oluştu.');
    }
}

function displayResults(foods) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    foods.slice(0, 5).forEach(food => {
        const foodDiv = document.createElement('div');
        foodDiv.className = 'food-item';
        foodDiv.onclick = () => showNutritionInfo(food);
        foodDiv.innerHTML = `
            <h3>${food.description}</h3>
            <p>Marka: ${food.brandOwner || 'Belirtilmemiş'}</p>
        `;
        resultsDiv.appendChild(foodDiv);
    });
}

function showNutritionInfo(food) {
    const nutritionDiv = document.getElementById('nutritionInfo');
    
    const nutrients = {
        kalori: food.foodNutrients.find(n => n.nutrientId === 1008)?.value || 0,
        protein: food.foodNutrients.find(n => n.nutrientId === 1003)?.value || 0,
        karbonhidrat: food.foodNutrients.find(n => n.nutrientId === 1005)?.value || 0,
        yag: food.foodNutrients.find(n => n.nutrientId === 1004)?.value || 0
    };

    nutritionDiv.innerHTML = `
        <h2>Besin Değerleri (100g)</h2>
        <p>Kalori: ${nutrients.kalori.toFixed(1)} kcal</p>
        <p>Protein: ${nutrients.protein.toFixed(1)} g</p>
        <p>Karbonhidrat: ${nutrients.karbonhidrat.toFixed(1)} g</p>
        <p>Yağ: ${nutrients.yag.toFixed(1)} g</p>
    `;
}

function addNewFoodEntry() {
    const foodList = document.getElementById('foodList');
    const foodEntry = document.createElement('div');
    foodEntry.className = 'food-entry';
    foodEntry.innerHTML = `
        <input type="text" class="food-input" placeholder="Yemek adını giriniz...">
        <input type="number" class="portion-input" placeholder="Gram" value="100">
        <button class="remove-food" onclick="removeFoodEntry(this)">X</button>
    `;
    foodList.appendChild(foodEntry);
}

function removeFoodEntry(button) {
    button.parentElement.remove();
}

async function calculateTotal() {
    const foodEntries = document.querySelectorAll('.food-entry');
    const totalNutrients = {
        kalori: 0,
        protein: 0,
        karbonhidrat: 0,
        yag: 0
    };

    for (const entry of foodEntries) {
        const searchTerm = entry.querySelector('.food-input').value;
        const portion = parseFloat(entry.querySelector('.portion-input').value) || 100;
        
        if (!searchTerm) continue;

        try {
            const response = await fetch(`${API_URL}/foods/search?api_key=${API_KEY}&query=${searchTerm}`);
            const data = await response.json();
            
            if (data.foods && data.foods.length > 0) {
                const food = data.foods[0];
                const multiplier = portion / 100; // 100g baz alındığı için

                totalNutrients.kalori += (food.foodNutrients.find(n => n.nutrientId === 1008)?.value || 0) * multiplier;
                totalNutrients.protein += (food.foodNutrients.find(n => n.nutrientId === 1003)?.value || 0) * multiplier;
                totalNutrients.karbonhidrat += (food.foodNutrients.find(n => n.nutrientId === 1005)?.value || 0) * multiplier;
                totalNutrients.yag += (food.foodNutrients.find(n => n.nutrientId === 1004)?.value || 0) * multiplier;
            }
        } catch (error) {
            console.error('Hata:', error);
        }
    }

    displayTotalNutrition(totalNutrients);
}

function displayTotalNutrition(nutrients) {
    const nutritionDiv = document.getElementById('totalNutrition');
    nutritionDiv.innerHTML = `
        <h2>Toplam Besin Değerleri</h2>
        <p>Toplam Kalori: ${nutrients.kalori.toFixed(1)} kcal</p>
        <p>Toplam Protein: ${nutrients.protein.toFixed(1)} g</p>
        <p>Toplam Karbonhidrat: ${nutrients.karbonhidrat.toFixed(1)} g</p>
        <p>Toplam Yağ: ${nutrients.yag.toFixed(1)} g</p>
    `;
} 