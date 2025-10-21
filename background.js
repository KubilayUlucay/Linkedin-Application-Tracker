// Template sheet ID
const TEMPLATE_SHEET_ID = '138_o2fC39qJjVmbRc4l2aYoFwpMKG4UbsQg2RLin7Yk';

chrome.runtime.onMessage.addListener(async (request, sender) => {
  console.log("Background script received action:", request.action);

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
  
  if (request.action === "forceAuthorize") {
    try {
      // This function now uses launchWebAuthFlow
      const token = await getAuthToken(true); 
      if (token) {
        console.log("Authorization successful.");
        chrome.runtime.sendMessage({ action: "authorizationComplete", success: true });
      } else {
        throw new Error("Token was not returned.");
      }
    } catch (error) {
      console.error("Background: Authorization failed.", error);
      chrome.runtime.sendMessage({ action: "authorizationComplete", success: false, error: error.message });
    }
  }
});


// =================================================================
// === COPY FROM TEMPLATE ===
// =================================================================
async function copyTemplateSheet() {
  try {
    const token = await getAuthToken(true); // Interactive
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
      spreadsheetUrl: newSheetUrl,
    });

    chrome.runtime.sendMessage({ action: "sheetCreated", success: true, url: newSheetUrl, id: newFile.id });

  } catch (error) {
    console.error("Background: Failed to create sheet from template.", error);
    chrome.runtime.sendMessage({ action: "sheetCreated", success: false, error: error.message });
  }
}

// =================================================================
// === ADD DATA ===
// =================================================================
async function handleSheetUpdate(jobData) {
  try {
    const { spreadsheetId } = await chrome.storage.sync.get('spreadsheetId');
    if (!spreadsheetId) throw new Error("Spreadsheet ID is not set in options.");

    // We now use a single function that gets a cached token or requests a new one.
    const token = await getAuthToken(false); // Silent
    if (!token) throw new Error("Authentication failed. Please use Settings to authorize.");

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
        // Handle token expiration
        if (response.status === 401) {
            console.log("Token expired or revoked. Forcing re-auth.");
            // Remove the bad token
            const { access_token } = await chrome.storage.local.get('access_token');
            if (access_token) {
                 // This function does not exist in chrome.identity, so we just clear storage
            }
            await chrome.storage.local.remove(['access_token', 'token_expires_at', 'refresh_token']);
            // Instruct user to re-run
            throw new Error("Token expired. Please click 'Add to Sheet' again to re-authorize.");
        }
        throw new Error(errorData.error.message || "Failed to append data to the sheet.");
    }

    console.log('Background: Success! Data sent to Sheet.');
    chrome.runtime.sendMessage({ action: "updatePopupStatus", message: "Success!" });

  } catch (error) {
    console.error("Background: An error occurred during sheet update:", error);
    let errorMessage = error.message;
    
    if (errorMessage.includes("interactive") || errorMessage.includes("Authorization required")) {
        errorMessage = "Permission needed. Please go to Settings and click 'Grant Permission' to authorize.";
    } else if (errorMessage.includes("404") || errorMessage.includes("Spreadsheet not found")) {
         errorMessage = "Error: Spreadsheet not found. Check the URL in Settings.";
    }
    
    chrome.runtime.sendMessage({ action: "updatePopupStatus", message: `Error: ${errorMessage}` });
  }
}

// =================================================================
// === NEW AUTH FUNCTION (launchWebAuthFlow) ===
// =================================================================

async function getAuthToken(isInteractive) {
  // Check for a valid, stored token first
  const storedToken = await chrome.storage.local.get(['access_token', 'token_expires_at']);
  if (storedToken.access_token && storedToken.token_expires_at > Date.now()) {
    console.log("Using cached token.");
    return storedToken.access_token;
  }
  
  // NOTE: Refresh token logic is complex and not fully implemented here.
  // We will just re-prompt the user, which is simpler for this use case.

  // If no valid token, and not interactive, fail.
  if (!isInteractive) {
    console.log("No cached token and non-interactive mode. Requesting interactive auth.");
    throw new Error("Authorization required. Please authorize in settings or click 'Add to Sheet' again.");
  }
  
  console.log("No valid token. Starting interactive auth flow.");
  
  // ==================
  // === THIS IS THE FIX ===
  // ==================
  // PASTE YOUR CLIENT SECRET FROM GOOGLE CLOUD CONSOLE HERE
  const clientSecret = "YOUR_CLIENT_SECRET_GOES_HERE";
  // ==================

  // 1. Get manifest details
  const manifest = chrome.runtime.getManifest();
  const clientId = manifest.oauth2.client_id;
  const scopes = manifest.oauth2.scopes;
  const redirectUri = chrome.identity.getRedirectURL(); // Gets the special extension redirect URL
  
  console.log("DIAGNOSTIC: Client ID:", clientId);
  console.log("DIAGNOSTIC: Redirect URI:", redirectUri);
  
  // 2. Build the Auth URL
  let authUrl = `https://accounts.google.com/o/oauth2/v2/auth`;
  authUrl += `?client_id=${clientId}`;
  authUrl += `&response_type=code`;
  authUrl += `&redirect_uri=${encodeURIComponent(redirectUri)}`;
  authUrl += `&scope=${encodeURIComponent(scopes.join(' '))}`;
  authUrl += `&access_type=offline`; // Request a refresh token
  authUrl += `&prompt=consent`; // Force consent screen to get refresh token

  return new Promise((resolve, reject) => {
    // 3. Launch the web auth flow
    chrome.identity.launchWebAuthFlow({
      url: authUrl,
      interactive: true
    }, async (responseUrl) => {
      if (chrome.runtime.lastError || !responseUrl) {
        return reject(new Error(chrome.runtime.lastError ? chrome.runtime.lastError.message : "Auth flow was cancelled."));
      }

      try {
        // 4. Extract the authorization code from the redirect URL
        const url = new URL(responseUrl);
        const authCode = url.searchParams.get('code');
        if (!authCode) {
          return reject(new Error("Could not find authorization code in response."));
        }

        // 5. Exchange the authorization code for an access token and refresh token
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          // ==================
          // === THIS IS THE FIX ===
          // ==================
          // The client_secret is now added to the request body
          body: `code=${authCode}&client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${encodeURIComponent(redirectUri)}&grant_type=authorization_code`
          // ==================
        });

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json();
          throw new Error(`Token exchange failed: ${errorData.error_description || errorData.error}`);
        }

        const tokenData = await tokenResponse.json();
        
        // 6. Store the new token and its expiration time
        const expiresAt = Date.now() + (tokenData.expires_in * 1000);
        await chrome.storage.local.set({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token, // Store refresh token for long-term use
          token_expires_at: expiresAt
        });

        console.log("Successfully retrieved and stored new token.");
        resolve(tokenData.access_token);

      } catch (error) {
        console.error("Error during token exchange:", error);
        reject(error);
      }
    });
  });
}


// =================================================================
// === HELPER FUNCTIONS ===
// =================================================================

async function getFirstSheetInfo(token, spreadsheetId) {
  const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets(properties(sheetId,title,hidden))`;
  const response = await fetch(apiUrl, { headers: { 'Authorization': `Bearer ${token}` } });
   if (!response.ok) {
       if(response.status === 404) {
           throw new Error("Spreadsheet not found (404).");
       }
       throw new Error("Could not fetch sheet details.");
   }
  const spreadsheet = await response.json();
  const firstVisibleSheet = spreadsheet.sheets.find(s => !s.properties.hidden);
  if (!firstVisibleSheet) return null;
  return {
    sheetId: firstVisibleSheet.properties.sheetId,
    sheetName: firstVisibleSheet.properties.title
  };
}