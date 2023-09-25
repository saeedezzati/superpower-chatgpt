/* eslint-disable no-unused-vars */
/* eslint-disable no-restricted-globals */
// eslint-disable-next-line no-unused-vars
/* global updateNewChatButtonNotSynced, getAllConversations, getConversation, loadConversationList, initializeCopyAndCounter, initializeAddToPromptLibrary, initializeTimestamp, addConversationsEventListeners, isGenerating, prependConversation, generateTitleForConversation, canSubmitPrompt, formatDate, userChatIsActuallySaved:true, addAsyncInputEvents, addSyncBanner, isWindows, toast, sortConversationsByTimestamp */
/* eslint-disable no-await-in-loop, */
let localConversations = {};
let autoSaveTimeoutId;
let initializeTimoutId;
let refreshTimeoutId;
function clearAllTimeouts() {
  clearTimeout(autoSaveTimeoutId);
  clearTimeout(refreshTimeoutId);
  // let id = window.setTimeout(() => {}, 0);
  // while (id) {
  //   window.clearTimeout(id);
  //   id -= 1;
  // }
}
async function autoSaveCountDownAsync(isPaid) {
  await new Promise((resolve) => {
    autoSaveTimeoutId = setTimeout(() => {
      resolve();
    }, isPaid ? 2000 : 2000);
  });
}
async function addConversationToStorage(conv) {
  await getConversation(conv.id).then((conversation) => {
    if (!conversation) return;
    if (!conversation.create_time) return;
    // Object.keys(conversation.mapping).forEach((key) => {
    //   if (localConversations[conv.id] && localConversations[conv.id]?.mapping[key] && localConversations[conv.id].mapping[key]?.pinned) {
    //     conversation.mapping[key].pinned = true;
    //   }
    // });
    localConversations[conv.id] = {
      id: conv.id,
      shouldRefresh: false,
      archived: false,
      saveHistory: true,
      skipped: false,
      ...conversation,
      update_time: new Date(conv.update_time).getTime() / 1000,
    };
    if (Object.keys(localConversations).length > 0) {
      // conversationOrder is being updated in the parent function. No needto update here
      chrome.storage.local.set({
        conversations: localConversations,
      });
    }
  }, (err) => {
    if (err.status === 500) {
      localConversations[conv.id] = {
        id: conv.id,
        shouldRefresh: false,
        archived: false,
        saveHistory: true,
        skipped: true,
        update_time: new Date(conv.update_time).getTime() / 1000,
      };
      if (Object.keys(localConversations).length > 0) {
        // conversationOrder is being updated in the parent function. No needto update here
        chrome.storage.local.set({
          conversations: localConversations,
        });
      }
    }
  });
}
async function updateConversationInStorage(conv) {
  await getConversation(conv.id).then((conversation) => {
    if (!conversation) return;
    // Object.keys(conversation.mapping).forEach((key) => {
    //   if (localConversations[conv.id].mapping[key] && localConversations[conv.id].mapping[key]?.pinned) {
    //     conversation.mapping[key].pinned = true;
    //   }
    // });
    localConversations[conv.id] = {
      ...localConversations[conv.id],
      ...conversation,
      shouldRefresh: false,
    };
    if (Object.keys(localConversations).length > 0) {
      chrome.storage.local.set({
        conversations: localConversations,
      });
    }
  }, () => {
    // if (err.status === 500) {
    // }
  });
}

function updateOrCreateConversation(conversationId, message, parentId, settings, generateTitle = false, forceRefresh = false, newSystemMessage = {}) {
  if (!message) return;
  // eslint-disable-next-line consistent-return
  return chrome.storage.local.get(['conversations', 'enabledPluginIds']).then((result) => {
    const existingConversation = result.conversations?.[conversationId];
    if (existingConversation) {
      existingConversation.languageCode = settings.selectedLanguage.code;
      existingConversation.toneCode = settings.selectedTone.code;
      existingConversation.writingStyleCode = settings.selectedWritingStyle.code;
      existingConversation.shouldRefresh = forceRefresh;
      existingConversation.current_node = message.id;
      existingConversation.update_time = 'force_copy';
      if (existingConversation.mapping[message.id]?.id) {
        existingConversation.mapping[message.id].message = message;
      } else {
        existingConversation.mapping[message.id] = {
          children: [], id: message.id, message, parent: parentId,
        };
      }
      if (parentId) {
        // eslint-disable-next-line prefer-destructuring
        const children = existingConversation.mapping[parentId]?.children;
        if (children && !children.includes(message.id)) {
          existingConversation.mapping[parentId].children.push(message.id);
        }
      }
      return chrome.storage.local.set(
        {
          conversations: {
            ...result.conversations,
            [conversationId]: existingConversation,
          },
        },
      ).then(
        () => {
          userChatIsActuallySaved = true;
          addConversationsEventListeners(existingConversation.id);
          const mapping = Object.values(existingConversation.mapping);
          if (generateTitle && existingConversation.title === 'New chat' && mapping.length < 5 && mapping.filter((m) => (m.message?.role === 'assistant' || m.message?.author?.role === 'assistant') && m.message.recipient === 'all').length === 1) { // only one assistant message
            if (settings.saveHistory) {
              const systemMessage = mapping.find((m) => m.message?.role === 'system' || m.message?.author?.role === 'system');
              generateTitleForConversation(existingConversation.id, message.id, systemMessage?.message?.metadata?.user_context_message_data);
            }
          } else if (settings.conversationTimestamp) { // === updated
            // move cnversationelemnt after searchbox
            const conversationElement = document.querySelector(`#conversation-button-${conversationId}`);
            const conversationCreateTime = formatDate(new Date());
            const conversationTimestampElement = conversationElement.querySelector('#timestamp');
            conversationTimestampElement.innerHTML = conversationCreateTime;
            const searchBoxWrapper = document.querySelector('#conversation-search-wrapper');
            let lastFolderAtTheTop = searchBoxWrapper;
            while (lastFolderAtTheTop.nextElementSibling.id.startsWith('wrapper-folder-') && lastFolderAtTheTop.nextElementSibling.id !== 'wrapper-folder-trash') {
              lastFolderAtTheTop = lastFolderAtTheTop.nextElementSibling;
            }
            if (conversationElement && searchBoxWrapper) {
              // update conversationsOrder
              chrome.storage.local.get(['conversationsOrder'], (res) => {
                const { conversationsOrder } = res;
                const conversationIndex = conversationsOrder.findIndex((conv) => conv === conversationId);
                if (conversationIndex !== -1) {
                  // this guarantees we only move if conversation is not in a folder
                  if (settings.keepFoldersAtTheTop) {
                    lastFolderAtTheTop.after(conversationElement);
                    // find the folder with id matching the wrapper-folder id
                    const lastFolderAtTheTopIndex = conversationsOrder.findIndex((conv) => conv.id === lastFolderAtTheTop.id.split('wrapper-folder-')[1]);
                    conversationsOrder.splice(conversationIndex, 1);
                    conversationsOrder.splice(lastFolderAtTheTopIndex, 0, conversationId);
                  } else {
                    searchBoxWrapper.after(conversationElement);
                    conversationsOrder.splice(conversationIndex, 1);
                    conversationsOrder.unshift(conversationId);
                  }
                  chrome.storage.local.set({
                    conversationsOrder,
                  });
                }
              });
            }
          }
        },
      );
    }
    const systemMessage = {
      id: newSystemMessage.id,
      message: { ...newSystemMessage },
      parent: parentId,
      children: [
        message.id,
      ],
    };
    const newConversation = {
      id: conversationId,
      shouldRefresh: false,
      archived: false,
      saveHistory: settings.saveHistory,
      languageCode: settings.selectedLanguage.code,
      toneCode: settings.selectedTone.code,
      writingStyleCode: settings.selectedWritingStyle.code,
      current_node: message.id,
      title: 'New chat',
      create_time: (new Date()).getTime() / 1000,
      update_time: 'force_copy',
      mapping: {
        [parentId]: {
          children: [systemMessage.id], id: parentId, message: null, parent: null,
        },
        [systemMessage.id]: systemMessage,
        [message.id]: {
          children: [], id: message.id, message, parent: systemMessage.id,
        },
      },
      moderation_results: [],
    };
    if (settings.selectedModel.slug.includes('plugins')) {
      newConversation.pluginIds = result.enabledPluginIds;
    }
    return chrome.storage.local.set({
      conversations: {
        ...result.conversations,
        [conversationId]: newConversation,
      },
    }).then(() => {
      userChatIsActuallySaved = true;
      addConversationsEventListeners(newConversation.id);
      prependConversation(newConversation);
    });
  });
}
function addProgressBar() {
  chrome.storage.local.get(['settings'], (result) => {
    const { settings } = result;
    const existingSyncDiv = document.getElementById('sync-div');
    if (existingSyncDiv) existingSyncDiv.remove();

    const nav = document.querySelector('nav');
    if (!nav) return;
    nav.style.position = 'relative';
    nav.style.overflow = 'hidden';
    const progressBar = document.createElement('div');
    progressBar.classList = 'absolute bottom-0 left-0 z-50 animate-pulse';
    progressBar.style = 'height:1px;width: 100%; background-color: #00aaff;margin:0;';
    progressBar.id = 'sync-progressbar';
    const progressLabel = document.createElement('div');
    progressLabel.classList = 'absolute bottom-1 right-1 z-50 text-xs text-gray-500';
    progressLabel.id = 'sync-progresslabel';
    progressLabel.innerText = `Syncing... (${settings.quickSync ? 'Quick' : 'Full'})`;

    const tooltip = document.createElement('div');
    tooltip.classList = 'flex z-50 text-xs rounded p-2';
    tooltip.style = 'position: absolute; width: 250px; border: solid 1px #8e8ea0; bottom: 20px; right: 4px; background-color: #343541; display:none; margin:0;';
    tooltip.id = 'sync-tooltip';
    tooltip.innerText = 'You conversations are being backed up in your computer for a faster experience! This can take a while.';
    progressLabel.addEventListener('mouseover', () => {
      tooltip.style.display = 'block';
    });
    progressLabel.addEventListener('mouseout', () => {
      tooltip.style.display = 'none';
    });
    const refreshButton = document.createElement('div');
    refreshButton.id = 'sync-refresh-button';
    refreshButton.classList = 'z-50 text-xs text-gray-500 w-3 h-3 m-0';
    refreshButton.style = 'position: absolute; bottom: 6px; left: 8px; cursor: pointer;';
    refreshButton.title = 'Syncing Conversations';
    refreshButton.innerHTML = '<svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#00aaff" d="M468.9 32.11c13.87 0 27.18 10.77 27.18 27.04v145.9c0 10.59-8.584 19.17-19.17 19.17h-145.7c-16.28 0-27.06-13.32-27.06-27.2c0-6.634 2.461-13.4 7.96-18.9l45.12-45.14c-28.22-23.14-63.85-36.64-101.3-36.64c-88.09 0-159.8 71.69-159.8 159.8S167.8 415.9 255.9 415.9c73.14 0 89.44-38.31 115.1-38.31c18.48 0 31.97 15.04 31.97 31.96c0 35.04-81.59 70.41-147 70.41c-123.4 0-223.9-100.5-223.9-223.9S132.6 32.44 256 32.44c54.6 0 106.2 20.39 146.4 55.26l47.6-47.63C455.5 34.57 462.3 32.11 468.9 32.11z"/></svg>';
    const syncDiv = document.createElement('div');
    syncDiv.classList = 'flex flex-1 flex-col';
    syncDiv.id = 'sync-div';
    syncDiv.style = 'max-height: 10px; opacity:1';
    syncDiv.appendChild(tooltip);
    syncDiv.appendChild(refreshButton);
    syncDiv.appendChild(progressLabel);
    syncDiv.appendChild(progressBar);
    nav.appendChild(syncDiv);
  });
}
function checkConversationAreSynced(localConvs, remoteConvs) {
  return Object.values(localConvs).filter((conv) => !conv.archived && (typeof conv.saveHistory === 'undefined' || conv.saveHistory)).length === remoteConvs.length;
}
// eslint-disable-next-line no-unused-vars
function refreshConversations(conversations) {
  const localConvIds = Object.keys(conversations);
  for (let i = 0; i < localConvIds.length; i += 1) {
    // delete conversation key(legacy)
    const localConv = conversations[localConvIds[i]];
    // update conversations if shouldRefresh is true
    if (localConv.shouldRefresh) {
      updateConversationInStorage(localConv);
    }
  }
}
function inSyncConversations(localConvs, remoteConvs) {
  return Object.keys(localConvs).filter(
    (id) => !localConvs[id].archived
      && !localConvs[id].shouldRefresh
      && (localConvs[id].current_node || localConvs[id].skipped)
      && remoteConvs.find((rc) => rc.id === id)?.update_time
      && ((localConvs[id].update_time === new Date(remoteConvs.find((rc) => rc.id === id).update_time).getTime() / 1000) || localConvs[id].skipped)
      && (typeof localConvs[id].saveHistory === 'undefined' || localConvs[id].saveHistory),
  );
}
// eslint-disable-next-line no-unused-vars
function initializeAutoSave(skipInputFormReload = false, forceRefreshIds = []) {
  clearTimeout(refreshTimeoutId);
  addProgressBar();
  clearAllTimeouts();
  localConversations = {};

  const forceRefresh = true;
  getAllConversations(forceRefresh).then((remoteConversations) => {
    if (remoteConversations.length > 500) {
      toast('Looks like you have over 500 conversation in your history. For best performance, please consider deleting some conversations to keep your history under 200 conversations!', 'warning', 10000);
    }
    chrome.storage.local.get(['conversationsOrder', 'conversations', 'account', 'settings'], (result) => {
      const { account, settings, conversationsOrder } = result;
      const isPaid = account?.accounts?.default?.entitlement?.has_active_subscription || false;
      if (result.conversations && Object.keys(result.conversations).length > 0) {
        localConversations = result.conversations;
      }
      let newConversationsOrder = conversationsOrder && (conversationsOrder?.findIndex((f) => f && f.id === 'trash') !== -1)
        ? conversationsOrder
        : [{
          id: 'trash',
          name: 'Trash',
          conversationIds: [],
          isOpen: false,
        }];
      chrome.storage.local.set({
        conversationsAreSynced: false,
      }, () => {
        // check if old conversations order include at least one id longer than 4 chars
        chrome.storage.local.set({
          conversationsOrder: newConversationsOrder,
        }, async () => {
          const remoteConvIds = remoteConversations.map((conv) => conv.id);
          const localConvIds = Object.keys(localConversations);
          const visibleAndNotSkippedLocalConvIds = Object.keys(localConversations).filter((id) => !localConversations[id].archived && !localConversations[id].skipped);
          const visibleAndRefreshedLocalConvIds = Object.keys(localConversations).filter((id) => !localConversations[id].archived && !localConversations[id].shouldRefresh);

          for (let i = 0; i < localConvIds.length; i += 1) {
            const remoteConv = remoteConversations.find((conv) => conv.id === localConvIds[i]) || localConversations[localConvIds[i]];
            localConversations[localConvIds[i]].title = remoteConv.title;
            // eslint-disable-next-line prefer-destructuring
            if (localConversations[localConvIds[i]].update_time === 'force_copy') {
              localConversations[localConvIds[i]].update_time = new Date(remoteConv.update_time).getTime() / 1000;
            }
            // delete conversation key(legacy)
            if ('conversation' in localConversations[localConvIds[i]]) {
              delete localConversations[localConvIds[i]].conversation;
            }
            if (typeof localConversations[localConvIds[i]].skipped === 'undefined') {
              localConversations[localConvIds[i]].skipped = false;
            }
            if (typeof localConversations[localConvIds[i]].languageCode === 'undefined') {
              localConversations[localConvIds[i]].languageCode = 'default';
            }
            if (typeof localConversations[localConvIds[i]].toneCode === 'undefined') {
              localConversations[localConvIds[i]].toneCode = 'default';
            }
            if (typeof localConversations[localConvIds[i]].writingStyleCode === 'undefined') {
              localConversations[localConvIds[i]].writingStyleCode = 'default';
            }
            if (typeof localConversations[localConvIds[i]].archived === 'undefined') {
              localConversations[localConvIds[i]].archived = false;
            }
            if (localConversations[localConvIds[i]].saveHistory === undefined) {
              localConversations[localConvIds[i]].saveHistory = true;
            }
            // archive deleted conversations
            if (localConversations[localConvIds[i]].id && localConversations[localConvIds[i]].saveHistory && !remoteConvIds.includes(localConversations[localConvIds[i]].id)) {
              localConversations[localConvIds[i]].archived = true;
              // check conversations
              if (newConversationsOrder.indexOf(localConversations[localConvIds[i]].id) !== -1) {
                newConversationsOrder.splice(newConversationsOrder.indexOf(localConversations[localConvIds[i]].id), 1);
              } else {
                // check folders
                // eslint-disable-next-line no-loop-func
                newConversationsOrder.forEach((folder) => {
                  if (typeof folder === 'object' && folder.id !== 'trash' && folder.conversationIds.indexOf(localConversations[localConvIds[i]].id) !== -1) {
                    folder.conversationIds.splice(folder.conversationIds.indexOf(localConversations[localConvIds[i]].id), 1);
                  }
                });
              }
              const trashFolder = newConversationsOrder.find((folder) => folder?.id === 'trash');

              // remove duplicate conversation from trash folder(to be safe)
              trashFolder.conversationIds = [...new Set(trashFolder.conversationIds)];
              // add conversation to the begining of trash folder
              if (!settings.quickSync && !trashFolder?.conversationIds.includes(localConversations[localConvIds[i]].id)) {
                newConversationsOrder.find((folder) => folder?.id === 'trash')?.conversationIds.unshift(localConversations[localConvIds[i]].id);
              }
            }
            // update conversations if shouldRefresh is true
            if (localConversations[localConvIds[i]].shouldRefresh) {
              await updateConversationInStorage(localConversations[localConvIds[i]]);
            }
          }
          const allVisibleConversationsOrderIds = newConversationsOrder.filter((conv) => conv.id !== 'trash').map((conv) => (typeof conv === 'object' ? conv.conversationIds : conv)).flat();

          if (remoteConvIds.length > 0 && remoteConvIds.length - inSyncConversations(localConversations, remoteConversations).length > 3) {
            initializeCopyAndCounter();
            initializeAddToPromptLibrary();
            initializeTimestamp();
            updateNewChatButtonNotSynced();
            addAsyncInputEvents();
            addSyncBanner();
          }
          // Add missing conversations
          for (let i = 0; i < remoteConvIds.length; i += 1) {
            if (localConversations[remoteConvIds[i]]?.skipped) {
              // make sure skipped are not archived
              localConversations[remoteConvIds[i]].archived = false;
              continue;
            }
            if (localConvIds.includes(remoteConvIds[i]) && !visibleAndNotSkippedLocalConvIds.includes(remoteConvIds[i])) {
              localConversations[remoteConvIds[i]].archived = false;
            }
            if (!allVisibleConversationsOrderIds.includes(remoteConvIds[i])) {
              if (!conversationsOrder || conversationsOrder.length === 0) { // if conversationsOrder does not exist, add to the end of it right before trash folder (last element -1)
                newConversationsOrder.splice(newConversationsOrder.length - 1, 0, remoteConvIds[i]);
              } else { // if conversationsOrder exists, insert it at index i in newConversationsOrder
                // eslint-disable-next-line no-lonely-if
                if (settings.keepFoldersAtTheTop) {
                  // start from the top until conv is not a folder
                  for (let j = 0; j < newConversationsOrder.length; j += 1) {
                    if (typeof newConversationsOrder[j] === 'string') {
                      newConversationsOrder.splice(j, 0, remoteConvIds[i]);
                      break;
                    }
                  }
                } else {
                  newConversationsOrder.splice(i, 0, remoteConvIds[i]);
                }
              }
            }
            if (forceRefreshIds.includes(remoteConvIds[i])
              || !visibleAndNotSkippedLocalConvIds.includes(remoteConvIds[i])
              || typeof localConversations[remoteConvIds[i]]?.shouldRefresh === 'undefined'
              || localConversations[remoteConvIds[i]]?.shouldRefresh
              || !localConversations[remoteConvIds[i]].id
              || !localConversations[remoteConvIds[i]].create_time
              || (remoteConversations[i].current_node && !localConversations[remoteConvIds[i]].current_node)
              || (remoteConversations[i].update_time && (localConversations[remoteConvIds[i]].update_time !== new Date(remoteConversations[i].update_time).getTime() / 1000))
              // || (localConversations[remoteConvIds[i]].mapping[localConversations[remoteConvIds[i]].current_node].message.metadata.model_slug.includes('plugins') && typeof localConversations[remoteConvIds[i]].plugin_ids === 'undefined')
            ) {
              await addConversationToStorage(remoteConversations[i]);
              const progressLabel = document.getElementById('sync-progresslabel');
              if (progressLabel) {
                // eslint-disable-next-line no-loop-func
                progressLabel.innerText = `Syncing(${inSyncConversations(localConversations, remoteConversations).length}/${remoteConvIds.length})`;
                addSyncBanner();
              }
              if (remoteConvIds.length - inSyncConversations(localConversations, remoteConversations).length > 3) {
                await autoSaveCountDownAsync(isPaid);
              }
            }
          }
          // remove duplicate convids from newConversationsOrder and remove duplicates from conversationsIds in each folder
          newConversationsOrder.forEach((folder, index) => {
            if (typeof folder === 'string') {
              if (newConversationsOrder.indexOf(folder) !== newConversationsOrder.lastIndexOf(folder)) {
                newConversationsOrder.splice(newConversationsOrder.lastIndexOf(folder), 1);
              }
            }
            if (typeof folder === 'object') {
              folder.conversationIds = [...new Set(folder.conversationIds)];
              newConversationsOrder[index] = folder;
              // compare inside and outside folders
              for (let i = 0; i < folder.conversationIds.length; i += 1) {
                if (newConversationsOrder.indexOf(folder.conversationIds[i]) !== -1) {
                  newConversationsOrder.splice(newConversationsOrder.indexOf(folder.conversationIds[i]), 1);
                }
              }
            }
          });

          const conversationsAreSynced = checkConversationAreSynced(localConversations, remoteConversations);
          // if keepFoldersAtTheTop and sort by updated, sort conversations by updatetime before saving. This is to make sure if a conversation was updated on another device, it will be sorted correctly
          if (settings.keepFoldersAtTheTop && settings.conversationTimestamp) {
            newConversationsOrder = sortConversationsByTimestamp(newConversationsOrder, localConversations, true);
          }

          if (conversationsAreSynced) {
            chrome.storage.local.set({
              conversations: localConversations,
              conversationsAreSynced,
              conversationsOrder: newConversationsOrder,
            }, () => {
              clearTimeout(initializeTimoutId);
              const progressBar = document.getElementById('sync-progressbar');
              const progressLabel = document.getElementById('sync-progresslabel');
              const tooltip = document.getElementById('sync-tooltip');
              if (progressBar && progressLabel && tooltip) {
                progressBar.style.backgroundColor = 'gold';
                progressBar.classList.remove('animate-pulse');
                progressLabel.innerText = `Synced (${settings.quickSync ? 'Quick' : 'Full'})`;
                tooltip.innerText = 'Your conversations are synced!';
              }
              const refreshButton = document.getElementById('sync-refresh-button');
              if (refreshButton) {
                refreshButton.title = 'Sync Conversations';
                refreshButton.classList.add('cursor-pointer');
                refreshButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="gold" d="M468.9 32.11c13.87 0 27.18 10.77 27.18 27.04v145.9c0 10.59-8.584 19.17-19.17 19.17h-145.7c-16.28 0-27.06-13.32-27.06-27.2c0-6.634 2.461-13.4 7.96-18.9l45.12-45.14c-28.22-23.14-63.85-36.64-101.3-36.64c-88.09 0-159.8 71.69-159.8 159.8S167.8 415.9 255.9 415.9c73.14 0 89.44-38.31 115.1-38.31c18.48 0 31.97 15.04 31.97 31.96c0 35.04-81.59 70.41-147 70.41c-123.4 0-223.9-100.5-223.9-223.9S132.6 32.44 256 32.44c54.6 0 106.2 20.39 146.4 55.26l47.6-47.63C455.5 34.57 462.3 32.11 468.9 32.11z"/></svg>';
                refreshButton.onclick = (e) => {
                  // remove progress bar and refresh button and progress label
                  const canSubmit = canSubmitPrompt();
                  if (isGenerating || !canSubmit) return;
                  const syncDiv = document.getElementById('sync-div');
                  syncDiv.remove();
                  const { pathname } = new URL(window.location.toString());
                  const conversationId = pathname.split('/').pop().replace(/[^a-z0-9-]/gi, '');
                  const refreshIds = [];
                  if (/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(conversationId)) {
                    refreshIds.push(conversationId);
                  }
                  // if shift + cmnd/ctrl
                  if (e.shiftKey && (e.metaKey || (isWindows() && e.ctrlKey))) {
                    chrome.storage.local.set({
                      conversationsOrder: [],
                      conversations: {},
                      conversationsAreSynced: false,
                    }, () => {
                      window.location.reload();
                    });
                  } else {
                    initializeAutoSave(true, refreshIds);
                  }
                };
              }
              const existingSyncBanner = document.querySelector('#sync-nav-wrapper');
              if (existingSyncBanner) {
                if (settings.autoRefreshAfterSync) {
                  window.location.reload();
                } else {
                  // replace the content with "sync is complete" and a refresh button
                  const pageRefreshButton = document.createElement('button');
                  pageRefreshButton.style = 'color: gold; cursor: pointer; border: solid 1px gold; padding: 8px; border-radius: 4px; margin-left: 16px;';
                  pageRefreshButton.innerText = 'Refresh page';
                  pageRefreshButton.addEventListener('click', () => {
                    window.location.reload();
                  });
                  existingSyncBanner.firstChild.innerHTML = 'Sync is complete! Refresh the page to see your changes.';
                  existingSyncBanner.firstChild.appendChild(pageRefreshButton);
                }
              } else {
                loadConversationList(skipInputFormReload);
              }
            });
          } else {
            clearTimeout(initializeTimoutId);
            initializeTimoutId = setTimeout(() => {
              initializeAutoSave(true);
            }, 60 * 1000);
          }
        });
      });
    });
  }, () => {
    // if the conversation history endpoint failed, set conversationsAreSynced to true
    chrome.storage.local.get(['settings'], (result) => {
      const { settings } = result;
      chrome.storage.local.set({
        conversationsAreSynced: true,
      }, () => {
        clearTimeout(initializeTimoutId);
        const progressBar = document.getElementById('sync-progressbar');
        const progressLabel = document.getElementById('sync-progresslabel');
        const tooltip = document.getElementById('sync-tooltip');
        if (progressBar && progressLabel && tooltip) {
          progressBar.style.backgroundColor = 'gold';
          progressBar.classList.remove('animate-pulse');
          progressLabel.innerText = `Synced (${settings.quickSync ? 'Quick' : 'Full'})`;

          tooltip.innerText = 'Your conversations are synced!';
        }
        const refreshButton = document.getElementById('sync-refresh-button');
        if (refreshButton) {
          refreshButton.title = 'Sync Conversations';
          refreshButton.classList.add('cursor-pointer');
          refreshButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="gold" d="M468.9 32.11c13.87 0 27.18 10.77 27.18 27.04v145.9c0 10.59-8.584 19.17-19.17 19.17h-145.7c-16.28 0-27.06-13.32-27.06-27.2c0-6.634 2.461-13.4 7.96-18.9l45.12-45.14c-28.22-23.14-63.85-36.64-101.3-36.64c-88.09 0-159.8 71.69-159.8 159.8S167.8 415.9 255.9 415.9c73.14 0 89.44-38.31 115.1-38.31c18.48 0 31.97 15.04 31.97 31.96c0 35.04-81.59 70.41-147 70.41c-123.4 0-223.9-100.5-223.9-223.9S132.6 32.44 256 32.44c54.6 0 106.2 20.39 146.4 55.26l47.6-47.63C455.5 34.57 462.3 32.11 468.9 32.11z"/></svg>';
          refreshButton.onclick = (e) => {
            // remove progress bar and refresh button and progress label
            const canSubmit = canSubmitPrompt();
            if (isGenerating || !canSubmit) return;
            const syncDiv = document.getElementById('sync-div');
            syncDiv.remove();
            const { pathname } = new URL(window.location.toString());
            const conversationId = pathname.split('/').pop().replace(/[^a-z0-9-]/gi, '');
            const refreshIds = [];
            if (/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(conversationId)) {
              refreshIds.push(conversationId);
            }
            // if shift + cmnd/ctrl
            if (e.shiftKey && (e.metaKey || (isWindows() && e.ctrlKey))) {
              chrome.storage.local.set({
                conversationsOrder: [],
                conversations: {},
                conversationsAreSynced: false,
              }, () => {
                window.location.reload();
              });
            } else {
              initializeAutoSave(true, refreshIds);
            }
          };
        }
        loadConversationList(skipInputFormReload);
      });
    });
    //----------------------------------------------
    // initializeCopyAndCounter();
    // initializeAddToPromptLibrary();
    // initializeTimestamp();
    // updateNewChatButtonNotSynced();
    // addAsyncInputEvents();
    // const progressBar = document.getElementById('sync-progressbar');
    // const progressLabel = document.getElementById('sync-progresslabel');
    // const tooltip = document.getElementById('sync-tooltip');
    // const refreshButton = document.getElementById('sync-refresh-button');
    // if (progressBar && progressLabel && tooltip && refreshButton) {
    //   progressLabel.innerText = 'Click to retry';
    //   refreshButton.classList.add('cursor-pointer');
    //   progressBar.classList.remove('animate-pulse');
    //   tooltip.innerText = 'Failed to sync conversations. Click to retry.';
    //   refreshButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#00aaff" d="M468.9 32.11c13.87 0 27.18 10.77 27.18 27.04v145.9c0 10.59-8.584 19.17-19.17 19.17h-145.7c-16.28 0-27.06-13.32-27.06-27.2c0-6.634 2.461-13.4 7.96-18.9l45.12-45.14c-28.22-23.14-63.85-36.64-101.3-36.64c-88.09 0-159.8 71.69-159.8 159.8S167.8 415.9 255.9 415.9c73.14 0 89.44-38.31 115.1-38.31c18.48 0 31.97 15.04 31.97 31.96c0 35.04-81.59 70.41-147 70.41c-123.4 0-223.9-100.5-223.9-223.9S132.6 32.44 256 32.44c54.6 0 106.2 20.39 146.4 55.26l47.6-47.63C455.5 34.57 462.3 32.11 468.9 32.11z"/></svg>';
    //   progressLabel.onclick = () => {
    //     // remove progress bar and refresh button and progress label
    //     const canSubmit = canSubmitPrompt();
    //     if (isGenerating || !canSubmit) return;
    //     const syncDiv = document.getElementById('sync-div');
    //     syncDiv.remove();
    //     const { pathname } = new URL(window.location.toString());
    //     const conversationId = pathname.split('/').pop().replace(/[^a-z0-9-]/gi, '');
    //     const refreshIds = [];
    //     if (/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(conversationId)) {
    //       refreshIds.push(conversationId);
    //     }
    //     initializeAutoSave(false, refreshIds);
    //   };
    //   refreshButton.onclick = () => {
    //     // remove progress bar and refresh button and progress label
    //     const canSubmit = canSubmitPrompt();
    //     if (isGenerating || !canSubmit) return;
    //     const syncDiv = document.getElementById('sync-div');
    //     syncDiv.remove();
    //     const { pathname } = new URL(window.location.toString())
    //     const conversationId = pathname.split('/').pop().replace(/[^a-z0-9-]/gi, '');
    //     const refreshIds = [];
    //     if (/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(conversationId)) {
    //       refreshIds.push(conversationId);
    //     }
    //     initializeAutoSave(false, refreshIds);
    //   };
    //   refreshTimeoutId = setTimeout(() => {
    //     clearTimeout(refreshTimeoutId);
    //     refreshButton.click();
    //   }, 60 * 1000);
    // }
    //----------------------------------------------
  });
}
/*
conversations={
  convId: {
    id: convId,
    archived: false,
    shouldRefresh: false,
    title: convTitle,
    create_time: convCreateTime,
    current_node: convCurrentNode,
    mapping:{},
    moderation_results:[]
},..}
*/
