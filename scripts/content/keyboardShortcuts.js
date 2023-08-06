/* global isWindows, createModal, settingsModalActions, initializePluginStoreModal, addPluginStoreEventListener, showNewChatPage, createPromptChainListModal */

// eslint-disable-next-line no-unused-vars
function createKeyboardShortcutsModal(version) {
  const bodyContent = keyboardShortcutsModalContent(version);
  const actionsBarContent = keyboardShortcutsModalActions();
  createModal('Keyboard Shortcuts', 'Some shortkeys only work when Auto-Sync is ON. Having issues? see our <a href="https://ezi.notion.site/Superpower-ChatGPT-FAQ-9d43a8a1c31745c893a4080029d2eb24" target="_blank" rel="noopener noreferrer" style="color:gold;">FAQ</a>', bodyContent, actionsBarContent);
}

function keyboardShortcutsModalContent() {
  // create newsletterList modal content
  const content = document.createElement('div');
  content.id = 'modal-content-keyboard-shortcuts-list';
  content.style = 'overflow-y: hidden;position: relative;height:100%; width:100%';
  content.classList = 'markdown prose-invert';
  const logoWatermark = document.createElement('img');
  logoWatermark.src = chrome.runtime.getURL('icons/logo.png');
  logoWatermark.style = 'position: fixed; top: 50%; right: 50%; width: 400px; height: 400px; opacity: 0.07; transform: translate(50%, -50%);box-shadow:none !important;';
  content.appendChild(logoWatermark);
  const keyboardShortcutsText = document.createElement('div');
  keyboardShortcutsText.style = 'display: flex; flex-direction: column; justify-content: start; align-items: start;overflow-y: scroll; height: 100%; width: 100%; white-space: break-spaces; overflow-wrap: break-word;padding: 16px;position: relative;z-index:10;color: #fff;';
  keyboardShortcutsText.innerHTML = `
  <table style="width:100%">
    <tr>
      <th>Shortcut</th>
      <th>Action</th>
    </tr>
    <tr>
      <td>CTRL/CMD + F</td>
      <td>Search Chats (To use browser search, press “CTRL/CMD + F” twice)</td>
    </tr>
    <tr>
      <td>CTRL/CMD + SHIFT + S</td>
      <td>Open Settings</td>
    </tr>
    <tr>
      <td>CTRL/CMD + SHIFT + P</td>
      <td>Open Plugin Store</td>
    </tr>
    <tr>
      <td>CTRL/CMD + SHIFT + L</td>
      <td>Open Newsletter Archive</td>
    </tr>
    <tr>
      <td>CTRL/CMD + SHIFT + X (or SHIFT + Click on New Prompt Chain button)</td>
      <td>Open Prompt Chain List</td>
    </tr>
    <tr>
      <td>CTRL/CMD + SHIFT + C</td>
      <td>Open New Prompt Chain Modal</td>
    </tr>
    <tr>
      <td>CTRL/CMD + SHIFT + K</td>
      <td>Open Keyboard Shortcut modal</td>
    </tr>
    <tr>
      <td>CTRL/CMD + ALT + H</td>
      <td>Hide/show the sidebar</td>
    </tr>
    <tr>
      <td>CTRL/CMD + SHIFT + Click on the new folder icon</td>
      <td>Reset the order of chats from newest to oldest (removes all folders)</td>
    </tr>
    <tr>
      <td>CTRL/CMD + SHIFT + Click on the sync button in the bottom-left corner</td>
      <td>Reset Auto Sync</td>
    </tr>
    <tr>
      <td>ALT + SHIFT + N</td>
      <td>Open New Chat Page</td>
    </tr>
    <tr>
      <td>HOME</td>
      <td>Scroll to top</td>
    </tr>
    <tr>
      <td>END</td>
      <td>Scroll to bottom</td> 
    </tr>
    <tr>
      <td>ESC</td>
      <td>Close modals or stop generating</td>
    </tr>
  </table>
  `;
  content.appendChild(keyboardShortcutsText);
  return content;
}

function keyboardShortcutsModalActions() {
  return settingsModalActions();
}
function showPluginStore() {
  chrome.storage.local.get(['allPlugins'], (result) => {
    const { allPlugins } = result;
    const popularPlugins = allPlugins.filter((plugin) => plugin.categories.map((c) => c.id).includes('most_popular'));
    const pluginStoreModal = initializePluginStoreModal(popularPlugins);
    const pluginStoreWrapper = document.createElement('div');
    pluginStoreWrapper.id = 'plugin-store-wrapper';
    pluginStoreWrapper.classList = 'absolute inset-0 z-10';
    pluginStoreWrapper.innerHTML = pluginStoreModal;
    document.body.appendChild(pluginStoreWrapper);
    addPluginStoreEventListener(popularPlugins);
  });
}
function registerShortkeys() {
  chrome.storage.local.get(['settings'], (result) => {
    const { settings } = result;
    const autoSync = typeof settings?.autoSync === 'undefined' || settings?.autoSync;
    document.addEventListener('keydown', (e) => {
      if (autoSync && (e.metaKey || (isWindows() && e.ctrlKey))) {
        if (e.key === 'f' || e.key === 'F') {
          const searchbox = document.querySelector('#conversation-search');
          if (searchbox && searchbox !== document.activeElement) {
            searchbox.scrollIntoView();
            searchbox.focus();
            e.preventDefault();
          }
        }
      }
      // esc
      if (e.keyCode === 27) {
        if (document.querySelector('[id*=close-button]')) {
          document.querySelector('[id*=close-button]').click();
        } else if (document.querySelector('[id*=cancel-button]')) {
          document.querySelector('[id*=cancel-button]').click();
        } else if (document.querySelector('#quick-access-menu')) {
          document.querySelector('#quick-access-menu').remove();
          document.querySelector('main form textarea').focus();
        } else {
          const stopGeneratingResponseButton = document.querySelector('#stop-generating-response-button');
          if (stopGeneratingResponseButton) {
            e.preventDefault();
            stopGeneratingResponseButton.click();
          }
        }
      }
      // cmnd + shift + p
      if ((e.metaKey || (isWindows() && e.ctrlKey)) && e.shiftKey && e.keyCode === 80) {
        e.preventDefault();
        showPluginStore();
      }
      // cmnd + shift + k
      if ((e.metaKey || (isWindows() && e.ctrlKey)) && e.shiftKey && e.keyCode === 75) {
        e.preventDefault();
        createKeyboardShortcutsModal();
      }
      // cmnd + shift + c
      if (autoSync && (e.metaKey || (isWindows() && e.ctrlKey)) && e.shiftKey && e.keyCode === 67) {
        e.preventDefault();
        const promptChainCreateModal = document.querySelector('#new-prompt-chain-modal');
        const promptChainCreateButton = document.querySelector('#prompt-chain-create-button');
        if (!promptChainCreateModal && promptChainCreateButton) {
          promptChainCreateButton.click();
        }
      }
      // cmnd + shift + x
      if (autoSync && (e.metaKey || (isWindows() && e.ctrlKey)) && e.shiftKey && e.keyCode === 88) {
        e.preventDefault();
        const promptChainListModal = document.querySelector('#modal-prompt-chains');
        if (!promptChainListModal) {
          createPromptChainListModal();
        }
      }
      // alt + shift + n
      if (e.altKey && e.shiftKey && e.keyCode === 78) {
        e.preventDefault();
        showNewChatPage();
      }
      // cmd/ctrl + alt + h
      if ((e.metaKey || (isWindows() && e.ctrlKey)) && e.altKey && e.keyCode === 72) {
        e.preventDefault();
        const navToggleButton = document.querySelector('#nav-toggle-button');
        if (navToggleButton) {
          navToggleButton.click();
        }
      }
      // home key
      if (e.keyCode === 36) {
        // if active element is not the textarea, scroll to top
        if (document.activeElement.tagName !== 'TEXTAREA') {
          e.preventDefault();
          document.querySelector('#scroll-up-button').click();
        }
      }
      // end key
      if (e.keyCode === 35) {
        if (document.activeElement.tagName !== 'TEXTAREA') {
          e.preventDefault();
          document.querySelector('#scroll-down-button').click();
        }
      }
      // cmd/ctrl + shift + s
      if ((e.metaKey || (isWindows() && e.ctrlKey)) && e.shiftKey && e.keyCode === 83) {
        if (!document.querySelector('#modal-settings')) {
          e.preventDefault();
          // open settings
          document.querySelector('#settings-button')?.click();
        }
        setTimeout(() => {
          window.localStorage.setItem('UiState.isNavigationCollapsed.1', 'false');
          document.querySelector('button[aria-label*=sidebar]')?.remove();
        }, 300);
      }
      // cmd/ctrl + shift + l
      if ((e.metaKey || (isWindows() && e.ctrlKey)) && e.shiftKey && e.keyCode === 76) {
        if (!document.querySelector('#modal-newsletter-archive')) {
          // open newsletter
          e.preventDefault();
          document.querySelector('#newsletter-button')?.click();
        }
      }
    });
  });
}
function addKeyboardShortcutsModalButton() {
  const existingKeyboardShortcutsModalButton = document.getElementById('keyboard-shortcuts-modal-button');
  if (existingKeyboardShortcutsModalButton) existingKeyboardShortcutsModalButton.remove();

  const keyboardShortcutsModalButton = document.createElement('button');
  keyboardShortcutsModalButton.id = 'keyboard-shortcuts-modal-button';
  keyboardShortcutsModalButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="1.5em" viewBox="0 0 576 512" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="0" fill="currentColor"><path d="M64 112c-8.8 0-16 7.2-16 16V384c0 8.8 7.2 16 16 16H512c8.8 0 16-7.2 16-16V128c0-8.8-7.2-16-16-16H64zM0 128C0 92.7 28.7 64 64 64H512c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128zM176 320H400c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H176c-8.8 0-16-7.2-16-16V336c0-8.8 7.2-16 16-16zm-72-72c0-8.8 7.2-16 16-16h16c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H120c-8.8 0-16-7.2-16-16V248zm16-96h16c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H120c-8.8 0-16-7.2-16-16V168c0-8.8 7.2-16 16-16zm64 96c0-8.8 7.2-16 16-16h16c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H200c-8.8 0-16-7.2-16-16V248zm16-96h16c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H200c-8.8 0-16-7.2-16-16V168c0-8.8 7.2-16 16-16zm64 96c0-8.8 7.2-16 16-16h16c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H280c-8.8 0-16-7.2-16-16V248zm16-96h16c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H280c-8.8 0-16-7.2-16-16V168c0-8.8 7.2-16 16-16zm64 96c0-8.8 7.2-16 16-16h16c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H360c-8.8 0-16-7.2-16-16V248zm16-96h16c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H360c-8.8 0-16-7.2-16-16V168c0-8.8 7.2-16 16-16zm64 96c0-8.8 7.2-16 16-16h16c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H440c-8.8 0-16-7.2-16-16V248zm16-96h16c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H440c-8.8 0-16-7.2-16-16V168c0-8.8 7.2-16 16-16z"/></svg>';
  keyboardShortcutsModalButton.className = 'absolute flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-200 text-xs font-sans cursor-pointer rounded-md z-10';
  keyboardShortcutsModalButton.style = 'bottom: 3rem;right: 3rem;width: 2rem;height: 2rem;flex-wrap:wrap;border: 1px solid;';
  keyboardShortcutsModalButton.addEventListener('click', () => {
    createKeyboardShortcutsModal();
  });
  document.body.appendChild(keyboardShortcutsModalButton);
}
// eslint-disable-next-line no-unused-vars
function initializeKeyboardShortcuts() {
  registerShortkeys();
  addKeyboardShortcutsModalButton();
}
