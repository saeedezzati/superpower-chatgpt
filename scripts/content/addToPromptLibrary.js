/* global fetchPrompts, promptLibraryPageNumber, toast, categoryList, languageList, addDropdownEventListener, dropdown */
//
let selectedCategories = [];
function createCategorySelector(categories = []) {
  selectedCategories = categories;
  const categorySelectorSection = document.createElement('div');
  categorySelectorSection.style = 'display:flex;flex-direction:column;align-items:start;justify-content:start;width:100%;';
  const title = document.createElement('div');
  title.style = 'color:lightslategray;font-size:.75rem;margin-top: 16px;margin-bottom: 2px;';
  title.id = 'category-selector-title';
  title.textContent = 'Categories (select up to 3)';
  categorySelectorSection.appendChild(title);

  const categoryContainer = document.createElement('div');
  for (let i = 0; i < categoryList.length; i += 1) {
    const category = categoryList[i].name;
    if (category.toLowerCase() === 'all') continue;
    categoryContainer.style = 'display:flex;align-items:center;justify-content:start;margin-top: 8px;flex-wrap:wrap;';
    const categoryBox = document.createElement('div');
    categoryBox.id = `category-${category}`;
    categoryBox.style = 'font-size:13px; color:lightslategray; cursor:pointer; padding:4px 8px; border-radius:4px; border: solid 1px lightslategray; margin: 0 8px 8px 0;';
    if (selectedCategories.includes(categoryList[i].code)) {
      categoryBox.style.color = 'white';
      categoryBox.style.backgroundColor = '#10a37f';
    }

    categoryBox.textContent = category;
    // eslint-disable-next-line no-loop-func
    categoryBox.addEventListener('click', () => {
      title.style.color = 'lightslategray';
      if (selectedCategories.length >= 3 && categoryBox.style.color === 'lightslategray') {
        toast('You can only select up to 3 categories');
        return;
      }
      if (categoryBox.style.color === 'lightslategray') {
        categoryBox.style.color = 'white';
        categoryBox.style.backgroundColor = '#10a37f';
        selectedCategories.push(category);
      } else {
        categoryBox.style.color = 'lightslategray';
        categoryBox.style.backgroundColor = 'transparent';
        selectedCategories.splice(selectedCategories.indexOf(category), 1);
      }
    });
    categoryContainer.appendChild(categoryBox);
  }
  categorySelectorSection.appendChild(categoryContainer);
  return categorySelectorSection;
}
function inputTitle(text) {
  const title = document.createElement('div');
  title.style = 'color:lightslategray;font-size:.75rem;margin-top: 16px;margin-bottom: 2px;';
  title.textContent = text;
  return title;
}
function validateFields() {
  const promptText = document.getElementById('prompt-text');
  const promptTitle = document.getElementById('prompt-title-input');
  const categoriesSelectorTitle = document.getElementById('category-selector-title');
  const nickname = document.getElementById('nickname-input');
  const url = document.getElementById('url-input');
  let valid = true;
  if (promptText?.value.trim().length === 0) {
    promptText.style.border = 'solid 1px #ef4146';
    valid = false;
  }
  if (promptTitle?.value.trim().length === 0) {
    promptTitle.style.border = 'solid 1px #ef4146';
    valid = false;
  }
  if (nickname?.value.trim().length === 0) {
    nickname.style.border = 'solid 1px #ef4146';
    valid = false;
  }
  if (url?.value.trim().length === 0) {
    url.style.border = 'solid 1px #ef4146';
    valid = false;
  }
  if (selectedCategories.length === 0) {
    categoriesSelectorTitle.style.color = '#ef4146';
    valid = false;
  }
  return valid;
}

// eslint-disable-next-line no-unused-vars
function openSubmitPromptModal(text = '', modelSlug = '', promptId = null, title = '', categories = [], language = '', refreshPromptLibrary = false, hideFullPrompt = false) {
  selectedCategories = categories;
  const submitPromptModal = document.createElement('div');
  submitPromptModal.style = 'position:fixed;top:0px;left:0px;width:100%;height:100%;background-color:rgba(0,0,0,0.7);z-index:1000;display:flex;align-items:center;justify-content:center;z-index:10001;overflow-y: scroll; max-height: 100vh;';
  submitPromptModal.id = 'submit-prompt-modal';
  submitPromptModal.addEventListener('click', (e) => {
    if (e.target.id === 'submit-prompt-modal') {
      submitPromptModal.remove();
    }
  });
  const submitPromptModalContent = document.createElement('div');
  submitPromptModalContent.style = 'width:800px;max-width:90%;background-color:#0b0d0e;border-radius:4px;padding:16px;display:flex;flex-direction:column;align-items:start;justify-content:start;border:solid 2px lightslategray;';
  submitPromptModalContent.id = 'submit-prompt-modal-content';
  const modalTitle = document.createElement('div');
  modalTitle.style = 'color:white;font-size:1.25rem;margin-bottom: 8px;';
  modalTitle.textContent = promptId ? 'Update prompt' : 'Share a prompt with the community';
  submitPromptModalContent.appendChild(modalTitle);
  const languageRowWrapper = document.createElement('div');
  languageRowWrapper.style = 'display:flex;align-items:start;justify-content:space-between;width:100%;margin-top: 16px;';

  const languageSelectorLabel = document.createElement('div');
  languageSelectorLabel.id = 'language-selector-label';
  languageSelectorLabel.style = 'color:lightslategray;font-size:16px;';
  languageSelectorLabel.textContent = 'What is the language of this prompt?';
  const languageSelectorWrapper = document.createElement('div');
  languageSelectorWrapper.style = 'position:relative;width:170px;z-index:1000;';
  chrome.storage.local.get(['settings'], (result) => {
    const { settings } = result;
    let { selectedPromptLanguage } = settings;
    if (language) {
      selectedPromptLanguage = languageList.find((l) => l.code === language);
    }
    const promptLanguageList = [{ code: 'select', name: 'Select' }, ...languageList.slice(1)];
    languageSelectorWrapper.innerHTML = dropdown('Prompt-Language', promptLanguageList, selectedPromptLanguage, 'right', true);
    addDropdownEventListener('Prompt-Language', promptLanguageList);
    const languageSelector = document.getElementById('prompt-language-selector-button');
    languageSelector.addEventListener('click', () => {
      languageSelectorLabel.style.color = 'lightslategray';
    });
  });
  languageRowWrapper.appendChild(languageSelectorLabel);
  languageRowWrapper.appendChild(languageSelectorWrapper);

  submitPromptModalContent.appendChild(languageRowWrapper);

  submitPromptModalContent.appendChild(inputTitle('Prompt'));
  const textToSubmit = document.createElement('textarea');
  textToSubmit.id = 'prompt-text';
  textToSubmit.style = 'min-height: 120px;width:100%;background-color:#0b0d0e;border:1px solid #565869;border-radius:4px;color:white;resize:none;';
  textToSubmit.value = text.trim();
  textToSubmit.rows = 4;
  textToSubmit.addEventListener('input', () => {
    textToSubmit.style.border = '1px solid #565869';
  });
  submitPromptModalContent.appendChild(textToSubmit);
  // add input fields for prompt tile, submitter nickname and submitter url
  submitPromptModalContent.appendChild(inputTitle('Prompt title'));
  const promptTitleInput = document.createElement('input');
  promptTitleInput.style = 'width:100%;height:40px;background-color:#0b0d0e;border:1px solid #565869;border-radius:4px;color:white;padding: 12px;';
  promptTitleInput.id = 'prompt-title-input';
  promptTitleInput.placeholder = 'Prompt Title';
  promptTitleInput.value = title.trim();
  promptTitleInput.addEventListener('input', () => {
    promptTitleInput.style.border = '1px solid #565869';
  });
  submitPromptModalContent.appendChild(promptTitleInput);
  // categories
  submitPromptModalContent.appendChild(createCategorySelector(categories));
  submitPromptModalContent.appendChild(inputTitle('Name'));
  const nicknameInput = document.createElement('input');
  nicknameInput.style = 'width:100%;height:40px;background-color:#0b0d0e;border:1px solid #565869;border-radius:4px;color:white;padding: 12px;';
  nicknameInput.id = 'nickname-input';
  nicknameInput.placeholder = 'Enter your name';
  nicknameInput.addEventListener('input', () => {
    nicknameInput.style.border = '1px solid #565869';
  });
  // only allow letters in nickname input
  nicknameInput.addEventListener('keypress', (e) => {
    const regex = /^[a-zA-Z ]+$/;
    const str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
    if (regex.test(str)) {
      return true;
    }
    e.preventDefault();
    return false;
  });
  // same thing for paste
  nicknameInput.addEventListener('paste', (e) => {
    const regex = /^[a-zA-Z ]+$/;
    const str = e.clipboardData.getData('text/plain');
    if (regex.test(str)) {
      return true;
    }
    e.preventDefault();
    return false;
  });

  submitPromptModalContent.appendChild(nicknameInput);
  submitPromptModalContent.appendChild(inputTitle('URL'));
  const urlInput = document.createElement('input');
  urlInput.style = 'width:100%;height:40px;background-color:#0b0d0e;border:1px solid #565869;border-radius:4px;color:white;padding: 12px;';
  urlInput.id = 'url-input';
  urlInput.placeholder = 'https://... Your Twitter, Github, personal website, etc.';
  urlInput.addEventListener('input', () => {
    urlInput.style.border = '1px solid #565869';
  });
  submitPromptModalContent.appendChild(urlInput);
  submitPromptModal.appendChild(submitPromptModalContent);
  chrome.storage.sync.get(['nickname', 'url'], (result) => {
    if (result.nickname && !result.nickname.includes('@')) {
      nicknameInput.value = result.nickname;
    }
    if (result.url) {
      urlInput.value = result.url;
    }
    urlInput.style.border = '1px solid #565869';
  });
  // const hideFullPromptSwitch = createSwitch('Hide full prompt', 'Only show the first 5 lines of the prompt to other users', null, hideFullPrompt);
  // submitPromptModalContent.appendChild(hideFullPromptSwitch);

  // modal action wrapper
  const submitPromptModalActionWrapper = document.createElement('div');
  submitPromptModalActionWrapper.style = 'display:flex;align-items:center;justify-content:space-between;width:100%;margin-top:auto;';
  submitPromptModalContent.appendChild(submitPromptModalActionWrapper);
  // add cancel button
  const cancelButton = document.createElement('button');
  cancelButton.style = 'width:100%;height:40px;background-color:#0b0d0e;border:1px solid #565869;border-radius:4px;color:white;margin-top:16px;margin-right:8px;';
  cancelButton.textContent = 'Cancel';
  cancelButton.addEventListener('click', () => {
    submitPromptModal.remove();
  });
  submitPromptModalActionWrapper.appendChild(cancelButton);

  // add submit button
  const submitButton = document.createElement('button');
  submitButton.style = 'width:100%;height:40px;background-color:#0b0d0e;border:1px solid #565869;border-radius:4px;color:white;margin-top:16px;margin-left:8px;';
  submitButton.id = 'submit-prompt-button';
  submitButton.textContent = promptId ? 'Update' : 'Submit';
  submitButton.addEventListener('click', () => {
    submitButton.disabled = true;
    if (!validateFields()) {
      submitButton.disabled = false;
      return;
    }
    chrome.storage.local.get(['settings'], (res) => {
      chrome.storage.sync.get(['openai_id'], (result) => {
        if (!res.settings.selectedPromptLanguage.code || res.settings.selectedPromptLanguage.code === 'select') {
          const curLanguageSelectorLabel = document.getElementById('language-selector-label');
          curLanguageSelectorLabel.style.color = '#ef4146';
          submitButton.disabled = false;
          return;
        }
        const curHideFullPromptSwitch = document.getElementById('switch-hide-full-prompt');
        chrome.runtime.sendMessage({
          submitPrompt: true,
          detail: {
            openAiId: result.openai_id, prompt: textToSubmit.value, promptTitle: promptTitleInput.value, categories: selectedCategories, promptLangage: res.settings.selectedPromptLanguage.code, modelSlug, nickname: nicknameInput.value, url: urlInput.value, hideFullPrompt: curHideFullPromptSwitch?.checked || false, promptId,
          },
        }, (data) => {
          // show toast that prompt is submitted
          if (Object.keys(data).join(',').includes('error')) {
            if (Object.values(data).join(',').includes('unique_title')) {
              toast('Error: You have already submitted a prompt with this title. Please try again with a different title.', 'error');
              return;
            }
            if (Object.values(data).join(',').includes('gptx_prompt_text_hash_archived')) {
              toast('Error: This prompt has been submitted previously. Please try a different prompt.', 'error');
              return;
            }
            toast('Something went wrong. Please try again.', 'error');
            return;
          }
          toast('Prompt submitted!');
          submitPromptModal.remove();
          if (refreshPromptLibrary) {
            fetchPrompts(promptLibraryPageNumber);
          }
        });
      });
    });
  });
  submitPromptModalActionWrapper.appendChild(submitButton);
  document.body.appendChild(submitPromptModal);
}
function addSubmitButtonToUserInputs(editButton) {
  const userInputWrapper = editButton.parentElement.parentElement;
  const existingAddToPromptLibraryButton = userInputWrapper.querySelector('#add-to-prompt-library-button');
  if (existingAddToPromptLibraryButton) return;
  const addToPromptLibraryButton = editButton.cloneNode(true);
  addToPromptLibraryButton.id = 'add-to-prompt-library-button';
  // replace the addToPromptLibraryButton icon with new svg
  const addToPromptLibraryButtonSVG = addToPromptLibraryButton.querySelector('svg');
  addToPromptLibraryButtonSVG.innerHTML = '<path d="M432 256C432 269.3 421.3 280 408 280h-160v160c0 13.25-10.75 24.01-24 24.01S200 453.3 200 440v-160h-160c-13.25 0-24-10.74-24-23.99C16 242.8 26.75 232 40 232h160v-160c0-13.25 10.75-23.99 24-23.99S248 58.75 248 72v160h160C421.3 232 432 242.8 432 256z"/>';
  // change viewbox attribute
  addToPromptLibraryButtonSVG.setAttribute('viewBox', '0 0 448 512');
  addToPromptLibraryButtonSVG.setAttribute('fill', 'currentColor');

  const userInput = userInputWrapper.textContent;
  addToPromptLibraryButton.addEventListener('click', () => {
    // open submit prompt modal
    openSubmitPromptModal(userInput);
  });

  editButton.parentElement.insertBefore(addToPromptLibraryButton, editButton);
}
function addSubmitButtonToAllUserInputs() {
  const editButtons = Array.from(document.querySelectorAll('path[d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"]')).map((buttonSVG) => buttonSVG.parentElement.parentElement);
  if (editButtons.length === 0) return;
  editButtons.forEach((editButton) => {
    addSubmitButtonToUserInputs(editButton);
    const userInputWrapper = editButton.parentElement.parentElement;

    const newEditButton = userInputWrapper.querySelector('path[d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"]')?.parentElement?.parentElement;
    const existingAddToPromptLibraryButton = userInputWrapper.querySelector('#add-to-prompt-library-button');
    if (!newEditButton) return;
    if (existingAddToPromptLibraryButton) return;
    const observer = new MutationObserver(() => {
      addSubmitButtonToUserInputs(newEditButton);
    });
    observer.observe(userInputWrapper, { childList: true });
  });
}
// eslint-disable-next-line no-unused-vars
function initializeAddToPromptLibrary() {
  addSubmitButtonToAllUserInputs();
  const main = document.querySelector('main');
  if (!main) return;
  selectedCategories = [];
  const observer = new MutationObserver(() => {
    addSubmitButtonToAllUserInputs();
  });
  observer.observe(main, { childList: true, subtree: true });
}
