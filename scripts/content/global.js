/* global markdownit, hljs, resetSelection, getPrompt, newChatPage, initializeRegenerateResponseButton, notSelectedClassList, textAreaElementInputEventListener, addExamplePromptEventListener,  initializePluginStoreModal, addPluginStoreEventListener, textAreaElementKeydownEventListener */
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
  return chrome.storage.sync.get(['conversationsOrder']).then((res) => {
    const syncConversationsOrder = res.conversationsOrder || [];
    return chrome.storage.local.get(['selectedConversations', 'conversationsOrder', 'customModels']).then((result) => {
      const localConversationsOrder = result.conversationsOrder || [];
      return chrome.storage.sync.set({
        conversationsOrder: [...new Set([...syncConversationsOrder, ...localConversationsOrder])],
      }).then(() => chrome.storage.local.remove(['conversationsOrder']).then(() => {
        chrome.storage.local.set({
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
        });
      }));
    });
  });
}
// eslint-disable-next-line new-cap
const markdown = (role, searchValue = '') => new markdownit({
  html: role === 'assistant' && searchValue !== '',
  linkify: true,
  highlight(str, _lang) {
    const { language, value } = hljs.highlightAuto(str);
    return `<pre dir="ltr" class="w-full"><div class="bg-black mb-4 rounded-md"><div id='code-header' class="flex items-center relative text-gray-200 ${role === 'user' ? 'bg-gray-900' : 'bg-gray-800'} px-4 py-2 text-xs font-sans rounded-t-md" style='border-top-left-radius:6px;border-top-right-radius:6px;'><span class="">${language}</span><button id='copy-code' data-initialized="false" class="flex ml-auto gap-2"><svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>Copy code</button></div><div class="p-4 overflow-y-auto"><code class="!whitespace-pre hljs language-${language}">${value}</code></div></div></pre>`;
  },
});

function escapeHtml(html) {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
function addDevIndicator() {
  chrome.storage.local.get('environment', ({ environment }) => {
    if (environment === 'development') {
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
  scrollButtonWrapper.className = 'absolute flex items-center justify-center bg-gray-100 dark:bg-gray-600 text-gray-200 text-xs font-sans cursor-pointer rounded-md z-10';
  scrollButtonWrapper.style = 'bottom: 6rem;right: 3rem;width: 2rem;height: 4rem;flex-wrap:wrap;';
  const scrollUpButton = document.createElement('button');
  scrollUpButton.id = 'scroll-up-button';
  scrollUpButton.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 48 48" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M24 44V4m20 20L24 4 4 24"></path></svg>';
  scrollUpButton.className = 'flex items-center justify-center border-black/10 dark:border-gray-900/50 text-gray-800 dark:text-gray-100 hover:bg-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-200 text-xs font-sans cursor-pointer rounded-t-md z-10';
  scrollUpButton.style = 'width: 2rem;height: 2rem;border-bottom: 1px solid;';
  scrollUpButton.addEventListener('click', () => {
    const conversationTop = document.querySelector('[id^=message-wrapper-]');
    if (!conversationTop) return;
    conversationTop.scrollIntoView({ behavior: 'smooth' });
  });

  const scrollDownButton = document.createElement('button');
  scrollDownButton.id = 'scroll-down-button';
  scrollDownButton.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 48 48" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M24 4v40M4 24l20 20 20-20"></path></svg>';
  scrollDownButton.className = 'flex items-center justify-center border-black/10 dark:border-gray-900/50 text-gray-800 dark:text-gray-100 hover:bg-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-200 text-xs font-sans cursor-pointer rounded-b-md z-10';
  scrollDownButton.style = 'width: 2rem;height: 2rem;';
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
    sidebar.style = `${sidebar.style.cssText};transition:margin-left 0.3s ease-in-out;position:relative;overflow:unset`;
    mainContent.style.transition = 'padding-left 0.3s ease-in-out';

    const navToggleButton = document.createElement('div');
    navToggleButton.id = 'nav-toggle-button';
    navToggleButton.className = 'absolute flex items-center justify-center bg-gray-900 text-gray-200 text-xs font-sans cursor-pointer rounded-r-md z-50';

    if (settings?.navOpen || settings?.navOpen === undefined) {
      navToggleButton.style = 'width:16px;height:40px;right:-16px;bottom:0px;font-size:20px';
      navToggleButton.innerHTML = '‹';
    } else {
      sidebar.style.marginLeft = '-260px';
      mainContent.classList.replace('md:pl-[260px]', 'md:pl-0');
      navToggleButton.style = 'width:40px;height:40px;right:-40px;bottom:0px;font-size:20px';
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
            curNavToggleBtn.style = 'width:16px;height:40px;right:-16px;bottom:0px;font-size:20px';
            curNavToggleBtn.innerHTML = '‹';
          } else {
            const nav = document.querySelector('.w-\\[260px\\]').parentElement;
            const main = nav?.nextElementSibling;
            nav.style.marginLeft = '-260px';
            main.classList.replace('md:pl-[260px]', 'md:pl-0');
            curNavToggleBtn.style = 'width:40px;height:40px;right:-40px;bottom:0px;font-size:20px';
            curNavToggleBtn.innerHTML = '›';
          }
        });
      });
    });
    sidebar.appendChild(navToggleButton);
  });
}
function toggleTextAreaElemet(forceShow = false) {
  const main = document.querySelector('main');
  if (!main) return;
  const inputForm = main.querySelector('form');
  const textAreaElement = inputForm.querySelector('textarea');
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
      if (continueButton) continueButton.style.display = 'flex';
    }
  } else {
    textAreaParent.style = '';
  }
}
function showNewChatPage() {
  // chatStreamIsClosed = true;
  chrome.storage.local.get(['conversationsAreSynced', 'account'], (result) => {
    chrome.storage.local.set({ enabledPluginIds: [] }, () => {
      const pluginDropdownButton = document.querySelector('#navbar-plugins-dropdown-button');
      if (pluginDropdownButton) {
        pluginDropdownButton.disabled = false;
        pluginDropdownButton.style.opacity = 1;
        pluginDropdownButton.title = '';
      }
      const { conversationsAreSynced, account } = result;
      document.title = 'New Page';
      const planName = account?.account_plan?.subscription_plan || account?.accounts?.default?.entitlement?.subscription_plan || 'chatgptfreeplan';
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
      // addExamplePromptEventListener();
      const pinNav = document.querySelector('#pin-nav');
      if (pinNav) {
        pinNav.remove();
      }
      const { pathname, href, search } = new URL(window.location.toString());
      if (href !== 'https://chat.openai.com') {
        window.history.replaceState({}, '', 'https://chat.openai.com');
        const inputForm = main.querySelector('form');
        const textAreaElement = inputForm.querySelector('textarea');
        textAreaElement.focus();
      }
      toggleTextAreaElemet();
      initializeRegenerateResponseButton();// basically just hide the button, so conversationId is not needed
      handleQueryParams(search);
    });
  });
}
function handleQueryParams(query) {
  const urlParams = new URLSearchParams(query);
  const promptId = urlParams.get('pid');
  if (promptId) {
    getPrompt(promptId).then((prompt) => {
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
function replaceTextAreaElemet(settings) {
  const main = document.querySelector('main');
  if (!main) { return false; }
  const inputForm = main.querySelector('form');
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
    const textAreaElementWrapperHTML = '<div class="flex flex-col w-full py-2 flex-grow md:py-3 md:pl-4 relative border border-black/10 bg-white dark:border-gray-900/50 dark:text-white dark:bg-gray-700 rounded-md shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:shadow-[0_0_15px_rgba(0,0,0,0.10)]" style="display: none;"><textarea tabindex="0" rows="1" class="m-0 w-full resize-none border-0 bg-transparent p-0 pl-2 pr-7 focus:ring-0 focus-visible:ring-0 dark:bg-transparent md:pl-0" style="max-height: 200px; height: 0px; overflow-y: hidden; padding-right: 40px;" id="gptx-textarea" dir="auto"></textarea><button class="absolute p-1 rounded-md text-gray-500 bottom-1.5 right-1 md:bottom-2.5 md:right-2 hover:bg-gray-100 dark:hover:text-gray-400 dark:hover:bg-gray-900 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent" type="button"><svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 mr-1" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg></button></div>';
    // insert text area element wrapper in input form first child at the end
    inputForm.firstChild.insertAdjacentHTML('beforeend', textAreaElementWrapperHTML);
    textAreaElement = inputForm.querySelector('textarea');
  }
  const newTextAreaElement = textAreaElement.cloneNode(true);
  newTextAreaElement.id = 'gptx-textarea';
  newTextAreaElement.dir = 'auto';
  // auto resize textarea height up to 200px
  newTextAreaElement.style.height = 'auto';
  newTextAreaElement.style.height = `${newTextAreaElement.scrollHeight}px`;
  newTextAreaElement.style.maxHeight = '200px';
  newTextAreaElement.style.minHeight = '24px';
  newTextAreaElement.style.paddingRight = '40px';
  newTextAreaElement.style.overflowY = 'hidden';

  newTextAreaElement.addEventListener('keydown', textAreaElementKeydownEventListener);
  newTextAreaElement.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && event.which === 13 && !event.shiftKey) {
      disableTextInput = true;
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
  const main = document.querySelector('main');
  if (!main) return;
  const inputForm = main.querySelector('form');
  const textAreaElement = inputForm.querySelector('textarea');
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
    const messageCap = result?.conversationLimit?.message_cap || 24;
    const messageCapWindow = result?.conversationLimit?.message_cap_window || 181;
    const now = new Date().getTime();
    const gpt4counter = gpt4Timestamps.filter((timestamp) => now - timestamp < (messageCapWindow / 60) * 60 * 60 * 1000).length;
    const capExpiresAtTimeString = result.capExpiresAt ? `(Cap Expires At: ${result.capExpiresAt})` : '';
    if (gpt4counter) {
      gpt4CounterElement.innerText = `GPT4 requests (last ${getGPT4CounterMessageCapWindow(messageCapWindow)}): ${gpt4counter}/${messageCap} ${capExpiresAtTimeString}`;
    } else {
      gpt4CounterElement.innerText = `GPT4 requests (last ${getGPT4CounterMessageCapWindow(messageCapWindow)}): 0/${messageCap}`;
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
    const wordCount = text ? text.split(' ').length : 0;
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
  const main = document.querySelector('main');
  if (!main) { return false; }
  const inputForm = main.querySelector('form');
  const textAreaElement = inputForm.querySelector('textarea');
  if (!textAreaElement) { return false; }
  const submitButton = inputForm.querySelector('textarea ~ button');
  if (!submitButton) { return false; }
  if (isGenerating) { return false; }
  // if (submitButton.disabled) { return false; } // remove since openai now disables submit button when input is empty
  return true;
}
function addActionButtonWrapperAboveInput() {
  const regenerateResponseButton = Array.from(document.querySelectorAll('form button')).find(
    (button) => button.textContent === 'Regenerate response',
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
function showPluginStore() {
  chrome.storage.local.get(['allPlugins'], (result) => {
    const { allPlugins } = result;
    const popularPlugins = allPlugins.filter((plugin) => plugin.categories.map((c) => c.id).includes('most_popular'));
    const pluginStoreModal = initializePluginStoreModal(popularPlugins);
    const pluginStoreWrapper = document.createElement('div');
    pluginStoreWrapper.id = 'plugin-store-wrapper';
    pluginStoreWrapper.classList = 'absolute inset-0 z-10';
    pluginStoreWrapper.innerHTML = pluginStoreModal;
    document.body.appendChild(pluginStoreWrapper);
    addPluginStoreEventListener(popularPlugins);
  });
}
function registerShortkeys() {
  document.addEventListener('keydown', (e) => {
    if (e.metaKey || (isWindows() && e.ctrlKey)) {
      if (e.key === 'f' || e.key === 'F') {
        const searchbox = document.querySelector('#conversation-search');
        if (searchbox && searchbox !== document.activeElement) {
          searchbox.scrollIntoView();
          searchbox.focus();
          e.preventDefault();
        }
      }
    }
    // esc
    if (e.keyCode === 27) {
      if (document.querySelector('[id*=close-button]')) {
        document.querySelector('[id*=close-button]').click();
      } else {
        const stopGeneratingResponseButton = document.querySelector('#stop-generating-response-button');
        if (stopGeneratingResponseButton) {
          e.preventDefault();
          stopGeneratingResponseButton.click();
        }
      }
    }
    // cmnd + shift + p
    if ((e.metaKey || (isWindows() && e.ctrlKey)) && e.shiftKey && e.keyCode === 80) {
      e.preventDefault();
      showPluginStore();
    }
    // alt + shift + n
    if (e.altKey && e.shiftKey && e.keyCode === 78) {
      e.preventDefault();
      showNewChatPage();
    }
    // home key
    if (e.keyCode === 36) {
      // if active element is not the textarea, scroll to top
      if (document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        document.querySelector('#scroll-up-button').click();
      }
    }
    // end key
    if (e.keyCode === 35) {
      if (document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        document.querySelector('#scroll-down-button').click();
      }
    }
    // cm/ctrl + shift + s
    if ((e.metaKey || (isWindows() && e.ctrlKey)) && e.shiftKey && e.keyCode === 83) {
      if (!document.querySelector('#modal-settings')) {
        // open settings
        e.preventDefault();
        document.querySelector('#settings-button')?.click();
      }
    }
    // cm/ctrl + shift + l
    if ((e.metaKey || (isWindows() && e.ctrlKey)) && e.shiftKey && e.keyCode === 76) {
      if (!document.querySelector('#modal-newsletter-archive')) {
        // open newsletter
        e.preventDefault();
        document.querySelector('#newsletter-button')?.click();
      }
    }
  });
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
  const conversationListParent = document.querySelector('#conversation-list').parentElement;
  conversationListParent.style.transition = 'all 1s ease-in-out';
  conversationListParent.style.position = 'relative';
  const expandButton = document.createElement('button');
  expandButton.id = 'expand-sidebar-bottom-button';
  expandButton.classList = 'flex items-center justify-center w-10 h-4 relative rounded-md bg-gray-800 hover:bg-gray-700 ';
  expandButton.style = 'bottom:-8px;margin:auto';
  chrome.storage.local.get(['settings'], (result) => {
    const { settings } = result;
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
    const main = document.querySelector('main');
    if (!main) return;
    const inputForm = main.querySelector('form');
    const textAreaElement = inputForm.querySelector('textarea');
    const nav = document.querySelector('nav');
    const newChatButton = nav?.querySelector('a');
    newChatButton.classList = 'flex py-3 px-3 items-center gap-3 transition-colors duration-200 text-white cursor-pointer text-sm rounded-md border border-white/20 hover:bg-gray-500/10 mb-1 flex-shrink-0';
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
function highlight(text, searchTerm) {
  if (!text) return '';
  if (text.trim().length === 0) return '';
  if (searchTerm.trim().length === 0) return text;
  // escape special characters
  searchTerm = searchTerm.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  return text.replace(new RegExp(searchTerm, 'gi'), (match) => `<mark>${match}</mark>`);
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

function toast(text, type = 'info') {
  // show toast that text is copied to clipboard
  const element = document.createElement('div');
  element.style = 'position:fixed;right:24px;top:24px;border-radius:4px;background-color:#19c37d;padding:8px 16px;z-index:100001;';
  if (type === 'error') {
    element.style.backgroundColor = '#ef4146';
  }
  element.textContent = text;
  document.body.appendChild(element);
  setTimeout(
    () => {
      element.remove();
    },
    4000,
  );
}
