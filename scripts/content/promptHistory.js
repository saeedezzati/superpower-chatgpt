/* global highlight,openSubmitPromptModal, updateInputCounter, addButtonToNavFooter,createModal, disableTextInput:true, isGenerating, addInputCounter, toast, quickAccessMenu , updateQuickAccessMenuItems */
function createPromptHistoryModal() {
  chrome.storage.local.get(['userInputValueHistory', 'settings'], (result) => {
    const { userInputValueHistory, settings } = result;
    const { historyFilter } = settings;
    const bodyContent = promptHistoryModalContent(userInputValueHistory, historyFilter);
    const actionsBarContent = historyModalActions();
    createModal('My Prompt History', 'All your personal and favorite prompts are saved here.', bodyContent, actionsBarContent);
    const historySearchInput = document.getElementById('history-search-input');
    historySearchInput.focus();
    updateHisotryList();
  });
}
function updateHisotryList() {
  const existingEmptyHistoryList = document.getElementById('history-list-empty');
  if (existingEmptyHistoryList) existingEmptyHistoryList.remove();
  const historyList = document.querySelector('#prompt-history-list');
  const historyListChildren = Array.from(historyList?.children || []);
  const hasVisibleHistoryItem = historyListChildren.some((item) => item.style.display === 'flex');
  if (!hasVisibleHistoryItem) {
    historyList.appendChild(emptyHistory());
  }
  addReadMoreButtonsToHistory();
}
function emptyHistory() {
  const historyListEmpty = document.createElement('div');
  historyListEmpty.id = 'history-list-empty';
  historyListEmpty.style = 'display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; width: 100%; color: lightslategray; font-size: 13px; padding: 16px 0;text-align:center;';
  chrome.storage.local.get(['settings'], (result) => {
    const { settings } = result;
    const { historyFilter } = settings;
    const searchValue = document.querySelector('input[id="history-search-input"]').value;
    historyListEmpty.innerHTML = historyFilter === 'favorites'
      ? `No favorite found. ${searchValue ? 'Adjust your search' : `<span style="text-align:center;">You can mark any prompt in your history as favorite. Click on the <span style="text-decoration: underline;">All</span> tab above and then mark any prompt as favorite by clicking on the bookmark icon next to it <img src=${chrome.runtime.getURL('icons/bookmark-off.png')} style="min-width: 24px; height: 32px; transform: rotate(90deg); position: relative; right: -10px; top: 2px;margin:auto;">`}</span>`
      : `No history found. ${searchValue ? 'Adjust your search' : 'Start using the chat to see your prompt history here'}`;
  });
  return historyListEmpty;
}
function promptHistoryModalContent(userInputValueHistory, historyFilter) {
  // create history modal content
  const content = document.createElement('div');
  content.style = 'display: flex; flex-direction: column; justify-content: space-between; align-items: center;overflow-y: hidden;';
  const historyList = promptHistoryList(userInputValueHistory, historyFilter);
  const historyFilters = historyFilterButtonsContent(historyFilter);
  content.appendChild(historyFilters);
  content.appendChild(historyList);
  return content;
}

function promptHistoryList(userInputValueHistory, historyFilter) {
  // create history modal content
  const historyList = document.createElement('div');
  historyList.id = 'prompt-history-list';
  historyList.style = 'display: flex; flex-direction: column; justify-content: start; align-items: center; height: 100%; width:100%;padding: 16px;overflow-y: scroll;';

  if (userInputValueHistory && userInputValueHistory.length > 0) {
    userInputValueHistory.sort((a, b) => b.timestamp - a.timestamp).forEach((userInputValue, index) => {
      const historyItem = document.createElement('div');
      historyItem.id = `history-item-${index}`;
      historyItem.style = 'display: flex; flex-direction: column; justify-content: space-between; align-items: end; width: 100%; margin: 8px 0; padding: 8px; background-color: #1f2123; border-radius: 8px;';
      historyItem.setAttribute('data-favorite', userInputValue.isFavorite ? 'true' : 'false');
      historyItem.addEventListener('mouseover', () => {
        historyItem.style.backgroundColor = '#2f3133';
      });
      historyItem.addEventListener('mouseout', () => {
        historyItem.style.backgroundColor = '#1f2123';
      });
      const historyItemText = document.createElement('pre');
      historyItemText.id = `text-history-item-${index}`;
      historyItemText.style = 'color: #ececf1; font-size:0.8em; width: 100%; white-space: break-spaces; overflow-wrap: break-word;display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical; overflow: hidden;';
      historyItemText.dir = 'auto';
      historyItemText.textContent = userInputValue.inputValue;
      historyItem.appendChild(historyItemText);
      // history item action buttons wrapper
      const historyItemActionButtons = document.createElement('div');
      historyItemActionButtons.style = 'position:relative; display: flex; flex-direction: row; width: 100%; justify-content: end; align-items:end;margin-top:24px;';
      historyItem.appendChild(historyItemActionButtons);
      // submit button
      const historyItemSubmitButton = document.createElement('button');
      historyItemSubmitButton.classList = 'btn flex justify-center gap-2 btn-dark border-0 md:border';
      historyItemSubmitButton.style = 'font-size:0.7em; padding:4px 8px; margin-left:8px;color:lightgray;';
      historyItemSubmitButton.textContent = 'Share in Community Prompts';
      historyItemSubmitButton.addEventListener('click', () => {
        // close history modal
        // document.querySelector('button[id="modal-close-button-prompt-history"]').click();
        openSubmitPromptModal(userInputValue.inputValue, userInputValue.modelSlug || '');
      });
      historyItemActionButtons.appendChild(historyItemSubmitButton);
      // delete button
      const historyItemDeleteButton = document.createElement('button');
      historyItemDeleteButton.classList = 'btn flex justify-center gap-2 btn-dark border-0 md:border';
      historyItemDeleteButton.style = 'font-size:0.7em; padding:4px 8px; margin-left:8px;width:60px;color:lightgray;';
      historyItemDeleteButton.textContent = 'Delete';
      historyItemDeleteButton.addEventListener('click', (e) => {
        if (e.target.textContent === 'Confirm') {
          chrome.storage.local.get(['userInputValueHistory'], (res) => {
            const newHistory = res.userInputValueHistory.filter((item) => item.inputValue !== userInputValue.inputValue);
            chrome.storage.local.set({ userInputValueHistory: newHistory }, () => {
              historyItem.remove();
              updateHisotryList();
            });
          });
        } else {
          e.target.textContent = 'Confirm';
          e.target.style.backgroundColor = '#864e6140';
          e.target.style.color = '#ff4a4a';
          e.target.style.borderColor = '#ff4a4a';
          setTimeout(() => {
            e.target.textContent = 'Delete';
            e.target.style.backgroundColor = '#343541';
            e.target.style.color = 'lightgray';
            e.target.style.borderColor = '#565869';
          }, 3000);
        }
      });
      historyItemActionButtons.appendChild(historyItemDeleteButton);
      // use button
      const historyItemUseButton = document.createElement('button');
      const shiftClickText = document.createElement('div');
      shiftClickText.textContent = 'Shift + Click to run the prompt without editing';
      shiftClickText.style = 'font-size:10px;position:absolute;right:32px;bottom:36px;display:none;color:lightslategray;';
      historyItemUseButton.classList = 'btn flex justify-center gap-2 btn-dark border-0 md:border';
      historyItemUseButton.style = 'font-size:0.7em; padding:4px 8px; margin-left:8px;width:60px;color:lightgray;';
      historyItemUseButton.textContent = 'Use';
      // add hover style to button
      historyItemUseButton.addEventListener('mouseover', () => {
        shiftClickText.style = 'font-size:10px;position:absolute;right:32px;bottom:36px;color:lightslategray;';
      });
      historyItemUseButton.addEventListener('mouseout', () => {
        shiftClickText.style = 'font-size:10px;position:absolute;right:32px;bottom:36px;display:none;color:lightslategray;';
      });
      historyItemUseButton.addEventListener('click', (event) => {
        const inputForm = document.querySelector('form');
        if (!inputForm) return;
        const submitButton = inputForm.querySelector('textarea ~ button');
        if (!submitButton) return;
        const textAreaElement = inputForm.querySelector('textarea');
        if (!textAreaElement) return;
        textAreaElement.value = userInputValue.inputValue;
        textAreaElement.focus();
        textAreaElement.dispatchEvent(new Event('input', { bubbles: true }));
        textAreaElement.dispatchEvent(new Event('change', { bubbles: true }));
        // if alt key is pressed, submit the form
        if (event.shiftKey) {
          setTimeout(() => {
            submitButton.click();
          }, 300);
        }
        // click on modal close button
        document.querySelector('button[id="modal-close-button-my-prompt-history"]').click();
      });
      historyItemActionButtons.appendChild(shiftClickText);
      historyItemActionButtons.appendChild(historyItemUseButton);
      // favorite button
      const historyItemBookmarkButton = document.createElement('button');
      historyItemBookmarkButton.id = `bookmark-history-item-${index}`;
      historyItemBookmarkButton.style = 'background-color: transparent; border: none; cursor: pointer; margin-left:8px;';
      const historyItemFavoriteButtonIcon = document.createElement('img');
      historyItemFavoriteButtonIcon.style = 'min-width: 24px;height: 32px;transform: rotate(90deg);position: relative;right: -10px;top:2px;filter: drop-shadow(2px 4px 6px black);';
      historyItemFavoriteButtonIcon.src = chrome.runtime.getURL(`icons/${userInputValue.isFavorite ? 'bookmark-on' : 'bookmark-off'}.png`);
      historyItemBookmarkButton.title = userInputValue.isFavorite ? 'Remove from favorites' : 'Add to favorites';
      historyItemBookmarkButton.appendChild(historyItemFavoriteButtonIcon);
      historyItemBookmarkButton.addEventListener('click', () => {
        chrome.storage.local.get(['userInputValueHistory', 'settings'], (res) => {
          const newHistory = res.userInputValueHistory.map((item) => {
            if (item.inputValue === userInputValue.inputValue) {
              return { ...item, isFavorite: !item.isFavorite };
            }
            return item;
          });
          chrome.storage.local.set({ userInputValueHistory: newHistory }, () => {
            const curHistoryItem = document.querySelector(`#history-item-${index}`);
            if (curHistoryItem.getAttribute('data-favorite') === 'false') {
              historyItemFavoriteButtonIcon.src = chrome.runtime.getURL('icons/bookmark-on.png');
              historyItemBookmarkButton.title = 'Remove from favorites';
              curHistoryItem.setAttribute('data-favorite', 'true');
            } else {
              historyItemFavoriteButtonIcon.src = chrome.runtime.getURL('icons/bookmark-off.png');
              historyItemBookmarkButton.title = 'Add to favorites';
              curHistoryItem.setAttribute('data-favorite', 'false');
              if (res.settings.historyFilter === 'favorites') {
                curHistoryItem.style.display = 'none';
              }
            }
            // check if history list has any children with display flex
            updateHisotryList();
          });
        });
      });
      historyItemActionButtons.appendChild(historyItemBookmarkButton);
      if (historyItem.getAttribute('data-favorite') === 'false') {
        historyItem.style.display = historyFilter === 'favorites' ? 'none' : 'flex';
      } else {
        historyItem.style.display = 'flex';
      }
      historyItem.appendChild(historyItemActionButtons);
      historyList.appendChild(historyItem);
    });
  }
  return historyList;
}
function historyFilterButtonsContent(historyFilter) {
  // history filter
  const historyFilterElement = document.createElement('div');
  historyFilterElement.style = 'display: flex; flex-direction: row; justify-content: space-between; align-items: center; width: 100%; padding: 12px; background-color: #778899; z-index: 100; position: sticky; top: 0;';
  // add history filter button
  const historyFilterButtons = document.createElement('div');
  historyFilterButtons.style = 'display: flex; flex-direction: row; justify-content: space-between; align-items: center;';
  const historyFilterFavoritesButton = document.createElement('button');
  historyFilterFavoritesButton.id = 'history-filter-favorites-button';
  historyFilterFavoritesButton.style = `${historyFilter === 'favorites' ? 'background-color: gold; color: rgb(31, 33, 35);' : 'background-color: rgb(31, 33, 35); color: lightslategray;'} font-size:0.8em; cursor: pointer;border-top-left-radius: 4px; border-bottom-left-radius: 4px; border: 1px solid lightslategray;border-right:none; padding:4px 8px; width: 70px;height:34px;`;
  historyFilterFavoritesButton.textContent = 'Favorites';

  const historyFilterAllButton = document.createElement('button');
  historyFilterAllButton.id = 'history-filter-all-button';
  historyFilterAllButton.style = `${historyFilter === 'all' ? 'background-color: gold; color: rgb(31, 33, 35);' : 'background-color: rgb(31, 33, 35); color: lightslategray;'} font-size:0.8em; cursor: pointer;border-top-right-radius: 4px; border-bottom-right-radius: 4px; border: 1px solid lightslategray; padding:4px 8px; width: 70px;height:34px;`;
  historyFilterAllButton.textContent = 'All';

  historyFilterFavoritesButton.addEventListener('click', () => {
    chrome.storage.local.get(['settings'], (result) => {
      chrome.storage.local.set({
        settings: {
          ...result.settings,
          historyFilter: 'favorites',
        },
      }, () => {
        const historyItems = document.querySelectorAll('div[id^=history-item]');
        const searchValue = document.querySelector('input[id="history-search-input"]').value;
        const exportHistoryButton = document.querySelector('button[id="export-history-button"]');
        exportHistoryButton.textContent = 'Export Favorites';
        historyItems.forEach((historyItem) => {
          const historyItemText = historyItem.querySelector('pre[id^=text-history-item-]');
          historyItemText.innerHTML = highlight(historyItemText.textContent, searchValue);
          if (searchValue.trim().length === 0 || historyItemText.textContent.toLowerCase().includes(searchValue.toLowerCase())) {
            const historyItemDataFavorite = historyItem.getAttribute('data-favorite') === 'true';
            if (historyItemDataFavorite) {
              historyItem.style.display = 'flex';
            } else {
              historyItem.style.display = 'none';
            }
          } else {
            historyItem.style.display = 'none';
          }
        });
        historyFilterFavoritesButton.style.backgroundColor = 'gold';
        historyFilterFavoritesButton.style.color = 'rgb(31, 33, 35)';

        historyFilterAllButton.style.backgroundColor = 'rgb(31, 33, 35)';
        historyFilterAllButton.style.color = 'lightslategray';
        updateHisotryList();
      });
    });
  });

  historyFilterAllButton.addEventListener('click', () => {
    chrome.storage.local.get(['settings'], (result) => {
      chrome.storage.local.set({
        settings: {
          ...result.settings,
          historyFilter: 'all',
        },
      }, () => {
        const historyItems = document.querySelectorAll('div[id^=history-item]');
        const searchValue = document.querySelector('input[id="history-search-input"]').value;
        const exportHistoryButton = document.querySelector('button[id="export-history-button"]');
        exportHistoryButton.textContent = 'Export All';
        historyItems.forEach((historyItem) => {
          const historyItemText = historyItem.querySelector('pre[id^=text-history-item-]');
          historyItemText.innerHTML = highlight(historyItemText.textContent, searchValue);

          if (searchValue.trim().length === 0 || historyItemText.textContent.toLowerCase().includes(searchValue.toLowerCase())) {
            historyItem.style.display = 'flex';
          } else {
            historyItem.style.display = 'none';
          }
        });
        historyFilterAllButton.style.backgroundColor = 'gold';
        historyFilterAllButton.style.color = 'rgb(31, 33, 35)';

        historyFilterFavoritesButton.style.backgroundColor = 'rgb(31, 33, 35)';
        historyFilterFavoritesButton.style.color = 'lightslategray';
        updateHisotryList();
      });
    });
  });
  historyFilterButtons.appendChild(historyFilterFavoritesButton);
  historyFilterButtons.appendChild(historyFilterAllButton);
  historyFilterElement.appendChild(historyFilterButtons);
  // add history search box
  const historySearchInput = document.createElement('input');
  historySearchInput.id = 'history-search-input';
  historySearchInput.type = 'search';
  historySearchInput.style = 'background-color: #1f2123; color: lightslategray; font-size:0.8em; border-radius: 4px; border: 1px solid lightslategray; padding:4px 8px; width: 100%;margin-left:8px;';
  historySearchInput.placeholder = 'Search';
  historySearchInput.autocomplete = 'off';
  historySearchInput.addEventListener('input', (e) => {
    chrome.storage.local.get(['settings'], (result) => {
      const { value } = e.target;
      const historyItems = result.settings.historyFilter === 'favorites'
        ? document.querySelectorAll('div[id^=history-item-][data-favorite=true]')
        : document.querySelectorAll('div[id^=history-item-]');

      historyItems.forEach((item) => {
        const itemText = item.querySelector('pre[id^=text-history-item-]');
        if (itemText.textContent.toLowerCase().includes(value.toLowerCase()) || value.trim().length === 0) {
          item.style.display = 'flex';
          itemText.innerHTML = highlight(itemText.textContent, value);
        } else {
          item.style.display = 'none';
        }
      });
      updateHisotryList();

      // // clear all existing highlights first since history doesn't rerender
      // const historyItemsTexts = document.querySelectorAll('pre[id^=text-history-item-]');
      // historyItemsTexts.forEach((itemText) => {
      //   itemText.innerHTML = highlight(itemText.textContent, value);
      // });
    });
  });
  historyFilterElement.appendChild(historySearchInput);
  return historyFilterElement;
}
function addReadMoreButtonsToHistory() {
  const historyItemTexts = document.querySelectorAll('pre[id^="text-history-item-"]');
  historyItemTexts.forEach((historyItemText) => {
    const searchValue = document.querySelector('input[id="history-search-input"]').value;
    if (!searchValue) {
      const id = historyItemText.id.split('text-history-item-')[1];
      if (historyItemText.offsetHeight < historyItemText.scrollHeight) {
        const historyList = document.querySelector('div[id="prompt-history-list"]');
        const existingReadMoreButton = historyList?.querySelector(`div[id="read-more-history-item-${id}"]`);
        if (existingReadMoreButton) existingReadMoreButton.remove();
        const historyItemReadMore = document.createElement('div');
        historyItemReadMore.id = `read-more-history-item-${id}`;
        historyItemReadMore.style = 'color: lightslategray; font-size:0.8em; width: 100%; margin-top: 8px; cursor: pointer;';

        historyItemReadMore.textContent = 'Show more';
        historyItemReadMore.addEventListener('click', () => {
          if (historyItemReadMore.textContent === 'Show less') {
            historyItemText.style = 'color: #ececf1; font-size:0.8em; width: 100%; white-space: break-spaces; overflow-wrap: break-word;display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical; overflow: hidden;';
            historyItemReadMore.textContent = 'Show more';
          } else {
            historyItemText.style = 'color: #ececf1; font-size:0.8em; width: 100%; white-space: break-spaces; overflow-wrap: break-word;';
            historyItemReadMore.textContent = 'Show less';
          }
        });
        historyItemText.insertAdjacentElement('afterend', historyItemReadMore);
      }
    }
  });
}
function historyModalActions() {
  // add actionbar at the bottom of the content
  const actionBar = document.createElement('div');
  actionBar.style = 'display: flex; flex-direction: row; justify-content: space-between; align-items: end; width: 100%; margin: 8px 0;';
  const exportImportWrapper = document.createElement('div');
  exportImportWrapper.style = 'display: flex; flex-direction: row; justify-content: start; align-items: end;';

  const exportHistoryButton = document.createElement('button');
  exportHistoryButton.id = 'export-history-button';
  exportHistoryButton.classList = 'btn flex justify-center gap-2 btn-dark border-0 md:border';
  exportHistoryButton.style = 'font-size:0.7em; padding:4px 8px; width:130px;color:lightgray;';
  chrome.storage.local.get(['settings'], (result) => {
    exportHistoryButton.textContent = `Export ${result.settings.historyFilter === 'favorites' ? 'Favorites' : 'All'}`;
  });
  exportHistoryButton.addEventListener('click', () => {
    chrome.storage.local.get(['userInputValueHistory', 'settings'], (result) => {
      const { historyFilter } = result.settings;
      const historyItems = historyFilter === 'favorites' ? result.userInputValueHistory.filter((item) => item.isFavorite) : result.userInputValueHistory;
      const sortedHistoryItems = historyItems.sort((a, b) => b.timestamp - a.timestamp);
      const element = document.createElement('a');
      element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(JSON.stringify(sortedHistoryItems))}`);
      const todatDate = new Date();
      const filePostfix = `${todatDate.getFullYear()}-${todatDate.getMonth() + 1}-${todatDate.getDate()}`;

      element.setAttribute('download', `superpower-chatgpt-prompt-history-${historyFilter === 'favorites' ? 'favorites' : 'all'}-${filePostfix}.json`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      navigator.clipboard.writeText(JSON.stringify(sortedHistoryItems));
      toast('History exported and copied to clipboard');
    });
  });

  const importHistoryButton = document.createElement('button');
  importHistoryButton.id = 'import-history-button';
  importHistoryButton.classList = 'btn flex justify-center gap-2 btn-dark border-0 md:border';
  importHistoryButton.style = 'font-size:0.7em; padding:4px 8px; margin-right:8px; width:130px;color:lightgray;';
  importHistoryButton.textContent = 'Import Prompts';
  importHistoryButton.addEventListener('click', () => {
    chrome.storage.local.get(['userInputValueHistory'], (result) => {
      // open file picker
      const filePicker = document.createElement('input');
      filePicker.type = 'file';
      filePicker.accept = '.json';
      filePicker.addEventListener('change', (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          const importedHistory = JSON.parse(e.target.result);
          const existingHistory = result.userInputValueHistory;

          // only add new items
          importedHistory.forEach((importedItem) => {
            const existingItem = existingHistory.find((item) => item.inputValue === importedItem.inputValue);
            if (!existingItem) {
              existingHistory.push(importedItem);
            }
          });

          chrome.storage.local.set({ userInputValueHistory: existingHistory }, () => {
            toast('Imported prompts');
            // click on all history button
            const allHistoryButton = document.querySelector('button[id="history-filter-all-button"]');
            allHistoryButton.click();
            // reload history
            const historyList = document.querySelector('div[id="prompt-history-list"]');
            const newHistoryList = promptHistoryList(existingHistory, 'all');
            historyList.replaceWith(newHistoryList);
          });
        };
        reader.readAsText(file);
      });
      filePicker.click();
    });
  });

  exportImportWrapper.appendChild(importHistoryButton);
  exportImportWrapper.appendChild(exportHistoryButton);
  actionBar.appendChild(exportImportWrapper);

  const clearHistoryButton = document.createElement('button');
  clearHistoryButton.classList = 'btn flex justify-center gap-2 btn-dark border-0 md:border';
  clearHistoryButton.style = 'font-size:0.7em; padding:4px 8px; margin-left:8px;width:130px;color:lightgray;';

  clearHistoryButton.textContent = 'Delete non favorites';
  clearHistoryButton.addEventListener('click', (e) => {
    if (e.target.textContent === 'Confirm delete') {
      chrome.storage.local.get(['userInputValueHistory'], (result) => {
        const favariteHistoryItems = result.userInputValueHistory.filter((item) => item.isFavorite);
        chrome.storage.local.set({ userInputValueHistory: favariteHistoryItems }, () => {
          // remove non-favorite history items
          const historyItems = document.querySelectorAll('div[id^=history-item-]');
          historyItems.forEach((item) => {
            if (item.dataset.favorite === 'false') {
              item.remove();
            }
          });
          updateHisotryList();
          e.target.textContent = 'Delete non favorites';
          e.target.style.backgroundColor = '#343541';
          e.target.style.color = 'lightgray';
          e.target.style.borderColor = '#565869';
        });
      });
    } else {
      e.target.textContent = 'Confirm delete';
      e.target.style.backgroundColor = '#864e6140';
      e.target.style.color = '#ff4a4a';
      e.target.style.borderColor = '#ff4a4a';
      setTimeout(() => {
        e.target.textContent = 'Delete non favorites';
        e.target.style.backgroundColor = '#343541';
        e.target.style.color = 'lightgray';
        e.target.style.borderColor = '#565869';
      }, 3000);
    }
  });
  actionBar.appendChild(clearHistoryButton);
  return actionBar;
}

function addUserPromptToHistory(inputValue) {
  // Add new value to the value history
  chrome.storage.local.get(['userInputValueHistory', 'settings'], (result) => {
    const userInputValueHistory = result.userInputValueHistory || [];
    // if inputValue already exists in history, remove it first
    const existingInputValueIndex = userInputValueHistory.findIndex(
      (historyItem) => historyItem.inputValue.trim() === inputValue.trim(),
    );
    let deletedItems = [];
    if (existingInputValueIndex !== -1) {
      deletedItems = userInputValueHistory.splice(existingInputValueIndex, 1);
    }
    userInputValueHistory.push({
      isFavorite: deletedItems.length > 0 ? deletedItems[0].isFavorite : false,
      timestamp: Date.now(),
      inputValue: inputValue.trim(),
      modelSlug: result.settings.selectedModel.slug,
    });
    chrome.storage.local.set({ userInputValueHistory }, () => {
      chrome.storage.local.set({ userInputValueHistoryIndex: userInputValueHistory.length });
    });
  });
}

// Add input event listener to text area
function textAreaElementInputEventListener(event) {
  const inputForm = document.querySelector('form');
  if (!inputForm) return;
  const submitButton = inputForm.querySelector('textarea ~ button');
  if (submitButton) {
    if (event.target.value.trim().length > 0) {
      chrome.storage.local.get(['settings'], (result) => {
        const { settings } = result;
        const { selectedModel } = settings;
        submitButton.disabled = false;
        if (selectedModel.slug.startsWith('gpt-4')) {
          submitButton.style.backgroundColor = '#AB68FF';
        } else {
          submitButton.style.backgroundColor = '#19C37D';
        }
      });
    } else {
      submitButton.disabled = true;
      submitButton.style.backgroundColor = 'transparent';
    }
  }
  updateInputCounter(event.target.value);
  // input size
  if (disableTextInput && !isGenerating) {
    event.preventDefault();
    disableTextInput = false;
    return;
  }

  event.target.style.height = 'auto';
  event.target.style.height = `${event.target.scrollHeight}px`;
  if (event.target.scrollHeight > 200) {
    event.target.style.overflowY = 'scroll';
    event.target.scrollTop = event.target.scrollHeight;
  }

  // history
  chrome.storage.local.set({ textInputValue: event.target.value.trim() }, () => {
    chrome.storage.local.get(['userInputValueHistory'], (result) => {
      const userInputValueHistory = result.userInputValueHistory || [];
      // check if userInputValueHistory include event.target.value
      const existingInputValueIndex = userInputValueHistory.findIndex(
        (historyItem) => historyItem.inputValue.trim() === event.target.value.trim(),
      );
      if (existingInputValueIndex === -1) {
        chrome.storage.local.set({ unsavedUserInput: event.target.value.trim() });
      }
    });
  });
}
// Add keyboard event listener to text area
function textAreaElementKeydownEventListenerASync(event) {
  const textAreaElement = event.target;

  if (event.key === 'Enter' && event.which === 13 && !event.shiftKey) {
    updateInputCounter('');
    chrome.storage.local.get(['textInputValue'], (result) => {
      const textInputValue = result.textInputValue || '';
      if (textInputValue === '') return;
      const templateWords = textAreaElement.value.match(/{{(.*?)}}/g);
      if (!templateWords) {
        textAreaElement.style.height = '24px';
      }
      addUserPromptToHistory(textInputValue);
    });
  }
  // if press up arrow key, get last input value from local storage history
  if (event.key === 'ArrowUp') {
    // check if cursor is at position 0
    if (textAreaElement.selectionStart !== 0) return;
    // if there is text in the field save that first
    chrome.storage.local.get(['userInputValueHistoryIndex', 'settings', 'userInputValueHistory'], (result) => {
      const { settings } = result;
      if (settings && !settings.promptHistory) return;
      const userInputValueHistory = result.userInputValueHistory || [];
      if (userInputValueHistory.length === 0) return;
      let userInputValueHistoryIndex = result.userInputValueHistoryIndex || 0;
      userInputValueHistoryIndex = Math.max(userInputValueHistoryIndex - 1, 0);
      const lastInputValue = userInputValueHistory[userInputValueHistoryIndex];

      chrome.storage.local.set({ userInputValueHistoryIndex }, () => {
        if (lastInputValue) {
          // textAreaElement.style.height = `${lastInputValue.inputValue.split('\\n').length * 24}px`;
          textAreaElement.value = lastInputValue.inputValue;
          textAreaElement.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
    });
  }
  // if press down arrow key, get next input value from local storage history
  if (event.key === 'ArrowDown') {
    // check if cursor is at position end
    if (textAreaElement.selectionStart !== textAreaElement.value.length) return;
    // if there is text in the field save that first
    chrome.storage.local.get(['userInputValueHistoryIndex', 'settings', 'userInputValueHistory', 'unsavedUserInput'], (result) => {
      const { settings } = result;
      if (settings && !settings.promptHistory) return;
      let userInputValueHistoryIndex = result.userInputValueHistoryIndex || 0;
      const userInputValueHistory = result.userInputValueHistory || [];
      if (userInputValueHistory.length === 0) return;
      userInputValueHistoryIndex = Math.min(userInputValueHistoryIndex + 1, userInputValueHistory.length);
      chrome.storage.local.set({ userInputValueHistoryIndex }, () => {
        const nextInputValue = userInputValueHistory[userInputValueHistoryIndex];
        if (nextInputValue) {
          textAreaElement.style.height = `${nextInputValue.inputValue.split('\\n').length * 24}px`;
          textAreaElement.value = nextInputValue.inputValue;
        } else if (userInputValueHistory[userInputValueHistory.length - 1].inputValue !== '') {
          const unsavedUserInput = result.unsavedUserInput || '';
          if (textAreaElement.value !== unsavedUserInput) {
            textAreaElement.value = unsavedUserInput;
          }
        }
        textAreaElement.dispatchEvent(new Event('input', { bubbles: true }));
      });
    });
  }
  // space key
  if (event.keyCode === 32) {
    chrome.storage.local.get(['customPrompts'], (res) => {
      // find any word that starts with @ and ends with space
      // if the word is in customPrompts titles, replace it with the prompt.text
      const customPrompts = res.customPrompts || [];
      const textAreaValue = textAreaElement.value;
      const words = textAreaValue.split(/[\s\n]+/);
      const lastWord = words[words.length - 2];
      if (lastWord.startsWith('@')) {
        const prompt = customPrompts.find((p) => p.title.toLowerCase() === lastWord.substring(1).toLowerCase());
        if (prompt) {
          textAreaElement.value = textAreaValue.substring(0, textAreaValue.length - (lastWord.length + 1)) + prompt.text;
          textAreaElement.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    });
  }
}
// eslint-disable-next-line no-unused-vars
function textAreaElementKeydownEventListenerSync(event) {
  const textAreaElement = event.target;

  if (event.key === 'Enter' && event.which === 13 && !event.shiftKey) {
    event.preventDefault();
    event.stopPropagation();
    updateInputCounter('');
    chrome.storage.local.get(['textInputValue'], (result) => {
      const textInputValue = result.textInputValue || '';
      if (textInputValue === '') return;
      const templateWords = textAreaElement.value.match(/{{(.*?)}}/g);
      if (!templateWords) {
        textAreaElement.style.height = '24px';
      }
      addUserPromptToHistory(textInputValue);
    });
  }
  // if press up arrow key, get last input value from local storage history
  if (event.key === 'ArrowUp') {
    const quickAccessMenu = document.querySelector('#quick-access-menu');
    if (quickAccessMenu && quickAccessMenu.style.display !== 'none') {
      event.preventDefault();
      return;
    }
    // check if cursor is at position 0
    if (textAreaElement.selectionStart !== 0) return;
    // if there is text in the field save that first
    chrome.storage.local.get(['userInputValueHistoryIndex', 'settings', 'userInputValueHistory'], (result) => {
      const { settings } = result;
      if (settings && !settings.promptHistory) return;
      const userInputValueHistory = result.userInputValueHistory || [];
      if (userInputValueHistory.length === 0) return;
      let userInputValueHistoryIndex = result.userInputValueHistoryIndex || 0;
      userInputValueHistoryIndex = Math.max(userInputValueHistoryIndex - 1, 0);
      const lastInputValue = userInputValueHistory[userInputValueHistoryIndex];

      chrome.storage.local.set({ userInputValueHistoryIndex }, () => {
        if (lastInputValue) {
          // textAreaElement.style.height = `${lastInputValue.inputValue.split('\\n').length * 24}px`;
          textAreaElement.value = lastInputValue.inputValue;
          textAreaElement.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
    });
  }
  // if press down arrow key, get next input value from local storage history
  if (event.key === 'ArrowDown') {
    const quickAccessMenu = document.querySelector('#quick-access-menu');
    if (quickAccessMenu && quickAccessMenu.style.display !== 'none') {
      event.preventDefault();
      return;
    }
    // check if cursor is at position end
    if (textAreaElement.selectionStart !== textAreaElement.value.length) return;
    // if there is text in the field save that first
    chrome.storage.local.get(['userInputValueHistoryIndex', 'settings', 'userInputValueHistory', 'unsavedUserInput'], (result) => {
      const { settings } = result;
      if (settings && !settings.promptHistory) return;
      let userInputValueHistoryIndex = result.userInputValueHistoryIndex || 0;
      const userInputValueHistory = result.userInputValueHistory || [];
      if (userInputValueHistory.length === 0) return;
      userInputValueHistoryIndex = Math.min(userInputValueHistoryIndex + 1, userInputValueHistory.length);
      chrome.storage.local.set({ userInputValueHistoryIndex }, () => {
        const nextInputValue = userInputValueHistory[userInputValueHistoryIndex];
        if (nextInputValue) {
          textAreaElement.style.height = `${nextInputValue.inputValue.split('\\n').length * 24}px`;
          textAreaElement.value = nextInputValue.inputValue;
        } else if (userInputValueHistory[userInputValueHistory.length - 1].inputValue !== '') {
          const unsavedUserInput = result.unsavedUserInput || '';
          if (textAreaElement.value !== unsavedUserInput) {
            textAreaElement.value = unsavedUserInput;
          }
        }
        textAreaElement.dispatchEvent(new Event('input', { bubbles: true }));
      });
    });
  }
  // space key
  if (event.keyCode === 32) {
    const quickAccessMenuElement = document.querySelector('#quick-access-menu');
    if (quickAccessMenuElement) {
      quickAccessMenuElement.remove();
    }
    chrome.storage.local.get(['customPrompts'], (res) => {
      // find any word that starts with @ and ends with space
      // if the word is in customPrompts titles, replace it with the prompt.text
      const customPrompts = res.customPrompts || [];
      const textAreaValue = textAreaElement.value;
      const words = textAreaValue.split(/[\s\n]+/);
      const lastWord = words[words.length - 2];
      if (lastWord.startsWith('@')) {
        const prompt = customPrompts.find((p) => p.title.toLowerCase() === lastWord.substring(1).toLowerCase());
        if (prompt) {
          textAreaElement.value = textAreaValue.substring(0, textAreaValue.length - (lastWord.length + 1)) + prompt.text;
          textAreaElement.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    });
  }
  // timeout to capture last entered/removed character
  setTimeout(() => {
    updateQuickAccessMenuItems();
  }, 100);
  // @
  if (event.keyCode === 50) {
    // open the dropdown with custom prompts
    quickAccessMenu('@');
  }
  // #
  if (event.keyCode === 51) {
    // open the dropdown with prompt chains
    quickAccessMenu('#');
  }

  if (event.key === 'Backspace') {
    const cursorPosition = textAreaElement.selectionStart;
    // @
    const previousAtPosition = textAreaElement.value.lastIndexOf('@', cursorPosition);
    const previousHashtagPosition = textAreaElement.value.lastIndexOf('#', cursorPosition);
    const previousTrigger = previousAtPosition > previousHashtagPosition ? '@' : '#';
    const previousTriggerPosition = Math.max(previousAtPosition, previousHashtagPosition);

    if (previousTriggerPosition > -1 && cursorPosition - 1 > previousTriggerPosition && textAreaElement.value.lastIndexOf(' ', cursorPosition) < previousTriggerPosition) {
      const quickAccessMenuElement = document.querySelector('#quick-access-menu');
      if (!quickAccessMenuElement) {
        // get the word between the previous trigger and the cursor
        quickAccessMenu(previousTrigger);
      }
    } else {
      const quickAccessMenuElement = document.querySelector('#quick-access-menu');
      if (quickAccessMenuElement) {
        quickAccessMenuElement.remove();
      }
    }
  }
}

// eslint-disable-next-line no-unused-vars
function initializePromptHistory() {
  addButtonToNavFooter('My Prompt History', () => createPromptHistoryModal());
}
// eslint-disable-next-line no-unused-vars
function addAsyncInputEvents() {
  addInputCounter();
  const inputForm = document.querySelector('form');
  if (!inputForm) return;
  const textAreaElement = inputForm.querySelector('textarea');
  if (!textAreaElement) return;
  const submitButton = inputForm.querySelector('textarea ~ button');
  if (!submitButton) return;
  chrome.storage.local.get(['userInputValueHistory'], (result) => {
    chrome.storage.local.set({
      userInputValueHistoryIndex: result.userInputValueHistory?.length || 0,
      unsavedUserInput: '',
      textInputValue: textAreaElement?.value.trim() || '',
    });
  });

  // Add Click event listener to submit button
  if (submitButton) {
    submitButton.addEventListener('click', () => {
      const curTextAreaElement = inputForm.querySelector('textarea');
      const textInputValue = curTextAreaElement.value;
      // add text input value to local storage history
      if (textInputValue === '') return;
      textAreaElement.style.height = '24px';
      addUserPromptToHistory(textInputValue);
    });
  }

  if (textAreaElement) {
    textAreaElement.addEventListener('input', textAreaElementInputEventListener);
    textAreaElement.addEventListener('keydown', textAreaElementKeydownEventListenerASync);
  }
}
