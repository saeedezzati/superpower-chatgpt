/* global highlight, highlightBracket, addUserPromptToHistory, addButtonToNavFooter,createModal, debounce, toast, openSubmitPromptModal, dropdown, addDropdownEventListener, languageList, categoryList, sortByList, reportReasonList */

let promptLibraryPageNumber = 1;
let promptLibrarySearchTerm = '';
let promptLibraryMaxPageNumber = 0;

function createPromptLibraryModal() {
  chrome.storage.local.get(['settings']).then((result) => {
    const selectedLibrarySortBy = result.settings.selectedLibrarySortBy || { name: 'New', code: 'recent' };
    const selectedLibraryLanguage = result.settings.selectedLibraryLanguage || { name: 'All', code: 'all' };
    const selectedLibraryCategory = result.settings.selectedLibraryCategory || { name: 'All', code: 'all' };
    promptLibraryPageNumber = 1;
    promptLibrarySearchTerm = '';
    promptLibraryMaxPageNumber = 0;
    // fetch data
    chrome.runtime.sendMessage({
      getPrompts: true,
      detail: {
        pageNumber: promptLibraryPageNumber,
        searchTerm: promptLibrarySearchTerm,
        sortBy: selectedLibrarySortBy.code,
        language: selectedLibraryLanguage.code,
        category: selectedLibraryCategory.code,
      },
    }, (data) => {
      promptLibraryMaxPageNumber = data.count % 24 === 0 ? data.count / 24 : Math.floor(data.count / 24) + 1;
      // create settings modal content
      const bodyContent = promptLibraryModalContent(data);
      const actionsBarContent = promptLibraryModalActions();
      createModal('Community Prompts', `Find prompts shared by the community, and share your own prompts (${data.count} Prompts)`, bodyContent, actionsBarContent);
      const librarySearchInput = document.getElementById('library-search-input');
      librarySearchInput.focus();
      addReadMoreButtonsToLibrary();
    });
  });
}
function updateLibraryList(newElement) {
  const modalElement = document.getElementById('library-list');
  const modalElementParent = modalElement.parentElement;
  modalElement.replaceWith(newElement);
  // scroll to top
  modalElementParent.scrollTop = 0;
  // // highlight searched text
  // if (promptLibrarySearchTerm.trim().length > 0) {
  //   highlight(promptLibrarySearchTerm, 'library-list');
  // }
  addReadMoreButtonsToLibrary();
}
function addReadMoreButtonsToLibrary() {
  const libraryItemTexts = document.querySelectorAll('[id^="library-item-text-"]');
  libraryItemTexts.forEach((libraryItemText) => {
    const dataHidden = libraryItemText.dataset.hidden === 'true';
    if (!promptLibrarySearchTerm || dataHidden) {
      const id = libraryItemText.id.split('library-item-text-')[1];
      if (libraryItemText.offsetHeight < libraryItemText.scrollHeight) {
        const libraryList = document.getElementById('library-list');
        const existingLibraryItemReadMore = libraryList?.querySelector(`div[id=library-item-read-more-${id}]`);
        if (existingLibraryItemReadMore) existingLibraryItemReadMore.remove();
        const libraryItemReadMore = document.createElement('span');
        libraryItemReadMore.id = `library-item-read-more-${id}`;
        libraryItemReadMore.style = 'color: lightslategray; font-size:0.8em; width: 100%; margin-top: 8px; cursor: pointer;';

        libraryItemReadMore.textContent = dataHidden ? 'This is a private prompt. Full prompt is hidden by the autor.' : 'Show more';
        libraryItemReadMore.addEventListener('click', () => {
          if (dataHidden) return;
          if (libraryItemReadMore.textContent === 'Show less') {
            libraryItemText.style = 'color: #ececf1; font-size:0.8em; width: 100%; white-space: break-spaces; overflow-wrap: break-word;display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical; overflow: hidden;';
            libraryItemReadMore.textContent = 'Show more';
          } else {
            libraryItemText.style = 'color: #ececf1; font-size:0.8em; width: 100%; white-space: break-spaces; overflow-wrap: break-word;';
            libraryItemReadMore.textContent = 'Show less';
          }
        });
        libraryItemText.insertAdjacentElement('afterend', libraryItemReadMore);
      }
    }
  });
}
function promptLibraryListComponent(libraryData, loading = false) {
  const libraryList = document.createElement('div');
  libraryList.id = 'library-list';
  libraryList.style = 'display: flex; flex-direction: column; justify-content: start; align-items: center; height: 100%; width:100%;padding: 16px;overflow-y: scroll;';
  if (loading) {
    // show loading spinner
    const loadingSpinner = document.createElement('div');
    loadingSpinner.style = 'display: flex; justify-content: center; align-items: center; height: 100%; width: 100%;';
    loadingSpinner.innerHTML = '<div class="lds-grid"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>';
    libraryList.appendChild(loadingSpinner);
    return libraryList;
  }
  if (libraryData.results.length === 0) {
    // show loading spinner
    const noResult = document.createElement('div');
    noResult.style = 'display: flex; justify-content: center; align-items: center; height: 340px; width: 100%;color: lightslategray;';
    noResult.textContent = 'No results found';
    libraryList.appendChild(noResult);
    return libraryList;
  }
  libraryData.results.forEach((libraryPrompt) => {
    const libraryItem = document.createElement('div');
    libraryItem.id = `library-item-${libraryPrompt.id}`;
    libraryItem.classList = 'group';
    libraryItem.style = 'position:relative; display: flex; flex-direction: column; justify-content: space-between; align-items: start; width: 100%; margin: 8px 0; padding: 8px; background-color: #1f2123; border-radius: 8px;';
    libraryItem.addEventListener('mouseover', () => {
      libraryItem.style.backgroundColor = '#2f3133';
    });
    libraryItem.addEventListener('mouseout', () => {
      libraryItem.style.backgroundColor = '#1f2123';
    });
    // actions
    const libraryItemActionWrapper = document.createElement('div');
    libraryItemActionWrapper.id = `library-item-action-wrapper-${libraryPrompt.id}`;
    libraryItemActionWrapper.classList = 'visible';
    // libraryItemActionWrapper.classList = 'invisible group-hover:visible';
    libraryItemActionWrapper.style = 'position:absolute; top: 12px; right:4px; display: flex; justify-content: flex-end; align-items: center;';

    // flag
    const libraryItemFlag = document.createElement('span');
    libraryItemFlag.id = `library-item-flag-${libraryPrompt.id}`;
    libraryItemFlag.title = 'Report this prompt';
    libraryItemFlag.style = 'color: lightslategray; font-size:1.2em; margin-right: 8px; cursor: pointer;';
    libraryItemFlag.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="lightslategray" stroke="lightslategray" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" viewBox="0 0 512 512"><path d="M498.5 6.232c-19.76-11.99-38.92-3.226-41.61-1.1c-41.75 19.06-76.02 27.94-107.8 27.94c-28.92 0-51.74-7.321-75.9-15.09C247.5 8.844 220.1 .3094 185.2 .3055C159 .3055 121.3 2.641 32 38.84V16.01c0-8.836-7.164-15.1-16-15.1S0 7.172 0 16.01V496C0 504.8 7.164 512 16 512S32 504.8 32 496v-104.9c14.47-6.441 77.75-38.93 148.8-38.93c36.8 0 67.14 7.713 99.25 15.89c30.74 7.82 62.49 15.9 99.31 15.9c35.46 0 72.08-7.553 111.1-23.09c12.28-4.781 20.38-16.6 20.38-29.78L512 32.35C512 22.01 507.4 11.6 498.5 6.232zM479.7 331c-36.11 14.07-68.93 20.91-100.3 20.91c-32.81 0-61.26-7.238-91.39-14.9C255.4 328.7 221.7 320.2 180.8 320.2c-45.89 0-93.61 11.31-145.9 34.58L32 356.1V73.37l28.01-11.35c49.34-19.98 90.29-29.7 125.2-29.7c30.74 0 53.8 7.406 78.2 15.24c25.44 8.172 51.75 16.62 85.69 16.62c69.43 0 130.9-32.17 130.9-32.17L479.7 331z"/></svg>';
    libraryItemFlag.addEventListener('mouseenter', () => {
      libraryItemFlag.style.filter = 'brightness(2.5)';
    });
    libraryItemFlag.addEventListener('mouseleave', () => {
      libraryItemFlag.style.filter = 'unset';
    });
    libraryItemFlag.addEventListener('click', () => {
      // open report prompt modal
      openReportPromptModal(libraryPrompt);
    });

    // libraryItemActionWrapper.appendChild(libraryItemThumbsUp);
    // libraryItemActionWrapper.appendChild(libraryItemThumbsDown);
    libraryItemActionWrapper.appendChild(libraryItemFlag);

    libraryItem.appendChild(libraryItemActionWrapper);

    // title
    const libraryItemTitle = document.createElement('pre');
    libraryItemTitle.id = `library-item-title-${libraryPrompt.id}`;
    libraryItemTitle.dir = 'auto';
    libraryItemTitle.style = 'color: lightslategray; font-size:1em; font-weight: bold; width: 85%; white-space: break-spaces; overflow-wrap: break-word;margin-bottom: 8px;';
    libraryItemTitle.innerHTML = highlight(libraryPrompt.title, promptLibrarySearchTerm);
    libraryItem.appendChild(libraryItemTitle);
    // text
    const libraryItemText = document.createElement('pre');
    libraryItemText.id = `library-item-text-${libraryPrompt.id}`;
    libraryItemText.dir = 'auto';
    libraryItemText.dataset.hidden = libraryPrompt.hide_full_prompt;
    libraryItemText.style = `color: #ececf1; font-size:0.8em; width: 100%; white-space: break-spaces; ${(promptLibrarySearchTerm && !libraryPrompt.hide_full_prompt) ? '' : 'overflow-wrap: break-word;display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical; overflow: hidden;'}`;
    // highlight searched text
    libraryItemText.innerHTML = highlightBracket(highlight(libraryPrompt.text, promptLibrarySearchTerm));
    libraryItemText.title = libraryPrompt.text;
    libraryItem.appendChild(libraryItemText);

    const libraryItemCategories = document.createElement('div');
    libraryItemCategories.id = `library-item-categories-${libraryPrompt.id}`;
    libraryItemCategories.style = 'display:flex; justify-content: flex-start; align-items:center; width: 100%; margin-top: 12px;';
    // categories
    libraryPrompt.categories.forEach((category) => {
      const libraryItemCategory = document.createElement('span');
      libraryItemCategory.style = 'background-color: #0b0d0e; color:lightslategray; font-size:11px; border-radius: 4px; padding: 2px 8px; margin-right: 8px;cursor: pointer;';
      libraryItemCategory.textContent = category.replace(/_/g, ' ').toUpperCase();
      libraryItemCategory.addEventListener('mouseover', () => {
        libraryItemCategory.style.backgroundColor = '#000';
      });
      libraryItemCategory.addEventListener('mouseout', () => {
        libraryItemCategory.style.backgroundColor = '#0b0d0e';
      });
      libraryItemCategory.addEventListener('click', () => {
        const libraryCategoryOption = document.getElementById(`library-category-selector-option-${category.toLowerCase().replace(/ /g, '_')}`);
        libraryCategoryOption.click();
      });

      libraryItemCategories.appendChild(libraryItemCategory);
    });
    libraryItem.appendChild(libraryItemCategories);

    const libraryItemFooter = document.createElement('div');
    libraryItemFooter.id = `library-item-footer-${libraryPrompt.id}`;
    libraryItemFooter.style = 'display:flex; justify-content: space-between; align-items:flex-end; width: 100%; white-space: break-spaces; overflow-wrap: break-word;margin-top: 8px';
    // created by url
    const libraryItemInfoWrapper = document.createElement('span');
    libraryItemInfoWrapper.id = `library-item-info-wrapper-${libraryPrompt.id}`;
    libraryItemInfoWrapper.style = 'display: flex; align-items:flex-end; justify-content: start; color: lightslategray; font-size:0.8em; width: 100%; white-space: break-spaces; overflow-wrap: break-word;';
    const libraryItemCreatedBy = document.createElement('span');
    libraryItemCreatedBy.id = `library-item-created-by-${libraryPrompt.id}`;
    libraryItemCreatedBy.textContent = 'by ';
    libraryItemInfoWrapper.appendChild(libraryItemCreatedBy);
    const libraryItemCreatedByUrl = document.createElement('a');
    libraryItemCreatedByUrl.id = `library-item-created-by-url-${libraryPrompt.id}`;
    libraryItemCreatedByUrl.style = 'color: #919dd4; text-decoration:underline;max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';
    libraryItemCreatedByUrl.innerHTML = highlight(libraryPrompt.created_by?.nickname, promptLibrarySearchTerm);
    libraryItemCreatedByUrl.href = libraryPrompt.created_by?.url;
    libraryItemCreatedByUrl.target = '_blank';
    libraryItemCreatedByUrl.addEventListener('click', (e) => {
      if (e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        const librarySearchInput = document.getElementById('library-search-input');
        promptLibrarySearchTerm = libraryPrompt.created_by?.nickname;
        librarySearchInput.value = promptLibrarySearchTerm;
        setTimeout(() => {
          librarySearchInput.dispatchEvent(new Event('input'));
        }, 200);
      }
    });
    libraryItemInfoWrapper.appendChild(libraryItemCreatedByUrl);
    const libraryItemUseCount = document.createElement('span');
    libraryItemUseCount.id = `library-item-use-count-${libraryPrompt.id}`;
    libraryItemUseCount.title = `used ${libraryPrompt.num_used} times`;
    libraryItemUseCount.style = 'display:flex;color: lightslategray; margin-left: 24px;';
    libraryItemUseCount.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="lightslategray" stroke="lightslategray" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 mr-2" height="1em" width="1em" viewBox="0 0 448 512"><path d="M240 32C266.5 32 288 53.49 288 80V432C288 458.5 266.5 480 240 480H208C181.5 480 160 458.5 160 432V80C160 53.49 181.5 32 208 32H240zM240 80H208V432H240V80zM80 224C106.5 224 128 245.5 128 272V432C128 458.5 106.5 480 80 480H48C21.49 480 0 458.5 0 432V272C0 245.5 21.49 224 48 224H80zM80 272H48V432H80V272zM320 144C320 117.5 341.5 96 368 96H400C426.5 96 448 117.5 448 144V432C448 458.5 426.5 480 400 480H368C341.5 480 320 458.5 320 432V144zM368 432H400V144H368V432z"/></svg> ${libraryPrompt.num_used}`;
    libraryItemInfoWrapper.appendChild(libraryItemUseCount);

    // thumbs up
    const libraryItemThumbsUp = document.createElement('span');
    libraryItemThumbsUp.id = `library-item-thumbs-up-${libraryPrompt.id}`;
    libraryItemThumbsUp.title = 'Upvote this prompt';
    libraryItemThumbsUp.style = 'color: lightslategray; font-size:1.2em; margin-left: 24px; position:relative; bottom:4px; cursor: pointer;';
    libraryItemThumbsUp.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"> <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>';
    libraryItemThumbsUp.addEventListener('mouseenter', () => {
      libraryItemThumbsUp.style.color = '#eee';
    });
    libraryItemThumbsUp.addEventListener('mouseleave', () => {
      libraryItemThumbsUp.style.color = 'lightslategray';
    });
    libraryItemThumbsUp.addEventListener('click', () => {
      chrome.runtime.sendMessage({
        vote: true,
        detail: {
          promptId: libraryPrompt.id,
          voteType: 'up',
        },
      }, (data) => {
        if (data.status === 'success') {
          toast('Prompt upvoted');
          const curUpvoteCount = document.getElementById(`prompt-upvotes-count-${libraryPrompt.id}`);
          curUpvoteCount.textContent = parseInt(curUpvoteCount.textContent, 10) + 1;
        }
        if (data.status === 'same user') {
          toast('You have already voted for this prompt');
        }
      });
      const curLibraryItemActionWrapper = document.getElementById(`library-item-action-wrapper-${libraryPrompt.id}`);
      curLibraryItemActionWrapper.style.opacity = '0.3';
      curLibraryItemActionWrapper.style.pointerEvents = 'none';
    });
    libraryItemInfoWrapper.appendChild(libraryItemThumbsUp);

    // votes
    const libraryItemVoteCount = document.createElement('span');
    libraryItemVoteCount.id = `library-item-vote-count-${libraryPrompt.id}`;
    libraryItemVoteCount.title = `upvoted ${libraryPrompt.votes} times`;
    libraryItemVoteCount.style = 'display:flex;color: lightslategray; margin: 0 8px;';
    libraryItemVoteCount.innerHTML = `<span id="prompt-upvotes-count-${libraryPrompt.id}">${libraryPrompt.votes}</span>`;
    libraryItemInfoWrapper.appendChild(libraryItemVoteCount);

    // thumbs down
    const libraryItemThumbsDown = document.createElement('span');
    libraryItemThumbsDown.id = `library-item-thumbs-down-${libraryPrompt.id}`;
    libraryItemThumbsDown.title = 'Downvote this prompt';
    libraryItemThumbsDown.style = 'color: lightslategray; font-size:1.2em; cursor: pointer;';
    libraryItemThumbsDown.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"> <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path></svg>';
    libraryItemThumbsDown.addEventListener('mouseenter', () => {
      libraryItemThumbsDown.style.color = '#eee';
    });
    libraryItemThumbsDown.addEventListener('mouseleave', () => {
      libraryItemThumbsDown.style.color = 'lightslategray';
    });
    libraryItemThumbsDown.addEventListener('click', () => {
      chrome.runtime.sendMessage({
        vote: true,
        detail: {
          promptId: libraryPrompt.id,
          voteType: 'down',
        },
      }, (data) => {
        if (data.status === 'success') {
          toast('Prompt downvoted');
          const curUpvoteCount = document.getElementById(`prompt-upvotes-count-${libraryPrompt.id}`);
          curUpvoteCount.textContent = parseInt(curUpvoteCount.textContent, 10) - 1;
        }
        if (data.status === 'same user') {
          toast('You have already voted for this prompt');
        }
      });
      const curLibraryItemActionWrapper = document.getElementById(`library-item-action-wrapper-${libraryPrompt.id}`);
      curLibraryItemActionWrapper.style.opacity = '0.3';
      curLibraryItemActionWrapper.style.pointerEvents = 'none';
    });
    libraryItemInfoWrapper.appendChild(libraryItemThumbsDown);
    // Share
    const libraryItemShareButton = document.createElement('span');
    libraryItemShareButton.id = `library-item-share-button-${libraryPrompt.id}`;
    libraryItemShareButton.title = 'Share this prompt';
    libraryItemShareButton.style = 'display:flex;color: lightslategray; margin-left: 24px;position: relative;bottom:3px;cursor: pointer;';
    libraryItemShareButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" stroke="currentColor" fill="currentColor" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-5" height="1em" width="1em"><path d="M173 131.5C229.2 75.27 320.3 75.27 376.5 131.5C430 185 432.9 270.9 383 327.9L377.7 334C368.9 344 353.8 345 343.8 336.3C333.8 327.6 332.8 312.4 341.5 302.4L346.9 296.3C380.1 258.3 378.2 201.1 342.5 165.4C305.1 127.1 244.4 127.1 206.1 165.4L93.63 278.7C56.19 316.2 56.19 376.9 93.63 414.3C129.3 449.1 186.6 451.9 224.5 418.7L230.7 413.3C240.6 404.6 255.8 405.6 264.5 415.6C273.3 425.5 272.2 440.7 262.3 449.4L256.1 454.8C199.1 504.6 113.2 501.8 59.69 448.2C3.505 392.1 3.505 300.1 59.69 244.8L173 131.5zM467 380.5C410.8 436.7 319.7 436.7 263.5 380.5C209.1 326.1 207.1 241.1 256.9 184.1L261.6 178.7C270.3 168.7 285.5 167.7 295.5 176.4C305.5 185.1 306.5 200.3 297.8 210.3L293.1 215.7C259.8 253.7 261.8 310.9 297.4 346.6C334.9 384 395.6 384 433.1 346.6L546.4 233.3C583.8 195.8 583.8 135.1 546.4 97.7C510.7 62.02 453.4 60.11 415.5 93.35L409.3 98.7C399.4 107.4 384.2 106.4 375.5 96.44C366.7 86.47 367.8 71.3 377.7 62.58L383.9 57.22C440.9 7.348 526.8 10.21 580.3 63.76C636.5 119.9 636.5 211 580.3 267.2L467 380.5z"/></svg>';
    libraryItemShareButton.addEventListener('click', () => {
      // copy link to clipboard
      const el = document.createElement('textarea');
      el.value = `https://chat.openai.com?pid=${libraryPrompt.id}`;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      toast('Copied to clipboard');
    });
    libraryItemShareButton.addEventListener('mouseenter', () => {
      libraryItemShareButton.style.color = '#eee';
    });
    libraryItemShareButton.addEventListener('mouseleave', () => {
      libraryItemShareButton.style.color = 'lightslategray';
    });
    libraryItemInfoWrapper.appendChild(libraryItemShareButton);

    libraryItemFooter.appendChild(libraryItemInfoWrapper);

    // library item action buttons wrapper
    const libraryItemActionButtons = document.createElement('div');
    libraryItemActionButtons.style = 'display: flex; flex-direction: row; width: 100%; justify-content: end; align-items: end;margin-top:8px;position:relative;';
    const shiftClickText = document.createElement('div');
    shiftClickText.textContent = 'Shift + Click to run the prompt without editing';
    shiftClickText.style = 'font-size:10px;position:absolute;right:0px;bottom:36px;display:none;color:lightslategray;';
    // use button
    const libraryItemUseButton = document.createElement('button');
    libraryItemUseButton.classList = 'btn flex justify-center gap-2 btn-dark border-0 md:border';
    libraryItemUseButton.style = 'font-size:0.7em; padding:4px 8px; margin-left:8px;width:60px;color:lightgray;';
    libraryItemUseButton.textContent = 'Use';
    libraryItemUseButton.addEventListener('mouseover', () => {
      shiftClickText.style = 'font-size:10px;position:absolute;right:0px;bottom:36px;color:lightslategray;';
    });
    libraryItemUseButton.addEventListener('mouseout', () => {
      shiftClickText.style = 'font-size:10px;position:absolute;right:0px;bottom:36px;display:none;color:lightslategray;';
    });
    libraryItemUseButton.addEventListener('click', (event) => {
      const inputForm = document.querySelector('form');
      if (!inputForm) return;
      const submitButton = inputForm.querySelector('textarea ~ button');
      if (!submitButton) return;
      const textAreaElement = inputForm.querySelector('textarea');
      if (!textAreaElement) return;
      textAreaElement.value = libraryPrompt.text;
      addUserPromptToHistory(libraryPrompt.text);
      textAreaElement.focus();
      textAreaElement.dispatchEvent(new Event('input', { bubbles: true }));
      textAreaElement.dispatchEvent(new Event('change', { bubbles: true }));
      if (event.shiftKey || libraryPrompt.hide_full_prompt) {
        setTimeout(() => {
          submitButton.click();
        }, 300);
      }
      document.querySelector('button[id="modal-close-button-community-prompts"]').click();
      chrome.runtime.sendMessage({
        incrementUseCount: true,
        detail: {
          promptId: libraryPrompt.id,
        },
      });
    });
    // edit button
    const libraryItemEditButton = document.createElement('button');
    libraryItemEditButton.classList = 'btn flex justify-center gap-2 btn-dark border-0 md:border';
    libraryItemEditButton.style = 'font-size:0.7em; padding:4px 8px; margin-left:8px;width:60px;color:lightgray;';
    libraryItemEditButton.textContent = 'Edit';
    libraryItemEditButton.addEventListener('click', () => {
      openSubmitPromptModal(libraryPrompt.text, libraryPrompt.model_slug, libraryPrompt.id, libraryPrompt.title, libraryPrompt.categories, libraryPrompt.language, true, libraryPrompt.hide_full_prompt);
    });
    // delete button
    const libraryItemDeleteButton = document.createElement('button');
    libraryItemDeleteButton.classList = 'btn flex justify-center gap-2 btn-dark border-0 md:border';
    libraryItemDeleteButton.style = 'font-size:0.7em; padding:4px 8px; margin-left:8px;width:60px;color:lightgray;';
    libraryItemDeleteButton.textContent = 'Delete';
    libraryItemDeleteButton.addEventListener('click', (e) => {
      if (e.target.textContent === 'Confirm') {
        chrome.runtime.sendMessage({
          deletePrompt: true,
          detail: {
            promptId: libraryPrompt.id,
          },
        });
        // remove the item from the list
        const deletedLibraryItem = document.querySelector(`#library-item-${libraryPrompt.id}`);
        deletedLibraryItem.style.display = 'none';
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

    chrome.storage.sync.get(['user_id'], (res) => {
      if (res.user_id === libraryPrompt?.created_by?.id) {
        libraryItemActionButtons.appendChild(libraryItemDeleteButton);
        libraryItemActionButtons.appendChild(libraryItemEditButton);
      }
      if (!libraryPrompt.hide_full_prompt) libraryItemActionButtons.appendChild(shiftClickText);
      libraryItemActionButtons.appendChild(libraryItemUseButton);
    });
    libraryItemFooter.appendChild(libraryItemActionButtons);

    libraryItem.appendChild(libraryItemFooter);
    libraryList.appendChild(libraryItem);
  });
  return libraryList;
}
function fetchPrompts(newPageNumber = 1) {
  chrome.storage.local.get(['settings'], ({ settings }) => {
    const { selectedLibrarySortBy, selectedLibraryCategory, selectedLibraryLanguage } = settings;
    chrome.runtime.sendMessage({
      getPrompts: true,
      detail: {
        pageNumber: newPageNumber,
        searchTerm: promptLibrarySearchTerm,
        sortBy: selectedLibrarySortBy.code,
        language: selectedLibraryLanguage.code,
        category: selectedLibraryCategory.code,
      },
    }, (data) => {
      promptLibraryMaxPageNumber = data.count % 24 === 0 ? data.count / 24 : Math.floor(data.count / 24) + 1;
      const listComponent = promptLibraryListComponent(data);
      updateLibraryList(listComponent);
      promptLibraryPageNumber = newPageNumber;
      updatePageButtons();
    });
  });
}
function toggleReportSubmitButton(selectedOption) {
  const reportModalSubmitButton = document.querySelector('#report-modal-submit-button');
  if (selectedOption.code === 'select') {
    reportModalSubmitButton.disabled = true;
  } else {
    reportModalSubmitButton.disabled = false;
  }
}
function openReportPromptModal(libraryPrompt) {
  const reportModal = document.createElement('div');
  document.body.appendChild(reportModal);

  reportModal.style = 'position:fixed;top:0px;left:0px;width:100%;height:100%;background-color:rgba(0,0,0,0.5);z-index:10010;display:flex;align-items:center;justify-content:center;color:lightslategray;';
  reportModal.id = 'report-modal';
  reportModal.addEventListener('click', (e) => {
    if (e.target.id === 'report-modal') {
      reportModal.remove();
    }
  });
  const reportModalContent = document.createElement('div');
  reportModalContent.style = 'width:400px;min-height:300px;background-color:#0b0d0e;border-radius:8px;padding:16px;display:flex;flex-direction:column;align-items:flex-start;justify-content:start;border:solid 1px lightslategray;';
  reportModal.appendChild(reportModalContent);
  const reportModalTitle = document.createElement('div');
  reportModalTitle.style = 'font-size:1.25rem;font-weight:500;';
  reportModalTitle.textContent = 'Report prompt';
  reportModalContent.appendChild(reportModalTitle);

  const reportModalResonTitle = document.createElement('div');
  reportModalResonTitle.style = 'font-size:0.875rem;font-weight:500;margin-top:32px;';
  reportModalResonTitle.textContent = 'Why are you reporting this prompt?';
  reportModalContent.appendChild(reportModalResonTitle);
  // add dropdown for reasons
  const reasonSelectorWrapper = document.createElement('div');
  reasonSelectorWrapper.style = 'position:relative;width:100%;z-index:1000;margin-top:16px;';
  reasonSelectorWrapper.innerHTML = dropdown('Report-Reason', reportReasonList, reportReasonList[0], 'left', true);
  reportModalContent.appendChild(reasonSelectorWrapper);
  addDropdownEventListener('Report-Reason', reportReasonList, (selectedOption) => toggleReportSubmitButton(selectedOption), true);
  // add cancel submit button
  const reportModalButtonWrapper = document.createElement('div');
  reportModalButtonWrapper.style = 'display:flex;justify-content:flex-end;align-items:center;width:100%;margin-top:32px;';
  reportModalContent.appendChild(reportModalButtonWrapper);
  const reportModalCancelButton = document.createElement('button');
  reportModalCancelButton.classList = 'btn btn-dark border-0';
  reportModalCancelButton.style = 'font-size:0.875rem;font-weight:500;padding:8px 16px;margin-right:16px;';
  reportModalCancelButton.textContent = 'Cancel';
  reportModalCancelButton.addEventListener('click', () => {
    reportModal.remove();
  });
  reportModalButtonWrapper.appendChild(reportModalCancelButton);
  const reportModalSubmitButton = document.createElement('button');
  reportModalSubmitButton.classList = 'btn btn-primary border-0';
  reportModalSubmitButton.id = 'report-modal-submit-button';
  reportModalSubmitButton.disabled = true;
  reportModalSubmitButton.style = 'font-size:0.875rem;font-weight:500;padding:8px 16px;';
  reportModalSubmitButton.textContent = 'Submit';
  reportModalSubmitButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({
      report: true,
      detail: {
        promptId: libraryPrompt.id,
      },
    }, (data) => {
      if (data.status === 'success') {
        toast('Prompt reported');
      }
      if (data.status === 'same user') {
        toast('You have already reported this prompt');
      }
    });
    reportModal.remove();
    const curLibraryItemActionWrapper = document.getElementById(`library-item-action-wrapper-${libraryPrompt.id}`);
    curLibraryItemActionWrapper.style.opacity = '0.3';
    curLibraryItemActionWrapper.style.pointerEvents = 'none';
  });
  reportModalButtonWrapper.appendChild(reportModalSubmitButton);
}
function promptLibraryModalContent(libraryData) {
  // create library modal content
  const content = document.createElement('div');
  content.id = 'modal-content-library';
  content.style = 'display: flex; flex-direction: column; justify-content: space-between; align-items: center;overflow-y: hidden;height:100%;';
  const libraryList = promptLibraryListComponent(libraryData);
  // library filter
  const libraryFilterElement = document.createElement('div');
  libraryFilterElement.style = 'display: flex; flex-direction: row; justify-content: space-between; align-items: center; width: 100%; padding: 6px 12px; background-color: #778899; z-index: 100; position: sticky; top: 0;';

  // add library search box
  const librarySearchInput = document.createElement('input');
  librarySearchInput.type = 'search';
  librarySearchInput.style = 'background-color: #1f2123; color: lightslategray; font-size:0.8em; border-radius: 4px; border: 1px solid lightslategray; padding:4px 8px; width: 100%;height:46px;';
  librarySearchInput.placeholder = 'Search by prompt title, prompt text or author name';
  librarySearchInput.id = 'library-search-input';
  librarySearchInput.autocomplete = 'off';

  const delayedSearch = debounce((e) => {
    const { value } = e.target;
    promptLibrarySearchTerm = value;
    promptLibraryPageNumber = 1;
    fetchPrompts(promptLibraryPageNumber);
  });
  librarySearchInput.addEventListener('input', (e) => {
    if (e.target.value.trim().length > 2) {
      const listComponent = promptLibraryListComponent(libraryData, true);
      updateLibraryList(listComponent);
      delayedSearch(e);
    } else if (e.target.value.length === 0) {
      promptLibrarySearchTerm = '';
      promptLibraryPageNumber = 1;
      fetchPrompts(promptLibraryPageNumber);
    }
  });
  libraryFilterElement.appendChild(librarySearchInput);
  chrome.storage.local.get(['settings'], (result) => {
    const { settings } = result;
    const { selectedLibrarySortBy } = settings;
    const sortBySelectorWrapper = document.createElement('div');
    sortBySelectorWrapper.style = 'position:relative;width:150px;z-index:1000;margin-left:8px;';
    sortBySelectorWrapper.innerHTML = dropdown('Library-SortBy', sortByList, selectedLibrarySortBy, 'right', true);
    libraryFilterElement.appendChild(sortBySelectorWrapper);
    addDropdownEventListener('Library-SortBy', sortByList, () => fetchPrompts(1), true);
  });
  chrome.storage.local.get(['settings'], (result) => {
    const { settings } = result;
    const { selectedLibraryCategory } = settings;
    const categorySelectorWrapper = document.createElement('div');
    categorySelectorWrapper.style = 'position:relative;width:150px;z-index:1000;margin-left:8px;';
    categorySelectorWrapper.innerHTML = dropdown('Library-Category', categoryList, selectedLibraryCategory, 'right', true);
    libraryFilterElement.appendChild(categorySelectorWrapper);
    addDropdownEventListener('Library-Category', categoryList, () => fetchPrompts(1), true);
  });
  chrome.storage.local.get(['settings'], (result) => {
    const { settings } = result;
    const { selectedLibraryLanguage } = settings;
    const libraryLanguageList = [{ code: 'all', name: 'All' }, ...languageList.slice(1)];
    const languageSelectorWrapper = document.createElement('div');
    languageSelectorWrapper.style = 'position:relative;width:150px;z-index:1000;margin-left:8px;';
    languageSelectorWrapper.innerHTML = dropdown('Library-Language', libraryLanguageList, selectedLibraryLanguage, 'right', true);
    libraryFilterElement.appendChild(languageSelectorWrapper);
    addDropdownEventListener('Library-Language', libraryLanguageList, () => fetchPrompts(1), true);
  });
  // add next/previous page buttons
  const pageButtonsWrapper = document.createElement('div');
  pageButtonsWrapper.id = 'library-page-buttons-wrapper';
  pageButtonsWrapper.style = 'display: flex; flex-direction: row; flex-wrap:wrap;justify-content: center; align-items: center;margin:8px 0;width: 100%; position:relative;';
  const pageNumberElement = document.createElement('span');
  pageNumberElement.id = 'library-page-number';
  pageNumberElement.style = 'color: lightslategray; font-size:0.8em; width: 100%; text-align: center;';
  pageNumberElement.textContent = `Page ${promptLibraryPageNumber} of ${promptLibraryMaxPageNumber}`;
  pageButtonsWrapper.appendChild(pageNumberElement);

  const previousPageButton = document.createElement('button');
  previousPageButton.id = 'library-previous-page-button';
  previousPageButton.classList = 'btn flex justify-center gap-2 btn-dark border-0 md:border';
  previousPageButton.style = 'font-size:0.7em; padding:4px 8px; margin-left:8px;width:60px;color:lightgray;';

  previousPageButton.disabled = true;

  previousPageButton.textContent = 'Previous';
  previousPageButton.addEventListener('click', () => {
    promptLibraryPageNumber = Math.max(promptLibraryPageNumber - 1, 1);
    nextPageButton.disabled = false;
    nextPageButton.style.cursor = 'pointer';
    nextPageButton.style.opacity = '1';
    if (promptLibraryPageNumber === 1) {
      previousPageButton.disabled = true;
      previousPageButton.style.cursor = 'default';
      previousPageButton.style.opacity = '0.5';
    } else {
      previousPageButton.disabled = false;
      previousPageButton.style.cursor = 'pointer';
      previousPageButton.style.opacity = '1';
    }
    fetchPrompts(promptLibraryPageNumber);
    pageNumberElement.textContent = `Page ${promptLibraryPageNumber} of ${promptLibraryMaxPageNumber}`;
  });
  pageButtonsWrapper.appendChild(previousPageButton);
  const nextPageButton = document.createElement('button');
  nextPageButton.id = 'library-next-page-button';
  nextPageButton.classList = 'btn flex justify-center gap-2 btn-dark border-0 md:border';
  nextPageButton.style = 'font-size:0.7em; padding:4px 8px; margin-left:8px;width:60px;color:lightgray;';
  nextPageButton.textContent = 'Next';
  nextPageButton.addEventListener('click', () => {
    promptLibraryPageNumber = Math.min(promptLibraryPageNumber + 1, promptLibraryMaxPageNumber);
    previousPageButton.disabled = false;
    previousPageButton.style.cursor = 'pointer';
    previousPageButton.style.opacity = '1';
    if (promptLibraryPageNumber === promptLibraryMaxPageNumber) {
      nextPageButton.disabled = true;
      nextPageButton.style.cursor = 'default';
      nextPageButton.style.opacity = '0.5';
    }
    fetchPrompts(promptLibraryPageNumber);
    pageNumberElement.textContent = `Page ${promptLibraryPageNumber} of ${promptLibraryMaxPageNumber}`;
  });
  pageButtonsWrapper.appendChild(nextPageButton);

  // submit prompt button
  const submitPromptButton = document.createElement('button');
  submitPromptButton.classList = 'btn flex justify-center gap-2 btn-primary border-0 md:border';
  submitPromptButton.style = 'font-size:0.8em; padding:4px 8px; margin-left:8px;position: absolute;right: 24px;bottom: 0;';
  submitPromptButton.textContent = '+ Share a prompt';
  submitPromptButton.addEventListener('click', () => {
    openSubmitPromptModal('', '', null, '', [], '', true);
  });
  pageButtonsWrapper.appendChild(submitPromptButton);

  content.appendChild(libraryFilterElement);
  content.appendChild(libraryList);
  content.appendChild(pageButtonsWrapper);
  return content;
}
function updatePageButtons() {
  const previousPageButton = document.querySelector('button[id="library-previous-page-button"]');
  const nextPageButton = document.querySelector('button[id="library-next-page-button"]');
  if (promptLibraryPageNumber === 1) {
    previousPageButton.disabled = true;
    previousPageButton.style.opacity = 0.5;
    previousPageButton.style.cursor = 'default';
  } else {
    previousPageButton.disabled = false;
    previousPageButton.style.opacity = 1;
    previousPageButton.style.cursor = 'pointer';
  }
  if (promptLibraryPageNumber >= promptLibraryMaxPageNumber) {
    nextPageButton.disabled = true;
    nextPageButton.style.cursor = 'default';
    nextPageButton.style.opacity = 0.5;
  } else {
    nextPageButton.disabled = false;
    nextPageButton.style.cursor = 'pointer';
    nextPageButton.style.opacity = 1;
  }
  const pageNumberElement = document.querySelector('span[id="library-page-number"]');
  pageNumberElement.textContent = `Page ${promptLibraryPageNumber} of ${promptLibraryMaxPageNumber}`;
}
function promptLibraryModalActions() {
  // add actionbar at the bottom of the content
  const actionBar = document.createElement('div');
  return actionBar;
}
// eslint-disable-next-line no-unused-vars
function initializePromptLibrary() {
  promptLibraryPageNumber = 1;
  promptLibrarySearchTerm = '';
  promptLibraryMaxPageNumber = 0;
  // create library button
  addButtonToNavFooter('Community Prompts', () => createPromptLibraryModal());
}
