class HealthReport {
    constructor() {
        this.db = new Database();
        this.ai = new AIService();
        this.reportData = null;
        this.reportReady = false; // Rapor hazır mı kontrolü için
        this.pendingData = JSON.parse(localStorage.getItem('pendingReportData') || '{}');
        this.initializeReport();
    }

    async initializeReport() {
        try {
            const profile = await this.db.getProfile();
            if (!profile) {
                window.location.href = 'profile.html';
                return;
            }

            const today = new Date();
            const meals = await this.db.getMeals(today.toISOString().split('T')[0]);
            console.log('DB\'den gelen meals:', meals); // Debug için
            
            // BMI ve metabolik değerleri hesapla
            const calculator = new Calculator(profile);
            const bmiData = calculator.calculateBMI();
            const metabolicRates = calculator.calculateBMR();

            // Tüm verileri sakla
            this.reportData = {
                date: today,
                profile: profile,
                meals: meals || [],
                metrics: {
                    bmi: bmiData,
                    ...metabolicRates
                }
            };

            // Meals verisini kontrol et
            if (!meals || meals.length === 0) {
                console.log('Uyarı: Bugün için besin kaydı bulunamadı');
            }

            // Temel verileri göster
            document.querySelector('.report-date').textContent = this.formatDate(today);
            this.displayProfile(profile);
            this.displayHealthMetrics(profile);
            this.displayNutrition(meals || []);
            this.displayCalorieComparison();

            // DOM elementlerini bul
            const analysisContent = document.querySelector('.health-analysis .analysis-content');
            const exerciseContent = document.querySelector('.exercise-plan .exercise-content');

            // Sağlık analizini hemen göster (OpenAI beklemeden)
            const healthAnalysis = this.ai.generateHealthAnalysis({
                age: profile.age,
                gender: profile.gender,
                weight: profile.weight,
                height: profile.height,
                bmi: parseFloat(bmiData.bmi),
                activityLevel: profile.activityLevel
            });

            if (analysisContent) {
                analysisContent.innerHTML = healthAnalysis;
            }

            // Sadece egzersiz planı için loading göster ve OpenAI'yi bekle
            const exercisePlan = await this.ai.generateExercisePlan({
                age: profile.age,
                gender: profile.gender,
                weight: profile.weight,
                height: profile.height,
                bmi: parseFloat(bmiData.bmi),
                activityLevel: profile.activityLevel
            });

            if (exerciseContent) {
                exerciseContent.innerHTML = exercisePlan;
                // AI cevabı geldiğinde kaydet butonunu göster
                this.toggleSaveButton(true);
            }

            this.reportReady = true;

            // Geçmiş kayıtları göster
            this.displayHistory();

        } catch (error) {
            console.error('Rapor oluşturma hatası:', error);
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'error',
                    title: 'Hata!',
                    text: 'Rapor oluşturulurken bir hata oluştu: ' + error.message
                });
            }
        }
    }

    displayProfile(profile) {
        const userInfo = document.querySelector('.user-info .info-grid');
        if (userInfo) {
            userInfo.innerHTML = `
                <div class="metric-card">
                    <div class="metric-label">İsim</div>
                    <div class="metric-value">${profile.name}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Yaş</div>
                    <div class="metric-value">${profile.age}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Cinsiyet</div>
                    <div class="metric-value">
                        ${profile.gender === 'male' ? 'Erkek' : 'Kadın'}
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Boy</div>
                    <div class="metric-value">${profile.height}<small>cm</small></div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Kilo</div>
                    <div class="metric-value">${profile.weight}<small>kg</small></div>
                </div>
            `;
        }

        // Rapor başlığına ismi ekle
        const reportTitle = document.querySelector('.report-header h2');
        if (reportTitle) {
            reportTitle.textContent = `${profile.name} - Kişisel Sağlık Raporu`;
        }
    }

    displayHealthMetrics(profile) {
        const calculator = new Calculator(profile);
        const bmi = calculator.calculateBMI();
        const metabolicRates = calculator.calculateBMR();

        const metricsGrid = document.querySelector('.health-metrics .metrics-grid');
        if (metricsGrid) {
            metricsGrid.innerHTML = `
                <div class="metric-card">
                    <div class="metric-label">Vücut Kitle İndeksi</div>
                    <div class="metric-value">${bmi.bmi} (${bmi.category})</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Bazal Metabolizma Hızı</div>
                    <div class="metric-value">${metabolicRates.bmr} kcal</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Günlük Kalori İhtiyacı</div>
                    <div class="metric-value">${metabolicRates.dailyCalories} kcal</div>
                </div>
            `;
        }
    }

    displayNutrition(meals) {
        const nutritionGrid = document.querySelector('.nutrition-grid');
        if (!nutritionGrid) return;

        const calculatorData = JSON.parse(localStorage.getItem('calculatorData') || '{}');
        
        if (calculatorData.meals && calculatorData.meals.length > 0) {
            // Makro besinlerin kalori değerlerini hesapla
            const proteinCalories = calculatorData.totalNutrients.protein * 4;
            const carbsCalories = calculatorData.totalNutrients.carbs * 4;
            const fatCalories = calculatorData.totalNutrients.fat * 9;
            const totalCalories = calculatorData.totalNutrients.calories;

            // Yüzdeleri hesapla
            const proteinPercentage = (proteinCalories / totalCalories) * 100;
            const carbsPercentage = (carbsCalories / totalCalories) * 100;
            const fatPercentage = (fatCalories / totalCalories) * 100;

            nutritionGrid.innerHTML = `
                <div class="nutrition-summary-container">
                    <div class="total-calories-card">
                        <div class="calories-circle">
                            <div class="calories-number">
                                ${Math.round(totalCalories)}
                                <span class="calories-unit">kcal</span>
                            </div>
                            <div class="calories-label">Toplam Kalori</div>
                        </div>
                        <div class="macro-distribution">
                            <div class="macro-bar">
                                <div class="protein-bar" style="width: ${proteinPercentage}%; background: #FF6B6B;"></div>
                                <div class="carbs-bar" style="width: ${carbsPercentage}%; background: #4ECDC4;"></div>
                                <div class="fat-bar" style="width: ${fatPercentage}%; background: #FFD93D;"></div>
                            </div>
                            <div class="macro-labels">
                                <span style="color: var(--text-color);">Protein ${Math.round(proteinPercentage)}%</span>
                                <span style="color: var(--text-color);">Karbonhidrat ${Math.round(carbsPercentage)}%</span>
                                <span style="color: var(--text-color);">Yağ ${Math.round(fatPercentage)}%</span>
                            </div>
                        </div>
                    </div>

                    <div class="nutrients-detail">
                        <div class="nutrient-detail-item">
                            <div class="nutrient-icon" style="color: #FF6B6B;">🥩</div>
                            <div class="nutrient-info">
                                <span class="nutrient-label">Protein</span>
                                <span class="nutrient-value" style="color: #FF6B6B;">${calculatorData.totalNutrients.protein.toFixed(1)}g</span>
                            </div>
                            <div class="nutrient-bar">
                                <div class="progress" style="width: ${Math.min((calculatorData.totalNutrients.protein / 50) * 100, 100)}%; background: #FF6B6B;"></div>
                            </div>
                        </div>
                        <div class="nutrient-detail-item">
                            <div class="nutrient-icon" style="color: #4ECDC4;">🌾</div>
                            <div class="nutrient-info">
                                <span class="nutrient-label">Karbonhidrat</span>
                                <span class="nutrient-value" style="color: #4ECDC4;">${calculatorData.totalNutrients.carbs.toFixed(1)}g</span>
                            </div>
                            <div class="nutrient-bar">
                                <div class="progress" style="width: ${Math.min((calculatorData.totalNutrients.carbs / 300) * 100, 100)}%; background: #4ECDC4;"></div>
                            </div>
                        </div>
                        <div class="nutrient-detail-item">
                            <div class="nutrient-icon" style="color: #FFD93D;">🥑</div>
                            <div class="nutrient-info">
                                <span class="nutrient-label">Yağ</span>
                                <span class="nutrient-value" style="color: #FFD93D;">${calculatorData.totalNutrients.fat.toFixed(1)}g</span>
                            </div>
                            <div class="nutrient-bar">
                                <div class="progress" style="width: ${Math.min((calculatorData.totalNutrients.fat / 65) * 100, 100)}%; background: #FFD93D;"></div>
                            </div>
                        </div>
                    </div>

                    <div class="meals-summary">
                        <h4>Tüketilen Besinler</h4>
                        <div class="meals-list">
                            ${calculatorData.meals.map(meal => `
                                <div class="meal-item">
                                    <div class="meal-info">
                                        <span class="meal-name">${meal.name}</span>
                                        <span class="meal-portion">${meal.portion}g</span>
                                    </div>
                                    <div class="meal-nutrients">
                                        <span class="meal-calories">${Math.round(meal.calories)} kcal</span>
                                        <div class="meal-macros">
                                            <span class="macro-pill" style="background: #FFE3E3; color: #FF6B6B;">P: ${meal.protein.toFixed(1)}g</span>
                                            <span class="macro-pill" style="background: #E3FFF8; color: #4ECDC4;">K: ${meal.carbs.toFixed(1)}g</span>
                                            <span class="macro-pill" style="background: #FFF5D1; color: #FFD93D;">Y: ${meal.fat.toFixed(1)}g</span>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        } else {
            nutritionGrid.innerHTML = `
                <div class="no-data">
                    <div class="no-data-icon">🍽️</div>
                    <p>Henüz besin kaydı bulunmuyor.</p>
                </div>
            `;
        }
    }

    formatDate(date) {
        const options = { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        };
        return date.toLocaleDateString('tr-TR', options);
    }

    // Rapor kaydetme butonu göster/gizle
    toggleSaveButton(show) {
        const saveButton = document.querySelector('.report-actions');
        if (saveButton) {
            saveButton.style.display = show ? 'flex' : 'none';
        }
    }
    //! #pdf 
    //! #pdf oluşturma
    // PDF oluşturma fonksiyonu
    async generatePDF() {
        try {
            // Yazdırma öncesi stil ayarları
            const style = document.createElement('style');
            style.textContent = `
                @media print {
                    @page {
                        size: A4;
                        margin: 20mm;
                    }

                    body {
                        background: white;
                        font-size: 12pt;
                    }

                    #reportContent {
                        width: 100%;
                        margin: 0;
                        padding: 0;
                    }

                    /* Geçmiş kayıtları gizle */
                    .history-section,
                    .history-grid,
                    .history-title,
                    .report-section:last-child {
                        display: none !important;
                    }

                    /* Renkleri koru */
                    .protein-bar { background-color: #FF6B6B !important; }
                    .carbs-bar { background-color: #4ECDC4 !important; }
                    .fat-bar { background-color: #FFD93D !important; }

                    .macro-pill[style*="background: #FFE3E3"] { background-color: #FFE3E3 !important; color: #FF6B6B !important; }
                    .macro-pill[style*="background: #E3FFF8"] { background-color: #E3FFF8 !important; color: #4ECDC4 !important; }
                    .macro-pill[style*="background: #FFF5D1"] { background-color: #FFF5D1 !important; color: #FFD93D !important; }

                    .nutrient-value[style*="color: #FF6B6B"] { color: #FF6B6B !important; }
                    .nutrient-value[style*="color: #4ECDC4"] { color: #4ECDC4 !important; }
                    .nutrient-value[style*="color: #FFD93D"] { color: #FFD93D !important; }

                    .progress { 
                        background-color: currentColor !important;
                        opacity: 1 !important;
                    }

                    /* Metrik kartları */
                    .metric-card {
                        border: 1px solid #ddd;
                        padding: 15px;
                        margin: 5px;
                        break-inside: avoid;
                    }

                    .metric-value {
                        color: #2c3e50 !important;
                        font-weight: bold;
                    }

                    /* Başlıklar ve metinler */
                    h1, h2, h3, h4 { color: #2c3e50 !important; }
                    p, span { color: #34495e !important; }

                    /* Gizlenecek butonlar */
                    .report-actions,
                    .header-buttons,
                    .no-print {
                        display: none !important;
                    }
                }
            `;

            // Stil ekle
            document.head.appendChild(style);

            // Yazdırma diyaloğunu aç
            window.print();

            // Stili kaldır
            document.head.removeChild(style);

        } catch (error) {
            console.error('PDF oluşturma hatası:', error);
            Swal.fire({
                icon: 'error',
                title: 'Hata!',
                text: 'PDF oluşturulurken bir hata oluştu: ' + error.message
            });
        }
    }

    // Raporu kaydet
    async saveReport() {
        try {
            if (!this.reportData) {
                throw new Error('Rapor verisi bulunamadı');
            }

            const calculatorData = JSON.parse(localStorage.getItem('calculatorData') || '{}');
            
            const saglikRaporu = {
                kullaniciId: "user123",
                isim: this.reportData.profile.name,
                tarih: new Date().toISOString(),

                kisiselBilgiler: {
                    isim: this.reportData.profile.name,
                    yas: parseInt(this.reportData.profile.age),
                    cinsiyet: this.reportData.profile.gender === 'male' ? 'Erkek' : 'Kadın',
                    boy: parseInt(this.reportData.profile.height),
                    kilo: parseInt(this.reportData.profile.weight),
                    aktiviteSeviyesi: this.getAktiviteSeviyesiText(this.reportData.profile.activityLevel)
                },

                saglikMetrikleri: {
                    vucutKitleIndeksi: parseFloat(this.reportData.metrics.bmi.bmi),
                    vkiKategorisi: this.reportData.metrics.bmi.category,
                    bazalMetabolizmaHizi: parseInt(this.reportData.metrics.bmr),
                    gunlukKaloriIhtiyaci: parseInt(this.reportData.metrics.dailyCalories)
                },

                beslenmeOzeti: {
                    tuketilenBesinler: calculatorData.meals?.map(meal => ({
                        besinAdi: meal.name,
                        porsiyon: parseFloat(meal.portion),
                        kalori: parseInt(meal.calories),
                        protein: parseFloat(meal.protein),
                        karbonhidrat: parseFloat(meal.carbs),
                        yag: parseFloat(meal.fat)
                    })) || [],

                    toplamDegerler: {
                        toplamKalori: parseInt(calculatorData.totalNutrients?.calories || 0),
                        toplamProtein: parseFloat(calculatorData.totalNutrients?.protein || 0),
                        toplamKarbonhidrat: parseFloat(calculatorData.totalNutrients?.carbs || 0),
                        toplamYag: parseFloat(calculatorData.totalNutrients?.fat || 0)
                    },

                    kaloriKarsilastirmasi: {
                        hedeflenenKalori: parseInt(this.reportData.metrics.dailyCalories),
                        alinanKalori: parseInt(calculatorData.totalNutrients?.calories || 0),
                        kaloriFarki: parseInt(this.reportData.metrics.dailyCalories - (calculatorData.totalNutrients?.calories || 0)),
                        durumMesaji: `${Math.abs(this.reportData.metrics.dailyCalories - (calculatorData.totalNutrients?.calories || 0))} kcal ${this.reportData.metrics.dailyCalories > (calculatorData.totalNutrients?.calories || 0) ? 'daha almalısınız' : 'fazla aldınız'}`
                    }
                },

                saglikAnalizi: {
                    genelSaglikPuani: parseInt(document.querySelector('.health-score h4')?.textContent.match(/\d+/)[0] || '0'),
                    vkiDurumu: this.reportData.metrics.bmi.category,
                    aktiviteDurumuMetni: this.getAktiviteSeviyesiText(this.reportData.profile.activityLevel),
                    yasaGoreDurum: document.querySelector('.analysis-points li:nth-child(3)')?.textContent.trim() || '',
                    oneriler: Array.from(document.querySelectorAll('.analysis-points li:nth-child(4) ul li')).map(li => li.textContent.trim())
                },

                egzersizPlani: {
                    haftalikProgram: document.querySelector('.exercise-plan .exercise-content')?.innerHTML.trim() || '',
                    onemliNotlar: document.querySelector('.exercise-notes')?.innerHTML.trim() || '',
                    guvenlikOnerileri: document.querySelector('.exercise-safety')?.innerHTML.trim() || ''
                }
            };

            console.log('Kaydedilecek sağlık raporu:', saglikRaporu);
            const response = await this.db.saveHealthRecord(saglikRaporu);
            console.log('MongoDB yanıtı:', response);

            Swal.fire({
                icon: 'success',
                title: 'Başarılı!',
                text: 'Sağlık raporunuz başarıyla kaydedildi.'
            });

        } catch (error) {
            console.error('Rapor kaydetme hatası:', error);
            Swal.fire({
                icon: 'error',
                title: 'Hata!',
                text: 'Rapor kaydedilemedi: ' + error.message
            });
        }
    }

    // Aktivite seviyesi metni alma yardımcı fonksiyonu
    getAktiviteSeviyesiText(level) {
        const levels = {
            '1.2': 'Hareketsiz Yaşam',
            '1.375': 'Az Hareketli',
            '1.55': 'Orta Düzeyde Aktif',
            '1.725': 'Çok Aktif',
            '1.9': 'Profesyonel Sporcu Seviyesi'
        };
        return levels[level] || 'Belirsiz';
    }

    displayHistory() {
        const historyGrid = document.querySelector('.history-grid');
        if (historyGrid) {
            historyGrid.innerHTML = `
                <div class="history-login-required">
                    <div class="history-icon">🔐</div>
                    <h3>Geçmiş Kayıtlar için Giriş Yapmalısınız</h3>
                    <p>Geçmiş raporlarınızı görüntülemek için lütfen giriş yapın.</p>
                    <button onclick="window.location.href='login.html'" class="login-button">
                        <i class="fas fa-sign-in-alt"></i> Giriş Yap
                    </button>
                </div>
            `;
        }
    }

    displayCalorieComparison() {
        const comparisonContent = document.querySelector('.calorie-comparison-content');
        if (!comparisonContent) return;

        const calculatorData = JSON.parse(localStorage.getItem('calculatorData') || '{}');
        
        if (calculatorData.totalNutrients) {
            const dailyCalorieNeed = this.reportData.metrics.dailyCalories;
            const consumedCalories = calculatorData.totalNutrients.calories;
            const calorieDifference = dailyCalorieNeed - consumedCalories;
            
            let calorieMessage = '';
            let calorieStatus = '';
            if (calorieDifference > 0) {
                calorieMessage = `Günlük hedefinize ulaşmak için ${Math.abs(Math.round(calorieDifference))} kalori daha almalısınız.`;
                calorieStatus = 'under';
            } else if (calorieDifference < 0) {
                calorieMessage = `Günlük hedefinizi ${Math.abs(Math.round(calorieDifference))} kalori aştınız.`;
                calorieStatus = 'over';
            } else {
                calorieMessage = 'Günlük kalori hedefinize tam olarak ulaştınız!';
                calorieStatus = 'perfect';
            }

            comparisonContent.innerHTML = `
                <div class="comparison-bars">
                    <div class="comparison-item">
                        <span class="comparison-label">Günlük İhtiyaç</span>
                        <div class="comparison-bar">
                            <div class="bar-fill need" style="width: 100%">
                                ${Math.round(dailyCalorieNeed)} kcal
                            </div>
                        </div>
                    </div>
                    <div class="comparison-item">
                        <span class="comparison-label">Alınan</span>
                        <div class="comparison-bar">
                            <div class="bar-fill consumed" style="width: ${(consumedCalories/dailyCalorieNeed) * 100}%">
                                ${Math.round(consumedCalories)} kcal
                            </div>
                        </div>
                    </div>
                </div>
                <div class="calorie-message ${calorieStatus}">
                    <i class="fas ${calorieStatus === 'under' ? 'fa-arrow-down' : 
                                  calorieStatus === 'over' ? 'fa-arrow-up' : 
                                  'fa-check'}"></i>
                    ${calorieMessage}
                </div>
            `;
        } else {
            comparisonContent.innerHTML = `
                <div class="no-data">
                    <p>Kalori karşılaştırması için besin kaydı gerekli.</p>
                </div>
            `;
        }
    }
}

// Global fonksiyonlar
window.generatePDF = function() {
    const report = document.querySelector('.report-container').__report;
    if (report) {
        report.generatePDF();
    }
};

window.saveReport = function() {
    const report = document.querySelector('.report-container').__report;
    if (report) {
        report.saveReport();
    }
};

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    const report = new HealthReport();
    // Rapor nesnesini DOM'a ekle
    document.querySelector('.report-container').__report = report;
    // Başlangıçta kaydet butonunu gizle
    report.toggleSaveButton(false);
}); 