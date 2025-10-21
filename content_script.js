console.log("Content script loaded and listening for messages.");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scrapePage") {
    console.log("Content script received 'scrapePage' message.");
    const data = scrapeJobDetails();
    chrome.runtime.sendMessage({ action: "sendDataToSheet", data: data });
    sendResponse({ status: "scraping initiated" });
  }
  return true; 
});


function scrapeJobDetails() {
  const jobData = {};

  // ÖNCE SENİN SAĞLADIĞIN YENİ VE SPESİFİK SEÇİCİLER,
  // SONRA ESKİ, DAHA GENEL YEDEK SEÇİCİLER KULLANILACAK.
  const selectors = {
    position: [
      '.jobs-unified-top-card__job-title',
      '.job-details-jobs-unified-top-card__job-title',
      'h1.t-24'
    ],
    company: [
      // Senin sağladığın yeni seçiciler (öncelikli)
      '#main > div > div.scaffold-layout__list-detail-inner.scaffold-layout__list-detail-inner--grow > div.scaffold-layout__detail.overflow-x-hidden.jobs-search__job-details > div > div.jobs-search__job-details--container > div > div.job-view-layout.jobs-details > div:nth-child(1) > div > div:nth-child(1) > div > div.relative.job-details-jobs-unified-top-card__container--two-pane > div > div.display-flex.align-items-center > div.display-flex.align-items-center.flex-1 > div > a',
      'body > div.application-outlet > div.authentication-outlet > div.scaffold-layout.scaffold-layout--breakpoint-xl.scaffold-layout--main-aside.scaffold-layout--reflow.job-view-layout.jobs-details > div > div > main > div.job-view-layout.jobs-details > div:nth-child(1) > div > div:nth-child(1) > div > div > div > div.display-flex.align-items-center > div.display-flex.align-items-center.flex-1 > div > a',
      // Yedek seçiciler
      '.jobs-unified-top-card__company-name a',
      'a.topcard__org-name-link'
    ],
    location: [
       // Senin sağladığın yeni seçiciler (öncelikli)
      '#main > div > div.scaffold-layout__list-detail-inner.scaffold-layout__list-detail-inner--grow > div.scaffold-layout__detail.overflow-x-hidden.jobs-search__job-details > div > div.jobs-search__job-details--container > div > div.job-view-layout.jobs-details > div:nth-child(1) > div > div:nth-child(1) > div > div.relative.job-details-jobs-unified-top-card__container--two-pane > div > div.job-details-jobs-unified-top-card__primary-description-container > div > span > span:nth-child(1)',
      'body > div.application-outlet > div.authentication-outlet > div.scaffold-layout.scaffold-layout--breakpoint-xl.scaffold-layout--main-aside.scaffold-layout--reflow.job-view-layout.jobs-details > div > div > main > div.job-view-layout.jobs-details > div:nth-child(1) > div > div:nth-child(1) > div > div > div > div.job-details-jobs-unified-top-card__primary-description-container > div > span > span:nth-child(1)',
      // Yedek seçiciler
      '.jobs-unified-top-card__bullet',
      'span.topcard__flavor--bullet'
    ]
  };

  jobData.position = findText(selectors.position) || '';
  jobData.company = findText(selectors.company) || '';
  jobData.location = findText(selectors.location) || '';
  jobData.url = window.location.href;

  console.log("Content Script: Scraped data:", jobData);
  return jobData;
}

function findText(selectorArray) {
  for (const selector of selectorArray) {
    const element = document.querySelector(selector);
    if (element) return element.innerText.trim();
  }
  return null;
}

