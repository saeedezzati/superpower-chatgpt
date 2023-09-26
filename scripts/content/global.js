// eslint-disable-next-line no-unused-vars
/* global markdownit, hljs, resetSelection, getPrompt, newChatPage, initializeRegenerateResponseButton, notSelectedClassList, textAreaElementInputEventListener, textAreaElementKeydownEventListenerSync,  languageList, writingStyleList, toneList, refreshPage, runningPromptChainSteps:true, runningPromptChainIndex:true, dropdown, getExamplePrompts */
/* eslint-disable no-unused-vars */
// Gloab variables
// const { version } = chrome.runtime.getManifest();

// fetch data
// const data = await fetch(chrome.runtime.getURL('data.json')).then((res) => res.json());

// add eventlistener to the catch call to https://chat.openai.com/api/auth/session and grab the payload
//------------------------------------------------------------------------------------------------
// eslint-disable-next-line prefer-const
let isGenerating = false;// true when the user is generating a response
// eslint-disable-next-line prefer-const
let disableTextInput = false;// to prevent input from showing extra line right before submit
// eslint-disable-next-line prefer-const
let chatStreamIsClosed = false; // to force close the chat stream
// eslint-disable-next-line prefer-const
let shiftKeyPressed = false;
// eslint-disable-next-line prefer-const
let textAreaElementOldValue = '';
// chrome.storage.local.get(['environment'], (result) => {
//   if (result.environment === 'development') {
//     chrome.storage.onChanged.addListener((changes, namespace) => {
//       // eslint-disable-next-line no-restricted-syntax
//       for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
//         // eslint-disable-next-line no-console
//         if (key !== 'conversations') {
//           console.warn({
//             key,
//             namespace,
//             oldValue,
//             newValue,
//           });
//         }
//       }
//     });
//   }
// });
function isWindows() {
  return navigator.platform.indexOf('Win') > -1;
}
function openLinksInNewTab() {
  const base = document.createElement('base');
  base.target = '_blank';
  document.head.appendChild(base);
}
function initializeStorage() {
  // clear storage
  // chrome.storage.local.clear();
  // chrome.storage.sync.clear();
  // print storage
  // chrome.storage.sync.get(null, (items) => {
  //   const allKeys = Object.keys(items);
  //   console.log('sync', items);
  // });
  // chrome.storage.local.get(null, (items) => {
  //   const allKeys = Object.keys(items);
  //   console.log('local', items);
  // });
  chrome.storage.onChanged.addListener((e) => {
    if (e.conversationsOrder) {
      // get all folders
      const folders = e.conversationsOrder.newValue.filter((conversationOrder) => typeof conversationOrder !== 'string');
      // for each folder get the conversationIds
      const conversationIds = folders.map((folder) => folder.conversationIds);
      // flatten the conversationIds
      const flattenedConversationIds = conversationIds.flat();
      // if conversationIds are not strings (they are objects), get the id property
      flattenedConversationIds.forEach((conversationId, index) => {
        if (typeof conversationId !== 'string') {
          // eslint-disable-next-line no-console
          console.warn('Bad type. Please contact the developer!');
        }
      });

      // if there are duplicates, remove them
      const uniqueConversationIds = [...new Set(flattenedConversationIds)];
      if (uniqueConversationIds.length !== flattenedConversationIds.length) {
        // eslint-disable-next-line no-console
        console.warn('Not unique. Please contact the developer!');
      }
    }
  });
  return chrome.storage.local.get(['selectedConversations', 'conversationsOrder', 'customModels', 'conversations']).then((result) => {
    const localConversationsOrder = (result.conversationsOrder || []).filter((conversationOrder) => typeof conversationOrder !== 'string' || conversationOrder.length > 6);
    const allConversationKeys = Object.keys(result.conversations || []);
    return chrome.storage.sync.get(['conversationsOrder']).then((res) => {
      const syncConversationsOrder = res.conversationsOrder || [];
      // for each sync conversation order, if it's type=string, find a key in allConversationKeys that starts with that string
      // if found, replace the string with the key
      syncConversationsOrder.forEach((conversationOrder, index) => {
        if (typeof conversationOrder === 'string') {
          const foundKey = allConversationKeys.find((key) => key.startsWith(conversationOrder));
          if (foundKey) {
            syncConversationsOrder[index] = foundKey;
          }
        } else {
          const { conversationIds } = conversationOrder;
          conversationIds.forEach((conversationId, i) => {
            if (typeof conversationId === 'string') {
              const foundKey = allConversationKeys.find((key) => key.startsWith(conversationId));
              if (foundKey) {
                conversationIds[i] = foundKey;
              }
            }
          });
          syncConversationsOrder[index] = { ...syncConversationsOrder[index], conversationIds };
        }
      });

      return chrome.storage.local.set({
        conversationsOrder: [...new Set([...localConversationsOrder, ...syncConversationsOrder])],
        selectedConversations: result.selectedConversations || [],
        lastSelectedConversation: null,
        customModels: result.customModels || [],
        unofficialModels: [
          {
            title: 'gpt-4-0314',
            description: 'Previous snapshot of the GPT-4. The March 14th snapshot will be available until June 14th.',
            slug: 'gpt-4-0314',
            tags: ['Unofficial'],
          },
          {
            title: 'gpt-4-32k',
            description: 'GPT-4 with 32k token limit.',
            slug: 'gpt-4-32k',
            tags: ['Unofficial'],
          },
          {
            title: 'gpt-4-32k-0314',
            description: 'Previous snapshot of the GPT-4-32k. The March 14th snapshot will be available until June 14th.',
            slug: 'gpt-4-32k-0314',
            tags: ['Unofficial'],
          },
        ],
      }, () => { chrome.storage.sync.remove(['conversationsOrder']); });
    });
  });
}
// eslint-disable-next-line new-cap
const markdown = (role, searchValue = '') => new markdownit({
  html: role === 'assistant' && searchValue === '',
  linkify: true,
  highlight(str, _lang) {
    const { language, value } = hljs.highlightAuto(str);
    return `<pre dir="ltr" class="w-full"><div class="bg-black mb-4 rounded-md"><div id='code-header' class="flex items-center relative text-gray-200 ${role === 'user' ? 'bg-gray-900' : 'bg-gray-800'} px-4 py-2 text-xs font-sans rounded-t-md" style='border-top-left-radius:6px;border-top-right-radius:6px;'><span class="">${language}</span><button id='copy-code' data-initialized="false" class="flex ml-auto gap-2"><svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>Copy code</button></div><div class="p-4 overflow-y-auto"><code class="!whitespace-pre hljs language-${language}">${value}</code></div></div></pre>`;
  },
});
function addSounds() {
  const audio = document.createElement('audio');
  audio.id = 'beep-sound';
  audio.src = chrome.runtime.getURL('sounds/beep.mp3');
  document.body.appendChild(audio);
}
function playSound(sound) {
  const audio = document.getElementById(`${sound}-sound`);
  audio.play();
}
function watchError() {
  const targetNode = document.body;
  const config = { childList: true, subtree: true };
  const callback = (mutationsList, observer) => {
    mutationsList.forEach((mutation) => {
      if (mutation.type === 'childList') {
        // see if there is an h2 containing "Oops, an error occurred!"
        const error = document.querySelector('h2')?.textContent === 'Oops, an error occurred!';
        if (error) {
          chrome.storage.local.get('settings', ({ settings }) => {
            chrome.storage.local.set({
              settings: {
                ...settings,
                autoSync: false,
              },
            }, () => {
              refreshPage();
            });
          });
        }
      }
    });
  };
  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);
}
function showAutoSyncToast() {
  chrome.storage.local.get('settings', ({ settings }) => {
    const { autoSync } = settings;
    if (autoSync) {
      toast('Auto-sync is Enabled');
    } else {
      toast('Auto-sync is Disabled');
    }
  });
}
function escapeHtml(html) {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
function addDevIndicator() {
  chrome.storage.local.get('API_URL', ({ API_URL }) => {
    if (API_URL?.includes('dev')) {
      const devIndicator = document.createElement('div');
      devIndicator.style = 'position:fixed;bottom:16px;right:16px;z-index:9000;background-color:#19c37d;width:4px;height:4px;border-radius:100%;';
      document.body.appendChild(devIndicator);
    }
  });
}
const debounce = (func, wait = 1000) => {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
let scrolUpDetected = false;
function addScrollDetector(element) {
  let lastScrollTop = element.scrollTop;
  scrolUpDetected = false;
  element.addEventListener('scroll', () => { // or window.addEventListener("scroll"....
    const st = element.scrollTop; // Credits: "https://github.com/qeremy/so/blob/master/so.dom.js#L426"
    if (st > lastScrollTop) {
      // downscroll code
      // if reached the end of the page set scrolUpDetected to false
      if (element.scrollHeight - element.scrollTop === element.clientHeight) {
        scrolUpDetected = false;
      }
    } else if (st < lastScrollTop - 3) { // 20 is the threshold
      // upscroll code
      scrolUpDetected = true;
    } // else was horizontal scroll
    lastScrollTop = st <= 0 ? 0 : st; // For Mobile or negative scrolling
  }, false);
}
function addScrollButtons() {
  const existingScrollButtonWrapper = document.getElementById('scroll-button-wrapper');
  if (existingScrollButtonWrapper) existingScrollButtonWrapper.remove();

  const scrollButtonWrapper = document.createElement('div');
  scrollButtonWrapper.id = 'scroll-button-wrapper';
  scrollButtonWrapper.className = 'absolute flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-200 text-xs font-sans cursor-pointer rounded-md z-10';
  scrollButtonWrapper.style = 'bottom: 6rem;right: 3rem;width: 2rem;height: 4rem;flex-wrap:wrap;';
  const scrollUpButton = document.createElement('button');
  scrollUpButton.id = 'scroll-up-button';
  scrollUpButton.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="4" viewBox="0 0 48 48" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M24 44V4m20 20L24 4 4 24"></path></svg>';
  scrollUpButton.className = 'flex items-center justify-center border-black/10 dark:border-gray-900/50 text-gray-800 dark:text-gray-100 hover:bg-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-200 text-xs font-sans cursor-pointer rounded-t-md z-10';
  scrollUpButton.style = 'width: 2rem;height: 2rem;border: 1px solid;';
  scrollUpButton.addEventListener('click', () => {
    const conversationTop = document.querySelector('[id^=message-wrapper-]');
    if (!conversationTop) return;
    conversationTop.parentElement.scrollIntoView({ behavior: 'smooth' });
  });

  const scrollDownButton = document.createElement('button');
  scrollDownButton.id = 'scroll-down-button';
  scrollDownButton.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="4" viewBox="0 0 48 48" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M24 4v40M4 24l20 20 20-20"></path></svg>';
  scrollDownButton.className = 'flex items-center justify-center border-black/10 dark:border-gray-900/50 text-gray-800 dark:text-gray-100 hover:bg-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-200 text-xs font-sans cursor-pointer rounded-b-md z-10';
  scrollDownButton.style = 'width: 2rem;height: 2rem;border: 1px solid; border-top: none;';
  scrollDownButton.addEventListener('click', () => {
    const conversationBottom = document.querySelector('#conversation-bottom');

    if (!conversationBottom) return;
    conversationBottom.scrollIntoView({ behavior: 'smooth' });
  });

  scrollButtonWrapper.appendChild(scrollUpButton);
  scrollButtonWrapper.appendChild(scrollDownButton);
  document.body.appendChild(scrollButtonWrapper);
}

function addNavToggleButton() {
  chrome.storage.local.get(['settings'], (result) => {
    const { settings } = result;
    const sidebar = document.querySelector('.w-\\[260px\\]')?.parentElement;
    const mainContent = sidebar?.nextElementSibling;
    if (!sidebar) return;
    if (!mainContent) return;
    // add transition to nav and main
    sidebar.id = 'sidebar';
    sidebar.style = `${sidebar.style.cssText};width:260px !important;visibility:visible !important;transition:margin-left 0.3s ease-in-out;position:relative;overflow:unset`;
    mainContent.style.transition = 'padding-left 0.3s ease-in-out';

    const navToggleButton = document.createElement('div');
    navToggleButton.id = 'nav-toggle-button';
    navToggleButton.title = 'Hide/Show Sidebar (CMD/CTRL + ALT + H)';
    navToggleButton.className = 'absolute flex items-center justify-center bg-gray-900 text-gray-200 text-xs font-sans cursor-pointer rounded-r-md';

    if (settings?.navOpen || settings?.navOpen === undefined) {
      navToggleButton.style = 'width:16px;height:40px;right:-16px;bottom:0px;font-size:20px;z-index: 100;';
      navToggleButton.innerHTML = '‹';
    } else {
      sidebar.style.marginLeft = '-260px';
      mainContent.classList.replace('md:pl-[260px]', 'md:pl-0');
      navToggleButton.style = 'width:40px;height:40px;right:-40px;bottom:0px;font-size:20px;z-index: 100;';
      navToggleButton.innerHTML = '›';
    }
    navToggleButton.addEventListener('click', () => {
      chrome.storage.local.get(['settings'], (res) => {
        const curNavToggleBtn = document.querySelector('#nav-toggle-button');
        const newNavOpen = curNavToggleBtn.innerHTML === '›';
        chrome.storage.local.set({
          settings: {
            ...res.settings,
            navOpen: newNavOpen,
          },
        }, () => {
          if (newNavOpen) {
            const nav = document.querySelector('.w-\\[260px\\]').parentElement;
            const main = nav?.nextElementSibling;
            nav.style.marginLeft = '0px';
            main.classList.replace('md:pl-0', 'md:pl-[260px]');
            curNavToggleBtn.style = 'width:16px;height:40px;right:-16px;bottom:0px;font-size:20px;z-index: 100;';
            curNavToggleBtn.innerHTML = '‹';
          } else {
            const nav = document.querySelector('.w-\\[260px\\]').parentElement;
            const main = nav?.nextElementSibling;
            nav.style.marginLeft = '-260px';
            main.classList.replace('md:pl-[260px]', 'md:pl-0');
            curNavToggleBtn.style = 'width:40px;height:40px;right:-40px;bottom:0px;font-size:20px;z-index: 100;';
            curNavToggleBtn.innerHTML = '›';
          }
        });
      });
    });
    sidebar.appendChild(navToggleButton);
  });
}
function showHideTextAreaElement(forceShow = false) {
  chrome.storage.local.get('settings', ({ settings }) => {
    const textAreaElement = document.querySelector('main form textarea');
    if (!textAreaElement) return;
    const textAreaParent = textAreaElement.parentElement;
    const allMessageWrapper = document.querySelectorAll('[id^="message-wrapper-"]');
    const continueButton = document.querySelector('#continue-conversation-button-wrapper');
    if (allMessageWrapper.length > 0) {
      const lastMessageWrapperElement = allMessageWrapper[allMessageWrapper.length - 1];

      if (!forceShow && lastMessageWrapperElement && lastMessageWrapperElement.dataset.role === 'user') {
        textAreaParent.style.display = 'none';
        if (continueButton) continueButton.style.display = 'none';
      } else {
        textAreaParent.style = '';
        if (continueButton && settings.showCustomPromptsButton) continueButton.style.display = 'flex';
      }
    } else {
      textAreaParent.style = '';
    }
  });
}
function showNewChatPage() {
  // chatStreamIsClosed = true;
  chrome.storage.local.get(['conversationsAreSynced', 'account', 'settings'], (result) => {
    const pluginDropdownButton = document.querySelector('#navbar-plugins-dropdown-button');
    if (pluginDropdownButton) {
      pluginDropdownButton.disabled = false;
      pluginDropdownButton.style.opacity = 1;
      pluginDropdownButton.title = '';
    }

    const { conversationsAreSynced, account, settings } = result;
    const {
      selectedLanguage, selectedTone, selectedWritingStyle, autoClick, showExamplePrompts, autoResetTopNav,
    } = settings;
    chrome.storage.local.set({
      settings: {
        ...settings,
        autoClick: false,
        selectedLanguage: autoResetTopNav ? languageList.find((language) => language.code === 'default') : selectedLanguage,
        selectedTone: autoResetTopNav ? toneList.find((tone) => tone.code === 'default') : selectedTone,
        selectedWritingStyle: autoResetTopNav ? writingStyleList.find((writingStyle) => writingStyle.code === 'default') : selectedWritingStyle,
      },
    }, () => {
      if (autoResetTopNav) {
        document.querySelectorAll('#language-list-dropdown li')?.[0]?.click();
        document.querySelectorAll('#tone-list-dropdown li')?.[0]?.click();
        document.querySelectorAll('#writing-style-list-dropdown li')?.[0]?.click();
      }
      document.querySelector('#auto-click-button')?.classList?.replace('btn-primary', 'btn-neutral');
    });
    runningPromptChainSteps = undefined;
    runningPromptChainIndex = 0;
    document.title = 'New Page';
    const planName = account?.accounts?.default?.entitlement?.subscription_plan || 'chatgptfreeplan';
    if (!conversationsAreSynced) return;
    const focusedConversations = document.querySelectorAll('.selected');
    focusedConversations.forEach((c) => {
      c.classList = notSelectedClassList;
    });
    const main = document.querySelector('main');
    // div with class flex-1 overflow-hidden
    const contentWrapper = main.querySelector('.flex-1.overflow-hidden');
    contentWrapper.innerHTML = '';
    contentWrapper.appendChild(newChatPage(planName));
    const pinNav = document.querySelector('#pin-nav');
    if (pinNav) {
      pinNav.remove();
    }
    const { href, search } = new URL(window.location.toString());
    if (href !== 'https://chat.openai.com/') {
      window.history.replaceState({}, '', 'https://chat.openai.com/');
    }
    const inputForm = main.querySelector('form');
    const textAreaElement = inputForm.querySelector('textarea');
    textAreaElement.focus();
    showHideTextAreaElement();
    if (showExamplePrompts) loadExamplePrompts();
    initializeRegenerateResponseButton();// basically just hide the button, so conversationId is not needed
    handleQueryParams(search);
  });
}
function suggestionButton(suggestion) {
  const button = document.createElement('button');
  button.className = 'btn relative btn-neutral group w-full whitespace-nowrap rounded-xl text-left text-gray-700 shadow-[0px_1px_6px_0px_rgba(0,0,0,0.02)] dark:text-gray-300 md:whitespace-normal';
  button.style = 'width: 49%;';
  button.innerHTML = `<div class="flex w-full gap-2 items-center justify-center"><div class="flex w-full items-center justify-between"><div class="flex flex-col overflow-hidden"><div class="truncate font-semibold">${suggestion.title}</div><div class="truncate opacity-50">${suggestion.description}</div></div><div class="absolute bottom-0 right-0 top-0 flex items-center rounded-xl bg-gradient-to-l from-gray-100 from-[60%] pl-6 pr-3 text-gray-700 opacity-0 group-hover:opacity-100 dark:from-gray-700 dark:text-gray-200"><span class="" data-state="closed"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" class="h-4 w-4" stroke-width="2"><path d="M.5 1.163A1 1 0 0 1 1.97.28l12.868 6.837a1 1 0 0 1 0 1.766L1.969 15.72A1 1 0 0 1 .5 14.836V10.33a1 1 0 0 1 .816-.983L8.5 8 1.316 6.653A1 1 0 0 1 .5 5.67V1.163Z" fill="currentColor"></path></svg></span></div></div></div>`;
  button.addEventListener('click', () => {
    const textAreaElement = document.querySelector('main form textarea');
    textAreaElement.value = suggestion.prompt;
    // remove all suggestion buttons
    const suggestionsWrapper = document.querySelector('#suggestions-wrapper');
    if (suggestionsWrapper) suggestionsWrapper.remove();
    // click the submit button
    textAreaElement.focus();
    textAreaElement.dispatchEvent(new Event('input', { bubbles: true }));
    textAreaElement.dispatchEvent(new Event('change', { bubbles: true }));
    setTimeout(() => {
      const submitButton = document.querySelector('main form textarea ~ button');
      submitButton.click();
    }, 100);
  });
  return button;
}
function loadExamplePrompts() {
  getExamplePrompts().then((examplePrompts) => {
    setTimeout(() => {
      const existingSuggestionsWrapper = document.querySelector('#suggestions-wrapper');
      if (existingSuggestionsWrapper) existingSuggestionsWrapper.remove();
      const suggestionsWrapper = document.createElement('div');
      suggestionsWrapper.id = 'suggestions-wrapper';
      suggestionsWrapper.className = 'flex flex-wrap w-full gap-3';
      suggestionsWrapper.style = 'z-index:1000;';
      examplePrompts.items.forEach((examplePrompt) => {
        const examplePromptButton = suggestionButton(examplePrompt);
        suggestionsWrapper.appendChild(examplePromptButton);
      });
      // check if still on new chat page
      const { href } = new URL(window.location.toString());
      if (href === 'https://chat.openai.com/') {
        const inputFormActionWrapper = document.querySelector('#input-form-action-wrapper');
        if (inputFormActionWrapper) inputFormActionWrapper.appendChild(suggestionsWrapper);
      }
    }, 1000);
  });
}
function handleQueryParams(query) {
  const urlParams = new URLSearchParams(query);
  const promptId = urlParams.get('pid');
  if (promptId) {
    chrome.runtime.sendMessage({
      getPrompt: true,
      detail: {
        promptId,
      },
    }, (prompt) => {
      const main = document.querySelector('main');
      const inputForm = main.querySelector('form');
      const textAreaElement = inputForm.querySelector('textarea');
      textAreaElement.value = prompt.text;
      textAreaElement.focus();
      textAreaElement.dispatchEvent(new Event('input', { bubbles: true }));
      textAreaElement.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }
}
function addArkoseCallback() {
  setTimeout(() => {
    const script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', chrome.runtime.getURL('scripts/content/arkose.js'));
    document.body.appendChild(script);
    addArkoseScript();
  }, 1000);
}
function addArkoseScript() {
  setTimeout(() => {
    // check if a script element with src including api.js and chrome-extension exists
    const arkoseScript = document.querySelector('script[src*="chrome-extension"][src*="api.js"]');
    if (arkoseScript) return;
    const arkoseApiScript = document.createElement('script');
    arkoseApiScript.async = !0;
    arkoseApiScript.defer = !0;
    arkoseApiScript.setAttribute('type', 'text/javascript');
    arkoseApiScript.setAttribute('data-status', 'loading');
    arkoseApiScript.setAttribute('data-callback', 'useArkoseSetupEnforcement');
    arkoseApiScript.setAttribute('src', chrome.runtime.getURL('v2/35536E1E-65B4-4D96-9D97-6ADB7EFF8147/api.js'));
    document.body.appendChild(arkoseApiScript);
  }, 500);
}
function arkoseTrigger() {
  chrome.storage.local.get('settings', ({ settings }) => {
    if (settings.selectedModel.tags.includes('gpt4')) {
      window.localStorage.removeItem('arkoseToken');
      const inputForm = document.querySelector('main form');
      if (!inputForm) return;
      if (!inputForm.querySelector('#enforcement-trigger')) {
        inputForm.firstChild.insertAdjacentHTML('beforeend', '<button type="button" class="hidden" id="enforcement-trigger"></button>');
      }
      inputForm.querySelector('#enforcement-trigger').click();
    }
  });
}

function replaceTextAreaElemet(settings) {
  const inputForm = document.querySelector('main form');
  if (!inputForm) { return false; }
  if (!inputForm.querySelector('#enforcement-trigger')) {
    inputForm.firstChild.insertAdjacentHTML('beforeend', '<button type="button" class="hidden" id="enforcement-trigger"></button>');
  }
  if (settings.customConversationWidth) {
    inputForm.style = `${inputForm.style.cssText}; max-width:${settings.conversationWidth}%;`;
  }
  // remove all div childs of inputForm if child element textcontent include gpt
  const allChilds = inputForm.parentElement.childNodes;
  allChilds.forEach((c) => {
    if (c.tagName === 'DIV' && c.textContent && c.textContent.toLowerCase().includes('gpt')) {
      c.textContent = '';
    }
  });

  let textAreaElement = inputForm.querySelector('textarea');

  if (!textAreaElement) {
    const textAreaElementWrapperHTML = '<div class="flex flex-col w-full flex-grow relative border border-black/10 dark:border-gray-900/50 dark:text-white rounded-xl shadow-xs dark:shadow-xs dark:bg-gray-700 bg-white"><textarea id="prompt-textarea" tabindex="0" data-id="57b652f1-414c-433f-9041-1911b4ea7d85" rows="1" placeholder="Send a message (Type @ for Custom Prompt and # for Prompt Chains)" class="m-0 w-full resize-none border-0 bg-transparent py-[10px] pr-10 focus:ring-0 focus-visible:ring-0 dark:bg-transparent md:py-4 md:pr-12 pl-3 md:pl-4" style="max-height: 200px; height: 56px; overflow-y: hidden;" spellcheck="false"></textarea><button disabled="" class="absolute p-1 rounded-md md:bottom-3 md:p-2 md:right-3 dark:hover:bg-gray-900 dark:disabled:hover:bg-transparent right-2 disabled:text-gray-400 enabled:bg-brand-purple text-white bottom-1.5 transition-colors disabled:opacity-40" data-testid="send-button"><span class="" data-state="closed"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" class="icon-sm m-1 md:m-0"><path d="M.5 1.163A1 1 0 0 1 1.97.28l12.868 6.837a1 1 0 0 1 0 1.766L1.969 15.72A1 1 0 0 1 .5 14.836V10.33a1 1 0 0 1 .816-.983L8.5 8 1.316 6.653A1 1 0 0 1 .5 5.67V1.163Z" fill="currentColor"></path></svg></span></button></div>';
    // insert text area element wrapper in input form first child at the end
    inputForm.firstChild.insertAdjacentHTML('beforeend', textAreaElementWrapperHTML);
    textAreaElement = inputForm.querySelector('textarea');
  }
  const newTextAreaElement = textAreaElement.cloneNode(true);
  newTextAreaElement.id = 'prompt-textarea';
  newTextAreaElement.dir = 'auto';
  newTextAreaElement.placeholder = 'Send a message (Type @ for Custom Prompt and # for Prompt Chains)';
  // auto resize textarea height up to 200px
  newTextAreaElement.style.height = 'auto';
  newTextAreaElement.style.height = `${newTextAreaElement.scrollHeight || '56'}px`;
  newTextAreaElement.style.maxHeight = '200px';
  newTextAreaElement.style.minHeight = '56px';
  newTextAreaElement.style.paddingRight = '40px';
  newTextAreaElement.style.overflowY = 'hidden';

  // keydown is triggered before input event and before value is changed.
  newTextAreaElement.addEventListener('input', (event) => {
    // console.warn('input event', 'old: ', textAreaElementOldValue, 'new: ', newTextAreaElement.value);
    if (textAreaElementOldValue === '' && newTextAreaElement.value !== textAreaElementOldValue) {
      textAreaElementOldValue = newTextAreaElement.value;
      arkoseTrigger();
    } else if (newTextAreaElement.value !== textAreaElementOldValue) {
      textAreaElementOldValue = newTextAreaElement.value;
    }
  });

  newTextAreaElement.addEventListener('keydown', textAreaElementKeydownEventListenerSync);
  // also async
  newTextAreaElement.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && event.which === 13 && !event.shiftKey && !isGenerating) {
      disableTextInput = true;
      textAreaElementOldValue = '';
      if (newTextAreaElement.value.trim().length === 0) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (isGenerating) return;
      inputForm.dispatchEvent(new Event('submit', { cancelable: true }));
    }
  });
  newTextAreaElement.addEventListener('input', textAreaElementInputEventListener);
  // newTextAreaElement.addEventListener('paste', textAreaElementInputEventListener);

  textAreaElement.replaceWith(newTextAreaElement);
  addInputCounter();
  addGpt4Counter();
  return true;
}
function getBrowser() {
  if (typeof chrome !== 'undefined') {
    if (typeof browser !== 'undefined') {
      return 'Firefox';
    }
    return 'Chrome';
  }
  return 'Edge';
}
function addInputCounter() {
  const main = document.querySelector('main');
  if (!main) return;
  const inputForm = main.querySelector('form');
  // find sibling of input form
  const inputFormSibling = inputForm.nextElementSibling;
  if (inputFormSibling) {
    inputFormSibling.style.disply = 'none';
  }

  const textAreaElement = inputForm.querySelector('textarea');
  if (!textAreaElement) return;
  // add input char/word counter
  const existingInputCounterElement = document.querySelector('#gptx-input-counter');
  if (existingInputCounterElement) existingInputCounterElement.remove();
  const inputCounterElement = document.createElement('span');
  inputCounterElement.id = 'gptx-input-counter';
  inputCounterElement.style = 'position: absolute; bottom: -15px; right: 0px; font-size: 10px; color: #999; opacity: 0.8;z-index: 100;';
  inputCounterElement.innerText = '0 chars / 0 words';

  textAreaElement.parentElement.appendChild(inputCounterElement);
}
function getGPT4CounterMessageCapWindow(messageCapWindow) {
  if (messageCapWindow < 60) return messageCapWindow < 2 ? 'minute' : ''.concat(messageCapWindow, ' minutes');
  const n = Math.floor(messageCapWindow / 60);
  if (n < 24) return n < 2 ? 'hour' : ''.concat(n, ' hours');
  const t = Math.floor(n / 24);
  if (t < 7) return t < 2 ? 'day' : ''.concat(t, ' days');
  const r = Math.floor(t / 7);
  return r < 2 ? 'week' : ''.concat(r, ' weeks');
}
function addGpt4Counter() {
  const textAreaElement = document.querySelector('main form textarea');
  if (!textAreaElement) return;
  // add input char/word counter
  const existingGpt4CounterElement = document.querySelector('#gpt4-counter');
  if (existingGpt4CounterElement) existingGpt4CounterElement.remove();
  const gpt4CounterElement = document.createElement('span');
  gpt4CounterElement.id = 'gpt4-counter';
  gpt4CounterElement.style = 'position: absolute; bottom: -15px; left: 0px; font-size: 10px; color: #999; opacity: 0.8; z-index: 100;display:none;';
  chrome.storage.local.get(['gpt4Timestamps', 'models', 'conversationLimit', 'settings', 'capExpiresAt'], (result) => {
    if (!result.models) return;
    if (!result.models.find((model) => model.slug === 'gpt-4')) return;
    gpt4CounterElement.style.display = result.settings.showGpt4Counter ? 'block' : 'none';
    const gpt4Timestamps = result.gpt4Timestamps || [];

    const messageCap = result?.conversationLimit?.message_cap || 50;
    const messageCapWindow = result?.conversationLimit?.message_cap_window || 180;
    const now = new Date().getTime();
    const timestampsInCapWindow = gpt4Timestamps.filter((timestamp) => now - timestamp < (messageCapWindow / 60) * 60 * 60 * 1000);
    // const resetTimeText = timestampsInCapWindow.length > 0 ? `New message available at: ${new Date(timestampsInCapWindow[0] + (messageCapWindow / 60) * 60 * 60 * 1000).toLocaleString()}` : '';
    const gpt4counter = timestampsInCapWindow.length;
    const capExpiresAtTimeString = result.capExpiresAt ? `(Cap Expires At: ${result.capExpiresAt})` : '';
    if (gpt4counter) {
      gpt4CounterElement.innerText = `GPT-4 requests (last ${getGPT4CounterMessageCapWindow(messageCapWindow)}): ${gpt4counter}/${messageCap} ${capExpiresAtTimeString}`;
    } else {
      gpt4CounterElement.innerText = `GPT-4 requests (last ${getGPT4CounterMessageCapWindow(messageCapWindow)}): 0/${messageCap}`;
    }
  });

  textAreaElement.parentElement.appendChild(gpt4CounterElement);

  chrome.storage.onChanged.addListener((e) => {
    if (e.conversationLimit) {
      addGpt4Counter();
    }
  });
}

function updateInputCounter(text) {
  const curInputCounterElement = document.querySelector('#gptx-input-counter');
  if (curInputCounterElement) {
    // word count split by space or newline
    const wordCount = text ? text.split(/[\s\n]+/).length : 0;
    const charCount = text.length;
    if (charCount < 16000) {
      curInputCounterElement.style.color = '#999';
    }
    if (charCount > 16000 && charCount < 16500) {
      curInputCounterElement.style.color = '#fbd986';
    }
    if (charCount > 16500) {
      curInputCounterElement.style.color = '#ff4a4a';
    }
    curInputCounterElement.innerText = `${Math.max(charCount, 0)} chars / ${Math.max(wordCount, 0)} words`;
  }
}
function canSubmitPrompt() {
  const submitButton = document.querySelector('main form textarea ~ button');
  if (!submitButton) { return false; }
  // if submit button not contained and svg element retur false
  const submitSVG = submitButton.querySelector('svg');// (...)
  if (!submitSVG) { return false; }
  if (isGenerating) { return false; }
  // if (submitButton.disabled) { return false; } // remove since openai now disables submit button when input is empty
  return true;
}
function addActionButtonWrapperAboveInput() {
  const regenerateResponseButton = Array.from(document.querySelectorAll('form button')).find(
    (button) => button.textContent === 'Regenerate',
  );
  if (regenerateResponseButton) regenerateResponseButton.style.zIndex = 10;
  const existingActionButtonWrapper = document.querySelector('#action-button-wrapper');
  if (existingActionButtonWrapper) return;
  const main = document.querySelector('main');
  if (!main) return;
  const inputForm = main.querySelector('form');
  const textAreaElement = inputForm.querySelector('textarea');
  if (!textAreaElement) return;
  const submitButton = inputForm.querySelector('textarea ~ button');
  if (!submitButton) return;
  const actionButtonWrapper = document.createElement('div');
  actionButtonWrapper.id = 'action-button-wrapper';
  actionButtonWrapper.style = 'display:flex;justify-content:space-between;align-items:center;position:absolute;width:100%;bottom:57px;';
  const textAreaElementWrapper = textAreaElement.parentElement.parentElement;
  textAreaElementWrapper.insertBefore(actionButtonWrapper, textAreaElement.parentElement);
}

function formatDate(date) {
  // if date is today show hh:mm. if older than today just show date yyyy-mm-dd
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const todayDate = today.getDate();
  const todayMonth = today.getMonth() + 1;
  const todayYear = today.getFullYear();
  const dateDate = date.getDate();
  const dateMonth = date.getMonth() + 1;
  const dateYear = date.getFullYear();
  if (todayDate === dateDate && todayMonth === dateMonth && todayYear === dateYear) {
    return `Today ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' })}`;
  }
  if (yesterday.getDate() === dateDate && yesterday.getMonth() + 1 === dateMonth && yesterday.getFullYear() === dateYear) {
    return `Yesterday ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' })}`;
  }
  return `${date.toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' })} ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' })}`;
}
function addButtonToNavFooter(title, onClick) {
  const nav = document.querySelector('nav');
  if (!nav) return;
  const existingNavFooter = document.querySelector('#nav-footer');
  let navFooter = existingNavFooter;
  if (!existingNavFooter) {
    navFooter = document.createElement('div');
    navFooter.id = 'nav-footer';
    navFooter.style = 'margin:8px 0 0 0;padding-right:8px;width:100%;display:flex; flex-direction:column-reverse;justify-content:flex-start;align-items:center;min-height:108px;';
  }
  const navGap = document.querySelector('nav > :nth-child(3)');
  navGap.style = `${navGap.style.cssText};display:flex;margin-right:-8px;`;
  const conversationList = navGap.querySelector('div');
  conversationList.id = 'conversation-list';
  conversationList.style.scrollBehavior = 'smooth';
  conversationList.style = `${conversationList.style.cssText};overflow-y:scroll;height:100%;padding-right:8px;`;
  navGap.appendChild(navFooter);

  // check if the setting button is already added
  if (document.querySelector(`#${title.toLowerCase().replaceAll(' ', '-')}-button`)) return;
  // create the setting button by copying the nav button
  const button = document.createElement('a');
  button.classList = 'flex py-3 px-3 items-center gap-3 transition-colors duration-200 text-white cursor-pointer text-sm rounded-md border border-white/20 hover:bg-gray-500/10 mb-1 flex-shrink-0';
  button.textContent = title;

  const buttonIcon = document.createElement('img');
  buttonIcon.style = 'width: 16px; height: 16px;';
  buttonIcon.src = chrome.runtime.getURL(`icons/${title.toLowerCase().replaceAll(' ', '-')}.png`);
  button.id = `${title.toLowerCase().replaceAll(' ', '-')}-button`;
  button.prepend(buttonIcon);
  button.style = `${button.style.cssText}; width: 100%;`;
  // Add click event listener to setting button
  button.addEventListener('click', () => {
    // open the setting modal
    onClick();
  });
  // add the setting button to the nav parrent
  navFooter.appendChild(button);
}
function addExpandButton() {
  const nav = document.querySelector('nav');
  if (nav) {
    nav.style.overflow = 'hidden';
  }
  const originalExpandButton = document.querySelector('#expand-sidebar-bottom-button');
  if (originalExpandButton) originalExpandButton.remove();
  const conversationList = document.querySelector('#conversation-list');
  if (!conversationList) return;
  const conversationListParent = conversationList.parentElement;
  conversationListParent.style.transition = 'all 1s ease-in-out';
  conversationListParent.style.position = 'relative';
  const expandButton = document.createElement('button');
  expandButton.id = 'expand-sidebar-bottom-button';
  expandButton.classList = 'flex items-center justify-center w-10 h-4 relative rounded-md bg-gray-800 hover:bg-gray-700 ';
  expandButton.style = 'bottom:-8px;margin:auto';
  chrome.storage.local.get(['settings'], (result) => {
    const { settings } = result;
    if (!settings) return;
    const { hideBottomSidebar } = settings;
    const userMenu = document.querySelector('#user-menu');
    if (!hideBottomSidebar) {
      userMenu.style.paddingTop = '8px';
      expandButton.innerHTML = '<svg class="w-4 h-4 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>';
    } else {
      userMenu.style.paddingTop = '20px';
      expandButton.innerHTML = '<svg class="w-4 h-4 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>';
      conversationListParent.style.minHeight = 'calc(100vh - 98px)';
      conversationListParent.style.maxHeight = 'calc(100vh - 98px)';
    }
  });
  expandButton.addEventListener('click', () => {
    chrome.storage.local.get(['settings'], (result) => {
      const { settings } = result;
      const { hideBottomSidebar } = settings;
      chrome.storage.local.set({ settings: { ...settings, hideBottomSidebar: !hideBottomSidebar } }, () => {
        const curConversationListParent = document.querySelector('#conversation-list').parentElement;
        const userMenu = document.querySelector('#user-menu');
        if (!hideBottomSidebar) {
          userMenu.style.paddingTop = '20px';
          curConversationListParent.style.minHeight = 'calc(100vh - 98px)';
          curConversationListParent.style.maxHeight = 'calc(100vh - 98px)';
          expandButton.innerHTML = '<svg class="w-4 h-4 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>';
        } else {
          userMenu.style.paddingTop = '8px';
          curConversationListParent.style.minHeight = 'unset';
          curConversationListParent.style.maxHeight = 'unset';
          expandButton.innerHTML = '<svg class="w-4 h-4 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>';
        }
      });
    });
  });
  // add expandButton after conversationListParent
  conversationListParent.after(expandButton);
}
//------------------------------------------------------------------------------------------------

// addButtonToNavFooter('Settings', () => createSettingsModal());

// function createSettingsModal() {
//   // create settings modal content
//   const div = document.createElement('div');

//   createModal('Settings', 'Your can change your settings here', div, div);
// }
//------------------------------------------------------------------------------------------------
const allAsistantChats = () => Array.from(
  document.querySelectorAll('.markdown.prose'),
);

// Helper Functions
// Add action wrapper to result
function addActionWrapperToResult(resultElement, index) {
  const lastActionWrapper = document.querySelector(`#result-action-wrapper-${index}`);
  if (lastActionWrapper) return;
  const actionWrapper = document.createElement('div');
  actionWrapper.id = `result-action-wrapper-${index}`;
  actionWrapper.style = 'display:flex;justify-content:space-between;align-items:center;margin-top:16px;color: lightslategray; font-size:0.7em;width: 100%; height:40px;';

  resultElement.insertAdjacentElement('afterend', actionWrapper);
}
function cleanNav() {
  const nav = document.querySelector('nav');
  if (!nav) return;
  const userMenu = nav.lastChild;
  userMenu.id = 'user-menu';
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        removeUnusedButtons();
      }
    });
  });
  observer.observe(nav, { childList: true });
}
function removeUnusedButtons() {
  const nav = document.querySelector('nav');
  if (!nav) return;
  const allNavButtons = Array.from(nav.querySelectorAll('a'));
  const improveButton = allNavButtons.find((button) => button.textContent.toLocaleLowerCase() === 'improve chatgpt');
  const settingsButton = allNavButtons.find((button) => button.textContent.toLocaleLowerCase() === 'settings');
  const myPlanButton = allNavButtons.find((button) => button.textContent.toLocaleLowerCase() === 'my plan');
  const myAccountButton = allNavButtons.find((button) => button.textContent.toLocaleLowerCase() === 'my account');
  const upgradeButton = allNavButtons.find((button) => button.textContent.toLocaleLowerCase() === 'upgrade plan');
  const upgradePlusButton = allNavButtons.find((button) => button.textContent.toLocaleLowerCase().includes('upgrade to plus'));
  const updatesButton = allNavButtons.find((button) => button.textContent.toLocaleLowerCase() === 'get help');
  const discordButton = allNavButtons.find((button) => button.textContent.toLocaleLowerCase() === 'openai discord');
  const darkModeButton = allNavButtons.find((button) => button.textContent.toLocaleLowerCase() === 'light mode' || button.textContent.toLocaleLowerCase() === 'dark mode');
  const clearConversationsButton = allNavButtons.find((button) => button.textContent.toLowerCase() === 'clear conversations');
  if (clearConversationsButton) {
    clearConversationsButton.id = 'clear-conversations-button';
    clearConversationsButton.style.display = 'none';
  }
  if (settingsButton && settingsButton.id !== 'settings-button') {
    settingsButton.id = 'chatgpt-settings-button';
    settingsButton.style.display = 'none';
  }
  if (updatesButton) {
    updatesButton.id = 'updates-button';
    updatesButton.style.display = 'none';
  }
  if (discordButton) {
    discordButton.id = 'discord-button';
    discordButton.style.display = 'none';
  }
  if (myAccountButton) {
    myAccountButton.id = 'my-account-button';
    myAccountButton.style.display = 'none';
  }
  if (myPlanButton) {
    myPlanButton.id = 'my-plan-button';
    myPlanButton.style.display = 'none';
  }
  if (improveButton) {
    improveButton.id = 'improve-button';
    improveButton.style.display = 'none';
  }
  if (upgradeButton) {
    upgradeButton.id = 'upgrade-plan-button';
    upgradeButton.style.display = 'none';
  }
  if (upgradePlusButton) {
    upgradePlusButton.id = 'upgrade-plus-button';
    upgradePlusButton.style.display = 'none';
  }
  if (darkModeButton) {
    darkModeButton.id = 'dark-mode-button';
    darkModeButton.style.display = 'none';
  }
}
function updateNewChatButtonNotSynced() {
  chrome.storage.local.get(['selectedConversations'], (result) => {
    const { selectedConversations } = result;
    const textAreaElement = document.querySelector('main form textarea');
    const nav = document.querySelector('nav');
    const newChatButton = nav?.querySelector('a');
    newChatButton.classList = 'flex py-3 px-3 w-full items-center gap-3 transition-colors duration-200 text-white cursor-pointer text-sm rounded-md border border-white/20 hover:bg-gray-500/10 mb-1 flex-shrink-0';
    newChatButton.id = 'new-chat-button';
    newChatButton.addEventListener('click', () => {
      resetSelection();
      if (textAreaElement) {
        textAreaElement.focus();
      }
    });
    if (selectedConversations?.length > 0) {
      newChatButton.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>Clear selection';
    } else {
      newChatButton.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>New chat';
    }
  });
}
function removeMarkTagsInsideBackticks(input) {
  const pattern = /(`{1,3})([^`]*?)\1/gs;
  return input.replace(pattern, (match, backticks, codeBlock) => {
    const codeWithoutMarkTags = codeBlock.replace(/<\/?mark>/gi, '');
    return backticks + codeWithoutMarkTags + backticks;
  });
}
function addAutoSyncToggleButton() {
  const existingAutoSyncToggleButton = document.getElementById('auto-sync-toggle-button');
  if (existingAutoSyncToggleButton) existingAutoSyncToggleButton.remove();

  const autoSyncToggleButton = document.createElement('button');
  autoSyncToggleButton.id = 'keyboard-shortcuts-modal-button';
  autoSyncToggleButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="1.5em" viewBox="0 0 512 512" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="0" fill="currentColor"><path d="M256 79.1C178.5 79.1 112.7 130.1 89.2 199.7C84.96 212.2 71.34 218.1 58.79 214.7C46.23 210.5 39.48 196.9 43.72 184.3C73.6 95.8 157.3 32 256 32C337.5 32 408.8 75.53 448 140.6V104C448 90.75 458.7 80 472 80C485.3 80 496 90.75 496 104V200C496 213.3 485.3 224 472 224H376C362.7 224 352 213.3 352 200C352 186.7 362.7 176 376 176H412.8C383.7 118.1 324.4 80 256 80V79.1zM280 263.1C280 277.3 269.3 287.1 256 287.1C242.7 287.1 232 277.3 232 263.1V151.1C232 138.7 242.7 127.1 256 127.1C269.3 127.1 280 138.7 280 151.1V263.1zM224 352C224 334.3 238.3 319.1 256 319.1C273.7 319.1 288 334.3 288 352C288 369.7 273.7 384 256 384C238.3 384 224 369.7 224 352zM40 432C26.75 432 16 421.3 16 408V311.1C16 298.7 26.75 287.1 40 287.1H136C149.3 287.1 160 298.7 160 311.1C160 325.3 149.3 336 136 336H99.19C128.3 393 187.6 432 256 432C333.5 432 399.3 381.9 422.8 312.3C427 299.8 440.7 293 453.2 297.3C465.8 301.5 472.5 315.1 468.3 327.7C438.4 416.2 354.7 480 256 480C174.5 480 103.2 436.5 64 371.4V408C64 421.3 53.25 432 40 432V432z"/></svg>';
  autoSyncToggleButton.className = 'absolute flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-200 text-xs font-sans cursor-pointer rounded-md z-10';
  autoSyncToggleButton.style = 'bottom: 6rem;right: 3rem;width: 2rem;height: 2rem;flex-wrap:wrap;border: 1px solid;color:#e06c2b';
  autoSyncToggleButton.title = 'Auto Sync is OFF. Click to turn ON';
  autoSyncToggleButton.addEventListener('click', () => {
    chrome.storage.local.get(['settings'], ({ settings }) => {
      chrome.storage.local.set({ settings: { ...settings, autoSync: true } }, () => {
        window.location.reload();
      });
    });
  });
  document.body.appendChild(autoSyncToggleButton);
}
function highlight(text, searchTerm) {
  if (!text) return '';
  if (text.trim().length === 0) return '';
  if (searchTerm.trim().length === 0) return text;
  // escape special characters
  searchTerm = searchTerm.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  const newText = text.replace(new RegExp(searchTerm, 'gi'), (match) => `<mark>${match}</mark>`);
  // remove any <mark> and </mark> tags that are inside <code> tags
  return removeMarkTagsInsideBackticks(newText);
}

function highlightBracket(text) {
  if (text.trim().length === 0) return '';
  // replace brackets [] and text between them with <mark> tag and remove the brackets
  return text.replace(/\[.*?\]/g, (match) => `<strong style="margin:0 2px; padding:1px 4px; border-radius:4px; background-color:#444554; font-style:italic; border:solid 1px lightslategray;">${match.replace(/[[\]]/g, '')}</strong>`);
}
function highlightHTML(text, elementId) {
  const element = document.getElementById(elementId);
  if (!element) return;
  let { innerHTML } = element;
  if (!innerHTML || innerHTML.trim() === '') return;
  text = text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  if (text.trim() === '') return;
  // highlight all occurences of the "text" only inside <pre>..</pre> tags in innerHTML with <mark> tag
  // there can be multiple <pre>..</pre> tags in innerHTML
  // each <pre>..</pre> tag can have multiple attributes like style and class
  // keep the attributes of <pre>..</pre> tags
  innerHTML = innerHTML.replace(
    /<pre.*?>(.*?)<\/pre>/g,
    (match, preContent) => {
      const preContentWithMark = preContent.replace(
        new RegExp(text, 'gi'),
        (m) => `<mark>${m}</mark>`,
      );
      return match.replace(preContent, preContentWithMark);
    },
  );

  element.innerHTML = innerHTML;
}

function toast(html, type = 'info', duration = 4000) {
  // show toast that text is copied to clipboard
  const existingToast = document.querySelector('#gptx-toast');
  if (existingToast) existingToast.remove();
  const element = document.createElement('div');
  element.id = 'gptx-toast';
  element.style = 'position:fixed;right:24px;top:24px;border-radius:4px;background-color:#19c37d;padding:8px 16px;z-index:100001;max-width:600px;';
  if (type === 'error') {
    element.style.backgroundColor = '#ef4146';
  }
  if (type === 'warning') {
    element.style.backgroundColor = '#e06c2b';
  }
  element.innerHTML = html;
  document.body.appendChild(element);
  setTimeout(
    () => {
      element.remove();
    },
    duration,
  );
}
