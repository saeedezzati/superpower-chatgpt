/* eslint-disable no-unused-vars */
/* global defaultPrompts, createSettingsModal, createPromptChainListModal, runPromptChain */
function addQuickAccessMenuEventListener() {
  document.addEventListener('selectionchange', () => {
    // bsckspace does not trigger selectionchange
    const textAreaElement = document.querySelector('main form textarea');
    if (textAreaElement !== document.activeElement) return;

    const quickAccessMenuElement = document.querySelector('#quick-access-menu');
    const cursorPosition = textAreaElement.selectionStart;
    const textAreaValue = textAreaElement.value;
    const previousAtPosition = textAreaValue.lastIndexOf('@', cursorPosition - 1);
    const previousHashtagPosition = textAreaValue.lastIndexOf('#', cursorPosition - 1);
    if (cursorPosition === 0 || (previousAtPosition === -1 && previousHashtagPosition === -1)) {
      if (quickAccessMenuElement) quickAccessMenuElement.remove();
      return;
    }
    // whichever is closer to the cursor
    const previousTrigger = previousAtPosition > previousHashtagPosition ? '@' : '#';
    const previousTriggerPosition = Math.max(previousAtPosition, previousHashtagPosition);
    // get the word between the previous trigger and the cursor
    if (!quickAccessMenuElement && previousTriggerPosition !== -1 && cursorPosition > previousTriggerPosition && textAreaValue.lastIndexOf(' ', cursorPosition - 1) < previousTriggerPosition) {
      quickAccessMenu(previousTrigger);
    } else if (quickAccessMenuElement && (previousTriggerPosition === -1 || textAreaValue.lastIndexOf(' ', cursorPosition - 1) > previousTriggerPosition)) {
      quickAccessMenuElement.remove();
    }
  });
  document.body.addEventListener('click', (e) => {
    const quickAccessMenuElement = document.querySelector('#quick-access-menu');
    const textAreaElement = document.querySelector('main form textarea');
    if (!quickAccessMenuElement) return;
    if (textAreaElement?.contains(e.target)) {
      setTimeout(() => {
        updateQuickAccessMenuItems();
      }, 100);
      e.stopPropagation();
      const cursorPosition = textAreaElement.selectionStart;
      const textAreaValue = textAreaElement.value;

      const previousAtPosition = textAreaValue.lastIndexOf('@', cursorPosition - 1);
      const previousHashtagPosition = textAreaValue.lastIndexOf('#', cursorPosition - 1);
      if (cursorPosition === 0 || (previousAtPosition === -1 && previousHashtagPosition === -1)) {
        if (quickAccessMenuElement) quickAccessMenuElement.remove();
        return;
      }
      // whichever is closer to the cursor
      const previousTrigger = previousAtPosition > previousHashtagPosition ? '@' : '#';
      const previousTriggerPosition = Math.max(previousAtPosition, previousHashtagPosition);

      // if there is a space between previoustriggerpos and cur cursor position
      if (!quickAccessMenuElement && previousTriggerPosition !== -1 && cursorPosition > previousTriggerPosition && textAreaValue.lastIndexOf(' ', cursorPosition - 1) < previousTriggerPosition) {
        quickAccessMenu(previousTrigger);
      } else if (previousTriggerPosition === -1 || textAreaValue.lastIndexOf(' ', cursorPosition - 1) > previousTriggerPosition) {
        quickAccessMenuElement.remove();
      }
    } else if (!quickAccessMenuElement.contains(e.target)) {
      quickAccessMenuElement.remove();
    }
  });
  document.body.addEventListener('keydown', (event) => {
    const menu = document.querySelector('#quick-access-menu');
    if (!menu) return;
    const menuContent = menu.querySelector('#quick-access-menu-content');
    if (event.key === 'ArrowUp') {
      // rotate focus between quick-access-menu-item s where style.display:block
      const menuItems = menuContent.querySelectorAll('[id^=quick-access-menu-item-]:not([style*="display: none"])');
      if (menuItems.length > 0) {
        if (!menu.contains(document.activeElement)) {
          menu.focus();
          menuItems[menuItems.length - 1].focus();
        } else {
          const currentFocusIndex = Array.from(menuItems).indexOf(document.activeElement);
          if (currentFocusIndex === 0) {
            setTimeout(() => {
              menuContent.scrollTop = menuContent.scrollHeight;
            }, 100);
            menuItems[menuItems.length - 1].focus({ preventScroll: true });
          } else if (currentFocusIndex > 0) {
            menuItems[currentFocusIndex - 1].focus();
          }
        }
      }
    }
    if (event.key === 'ArrowDown') {
      // rotate focus to between quick-access-menu-item s
      const menuItems = menuContent.querySelectorAll('[id^=quick-access-menu-item-]:not([style*="display: none"])');
      if (menuItems.length > 0) {
        if (!menu.contains(document.activeElement)) {
          menu.focus();
          menuItems[0].focus();
        } else {
          const currentFocusIndex = Array.from(menuItems).indexOf(document.activeElement);
          if (currentFocusIndex === menuItems.length - 1) {
            setTimeout(() => {
              menuContent.scrollTop = 0;
            }, 100);
            menuItems[0].focus({ preventScroll: true });
          } else if (currentFocusIndex < menuItems.length - 1) {
            menuItems[currentFocusIndex + 1].focus();
          }
        }
      }
    }
    if (event.key === 'Backspace') {
      if (document.activeElement !== document.querySelector('main form textarea')) {
        event.preventDefault();
      }
      document.querySelector('main form textarea').focus();
    }
  });
}
function updateQuickAccessMenuItems() {
  // find the closest trigger
  const textAreaElement = document.querySelector('main form textarea');
  const quickAccessMenuElement = document.querySelector('#quick-access-menu');
  if (!textAreaElement || !quickAccessMenuElement) return;
  const cursorPosition = textAreaElement.selectionStart;
  const textAreaValue = textAreaElement.value;
  const previousAtPosition = textAreaValue.lastIndexOf('@', cursorPosition - 1);
  const previousHashtagPosition = textAreaValue.lastIndexOf('#', cursorPosition - 1);
  if (cursorPosition === 0 || (previousAtPosition === -1 && previousHashtagPosition === -1)) {
    return;
  }
  let nextSpacePos = textAreaValue.indexOf(' ', cursorPosition);
  if (nextSpacePos === -1) nextSpacePos = textAreaValue.length;
  const previousTriggerPosition = Math.max(previousAtPosition, previousHashtagPosition);

  const triggerWord = textAreaValue.substring(previousTriggerPosition + 1, nextSpacePos);

  const menuItems = quickAccessMenuElement.querySelectorAll('button');
  menuItems.forEach((item) => {
    const itemText = item.textContent;

    if (itemText.toLowerCase().includes(triggerWord.toLowerCase())) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}
function quickAccessMenu(trigger) {
  const existingMenu = document.querySelector('#quick-access-menu');
  if (existingMenu) {
    existingMenu.remove();
    return;
  }
  const menu = document.createElement('div');
  menu.id = 'quick-access-menu';
  menu.classList = 'absolute flex flex-col gap-2 bg-white dark:bg-gray-800 border border-white/20 rounded shadow-xs';
  menu.style = 'height: 300px; top:-300px; left:0; width:100%; z-index: 1000;';
  const menuHeader = document.createElement('div');
  menuHeader.classList = 'flex justify-between items-center p-2 border-b dark:border-white/20 border-gray-900/50';
  const menuTitle = document.createElement('h3');
  menuTitle.classList = 'text-lg font-bold';
  menuHeader.appendChild(menuTitle);
  const menuHeaderButton = document.createElement('button');
  menuHeaderButton.classList = 'btn flex justify-center gap-2 btn-primary border-0 md:border';
  menuHeaderButton.type = 'button';
  menuHeader.appendChild(menuHeaderButton);
  menu.appendChild(menuHeader);
  if (trigger === '@') {
    menuTitle.textContent = 'Custom Prompts (@)';
    menuHeaderButton.id = 'see-all-custom-prompts';
    menuHeaderButton.textContent = '+ Add More';
    menuHeaderButton.addEventListener('click', () => {
      menu.remove();
      createSettingsModal(3);
    });
    menu.appendChild(loadCustomPrompts());
  }
  if (trigger === '#') {
    menuTitle.textContent = 'Prompt Chains (#)';
    menuHeaderButton.id = 'see-all-prompt-chains';
    menuHeaderButton.textContent = 'See All Prompt Chains';
    menuHeaderButton.addEventListener('click', () => {
      menu.remove();
      createPromptChainListModal();
    });
    menu.appendChild(loadPromptChains());
  }
  const textAreaElement = document.querySelector('main form textarea');
  textAreaElement.parentElement.appendChild(menu);
}
function loadCustomPrompts() {
  const menuContent = document.createElement('div');
  menuContent.id = 'quick-access-menu-content';
  menuContent.classList = 'flex flex-col gap-2';
  menuContent.style = 'overflow-y: scroll;height: 100%; width: 100%;padding:1px;';
  chrome.storage.local.get(['customPrompts'], (result) => {
    let { customPrompts } = result;
    if (!customPrompts) customPrompts = defaultPrompts;
    const sortedCustomPrompts = customPrompts.sort((a, b) => a.title.localeCompare(b.title));
    for (let i = 0; i < sortedCustomPrompts.length; i += 1) {
      const prompt = sortedCustomPrompts[i];
      const promptElement = document.createElement('button');
      promptElement.id = `quick-access-menu-item-${i}`;
      promptElement.classList = 'btn w-full text-left focus:outline focus:ring-2 focus:ring-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700';
      promptElement.innerHTML = `<span style="font-weight:bold; font-size:16px; margin-right:16px;white-space: nowrap; overflow: hidden; text-overflow: ellipsis;display:block;width:100%;">${prompt.title}</span><span style="font-size:14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;display:block;width:100%;color:#888;">${prompt.text}</span>`;
      promptElement.addEventListener('click', () => {
        const inputForm = document.querySelector('main form');
        if (!inputForm) return;
        const textAreaElement = inputForm.querySelector('textarea');
        if (!textAreaElement) return;
        document.querySelector('#quick-access-menu').remove();
        // find the neeares previous @ position
        const textAreaValue = textAreaElement.value;
        const cursorPosition = textAreaElement.selectionStart;
        const previousAtPosition = textAreaValue.lastIndexOf('@', cursorPosition);
        const newText = textAreaValue.substring(0, previousAtPosition) + prompt.text + textAreaValue.substring(cursorPosition);
        textAreaElement.value = newText;
        textAreaElement.focus();
        textAreaElement.dispatchEvent(new Event('input', { bubbles: true }));
        textAreaElement.dispatchEvent(new Event('change', { bubbles: true }));
      });
      menuContent.appendChild(promptElement);
    }
  });
  return menuContent;
}
function loadPromptChains() {
  const menuContent = document.createElement('div');
  menuContent.id = 'quick-access-menu-content';
  menuContent.classList = 'flex flex-col gap-2';
  menuContent.style = 'overflow-y: scroll;height: 100%; width: 100%;padding:1px;';
  chrome.storage.local.get(['promptChains'], (result) => {
    const { promptChains } = result;
    const sortedPromptChains = promptChains.sort((a, b) => a.title.localeCompare(b.title));
    if (!promptChains) {
      const noPromptChains = document.createElement('div');
      noPromptChains.classList = 'text-center text-gray-500';
      noPromptChains.textContent = 'You haven\'t created any prompt chain yet.';
      menuContent.appendChild(noPromptChains);
      return;
    }
    for (let i = 0; i < sortedPromptChains.length; i += 1) {
      const prompt = sortedPromptChains[i];
      const promptElement = document.createElement('button');
      promptElement.id = `quick-access-menu-item-${i}`;
      promptElement.classList = 'btn w-full text-left focus:outline focus:ring-2 focus:ring-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700';
      promptElement.innerHTML = `<span style="font-weight:bold; font-size:16px; margin-right:16px;white-space: nowrap; overflow: hidden; text-overflow: ellipsis;display:block;width:100%;">${prompt.title}</span><span style="font-size:14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;display:block;width:100%;color:#888;">Step 1: ${prompt.steps[0]}</span>`;
      // also trigger on enter
      promptElement.addEventListener('click', () => {
        runPromptChain(prompt.steps, false);
      });
      menuContent.appendChild(promptElement);
    }
  });
  return menuContent;
}
