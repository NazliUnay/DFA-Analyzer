# DFA Çakışma ve Eşdeğerlik Denetleyicisi (DFA Analyzer)

![DFA Analiz Aracı Örnek Görünümü](gorsel_linkini_buraya_yaz.png)

Bu proje, Biçimsel Diller ve Otomata teorisi kapsamında geliştirilmiş bir web uygulamasıdır. Kullanıcı tarafından JSON formatında yüklenen iki farklı Deterministik Sonlu Otomatın (DFA) birbirleriyle olan eşdeğerliğini ve çakışma (kesişim) durumlarını analiz eder.

## Özellikler
- **Görselleştirme:** Vis.js kütüphanesi kullanılarak DFA'lar interaktif bir graf olarak çizdirilir.
- **Kesişim Kontrolü:** İki DFA'nın ortak kabul ettiği bir kelime olup olmadığını kontrol eder. Çakışma varsa en kısa örnek kelimeyi sunar.
- **Eşdeğerlik Kontrolü:** İki DFA'nın tamamen aynı dili tanıyıp tanımadığını kontrol eder. Eşdeğerlik bozuluyorsa, kanıt olarak bir "karşı örnek" (counterexample) sunar.
- **Adım Adım Loglama:** Algoritmanın çalışma adımlarını kullanıcıya detaylı bir şekilde gösterir.

## Çalışma Mantığı (Algoritma)
Proje, iki farklı DFA'yı analiz etmek için **Çarpım Otomatı (Product Automaton)** teorisini ve **Genişlik Öncelikli Arama (BFS)** algoritmasını kullanır.

* **Kesişim Analizi:** Her iki otomat eşzamanlı olarak başlangıç durumlarından çalıştırılır. BFS matrisi üzerinde ilerlerken, iki otomatın da aynı anda "Kabul" durumunda olduğu bir eşleşme bulunursa, dillerin kesişiminin boş olmadığı kanıtlanır.
* **Eşdeğerlik Analizi:** Otomatlar eşzamanlı simüle edilirken, bir otomatın kabul ettiği bir harf dizisini diğerinin reddettiği bir zıtlık (XOR mantığı) aranır. Eğer tüm ihtimaller denenip kuyruk boşalana kadar böyle bir asimetri bulunamazsa, iki DFA tamamen eşdeğer kabul edilir.

## Kurulum ve Çalıştırma
Uygulama istemci taraflı (client-side) çalışmaktadır, ancak JavaScript ES6 modül yapısı kullanıldığı için CORS hatalarını önlemek adına bir yerel sunucu (local server) üzerinden çalıştırılması gerekir.

1. Projeyi bilgisayarınıza indirin ve klasöre çıkartın.
2. Klasör dizininde terminali açın.
3. Gerekli yerel sunucu bağımlılığını kurmak için aşağıdaki komutu çalıştırın:
   `npm install`
4. Uygulamayı başlatmak için aşağıdaki komutu girin:
   `npm start`
5. Terminalde size verilen bağlantıya (örneğin: `http://localhost:3000`) tıklayarak arayüze ulaşabilirsiniz.

## Kullanılan Teknolojiler
- HTML5 / CSS3
- Vanilla JavaScript (ES6 Modules)
- Node.js (Yerel sunucu altyapısı için)
- Vis.js (Ağ görselleştirmesi için)