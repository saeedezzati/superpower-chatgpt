/* eslint-disable no-unused-vars */
/* eslint-disable no-restricted-globals */
/* global formatDate, showAllCheckboxes, hideAllButLastCheckboxes, deleteConversation, renameConversation, loadConversation, highlight, showNewChatPage, createSearchBox, emptyFolderElement, shiftKeyPressed:true, isWindows, createShare, shareModal, addShareModalEventListener */

const notSelectedClassList = 'flex py-3 px-3 pr-3 w-full items-center gap-3 relative rounded-md hover:bg-[#2A2B32] cursor-pointer break-all hover:pr-20 group';
const selectedClassList = 'flex py-3 px-3 pr-3 w-full items-center gap-3 relative rounded-md cursor-pointer break-all hover:pr-20 bg-gray-800 hover:bg-gray-800 group selected border-l border-gold';

function getConversationElementClassList(conversation) {
  const { pathname } = new URL(window.location.toString());
  const conversationId = pathname.split('/').pop().replace(/[^a-z0-9-]/gi, '');
  return conversationId === conversation.id ? selectedClassList : notSelectedClassList;
}
function createConversation(conversation, conversationTimestamp = false, searchValue = '') {
  const conversationElement = document.createElement('a');
  // conversationElement.href = 'javascript:';
  conversationElement.id = `conversation-button-${conversation.id}`;

  conversationElement.classList = getConversationElementClassList(conversation);
  if (conversation.archived) {
    conversationElement.style.opacity = 0.7;
    conversationElement.classList.remove('hover:pr-20');
  }
  // eslint-disable-next-line no-loop-func
  conversationElement.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const { pathname } = new URL(window.location.toString());
    const conversationId = pathname.split('/').pop().replace(/[^a-z0-9-]/gi, '');
    if (e.metaKey || (isWindows() && e.ctrlKey)) {
      window.open(`https://chat.openai.com/c/${conversation.id}`, '_blank');
      return;
    }
    if (searchValue || conversationId !== conversation.id) {
      window.history.pushState({}, '', `https://chat.openai.com/c/${conversation.id}`);
      // set conversations with class selected to not selected
      const focusedConversations = document.querySelectorAll('.selected');
      focusedConversations.forEach((c) => {
        c.classList = notSelectedClassList;
        c.style.backgroundColor = '';
      });
      // set selected conversation
      conversationElement.classList = selectedClassList;
      if (conversation.archived) {
        conversationElement.classList.remove('hover:pr-20');
      }
      loadConversation(conversation.id, searchValue);
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
  conversationTitle.innerHTML = highlight(conversation.title, searchValue);
  conversationElement.title = conversation.title;
  conversationElement.appendChild(conversationTitle);
  // add timestamp
  const timestampElement = document.createElement('div');
  timestampElement.id = 'timestamp';
  timestampElement.style = 'font-size: 10px; color: lightslategray; position: absolute; bottom: 0px; left: 40px;';

  const timestamp = conversationTimestamp
    ? new Date(conversation.update_time * 1000)
    : new Date(conversation.create_time * 1000);
  const conversationLastTimestamp = formatDate(new Date(timestamp));

  timestampElement.innerHTML = conversationLastTimestamp;

  conversationElement.appendChild(timestampElement);
  // action icons
  if (!conversation.archived) {
    conversationElement.appendChild(conversationActions(conversation.id));
    // add checkbox
    addCheckboxToConversationElement(conversationElement, conversation);
  }
  return conversationElement;
}
function conversationActions(conversationId) {
  const actionsWrapper = document.createElement('div');
  actionsWrapper.id = `actions-wrapper-${conversationId}`;
  actionsWrapper.classList = 'absolute flex right-1 z-10 text-gray-300 invisible group-hover:visible';
  const editConversationNameButton = document.createElement('button');
  editConversationNameButton.title = 'Rename conversation';
  editConversationNameButton.classList = 'p-1 hover:text-white';
  editConversationNameButton.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>';
  editConversationNameButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    chrome.storage.local.get(['conversations'], (result) => {
      const { conversations } = result;
      const textInput = document.createElement('input');
      const conversationTitle = document.querySelector(`#conversation-title-${conversationId}`);
      textInput.id = `conversation-rename-${conversationId}`;
      textInput.classList = 'border-0 bg-transparent p-0 focus:ring-0 focus-visible:ring-0';
      textInput.style = 'position: relative; bottom: 5px;max-width:140px;';
      textInput.value = conversations[conversationId].title;
      conversationTitle.parentElement.replaceChild(textInput, conversationTitle);
      textInput.focus();
      textInput.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        textInput.focus();
      });
      // replace action buttons with save and cancel buttons
      actionsWrapper.replaceWith(confirmActions(conversations[conversationId], 'edit'));
    });
  });

  const shareConversationButton = document.createElement('button');
  shareConversationButton.style.display = 'none';
  shareConversationButton.id = `share-conversation-${conversationId}`;
  shareConversationButton.title = 'Share conversation';
  shareConversationButton.classList = 'p-1 hover:text-white';
  shareConversationButton.innerHTML = '<button type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="radix-:r5k:" data-state="closed" class="p-1 hover:text-white"><svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg></button>';
  shareConversationButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    // disable all share buttons
    const shareButtons = document.querySelectorAll('[id^="share-conversation-"]');
    shareButtons.forEach((button) => {
      button.disabled = true;
    });
    shareConversationButton.innerHTML = '<button type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="radix-:r5k:" data-state="closed" class="p-1 hover:text-white"><svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"></circle> <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg></button>';

    // make API call
    chrome.storage.sync.get(['name'], (syncResult) => {
      chrome.storage.local.get(['conversations'], (result) => {
        const { conversations } = result;
        const currentNodeId = conversations[conversationId].current_node;
        createShare(conversationId, currentNodeId).then((res) => {
          const curShareButtons = document.querySelectorAll('[id^="share-conversation-"]');
          curShareButtons.forEach((button) => {
            button.disabled = false;
          });
          shareConversationButton.innerHTML = '<button type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="radix-:r5k:" data-state="closed" class="p-1 hover:text-white"><svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg></button>';
          const shareModalWrapper = document.createElement('div');
          shareModalWrapper.id = 'share-modal-wrapper';
          shareModalWrapper.classList = 'absolute inset-0 z-10';
          shareModalWrapper.innerHTML = shareModal(conversations[conversationId], res, syncResult.name);
          document.body.appendChild(shareModalWrapper);
          addShareModalEventListener(res, syncResult.name);
        });
      });
    });
  });

  const deleteConversationButton = document.createElement('button');
  deleteConversationButton.classList = 'p-1 hover:text-white';
  deleteConversationButton.title = 'Delete conversation';
  deleteConversationButton.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>';
  deleteConversationButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    chrome.storage.local.get(['conversations'], (result) => {
      const { conversations } = result;
      actionsWrapper.replaceWith(confirmActions(conversations[conversationId], 'delete'));
    });
    // remove all other visible cancel buttons
    // get all cancel buttons with last part of id not equal to this conversation id and click on them
    const cancelButtons = document.querySelectorAll(`button[id^="cancel-"]:not(#cancel-${conversationId})`);
    cancelButtons.forEach((button) => {
      button.click();
    });
  });
  chrome.storage.local.get(['account'], (result) => {
    const features = result.account?.features || [];
    if (features.includes('shareable_links')) {
      shareConversationButton.style.display = 'block';
    }
  });
  actionsWrapper.appendChild(editConversationNameButton);
  actionsWrapper.appendChild(shareConversationButton);
  actionsWrapper.appendChild(deleteConversationButton);
  return actionsWrapper;
}
function confirmActions(conversation, action) {
  let skipBlur = false;
  const conversationElement = document.querySelector(`#conversation-button-${conversation.id}`);
  conversationElement.classList.replace('pr-3', 'pr-14');
  const actionsWrapper = document.createElement('div');
  actionsWrapper.id = `actions-wrapper-${conversation.id}`;
  actionsWrapper.classList = 'absolute flex right-1 z-10 text-gray-300';
  const confirmButton = document.createElement('button');
  confirmButton.id = `confirm-${conversation.id}`;
  confirmButton.classList = 'p-1 hover:text-white';
  confirmButton.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="20 6 9 17 4 12"></polyline></svg>';
  confirmButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (action === 'edit') {
      const textInput = document.querySelector(`#conversation-rename-${conversation.id}`);
      const conversationTitle = document.createElement('div');
      const newValue = textInput.value || conversation.title;
      conversationTitle.id = `conversation-title-${conversation.id}`;
      conversationTitle.classList = 'flex-1 text-ellipsis max-h-5 overflow-hidden break-all relative';
      conversationTitle.style = 'position: relative; bottom: 5px;';
      conversationTitle.innerText = newValue;
      textInput.parentElement.replaceChild(conversationTitle, textInput);
      actionsWrapper.replaceWith(conversationActions(conversation.id));
      skipBlur = false;

      renameConversation(conversation.id, newValue);
      syncLocalConversation(conversation.id, 'title', newValue);
    } else if (action === 'delete') {
      deleteConversation(conversation.id).then((data) => {
        if (data.success) {
          syncLocalConversation(conversation.id, 'archived', true);
          chrome.storage.sync.get(['conversationsOrder'], (res) => {
            const { conversationsOrder } = res;
            const trashFolder = conversationsOrder.find((folder) => folder.id === 'trash');

            actionsWrapper.remove();
            conversationElement.querySelector('[id^=checkbox-wrapper-]').remove();
            if (conversationElement.classList.contains('selected')) {
              showNewChatPage();
            }
            conversationElement.classList = notSelectedClassList;
            conversationElement.style.opacity = 0.7;
            conversationElement.classList.remove('hover:pr-20');
            // replace bubble icon with trash
            const conversationElementIcon = conversationElement.querySelector('img');
            conversationElementIcon.src = chrome.runtime.getURL('icons/trash.png');
            // move conversation to trash
            const trashFolderContent = document.querySelector('#folder-content-trash');
            if (trashFolderContent) {
              const emptyFolderElement = trashFolderContent.querySelector('#empty-folder-trash');
              if (emptyFolderElement) emptyFolderElement.remove();
              // prepend conversation to trash folder
              trashFolderContent.prepend(conversationElement);
            }

            // remove conversationId from conversationsOrder
            let conversationOrderIndex = conversationsOrder.findIndex((id) => id === conversation.id?.slice(0, 5));
            if (conversationOrderIndex !== -1) {
              conversationsOrder.splice(conversationOrderIndex, 1);
            } else { // if not found, look into folders
              const conersationFolder = conversationsOrder.find((f) => (f.id !== 'trash') && (f.conversationIds.includes(conversation.id?.slice(0, 5))));
              if (conersationFolder) {
                conversationOrderIndex = conersationFolder.conversationIds.findIndex((id) => id === conversation.id?.slice(0, 5));
                conersationFolder.conversationIds.splice(conversationOrderIndex, 1);
                // if folder is empty now, add empty folder element
                if (conersationFolder.conversationIds.length === 0) {
                  const folderContent = document.querySelector(`#folder-content-${conersationFolder.id}`);
                  folderContent.appendChild(emptyFolderElement(conersationFolder.id));
                }
              }
            }
            // update trash folder
            if (!trashFolder.conversationIds.includes(conversation.id?.slice(0, 5))) {
              conversationsOrder.find((folder) => folder.id === 'trash').conversationIds.unshift(conversation.id?.slice(0, 5));
            }
            // update conversationsOrder
            chrome.storage.sync.set({
              conversationsOrder,
            });
          });
        }
      }, () => { });
    }
    conversationElement.classList.replace('pr-14', 'pr-3');
  });
  const cancelButton = document.createElement('button');
  cancelButton.id = `cancel-${conversation.id}`;
  cancelButton.classList = 'p-1 hover:text-white';
  cancelButton.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
  cancelButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (action === 'edit') {
      const textInput = document.querySelector(`#conversation-rename-${conversation.id}`);
      const conversationTitle = document.createElement('div');
      conversationTitle.id = `conversation-title-${conversation.id}`;
      conversationTitle.classList = 'flex-1 text-ellipsis max-h-5 overflow-hidden break-all relative';
      conversationTitle.style = 'position: relative; bottom: 5px;';
      conversationTitle.innerText = conversation.title;
      textInput.parentElement.replaceChild(conversationTitle, textInput);
    }
    actionsWrapper.replaceWith(conversationActions(conversation.id));
    conversationElement.classList.replace('pr-14', 'pr-3');
  });
  actionsWrapper.appendChild(confirmButton);
  actionsWrapper.appendChild(cancelButton);
  const textInput = document.querySelector(`#conversation-rename-${conversation.id}`);
  if (textInput) {
    textInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.which === 13) {
        skipBlur = true;
        confirmButton.click();
      } else if (e.key === 'Escape') {
        cancelButton.click();
      }
      conversationElement.classList.replace('pr-14', 'pr-3');
    });
    textInput.addEventListener('blur', (e) => {
      if (skipBlur) return;
      if (e.relatedTarget?.id === `confirm-${conversation.id}`) return;
      cancelButton.click();
      conversationElement.classList.replace('pr-14', 'pr-3');
    });
  }
  return actionsWrapper;
}

function addCheckboxToConversationElement(conversationElement, conversation) {
  chrome.storage.local.get(['selectedConversations'], (result) => {
    const selectedConvs = result.selectedConversations;
    const checkboxWrapper = document.createElement('div');
    checkboxWrapper.style = 'position: absolute; top: 0px; left: 0px; z-index:10; display:none;cursor: pointer;width:40px;height: 100%;border:none;border-radius:6px;';
    checkboxWrapper.id = `checkbox-wrapper-${conversation.id}`;
    checkboxWrapper.addEventListener('click', (event) => {
      event.stopPropagation();
      const checkbox = conversationElement.querySelector('#checkbox');
      if (!checkbox) return;
      if (event.shiftKey) {
        shiftKeyPressed = true;
      }
      checkbox.click();
    });
    conversationElement.appendChild(checkboxWrapper);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'checkbox';
    checkbox.style = 'position: absolute; top: 12px; left: 12px; z-index:11; cursor: pointer;';
    checkbox.checked = false;
    checkboxWrapper.appendChild(checkbox);
    if (selectedConvs?.length > 0) {
      checkboxWrapper.style.display = 'block';
      checkboxWrapper.style.width = '100%';
      if (selectedConvs.map((c) => c.id).includes(conversation.id)) {
        checkbox.checked = true;
      }
    }

    checkbox.addEventListener('click', (event) => {
      event.stopPropagation();
      chrome.storage.local.get(['lastSelectedConversation', 'conversations', 'selectedConversations'], (res) => {
        const { lastSelectedConversation, selectedConversations, conversations } = res;
        // uncheck
        if (!event.target.checked) {
          const newSelectedConversations = selectedConversations.filter((conv) => conv.id !== conversation.id);
          chrome.storage.local.set({ selectedConversations: newSelectedConversations }, () => {
            if (newSelectedConversations.length === 0) {
              hideAllButLastCheckboxes(conversation.id);
            }
            updateButtonsAfterSelection(selectedConversations, newSelectedConversations);
          });
        }
        // single check
        if (event.target.checked && ((!event.shiftKey && !shiftKeyPressed) || selectedConversations.length === 0)) {
          const newSelectedConversations = [...selectedConversations, conversation];

          chrome.storage.local.set({
            selectedConversations: newSelectedConversations,
            lastSelectedConversation: conversation,
          }, () => {
            if (newSelectedConversations.length === 1) {
              showAllCheckboxes();
            }
            updateButtonsAfterSelection(selectedConversations, newSelectedConversations);
          });
        }
        // shift check
        if (event.target.checked && (event.shiftKey || shiftKeyPressed) && selectedConversations.length > 0) {
          shiftKeyPressed = false;
          const newSelectedConversations = [...selectedConversations, conversation];

          chrome.storage.sync.get(['conversationsOrder'], (syncResult) => {
            const { conversationsOrder } = syncResult;
            if (lastSelectedConversation) {
              // find last conversation index in conversationsOrder
              let lastConversationIndex = conversationsOrder.findIndex((c) => c === lastSelectedConversation.id?.slice(0, 5));
              let newConversationIndex = conversationsOrder.findIndex((c) => c === conversation.id?.slice(0, 5));

              if (lastConversationIndex === -1 || newConversationIndex === -1) {
                const folderConatainingLastConversation = conversationsOrder.find((f) => f.conversationIds?.find((cid) => cid === lastSelectedConversation.id?.slice(0, 5)));

                const folderConatainingNewConversation = conversationsOrder.find((f) => f.conversationIds?.find((cid) => cid === conversation.id?.slice(0, 5)));

                if (folderConatainingLastConversation?.id === folderConatainingNewConversation?.id) {
                  lastConversationIndex = folderConatainingLastConversation?.conversationIds?.findIndex((cid) => cid === lastSelectedConversation.id?.slice(0, 5));
                  newConversationIndex = folderConatainingNewConversation?.conversationIds?.findIndex((cid) => cid === conversation.id?.slice(0, 5));
                  const conversationsToSelect = folderConatainingLastConversation.conversationIds?.slice(Math.min(lastConversationIndex, newConversationIndex) + 1, Math.max(lastConversationIndex, newConversationIndex)).filter((f) => typeof f === 'string');

                  // click on the new conversation to select it
                  conversationsToSelect.forEach((cid) => {
                    const conv = Object.values(conversations).find((c) => c.id?.slice(0, 5) === cid);
                    if (!selectedConversations.map((c) => c.id).includes(conv.id)) {
                      newSelectedConversations.push(conv);
                    }
                    const convElement = document.querySelector(`#checkbox-wrapper-${conv.id}`);

                    if (convElement && !convElement.querySelector('#checkbox').checked) {
                      convElement.querySelector('#checkbox').checked = true;
                    }
                  });
                }
              } else {
                // select all conversations between the last selected and the current one
                const conversationsToSelect = conversationsOrder?.slice(Math.min(lastConversationIndex, newConversationIndex) + 1, Math.max(lastConversationIndex, newConversationIndex)).filter((f) => typeof f === 'string');

                // click on the new conversation to select it
                conversationsToSelect.forEach((cid) => {
                  const conv = Object.values(conversations).find((c) => c.id?.slice(0, 5) === cid);
                  if (!selectedConversations.map((c) => c.id).includes(conv.id)) {
                    newSelectedConversations.push(conv);
                  }
                  const convElement = document.querySelector(`#checkbox-wrapper-${conv.id}`);

                  if (convElement && !convElement.querySelector('#checkbox').checked) {
                    convElement.querySelector('#checkbox').checked = true;
                  }
                });
              }
              chrome.storage.local.set({ selectedConversations: newSelectedConversations });
              updateButtonsAfterSelection(selectedConversations, newSelectedConversations);
            }
            chrome.storage.local.set({ lastSelectedConversation: conversation });
          });
        }
      });
    });

    conversationElement.addEventListener('mouseenter', () => {
      checkboxWrapper.style.display = 'block';
    });
    conversationElement.addEventListener('mouseleave', () => {
      chrome.storage.local.get(['selectedConversations'], (res) => {
        const { selectedConversations } = res;
        if (selectedConversations.length === 0) {
          checkboxWrapper.style.display = 'none';
        }
      });
    });
  });
}
function updateButtonsAfterSelection(previousSelectedConversations, newSelectedConversations) {
  const previousText = previousSelectedConversations.length === 0 ? 'All' : `${previousSelectedConversations.length} Selected`;
  const newText = newSelectedConversations.length === 0 ? 'All' : `${newSelectedConversations.length} Selected`;
  const nav = document.querySelector('nav');
  const newChatButton = nav?.querySelector('a');
  // chenge export all to export selected
  const exportAllButton = document.querySelector('#export-all-button');
  if (exportAllButton) {
    exportAllButton.innerHTML = exportAllButton.innerHTML.replace(`Export ${previousText}`, `Export ${newText}`);
  }
  const deleteConversationsButton = document.querySelector('#delete-conversations-button');
  if (deleteConversationsButton) {
    deleteConversationsButton.innerHTML = deleteConversationsButton.innerHTML.replace(`Delete ${previousText}`, `Delete ${newText}`);
  }
  if (newSelectedConversations.length > 0) {
    // show an x svg followed by clear selection
    newChatButton.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>Clear selection';
  } else {
    // show a plus svg followed by new chat
    newChatButton.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>New chat';
  }
}
function syncLocalConversation(conversationId, key, value) {
  chrome.storage.local.get(['conversations'], (result) => {
    const { conversations } = result;
    conversations[conversationId][key] = value;
    chrome.storage.local.set({ conversations }, () => {
      if (key === 'archived' && value === true) {
        createSearchBox();
      }
    });
  });
}
