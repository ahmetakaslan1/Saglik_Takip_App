class Database {
    constructor() {
        this.dbName = 'healthTracker';
        this.API_URL = config.API_BASE_URL;
        this.baseUrl = 'https://your-app-name.onrender.com/api';
        // Sadece calculator.html ve profile.html'de kontrol et
        if (window.location.pathname.includes('calculator.html') || 
            window.location.pathname.includes('profile.html')) {
            this.checkBackendConnection();
        }
    }

    async checkBackendConnection() {
        try {
            const response = await fetch(this.API_URL + '/health-check');
            const data = await response.json();
            
            if (!response.ok || data.status !== 'ok') {
                throw new Error('Backend yanıt vermiyor');
            }

            console.log('Backend bağlantısı başarılı');
        } catch (error) {
            // Sadece backend çalışmıyorsa uyarı göster
            if (!error.message.includes('Failed to fetch')) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Backend Bağlantısı Yok!',
                    text: 'Lütfen backend sunucusunun çalıştığından emin olun (node server.js)',
                    showConfirmButton: true
                });
            }
        }
    }

    async getProfile() {
        try {
            const profileData = localStorage.getItem('userProfile');
            return profileData ? JSON.parse(profileData) : null;
        } catch (error) {
            console.error('Profil bilgileri alınamadı:', error);
            return null;
        }
    }

    async saveProfile(profileData) {
        try {
            const profile = {
                name: profileData.name,
                gender: profileData.gender,
                age: profileData.age,
                weight: profileData.weight,
                height: profileData.height,
                activityLevel: profileData.activityLevel,
                createdAt: new Date().toISOString()
            };
            localStorage.setItem('userProfile', JSON.stringify(profile));
            return profile;
        } catch (error) {
            console.error('Profil kaydedilemedi:', error);
            throw error;
        }
    }

    async saveMeal(mealData) {
        try {
            // Mevcut meals verilerini al
            const meals = JSON.parse(localStorage.getItem('meals') || '[]');
            
            // Yeni meal'i ekle
            const newMeal = {
                ...mealData,
                id: Date.now(), // Benzersiz ID
                date: new Date().toISOString() // Tarih ekle
            };
            
            meals.push(newMeal);
            
            // Güncellenmiş listeyi kaydet
            localStorage.setItem('meals', JSON.stringify(meals));
            
            console.log('Meal kaydedildi:', newMeal); // Debug için
            return newMeal;
        } catch (error) {
            console.error('Meal kaydedilemedi:', error);
            throw error;
        }
    }

    async getMeals(date) {
        try {
            // localStorage'dan tüm meals verilerini al
            const allMeals = JSON.parse(localStorage.getItem('meals') || '[]');
            console.log('Tüm meals verileri:', allMeals); // Debug için

            if (date) {
                // Belirli bir tarihe ait meals'ları filtrele
                const dateStr = date.split('T')[0]; // YYYY-MM-DD formatına çevir
                const filteredMeals = allMeals.filter(meal => {
                    const mealDate = new Date(meal.date).toISOString().split('T')[0];
                    return mealDate === dateStr;
                });
                console.log('Filtrelenmiş meals:', filteredMeals); // Debug için
                return filteredMeals;
            }
            return allMeals;
        } catch (error) {
            console.error('Meals verileri alınamadı:', error);
            return [];
        }
    }

    async saveHealthRecord(saglikRaporu) {
        try {
            const response = await fetch(`${this.baseUrl}/health-records`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(saglikRaporu)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Rapor kaydedilemedi');
            }

            return await response.json();

        } catch (error) {
            console.error('Sağlık raporu kaydetme hatası:', error);
            throw error;
        }
    }

    async getHealthRecords() {
        try {
            const response = await fetch(`${this.API_URL}/health-records`);
            if (!response.ok) throw new Error('Kayıtlar alınamadı');
            return await response.json();
        } catch (error) {
            console.error('Kayıt getirme hatası:', error);
            throw error;
        }
    }

    async getLatestHealthRecord() {
        try {
            const response = await fetch(`${this.API_URL}/health-records/latest`);
            if (!response.ok) throw new Error('Son kayıt alınamadı');
            return await response.json();
        } catch (error) {
            console.error('Son kayıt getirme hatası:', error);
            throw error;
        }
    }
} 