// Senin paylaştığın ve herkesin erişimine açık olan şablon dosyasının ID'si
const TEMPLATE_SHEET_ID = '138_o2fC39qJjVmbRc4l2aYoFwpMKG4UbsQg2RLin7Yk';

/**
 * ÖNEMLİ DEĞİŞİKLİK: Manifest V3'te service worker'ın uyumasını engellemek ve
 * asenkron işlemleri güvenilir bir şekilde yönetmek için 'onMessage' listener'ı
 * 'async' olarak işaretlendi. Bu, 'return true' gibi eski yöntemlere olan ihtiyacı ortadan kaldırır.
 */
chrome.runtime.onMessage.addListener(async (request, sender) => {
  console.log("Background script received action:", request.action); // Hata ayıklama için eklendi

  if (request.action === "sendDataToSheet") {
    if (request.data && (request.data.position || request.data.company)) {
      await handleSheetUpdate(request.data);
    } else {
      console.error("Background: No valid data received from content script.");
      chrome.runtime.sendMessage({ action: "updatePopupStatus", message: "Scrape Failed!" });
    }
  }

  if (request.action === "createSheetFromTemplate") {
    await copyTemplateSheet();
  }
});

async function copyTemplateSheet() {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error("Authentication failed.");

    const driveApiUrl = `https://www.googleapis.com/drive/v3/files/${TEMPLATE_SHEET_ID}/copy`;
    const response = await fetch(driveApiUrl, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: "My Job Application Tracker" })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error.message || `Failed to copy file. Status: ${response.status}`);
    }

    const newFile = await response.json();
    const newSheetUrl = `https://docs.google.com/spreadsheets/d/${newFile.id}/edit`;

    await chrome.storage.sync.set({
      spreadsheetId: newFile.id,
      spreadsheetUrl: newSheetUrl
    });

    // Ayarlar sayfasına başarı mesajı gönder
    chrome.runtime.sendMessage({ action: "sheetCreated", success: true, url: newSheetUrl, id: newFile.id });

  } catch (error) {
    console.error("Background: Failed to create sheet from template.", error);
    chrome.runtime.sendMessage({ action: "sheetCreated", success: false, error: error.message });
  }
}

//  VERİ EKLEME 
/**
 * ÖNEMLİ DEĞİŞİKLİK: Veri ekleme mantığı basitleştirildi.
 * Artık son satırı bulup, yeni satır ekleyip, sonra o satıra yazmak yerine
 * tek bir 'append' işlemi ile veriyi direkt tablonun sonuna ekliyoruz.
 * Bu hem daha az API çağrısı demek, hem de daha az hata riski.
 */
async function handleSheetUpdate(jobData) {
  try {
    const { spreadsheetId } = await chrome.storage.sync.get('spreadsheetId');
    if (!spreadsheetId) throw new Error("Spreadsheet ID is not set in options.");

    const token = await getAuthToken();
    if (!token) throw new Error("Authentication failed.");

    const sheetInfo = await getFirstSheetInfo(token, spreadsheetId);
    if (!sheetInfo) throw new Error("Could not find any visible sheet in the spreadsheet.");
    
    const { sheetName } = sheetInfo;
    const range = `${sheetName}!A:H`;

    const date = new Date();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const applicationDate = `${date.getDate()}/${monthNames[date.getMonth()]}/${date.getFullYear().toString().slice(-2)}`;

    const values = [[
      jobData.company || "",
      jobData.position || "",
      jobData.location || "",
      applicationDate,
      "Başvuru Gönderildi",
      "", // Status
      "", // Notes
      jobData.url || ""
    ]];
    
    const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ values })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || "Failed to append data to the sheet.");
    }

    console.log('Background: Success! Data sent to Sheet.');
    chrome.runtime.sendMessage({ action: "updatePopupStatus", message: "Success!" });

  } catch (error) {
    console.error("Background: An error occurred during sheet update:", error);
    chrome.runtime.sendMessage({ action: "updatePopupStatus", message: `Error: ${error.message}` });
  }
}

function getAuthToken() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve(token);
    });
  });
}

async function getFirstSheetInfo(token, spreadsheetId) {
  const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets(properties(sheetId,title,hidden))`;
  const response = await fetch(apiUrl, { headers: { 'Authorization': `Bearer ${token}` } });
   if (!response.ok) throw new Error("Could not fetch sheet details.");
  const spreadsheet = await response.json();
  const firstVisibleSheet = spreadsheet.sheets.find(s => !s.properties.hidden);
  if (!firstVisibleSheet) return null;
  return {
    sheetId: firstVisibleSheet.properties.sheetId,
    sheetName: firstVisibleSheet.properties.title
  };
}

