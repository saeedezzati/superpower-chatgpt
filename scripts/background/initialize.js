// eslint-disable-next-line prefer-const
// let changeInfoStatus = 'loading';
// let tabStatus = 'loading';
// initialize environment to be production
let API_URL = 'https://api.wfh.team';

chrome.storage.local.set({ API_URL });

chrome.management.getSelf(
  (extensionInfo) => {
    if (extensionInfo.installType === 'development') {
      API_URL = 'https://dev.wfh.team:8000';
    }
    chrome.storage.local.set({ API_URL });
  },
);

// const debounce = (func, wait = 1000) => {
//   let timeout;

//   return function executedFunction(...args) {
//     const later = () => {
//       clearTimeout(timeout);
//       func(...args);
//     };

//     clearTimeout(timeout);
//     timeout = setTimeout(later, wait);
//   };
// };

// function that injects code to a specific tab
// const injectScript = debounce((tabId) => {
//   chrome.scripting.executeScript(
//     {
//       target: { tabId },
//       files: ['scripts/content/initialize.js'],
//     },
//   );
// });

chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if (request.setUninstallURL) {
      chrome.runtime.setUninstallURL(`${API_URL}/gptx/uninstall?p=${request.userId}`);
    }
  },
);
chrome.runtime.onInstalled.addListener((detail) => {
  chrome.management.getSelf(
    (extensionInfo) => {
      if (extensionInfo.installType !== 'development') {
        if (detail.reason === 'install') {
          chrome.tabs.create({ url: 'https://ezi.notion.site/Superpower-ChatGPT-FAQ-9d43a8a1c31745c893a4080029d2eb24' });
          chrome.tabs.create({ url: 'https://superpowerdaily.com' });
          chrome.tabs.create({ url: 'https://chat.openai.com', active: true });
        } else {
          chrome.tabs.create({ url: 'https://superpowerdaily.com' });
        }
      }
    },
  );
});
chrome.action.onClicked.addListener((tab) => {
  if (!tab.url) {
    chrome.tabs.update(tab.id, { url: 'https://chat.openai.com' });
  } else {
    chrome.tabs.create({ url: 'https://chat.openai.com', active: true });
  }
});

// adds a listener to tab change
// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   if (changeInfo.status === 'complete') {
//     changeInfoStatus = changeInfo.status;
//   }
//   if (tab.status === 'complete') {
//     tabStatus = tab.status;
//   }
//   if (changeInfoStatus === 'complete' && tabStatus === 'complete' && tab.title) {
//     injectScript(tabId);
//     changeInfoStatus = 'loading';
//     tabStatus = 'loading';
//     setTimeout(() => {
//       injectScript(tabId);
//       changeInfoStatus = 'loading';
//       tabStatus = 'loading';
//     }, 2000);
//   }
// });
