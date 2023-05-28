/* global deleteConversation, deleteAllConversations, resetSelection, showNewChatPage, notSelectedClassList, emptyFolderElement */
function replaceDeleteConversationButton() {
  const nav = document.querySelector('nav');
  if (!nav) return;

  const deleteConversationsButton = document.createElement('a');
  deleteConversationsButton.classList = 'flex py-3 px-3 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-white cursor-pointer text-sm';
  // remove existing
  const existingDeleteConversationsButton = document.getElementById('delete-conversations-button');
  if (existingDeleteConversationsButton) existingDeleteConversationsButton.remove();
  const userMenu = nav.querySelector('#user-menu');
  userMenu.prepend(deleteConversationsButton);
  deleteConversationsButton.id = 'delete-conversations-button';
  chrome.storage.local.get(['selectedConversations'], (result) => {
    let { selectedConversations } = result;
    if (!selectedConversations) selectedConversations = [];
    deleteConversationsButton.innerHTML = `<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>Delete ${selectedConversations?.length === 0 ? 'All' : `${selectedConversations?.length} Selected`}`;
  });
  deleteConversationsButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    chrome.storage.sync.get(['conversationsOrder'], (syncResult) => {
      chrome.storage.local.get(['selectedConversations', 'conversations', 'conversationsAreSynced', 'settings'], (result) => {
        const { conversationsOrder } = syncResult;
        const {
          selectedConversations, conversations, conversationsAreSynced, settings,
        } = result;
        const trashFolder = conversationsOrder?.find((folder) => folder.id === 'trash');
        const visibleConversations = conversationsAreSynced && conversations && settings.autoSync ? Object.values(conversations).filter((conversation) => !conversation.archived && !conversation.skipped) : nav.querySelector('div').querySelector('div').querySelectorAll('a');

        if (e.target.textContent === 'Confirm Delete') {
          e.target.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>Delete All';
          e.target.style.removeProperty('background-color');
          e.target.style.color = 'white';
          e.target.style.borderColor = 'none';
          if (selectedConversations && selectedConversations?.length === 0) {
            deleteAllConversations().then((data) => {
              if (data.success) {
                // set archived = true for all conversations
                const newConversations = conversations
                  ? Object.keys(conversations).reduce(
                    (acc, key) => {
                      acc[key] = {
                        ...conversations[key],
                        archived: true,
                      };
                      return acc;
                    },
                    {},
                  ) : {};
                chrome.storage.local.set({
                  conversations: newConversations,
                  selectedConversations: [],
                  lastSelectedConversation: null,
                });
                // remove all children of conversationlist
                const conversationList = document.querySelector('#conversation-list');
                const conversationElements = Array.from(conversationList.querySelectorAll('[id^=conversation-button-]'));

                conversationElements.forEach((conversationElement) => {
                  conversationElement.querySelector('[id^=checkbox-wrapper-]')?.remove();
                  conversationElement.querySelector('[id^=actions-wrapper-]')?.remove();
                  conversationElement.classList = notSelectedClassList;
                  conversationElement.style.opacity = 0.7;
                  conversationElement.classList.remove('hover:pr-20');
                  const conversationElementIcon = conversationElement.querySelector('img');
                  conversationElementIcon.src = chrome.runtime.getURL('icons/trash.png');
                  // move conversation after archivedConversationsTitle
                  const trashFolderContent = document.querySelector('#folder-content-trash');
                  if (trashFolderContent) {
                    const emptyFolderElement = trashFolderContent.querySelector('#empty-folder-trash');
                    if (emptyFolderElement) emptyFolderElement.remove();
                    trashFolderContent.prepend(conversationElement);
                  }
                  // update conversationsOrder
                  const convId = conversationElement.id.split('conversation-button-')[1];
                  if (trashFolder && !trashFolder.conversationIds.includes(convId?.slice(0, 5))) {
                    trashFolder.conversationIds.unshift(convId?.slice(0, 5));
                  }
                });
                conversationList.querySelectorAll('[id^=wrapper-folder-]').forEach((folderElement) => {
                  if (folderElement.id !== 'wrapper-folder-trash') {
                    folderElement.remove();
                  }
                });
                // replace trashFolder with new trashFolder
                if (trashFolder) {
                  chrome.storage.sync.set({
                    conversationsOrder: [trashFolder],
                  });
                }
                showNewChatPage();
              }
            }, () => { });
          } else {
            const selectedConversationIds = selectedConversations.map((conversation) => conversation.id);
            const successfullyDeletedConvIds = [];
            // wait for all deleteConversation to be resolved
            const promises = [];

            for (let i = 0; i < selectedConversationIds.length; i += 1) {
              promises.push(deleteConversation(selectedConversationIds[i]).then((data) => {
                if (data.success) {
                  successfullyDeletedConvIds.push(selectedConversationIds[i]);
                  const conversationElement = document.querySelector(`#conversation-button-${selectedConversationIds[i]}`);
                  if (conversationElement && conversationElement.classList.contains('selected')) {
                    showNewChatPage();
                  }
                  conversationElement.querySelector('[id^=checkbox-wrapper-]')?.remove();
                  conversationElement.querySelector('[id^=actions-wrapper-]')?.remove();
                  conversationElement.classList = notSelectedClassList;
                  conversationElement.style.opacity = 0.7;
                  conversationElement.classList.remove('hover:pr-20');
                  const conversationElementIcon = conversationElement.querySelector('img');
                  conversationElementIcon.src = chrome.runtime.getURL('icons/trash.png');
                  const trashFolderContent = document.querySelector('#folder-content-trash');
                  if (trashFolderContent) {
                    const emptyFolderElement = trashFolderContent.querySelector('#empty-folder-trash');
                    if (emptyFolderElement) emptyFolderElement.remove();
                    // prepend conversation to trash folder
                    trashFolderContent.prepend(conversationElement);
                  }
                }
              }, () => { }));
            }
            resetSelection();
            // set archived = true for all selected conversations
            Promise.all(promises).then(() => {
              const newConversations = conversations
                ? Object.keys(conversations).reduce(
                  (acc, key) => {
                    if (successfullyDeletedConvIds.includes(key)) {
                      acc[key] = {
                        ...conversations[key],
                        archived: true,
                      };
                    } else {
                      acc[key] = {
                        ...conversations[key],
                      };
                    }
                    return acc;
                  },
                  {},
                )
                : {};
              const newValues = {
                conversations: newConversations,
                selectedConversations: [],
                lastSelectedConversation: null,
              };
              // update conversationsOrder
              for (let i = 0; i < successfullyDeletedConvIds.length; i += 1) {
                const convId = successfullyDeletedConvIds[i];
                let conversationOrderIndex = conversationsOrder.findIndex((id) => id === convId?.slice(0, 5));
                if (conversationOrderIndex !== -1) {
                  conversationsOrder.splice(conversationOrderIndex, 1);
                } else { // if not found, look into folders
                  const conversationFolder = conversationsOrder.find((f) => (f.id !== 'trash') && (f.conversationIds.includes(convId?.slice(0, 5))));
                  if (conversationFolder) {
                    conversationOrderIndex = conversationFolder.conversationIds.findIndex((id) => id === convId?.slice(0, 5));
                    conversationFolder.conversationIds.splice(conversationOrderIndex, 1);
                    // if folder is empty now, add empty folder element
                    if (conversationFolder.conversationIds.length === 0) {
                      const folderContent = document.querySelector(`#folder-content-${conversationFolder.id}`);
                      folderContent.appendChild(emptyFolderElement(conversationFolder.id));
                    }
                  }
                }
              }

              if (trashFolder) {
                trashFolder.conversationIds = [...successfullyDeletedConvIds.map((cid) => cid?.slice(0, 5)), ...trashFolder.conversationIds];
                // remove dupleicate conversationIds
                trashFolder.conversationIds = [...new Set(trashFolder.conversationIds)];
                const newConversationsOrder = conversationsOrder.map((folder) => {
                  if (folder.id === 'trash') {
                    return trashFolder;
                  }
                  return folder;
                });
                chrome.storage.sync.set({
                  conversationsOrder: newConversationsOrder,
                });
              }
              chrome.storage.local.set(newValues);
            });
          }
        } else if (visibleConversations.length > 0) {
          e.target.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>Confirm Delete';
          e.target.style.backgroundColor = '#864e6140';
          e.target.style.color = '#ff4a4a';
          setTimeout(() => {
            chrome.storage.local.get(['selectedConversations'], (res) => {
              const selectedConvs = res.selectedConversations;
              e.target.innerHTML = `<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>Delete ${selectedConvs.length === 0 ? 'All' : `${selectedConvs.length} Selected`}`;
              e.target.style.removeProperty('background-color');
              e.target.style.color = 'white';
            });
          }, 3000);
        }
      });
    });
  });
}
// eslint-disable-next-line no-unused-vars
function initializeReplaceDeleteConversationButton() {
  replaceDeleteConversationButton();
}
