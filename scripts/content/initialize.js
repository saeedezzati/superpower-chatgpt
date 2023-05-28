/* global getAccount, getModels, getConversationLimit, initializeStorage, cleanNav, initializeContinue, initializeExport, initializeSettings, initializePromptHistory, initializePromptLibrary, initializeNewsletter, initializeAutoSave, addNavToggleButton, initializeAnnouncement, initializeReleaseNote, initializeReplaceDeleteConversationButton, initializeCopyAndCounter, initializeAddToPromptLibrary, initializeTimestamp, updateNewChatButtonNotSynced, addAsyncInputEvents, initializeContentMessageListeners, registerShortkeys, addDevIndicator, addExpandButton, openLinksInNewTab */

// eslint-disable-next-line no-unused-vars
function initialize() {
  const historyButton = document.querySelector('a[id="my-prompt-history-button"]');
  if (window.location.pathname.startsWith('/share/') && !window.location.pathname.endsWith('/continue')) return;
  if (!historyButton) {
    setTimeout(() => {
      initializeStorage().then(() => {
        registerShortkeys();
        getAccount();
        getModels();
        getConversationLimit();
        openLinksInNewTab();
        addNavToggleButton();
        initializeContentMessageListeners();
        cleanNav();
        initializeContinue();
        initializeNewsletter();
        initializeExport();
        initializeSettings();
        initializeAnnouncement();
        initializeReleaseNote();
        initializePromptLibrary();
        initializePromptHistory();
        addExpandButton();
        addDevIndicator();
        setTimeout(() => {
          chrome.storage.local.get(['settings'], (result) => {
            const { settings } = result;
            if ((typeof settings?.autoSync === 'undefined' || settings?.autoSync) && !window.location.pathname.startsWith('/share/')) {
            // if (typeof settings?.autoSync === 'undefined' || settings?.autoSync) {
              initializeAutoSave();
            } else {
              initializeCopyAndCounter();
              initializeAddToPromptLibrary();
              initializeTimestamp();
              updateNewChatButtonNotSynced();
              addAsyncInputEvents();
            }
            initializeReplaceDeleteConversationButton();
          });
        });
      }, 100);
    }, 100);
  }
}
initialize();
