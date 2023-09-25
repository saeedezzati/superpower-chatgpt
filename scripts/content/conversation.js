/* eslint-disable no-restricted-globals */
// eslint-disable-next-line no-unused-vars
/* global getConversation, submitChat, openSubmitPromptModal, initializeRegenerateResponseButton, showHideTextAreaElement, rowAssistant, rowUser, copyRichText, messageFeedback, openFeedbackModal, refreshConversations, initializeStopGeneratingResponseButton, chatStreamIsClosed:true, generateInstructions, isGenerating:true, scrolUpDetected:true, addScrollDetector, languageList, writingStyleList, toneList, showAutoSyncWarning, arkoseTrigger */

function addPinNav(sortedNodes) {
  chrome.storage.local.get(['settings'], (res) => {
    const { settings } = res;
    const { showPinNav } = settings;
    const existingPinNav = document.querySelector('#pin-nav');
    if (existingPinNav) existingPinNav.remove();
    if (!showPinNav) return;
    const pinNav = document.createElement('div');
    pinNav.classList = 'flex flex-col items-center py-4 mr-4 absolute right-0 top-0 z-50 justify-center overflow-y-scroll';
    pinNav.style = 'height:calc(100vh - 56px);';
    pinNav.id = 'pin-nav';
    sortedNodes.forEach((node) => {
      const { id, pinned } = node;
      if (!pinned) return;
      const pin = document.createElement('button');
      pin.style = 'background-color: transparent; border: none; cursor: pointer;width:100%;width: 18px; margin-bottom:4px;transition: width 0.2s ease-in-out;';
      pin.id = `pin-nav-item-${id}`;
      pin.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="gold" d="M48 0H336C362.5 0 384 21.49 384 48V487.7C384 501.1 373.1 512 359.7 512C354.7 512 349.8 510.5 345.7 507.6L192 400L38.28 507.6C34.19 510.5 29.32 512 24.33 512C10.89 512 0 501.1 0 487.7V48C0 21.49 21.49 0 48 0z"/></svg>';
      pin.addEventListener('click', () => {
        const messageWrapper = document.querySelector(`#message-wrapper-${id}`);
        messageWrapper.scrollIntoView({ behavior: 'smooth' });
      });
      pinNav.appendChild(pin);
      const messagePinButton = document.querySelector(`#message-pin-button-${id}`);
      observePinButton(messagePinButton);
    });
    const main = document.querySelector('main');

    main.appendChild(pinNav);
  });
}
function updateModel(modelSlug, fullConversation) {
  const pluginIds = fullConversation.plugin_ids || [];

  const { languageCode, toneCode, writingStyleCode } = fullConversation;

  if (!modelSlug) return;
  chrome.storage.local.get(['settings', 'models', 'unofficialModels', 'customModels', 'enabledPluginIds'], ({
    settings, models, unofficialModels, customModels, enabledPluginIds,
  }) => {
    const allModels = [...models, ...unofficialModels, ...customModels];
    const selectedModel = allModels.find((m) => m.slug === modelSlug);
    if (selectedModel.slug === 'gpt-4-code-interpreter' && settings.autoSync) {
      showAutoSyncWarning('Uploading files with <b style="color:white;">Advanced Data Analysis</b> model requires <b style="color:white;">Auto Sync to be OFF</b>. Please turn off Auto Sync if you need to upload a file. You can turn Auto Sync back ON (<b style="color:white;">CMD/CTRL+ALT+A</b>) again after submitting your file.');
    }
    const pluginsDropdownWrapper = document.querySelector('#plugins-dropdown-wrapper-navbar');
    if (pluginsDropdownWrapper) {
      if (selectedModel.slug.includes('plugins')) {
        pluginsDropdownWrapper.style.display = 'block';
      } else {
        pluginsDropdownWrapper.style.display = 'none';
      }
    }
    const pluginDropdownButton = document.querySelector('#navbar-plugins-dropdown-button');
    if (pluginDropdownButton) {
      pluginDropdownButton.disabled = true;
      pluginDropdownButton.style.opacity = 0.75;
      pluginDropdownButton.title = 'Changing plugins in the middle of the conversation is not allowed';
    }
    chrome.storage.local.set({
      settings: {
        ...settings,
        selectedModel,
        selectedLanguage: languageList.find((language) => language.code === languageCode || language.code === 'default'),
        selectedTone: toneList.find((tone) => tone.code === toneCode || tone.code === 'default'),
        selectedWritingStyle: writingStyleList.find((writingStyle) => writingStyle.code === writingStyleCode || writingStyle.code === 'default'),
      },
      enabledPluginIds: pluginIds || enabledPluginIds,
    }, () => {
      // get the li with id of the language code and click it
      document.querySelector(`#language-list-dropdown li#language-selector-option-${languageCode}`)?.click();
      document.querySelector(`#tone-list-dropdown li#tone-selector-option-${toneCode}`)?.click();
      document.querySelector(`#writing-style-list-dropdown li#writing-style-selector-option-${writingStyleCode}`)?.click();
    });
  });
}
function loadConversationFromNode(conversationId, newMessageId, oldMessageId, searchValue = '') {
  chrome.storage.sync.get(['name', 'avatar'], (result) => {
    chrome.storage.local.get(['conversations', 'settings', 'models'], (res) => {
      const fullConversation = res.conversations?.[conversationId];
      const { settings } = res;

      let currentNode = fullConversation.mapping[newMessageId];
      const sortedNodes = [];
      while (currentNode) {
        const parentId = currentNode.parent;
        const parent = fullConversation.mapping[parentId];
        const siblings = parent.children;
        const curNodeIndex = siblings.findIndex((id) => id === newMessageId);// only for the first node
        const threadIndex = curNodeIndex === -1 ? 1 : curNodeIndex + 1;
        const threadCount = siblings.length;
        sortedNodes.push({ ...currentNode, threadIndex, threadCount });
        currentNode = fullConversation.mapping[currentNode.children[0]];
      }

      let messageDiv = '';
      for (let i = 0; i < sortedNodes.length; i += 1) {
        const { message, threadCount, threadIndex } = sortedNodes[i];
        // eslint-disable-next-line no-continue
        if (!message) continue;
        if (message.role === 'user' || message.author?.role === 'user') {
          messageDiv += rowUser(fullConversation, sortedNodes[i], threadIndex, threadCount, result.name, result.avatar, settings.customConversationWidth, settings.conversationWidth, searchValue);
        }
        if (message.role === 'assistant' || message.author?.role === 'assistant') {
          let nextMessage = sortedNodes[i + 1]?.message;
          while (nextMessage && nextMessage.recipient === 'all' && (nextMessage.role === 'assistant' || nextMessage.author?.role === 'assistant')) {
            message.content.parts = message.content.parts.concat(nextMessage.content.parts);
            i += 1;
            nextMessage = sortedNodes[i + 1]?.message;
          }
          sortedNodes[i].message = message;
          messageDiv += rowAssistant(fullConversation, sortedNodes[i], threadIndex, threadCount, res.models, settings.customConversationWidth, settings.conversationWidth, settings.showMessageTimestamp, settings.showWordCount, searchValue);
        }
      }
      const conversationBottom = document.querySelector('#conversation-bottom');

      const messageWrapper = document.querySelector(`#message-wrapper-${oldMessageId}`);
      while (messageWrapper.nextElementSibling && messageWrapper.nextElementSibling.id.startsWith('message-wrapper-')) {
        messageWrapper.nextElementSibling.remove();
      }
      messageWrapper.remove();

      // inser messageDiv html above conversation bottom
      conversationBottom.insertAdjacentHTML('beforebegin', messageDiv);

      showHideTextAreaElement();
      addConversationsEventListeners(fullConversation.id);
      initializeRegenerateResponseButton();
      initializeStopGeneratingResponseButton();
      addPinNav(sortedNodes);
      updateModel(sortedNodes[sortedNodes.length - 1].message?.metadata?.model_slug, fullConversation);
      updateTotalCounter();
    });
  });
}

// eslint-disable-next-line no-unused-vars
function loadConversation(conversationId, searchValue = '', focusOnInput = true) {
  //  = true;
  const suggestionsWrapper = document.querySelector('#suggestions-wrapper');
  if (suggestionsWrapper) suggestionsWrapper.remove();
  scrolUpDetected = false;
  chrome.storage.sync.get(['name', 'avatar'], (result) => {
    chrome.storage.local.get(['conversationsOrder', 'conversations', 'settings', 'models'], (res) => {
      const { settings, conversationsOrder } = res;
      const folderConatainingConversation = conversationsOrder.find((folder) => folder?.conversationIds?.includes(conversationId));
      let folderName = '';
      if (folderConatainingConversation) {
        folderName = folderConatainingConversation.name;
      }
      const fullConversation = res.conversations?.[conversationId];

      // set page title meta to fullConversation.title
      document.title = fullConversation.title || 'New chat';

      if (!fullConversation || !fullConversation?.current_node) return;
      const main = document.querySelector('main');
      main.style.position = 'relative';
      const outerDiv = document.createElement('div');
      outerDiv.classList = 'flex-1 overflow-hidden';
      const innerDiv = document.createElement('div');
      innerDiv.classList = 'h-full overflow-y-auto';
      innerDiv.style = 'scroll-behavior: smooth;';
      innerDiv.id = 'conversation-inner-div';
      addScrollDetector(innerDiv);
      const conversationDiv = document.createElement('div');
      conversationDiv.classList = 'flex flex-col items-center text-sm h-full dark:bg-gray-800';
      //--------
      // traverse up the current node to get all the parent nodes
      const sortedNodes = [];
      let currentNodeId = fullConversation.current_node;
      // mapping: {id: message, id: message }
      // remove all the nodes that are not user or assistant
      // (node) => ['user', 'assistant'].includes(node.author?.role) && node.recipient === 'all');

      while (currentNodeId) {
        const currentNode = fullConversation.mapping[currentNodeId];
        const parentId = currentNode.parent;
        const parent = parentId ? fullConversation.mapping[parentId] : null;
        const siblings = parent ? parent.children : [];

        // eslint-disable-next-line no-loop-func
        const currentNodeIndex = siblings.findIndex((id) => currentNodeId === id);

        const threadIndex = currentNodeIndex === -1 ? siblings.length : currentNodeIndex + 1;
        const threadCount = siblings.length;
        sortedNodes.push({ ...currentNode, threadIndex, threadCount });
        currentNodeId = parentId;
      }
      sortedNodes.reverse();
      //--------
      const systemMessage = sortedNodes.find((node) => node?.message?.role === 'system' || node?.message?.author?.role === 'system');
      const customInstrucionProfile = systemMessage?.message?.metadata?.user_context_message_data || undefined;

      let messageDiv = `<div id="conversation-top" class="w-full flex items-center justify-center border-b border-black/10 dark:border-gray-900/50 text-gray-800 dark:text-gray-100 group bg-gray-50 dark:bg-[#444654]" style="min-height:56px;z-index:0;"><strong>${folderName ? `${folderName}  &nbsp;&nbsp;&nbsp;› &nbsp;&nbsp;&nbsp;` : ''}</strong>${fullConversation.title}${customInstrucionProfile ? `<span style="display:flex;" title=">> What would you like ChatGPT to know about you to provide better responses?\n${customInstrucionProfile.about_user_message} \n\n>> How would you like ChatGPT to respond?\n${customInstrucionProfile.about_model_message}">&nbsp;&nbsp;<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" fill="none" class="ml-0.5 mt-0.5 h-4 w-4 flex-shrink-0 text-gray-600 dark:text-gray-200 sm:mb-0.5 sm:mt-0 sm:h-5 sm:w-5"><path d="M8.4375 8.4375L8.46825 8.4225C8.56442 8.37445 8.67235 8.35497 8.77925 8.36637C8.88615 8.37776 8.98755 8.41955 9.07143 8.48678C9.15532 8.55402 9.21818 8.64388 9.25257 8.74574C9.28697 8.8476 9.29145 8.95717 9.2655 9.0615L8.7345 11.1885C8.70836 11.2929 8.7127 11.4026 8.74702 11.5045C8.78133 11.6065 8.84418 11.6965 8.9281 11.7639C9.01202 11.8312 9.1135 11.8731 9.2205 11.8845C9.32749 11.8959 9.43551 11.8764 9.53175 11.8282L9.5625 11.8125M15.75 9C15.75 9.88642 15.5754 10.7642 15.2362 11.5831C14.897 12.4021 14.3998 13.1462 13.773 13.773C13.1462 14.3998 12.4021 14.897 11.5831 15.2362C10.7642 15.5754 9.88642 15.75 9 15.75C8.11358 15.75 7.23583 15.5754 6.41689 15.2362C5.59794 14.897 4.85382 14.3998 4.22703 13.773C3.60023 13.1462 3.10303 12.4021 2.76381 11.5831C2.42459 10.7642 2.25 9.88642 2.25 9C2.25 7.20979 2.96116 5.4929 4.22703 4.22703C5.4929 2.96116 7.20979 2.25 9 2.25C10.7902 2.25 12.5071 2.96116 13.773 4.22703C15.0388 5.4929 15.75 7.20979 15.75 9ZM9 6.1875H9.006V6.1935H9V6.1875Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></span>` : ''}</div>`;
      if (fullConversation.archived) {
        messageDiv = '<div id="conversation-top"></div><div style="display: flex; align-items: center; justify-content: center; min-height: 56px; width: 100%; color:white; background-color: #ff0000; position: sticky; top: 0;z-index:0;">This is an archived chat. You can read archived chats, but you cannot continue them.</div>';
      }
      messageDiv.id = 'conversation-wrapper';
      for (let i = 0; i < sortedNodes.length; i += 1) {
        const { message, threadCount, threadIndex } = sortedNodes[i];
        // eslint-disable-next-line no-continue
        if (!message) continue;
        if (message.role === 'user' || message.author?.role === 'user') {
          messageDiv += rowUser(fullConversation, sortedNodes[i], threadIndex, threadCount, result.name, result.avatar, settings.customConversationWidth, settings.conversationWidth, searchValue);
        }
        if (message.recipient === 'all' && (message.role === 'assistant' || message.author?.role === 'assistant')) {
          let nextMessage = sortedNodes[i + 1]?.message;
          while (nextMessage && nextMessage.recipient === 'all' && (nextMessage.role === 'assistant' || nextMessage.author?.role === 'assistant')) {
            message.content.parts.push(...nextMessage.content.parts);
            // message.content.parts = [`${message.content.parts.join('')}${nextMessage.content.parts.join('')}`];
            i += 1;
            nextMessage = sortedNodes[i + 1]?.message;
          }
          sortedNodes[i].message = message;
          messageDiv += rowAssistant(fullConversation, sortedNodes[i], threadIndex, threadCount, res.models, settings.customConversationWidth, settings.conversationWidth, settings.showMessageTimestamp, settings.showWordCount, searchValue);
        }
      }
      conversationDiv.innerHTML = messageDiv;
      const bottomDiv = document.createElement('div');
      bottomDiv.id = 'conversation-bottom';
      bottomDiv.classList = 'w-full h-32 md:h-48 flex-shrink-0';
      conversationDiv.appendChild(bottomDiv);
      const bottomDivContent = document.createElement('div');
      bottomDivContent.classList = 'relative text-base gap-4 md:gap-6 m-auto md:max-w-2xl lg:max-w-2xl xl:max-w-3xl flex lg:px-0';
      if (settings.customConversationWidth) {
        bottomDivContent.style = `max-width: ${settings.conversationWidth} %;`;
      }
      bottomDiv.appendChild(bottomDivContent);
      const totalCounter = document.createElement('div');
      totalCounter.id = 'total-counter';
      totalCounter.style = 'position: absolute; top: 0px; right: 0px; font-size: 10px; color: rgb(153, 153, 153); opacity: 0.8;';
      bottomDivContent.appendChild(totalCounter);
      innerDiv.appendChild(conversationDiv);
      outerDiv.appendChild(innerDiv);
      const contentWrapper = main.querySelector('.flex-1.overflow-hidden');
      contentWrapper.remove();
      main.firstChild.prepend(outerDiv);
      if (!searchValue) {
        if (focusOnInput) {
          const textAreaElement = main.querySelector('form textarea');
          if (textAreaElement) textAreaElement.focus();
        }
        innerDiv.scrollTop = innerDiv.scrollHeight;
      } else {
        // scroll to the first highlighted element usin mark tag
        const searchElement = document.querySelector('main').querySelector('mark');

        if (searchElement) {
          searchElement.scrollIntoView();
        }
      }
      showHideTextAreaElement();
      addConversationsEventListeners(fullConversation.id);
      initializeRegenerateResponseButton();
      initializeStopGeneratingResponseButton();

      if (Object.values(res.conversations).find((conv) => conv.shouldRefresh)) {
        refreshConversations(res.conversations);
      }
      addPinNav(sortedNodes);
      updateModel(sortedNodes[sortedNodes.length - 1].message?.metadata?.model_slug, fullConversation);
      updateTotalCounter();
      if (settings.autoClick) {
        document.querySelector('#auto-click-button').click();
      }
    });
  });
}
function updateTotalCounter() {
  const totalCounterElement = document.querySelector('#total-counter');
  if (!totalCounterElement) return;
  const allMessages = document.querySelectorAll('[id^=message-text-]');
  // add the total number of words  and characters
  let totalWords = 0;
  let totalCharacters = 0;
  allMessages.forEach((message) => {
    const text = message.innerText;
    const words = text.split(/[\s\n]+/);

    totalWords += words.length;
    totalCharacters += text.length;
  });
  totalCounterElement.innerHTML = `Total: ${totalCharacters} chars / ${totalWords} words`;
}
function addCopyCodeButtonsEventListeners() {
  const copyCodeButtons = document.querySelectorAll('[id="copy-code"][data-initialized="false"]');

  copyCodeButtons.forEach((btn) => {
    // clear existing event listeners
    const button = btn.cloneNode(true);
    button.dataset.initialized = true;
    btn.parentNode.replaceChild(button, btn);
    button.addEventListener('click', () => {
      // get closest code element
      const code = button.closest('pre').querySelector('code');
      navigator.clipboard.writeText(code.innerText);
      button.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="20 6 9 17 4 12"></polyline></svg>Copied!';
      setTimeout(
        () => {
          button.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>Copy code';
        },
        1500,
      );
    });
  });
}
function addConversationsEventListeners(conversationId) {
  const editButtons = document.querySelectorAll('[id^="edit-button-"]');
  const addToLibraryButtons = document.querySelectorAll('[id^="add-to-library-button-"]');
  const thumbsUpButtons = document.querySelectorAll('[id^="thumbs-up-button"]');
  const thumbsDownButtons = document.querySelectorAll('[id^="thumbs-down-button"]');
  const resultCopyButtons = document.querySelectorAll('[id^="result-copy-button-"]');
  const threadPrevButtons = document.querySelectorAll('[id^="thread-prev-button-"]');
  const threadNextButtons = document.querySelectorAll('[id^="thread-next-button-"]');
  const messagePinButtons = document.querySelectorAll('[id^="message-pin-button-"]');
  addCopyCodeButtonsEventListeners();
  editButtons.forEach((btn) => {
    // clear existing event listeners
    const button = btn.cloneNode(true);
    btn.parentNode.replaceChild(button, btn);
    button.addEventListener('click', () => {
      chrome.storage.local.get(['conversations', 'settings', 'models'], (result) => {
        const conversation = result.conversations[conversationId];
        const messageId = button.id.split('edit-button-').pop();
        const existingActionDiv = document.querySelector(`#action-div-${messageId}`);
        if (existingActionDiv) return;
        const oldElement = document.querySelector(`#message-text-${messageId}`);
        const userInput = oldElement.innerText;
        const textArea = document.createElement('textarea');
        textArea.classList = 'm-0 resize-none border-0 bg-transparent p-0 focus:ring-0 focus-visible:ring-0';
        textArea.style = `height: ${oldElement.offsetHeight}px; overflow-y: hidden;`;
        textArea.value = userInput;
        textArea.spellcheck = false;
        textArea.id = `message-text-${messageId}`;
        textArea.addEventListener('input', (e) => {
          e.target.style.height = `${e.target.scrollHeight}px`;
        });
        oldElement.parentElement.replaceChild(textArea, oldElement);
        textArea.focus();
        const actionDiv = document.createElement('div');
        actionDiv.classList = 'text-center mt-2 flex justify-center';
        actionDiv.id = `action-div-${messageId}`;
        const saveButton = document.createElement('button');
        saveButton.classList = 'btn flex justify-center gap-2 btn-primary mr-2';
        saveButton.innerText = 'Save & Submit';
        saveButton.addEventListener('click', () => {
          if (result.settings.selectedModel.tags.includes('gpt4')) {
            arkoseTrigger();
          }
          let newMessage = textArea.value;
          // this is the right way, but OpenAI always creat a new chat even if you don't change the input, so we follow the same behavior
          // const newMessageId = newMessage !== userInput ? self.crypto.randomUUID() : messageId;
          const newMessageId = self.crypto.randomUUID();
          const newElement = document.createElement('div');
          newElement.classList = oldElement.classList;
          newElement.id = `message-text-${newMessageId}`;
          newElement.innerText = newMessage;
          textArea.parentElement.replaceChild(newElement, textArea);
          actionDiv.remove();
          // if (newMessage.trim() !== userInput.trim()) {
          const messageWrapper = document.querySelector(`#message-wrapper-${messageId}`);
          messageWrapper.id = `message-wrapper-${newMessageId}`;
          const parent = messageWrapper.previousElementSibling;
          // default parentId to root message
          let parentId = Object.values(conversation.mapping).find((m) => m?.message?.role === 'system' || m?.message?.author?.role === 'system')?.id;

          if (parent && parent.id.startsWith('message-wrapper-')) {
            parentId = parent.id.split('message-wrapper-').pop();
          }

          while (messageWrapper.nextElementSibling && messageWrapper.nextElementSibling.id.startsWith('message-wrapper-')) {
            messageWrapper.nextElementSibling.remove();
          }
          // messageWrapper.remove();
          const threadCountWrapper = messageWrapper.querySelector(`#thread-count-wrapper-${messageId}`);
          const [, childCount] = threadCountWrapper.textContent.split(' / ');
          const threadPrevButton = messageWrapper.querySelector(`#thread-prev-button-${messageId}`);
          threadPrevButton.disabled = false;
          const threadNextButton = messageWrapper.querySelector(`#thread-next-button-${messageId}`);
          threadNextButton.disabled = true;
          threadCountWrapper.innerText = `${parseInt(childCount, 10) + 1} / ${parseInt(childCount, 10) + 1}`;
          const threadButtonsWrapper = messageWrapper.querySelector(`#thread-buttons-wrapper-${messageId}`);
          threadButtonsWrapper.classList.add('group-hover:visible');
          // replace messageId with newMessageId in all the children ids
          // id ends with messageId
          const children = messageWrapper.querySelectorAll(`[id$="-${messageId}"]`);
          children.forEach((child) => {
            if (!child.id) return;
            const childId = child.id.replace(messageId, newMessageId);
            child.id = childId;
          });
          // new row
          // check if original prompt has instructions, if it does, add the instruction to the prompt, otherwise, don't add it.
          const theOriginalPrompt = conversation.mapping[messageId].message.content.parts.join('\n');
          // if theOriginalPrompt include (languageCode: ${selectedLanguage.code}). extract the language code
          const languageCode = theOriginalPrompt.match(/\(languageCode: (.*)\)/)?.[1];
          const toneCode = theOriginalPrompt.match(/\(toneCode: (.*)\)/)?.[1];
          const writingStyleCode = theOriginalPrompt.match(/\(writingStyleCode: (.*)\)/)?.[1];
          if (languageCode || toneCode || writingStyleCode) {
            newMessage = generateInstructions(conversation, result.settings, newMessage, true);// forceAddInstructions=true
          }
          isGenerating = true;
          submitChat(newMessage, conversation, newMessageId, parentId, result.settings, result.models);
          // }
        });
        const cancelButton = document.createElement('button');
        cancelButton.classList = 'btn flex justify-center gap-2 btn-neutral';
        cancelButton.innerText = 'Cancel';
        cancelButton.addEventListener('click', () => {
          textArea.parentElement.replaceChild(oldElement, textArea);
          actionDiv.remove();
        });
        actionDiv.appendChild(saveButton);
        actionDiv.appendChild(cancelButton);
        // if ESC click on cancel button
        textArea.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            cancelButton.click();
          }
        });
        textArea.parentElement.appendChild(actionDiv);
      });
    });
  });
  addToLibraryButtons.forEach((btn) => {
    // clear existing event listeners
    const button = btn.cloneNode(true);
    btn.parentNode.replaceChild(button, btn);
    button.addEventListener('click', () => {
      const messageId = button.id.split('add-to-library-button-').pop();
      const messageElement = document.querySelector(`#message-text-${messageId}`);
      const userInput = messageElement.innerText || messageElement.value;
      chrome.storage.local.get(['conversations'], (result) => {
        const conversation = result.conversations[conversationId];
        const modelSlug = conversation.mapping[messageId]?.message.metadata?.model_slug || '';
        openSubmitPromptModal(userInput, modelSlug);
      });
    });
  });
  thumbsUpButtons.forEach((btn) => {
    // clear existing event listeners
    const button = btn.cloneNode(true);
    btn.parentNode.replaceChild(button, btn);
    button.addEventListener('click', () => {
      const messageId = button.id.split('thumbs-up-button-').pop();
      messageFeedback(conversationId, messageId, 'thumbsUp');
      openFeedbackModal(conversationId, messageId, 'thumbsUp');
      button.disabled = true;
      const thumbsDownButton = document.querySelector(`#thumbs-down-button-${messageId}`);
      thumbsDownButton.style.display = 'none';
    });
  });
  thumbsDownButtons.forEach((btn) => {
    // clear existing event listeners
    const button = btn.cloneNode(true);
    btn.parentNode.replaceChild(button, btn);
    button.addEventListener('click', () => {
      const messageId = button.id.split('thumbs-down-button-').pop();
      messageFeedback(conversationId, messageId, 'thumbsDown');
      openFeedbackModal(conversationId, messageId, 'thumbsDown');
      button.disabled = true;
      const thumbsUpButton = document.querySelector(`#thumbs-up-button-${messageId}`);
      thumbsUpButton.style.display = 'none';
    });
  });

  resultCopyButtons.forEach((btn) => {
    // clear existing event listeners
    const button = btn.cloneNode(true);
    btn.parentNode.replaceChild(button, btn);
    const messageId = button.id.split('result-copy-button-').pop();
    const element = document.querySelector(`#message-text-${messageId}`);
    const copyMenu = document.querySelector(`#copy-result-menu-${messageId}`);
    const htmlButton = document.querySelector(`#result-html-copy-button-${messageId}`);
    const newHtmlButton = htmlButton.cloneNode(true);
    htmlButton.parentNode.replaceChild(newHtmlButton, htmlButton);
    const markdownButton = document.querySelector(`#result-markdown-copy-button-${messageId}`);
    const newMarkdownButton = markdownButton.cloneNode(true);
    markdownButton.parentNode.replaceChild(newMarkdownButton, markdownButton);

    button.addEventListener('mouseover', () => {
      copyMenu.style.display = 'block';
    });
    button.addEventListener('mouseout', () => {
      copyMenu.style.display = 'none';
    });
    copyMenu.addEventListener('mouseover', () => {
      copyMenu.style.display = 'block';
    });
    copyMenu.addEventListener('mouseout', () => {
      copyMenu.style.display = 'none';
    });
    button.addEventListener('click', () => {
      chrome.storage.local.get(['conversations', 'settings'], (result) => {
        const conversation = result.conversations[conversationId];
        // while parent is not user, keep going up
        let parentId = conversation.mapping[messageId].parent;
        let parentRole = conversation.mapping[parentId].message.author?.role || conversation.mapping[parentId].message.role;
        while (parentRole !== 'user') {
          parentId = conversation.mapping[parentId].parent;
          parentRole = conversation.mapping[parentId].message.author?.role || conversation.mapping[parentId].message.role;
        }
        const parentMessage = conversation.mapping[parentId].message.content.parts.join('\n');
        const codeHeaders = document.querySelectorAll('#code-header');
        // hide all code headers
        codeHeaders.forEach((header) => {
          header.style.display = 'none';
        });
        const text = `${result.settings.copyMode ? `>> USER: ${parentMessage}\n>> ASSISTANT: ` : ''}${element.innerText}`;
        navigator.clipboard.writeText(text.trim());
        codeHeaders.forEach((header) => {
          header.style.display = 'flex';
        });
        // animate copy button text to copied and back in 3 seconds
        button.textContent = 'Copied!';
        setTimeout(
          () => {
            button.textContent = 'Copy';
          },
          1500,
        );
      });
    });
    newHtmlButton.addEventListener('click', () => {
      chrome.storage.local.get(['conversations', 'settings'], (result) => {
        const conversation = result.conversations[conversationId];
        let parentId = conversation.mapping[messageId].parent;
        let parentRole = conversation.mapping[parentId].message.author?.role || conversation.mapping[parentId].message.role;
        while (parentRole !== 'user') {
          parentId = conversation.mapping[parentId].parent;
          parentRole = conversation.mapping[parentId].message.author?.role || conversation.mapping[parentId].message.role;
        }
        const parentMessage = conversation.mapping[parentId].message.content.parts.join('\n');
        const newElement = element.cloneNode(true);
        if (result.settings.copyMode) {
          newElement.innerHTML = `<div>USER:</div><div>${parentMessage}</div><br><div>ASSISTANT:</div>${newElement.innerHTML}`;
        }
        copyRichText(newElement);
        // animate copy htmlButton text to copied and back in 3 seconds
        newHtmlButton.textContent = 'Copied!';
        setTimeout(
          () => {
            newHtmlButton.textContent = 'HTML';
          },
          1500,
        );
      });
    });
    newMarkdownButton.addEventListener('click', () => {
      chrome.storage.local.get(['settings'], (result) => {
        getConversation(conversationId).then((conversation) => {
          const { message } = conversation.mapping[messageId];
          let parentId = conversation.mapping[messageId].parent;
          let parentRole = conversation.mapping[parentId].message.author?.role || conversation.mapping[parentId].message.role;
          while (parentRole !== 'user') {
            parentId = conversation.mapping[parentId].parent;
            parentRole = conversation.mapping[parentId].message.author?.role || conversation.mapping[parentId].message.role;
          }
          const parentMessage = conversation.mapping[parentId].message.content.parts.join('\n');
          const text = `${result.settings.copyMode ? `##USER:\n${parentMessage}\n\n##ASSISTANT:\n` : ''}${message.content.parts.join('\n')}`;
          navigator.clipboard.writeText(text.trim());

          // animate copy markdownButton text to copied and back in 3 seconds
          newMarkdownButton.textContent = 'Copied!';
          setTimeout(
            () => {
              newMarkdownButton.textContent = 'Markdown';
            },
            1500,
          );
        });
      });
    });
  });

  threadPrevButtons.forEach((btn) => {
    // clear existing event listeners
    const button = btn.cloneNode(true);
    btn.parentNode.replaceChild(button, btn);
    button.addEventListener('click', () => {
      chrome.storage.local.get(['conversations'], (result) => {
        const conversation = result.conversations[conversationId];
        const messageId = button.id.split('thread-prev-button-').pop();
        const parentId = conversation.mapping[messageId].parent;
        const parent = conversation.mapping[parentId];
        const siblings = parent.children;
        const threadButtonsWrapper = document.querySelector(`#thread-count-wrapper-${messageId}`);
        const [currentThreadIndex] = threadButtonsWrapper.textContent.split(' / ').map((n) => parseInt(n, 10));
        if (currentThreadIndex > 1) {
          const newThreadIndex = currentThreadIndex - 1;
          const newMessageId = siblings[newThreadIndex - 1]; // thread index is 1-based, array index is 0-based
          const searchbox = document.querySelector('#conversation-search');
          const searchValue = searchbox.value;
          loadConversationFromNode(conversation.id, newMessageId, messageId, searchValue, false);
        }
      });
    });
  });

  threadNextButtons.forEach((btn) => {
    // clear existing event listeners
    const button = btn.cloneNode(true);
    btn.parentNode.replaceChild(button, btn);
    button.addEventListener('click', () => {
      chrome.storage.local.get(['conversations'], (result) => {
        const conversation = result.conversations[conversationId];
        const messageId = button.id.split('thread-next-button-').pop();
        const parentId = conversation.mapping[messageId].parent;
        const parent = conversation.mapping[parentId];
        const siblings = parent.children;
        const threadButtonsWrapper = document.querySelector(`#thread-count-wrapper-${messageId}`);
        const [currentThreadIndex, threadCount] = threadButtonsWrapper.textContent.split(' / ').map((n) => parseInt(n, 10));
        if (currentThreadIndex < threadCount) {
          const newThreadIndex = currentThreadIndex + 1;

          const newMessageId = siblings[newThreadIndex - 1]; // thread index is 1-based, array index is 0-based
          const searchbox = document.querySelector('#conversation-search');
          const searchValue = searchbox.value;
          loadConversationFromNode(conversation.id, newMessageId, messageId, searchValue, false);
        }
      });
    });
  });

  messagePinButtons.forEach((btn) => {
    // clear existing event listeners
    const button = btn.cloneNode(true);
    btn.parentNode.replaceChild(button, btn);
    button.addEventListener('click', () => {
      chrome.storage.local.get(['conversations', 'settings'], (result) => {
        const { conversations, settings } = result;
        const conversation = conversations[conversationId];
        const messageId = button.id.split('message-pin-button-').pop();
        const isPinned = conversation.mapping[messageId].pinned || false;
        conversation.mapping[messageId].pinned = !isPinned;
        conversations[conversationId] = conversation;
        chrome.storage.local.set({ conversations }, () => {
          const messageWrapper = document.querySelector(`#message-wrapper-${messageId}`);
          const icon = button.querySelector('path');
          let defaultCalsses = 'dark:bg-gray-800';
          if (messageWrapper.getAttribute('data-role') === 'user') {
            defaultCalsses = ['dark:bg-gray-800'];
          } else {
            defaultCalsses = ['bg-gray-50', 'dark:bg-[#444654]'];
          }
          if (isPinned) {
            icon.setAttribute('fill', '#aaa');
            button.classList.remove('visible');
            button.classList.add('invisible', 'group-hover:visible');
            messageWrapper.classList.remove('border-l-pinned', 'bg-pinned', 'dark:bg-pinned');
            messageWrapper.classList.add(...defaultCalsses);
          } else {
            icon.setAttribute('fill', 'gold');
            button.classList.remove('invisible', 'group-hover:visible');
            button.classList.add('visible');
            messageWrapper.classList.remove(...defaultCalsses);
            messageWrapper.classList.add('border-l-pinned', 'bg-pinned', 'dark:bg-pinned');
          }
          if (settings.showPinNav) {
            const pinNav = document.querySelector('#pin-nav');
            if (isPinned) {
              pinNav.removeChild(pinNav.querySelector(`#pin-nav-item-${messageId}`));
            } else {
              const pin = document.createElement('button');
              pin.style = 'background-color: transparent; border: none; cursor: pointer;width:100%;width: 18px; margin-bottom:4px;transition: width 0.2s ease-in-out;';
              pin.id = `pin-nav-item-${messageId}`;
              pin.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="gold" d="M48 0H336C362.5 0 384 21.49 384 48V487.7C384 501.1 373.1 512 359.7 512C354.7 512 349.8 510.5 345.7 507.6L192 400L38.28 507.6C34.19 510.5 29.32 512 24.33 512C10.89 512 0 501.1 0 487.7V48C0 21.49 21.49 0 48 0z"/></svg>';
              pin.addEventListener('click', () => {
                messageWrapper.scrollIntoView({ behavior: 'smooth' });
              });
              // get all elemnt with id starting with message-pin-button- that also has class visible
              const newMessagePinButtons = document.querySelectorAll('[id^="message-pin-button-"].visible');
              // fake because it only has id and pinned=true which is enough for addPinNav
              const fakeSortedNodes = [...newMessagePinButtons].map((b) => ({ id: b.id.split('message-pin-button-').pop(), pinned: true }));
              addPinNav(fakeSortedNodes);
              observePinButton(button);
            }
          }
        });
      });
    });
    chrome.storage.local.get(['settings'], (result) => {
      const { settings } = result;
      if (settings.showPinNav) {
        observePinButton(button);
      }
    });
  });
}

function observePinButton(button) {
  const buttonMessageId = button.id.split('message-pin-button-').pop();
  const messagePinButton = document.querySelector(`#message-pin-button-${buttonMessageId}`);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const messageId = entry.target.id.split('message-pin-button-').pop();
      const pinNav = document.querySelector('#pin-nav');
      const pin = pinNav?.querySelector(`#pin-nav-item-${messageId}`);
      if (!pin) return;
      if (entry.isIntersecting) {
        pin.style.width = '18px';
      } else {
        pin.style.width = '12px';
      }
    });
  });
  if (!messagePinButton) return;
  observer.observe(messagePinButton);
}
