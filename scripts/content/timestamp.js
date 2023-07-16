/* global getAllConversations, formatDate, shiftKeyPressed: true */
function showAllCheckboxes() {
  const nav = document.querySelector('nav');
  if (!nav) return;
  const navGap = document.querySelector('nav > :nth-child(3)');
  const conversationList = navGap.querySelector('div');
  const chatButtons = conversationList.querySelectorAll('a');
  chatButtons.forEach((button) => {
    const checkbox = button.querySelector('#checkbox');
    if (!checkbox) return;
    const checkboxWrapper = checkbox.parentNode;
    checkboxWrapper.style.width = '100%';
    checkboxWrapper.style.display = 'block';
  });
}
function hideAllButLastCheckboxes(lastCheckboxId) {
  const nav = document.querySelector('nav');
  if (!nav) return;
  const navGap = document.querySelector('nav > :nth-child(3)');
  const conversationList = navGap.querySelector('div');
  const chatButtons = conversationList.querySelectorAll('a');
  chatButtons.forEach((button) => {
    const checkbox = button.querySelector('#checkbox');
    if (!checkbox) return;
    checkbox.checked = false;
    const checkboxWrapper = checkbox.parentNode;
    checkboxWrapper.style.width = '40px';
    if (button.id !== `conversation-button-${lastCheckboxId}`) {
      checkboxWrapper.style.display = 'none';
    }
  });
}
// eslint-disable-next-line no-unused-vars
function resetSelection() {
  const nav = document.querySelector('nav');
  if (!nav) return;
  const newChatButton = nav?.querySelector('a');
  if (newChatButton.textContent.toLocaleLowerCase() !== 'new chat') {
    newChatButton.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>New chat';
    const exportAllButton = document.querySelector('#export-all-button');
    const deleteConversationButton = document.querySelector('#delete-conversations-button');
    chrome.storage.local.get(['selectedConversations'], (result) => {
      const { selectedConversations } = result;
      exportAllButton.innerHTML = exportAllButton.innerHTML.replace(`Export ${selectedConversations.length} Selected`, 'Export All');
      deleteConversationButton.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>Delete All';
      chrome.storage.local.set({ selectedConversations: [], lastSelectedConversation: null });
    });
  }

  const navGap = document.querySelector('nav > :nth-child(3)');
  const conversationList = navGap.querySelector('div');
  const chatButtons = conversationList.querySelectorAll('a');
  chatButtons.forEach((button) => {
    const checkbox = button.querySelector('#checkbox');
    if (!checkbox) return;
    checkbox.checked = false;
    const checkboxWrapper = checkbox.parentNode;
    checkboxWrapper.style.width = '40px';
    checkboxWrapper.style.display = 'none';
  });
}
function updateTimestamp(conversationList) {
  if (!conversationList) return;
  const chatButtons = conversationList.querySelectorAll('a');
  chrome.storage.local.get(['selectedConversations'], (result) => {
    const selectedConvs = result.selectedConversations;
    getAllConversations().then((conversations) => {
      if (Object.keys(conversations).length === 0) return;
      chatButtons.forEach((button, index) => {
        const existingTimestamp = button.querySelector('#timestamp');
        if (!existingTimestamp) {
          // button first div child
          const chatTitle = button.querySelector('div');
          if (chatTitle) {
            chatTitle.style = `${chatTitle?.style?.cssText} position: relative; bottom: 5px;`;
          }
          const timestamp = document.createElement('div');
          timestamp.id = 'timestamp';
          timestamp.style = 'font-size: 10px; color: lightslategray; position: absolute; bottom: 0px; left: 40px;';
          const conversation = conversations[index];
          button.id = `conversation-button-${conversation.id}`;
          const updateTime = conversation.update_time;
          // convert create time from GMT to local time
          timestamp.innerHTML = formatDate(new Date(updateTime));
          button.appendChild(timestamp);
          // add checkbox
          const checkboxWrapper = document.createElement('div');
          checkboxWrapper.style = 'position: absolute; top: 0px; left: 0px; z-index:10; display:none;cursor: pointer;width:40px;height: 100%;';
          checkboxWrapper.id = `checkbox-wrapper-${conversation.id}`;
          checkboxWrapper.addEventListener('click', (event) => {
            event.stopPropagation();
            const checkbox = button.querySelector('#checkbox');
            if (!checkbox) return;
            if (event.shiftKey) {
              shiftKeyPressed = true;
            }
            checkbox.click();
          });
          button.appendChild(checkboxWrapper);

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
            chrome.storage.local.get(['lastSelectedConversation', 'selectedConversations'], (res) => {
              const { lastSelectedConversation, selectedConversations } = res;
              if (!event.target.checked) {
                const newSelectedConversations = selectedConversations.filter((conv) => conv.id !== conversation.id);
                chrome.storage.local.set({ selectedConversations: newSelectedConversations }, () => {
                  if (newSelectedConversations.length === 0) {
                    hideAllButLastCheckboxes(conversation.id);
                  }
                  updateButtonsAfterSelection(selectedConversations, newSelectedConversations);
                });
              }
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
              if (event.target.checked && (event.shiftKey || shiftKeyPressed) && selectedConversations.length > 0) {
                shiftKeyPressed = false;
                const newSelectedConversations = [...selectedConversations, conversation];
                const conversationsOrder = Array.from(conversationList.querySelectorAll('[id^=checkbox-wrapper-]')).map((c) => c.id.split('checkbox-wrapper-')[1]?.slice(0, 5));

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
                    const conversationsToSelect = conversationsOrder.slice(Math.min(lastConversationIndex, newConversationIndex) + 1, Math.max(lastConversationIndex, newConversationIndex)).filter((f) => typeof f === 'string');

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
              }
            });
          });
          // const svg = button.querySelector('svg');
          // if (svg) {
          //   button.insertBefore(checkbox, svg);
          // }
          button.addEventListener('mouseenter', () => {
            checkboxWrapper.style.display = 'block';
          });
          button.addEventListener('mouseleave', () => {
            chrome.storage.local.get(['selectedConversations'], (res) => {
              const { selectedConversations } = res;
              if (selectedConversations.length === 0) {
                checkboxWrapper.style.display = 'none';
              }
            });
          });
        }
      });
    }, () => {
      // console.error(error);
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
function addTimestamp() {
  const nav = document.querySelector('nav');
  if (!nav) return;
  const navGap = document.querySelector('nav > :nth-child(3)');
  const conversationList = navGap.querySelector('div');
  updateTimestamp(conversationList);
  const observer = new MutationObserver(() => {
    updateTimestamp(conversationList);
  });
  observer.observe(conversationList, { childList: true });
}
// eslint-disable-next-line no-unused-vars
function initializeTimestamp() {
  chrome.storage.local.get(['selectedConversations'], (result) => {
    const nav = document.querySelector('nav');
    const newChatButton = nav?.querySelector('a');
    if (newChatButton && result.selectedConversations?.length > 0) {
      newChatButton.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>Clear selection';
    } else {
      newChatButton.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>New chat';
    }
  });
  addTimestamp();
}
