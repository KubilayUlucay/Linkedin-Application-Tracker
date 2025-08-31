document.addEventListener('DOMContentLoaded', () => {
  const saveBtn = document.getElementById('saveBtn');
  const createBtn = document.getElementById('createBtn');
  const openSheetBtn = document.getElementById('openSheetBtn');
  const sheetUrlInput = document.getElementById('sheetUrl');
  const statusDiv = document.getElementById('status');

  // Kaydedilmiş URL'yi yükle ve butonu göster/gizle
  chrome.storage.sync.get(['spreadsheetUrl'], (result) => {
    if (result.spreadsheetUrl) {
      sheetUrlInput.value = result.spreadsheetUrl;
      openSheetBtn.style.display = 'block';
    }
  });

  saveBtn.addEventListener('click', () => {
    const url = sheetUrlInput.value.trim();
    if (url && url.startsWith('https://docs.google.com/spreadsheets/d/')) {
      saveUrl(url);
    } else {
      showStatus('Please enter a valid Google Sheet URL.', 'red');
    }
  });

  createBtn.addEventListener('click', () => {
    showStatus('Creating spreadsheet... Please wait.', 'black');
    createBtn.disabled = true;
    saveBtn.disabled = true;
    chrome.runtime.sendMessage({ action: "createSheetFromTemplate" });
  });

  openSheetBtn.addEventListener('click', () => {
    chrome.storage.sync.get(['spreadsheetUrl'], (result) => {
      if (result.spreadsheetUrl) {
        chrome.tabs.create({ url: result.spreadsheetUrl });
      }
    });
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "sheetCreated") {
      createBtn.disabled = false;
      saveBtn.disabled = false;
      if (request.success) {
        showStatus('Spreadsheet created successfully!', 'green');
        sheetUrlInput.value = request.url;
        openSheetBtn.style.display = 'block';
        // Yeni ID'yi de kaydet
        chrome.storage.sync.set({
          spreadsheetId: request.id,
          spreadsheetUrl: request.url
        });
        // Yeni oluşturulan e-tabloyu yeni sekmede aç
        chrome.tabs.create({ url: request.url });
      } else {
        showStatus(`Error: ${request.error}`, 'red');
      }
      // DİKKAT: Bu listener asenkron bir işlem yapmadığı için 'return true' demeye gerek yok.
      // Bu, konsoldaki uyarıyı kaldıracaktır.
    }
  });
});

function saveUrl(url) {
  const statusDiv = document.getElementById('status');
  const openSheetBtn = document.getElementById('openSheetBtn');
  try {
    const id = url.split('/d/')[1].split('/')[0];
    chrome.storage.sync.set({
      spreadsheetId: id,
      spreadsheetUrl: url
    }, () => {
      showStatus('Settings saved successfully!', 'green');
      openSheetBtn.style.display = 'block';
    });
  } catch (e) {
    showStatus('Could not parse Spreadsheet ID from URL.', 'red');
  }
}

function showStatus(message, color) {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.style.color = color;
}

