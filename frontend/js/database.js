class Database {
    constructor() {
        this.API_URL = 'http://localhost:3000/api';
    }

    async saveUser(userData) {
        try {
            const response = await fetch(`${this.API_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            return await response.json();
        } catch (error) {
            console.error('Kullanıcı kaydedilemedi:', error);
            throw error;
        }
    }

    async saveHealthRecord(healthData) {
        try {
            const response = await fetch(`${this.API_URL}/health-records`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(healthData)
            });
            return await response.json();
        } catch (error) {
            console.error('Sağlık kaydı oluşturulamadı:', error);
            throw error;
        }
    }
} 