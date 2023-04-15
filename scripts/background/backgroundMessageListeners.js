// chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
//   if (message.type === 'safeMode') {
//     chrome.declarativeNetRequest.updateDynamicRules(
//       {
//         addRules: [
//           {

//             id: 1,
//             priority: 1,
//             action: {
//               type: message.safeMode ? 'allow' : 'block',
//             },
//             condition: {
//               urlFilter: 'moderations',
//               resourceTypes: ['xmlhttprequest'],
//             },
//           },
//         ],
//         removeRuleIds: [1],
//       },
//     );
//   }
//   if (message.type === 'readMhtml') {
//     chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
//       chrome.pageCapture.saveAsMHTML({ tabId: tabs[0].id }, (mhtml) => {
//         const reader = new FileReader();
//         reader.readAsDataURL(mhtml);
//         reader.onloadend = () => {
//           const base64data = reader.result;
//           chrome.tabs.sendMessage(tabs[0].id, { type: 'writeMhtml', title: message.title, mhtml: base64data });
//         };
//       });
//     });
//   }
// });
