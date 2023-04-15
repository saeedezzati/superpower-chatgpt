/* global saveAs */
// eslint-disable-next-line no-unused-vars
function initializeContentMessageListeners() {
  chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    if (message.type === 'writeMhtml') {
      saveAs(message.mhtml, `${message.title}.mhtml`);
    }
  });
}
