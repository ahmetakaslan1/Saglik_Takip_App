class Settings {
    constructor() {
        this.init();
        this.bindEvents();
    }

    init() {
        // Tema ayarını yükle
        const currentTheme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', currentTheme);
        
        // Dil ayarını yükle
        const currentLang = localStorage.getItem('language') || 'tr';
        document.documentElement.lang = currentLang;

        // Toggle butonlarını ayarla
        const themeToggle = document.querySelector('#themeToggle');
        const langToggle = document.querySelector('#langToggle');
        
        if (themeToggle) {
            themeToggle.checked = currentTheme === 'dark';
        }
        if (langToggle) {
            langToggle.checked = currentLang === 'en';
        }
    }

    bindEvents() {
        // Tema değiştirme
        const themeToggle = document.querySelector('#themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('change', () => this.toggleTheme());
        }

        // Dil değiştirme
        const langToggle = document.querySelector('#langToggle');
        if (langToggle) {
            langToggle.addEventListener('change', () => this.toggleLanguage());
        }
    }

    toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // Tema değişikliği animasyonu
        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    }

    toggleLanguage() {
        const currentLang = document.documentElement.lang;
        const newLang = currentLang === 'tr' ? 'en' : 'tr';
        
        document.documentElement.lang = newLang;
        localStorage.setItem('language', newLang);
        
        // Dil değişikliğini uygula
        this.updatePageLanguage(newLang);
    }

    updatePageLanguage(lang) {
        const translations = {
            tr: {
                settings: 'Ayarlar',
                theme: 'Tema',
                darkTheme: 'Koyu Tema',
                language: 'Dil',
                english: 'İngilizce'
            },
            en: {
                settings: 'Settings',
                theme: 'Theme',
                darkTheme: 'Dark Theme',
                language: 'Language',
                english: 'English'
            }
        };

        // Sayfa içeriğini güncelle
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            if (translations[lang][key]) {
                element.textContent = translations[lang][key];
            }
        });
    }
} 