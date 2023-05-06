/* eslint-disable no-restricted-globals */
// eslint-disable-next-line no-unused-vars
/* global getConversation, submitChat, openSubmitPromptModal, initializeRegenerateResponseButton, toggleTextAreaElemet, rowAssistant, rowUser, copyRichText, messageFeedback, openFeedbackModal, refreshConversations, initializeStopGeneratingResponseButton, chatStreamIsClosed:true, generateInstructions, isGenerating:true, scrolUpDetected:true, addScrollDetector */

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
function updateModel(modelSlug) {
  if (!modelSlug) return;
  chrome.storage.local.get(['settings', 'models', 'unofficialModels', 'customModels'], ({
    settings, models, unofficialModels, customModels,
  }) => {
    const allModels = [...models, ...unofficialModels, ...customModels];
    const selectedModel = allModels.find((m) => m.slug === modelSlug);
    chrome.storage.local.set({ settings: { ...settings, selectedModel } });
  });
}
function loadConversationFromNode(conversationId, newMessageId, oldMessageId, searchValue = '') {
  // chatStreamIsClosed = true;
  chrome.storage.sync.get(['name', 'avatar'], (result) => {
    chrome.storage.local.get(['conversations', 'settings', 'models'], (res) => {
      const fullConversation = res.conversations?.[conversationId];

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
          messageDiv += rowUser(fullConversation, sortedNodes[i], threadIndex, threadCount, result.name, result.avatar, searchValue);
        }
        if (message.role === 'assistant' || message.author?.role === 'assistant') {
          messageDiv += rowAssistant(fullConversation, sortedNodes[i], threadIndex, threadCount, res.models, searchValue);
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

      toggleTextAreaElemet();
      addConversationsEventListeners(fullConversation.id);
      initializeRegenerateResponseButton();
      initializeStopGeneratingResponseButton();
      addPinNav(sortedNodes);
      updateModel(sortedNodes[sortedNodes.length - 1].message?.metadata?.model_slug);
      updateTotalCounter();
    });
  });
}

// eslint-disable-next-line no-unused-vars
function loadConversation(conversationId, searchValue = '', focusOnInput = true) {
  // chatStreamIsClosed = true;
  scrolUpDetected = false;
  chrome.storage.sync.get(['name', 'avatar', 'conversationsOrder'], (result) => {
    chrome.storage.local.get(['conversations', 'settings', 'models'], (res) => {
      const { conversationsOrder } = result;
      const folderConatainingConversation = conversationsOrder.find((folder) => folder?.conversationIds?.includes(conversationId?.slice(0, 5)));
      let folderName = '';
      if (folderConatainingConversation) {
        folderName = folderConatainingConversation.name;
      }
      const fullConversation = res.conversations?.[conversationId];
      // set page title meta to fullConversation.title
      document.title = fullConversation.title;

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
      let messageDiv = `<div id="conversation-top" class="w-full flex items-center justify-center border-b border-black/10 dark:border-gray-900/50 text-gray-800 dark:text-gray-100 group bg-gray-50 dark:bg-[#444654]" style="min-height:56px;z-index:1;"><strong>${folderName ? `${folderName}  &nbsp;&nbsp;&nbsp;›` : ''}</strong>&nbsp;&nbsp;&nbsp;${fullConversation.title}</div>`;
      if (fullConversation.archived) {
        messageDiv = '<div id="conversation-top"></div><div style="display: flex; align-items: center; justify-content: center; min-height: 56px; width: 100%; color:white; background-color: #ff0000; position: sticky; top: 0;z-index:1;">This is an archived chat. You can read archived chats, but you cannot continue them.</div>';
      }
      messageDiv.id = 'conversation-wrapper';
      for (let i = 0; i < sortedNodes.length; i += 1) {
        const { message, threadCount, threadIndex } = sortedNodes[i];
        // eslint-disable-next-line no-continue
        if (!message) continue;
        if (message.role === 'user' || message.author?.role === 'user') {
          messageDiv += rowUser(fullConversation, sortedNodes[i], threadIndex, threadCount, result.name, result.avatar, searchValue);
        }
        if (message.role === 'assistant' || message.author?.role === 'assistant') {
          messageDiv += rowAssistant(fullConversation, sortedNodes[i], threadIndex, threadCount, res.models, searchValue);
        }
      }
      conversationDiv.innerHTML = messageDiv;
      const bottomDiv = document.createElement('div');
      bottomDiv.id = 'conversation-bottom';
      bottomDiv.classList = 'w-full h-32 md:h-48 flex-shrink-0';
      conversationDiv.appendChild(bottomDiv);
      const bottomDivContent = document.createElement('div');
      bottomDivContent.classList = 'relative text-base gap-4 md:gap-6 m-auto md:max-w-2xl lg:max-w-2xl xl:max-w-3xl flex lg:px-0';
      bottomDiv.appendChild(bottomDivContent);
      const totalCounter = document.createElement('div');
      totalCounter.id = 'total-counter';
      totalCounter.style = 'position: absolute; top: 0px; right: 0px; font-size: 10px; color: rgb(153, 153, 153); opacity: 0.8; z-index: 100;';
      bottomDivContent.appendChild(totalCounter);
      innerDiv.appendChild(conversationDiv);
      outerDiv.appendChild(innerDiv);
      const contentWrapper = main.querySelector('.flex-1.overflow-hidden');
      contentWrapper.remove();
      main.prepend(outerDiv);
      if (!searchValue) {
        if (focusOnInput) {
          const inputForm = main.querySelector('form');
          const textAreaElement = inputForm.querySelector('textarea');
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
      toggleTextAreaElemet();
      addConversationsEventListeners(fullConversation.id);
      initializeRegenerateResponseButton();
      initializeStopGeneratingResponseButton();

      if (Object.values(res.conversations).find((conv) => conv.shouldRefresh)) {
        refreshConversations(res.conversations);
      }
      addPinNav(sortedNodes);
      updateModel(sortedNodes[sortedNodes.length - 1].message?.metadata?.model_slug);
      updateTotalCounter();
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
    const words = text.split(' ');
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
          let parentId = Object.values(conversation.mapping).find((m) => m?.author?.role === 'system')?.id;

          if (parent && parent.id.startsWith('message-wrapper-')) parentId = parent.id.split('message-wrapper-').pop();
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
    const markdownButton = document.querySelector(`#result-markdown-copy-button-${messageId}`);

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
        const parentId = conversation.mapping[messageId].parent;
        const parentMessage = conversation.mapping[parentId].message.content.parts.join('\n');
        const codeHeaders = document.querySelectorAll('#code-header');
        // hide all code headers
        codeHeaders.forEach((header) => {
          header.style.display = 'none';
        });
        const text = `${result.settings.copyMode ? `>> USER: ${parentMessage}\n>> ASSISTANT: ` : ''}${element.innerText}`;
        navigator.clipboard.writeText(text);
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
    htmlButton.addEventListener('click', () => {
      chrome.storage.local.get(['conversations', 'settings'], (result) => {
        const conversation = result.conversations[conversationId];
        const parentId = conversation.mapping[messageId].parent;
        const parentMessage = conversation.mapping[parentId].message.content.parts.join('\n');
        const newElement = element.cloneNode(true);
        if (result.settings.copyMode) {
          newElement.innerHTML = `<div>USER:</div><div>${parentMessage}</div><br><div>ASSISTANT:</div>${newElement.innerHTML}`;
        }
        copyRichText(newElement);
        // animate copy htmlButton text to copied and back in 3 seconds
        htmlButton.textContent = 'Copied!';
        setTimeout(
          () => {
            htmlButton.textContent = 'HTML';
          },
          1500,
        );
      });
    });
    markdownButton.addEventListener('click', () => {
      chrome.storage.local.get(['settings'], (result) => {
        getConversation(conversationId).then((conversation) => {
          const { message } = conversation.mapping[messageId];
          const parentId = conversation.mapping[messageId].parent;
          const parentMessage = conversation.mapping[parentId].message.content.parts.join('\n');
          const text = `${result.settings.copyMode ? `##USER:\n${parentMessage}\n\n##ASSISTANT:\n` : ''}${message.content.parts.join('\n')}`;
          navigator.clipboard.writeText(text);

          // animate copy markdownButton text to copied and back in 3 seconds
          markdownButton.textContent = 'Copied!';
          setTimeout(
            () => {
              markdownButton.textContent = 'Markdown';
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
