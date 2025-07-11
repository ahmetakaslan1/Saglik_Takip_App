class TranslationService {
    constructor() {
        this.API_URL = '/api/translate';
    }

    async translateText(text, from = 'tr', to = 'en') {
        try {
            const response = await fetch(
                `${this.API_URL}?text=${encodeURIComponent(text)}&from=${from}&to=${to}`
            );
            const data = await response.json();
            return data.responseData.translatedText;
        } catch (error) {
            console.error('Çeviri hatası:', error);
            return text; // Hata durumunda orijinal metni döndür
        }
    }
} 