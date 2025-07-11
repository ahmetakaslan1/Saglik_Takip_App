const mongoose = require('mongoose');

const saglikRaporuSchema = new mongoose.Schema({
    // Temel Bilgiler
    kullaniciId: String,
    isim: String,
    tarih: {
        type: Date,
        default: Date.now
    },

    // Kişisel Bilgiler
    kisiselBilgiler: {
        isim: String,
        yas: Number,
        cinsiyet: String,
        boy: Number,
        kilo: Number,
        aktiviteSeviyesi: String
    },

    // Sağlık Metrikleri
    saglikMetrikleri: {
        vucutKitleIndeksi: Number,
        vkiKategorisi: String,
        bazalMetabolizmaHizi: Number,
        gunlukKaloriIhtiyaci: Number
    },

    // Beslenme Özeti
    beslenmeOzeti: {
        // Tüketilen Besinler
        tuketilenBesinler: [{
            besinAdi: String,
            porsiyon: Number,
            kalori: Number,
            protein: Number,
            karbonhidrat: Number,
            yag: Number
        }],
        
        // Toplam Makro Besinler
        toplamDegerler: {
            toplamKalori: Number,
            toplamProtein: Number,
            toplamKarbonhidrat: Number,
            toplamYag: Number
        },

        // Kalori Karşılaştırması
        kaloriKarsilastirmasi: {
            hedeflenenKalori: Number,
            alinanKalori: Number,
            kaloriFarki: Number,
            durumMesaji: String  // "3000 kcal daha almalısınız" veya "2000 kcal fazla aldınız" gibi
        }
    },

    // Sağlık Analizi
    saglikAnalizi: {
        genelSaglikPuani: Number,  // 10 üzerinden puan
        vkiDurumu: String,
        aktiviteDurumuMetni: String,
        yasaGoreDurum: String,
        oneriler: [String]
    },

    // Egzersiz Planı
    egzersizPlani: {
        haftalikProgram: String,  // HTML içeriği
        onemliNotlar: String,
        guvenlikOnerileri: String
    }
});

module.exports = mongoose.model('SaglikRaporu', saglikRaporuSchema); 