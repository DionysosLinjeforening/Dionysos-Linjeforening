<p align="center">
  <img src="https://raw.githubusercontent.com/Artiscow/Urd/main/docs/brand/urd-logo-turkis.svg" alt="Urd" width="180">
</p>

<p align="center">
  <a href="../README.md">🇬🇧 English</a> ·
  <a href="README-nb.md">🇳🇴 Bokmål</a> ·
  <strong>🇹🇷 Türkçe</strong>
</p>

<p align="center">
  <a href="https://github.com/Artiscow/Urd/blob/main/docs/languages/setup-publication/SETUP-tr.md"><strong>Kurulum kılavuzu</strong></a> ·
  <a href="https://github.com/Artiscow/Urd/blob/main/docs/languages/user-guide/GUIDE-tr.md"><strong>Kullanıcı kılavuzu</strong></a> ·
  <a href="https://github.com/Artiscow/Urd"><strong>Ana depo</strong></a>
</p>

# Urd

Bu depo web siteniz DEMEKTİR: bağımlılıksız, statik bir site; `/admin` ise görsel editördür. Derleme yok, npm yok - burada ne varsa o sunulur.

## Başlarken

1. **Bu şablondan kendi deponuzu oluşturun** (GitHub'da "Use this template").
2. **Depoyu bir hosta bağlayın** (Cloudflare Pages önerilir) ve yayımlamayı kurun: [kurulum kılavuzunu](https://github.com/Artiscow/Urd/blob/main/docs/languages/setup-publication/SETUP-tr.md) izleyin.
3. **Dağıtılan sitede `/admin` adresini açın** ve GitHub ile giriş yapın: kurulum sihirbazı ad ve renkler konusunda yardımcı olur, yayımladığınız her şey kendi deponuza commit edilir.

Host olmadan yerel önizleme: bu klasörden bir statik sunucu çalıştırın (örneğin `python3 -m http.server`) ve `http://localhost:8000/` adresini açın. Yayımlama host fonksiyonlarını gerektirir, ama editör ve önizleme yerelde çalışır.

## Urd'u güncelleme

Yönetici panelindeki **Güncelleme** bölümünü açın: şablon deposuyla karşılaştırır, nelerin değişeceğini gösterir (elle düzenlenmiş dosyalar işaretlenir) ve yeni sürümü tek birleşik commit olarak yazar. `_headers` hiçbir zaman otomatik güncellenmez; gerekiyorsa panel elle aktarılacak içeriği gösterir.

## İçerik ve yapı

- `content/` sizin içeriğinizdir (sayfalar, tema, koleksiyonlar) - yönetici panelinin yazdığı her şey burada ve `media/` içinde yaşar.
- `plugins/` eklentileri barındırır: bir eklenti klasörü ekleyin ve Eklentiler panelinden etkinleştirin. Bkz. [plugins/README.md](../plugins/README.md); daha fazlası GitHub'daki `urd-plugin` konusuyla bulunabilir.
- `assets/engine/` ve `admin/` Urd'un kendisidir ve Güncelleme paneli tarafından bakımı yapılır; elle düzenlemeyin.

## Belgeler

[Kullanıcı kılavuzu](https://github.com/Artiscow/Urd/blob/main/docs/languages/user-guide/GUIDE-tr.md) ve tüm belgeler [ana depoda](https://github.com/Artiscow/Urd); çeviriler [docs/languages/](https://github.com/Artiscow/Urd/tree/main/docs/languages) altındadır.
