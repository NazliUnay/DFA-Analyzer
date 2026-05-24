# DFA Çakışma ve Eşdeğerlik Denetleyicisi (DFA Analyzer)

Bu proje, Biçimsel Diller ve Otomata teorisi kapsamında geliştirilmiş bir web uygulamasıdır. Kullanıcı tarafından JSON formatında yüklenen iki farklı Deterministik Sonlu Otomatın (DFA) birbirleriyle olan eşdeğerliğini ve çakışma (kesişim) durumlarını analiz eder.

## Özellikler
- **Görselleştirme:** Vis.js kütüphanesi kullanılarak DFA'lar interaktif bir graf olarak çizdirilir.
- **Kesişim Kontrolü:** İki DFA'nın ortak kabul ettiği bir kelime olup olmadığını BFS algoritması ile denetler. Çakışma varsa en kısa örnek kelimeyi sunar.
- **Eşdeğerlik Kontrolü:** İki DFA'nın tamamen aynı dili tanıyıp tanımadığını kontrol eder. Eşdeğerlik bozuluyorsa, kanıt olarak bir "karşı örnek" (counterexample) sunar.
- **Adım Adım Loglama:** Algoritmanın çalışma adımlarını kullanıcıya detaylı bir şekilde gösterir.

## Kurulum ve Çalıştırma
Uygulama tamamen istemci taraflı (client-side) çalışmaktadır, ancak modül yapısı kullanıldığı için bir yerel sunucu (local server) üzerinden çalıştırılması gerekir.

1. Proje dosyalarını bir klasöre çıkartın.
2. Klasör dizininde terminali açın.
3. Node.js paketlerini (varsa) kurmanıza gerek yoktur, doğrudan HTML'i sunmanız yeterlidir.
4. Herhangi bir yerel sunucu başlatın (Örn: `npx serve .` veya VS Code Live Server eklentisi).
5. Tarayıcınızda açılan sayfada `DFA-1` ve `DFA-2` için JSON dosyalarınızı yükleyin ve analiz butonlarına tıklayın.

## Kullanılan Teknolojiler
- HTML5 / CSS3
- Vanilla JavaScript (ES6 Modules)
- Vis.js (Ağ görselleştirmesi için)