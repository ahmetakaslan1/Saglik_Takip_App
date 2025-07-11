class AIService {
    constructor() {
        this.API_KEY = config.OPENAI_API_KEY;
        this.API_URL = 'https://api.openai.com/v1/chat/completions';
    }

    async generateExercisePlan(data) {
        const exerciseContent = document.querySelector('.exercise-plan .exercise-content');
        if (exerciseContent) {
            exerciseContent.innerHTML = `
                <div class="loading-spinner">
                    <div class="circle-loader"></div>
                    <p>Egzersiz planı oluşturuluyor...</p>
                </div>
            `;
        }
           //# prompt
        const prompt = `
            Kişiye özel egzersiz planı oluştur:

            KİŞİ BİLGİLERİ:
            - Yaş: ${data.age}
            - Cinsiyet: ${data.gender === 'male' ? 'Erkek' : 'Kadın'}
            - Boy: ${data.height} cm
            - Kilo: ${data.weight} kg
            - Vücut Kitle İndeksi (BMI): ${data.bmi}
            - Aktivite Seviyesi: ${data.activityLevel}

            LÜTFEN AŞAĞIDAKİ FORMATTA BİR EGZERSİZ PLANI OLUŞTUR FARKLI OLSUN:


            1. HAFTALIK PROGRAM:
               Pazartesi:
               - Ana egzersiz türü (örn: Kardiyo, Kuvvet, Esneklik)
               - Detaylı egzersiz listesi
               - Her egzersiz için set ve tekrar sayısı
               - Önerilen süre
               - Zorluk seviyesi (Başlangıç/Orta/İleri)

               Salı:
               [Aynı format]
               ...

            2. ÖZEL NOTLAR:
               - Isınma tavsiyeleri
               - Dinlenme süreleri
               - Su tüketimi
               - Dikkat edilmesi gereken noktalar

            3. GÜVENLİK ÖNERİLERİ:
               - Hangi durumlarda egzersizi bırakmalı
               - Hangi hareketlerde dikkatli olmalı
               - Nasıl doğru form korunmalı

            Lütfen yanıtı HTML formatında, Türkçe olarak ve herkesin anlayabileceği basit bir dille hazırla.
            Her egzersiz için zorluk seviyesini ve tahmini kalori yakımını da belirt.
            
            Eğer kişinin BMI değeri 30'un üzerindeyse düşük etkili egzersizler,
            18.5'in altındaysa kuvvet ağırlıklı egzersizler öner.
        `;

        let retries = 3;
        while (retries > 0) {
            try {
                const response = await fetch(this.API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.API_KEY}`
                    },
                    body: JSON.stringify({
                        model: "gpt-3.5-turbo",
                        messages: [{
                            role: "user",
                            content: prompt
                        }],
                        temperature: 0.7,
                        max_tokens: 1000
                    })
                });

                if (response.status === 429) {
                    // Rate limit aşıldı, 5 saniye bekle ve tekrar dene
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    retries--;
                    continue;
                }

                if (!response.ok) {
                    throw new Error('API yanıt vermedi');
                }

                const data = await response.json();
                const result = data.choices[0].message.content;
                
                // Rapor hazır olduğunda kaydet butonunu göster
                const report = document.querySelector('.report-container').__report;
                if (report) {
                    report.reportReady = true;
                    report.toggleSaveButton(true);
                }

                return result;
            } catch (error) {
                retries--;
                if (retries > 0) {
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    continue;
                }
                console.error('Egzersiz planı oluşturma hatası:', error);
                // API çalışmazsa varsayılan bir egzersiz planı döndür
                return this.getDefaultExercisePlan(data);
            }
        }
        return this.getDefaultExercisePlan(data);
    }

    getDefaultExercisePlan(data) {
        const intensity = data.bmi > 30 ? 'düşük' : (data.bmi < 18.5 ? 'orta' : 'normal');
        return `
            <div class="exercise-plan-content">
                <h4>Önerilen Egzersiz Programı</h4>
                <div class="exercise-week">
                    <h5>Pazartesi & Perşembe</h5>
                    <ul>
                        <li>Yürüyüş: 30 dakika (${intensity} tempo)</li>
                        <li>Temel Vücut Ağırlığı Egzersizleri:
                            <ul>
                                <li>Şınav: 3 set x 10 tekrar</li>
                                <li>Squat: 3 set x 15 tekrar</li>
                                <li>Plank: 3 x 30 saniye</li>
                            </ul>
                        </li>
                    </ul>

                    <h5>Salı & Cuma</h5>
                    <ul>
                        <li>Kardiyo: 20 dakika (${intensity} tempo)</li>
                        <li>Kuvvet Egzersizleri:
                            <ul>
                                <li>Mekik: 3 set x 15 tekrar</li>
                                <li>Jumping Jack: 3 set x 20 tekrar</li>
                                <li>Superman: 3 set x 10 tekrar</li>
                            </ul>
                        </li>
                    </ul>

                    <h5>Çarşamba & Cumartesi</h5>
                    <ul>
                        <li>Esneme ve Yoga: 20 dakika</li>
                        <li>Denge Egzersizleri: 15 dakika</li>
                    </ul>

                    <h5>Pazar</h5>
                    <ul>
                        <li>Dinlenme ve hafif yürüyüş</li>
                    </ul>
                </div>

                <div class="exercise-notes">
                    <h5>Önemli Notlar:</h5>
                    <ul>
                        <li>Her egzersiz öncesi 5-10 dakika ısınma yapın</li>
                        <li>Egzersizler arası 30-60 saniye dinlenin</li>
                        <li>Bol su tüketin</li>
                        <li>Kendinizi zorlanmış hissederseniz tempoyu düşürün</li>
                    </ul>
                </div>
            </div>
        `;
    }

    generateHealthAnalysis(data) {
        try {
            // BMI durumu kontrolü
            let bmiStatus = '';
            let bmiScore = 0;
            if (data.bmi < 18.5) {
                bmiStatus = 'Zayıf';
                bmiScore = 5;
            } else if (data.bmi < 25) {
                bmiStatus = 'Normal';
                bmiScore = 10;
            } else if (data.bmi < 30) {
                bmiStatus = 'Fazla Kilolu';
                bmiScore = 6;
            } else {
                bmiStatus = 'Obez';
                bmiScore = 3;
            }

            // Aktivite seviyesi değerlendirmesi
            let activityScore = 0;
            switch(data.activityLevel) {
                case '1.2': activityScore = 4; break;
                case '1.375': activityScore = 6; break;
                case '1.55': activityScore = 8; break;
                case '1.725': activityScore = 9; break;
                case '1.9': activityScore = 10; break;
                default: activityScore = 5;
            }

            // Genel sağlık puanı (10 üzerinden)
            const healthScore = Math.round((bmiScore + activityScore) / 2);

            return `
                <div class="health-analysis-content">
                    <div class="health-score">
                        <h4>Genel Sağlık Puanı: ${healthScore}/10</h4>
                        <div class="progress-bar">
                            <div class="progress" style="width: ${healthScore * 10}%"></div>
                        </div>
                    </div>

                    <div class="analysis-points">
                        <h4>Sağlık Durumu Analizi</h4>
                        <ol>
                            <li>
                                <strong>Vücut Kitle İndeksi (BMI):</strong> 
                                ${data.bmi.toFixed(1)} - ${bmiStatus}
                                <div class="mini-progress">
                                    <div class="progress" style="width: ${bmiScore * 10}%"></div>
                                </div>
                            </li>
                            <li>
                                <strong>Fiziksel Aktivite Seviyesi:</strong>
                                ${this.getActivityLevelText(data.activityLevel)}
                                <div class="mini-progress">
                                    <div class="progress" style="width: ${activityScore * 10}%"></div>
                                </div>
                            </li>
                            <li>
                                <strong>Yaşa Göre Durum:</strong>
                                ${this.getAgeBasedAnalysis(data.age, data.bmi)}
                            </li>
                            <li>
                                <strong>Öneriler:</strong>
                                ${this.getRecommendations(data)}
                            </li>
                        </ol>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Sağlık analizi oluşturma hatası:', error);
            return `
                <div class="error-message">
                    <p>Sağlık analizi oluşturulurken bir hata oluştu.</p>
                </div>
            `;
        }
    }

    getActivityLevelText(level) {
        const levels = {
            '1.2': 'Hareketsiz Yaşam',
            '1.375': 'Az Hareketli',
            '1.55': 'Orta Düzeyde Aktif',
            '1.725': 'Çok Aktif',
            '1.9': 'Profesyonel Sporcu Seviyesi'
        };
        return levels[level] || 'Belirsiz';
    }

    getAgeBasedAnalysis(age, bmi) {
        if (age < 20) {
            return 'Gelişim döneminde olduğunuz için düzenli sağlık kontrolleri önemlidir.';
        } else if (age < 40) {
            return 'Yetişkin döneminde ideal sağlık değerlerini korumak önemlidir.';
        } else if (age < 60) {
            return 'Orta yaş döneminde düzenli check-up ve egzersiz önemlidir.';
        } else {
            return 'İleri yaş grubunda dengeli beslenme ve düzenli hareket önemlidir.';
        }
    }

    getRecommendations(data) {
        let recommendations = [];

        if (data.bmi < 18.5) {
            recommendations.push('Kalori alımınızı artırmanız önerilir');
            recommendations.push('Protein ağırlıklı beslenme programı uygulamalısınız');
        } else if (data.bmi > 25) {
            recommendations.push('Kalori alımınızı kontrol etmeniz önerilir');
            recommendations.push('Düzenli kardiyovasküler egzersizler yapmalısınız');
        }

        if (data.activityLevel < 1.4) {
            recommendations.push('Fiziksel aktivite düzeyinizi artırmalısınız');
        }

        return recommendations.length > 0 ? 
            `<ul>${recommendations.map(r => `<li>${r}</li>`).join('')}</ul>` : 
            'Mevcut sağlık durumunuzu korumaya devam edin.';
    }
} 