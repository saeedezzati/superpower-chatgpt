/* global navigation, initializeStorage, cleanNav, initializeContinue, initializeExport, initializeSettings, initializePromptHistory, initializePromptLibrary, initializeNewsletter, initializeAutoSave, addNavToggleButton, initializeAnnouncement, initializeReleaseNote, initializeReplaceDeleteConversationButton, initializeCopyAndCounter, initializeAddToPromptLibrary, initializeTimestamp, updateNewChatButtonNotSynced, addAsyncInputEvents, addDevIndicator, addExpandButton, openLinksInNewTab, arkoseTrigger, initializeKeyboardShortcuts, addArkoseCallback, addQuickAccessMenuEventListener, upgradeCustomInstructions, watchError, showAutoSyncToast, addAutoSyncToggleButton, addSounds */

// eslint-disable-next-line no-unused-vars
function initialize() {
  const historyButton = document.querySelector('a[id="my-prompt-history-button"]');
  if (window.location.pathname.startsWith('/share/') && !window.location.pathname.endsWith('/continue')) return;

  if (!historyButton) {
    setTimeout(() => {
      initializeStorage().then(() => {
        // watchError();
        openLinksInNewTab();
        addNavToggleButton();
        addQuickAccessMenuEventListener();
        cleanNav();
        upgradeCustomInstructions();
        initializeExport();
        initializeContinue();
        initializeNewsletter();
        initializeSettings();
        initializeAnnouncement();
        initializeReleaseNote();
        initializePromptLibrary();
        initializePromptHistory();
        addExpandButton();
        addDevIndicator();
        initializeKeyboardShortcuts();
        addSounds();
        arkoseTrigger(false);
        addArkoseCallback();
        // showAutoSyncToast();
        setTimeout(() => {
          chrome.storage.local.get(['settings'], (result) => {
            const { settings } = result;
            if ((typeof settings?.autoSync === 'undefined' || settings?.autoSync) && !window.location.pathname.startsWith('/share/')) {
              // if (typeof settings?.autoSync === 'undefined' || settings?.autoSync) {
              initializeAutoSave();
            } else {
              addAutoSyncToggleButton();
              initializeCopyAndCounter();
              initializeAddToPromptLibrary();
              initializeTimestamp();
              updateNewChatButtonNotSynced();
              addAsyncInputEvents();
              navigation.addEventListener('navigate', () => {
                setTimeout(() => {
                  addAsyncInputEvents();
                }, 500);
              });
            }
            initializeReplaceDeleteConversationButton();
          });
        });
      }, 100);
    }, 100);
  }
}
initialize();
