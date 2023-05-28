/* eslint-disable no-restricted-globals */
// eslint-disable-next-line no-unused-vars
/* global markdown, markdownitSup, initializeNavbar, generateInstructions, generateChat, SSE, formatDate, loadConversation, resetSelection, katex, texmath, rowUser, rowAssistant, updateOrCreateConversation, replaceTextAreaElemet, highlight, isGenerating:true, disableTextInput:true, generateTitle, debounce, initializeRegenerateResponseButton, initializeStopGeneratingResponseButton, toggleTextAreaElemet, showNewChatPage, chatStreamIsClosed:true, addCopyCodeButtonsEventListeners, addScrollDetector, scrolUpDetected:true, Sortable, updateInputCounter, addUserPromptToHistory, getGPT4CounterMessageCapWindow, createFolder, getConversationElementClassList, notSelectedClassList, selectedClassList, conversationActions, addCheckboxToConversationElement, createConversation, deleteConversation, handleQueryParams, addScrollButtons, updateTotalCounter, isWindows, loadSharedConversation */

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
    const sortable = new Sortable(newConversationList, {
      group: {
        name: 'conversation-list',
        pull: true,
        // eslint-disable-next-line func-names, object-shorthand, no-unused-vars
        put: function (to, from, dragged) {
          return from.el.id !== 'folder-content-trash';
        },
      },
      draggable: '[id^="conversation-button-"], [id^="wrapper-folder-"]:not([id="wrapper-folder-trash"]',
      onEnd: (event) => {
        const {
          item, to, oldDraggableIndex, newDraggableIndex,
        } = event;
        const isFolder = item.id.startsWith('wrapper-folder-');
        const isToFolder = to.id.startsWith('folder-content-');

        const fromId = 'conversation-list';
        const toId = isToFolder ? to.id.split('folder-content-')[1]?.slice(0, 5) : 'conversation-list';
        if (oldDraggableIndex === newDraggableIndex && toId === fromId) return;

        if (!isFolder && isToFolder && toId === 'trash') {
          deleteConversationOnDragToTrash(item.id.split('conversation-button-')[1]);
        }
        chrome.storage.sync.get(['conversationsOrder'], (result) => {
          const { conversationsOrder } = result;
          const movingItem = conversationsOrder.splice(oldDraggableIndex, 1)[0];

          if (isToFolder) {
            const emptyFolder = document.querySelector(`#empty-folder-${toId}`);
            if (emptyFolder) emptyFolder.remove();
            const toFolderIndex = conversationsOrder.findIndex((c) => c.id === toId);
            const toFolder = conversationsOrder[toFolderIndex];
            toFolder.conversationIds.splice(newDraggableIndex, 0, movingItem);
            conversationsOrder.splice(toFolderIndex, 1, toFolder);
          } else {
            // eslint-disable-next-line no-lonely-if
            if (isFolder) {
              conversationsOrder.splice(newDraggableIndex, 0, movingItem);
            } else {
              conversationsOrder.splice(newDraggableIndex, 0, movingItem);
            }
          }
          chrome.storage.sync.set({ conversationsOrder });
        });
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
  chrome.storage.local.get(['conversations', 'settings'], (res) => {
    const existingSearchBoxWrapper = document.querySelector('#conversation-search-wrapper');
    if (existingSearchBoxWrapper) existingSearchBoxWrapper.remove();
    const visibleConvs = Object.values(res.conversations).filter((c) => !c.skipped);
    if (visibleConvs.length === 0) {
      return;
    }
    const conversationList = document.querySelector('#conversation-list');
    const searchboxWrapper = document.createElement('div');
    searchboxWrapper.id = 'conversation-search-wrapper';
    searchboxWrapper.classList = 'flex items-center justify-center';
    const searchbox = document.createElement('input');
    searchbox.type = 'search';
    searchbox.id = 'conversation-search';
    searchbox.tabIndex = 0;
    searchbox.placeholder = 'Search conversations';
    searchbox.classList = 'w-full px-4 py-2 mr-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-800 conversation-search';
    searchbox.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown') {
        // chatStreamIsClosed = true;
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
        // chatStreamIsClosed = true;
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
      // chatStreamIsClosed = true;
      const searchValue = event.target.value.toLowerCase();
      chrome.storage.sync.get(['conversationsOrder'], (syncResult) => {
        chrome.storage.local.get(['conversations'], (result) => {
          const { conversationsOrder } = syncResult;
          const { conversations } = result;
          // remove existing conversations
          const curConversationList = document.querySelector('#conversation-list');
          // remove conversations list childs other than the search box wrapper (first child)
          while (curConversationList.childNodes.length > 1) {
            curConversationList.removeChild(curConversationList.lastChild);
          }

          const allConversations = Object.values(conversations).filter((c) => !c.skipped);
          let filteredConversations = allConversations.sort((a, b) => b.create_time - a.create_time);

          resetSelection();
          if (searchValue) {
            filteredConversations = allConversations.filter((c) => (
              c.title?.toLowerCase()?.includes(searchValue.toLowerCase())
              || Object.values(c.mapping).map((m) => m?.message?.content?.parts?.join(' ')?.replace(/## Instructions[\s\S]*## End Instructions\n\n/, ''))
                .join(' ')?.toLowerCase()
                .includes(searchValue.toLowerCase())));
            const filteredConversationIds = filteredConversations.map((c) => c.id.slice(0, 5));
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
        chrome.storage.sync.remove('conversationsOrder');
        window.location.reload();
        return;
      }
      chrome.storage.sync.get(['conversationsOrder'], (syncResult) => {
        chrome.storage.local.get(['settings'], (result) => {
          const newFolder = {
            id: self.crypto.randomUUID().slice(0, 5), name: 'New Folder', conversationIds: [], isOpen: true,
          };
          const { conversationsOrder } = syncResult;
          const { settings } = result;
          chrome.storage.sync.set({ conversationsOrder: [newFolder, ...conversationsOrder] });
          const newFolderElement = createFolder(newFolder, settings.conversationTimestamp, [], true);
          const curConversationList = document.querySelector('#conversation-list');
          curConversationList.insertBefore(newFolderElement, searchboxWrapper.nextSibling);
          curConversationList.scrollTop = 0;
        });
      });
    });
    searchboxWrapper.append(newFolderButton);
    // add conversation search box to the top of the list
    searchboxWrapper.prepend(searchbox);
    conversationList.prepend(searchboxWrapper);
  });
}
// add new conversation to the top of the list
// eslint-disable-next-line no-unused-vars
function prependConversation(conversation) {
  const existingConversationElement = document.querySelector(`#conversation-button-${conversation.id}`);
  if (existingConversationElement) existingConversationElement.remove();
  const conversationList = document.querySelector('#conversation-list');
  const searchboxWrapper = document.querySelector('#conversation-search-wrapper');
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
  const timestamp = document.createElement('div');
  timestamp.id = 'timestamp';
  timestamp.style = 'font-size: 10px; color: lightslategray; position: absolute; bottom: 0px; left: 40px;';
  chrome.storage.local.get(['settings'], (result) => {
    const { settings } = result;
    const createTime = settings.conversationTimestamp
      ? new Date(conversation.mapping[conversation.current_node].message.create_time * 1000)
      : new Date(conversation.create_time * 1000);
    const conversationCreateTime = formatDate(new Date(createTime));

    timestamp.innerHTML = conversationCreateTime;
  });
  conversationElement.appendChild(timestamp);
  // action icons
  conversationElement.appendChild(conversationActions(conversation.id));

  // add checkbox
  addCheckboxToConversationElement(conversationElement, conversation);
  if (searchboxWrapper) {
    conversationList.insertBefore(conversationElement, searchboxWrapper.nextSibling);
  } else {
    conversationList.prepend(conversationElement);
  }
  chrome.storage.sync.get(['conversationsOrder'], (result) => {
    const { conversationsOrder } = result;
    chrome.storage.sync.set({ conversationsOrder: [conversation.id?.slice(0, 5), ...conversationsOrder] });
  });

  // after adding first conversation
  createSearchBox();
  // scroll to the top of the conversation list
  conversationList.scrollTop = 0;
}
// eslint-disable-next-line no-unused-vars
function generateTitleForConversation(conversationId, messageId) {
  setTimeout(() => {
    generateTitle(conversationId, messageId).then((data) => {
      const { title } = data;
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

      chrome.storage.local.get('conversations', (result) => {
        const { conversations } = result;
        conversations[conversationId].title = title;
        chrome.storage.local.set({ conversations });
      });
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
        const conv = Object.values(conversations).find((c) => c.id?.slice(0, 5) === conversation);
        if (!conv) continue;
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
    const main = document.querySelector('main');
    if (!main) return;
    const inputForm = main.querySelector('form');
    const textAreaElement = inputForm.querySelector('textarea');
    const nav = document.querySelector('nav');
    const newChatButton = nav?.querySelector('a');
    newChatButton.classList = 'flex py-3 px-3 items-center gap-3 transition-colors duration-200 text-white cursor-pointer text-sm rounded-md border border-white/20 hover:bg-gray-500/10 mb-1 flex-shrink-0';
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
        }
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
      });
      if (selectedConversations?.length > 0) {
        newChatButtonClone.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>Clear selection';
      } else {
        newChatButtonClone.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>New chat';
      }
    }
  });
}
function submitChat(userInput, conversation, messageId, parentId, settings, models, regenerateResponse = false) {
  scrolUpDetected = false;
  const curSubmitButton = document.querySelector('main').querySelector('form').querySelector('textarea ~ button');
  curSubmitButton.disabled = true;
  curSubmitButton.innerHTML = '<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"></circle> <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg>';
  const syncDiv = document.getElementById('sync-div');
  if (syncDiv) syncDiv.style.opacity = '0.3';
  if (!regenerateResponse) initializeRegenerateResponseButton();
  chatStreamIsClosed = false;
  const saveHistory = conversation?.id ? conversation.saveHistory : settings.saveHistory;
  generateChat(userInput, conversation?.id, messageId, parentId, saveHistory).then((chatStream) => {
    userChatIsActuallySaved = regenerateResponse;
    let userChatSavedLocally = regenerateResponse; // false by default unless regenerateResponse is true
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
        submitButton.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 mr-1" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>';
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
        const tempId = setInterval(() => {
          if (userChatIsActuallySaved) {
            clearInterval(tempId);
            updateOrCreateConversation(finalConversationId, finalMessage, messageId, settings, true, chatStreamIsClosed).then(() => {
              setTimeout(() => {
                insertNextChunk(settings, finalMessage);
              }, 700);
            });
          }
        }, 1000);
        isGenerating = false;
        chatStream.close();
        if (syncDiv) syncDiv.style.opacity = '1';
        toggleTextAreaElemet();
        initializeStopGeneratingResponseButton();
        initializeRegenerateResponseButton();
        updateTotalCounter();
      } else if (e.event === 'ping') {
        // console.error('PING RECEIVED', e);
      } else {
        try {
          isGenerating = true;
          if (finalMessage === '') {
            const pluginDropdownButton = document.querySelector('#navbar-plugins-dropdown-button');
            if (pluginDropdownButton) {
              pluginDropdownButton.disabled = true;
              pluginDropdownButton.style.opacity = 0.75;
              pluginDropdownButton.title = 'Changing plugins in the middle of the conversation is not allowed';
            }
            initializeStopGeneratingResponseButton();
            // update gpt4 counter
            chrome.storage.local.get(['gpt4Timestamps', 'settings', 'conversationLimit'], (result) => {
              const { gpt4Timestamps } = result;
              if (!result.settings.selectedModel.tags.includes('gpt4') && result.settings.selectedModel.slug !== 'gpt-4') return;
              const now = new Date().getTime();
              const gpt4CounterElement = document.querySelector('#gpt4-counter');
              gpt4CounterElement.style.display = result.settings.showGpt4Counter ? 'block' : 'none';
              const messageCap = result?.conversationLimit?.message_cap || 25;
              const messageCapWindow = result?.conversationLimit?.message_cap_window || 180;
              if (gpt4Timestamps) {
                gpt4Timestamps.push(now);
                const hoursAgo = now - (messageCapWindow / 60) * 60 * 60 * 1000;
                const gpt4TimestampsFiltered = gpt4Timestamps.filter((timestamp) => timestamp > hoursAgo);
                chrome.storage.local.set({ gpt4Timestamps: gpt4TimestampsFiltered, capExpiresAt: '' });
                if (gpt4CounterElement) {
                  gpt4CounterElement.innerText = `GPT4 requests (last ${getGPT4CounterMessageCapWindow(messageCapWindow)}): ${gpt4TimestampsFiltered.length}/${messageCap}`;
                }
              } else {
                chrome.storage.local.set({ gpt4Timestamps: [now] });
                if (gpt4CounterElement) {
                  gpt4CounterElement.innerText = `GPT4 requests (last ${getGPT4CounterMessageCapWindow(messageCapWindow)}): 1/${messageCap}`;
                }
              }
            });
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
              role: 'user',
              content: {
                content_type: 'text',
                parts: [userInput],
              },
              metadata: { model_slug: settings.selectedModel.slug },
            };

            // set forcerefresh=true when adding user chat, and set it to false when stream ends. This way if something goes wrong in between, the conversation will be refreshed later
            updateOrCreateConversation(finalConversationId, userMessage, parentId, settings, false, true);
            userChatSavedLocally = true;
          }
          if (!conversation?.id || userChatSavedLocally) {
            // save assistant chat locally
            finalMessage = message;
            if (!assistantChatSavedLocally && message.author.role === 'assistant' && message.recipient === 'all') {
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

          const existingRowAssistant = document.querySelector(`[id="message-wrapper-${message.id}"][data-role="assistant"]`);
          if (existingRowAssistant) {
            if (!scrolUpDetected) {
              document.querySelector('#conversation-bottom').scrollIntoView();
            }
            const existingRowAssistantTextWrapper = existingRowAssistant.querySelector(`#message-text-${message.id}`);
            const resultCounter = existingRowAssistant.querySelector(`#result-counter-${message.id}`);
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

            const messageContentPartsHTML = markdown('assistant')
              .use(markdownitSup)
              .use(texmath, {
                engine: katex,
                delimiters: 'dollars',
                katexOptions: { macros: { '\\RR': '\\mathbb{R}' } },
              }).render(messageContentParts);
            const wordCount = messageContentParts.split(/[ /]/).length;
            const charCount = messageContentParts.length;

            existingRowAssistantTextWrapper.innerHTML = `${messageContentPartsHTML}`;
            resultCounter.innerHTML = `${charCount} chars / ${wordCount} words`;
          } else {
            const lastMessageWrapper = [...document.querySelectorAll('[id^="message-wrapper-"]')].pop();
            if (lastMessageWrapper?.dataset?.role !== 'assistant') {
              const existingRowUser = document.querySelector(`[id="message-wrapper-${messageId}"][data-role="user"]`);
              if (existingRowUser) {
                let threadCount = Object.keys(conversation).length > 0 ? conversation?.mapping[messageId]?.children?.length || 1 : 1;
                if (regenerateResponse) threadCount += 1;
                const assistantRow = rowAssistant(conversation, data, threadCount, threadCount, models, settings.customConversationWidth, settings.conversationWidth);
                const conversationBottom = document.querySelector('#conversation-bottom');
                conversationBottom.insertAdjacentHTML('beforebegin', assistantRow);
                if (!scrolUpDetected) {
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
      submitButton.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 mr-1" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>';
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
        chrome.storage.local.set({ capExpiresAt: '' });
      }
      const conversationBottom = document.querySelector('#conversation-bottom');
      const errorMessageElement = `<div style="max-width:400px" class="py-2 px-3 my-2 border text-gray-600 rounded-md text-sm dark:text-gray-100 border-red-500 bg-red-500/10">${errorMessage}</div>`;
      conversationBottom.insertAdjacentHTML('beforebegin', errorMessageElement);
      conversationBottom.scrollIntoView({ behavior: 'smooth' });
    });
  });
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
  submitButton.click();
}
function insertNextChunk(settings, previousMessage) {
  if (settings.autoSummarize) {
    finalSummary = `${finalSummary}\n${previousMessage.content.parts.join('\n')}`;

    if (shouldSubmitFinalSummary) {
      submitFinalSummary();
      return;
    }
  }
  if (!settings.autoSplit) return;
  if (totalChunks === 1) return;
  if (remainingText === '') return;

  const inputForm = document.querySelector('form');
  if (!inputForm) return;
  const submitButton = inputForm.querySelector('textarea ~ button');
  if (!submitButton) return;
  const textAreaElement = inputForm.querySelector('textarea');
  if (!textAreaElement) return;
  const lastNewLineIndexBeforeLimit = settings.autoSplitLimit > remainingText.length ? settings.autoSplitLimit : getLastIndexOf(remainingText, settings.autoSplitLimit);

  textAreaElement.value = `[START CHUNK ${chunkNumber}/${totalChunks}]
${remainingText.slice(0, lastNewLineIndexBeforeLimit)}
[END CHUNK ${chunkNumber}/${totalChunks}]
${settings.autoSplitChunkPrompt}`;
  textAreaElement.focus();
  textAreaElement.dispatchEvent(new Event('input', { bubbles: true }));
  textAreaElement.dispatchEvent(new Event('change', { bubbles: true }));
  submitButton.click();
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
    const { pathname } = new URL(window.location.toString());
    // const isSharedConversation = pathname.startsWith('/share/') && window.location.href.endsWith('/continue');
    const conversationId = pathname.split('/').pop().replace(/[^a-z0-9-]/gi, '');
    const anyUserMessageWrappers = document.querySelectorAll('[id^="message-wrapper-"][data-role="user"]').length > 0;
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(conversationId) && anyUserMessageWrappers) {
      chrome.storage.local.get(['conversations', 'settings', 'models']).then((res) => {
        const { conversations, settings, models } = res;
        const conversation = conversations[conversationId];
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
          const node = { message: { id: messageId, content: { parts: [text] } } };
          const userRow = rowUser(conversation, node, 1, 1, result.name, result.avatar, settings.customConversationWidth, settings.conversationWidth);
          conversationBottom.insertAdjacentHTML('beforebegin', userRow);
          conversationBottom.scrollIntoView({ behavior: 'smooth' });
          if (text) {
            isGenerating = true;
            submitChat(text, conversation, messageId, parentId, settings, models);
            textAreaElement.value = '';
            updateInputCounter('');
          }
        });
      });
    } else {
      chrome.storage.local.get(['settings', 'models']).then((res) => {
        const { settings, models } = res;
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
          const node = { message: { id: messageId, content: { parts: [text] } } };
          const allMessages = document.querySelectorAll('[id^="message-wrapper-"]');
          const lastMessage = allMessages[allMessages.length - 1];
          const parentId = lastMessage?.id?.split('message-wrapper-')[1] || self.crypto.randomUUID();
          // remove main first child
          const contentWrapper = main.querySelector('.flex-1.overflow-hidden');
          main.removeChild(contentWrapper);

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
          const topDiv = '<div id="conversation-top" class="w-full flex items-center justify-center border-b border-black/10 dark:border-gray-900/50 text-gray-800 dark:text-gray-100 group bg-gray-50 dark:bg-[#444654]" style="min-height:56px;z-index:1;">New chat</div>';
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
          main.prepend(outerDiv);
          if (text) {
            isGenerating = true;
            submitChat(text, {}, messageId, parentId, settings, models);
            textAreaElement.value = '';
            updateInputCounter('');
          }
        });
      });
    }
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
    const textAreaElement = inputForm.querySelector('textarea');
    if (isGenerating) return;
    if (textAreaElement.value.trim().length === 0) return;
    textAreaElement.style.height = '24px';
    addUserPromptToHistory(textAreaElement.value.trim());
    inputForm.dispatchEvent(new Event('submit', { cancelable: true }));
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
  chrome.storage.sync.get(['conversationsOrder'], (res) => {
    chrome.storage.local.get(['conversations', 'conversationsAreSynced', 'settings'], (result) => {
      if (result.conversationsAreSynced && typeof result.conversations !== 'undefined') {
        updateNewChatButtonSynced();
        if (!skipInputFormReload) initializeNavbar();
        if (!skipInputFormReload) replaceTextAreaElemet(result.settings);
        removeOriginalConversationList();
        createSearchBox();
        loadStorageConversations(result.conversations, res.conversationsOrder);
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
        if (!skipInputFormReload) overrideSubmitForm();
        if (!skipInputFormReload) setBackButtonDetection();
      }
    });
  });
}
