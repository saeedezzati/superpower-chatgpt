/* eslint-disable no-restricted-globals */
// eslint-disable-next-line no-unused-vars
/* global markdown, markdownitSup, initializeNavbar, generateInstructions, generateChat, SSE, formatDate, loadConversation, resetSelection, katex, texmath, rowUser, rowAssistant, updateOrCreateConversation, replaceTextAreaElemet, highlight, isGenerating:true, disableTextInput:true, generateTitle, debounce, initializeRegenerateResponseButton, initializeStopGeneratingResponseButton, showHideTextAreaElement, showNewChatPage, chatStreamIsClosed:true, addCopyCodeButtonsEventListeners, addScrollDetector, scrolUpDetected:true, Sortable, updateInputCounter, addUserPromptToHistory, getGPT4CounterMessageCapWindow, createFolder, getConversationElementClassList, notSelectedClassList, selectedClassList, conversationActions, addCheckboxToConversationElement, createConversation, deleteConversation, handleQueryParams, addScrollButtons, updateTotalCounter, isWindows, loadSharedConversation, createTemplateWordsModal, arkoseTrigger, initializePromptChain, insertNextChain, runningPromptChainSteps:true, runningPromptChainIndex:true, lastPromptSuggestions, generateSuggestions, playSound */

// Initial state
let userChatIsActuallySaved = false;
let chunkNumber = 1;
let totalChunks = 1;
let remainingText = '';
let finalSummary = '';
let shouldSubmitFinalSummary = false;

function removeOriginalConversationList() {
  const navGap = document.querySelector('nav > :nth-child(3)');
  navGap.style = `${navGap.style.cssText};display:flex;margin-right:-8px;`;
  const existingConversationList = navGap.querySelector('div');
  const newConversationList = document.createElement('div');
  newConversationList.id = 'conversation-list';
  newConversationList.classList = 'flex flex-col gap-2 text-gray-100 text-sm';
  newConversationList.style = 'overflow-y:scroll;height:100%;padding-right:8px;';
  // add expand button
  if (existingConversationList) {
    existingConversationList.remove();
    navGap.prepend(newConversationList);
    // eslint-disable-next-line no-unused-vars
    const sortable = Sortable.create(newConversationList, {
      // multiDrag: true,
      // selectedClass: 'multi-drag-selected',
      // handle: '[id^="checkbox-wrapper-"], [id^="conversation-button-"], [id^="wrapper-folder-"]',
      group: {
        name: 'conversation-list',
        pull: true,
        // eslint-disable-next-line func-names, object-shorthand, no-unused-vars
        put: function (to, from, dragged) {
          return from.el.id !== 'folder-content-trash';
        },
      },
      direction: 'vertical',
      invertSwap: true,
      draggable: '[id^="conversation-button-"]:not(:has([id^=conversation-rename-])), [id^="wrapper-folder-"]:not([id="wrapper-folder-trash"]):not(:has([id^=rename-folder-])):not(:has([id^=conversation-rename-]))',
      onEnd: (event) => {
        const {
          item, to, oldDraggableIndex, newDraggableIndex,
        } = event;
        const isFolder = item.id.startsWith('wrapper-folder-');
        const isToFolder = to.id.startsWith('folder-content-');

        const fromId = 'conversation-list';
        const toId = isToFolder ? to.id.split('folder-content-')[1] : 'conversation-list';
        if (oldDraggableIndex === newDraggableIndex && toId === fromId) return;

        if (!isFolder && isToFolder && toId === 'trash') {
          deleteConversationOnDragToTrash(item.id.split('conversation-button-')[1]);
        }
        chrome.storage.local.get(['conversationsOrder'], (result) => {
          const { conversationsOrder } = result;
          const movingItem = conversationsOrder.splice(oldDraggableIndex, 1)[0];
          if (isToFolder) {
            const emptyFolder = document.querySelector(`#empty-folder-${toId}`);
            if (emptyFolder) emptyFolder.remove();
            const toFolderIndex = conversationsOrder.findIndex((c) => c.id === toId);
            const toFolder = conversationsOrder[toFolderIndex];
            if (!isFolder && typeof movingItem === 'string') {
              toFolder.conversationIds.splice(newDraggableIndex, 0, movingItem);
              conversationsOrder.splice(toFolderIndex, 1, toFolder);
            }
          } else {
            // eslint-disable-next-line no-lonely-if
            if (isFolder) {
              conversationsOrder.splice(newDraggableIndex, 0, movingItem);
            } else {
              conversationsOrder.splice(newDraggableIndex, 0, movingItem);
            }
          }
          chrome.storage.local.set({ conversationsOrder });
        });
      },
      onMove: (event) => {
        const { dragged, related } = event;
        const isFolder = dragged.id.startsWith('wrapper-folder-');
        const isToFolder = related.id.startsWith('wrapper-folder');
        const curFolderContent = document.querySelector(`#folder-content-${related.id.split('wrapper-folder-')[1]}`);
        const folderIsClosed = curFolderContent?.style.display === 'none';
        const shiftKeyIsDown = event.originalEvent.shiftKey;
        if (!isFolder && isToFolder && folderIsClosed && shiftKeyIsDown) {
          related.click();
        }
        return true;
      },
    });
  }
}
function deleteConversationOnDragToTrash(conversationId) {
  deleteConversation(conversationId);
  const conversationElement = document.querySelector(`#conversation-button-${conversationId}`);
  if (conversationElement && conversationElement.classList.contains('selected')) {
    showNewChatPage();
  }

  conversationElement.querySelector('[id^=checkbox-wrapper-]').remove();
  conversationElement.querySelector('[id^=actions-wrapper-]').remove();
  if (conversationElement.classList.contains('selected')) {
    showNewChatPage();
  }
  conversationElement.classList = notSelectedClassList;
  conversationElement.style.opacity = 0.7;
  conversationElement.classList.remove('hover:pr-20');
  const conversationElementIcon = conversationElement.querySelector('img');
  conversationElementIcon.src = chrome.runtime.getURL('icons/trash.png');
}
function createSearchBox() {
  const existingSearchBoxWrapper = document.querySelector('#conversation-search-wrapper');
  if (existingSearchBoxWrapper) existingSearchBoxWrapper.remove();
  const conversationList = document.querySelector('#conversation-list');
  const searchBoxWrapper = document.createElement('div');
  searchBoxWrapper.id = 'conversation-search-wrapper';
  searchBoxWrapper.classList = 'flex items-center justify-center';
  const searchbox = document.createElement('input');
  searchbox.type = 'search';
  searchbox.id = 'conversation-search';
  searchbox.tabIndex = 0;
  searchbox.placeholder = 'Search conversations';
  searchbox.classList = 'w-full px-4 py-2 mr-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-800 conversation-search';
  searchbox.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      const focusedConversation = document.querySelector('.selected');
      if (focusedConversation) {
        const nextConversation = focusedConversation.nextElementSibling;
        if (nextConversation) {
          nextConversation.click();
          nextConversation.scrollIntoView({ block: 'center' });
        }
      }
    }
    if (event.key === 'ArrowUp') {
      const focusedConversation = document.querySelector('.selected');
      if (focusedConversation) {
        const previousConversation = focusedConversation.previousElementSibling;
        if (previousConversation) {
          previousConversation.click();
          previousConversation.scrollIntoView({ block: 'center' });
        }
      }
    }
  });
  searchbox.addEventListener('input', debounce((event) => {
    const searchValue = event.target.value.toLowerCase();
    chrome.storage.local.get(['conversationsOrder', 'conversations'], (result) => {
      const { conversations, conversationsOrder } = result;
      // remove existing conversations
      const curConversationList = document.querySelector('#conversation-list');
      // remove conversations list childs other than the search box wrapper (first child)
      while (curConversationList.childNodes.length > 1) {
        curConversationList.removeChild(curConversationList.lastChild);
      }

      const allConversations = Object.values(conversations).filter((c) => !c.skipped);
      let filteredConversations = allConversations.sort((a, b) => b.update_time - a.update_time);

      resetSelection();
      if (searchValue) {
        filteredConversations = allConversations.filter((c) => (
          c.title?.toLowerCase()?.includes(searchValue.toLowerCase())
          || Object.values(c.mapping).map((m) => m?.message?.content?.parts?.join(' ')?.replace(/## Instructions[\s\S]*## End Instructions\n\n/, ''))
            .join(' ')?.toLowerCase()
            .includes(searchValue.toLowerCase())));
        const filteredConversationIds = filteredConversations.map((c) => c.id);
        // convert filtered conversations to object with id as key
        const filteredConversationsObj = filteredConversations.reduce((acc, cur) => {
          acc[cur.id] = cur;
          return acc;
        }, {});
        loadStorageConversations(filteredConversationsObj, filteredConversationIds, searchValue);
      } else {
        loadStorageConversations(conversations, conversationsOrder, searchValue);
        const { pathname } = new URL(window.location.toString());
        const conversationId = pathname.split('/').pop().replace(/[^a-z0-9-]/gi, '');
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(conversationId)) {
          loadConversation(conversationId, '', false);
        }
      }
    });
  }), 500);

  const newFolderButton = document.createElement('button');
  newFolderButton.id = 'new-folder-button';
  newFolderButton.classList = 'w-12 h-full flex items-center justify-center rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-800 border border-gray-800';
  const newFoolderIcon = document.createElement('img');
  newFoolderIcon.classList = 'w-5 h-5';
  newFoolderIcon.src = chrome.runtime.getURL('icons/new-folder.png');
  newFolderButton.append(newFoolderIcon);
  newFolderButton.addEventListener('mouseover', () => {
    newFolderButton.classList.remove('border-gray-800');
    newFolderButton.classList.add('bg-gray-600', 'border-gray-300');
  });
  newFolderButton.addEventListener('mouseout', () => {
    newFolderButton.classList.add('border-gray-800');

    newFolderButton.classList.remove('bg-gray-600', 'border-gray-300');
  });
  newFolderButton.addEventListener('click', (e) => {
    // inser a new folder at the top of the list
    // if cmnd + shift
    if (e.shiftKey && (e.metaKey || (isWindows() && e.ctrlKey))) {
      chrome.storage.local.remove('conversationsOrder');
      window.location.reload();
      return;
    }
    chrome.storage.local.get(['settings', 'conversationsOrder'], (result) => {
      const newFolder = {
        id: self.crypto.randomUUID(), name: 'New Folder', conversationIds: [], isOpen: true,
      };
      const { settings, conversationsOrder } = result;
      chrome.storage.local.set({ conversationsOrder: [newFolder, ...conversationsOrder] });
      const newFolderElement = createFolder(newFolder, settings.conversationTimestamp, [], true);
      const curConversationList = document.querySelector('#conversation-list');
      curConversationList.insertBefore(newFolderElement, searchBoxWrapper.nextSibling);
      curConversationList.scrollTop = 0;
    });
  });
  searchBoxWrapper.append(newFolderButton);
  // add conversation search box to the top of the list
  searchBoxWrapper.prepend(searchbox);
  conversationList.prepend(searchBoxWrapper);
}
// add new conversation to the top of the list
// eslint-disable-next-line no-unused-vars
function prependConversation(conversation) {
  const existingConversationElement = document.querySelector(`#conversation-button-${conversation.id}`);
  if (existingConversationElement) existingConversationElement.remove();
  const conversationList = document.querySelector('#conversation-list');
  const searchBoxWrapper = document.querySelector('#conversation-search-wrapper');
  const conversationElement = document.createElement('a');
  // conversationElement.href = 'javascript:';
  conversationElement.id = `conversation-button-${conversation.id}`;
  conversationElement.classList = getConversationElementClassList(conversation);
  // eslint-disable-next-line no-loop-func
  conversationElement.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    // get closet element with id starting with conversation-button
    const conversationElementId = e.srcElement.closest('[id^="conversation-button-"]').id.split('conversation-button-')[1];
    // if commandkey or ctrlkey is pressed, open in new tab
    if (e.metaKey || (isWindows() && e.ctrlKey)) {
      window.open(`https://chat.openai.com/c/${conversationElementId}`, '_blank');
      return;
    }
    const { pathname } = new URL(window.location.toString());
    const urlConversationId = pathname.split('/').pop().replace(/[^a-z0-9-]/gi, '');
    if (urlConversationId !== conversationElementId) {
      window.history.pushState({}, '', `https://chat.openai.com/c/${conversationElementId}`);
      // set conversations with class selected to not selected
      const focusedConversations = document.querySelectorAll('.selected');
      focusedConversations.forEach((c) => {
        c.classList = notSelectedClassList;
      });
      // set selected conversation
      conversationElement.classList = selectedClassList;
      loadConversation(conversationElementId);
    }
  });
  const conversationElementIcon = document.createElement('img');
  conversationElementIcon.classList = 'w-4 h-4';
  if (conversation.archived) {
    conversationElementIcon.src = chrome.runtime.getURL('icons/trash.png');
  } else if (conversation.saveHistory) {
    conversationElementIcon.src = chrome.runtime.getURL('icons/bubble.png');
  } else {
    conversationElementIcon.src = chrome.runtime.getURL('icons/bubble-purple.png');
  }
  conversationElement.appendChild(conversationElementIcon);
  const conversationTitle = document.createElement('div');
  conversationTitle.id = `conversation-title-${conversation.id}`;
  conversationTitle.classList = 'flex-1 text-ellipsis max-h-5 overflow-hidden break-all relative';
  conversationTitle.style = 'position: relative; bottom: 5px;';
  conversationTitle.innerHTML = conversation.title;
  conversationElement.title = conversation.title;
  conversationElement.appendChild(conversationTitle);
  // add timestamp
  const timestampElement = document.createElement('div');
  timestampElement.id = 'timestamp';
  timestampElement.style = 'font-size: 10px; color: lightslategray; position: absolute; bottom: 0px; left: 40px;';
  chrome.storage.local.get(['settings'], (result) => {
    const { settings } = result;
    const timestamp = settings.conversationTimestamp
      ? new Date(conversation.update_time * 1000)
      : new Date(conversation.create_time * 1000);
    const conversationLastTimestamp = formatDate(new Date(timestamp));

    timestampElement.innerHTML = conversationLastTimestamp;
  });
  conversationElement.appendChild(timestampElement);
  // action icons
  conversationElement.appendChild(conversationActions(conversation.id));

  // add checkbox
  addCheckboxToConversationElement(conversationElement, conversation);
  if (searchBoxWrapper) {
    let lastFolderAtTheTop = searchBoxWrapper;
    while (lastFolderAtTheTop.nextElementSibling.id.startsWith('wrapper-folder-') && lastFolderAtTheTop.nextElementSibling.id !== 'wrapper-folder-trash') {
      lastFolderAtTheTop = lastFolderAtTheTop.nextElementSibling;
    }
    chrome.storage.local.get(['settings'], (result) => {
      const { settings } = result;
      if (settings.keepFoldersAtTheTop) {
        lastFolderAtTheTop.after(conversationElement);
      } else {
        searchBoxWrapper.after(conversationElement);
      }
    });
    // conversationList.insertBefore(conversationElement, searchBoxWrapper.nextSibling);
  } else {
    conversationList.prepend(conversationElement);
  }
  chrome.storage.local.get(['conversationsOrder'], (result) => {
    const { conversationsOrder } = result;
    chrome.storage.local.set({ conversationsOrder: [conversation.id, ...conversationsOrder] });
  });

  // scroll to the top of the conversation list
  conversationList.scrollTop = 0;
}
// eslint-disable-next-line no-unused-vars
function generateTitleForConversation(conversationId, messageId, profile) {
  setTimeout(() => {
    generateTitle(conversationId, messageId).then((data) => {
      const { title } = data;
      chrome.storage.local.get('conversations', (result) => {
        const { conversations } = result;
        conversations[conversationId].title = title;
        chrome.storage.local.set({ conversations });
      });
      document.title = title;
      const conversationElement = document.querySelector(`#conversation-button-${conversationId}`);
      conversationElement.classList.add('animate-flash');
      const conversationTitle = conversationElement.querySelector(`#conversation-title-${conversationId}`);
      const topDiv = document.querySelector('#conversation-top');
      // animate writing title one character at a time
      conversationTitle.innerHTML = '';
      if (topDiv) topDiv.innerHTML = '';
      if (!title) return;
      title.split('').forEach((c, i) => {
        setTimeout(() => {
          conversationTitle.innerHTML += c;
          if (topDiv) topDiv.innerHTML += c;
        }, i * 50);
      });
      // at the end, add sss
      setTimeout(() => {
        if (topDiv) topDiv.innerHTML += `<span style="display:flex;" title=">> What would you like ChatGPT to know about you to provide better responses?\n${profile?.about_user_message} \n\n>> How would you like ChatGPT to respond?\n${profile?.about_model_message}">&nbsp;&nbsp;<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" fill="none" class="ml-0.5 mt-0.5 h-4 w-4 flex-shrink-0 text-gray-600 dark:text-gray-200 sm:mb-0.5 sm:mt-0 sm:h-5 sm:w-5"><path d="M8.4375 8.4375L8.46825 8.4225C8.56442 8.37445 8.67235 8.35497 8.77925 8.36637C8.88615 8.37776 8.98755 8.41955 9.07143 8.48678C9.15532 8.55402 9.21818 8.64388 9.25257 8.74574C9.28697 8.8476 9.29145 8.95717 9.2655 9.0615L8.7345 11.1885C8.70836 11.2929 8.7127 11.4026 8.74702 11.5045C8.78133 11.6065 8.84418 11.6965 8.9281 11.7639C9.01202 11.8312 9.1135 11.8731 9.2205 11.8845C9.32749 11.8959 9.43551 11.8764 9.53175 11.8282L9.5625 11.8125M15.75 9C15.75 9.88642 15.5754 10.7642 15.2362 11.5831C14.897 12.4021 14.3998 13.1462 13.773 13.773C13.1462 14.3998 12.4021 14.897 11.5831 15.2362C10.7642 15.5754 9.88642 15.75 9 15.75C8.11358 15.75 7.23583 15.5754 6.41689 15.2362C5.59794 14.897 4.85382 14.3998 4.22703 13.773C3.60023 13.1462 3.10303 12.4021 2.76381 11.5831C2.42459 10.7642 2.25 9.88642 2.25 9C2.25 7.20979 2.96116 5.4929 4.22703 4.22703C5.4929 2.96116 7.20979 2.25 9 2.25C10.7902 2.25 12.5071 2.96116 13.773 4.22703C15.0388 5.4929 15.75 7.20979 15.75 9ZM9 6.1875H9.006V6.1935H9V6.1875Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></span>`;
      }, title.length * 50);
    });
  }, 500);// a little delay to make sure gen title still works even if user stops the generation
}

function loadStorageConversations(conversations, conversationsOrder = [], searchValue = '') {
  chrome.storage.local.get(['settings'], (result) => {
    const { conversationTimestamp } = result.settings;
    const conversationList = document.querySelector('#conversation-list');

    for (let i = 0; i < conversationsOrder.length; i += 1) {
      const conversation = conversationsOrder[i];
      const isFolder = typeof conversation === 'object';
      if (isFolder) {
        const folderElement = createFolder(conversation, conversationTimestamp, conversations);
        conversationList.appendChild(folderElement);
      } else {
        const conv = Object.values(conversations).find((c) => c.id === conversation);
        if (!conv) continue;
        if (conv.skipped) continue;
        const conversationElement = createConversation(conv, conversationTimestamp, searchValue);
        conversationList.appendChild(conversationElement);
      }
    }
    const existingNoResult = document.querySelector('#search-no-result');
    if (existingNoResult) existingNoResult.remove();
    if (searchValue) {
      if (Object.values(conversations).length > 0) {
        // click on first conversation
        const firstConversation = document.querySelector('[id^="conversation-button-"]');
        if (firstConversation) {
          firstConversation.click();
          // focus on searchbox
          const searchbox = document.querySelector('#conversation-search');
          searchbox.focus();
        }
      } else {
        const noResult = document.createElement('div');
        noResult.id = 'search-no-result';
        noResult.classList = 'text-gray-300 text-center';
        noResult.innerHTML = 'No results';
        conversationList.appendChild(noResult);
        showNewChatPage();
      }
    }
  });
}

function updateNewChatButtonSynced() {
  chrome.storage.local.get(['selectedConversations', 'conversationsAreSynced'], (result) => {
    const { selectedConversations, conversationsAreSynced } = result;
    const textAreaElement = document.querySelector('main form textarea');
    const nav = document.querySelector('nav');
    const newChatButton = nav?.querySelector('a');
    newChatButton.classList = 'flex py-3 px-3 w-full items-center gap-3 transition-colors duration-200 text-white cursor-pointer text-sm rounded-md border border-white/20 hover:bg-gray-500/10 mb-1 flex-shrink-0';
    if (!newChatButton) return;
    // clone newChatButton
    if (conversationsAreSynced) {
      const newChatButtonClone = newChatButton.cloneNode(true);
      newChatButtonClone.id = 'new-chat-button';
      newChatButton.replaceWith(newChatButtonClone);
      if (!newChatButtonClone) return;
      newChatButtonClone.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.target.innerText === 'Clear selection') {
          resetSelection();
        } else {
          showNewChatPage();

          if (textAreaElement) {
            textAreaElement.focus();
          }
          // remove selected class from conversations from conversations list
          const focusedConversations = document.querySelectorAll('.selected');
          focusedConversations.forEach((c) => {
            c.classList = notSelectedClassList;
          });
          // if search box has value reload conversations list
          const searchBox = document.querySelector('#conversation-search');
          if (searchBox?.value) {
            searchBox.value = '';
            searchBox.dispatchEvent(new Event('input'), { bubbles: true });
          }
        }
      });
      if (selectedConversations?.length > 0) {
        newChatButtonClone.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>Clear selection';
      } else {
        newChatButtonClone.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>New chat';
      }
    }
  });
}
function submitChat(userInput, conversation, messageId, parentId, settings, models, continueGenerating = false, regenerateResponse = false) {
  // check window. localstorage every 200ms until arkoseToken is set
  let arkoseToken;
  const startTime = Date.now();
  const interval = setInterval(() => {
    arkoseToken = window.localStorage.getItem('arkoseToken');

    if (Date.now() - startTime > 60000) {
      clearInterval(interval);
      isGenerating = false;
      chunkNumber = 1;
      totalChunks = 1;
      remainingText = '';
      finalSummary = '';
      shouldSubmitFinalSummary = false;
      // remove the last user message
      const lastMessageWrapper = [...document.querySelectorAll('[id^="message-wrapper-"]')].pop();
      if (lastMessageWrapper?.dataset?.role !== 'assistant') {
        lastMessageWrapper.remove();
      }
      const syncDiv = document.getElementById('sync-div');
      syncDiv.style.opacity = '1';
      const main = document.querySelector('main');
      const inputForm = main.querySelector('form');
      const submitButton = inputForm.querySelector('textarea ~ button');
      // submitButton.disabled = false;
      submitButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" class="h-4 w-4" stroke-width="2"><path d="M.5 1.163A1 1 0 0 1 1.97.28l12.868 6.837a1 1 0 0 1 0 1.766L1.969 15.72A1 1 0 0 1 .5 14.836V10.33a1 1 0 0 1 .816-.983L8.5 8 1.316 6.653A1 1 0 0 1 .5 5.67V1.163Z" fill="currentColor"></path></svg>';
      return;
    }
    if (arkoseToken || !settings.selectedModel.tags.includes('gpt4') || settings.selectedModel.tags.includes('Unofficial')) {
      clearInterval(interval);
      scrolUpDetected = false;
      const curSubmitButton = document.querySelector('main').querySelector('form').querySelector('textarea ~ button');
      curSubmitButton.disabled = true;
      curSubmitButton.style.backgroundColor = 'transparent';
      curSubmitButton.innerHTML = '<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"></circle> <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg>';
      const syncDiv = document.getElementById('sync-div');
      if (syncDiv) syncDiv.style.opacity = '0.3';
      if (!regenerateResponse) initializeRegenerateResponseButton();
      chatStreamIsClosed = false;
      let existingInnerHTML = '';
      let existingWordCount = 0;
      let existingCharCount = 0;
      if (continueGenerating) {
        const incompleteAssistant = [...document.querySelectorAll('[id^="message-wrapper-"][data-role="assistant"]')].pop();
        existingInnerHTML = incompleteAssistant.querySelector('[id^=message-text-]').innerHTML;
        existingWordCount = incompleteAssistant.querySelector('[id^=message-text-]').innerText.split(/[ /]/).length;
        existingCharCount = incompleteAssistant.querySelector('[id^=message-text-]').innerText.length;
      }
      const suggestionsWrapper = document.querySelector('#suggestions-wrapper');
      if (suggestionsWrapper) suggestionsWrapper.remove();
      const saveHistory = conversation?.id ? conversation.saveHistory : settings.saveHistory;
      generateChat(userInput, conversation?.id, messageId, parentId, arkoseToken, lastPromptSuggestions, saveHistory, 'user', continueGenerating ? 'continue' : 'next').then((chatStream) => {
        userChatIsActuallySaved = regenerateResponse || continueGenerating;
        let userChatSavedLocally = regenerateResponse || continueGenerating; // false by default unless regenerateResponse is true
        let assistantChatSavedLocally = false;
        let finalMessage = '';
        let finalConversationId = '';
        let initialUserMessage = {};
        let systemMessage = {};
        chatStream.addEventListener('message', (e) => {
          if (e.data === '[DONE]' || chatStreamIsClosed) {
            const main = document.querySelector('main');
            const inputForm = main.querySelector('form');
            const submitButton = inputForm.querySelector('textarea ~ button');
            const textAreaElement = inputForm.querySelector('textarea');
            textAreaElement.focus();
            // submitButton.disabled = false;
            submitButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" class="h-4 w-4" stroke-width="2"><path d="M.5 1.163A1 1 0 0 1 1.97.28l12.868 6.837a1 1 0 0 1 0 1.766L1.969 15.72A1 1 0 0 1 .5 14.836V10.33a1 1 0 0 1 .816-.983L8.5 8 1.316 6.653A1 1 0 0 1 .5 5.67V1.163Z" fill="currentColor"></path></svg>';
            if (chatStreamIsClosed && e.data !== '[DONE]') {
              const data = JSON.parse(e.data);
              if (data.error) throw new Error(data.error);
              const { conversation_id: conversationId, message } = data;
              finalConversationId = conversationId;
              finalMessage = message;
              // reset splitter stuff
              chunkNumber = 1;
              totalChunks = 1;
              remainingText = '';
              finalSummary = '';
              shouldSubmitFinalSummary = false;
              // update rowAssistant?
            }
            // since we are closing the chat stream, but the following function has a delay
            const tmpChatStreamIsClosed = chatStreamIsClosed;
            const tempId = setInterval(() => {
              if (userChatIsActuallySaved) {
                clearInterval(tempId);
                // don't generate title if tmpChatStreamIsClosed
                updateOrCreateConversation(finalConversationId, finalMessage, messageId, settings, !tmpChatStreamIsClosed, tmpChatStreamIsClosed).then(() => {
                  if (!tmpChatStreamIsClosed) { // if not clicked on stop generating button
                    chrome.storage.local.get(['account'], (result) => {
                      const { account } = result;
                      const isPaid = account?.accounts?.default?.entitlement?.has_active_subscription || false;
                      if (runningPromptChainSteps && runningPromptChainSteps.length > 1 && runningPromptChainIndex < runningPromptChainSteps.length - 1) {
                        setTimeout(() => {
                          insertNextChain(runningPromptChainSteps, runningPromptChainIndex + 1);
                        }, isPaid ? 700 : 2000);
                      } else {
                        runningPromptChainSteps = undefined;
                        runningPromptChainIndex = 0;
                        setTimeout(() => {
                          insertNextChunk(settings, finalMessage);
                        }, isPaid ? 700 : 2000);
                      }
                    });
                  } else {
                    runningPromptChainSteps = undefined;
                    runningPromptChainIndex = 0;
                  }
                });
              }
            }, 1000);
            isGenerating = false;
            chatStreamIsClosed = false;
            chatStream.close();
            if (syncDiv) syncDiv.style.opacity = '1';
            showHideTextAreaElement();
            initializeStopGeneratingResponseButton();
            initializeRegenerateResponseButton();
            updateTotalCounter();
            if (settings.chatEndedSound) {
              playSound('beep');
            }
            // generateSuggestions(finalConversationId, messageId, settings.selectedModel.slug);
          } else if (e.event === 'ping') {
            // console.error('PING RECEIVED', e);
          } else {
            try {
              if (chatStream.readyState !== 2) {
                isGenerating = true;
              }
              if (finalMessage === '') {
                const pluginDropdownButton = document.querySelector('#navbar-plugins-dropdown-button');
                if (pluginDropdownButton) {
                  pluginDropdownButton.disabled = true;
                  pluginDropdownButton.style.opacity = 0.75;
                  pluginDropdownButton.title = 'Changing plugins in the middle of the conversation is not allowed';
                }
                initializeStopGeneratingResponseButton();
                // update gpt4 counter
                if (!continueGenerating) {
                  chrome.storage.local.get(['gpt4Timestamps', 'settings', 'conversationLimit'], (result) => {
                    const { gpt4Timestamps } = result;
                    if (!result.settings.selectedModel.tags.includes('gpt4') && result.settings.selectedModel.slug !== 'gpt-4') return;
                    const now = new Date().getTime();
                    const gpt4CounterElement = document.querySelector('#gpt4-counter');
                    gpt4CounterElement.style.display = result.settings.showGpt4Counter ? 'block' : 'none';
                    const messageCap = result?.conversationLimit?.message_cap || 50;
                    const messageCapWindow = result?.conversationLimit?.message_cap_window || 180;
                    if (gpt4Timestamps) {
                      gpt4Timestamps.push(now);
                      const hoursAgo = now - (messageCapWindow / 60) * 60 * 60 * 1000;
                      const gpt4TimestampsFiltered = gpt4Timestamps.filter((timestamp) => timestamp > hoursAgo);
                      chrome.storage.local.set({ gpt4Timestamps: gpt4TimestampsFiltered, capExpiresAt: '' });
                      if (gpt4CounterElement) {
                        gpt4CounterElement.innerText = `GPT-4 requests (last ${getGPT4CounterMessageCapWindow(messageCapWindow)}): ${gpt4TimestampsFiltered.length}/${messageCap}`;
                      }
                    } else {
                      chrome.storage.local.set({ gpt4Timestamps: [now] });
                      if (gpt4CounterElement) {
                        gpt4CounterElement.innerText = `GPT-4 requests (last ${getGPT4CounterMessageCapWindow(messageCapWindow)}): 1/${messageCap}`;
                      }
                    }
                  });
                }
              }

              const data = JSON.parse(e.data);

              if (data.error) throw new Error(data.error);
              const { conversation_id: conversationId, message } = data;
              const { role } = message.author;
              const { recipient } = message;

              finalConversationId = conversationId;
              const { pathname } = new URL(window.location.toString());
              const urlConversationId = pathname.split('/').pop().replace(/[^a-z0-9-]/gi, '');
              if (pathname === '/') { // https://chat.openai.com/
                // only change url if there are any user messages. if user switch to new page while generating, don't change url when done generating
                const anyUserMessageWrappers = document.querySelectorAll('[id^="message-wrapper-"][data-role="user"]').length > 0;
                if (anyUserMessageWrappers) {
                  window.history.pushState({}, '', `https://chat.openai.com/c/${finalConversationId}`);
                }
              }
              // save user chat locally
              if (!conversation?.id) {
                if (role === 'system') {
                  systemMessage = message;
                  return;
                }
                if (role === 'user') {
                  initialUserMessage = message;
                  initialUserMessage.metadata = { ...initialUserMessage.metadata, model_slug: settings.selectedModel.slug };
                  // set forcerefresh=true when adding user chat, and set it to false when stream ends. This way if something goes wrong in between, the conversation will be refreshed later
                  updateOrCreateConversation(finalConversationId, initialUserMessage, parentId, settings, false, true, systemMessage);
                  return;
                }
              } else if (!userChatSavedLocally) {
                const userMessage = {
                  id: messageId,
                  author: {
                    role: 'user',
                    metadata: {},
                  },
                  content: {
                    content_type: 'text',
                    parts: [userInput],
                  },
                  metadata: { model_slug: settings.selectedModel.slug },
                  recipient: recipient || 'all',
                };

                // set forcerefresh=true when adding user chat, and set it to false when stream ends. This way if something goes wrong in between, the conversation will be refreshed later
                updateOrCreateConversation(finalConversationId, userMessage, parentId, settings, false, true);
                userChatSavedLocally = true;
              }
              if (!conversation?.id || userChatSavedLocally) {
                // save assistant chat locally
                finalMessage = message;
                if (!assistantChatSavedLocally && (message.role === 'assistant' || message.author?.role === 'assistant') && message.recipient === 'all') {
                  assistantChatSavedLocally = true;
                  const tempId = setInterval(() => {
                    if (userChatIsActuallySaved) {
                      clearInterval(tempId);
                      updateOrCreateConversation(finalConversationId, finalMessage, messageId, settings);
                    }
                  }, 1000);
                }
              }

              // if user switch conv while generating, dont show the assistant row until the user switch back to the original conv
              if (finalConversationId !== urlConversationId) return;

              if (role !== 'assistant' && role !== 'user') return;
              if (recipient !== 'all') return;

              const lastRowAssistant = [...document.querySelectorAll('[id^="message-wrapper-"][data-role="assistant"]')].pop();
              const existingRowAssistant = continueGenerating ? lastRowAssistant : document.querySelector(`[id="message-wrapper-${message.id}"][data-role="assistant"]`);

              if (existingRowAssistant) {
                if (!scrolUpDetected && settings.autoScroll) {
                  document.querySelector('#conversation-bottom').scrollIntoView();
                }

                const existingRowAssistantTextWrapper = existingRowAssistant.querySelector('[id^=message-text-]');

                const resultCounter = existingRowAssistant.querySelector('[id^=result-counter-]');
                const searchValue = document.querySelector('#conversation-search')?.value;
                let messageContentParts = searchValue ? highlight(finalMessage.content.parts.join('\n'), searchValue) : finalMessage.content.parts.join('\n');
                const { citations } = finalMessage.metadata;
                if (citations?.length > 0) {
                  citations.reverse().forEach((citation, index) => {
                    const startIndex = citation.start_ix;
                    const endIndex = citation.end_ix;
                    const citationMetadata = citation.metadata;
                    const { url } = citationMetadata;
                    // number 1 with link to  url
                    let citationText = `[^1^](${url})`;
                    if (endIndex === citations[index - 1]?.start_ix) {
                      citationText = '';
                    }

                    messageContentParts = messageContentParts.replace(messageContentParts.substring(startIndex, endIndex), citationText);
                  });
                }

                messageContentParts = messageContentParts.replace(/[^n}]\n\\/g, '\n\n\\');
                const messageContentPartsHTML = markdown('assistant')
                  .use(markdownitSup)
                  .use(texmath, {
                    engine: katex,
                    delimiters: 'brackets',
                    katexOptions: { macros: { '\\RR': '\\mathbb{R}' } },
                  }).render(messageContentParts);
                const wordCount = messageContentParts.split(/[ /]/).length + existingWordCount;
                const charCount = messageContentParts.replace(/\n/g, '').length + existingCharCount;

                existingRowAssistantTextWrapper.innerHTML = `${existingInnerHTML}${messageContentPartsHTML}`;
                if (resultCounter) {
                  resultCounter.innerHTML = `${charCount} chars / ${wordCount} words`;
                }
              } else {
                const lastMessageWrapper = [...document.querySelectorAll('[id^="message-wrapper-"]')].pop();
                if (lastMessageWrapper?.dataset?.role !== 'assistant') {
                  const existingRowUser = document.querySelector(`[id="message-wrapper-${messageId}"][data-role="user"]`);
                  if (existingRowUser) {
                    let threadCount = Object.keys(conversation).length > 0 ? conversation?.mapping[messageId]?.children?.length || 1 : 1;
                    if (regenerateResponse) threadCount += 1;
                    const assistantRow = rowAssistant(conversation, data, threadCount, threadCount, models, settings.customConversationWidth, settings.conversationWidth, settings.showMessageTimestamp, settings.showWordCount);
                    const conversationBottom = document.querySelector('#conversation-bottom');
                    conversationBottom.insertAdjacentHTML('beforebegin', assistantRow);
                    if (!scrolUpDetected && settings.autoScroll) {
                      conversationBottom.scrollIntoView();
                    }
                  }
                }
              }
              // addCopyCodeButtonsEventListeners();
            } catch (err) {
              syncDiv.style.opacity = '1';
              // if (err.message === 'Unexpected end of JSON input') {
              // }
            }
          }
        });
        chatStream.addEventListener('error', (err) => {
          // Firefox returns error when closing chat stream
          const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
          // if firefox and no error data, do nothing
          if (isFirefox && !err.data) return;
          if (settings.chatEndedSound) {
            playSound('beep');
          }
          isGenerating = false;
          chunkNumber = 1;
          totalChunks = 1;
          remainingText = '';
          finalSummary = '';
          shouldSubmitFinalSummary = false;
          syncDiv.style.opacity = '1';
          const main = document.querySelector('main');
          const inputForm = main.querySelector('form');
          const submitButton = inputForm.querySelector('textarea ~ button');
          // submitButton.disabled = false;
          submitButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" class="h-4 w-4" stroke-width="2"><path d="M.5 1.163A1 1 0 0 1 1.97.28l12.868 6.837a1 1 0 0 1 0 1.766L1.969 15.72A1 1 0 0 1 .5 14.836V10.33a1 1 0 0 1 .816-.983L8.5 8 1.316 6.653A1 1 0 0 1 .5 5.67V1.163Z" fill="currentColor"></path></svg>';
          // eslint-disable-next-line no-console
          console.warn(err);
          if (err.data) {
            const error = JSON.parse(err.data);
            const errorCode = error?.detail?.code;
            let errorMessage = typeof error.detail === 'string' ? error.detail : error.detail.message;
            if (errorCode === 'model_cap_exceeded') {
              // seconds until cap is cleared
              const clearsIn = error?.detail?.clears_in;
              const date = new Date();
              date.setSeconds(date.getSeconds() + clearsIn);
              // print expire hour minute from local time
              const hour = date.getHours();
              const minute = date.getMinutes();
              const ampm = hour >= 12 ? 'pm' : 'am';
              const hour12 = hour % 12;
              const hour12Display = hour12 || 12;
              const minuteDisplay = minute < 10 ? `0${minute}` : minute;
              const capExpiresAt = `${hour12Display}:${minuteDisplay}${ampm}`;
              chrome.storage.local.set({ capExpiresAt });
              errorMessage = `You've reached the current usage cap for this model. You can continue with the default model now, or try again after ${capExpiresAt}.`;
            } else {
              showHideTextAreaElement();
              chrome.storage.local.set({ capExpiresAt: '' });
            }
            const conversationBottom = document.querySelector('#conversation-bottom');
            const errorMessageElement = `<div id="response-error-msg" style="max-width:400px" class="py-2 px-3 my-2 border text-gray-600 rounded-md text-sm dark:text-gray-100 border-red-500 bg-red-500/10">${errorMessage}</div>`;
            conversationBottom.insertAdjacentHTML('beforebegin', errorMessageElement);
            conversationBottom.scrollIntoView({ behavior: 'smooth' });
          }
        });
      });
    }
  }, 200);
}
function submitFinalSummary() {
  if (!shouldSubmitFinalSummary) return;
  if (finalSummary === '') return;
  const inputForm = document.querySelector('form');
  if (!inputForm) return;
  const submitButton = inputForm.querySelector('textarea ~ button');
  if (!submitButton) return;
  const textAreaElement = inputForm.querySelector('textarea');
  if (!textAreaElement) return;

  textAreaElement.value = `Here's the final summary of our conversation:
${finalSummary}
Reply with OK: [Summary is received!]. Don't reply with anything else!`;
  shouldSubmitFinalSummary = false;
  finalSummary = '';
  textAreaElement.focus();
  textAreaElement.dispatchEvent(new Event('input', { bubbles: true }));
  textAreaElement.dispatchEvent(new Event('change', { bubbles: true }));
  setTimeout(() => {
    submitButton.click();
  }, 300);
}
function insertNextChunk(settings, previousMessage) {
  if (settings.autoSummarize) {
    finalSummary = `${finalSummary}\n${previousMessage.content.parts.join('\n')}`;

    if (shouldSubmitFinalSummary) {
      submitFinalSummary();
      return;
    }
  }
  if (!settings.autoSplit || totalChunks === 1 || remainingText === '') {
    if (settings.autoClick) {
      const continueButton = document.getElementById('continue-conversation-button');
      if (!continueButton) return;
      continueButton.click();
    }
    return;
  }
  const textAreaElement = document.querySelector('main form textarea');
  if (!textAreaElement) return;
  const submitButton = document.querySelector('main form textarea ~ button');
  if (!submitButton) return;
  const lastNewLineIndexBeforeLimit = settings.autoSplitLimit > remainingText.length ? settings.autoSplitLimit : getLastIndexOf(remainingText, settings.autoSplitLimit);

  textAreaElement.value = `[START CHUNK ${chunkNumber}/${totalChunks}]
${remainingText.slice(0, lastNewLineIndexBeforeLimit)}
[END CHUNK ${chunkNumber}/${totalChunks}]
${settings.autoSplitChunkPrompt}`;
  textAreaElement.focus();
  textAreaElement.dispatchEvent(new Event('input', { bubbles: true }));
  textAreaElement.dispatchEvent(new Event('change', { bubbles: true }));
  setTimeout(() => {
    submitButton.click();
  }, 300);
}

function getLastIndexOf(text, position) {
  // if text down't include \n or . or ? or ! return position
  if (!text.includes('\n') && !text.includes('.') && !text.includes('?') && !text.includes('!')) return position;
  // last index of space before position
  const space = text.lastIndexOf(' ', position);
  // last index of \n before position
  const newLine = text.lastIndexOf('\n', position);
  // last index of . before newLine
  const period = text.lastIndexOf('.', position);
  // last index of ? before newLine
  const questionMark = text.lastIndexOf('?', position);
  // last index of ! before newLine
  const exclamationMark = text.lastIndexOf('!', position);
  // return the closest index to position
  return Math.max(space, newLine, period, questionMark, exclamationMark) + 1;
}
function overrideSubmitForm() {
  const main = document.querySelector('main');
  if (!main) return;
  const inputForm = main.querySelector('form');
  if (!inputForm) return;
  inputForm.addEventListener('submit', (e) => {
    const textAreaElement = inputForm.querySelector('textarea');
    e.preventDefault();
    e.stopPropagation();
    if (isGenerating) return;
    // get all words wrapped in {{ and }}
    chrome.storage.local.get(['settings', 'conversations', 'models'], ({
      settings, conversations, models,
    }) => {
      const templateWords = textAreaElement.value.match(/{{(.*?)}}/g);
      if (settings.promptTemplate && templateWords?.length > 0) {
        // open template words modal and wait for user to select a word. the when user submit, submit the input form with the replacement
        createTemplateWordsModal(templateWords);
        setTimeout(() => {
          const firstTemplateWordInput = document.querySelector('[id^=template-input-]');
          if (firstTemplateWordInput) {
            firstTemplateWordInput.focus();
            firstTemplateWordInput.value = '';
          }
        }, 100);
      } else {
        const { pathname } = new URL(window.location.toString());
        // const isSharedConversation = pathname.startsWith('/share/') && window.location.href.endsWith('/continue');
        const conversationId = pathname.split('/').pop().replace(/[^a-z0-9-]/gi, '');
        const anyUserMessageWrappers = document.querySelectorAll('[id^="message-wrapper-"][data-role="user"]').length > 0;
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(conversationId) && anyUserMessageWrappers) {
          const conversation = conversations[conversationId];
          chrome.storage.sync.get(['name', 'avatar'], (result) => {
            let text = textAreaElement.value.trim();
            if (chunkNumber === 1) {
              finalSummary = '';
              if (settings.autoSplit && text.length > settings.autoSplitLimit && !runningPromptChainSteps) {
                totalChunks = Math.ceil(text.length / settings.autoSplitLimit);
                const lastNewLineIndexBeforeLimit = settings.autoSplitLimit > text.length ? settings.autoSplitLimit : getLastIndexOf(text, settings.autoSplitLimit);
                remainingText = text.substring(lastNewLineIndexBeforeLimit);
                text = `${settings.autoSplitInitialPrompt}[START CHUNK ${chunkNumber}/${totalChunks}]
${text.substring(0, lastNewLineIndexBeforeLimit)}
[END CHUNK ${chunkNumber}/${totalChunks}]
${settings.autoSplitChunkPrompt}`;
                chunkNumber += 1;
              } else {
                text = generateInstructions(conversation, settings, textAreaElement.value.trim());
              }
            } else if (chunkNumber === totalChunks) {
              if (totalChunks > 1 && settings.autoSummarize) shouldSubmitFinalSummary = true;
              chunkNumber = 1;
              totalChunks = 1;
              remainingText = '';
            } else {
              chunkNumber += 1;
              const lastNewLineIndexBeforeLimit = settings.autoSplitLimit > remainingText.length ? settings.autoSplitLimit : getLastIndexOf(remainingText, settings.autoSplitLimit);
              remainingText = remainingText.slice(lastNewLineIndexBeforeLimit);
            }
            const messageId = self.crypto.randomUUID();
            const allMessages = document.querySelectorAll('[id^="message-wrapper-"]');
            const lastMessage = allMessages[allMessages.length - 1];
            const parentId = lastMessage?.id?.split('message-wrapper-')[1] || self.crypto.randomUUID();
            const conversationBottom = document.querySelector('#conversation-bottom');
            if (text && settings.useCustomInstruction) {
              text += settings.customInstruction;
            }
            const node = { message: { id: messageId, content: { parts: [text] } } };
            const userRow = rowUser(conversation, node, 1, 1, result.name, result.avatar, settings.customConversationWidth, settings.conversationWidth);
            // if last message data-role !== user, insert user row before conversation bottom
            if (lastMessage?.dataset?.role !== 'user') {
              conversationBottom.insertAdjacentHTML('beforebegin', userRow);
            }
            conversationBottom.scrollIntoView({ behavior: 'smooth' });
            if (text) {
              isGenerating = true;
              submitChat(text, conversation, messageId, parentId, settings, models);
              textAreaElement.value = '';
              textAreaElement.style.height = '56px';
              updateInputCounter('');
            }
          });
        } else {
          chrome.storage.sync.get(['name', 'avatar'], (result) => {
            let text = textAreaElement.value.trim();
            if (chunkNumber === 1) {
              finalSummary = '';
              if (settings.autoSplit && text.length > settings.autoSplitLimit) {
                totalChunks = Math.ceil(text.length / settings.autoSplitLimit);
                const lastNewLineIndexBeforeLimit = settings.autoSplitLimit > text.length ? settings.autoSplitLimit : getLastIndexOf(text, settings.autoSplitLimit);
                remainingText = text.substring(lastNewLineIndexBeforeLimit);
                text = `${settings.autoSplitInitialPrompt}[START CHUNK ${chunkNumber}/${totalChunks}]
${text.substring(0, lastNewLineIndexBeforeLimit)}
[END CHUNK ${chunkNumber}/${totalChunks}]
${settings.autoSplitChunkPrompt}`;
                chunkNumber += 1;
              } else {
                text = generateInstructions({}, settings, textAreaElement.value.trim());
              }
            } else if (chunkNumber === totalChunks) {
              if (totalChunks > 1 && settings.autoSummarize) shouldSubmitFinalSummary = true;
              chunkNumber = 1;
              totalChunks = 1;
              remainingText = '';
            } else {
              chunkNumber += 1;
              const lastNewLineIndexBeforeLimit = settings.autoSplitLimit > remainingText.length ? settings.autoSplitLimit : getLastIndexOf(remainingText, settings.autoSplitLimit);
              remainingText = remainingText.slice(lastNewLineIndexBeforeLimit);
            }

            const messageId = self.crypto.randomUUID();
            if (text && settings.useCustomInstruction) {
              text += settings.customInstruction;
            }
            const node = { message: { id: messageId, content: { parts: [text] } } };
            const allMessages = document.querySelectorAll('[id^="message-wrapper-"]');
            const lastMessage = allMessages[allMessages.length - 1];
            const parentId = lastMessage?.id?.split('message-wrapper-')[1] || self.crypto.randomUUID();
            // remove main first child
            const contentWrapper = main.querySelector('.flex-1.overflow-hidden');
            main.firstChild.removeChild(contentWrapper);

            const outerDiv = document.createElement('div');
            outerDiv.classList = 'flex-1 overflow-hidden';
            const innerDiv = document.createElement('div');
            innerDiv.classList = 'h-full overflow-y-auto';
            innerDiv.style = 'scroll-behavior: smooth;';
            innerDiv.id = 'conversation-inner-div';
            addScrollDetector(innerDiv);
            const conversationDiv = document.createElement('div');
            conversationDiv.classList = 'flex flex-col items-center text-sm h-full dark:bg-gray-800';
            const userRow = rowUser({}, node, 1, 1, result.name, result.avatar, settings.customConversationWidth, settings.conversationWidth);
            conversationDiv.innerHTML = userRow;
            const topDiv = '<div id="conversation-top" class="w-full flex items-center justify-center border-b border-black/10 dark:border-gray-900/50 text-gray-800 dark:text-gray-100 group bg-gray-50 dark:bg-[#444654]" style="min-height:56px;z-index:0;">New chat</div>';
            conversationDiv.insertAdjacentHTML('afterbegin', topDiv);
            const bottomDiv = document.createElement('div');
            bottomDiv.id = 'conversation-bottom';
            bottomDiv.classList = 'w-full h-32 md:h-48 flex-shrink-0';
            conversationDiv.appendChild(bottomDiv);
            const bottomDivContent = document.createElement('div');
            bottomDivContent.classList = 'relative text-base gap-4 md:gap-6 m-auto md:max-w-2xl lg:max-w-2xl xl:max-w-3xl flex lg:px-0';
            if (settings.customConversationWidth) {
              bottomDivContent.style = `max-width: ${settings.conversationWidth}%`;
            }
            bottomDiv.appendChild(bottomDivContent);
            const totalCounter = document.createElement('div');
            totalCounter.id = 'total-counter';
            totalCounter.style = 'position: absolute; top: 0px; right: 0px; font-size: 10px; color: rgb(153, 153, 153); opacity: 0.8;';
            bottomDivContent.appendChild(totalCounter);

            innerDiv.appendChild(conversationDiv);
            outerDiv.appendChild(innerDiv);
            main.firstChild.prepend(outerDiv);
            if (text) {
              isGenerating = true;
              submitChat(text, {}, messageId, parentId, settings, models);
              textAreaElement.value = '';
              textAreaElement.style.height = '56px';
              updateInputCounter('');
            }
          });
        }
      }
    });
  });
  // textAreaElement.addEventListener('keydown', (e) => {
  //   if (e.key === 'Enter' && e.which === 13 && !e.shiftKey) {
  //     disableTextInput = true;
  //     if (textAreaElement.value.trim().length === 0) {
  //       e.preventDefault();
  //       e.stopPropagation();
  //       return;
  //     }
  //     if (isGenerating) return;
  //     inputForm.dispatchEvent(new Event('submit', { cancelable: true }));
  //   }
  // });
  const submitButton = inputForm.querySelector('textarea ~ button');
  const submitButtonClone = submitButton.cloneNode(true);
  submitButtonClone.type = 'button';
  submitButtonClone.addEventListener('click', () => {
    chrome.storage.local.get(['settings'], ({ settings }) => {
      const textAreaElement = inputForm.querySelector('textarea');
      if (isGenerating) return;
      const templateWords = textAreaElement.value.match(/{{(.*?)}}/g);
      if (settings.promptTemplate && templateWords?.length > 0) {
        // open template words modal and wait for user to select a word. the when user submit, submit the input form with the replacement
        createTemplateWordsModal(templateWords);
        setTimeout(() => {
          const firstTemplateWordInput = document.querySelector('[id^=template-input-]');
          if (firstTemplateWordInput) {
            firstTemplateWordInput.focus();
            firstTemplateWordInput.value = '';
          }
        }, 100);
      } else {
        textAreaElement.style.height = '56px';
        if (textAreaElement.value.trim().length === 0) return;
        addUserPromptToHistory(textAreaElement.value.trim());
        inputForm.dispatchEvent(new Event('submit', { cancelable: true }));
      }
    });
  });
  submitButton.parentNode.replaceChild(submitButtonClone, submitButton);
}

function setBackButtonDetection() {
  window.addEventListener('popstate', () => {
    const { pathname } = new URL(window.location.toString());
    const conversationId = pathname.split('/').pop().replace(/[^a-z0-9-]/gi, '');
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(conversationId)) {
      chrome.storage.local.get(['conversations'], (result) => {
        const { conversations } = result;
        if (conversations && conversations[conversationId]) {
          const searchbox = document.querySelector('#conversation-search');
          const searchValue = searchbox.value;
          const conversationElement = document.querySelector(`#conversation-button-${conversationId}`);
          const focusedConversations = document.querySelectorAll('.selected');
          focusedConversations.forEach((c) => {
            c.classList = notSelectedClassList;
          });
          // set selected conversation
          conversationElement.classList = selectedClassList;
          loadConversation(conversationId, searchValue);
        }
      });
    } else if (pathname === '/') {
      showNewChatPage();
    }
  });
}

// eslint-disable-next-line no-unused-vars
function loadConversationList(skipInputFormReload = false) {
  chrome.storage.local.get(['conversationsOrder', 'conversations', 'conversationsAreSynced', 'settings'], (result) => {
    if (result.conversationsAreSynced && typeof result.conversations !== 'undefined') {
      updateNewChatButtonSynced();
      if (!skipInputFormReload) initializeNavbar();
      if (!skipInputFormReload) replaceTextAreaElemet(result.settings);
      removeOriginalConversationList();
      createSearchBox();
      loadStorageConversations(result.conversations, result.conversationsOrder);
      const { origin, pathname, search } = new URL(window.location.toString());
      // const isSharedConversation = pathname.startsWith('/share/') && window.location.href.endsWith('/continue');
      // console.warn('isSharedConversation', isSharedConversation);
      // if (isSharedConversation) {
      //   const conversationId = pathname.split('/').pop().pop().replace(/[^a-z0-9-]/gi, '');
      //   // get content of script element with id=__NEXT_DATA__
      //   if (/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(conversationId)) {
      //     const script = document.querySelector('#__NEXT_DATA__');
      //     const scriptContent = JSON.parse(script.innerHTML);
      //     const { props } = scriptContent;
      //     const { pageProps } = props;
      //     const conversation = pageProps.serverResponse.data;
      //    console.warn('conversation', conversation);
      //     loadSharedConversation(conversationId, conversation);
      //   }
      // } else {
      const conversationId = pathname.split('/').pop().replace(/[^a-z0-9-]/gi, '');
      const conversationList = document.querySelector('#conversation-list');
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(conversationId)) {
        if (!result.conversations[conversationId].archived && !result.conversations[conversationId].skipped) {
          setTimeout(() => {
            const focusedConversation = conversationList.querySelector(`#conversation-button-${conversationId}`);

            if (focusedConversation) {
              focusedConversation.scrollIntoView({ block: 'nearest' });
            }
          }, 500);
          loadConversation(conversationId);
          if (search) {
            window.history.replaceState({}, '', `${origin}${pathname}`);
            handleQueryParams(search);
          }
        } else {
          showNewChatPage();
        }
      } else { // } if (url === 'https://chat.openai.com/') {
        showNewChatPage();
      }
      // }
      if (!skipInputFormReload) addScrollButtons();
      if (!skipInputFormReload) initializePromptChain();
      if (!skipInputFormReload) overrideSubmitForm();
      if (!skipInputFormReload) setBackButtonDetection();
    }
  });
}
