class FoodService {
    constructor() {
        this.API_URL = '/api/food';
    }

    async searchFood(query) {
        try {
            const response = await fetch(`${this.API_URL}/search?query=${encodeURIComponent(query)}`);
            return await response.json();
        } catch (error) {
            console.error('Besin arama hatası:', error);
            throw error;
        }
    }
} 