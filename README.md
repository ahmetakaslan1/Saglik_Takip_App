# Sağlıklı Yaşam Asistanı

Sağlıklı Yaşam Asistanı, kullanıcıların beslenme alışkanlıklarını takip etmelerine, vücut kitle indeksi (BMI) ve bazal metabolizma (BMR) hesaplamalarına, yedikleri yiyeceklerin kalori ve besin değerlerini görmelerine yardımcı olan modern bir web uygulamasıdır.

## Canlı Demo
Uygulamayı canlı olarak incelemek için: [https://proje.ahmetakaslan.com/](https://proje.ahmetakaslan.com/)

## Amaç
Kullanıcıların sağlıklı yaşam hedeflerine ulaşmalarını kolaylaştırmak için, günlük besin ve kalori takibi ile kişisel sağlık hesaplamalarını tek bir platformda sunar.

## Özellikler
- **Vücut Kitle İndeksi (BMI) Hesaplama**
- **Bazal Metabolizma (BMR) Hesaplama**
- **Yiyecek Arama ve Besin Değeri Gösterimi**
- **Günlük Toplam Kalori ve Makro Takibi**
- **Kullanıcı Profili ve Kişiselleştirme**

## Kullanılan Teknolojiler
- **HTML5 & CSS3**: Modern ve responsive kullanıcı arayüzü
- **JavaScript (Vanilla JS)**: Dinamik işlemler ve API entegrasyonu
- **PHP**: Backend işlemleri ve veritabanı yönetimi (Node.js alternatifi olarak PHP desteğiyle uyumlu)
- **USDA FoodData Central API**: Yiyeceklerin besin değerlerini almak için harici API
- **MySQL**: (Opsiyonel) Kullanıcı ve veri yönetimi için veritabanı

## Proje Yapısı
```
food-calculator/
├── index.html
├── css/
├── js/
├── assets/
├── pages/
└── api/ (PHP backend)
```

## Kurulum & Kullanım
1. Proje dosyalarını sunucunuza yükleyin.
2. `api/config/database.php` dosyasını kendi veritabanı bilgilerinizle güncelleyin (varsa).
3. API anahtarınızı `js/config.js` dosyasına ekleyin.
4. Ana sayfadan uygulamayı kullanmaya başlayabilirsiniz.

## Katkı ve Lisans
Katkıda bulunmak isterseniz lütfen bir pull request gönderin. Lisans bilgisi için proje sahibine danışabilirsiniz.

---

> **Not:** Proje, sadece PHP destekli hostinglerde çalışacak şekilde yapılandırılmıştır. Harici API anahtarı gerektirir. 