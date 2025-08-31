document.addEventListener('DOMContentLoaded', () => {
  const scrapeBtn = document.getElementById('scrapeBtn');
  const openSheetBtn = document.getElementById('openSheetBtn');
  const settingsLink = document.getElementById('settingsLink');
  const statusElement = document.getElementById('status');

  // Ayarlanmış bir sheet URL'si var mı diye kontrol et
  chrome.storage.sync.get(['spreadsheetUrl'], (result) => {
    if (result.spreadsheetUrl) {
      scrapeBtn.disabled = false;
      openSheetBtn.style.display = 'block';
    } else {
      scrapeBtn.disabled = true;
      statusElement.textContent = 'Please set your sheet URL in settings.';
    }
  });

  scrapeBtn.addEventListener('click', () => {
    statusElement.textContent = 'Working...';
    scrapeBtn.disabled = true; // Butonu işlem sırasında devre dışı bırak

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (!activeTab || !activeTab.id) {
          statusElement.textContent = 'Could not find active tab.';
          return;
      }
      
      /**
       * ÖNEMLİ DÜZELTME: "Sessiz" hatanın ana kaynağı buradaydı.
       * content_script'e gönderilen mesajın ulaşıp ulaşmadığını kontrol etmek için
       * bir callback fonksiyonu ekledik. Eğer content_script ilgili sayfada
       * aktif değilse, chrome.runtime.lastError bir hata verecek ve bu hatayı
       * yakalayıp kullanıcıya gösterebileceğiz.
       */
      chrome.tabs.sendMessage(activeTab.id, { action: "scrapePage" }, (response) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
          statusElement.textContent = "Error: Not a valid LinkedIn job page. Please refresh the page.";
          scrapeBtn.disabled = false; // Hata durumunda butonu tekrar aktif et
        }
      });
    });
  });

  openSheetBtn.addEventListener('click', () => {
    chrome.storage.sync.get(['spreadsheetUrl'], (result) => {
      if (result.spreadsheetUrl) {
        chrome.tabs.create({ url: result.spreadsheetUrl });
      }
    });
  });

  settingsLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });

  // Arka plandan gelecek durumu dinle
  chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "updatePopupStatus") {
      statusElement.textContent = request.message;
      /**
       * ÖNEMLİ DÜZELTME: Listener'ı kaldırma satırı silindi.
       * Listener'ın kendisi içinden kaldırılması beklenmedik davranışlara yol açabilir
       * ve popup kapandığında zaten listener temizlenir.
       */
      if (request.message === "Success!") {
        setTimeout(() => window.close(), 1500);
      } else {
        // Hata durumunda butonun tekrar tıklanabilir olmasını sağla
        scrapeBtn.disabled = false;
      }
    }
  });
});
