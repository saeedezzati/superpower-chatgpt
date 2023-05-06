// eslint-disable-next-line no-unused-vars
/* global createModal, updateEmailNewsletter, createReleaseNoteModal, languageList, writingStyleList, toneList, toast, loadConversationList, modelSwitcher, addModelSwitcherEventListener, API_URL:true */
const defaultPrompts = [
  { title: 'Continue', text: 'Please continue', isDefault: true },
  { title: 'Rewrite', text: 'Please rewrite your last response', isDefault: false },
  { title: 'Paraphrase', text: 'Please paraphrase your last response', isDefault: false },
  { title: 'Explain', text: 'Please explain your last response', isDefault: false },
  { title: 'Clarify', text: 'Please clarify your last response', isDefault: false },
  { title: 'Expand', text: 'Please expand your last response', isDefault: false },
  { title: 'Summarize', text: 'Please summarize your last response', isDefault: false },
];
function createSettingsModal(initialTab = 0) {
  const bodyContent = settingsModalContent(initialTab);
  const actionsBarContent = settingsModalActions();
  createModal('Settings', 'Your can change the Superpower settings here', bodyContent, actionsBarContent);
}
const inactiveTabElementStyles = 'border: 1px solid lightslategray;border-bottom:0; border-top-right-radius: 8px;border-top-left-radius: 8px; font-size: 0.8em;  padding:8px 12px;color: lightslategray;margin:-1px;min-height:100%;';
const activeTabElementStyles = 'background-color: #0b0d0e;border: 1px solid lightslategray; border-bottom:0; border-top-right-radius: 8px;border-top-left-radius: 8px; font-size: 0.8em;  padding:8px 12px;color: lightslategray;margin:-1px;min-height:100%;';
function selectedTabContent(selectedTab) {
  switch (selectedTab) {
    case 0:
      return generalTabContent();
    case 1:
      return autoSyncTabContent();
    case 2:
      return modelsTabContent();
    case 3:
      return customPromptTabContent();
    case 4:
      return exportTabContent();
    case 5:
      return newsletterTabContent();
    default:
      return generalTabContent();
  }
}
function settingsModalContent(initialTab = 0) {
  const settingsTabs = ['General', 'Auto Sync', 'models', 'Custom Prompts', 'Export', 'Newsletter'];
  let activeTab = initialTab;
  // create history modal content
  const content = document.createElement('div');
  content.style = 'display: flex; flex-direction: column; justify-content: start; align-items: start;width:100%; height: 100%;';
  const tabs = document.createElement('div');
  tabs.style = 'display: flex; flex-direction: row; justify-content: start; align-items: center; width: 100%; background-color: #1e1e2f;z-index:1000;border-bottom: 1px solid lightslategray;';
  settingsTabs.forEach((tab, index) => {
    const tabButton = document.createElement('button');
    if (activeTab === settingsTabs.indexOf(tab)) {
      tabButton.classList = 'active-tab';
    } else {
      tabButton.removeAttribute('class');
    }
    tabButton.style = activeTab === settingsTabs.indexOf(tab) ? activeTabElementStyles : inactiveTabElementStyles;
    tabButton.textContent = tab;
    tabButton.addEventListener('click', () => {
      activeTab = index;
      const activeTabElemet = document.querySelector('.active-tab');
      activeTabElemet.style = inactiveTabElementStyles;
      activeTabElemet.removeAttribute('class');
      tabButton.classList = 'active-tab';
      tabButton.style = activeTabElementStyles;
      const settingsModalTabContent = document.querySelector('#settings-modal-tab-content');
      const newContent = selectedTabContent(activeTab);
      settingsModalTabContent.parentNode.replaceChild(newContent, settingsModalTabContent);
    });
    tabs.appendChild(tabButton);
  });
  content.appendChild(tabs);
  content.appendChild(selectedTabContent(activeTab));
  return content;
}
function generalTabContent() {
  const content = document.createElement('div');
  content.id = 'settings-modal-tab-content';
  content.style = 'display: flex; justify-content: start; align-items: start;overflow-y: scroll; width:100%; padding: 16px; height: 100%;padding-bottom:80px;';
  const leftContent = document.createElement('div');
  leftContent.style = 'display: flex; flex-direction: column; justify-content: start; align-items: start; width: 50%;padding-right: 8px;';
  const rightContent = document.createElement('div');
  rightContent.style = 'display: flex; flex-direction: column; justify-content: start; align-items: end; width: 50%;padding-left: 8px;';
  // input history
  const promptHistorySwitch = createSwitch('Input History Shortkey', 'Enable/disable the up and down arrow to cycle through input history.', 'promptHistory', true);
  leftContent.appendChild(promptHistorySwitch);

  // dark mode
  const darkModeSwitchWrapper = document.createElement('div');
  darkModeSwitchWrapper.style = 'display: flex; flex-direction: column; justify-content: start; align-items: start; width: 100%; margin: 8px 0;';
  const darkModeSwitch = document.createElement('div');
  darkModeSwitch.style = 'display: flex; flex-direction: row; justify-content: start; align-items: center; width: 100%; margin: 8px 0;color:white;';
  darkModeSwitch.textContent = 'Dark mode';
  const darkModeLabel = document.createElement('label');
  darkModeLabel.className = 'switch';
  const darkModeInput = document.createElement('input');
  darkModeInput.type = 'checkbox';
  darkModeInput.checked = !!document.querySelector('html').classList.contains('dark');
  darkModeInput.addEventListener('change', () => {
    if (document.querySelector('html').classList.contains('dark')) {
      document.querySelector('html').classList.replace('dark', 'light');
      document.querySelector('html').style = 'color-scheme: light;';
      window.localStorage.setItem('theme', 'light');
    } else {
      document.querySelector('html').classList.replace('light', 'dark');
      document.querySelector('html').style = 'color-scheme: dark;';
      window.localStorage.setItem('theme', 'dark');
    }
  });
  const darkModeSlider = document.createElement('span');
  darkModeSlider.className = 'slider round';

  darkModeLabel.appendChild(darkModeInput);
  darkModeLabel.appendChild(darkModeSlider);
  darkModeSwitch.appendChild(darkModeLabel);
  darkModeSwitchWrapper.appendChild(darkModeSwitch);
  leftContent.appendChild(darkModeSwitchWrapper);

  // safe mode
  // const safeModeSwitch = createSwitch('Safe Mode', 'Safe mode is now integerated into Auto-Sync. This setting will be removed in the next version', 'safeMode', true, safeModeTrigger, 'Beta', true);
  // leftContent.appendChild(safeModeSwitch);

  // copy mode
  const copyModeSwitch = createSwitch('Copy mode', 'OFF: only copy response / ON: copy both request and response', 'copyMode', false);
  leftContent.appendChild(copyModeSwitch);

  // discord widget
  const discordWidget = document.createElement('div');
  discordWidget.innerHTML = '<iframe style="border-radius:8px;width:350px; max-width:100%;height:400px;" src="https://discord.com/widget?id=1083455984489476220&theme=dark" allowtransparency="true" frameborder="0" sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"></iframe>';
  rightContent.appendChild(discordWidget);
  content.appendChild(leftContent);
  content.appendChild(rightContent);
  // extra links
  const linkWrapper = document.createElement('div');
  linkWrapper.style = 'display: flex; flex-direction: row; flex-wrap:wrap; justify-content: start; align-items: start; width: 100%; padding: 8px 16px; position:absolute; bottom:0; left:0;background-color:#0b0d0e;border-top:1px solid #565869;';
  // upgrade plan
  const originalUpgradePlanButton = document.querySelector('#upgrade-plan-button');
  if (originalUpgradePlanButton) {
    const upgradePlanButton = document.createElement('div');
    upgradePlanButton.textContent = 'Upgrade plan ➜';
    upgradePlanButton.style = 'color: #999; font-size: 12px; margin: 8px 0;min-width: 25%;text-align:center;padding-right: 8px;padding-right:cursor:pointer;';
    upgradePlanButton.addEventListener('mouseover', () => {
      upgradePlanButton.style = 'color: gold; font-size: 12px; margin: 8px 0;min-width: 25%;text-align:center;padding-right: 8px;cursor:pointer;';
    });
    upgradePlanButton.addEventListener('mouseout', () => {
      upgradePlanButton.style = 'color: #999; font-size: 12px; margin: 8px 0;min-width: 25%;text-align:center;padding-right: 8px;cursor:pointer;';
    });
    upgradePlanButton.addEventListener('click', () => {
      document.querySelector('button[id=modal-close-button-settings]')?.click();
      originalUpgradePlanButton.click();
    });
    linkWrapper.appendChild(upgradePlanButton);
  }
  // upgrade plus
  const originalUpgradePlusButton = document.querySelector('#upgrade-plus-button');
  if (originalUpgradePlusButton) {
    const upgradePlusButton = document.createElement('div');
    upgradePlusButton.textContent = 'Upgrade to Plus ➜';
    upgradePlusButton.style = 'color: #999; font-size: 12px; margin: 8px 0;min-width: 25%;text-align:center;padding-right: 8px;padding-right:cursor:pointer;';
    upgradePlusButton.addEventListener('mouseover', () => {
      upgradePlusButton.style = 'color: gold; font-size: 12px; margin: 8px 0;min-width: 25%;text-align:center;padding-right: 8px;cursor:pointer;';
    });
    upgradePlusButton.addEventListener('mouseout', () => {
      upgradePlusButton.style = 'color: #999; font-size: 12px; margin: 8px 0;min-width: 25%;text-align:center;padding-right: 8px;cursor:pointer;';
    });
    upgradePlusButton.addEventListener('click', () => {
      document.querySelector('button[id=modal-close-button-settings]')?.click();
      originalUpgradePlusButton.click();
    });
    linkWrapper.appendChild(upgradePlusButton);
  }
  // My account
  const originalMyAccountButton = document.querySelector('#my-account-button');
  if (originalMyAccountButton) {
    const myAccountButton = document.createElement('div');
    myAccountButton.textContent = 'My account ➜';
    myAccountButton.style = 'color: #999; font-size: 12px; margin: 8px 0;min-width: 25%;text-align:center;padding-right: 8px;padding-right:cursor:pointer;';
    myAccountButton.addEventListener('mouseover', () => {
      myAccountButton.style = 'color: gold; font-size: 12px; margin: 8px 0;min-width: 25%;text-align:center;padding-right: 8px;cursor:pointer;';
    });
    myAccountButton.addEventListener('mouseout', () => {
      myAccountButton.style = 'color: #999; font-size: 12px; margin: 8px 0;min-width: 25%;text-align:center;padding-right: 8px;cursor:pointer;';
    });
    myAccountButton.addEventListener('click', () => {
      document.querySelector('button[id=modal-close-button-settings]')?.click();
      originalMyAccountButton.click();
    });
    linkWrapper.appendChild(myAccountButton);
  }
  // My plan
  const originalMyPlanButton = document.querySelector('#my-plan-button');
  if (originalMyPlanButton) {
    const myPlanButton = document.createElement('div');
    myPlanButton.textContent = 'My plan ➜';
    myPlanButton.style = 'color: #999; font-size: 12px; margin: 8px 0;min-width: 25%;text-align:center;padding-right: 8px;padding-right:cursor:pointer;';
    myPlanButton.addEventListener('mouseover', () => {
      myPlanButton.style = 'color: gold; font-size: 12px; margin: 8px 0;min-width: 25%;text-align:center;padding-right: 8px;cursor:pointer;';
    });
    myPlanButton.addEventListener('mouseout', () => {
      myPlanButton.style = 'color: #999; font-size: 12px; margin: 8px 0;min-width: 25%;text-align:center;padding-right: 8px;cursor:pointer;';
    });
    myPlanButton.addEventListener('click', () => {
      document.querySelector('button[id=modal-close-button-settings]')?.click();
      originalMyPlanButton.click();
    });
    linkWrapper.appendChild(myPlanButton);
  }
  // Improve ChatGPT
  const originalImproveButton = document.querySelector('#improve-button');
  if (originalImproveButton) {
    const improveButton = document.createElement('div');
    improveButton.textContent = 'Improve ChatGPT ➜';
    improveButton.style = 'color: #999; font-size: 12px; margin: 8px 0;min-width: 25%;text-align:center;padding-right: 8px;padding-right:cursor:pointer;';
    improveButton.addEventListener('mouseover', () => {
      improveButton.style = 'color: gold; font-size: 12px; margin: 8px 0;min-width: 25%;text-align:center;padding-right: 8px;cursor:pointer;';
    });
    improveButton.addEventListener('mouseout', () => {
      improveButton.style = 'color: #999; font-size: 12px; margin: 8px 0;min-width: 25%;text-align:center;padding-right: 8px;cursor:pointer;';
    });
    improveButton.addEventListener('click', () => {
      document.querySelector('button[id=modal-close-button-settings]')?.click();
      originalImproveButton.click();
    });
    linkWrapper.appendChild(improveButton);
  }
  // Add a link to openai discord
  const discordLink = document.createElement('a');
  discordLink.href = 'https://discord.com/channels/974519864045756446/1053182622626492466';
  discordLink.target = '_blank';
  discordLink.textContent = 'OpenAI Discord ➜';
  discordLink.style = 'color: #999; font-size: 12px; margin: 8px 0;min-width: 25%;text-align:center;padding-right: 8px;';
  discordLink.addEventListener('mouseover', () => {
    discordLink.style = 'color: gold; font-size: 12px; margin: 8px 0;min-width: 25%;text-align:center;padding-right: 8px;';
  });
  discordLink.addEventListener('mouseout', () => {
    discordLink.style = 'color: #999; font-size: 12px; margin: 8px 0;min-width: 25%;text-align:center;padding-right: 8px;';
  });
  // linkWrapper.appendChild(discordLink);
  // add a link to Updates and FAQ
  const updatesLink = document.createElement('a');
  updatesLink.href = 'https://help.openai.com/en/collections/3742473-chatgpt';
  updatesLink.target = '_blank';
  updatesLink.textContent = 'Get help ➜';
  updatesLink.style = 'color: #999; font-size: 12px; margin: 8px 0;min-width: 25%;text-align:center;padding-right: 8px;padding-right:';
  updatesLink.addEventListener('mouseover', () => {
    updatesLink.style = 'color: gold; font-size: 12px; margin: 8px 0;min-width: 25%;text-align:center;padding-right: 8px;';
  });
  updatesLink.addEventListener('mouseout', () => {
    updatesLink.style = 'color: #999; font-size: 12px; margin: 8px 0;min-width: 25%;text-align:center;padding-right: 8px;';
  });
  linkWrapper.appendChild(updatesLink);
  // add link for feedback email
  const feedbackLink = document.createElement('a');
  feedbackLink.href = 'mailto:m4rkobay@gmail.com?subject=Superpower for ChatGPT Feature Request&body=Hi Marko,%0DReporting a bug? Any of the following information would help me figure it out faster: %0D- What version of the extension do you have? (You can find that at the bottom of the "settings" menu) %0D- What browser are you using? %0D- Do you see any errors in the console log? %0D- Do you have a plus account? %0D- How many conversations do you have approximately? %0D- Do you have the Auto Sync feature ON? %0D- Are all of your conversations synced? %0D- Do you see the "settings" menu on the sidebar? %0D- Does your issue go away if you turn the Auto Sync OFF in the settings menu? %0D- Does this issue happen to all prompts? Or only the first prompt? %0D- Are you using any other ChatGPT extensions at the same time? %0D- Can you email me a screenshot or video of the ChatGPT page when the bug happens? (with the extension installed)%0DThanks!';
  feedbackLink.target = '_blank';
  feedbackLink.textContent = 'Feature Request ➜';
  feedbackLink.style = 'color: #999; font-size: 12px; margin: 8px 0;min-width: 25%;text-align:center;padding-right: 8px;';
  feedbackLink.addEventListener('mouseover', () => {
    feedbackLink.style = 'color: gold; font-size: 12px; margin: 8px 0;min-width: 25%;text-align:center;padding-right: 8px;';
  });
  feedbackLink.addEventListener('mouseout', () => {
    feedbackLink.style = 'color: #999; font-size: 12px; margin: 8px 0;min-width: 25%;text-align:center;padding-right: 8px;';
  });
  // linkWrapper.appendChild(feedbackLink);

  // add link for sponsorship
  const sponsorLink = document.createElement('a');
  sponsorLink.href = 'https://ezi.notion.site/Sponsorship-3d0442f1e8634978902cf366c44be016';
  sponsorLink.target = '_blank';
  sponsorLink.textContent = 'Sponsorship ➜';
  sponsorLink.style = 'color: #999; font-size: 12px; margin: 8px 0;min-width: 25%;text-align:center;padding-right: 8px;';
  sponsorLink.addEventListener('mouseover', () => {
    sponsorLink.style = 'color: gold; font-size: 12px; margin: 8px 0;min-width: 25%;text-align:center;padding-right: 8px;';
  });
  sponsorLink.addEventListener('mouseout', () => {
    sponsorLink.style = 'color: #999; font-size: 12px; margin: 8px 0;min-width: 25%;text-align:center;padding-right: 8px;';
  });
  linkWrapper.appendChild(sponsorLink);

  // add link for sponsorship
  const faqLink = document.createElement('a');
  faqLink.href = 'https://ezi.notion.site/Superpower-ChatGPT-FAQ-9d43a8a1c31745c893a4080029d2eb24';
  faqLink.target = '_blank';
  faqLink.textContent = 'FAQ ➜';
  faqLink.style = 'color: #999; font-size: 12px; margin: 8px 0;min-width: 25%;text-align:center;padding-right: 8px;';
  faqLink.addEventListener('mouseover', () => {
    faqLink.style = 'color: gold; font-size: 12px; margin: 8px 0;min-width: 25%;text-align:center;padding-right: 8px;';
  });
  faqLink.addEventListener('mouseout', () => {
    faqLink.style = 'color: #999; font-size: 12px; margin: 8px 0;min-width: 25%;text-align:center;padding-right: 8px;';
  });
  linkWrapper.appendChild(faqLink);
  content.appendChild(linkWrapper);

  return content;
}
function autoSyncTabContent() {
  const content = document.createElement('div');
  content.id = 'settings-modal-tab-content';
  content.style = 'display: flex; flex-direction: column; justify-content: start; align-items: start;overflow-y: scroll; width:100%; padding: 16px; margin-width:100%; height: 100%;';
  // Auto Sync
  const autoSyncSwitch = createSwitch('Auto Sync', 'Automatically download and sync all your conversations to your computer. Auto Sync only works when ChatGPT is open. Disabling Auto Sync will also disable some of the existing features such as the ability to search for messages and many future features that rely on Auto Sync.(Requires Refresh)', 'autoSync', true, refreshPage);
  content.appendChild(autoSyncSwitch);
  chrome.storage.local.get(['settings'], (result) => {
    const { autoSync } = result.settings;

    const conversationTimestampSwitch = createSwitch('Conversation Timestamp', 'OFF: Created time, ON: Last updated time', 'conversationTimestamp', false, reloadConversationList, 'Requires Auto-Sync', !autoSync);
    content.appendChild(conversationTimestampSwitch);

    const pinNavSwitch = createSwitch('Pin Navigation', 'Show/hide message pins for quick navigation(only when conversations are fully synced)', 'showPinNav', true, refreshPage, 'Requires Auto-Sync', !autoSync);
    content.appendChild(pinNavSwitch);

    const showGpt4Counter = createSwitch('Show GPT-4 Counter', 'Show the number of GPT-4 messages in the last 3 hours', 'showGpt4Counter', true, toggleGpt4Counter, 'Requires Auto-Sync', !autoSync);
    content.appendChild(showGpt4Counter);

    const autoHideTopNav = createSwitch('Auto hide Top Navbar', 'Automatically hide the navbar at the top of the page when move the mouse out of it.', 'autoHideTopNav', true, toggleTopNav, 'Requires Auto-Sync', !autoSync);
    content.appendChild(autoHideTopNav);
  });
  return content;
}
function reloadConversationList() {
  loadConversationList(true);
}
function toggleGpt4Counter(show) {
  const gpt4CounterElement = document.querySelector('#gpt4-counter');
  if (gpt4CounterElement) gpt4CounterElement.style.display = show ? 'block' : 'none';
}
function toggleTopNav(autohide) {
  const navWrapperElement = document.querySelector('#gptx-nav-wrapper');
  if (autohide) {
    navWrapperElement.style.top = '-56px';
    navWrapperElement.style.position = 'absolute';
    navWrapperElement.style.height = '112px';
    navWrapperElement.style.paddingRight = '260px';
  } else {
    navWrapperElement.style.top = '0px';
    navWrapperElement.style.position = 'relative';
    navWrapperElement.style.paddingRight = '0px';
    navWrapperElement.style.height = '56px';
  }
}
function modelsTabContent() {
  const content = document.createElement('div');
  content.id = 'settings-modal-tab-content';
  content.style = 'display: flex; flex-direction: column; justify-content: start; align-items: start;overflow-y: scroll; width:100%; padding: 16px; margin-width:100%; height: 100%;';

  const modelSwitcherRow = document.createElement('div');
  modelSwitcherRow.style = 'display: flex; flex-direction: row; justify-content: start; align-items: center; width:100%;';

  const modelSwitcherWrapper = document.createElement('div');
  modelSwitcherWrapper.style = 'position:relative;min-width:200px;z-index:1000; pointer-events: none;';
  const idPrefix = 'settings';
  modelSwitcherWrapper.id = `model-switcher-wrapper-${idPrefix}`;
  modelSwitcherRow.appendChild(modelSwitcherWrapper);
  content.appendChild(modelSwitcherRow);
  const betaTag = document.createElement('span');
  betaTag.style = 'background-color: #ff9800; color: white; padding: 2px 4px; border-radius: 8px; font-size: 0.6em;margin-top:8px;';
  betaTag.textContent = 'Requires Auto-Sync';
  content.appendChild(betaTag);
  chrome.storage.local.get(['settings', 'models', 'unofficialModels', 'customModels'], (result) => {
    const {
      models, unofficialModels, customModels, settings,
    } = result;
    const allModels = [...models, ...unofficialModels, ...customModels];
    const { autoSync } = result.settings;
    modelSwitcherWrapper.innerHTML = modelSwitcher(allModels, settings.selectedModel, idPrefix, customModels, true);
    addModelSwitcherEventListener(idPrefix, true);
    if (autoSync) {
      modelSwitcherWrapper.style.pointerEvents = 'all';
    } else {
      modelSwitcherWrapper.style.pointerEvents = 'none';
    }
    const unofficialNote = document.createElement('div');
    unofficialNote.style = 'color: #eee; font-size: 0.8em; margin-left:8px';
    unofficialNote.textContent = 'Unofficial and custom models are experimental. They may or may not work. This feature was implemented to make it easy to test other models.';
    modelSwitcherRow.appendChild(unofficialNote);
  });
  const newCustomModelWrapper = document.createElement('div');
  newCustomModelWrapper.id = 'new-custom-model-wrapper';
  newCustomModelWrapper.style = 'display: flex; flex-direction: row; justify-content: start; align-items: center; width: 100%; margin-top: 24px; flex-wrap:wrap;padding: 8px; border-radius: 8px;background-color: #1e1e2f;';
  const newCustomModelInputWrapper = document.createElement('div');
  newCustomModelInputWrapper.style = 'display: flex; flex-direction: row; justify-content: start; align-items: start; width: 100%; margin: 8px 0;';
  const newCustomModelWrapperTitle = document.createElement('div');
  newCustomModelWrapperTitle.style = 'width: 100%; margin: 8px 0;color: #eee;';
  newCustomModelWrapperTitle.innerHTML = 'Add a Custom Model<span style="background-color: rgb(255, 152, 0); color: white; padding: 2px 4px; border-radius: 8px; font-size: 0.6em; margin-left: 8px;position:relative; bottom:2px;">Experimental</span>';

  const newCustomModelSlug = document.createElement('input');
  newCustomModelSlug.style = 'width: 160px; height: 34px; border-radius: 4px; border: 1px solid #565869; background-color: #0b0d0e;margin-right:8px; color: #eee; padding: 0 8px; font-size: 14px;';
  newCustomModelSlug.placeholder = 'Model Slug';
  newCustomModelSlug.autocomplete = 'off';
  // only accept alphanumerics and dashes and parentheses and underscores
  newCustomModelSlug.pattern = '[a-zA-Z0-9-_()]+';
  newCustomModelSlug.autofocus = true;
  newCustomModelSlug.dir = 'auto';
  newCustomModelSlug.addEventListener('input', () => {
    newCustomModelSlug.style.borderColor = '#565869';
    repeatedSlugError.style.visibility = 'hidden';
  });

  const newCustomModelText = document.createElement('textarea');
  newCustomModelText.style = 'width: 100%; height: 34px; min-height: 34px; border-radius: 4px; border: 1px solid #565869; background-color: #0b0d0e; color: #eee; padding: 4px 8px; font-size: 14px;';
  newCustomModelText.placeholder = 'Model description';
  newCustomModelText.dir = 'auto';
  newCustomModelText.addEventListener('input', () => {
    newCustomModelText.style.borderColor = '#565869';
  });

  const repeatedSlugError = document.createElement('div');
  repeatedSlugError.id = 'repeated-name-error';
  repeatedSlugError.style = 'color: #f56565; font-size: 10px;visibility: hidden;';
  repeatedSlugError.textContent = 'Another model with this slug already exist.';
  const newCustomModelButtonWrapper = document.createElement('div');
  newCustomModelButtonWrapper.style = 'display: flex; flex-direction: row; justify-content: end; align-items: center; width: 100%; margin-bottom: 16px;';
  const newCustomModelSlugDescription = document.createElement('div');
  newCustomModelSlugDescription.style = 'width: 100%; margin: 8px 8px 8px 0; font-size: 12px; color: #eee;';
  newCustomModelSlugDescription.textContent = 'The slug is used to identify the model by OpenAI. Description can be anything, but slug has to be the official name of the model in OpenAI';

  const newCustomModelCancelButton = document.createElement('button');
  newCustomModelCancelButton.textContent = 'Cancel';
  newCustomModelCancelButton.classList = 'btn flex justify-center gap-2 btn-dark border-0 md:border mr-2';
  newCustomModelCancelButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const curnewCustomModelWrapper = document.getElementById('new-custom-model-wrapper');
    curnewCustomModelWrapper.remove();
  });
  const newCustomModelSaveButton = document.createElement('button');
  newCustomModelSaveButton.textContent = 'Save';
  newCustomModelSaveButton.classList = 'btn flex justify-center gap-2 btn-primary border-0 md:border';
  newCustomModelSaveButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!newCustomModelText.value.trim()) {
      newCustomModelText.style.borderColor = '#ff4a4a';
    }
    if (!newCustomModelSlug.value.trim()) {
      newCustomModelSlug.style.borderColor = '#ff4a4a';
    }
    if (!newCustomModelSlug.value.trim() || !newCustomModelText.value.trim()) return;
    chrome.storage.local.get(['models', 'unofficialModels', 'customModels', 'settings'], (res) => {
      const allModels = [...res.models, ...res.unofficialModels, ...res.customModels];
      const newCustomModels = (res.customModels && res.customModels.length > 0) ? res.customModels : [];
      if (allModels.map((k) => k?.slug?.toLowerCase()).includes(newCustomModelSlug.value.trim().toLowerCase())) {
        newCustomModelSlug.style.borderColor = '#ff4a4a';
        repeatedSlugError.style.visibility = 'visible';
        return;
      }
      newCustomModels.push({
        title: `${newCustomModelSlug.value.trim()}`,
        description: newCustomModelText.value.trim(),
        slug: newCustomModelSlug.value.trim(),
        tags: ['Custom'],
      });
      chrome.storage.local.set({ customModels: newCustomModels }, () => {
        const modelSwitcherWrappers = document.querySelectorAll('[id^=model-switcher-wrapper-]');
        modelSwitcherWrappers.forEach((wrapper) => {
          const curIdPrefix = wrapper.id.split('model-switcher-wrapper-')[1];
          const newAllModels = [...res.models, ...res.unofficialModels, ...newCustomModels];
          wrapper.innerHTML = modelSwitcher(newAllModels, res.settings.selectedModel, curIdPrefix, newCustomModels, true);
          addModelSwitcherEventListener(curIdPrefix, true);
        });
        // clear the input fields
        newCustomModelText.value = '';
        newCustomModelSlug.value = '';
      });
    });
  });
  newCustomModelWrapper.appendChild(newCustomModelWrapperTitle);
  newCustomModelInputWrapper.appendChild(newCustomModelSlug);
  newCustomModelInputWrapper.appendChild(newCustomModelText);
  newCustomModelButtonWrapper.appendChild(newCustomModelSlugDescription);
  newCustomModelButtonWrapper.appendChild(newCustomModelCancelButton);
  newCustomModelButtonWrapper.appendChild(newCustomModelSaveButton);
  newCustomModelWrapper.appendChild(newCustomModelInputWrapper);
  newCustomModelWrapper.appendChild(repeatedSlugError);
  newCustomModelWrapper.appendChild(newCustomModelButtonWrapper);
  content.appendChild(newCustomModelWrapper);
  return content;
}
function customPromptTabContent() {
  const content = document.createElement('div');
  content.id = 'settings-modal-tab-content';
  content.style = 'display: flex; flex-direction: column; justify-content: start; align-items: start;overflow-y: scroll; width:100%; padding: 16px; margin-width:100%; height: 100%;';

  chrome.storage.local.get(['customPrompts'], (result) => {
    // custom prompts section
    const customPromptSectionWrapper = document.createElement('div');
    customPromptSectionWrapper.style = 'display: flex; justify-content:space-between; align-items:center; width: 100%; color: lightslategray; font-size: 16px; margin: 24px 0 12px 0;';
    const customPromptSection = document.createElement('div');
    customPromptSection.style = 'color: lightslategray; font-size: 16px; margin: 12px 0;';
    customPromptSection.textContent = 'Custom Prompts';

    const newCustomPromptButton = document.createElement('button');
    newCustomPromptButton.textContent = 'Add New Custom Prompts';
    newCustomPromptButton.classList = 'btn flex justify-center gap-2 btn-dark border-0 md:border';
    newCustomPromptButton.addEventListener('click', () => {
      const existingNewCustomPromptWrapper = document.querySelector('#new-custom-prompt-wrapper');
      if (existingNewCustomPromptWrapper) return;
      const newCustomPromptWrapper = document.createElement('div');
      newCustomPromptWrapper.id = 'new-custom-prompt-wrapper';
      newCustomPromptWrapper.style = 'display: flex; flex-direction: row; justify-content: start; align-items: center; width: 100%; margin: 8px 0; flex-wrap:wrap;padding: 8px; border-radius: 8px;background-color: #1e1e2f;';
      const newCustomPromptInputWrapper = document.createElement('div');
      newCustomPromptInputWrapper.style = 'display: flex; flex-direction: row; justify-content: start; align-items: start; width: 100%; margin: 8px 0;';
      const newCustomPromptTitle = document.createElement('input');
      newCustomPromptTitle.style = 'width: 120px; height: 34px; border-radius: 4px; border: 1px solid #565869; background-color: #0b0d0e;margin-right:8px; color: #eee; padding: 0 8px; font-size: 14px;';
      newCustomPromptTitle.placeholder = 'Prompt Title';
      newCustomPromptTitle.autofocus = true;
      newCustomPromptTitle.dir = 'auto';
      newCustomPromptTitle.addEventListener('input', () => {
        newCustomPromptTitle.style.borderColor = '#565869';
        repeatedNameError.style.visibility = 'hidden';
      });
      const newCustomPromptText = document.createElement('textarea');
      newCustomPromptText.style = 'width: 100%; height: 34px; min-height: 34px; border-radius: 4px; border: 1px solid #565869; background-color: #0b0d0e; color: #eee; padding: 4px 8px; font-size: 14px;';
      newCustomPromptText.placeholder = 'Prompt Text';
      newCustomPromptText.dir = 'auto';
      newCustomPromptText.addEventListener('input', () => {
        newCustomPromptText.style.borderColor = '#565869';
      });
      const repeatedNameError = document.createElement('div');
      repeatedNameError.id = 'repeated-name-error';
      repeatedNameError.style = 'color: #f56565; font-size: 10px;visibility: hidden;';
      repeatedNameError.textContent = 'Another custom prompt with this name already exist. Please use a different name.';
      const newCustomPromptButtonWrapper = document.createElement('div');
      newCustomPromptButtonWrapper.style = 'display: flex; flex-direction: row; justify-content: end; align-items: center; width: 100%; margin-bottom: 16px;';
      const newCustomPromptCancelButton = document.createElement('button');
      newCustomPromptCancelButton.textContent = 'Cancel';
      newCustomPromptCancelButton.classList = 'btn flex justify-center gap-2 btn-dark border-0 md:border mr-2';
      newCustomPromptCancelButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const curNewCustomPromptWrapper = document.getElementById('new-custom-prompt-wrapper');
        curNewCustomPromptWrapper.remove();
      });
      const newCustomPromptSaveButton = document.createElement('button');
      newCustomPromptSaveButton.textContent = 'Save';
      newCustomPromptSaveButton.classList = 'btn flex justify-center gap-2 btn-primary border-0 md:border';
      newCustomPromptSaveButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!newCustomPromptTitle.value.trim()) {
          newCustomPromptTitle.style.borderColor = '#ff4a4a';
        }
        if (!newCustomPromptText.value.trim()) {
          newCustomPromptText.style.borderColor = '#ff4a4a';
        }
        if (!newCustomPromptTitle.value.trim() || !newCustomPromptText.value.trim()) return;
        chrome.storage.local.get(['customPrompts'], (res) => {
          const newCustomPrompts = (res.customPrompts && res.customPrompts.length > 0) ? res.customPrompts : defaultPrompts;
          if (newCustomPrompts.map((k) => k.title.toLowerCase()).includes(newCustomPromptTitle.value.trim().toLowerCase())) {
            newCustomPromptTitle.style.borderColor = '#ff4a4a';
            repeatedNameError.style.visibility = 'visible';
            return;
          }
          newCustomPrompts.push({ title: newCustomPromptTitle.value.trim(), text: newCustomPromptText.value.trim(), isDefault: false });
          chrome.storage.local.set({ customPrompts: newCustomPrompts }, () => {
            // add new custom prompt right after curNewCustomPromptWrapper
            const curNewCustomPromptWrapper = document.getElementById('new-custom-prompt-wrapper');
            const newCustomPromptRow = createPromptRow(newCustomPromptTitle.value.trim(), newCustomPromptText.value.trim(), false, 'customPrompts');
            curNewCustomPromptWrapper.parentNode.insertBefore(newCustomPromptRow, curNewCustomPromptWrapper.nextSibling);
            curNewCustomPromptWrapper.remove();
          });
        });
      });
      newCustomPromptInputWrapper.appendChild(newCustomPromptTitle);
      newCustomPromptInputWrapper.appendChild(newCustomPromptText);
      newCustomPromptButtonWrapper.appendChild(newCustomPromptCancelButton);
      newCustomPromptButtonWrapper.appendChild(newCustomPromptSaveButton);
      newCustomPromptWrapper.appendChild(newCustomPromptInputWrapper);
      newCustomPromptWrapper.appendChild(repeatedNameError);
      newCustomPromptWrapper.appendChild(newCustomPromptButtonWrapper);
      // insert after customPromptSectionWrapper
      customPromptSectionWrapper.parentNode.insertBefore(newCustomPromptWrapper, customPromptSectionWrapper.nextSibling);
    });
    customPromptSectionWrapper.appendChild(customPromptSection);
    customPromptSectionWrapper.appendChild(newCustomPromptButton);
    content.appendChild(customPromptSectionWrapper);
    const { customPrompts } = result;
    if (customPrompts) {
      for (let i = 0; i < customPrompts?.length; i += 1) {
        const promptTitle = customPrompts[i].title;
        const promptText = customPrompts[i].text;
        const { isDefault } = customPrompts[i];
        const promptRow = createPromptRow(promptTitle, promptText, isDefault, 'customPrompts');
        content.appendChild(promptRow);
      }
    }
    const extraSpaceDiv = document.createElement('div');
    extraSpaceDiv.style = 'min-height: 200px;';
    content.appendChild(extraSpaceDiv);
  });
  return content;
}
function createPromptRow(promptTitle, promptText, isDefault, promptObjectName) {
  const promptWrapper = document.createElement('div');
  promptWrapper.style = 'display: flex; flex-direction: row; justify-content: start; align-items: center; width: 100%; margin: 8px 0;';
  const promptLabel = document.createElement('div');
  promptLabel.style = 'min-width: 100px; max-width:100px; margin-right: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;;color:white;text-transform: capitalize;';
  promptLabel.innerText = promptTitle;
  promptLabel.title = promptTitle;
  promptLabel.dir = 'auto';
  const promptInput = document.createElement('textarea');
  promptInput.style = 'width: 100%; height: 34px; min-height: 34px; border-radius: 4px; border: 1px solid #565869; background-color: #1e1e2f; color: #eee; padding: 4px 8px; font-size: 14px;';
  promptInput.id = `${promptObjectName}-${promptTitle}`;
  promptInput.dir = 'auto';
  promptInput.value = promptText;
  promptInput.addEventListener('change', () => {
    chrome.storage.local.get([promptObjectName], (res) => {
      const newPrompts = res[promptObjectName];
      newPrompts.find((p) => p.title === promptTitle).text = promptInput.value.trim();
      chrome.storage.local.set({ [promptObjectName]: newPrompts });
    });
  });
  promptWrapper.appendChild(promptLabel);
  promptWrapper.appendChild(promptInput);
  if (promptObjectName === 'customPrompts') {
    const deleteButton = document.createElement('button');
    deleteButton.classList = 'btn flex justify-center gap-2 btn-dark border-0 md:border ml-2';
    deleteButton.style = 'min-width:72px;height:34px;';
    deleteButton.textContent = 'Delete';
    deleteButton.disabled = isDefault;
    deleteButton.addEventListener('click', (e) => {
      if (e.target.textContent === 'Confirm') {
        chrome.storage.local.get([promptObjectName], (res) => {
          let newPrompts = res[promptObjectName];
          if (newPrompts.length <= 1) {
            toast('You must have at least one custom prompt', 'error');
          } else if (newPrompts.find((p) => p.title === promptTitle).isDefault) {
            toast('You cannot delete a default prompt', 'error');
          } else {
            newPrompts = newPrompts.filter((p) => p.title !== promptTitle);
            chrome.storage.local.set({ [promptObjectName]: newPrompts }, () => {
              promptWrapper.remove();
            });
          }
        });
      } else {
        e.target.textContent = 'Confirm';
        e.target.style.backgroundColor = '#864e6140';
        e.target.style.color = '#ff4a4a';
        e.target.style.borderColor = '#ff4a4a';
        setTimeout(() => {
          e.target.textContent = 'Delete';
          e.target.style = 'min-width:72px;height:34px;';
        }, 1500);
      }
    });
    promptWrapper.appendChild(deleteButton);

    const defaultButton = document.createElement('button');
    defaultButton.classList = `btn flex justify-center gap-2 ${isDefault ? 'btn-primary' : 'btn-dark'} border-0 md:border ml-2`;
    defaultButton.setAttribute('data-default', isDefault ? 'true' : 'false');
    defaultButton.style = 'min-width:72px;height:34px;';
    defaultButton.textContent = 'Default';
    defaultButton.addEventListener('click', () => {
      chrome.storage.local.get([promptObjectName], (res) => {
        const newPrompts = res[promptObjectName];
        newPrompts.find((p) => p.isDefault).isDefault = false;
        newPrompts.find((p) => p.title === promptTitle).isDefault = true;
        chrome.storage.local.set({ [promptObjectName]: newPrompts }, () => {
          const curDefaultButton = document.querySelector('[data-default="true"]');
          const curDeleteButton = [...curDefaultButton.parentNode.querySelectorAll('button')].find((b) => b.textContent === 'Delete');
          curDeleteButton.disabled = false;
          curDefaultButton.setAttribute('data-default', 'false');
          curDefaultButton.classList = 'btn flex justify-center gap-2 btn-dark border-0 md:border ml-2';
          defaultButton.classList = 'btn flex justify-center gap-2 btn-primary border-0 md:border ml-2';
          defaultButton.textContent = 'Default';
          defaultButton.setAttribute('data-default', 'true');
          defaultButton.style = 'min-width:72px;height:34px;';
          const newDeleteButton = [...promptWrapper.querySelectorAll('button')].find((b) => b.textContent === 'Delete');
          newDeleteButton.disabled = true;
        });
      });
    });
    promptWrapper.appendChild(defaultButton);
  }
  return promptWrapper;
}
function exportTabContent() {
  const content = document.createElement('div');
  content.id = 'settings-modal-tab-content';
  content.style = 'display: flex; flex-direction: column; justify-content: start; align-items: start;overflow-y: scroll; width:100%; padding: 16px; margin-width:100%; height: 100%;';
  // Export Mode
  const exportModeSwitchWrapper = document.createElement('div');
  exportModeSwitchWrapper.style = 'display: flex; flex-direction: column; justify-content: start; align-items: start; width: 100%; margin: 8px 0;';
  const exportModeSwitch = document.createElement('div');
  exportModeSwitch.style = 'display: flex; flex-direction: row; justify-content: start; align-items: center; width: 100%; margin: 8px 0; color:white;';
  exportModeSwitch.textContent = 'Export mode';
  const exportModeHelper = document.createElement('div');
  exportModeHelper.style = 'font-size: 12px; color: #999;';
  const exportModeLabel = document.createElement('label');
  exportModeLabel.className = 'switch';
  const exportModeInput = document.createElement('input');
  exportModeInput.type = 'checkbox';
  chrome.storage.local.get('settings', ({ settings }) => {
    exportModeInput.checked = settings.exportMode === 'both';
    exportModeHelper.textContent = settings.exportMode === 'both' ? 'Export both Assistant and User\'s chats' : 'Export only Assistant\'s chats';
  });
  exportModeInput.addEventListener('change', () => {
    chrome.storage.local.get('settings', ({ settings }) => {
      settings.exportMode = exportModeInput.checked ? 'both' : 'assistant';
      exportModeHelper.textContent = settings.exportMode === 'both' ? 'Export both Assistant and User\'s chats' : 'Export only Assistant\'s chats';
      chrome.storage.local.set({ settings });
    });
  });
  const exportModeSlider = document.createElement('span');
  exportModeSlider.className = 'slider round';

  exportModeLabel.appendChild(exportModeInput);
  exportModeLabel.appendChild(exportModeSlider);
  exportModeSwitch.appendChild(exportModeLabel);
  exportModeSwitchWrapper.appendChild(exportModeSwitch);
  exportModeSwitchWrapper.appendChild(exportModeHelper);

  // export format
  const exportNamingFormatLabel = document.createElement('div');
  exportNamingFormatLabel.style = 'display: flex; flex-direction: row; justify-content: start; align-items: center; width: 100%; margin: 8px 0; color:white; opacity: 0.5;';
  exportNamingFormatLabel.textContent = 'Export naming format';
  const betaTag = document.createElement('span');
  betaTag.style = 'background-color: #ff9800; color: white; padding: 2px 4px; border-radius: 8px; margin-left: 8px; font-size: 0.6em;';
  betaTag.textContent = 'Coming soon';
  content.appendChild(exportModeSwitchWrapper);
  content.appendChild(exportNamingFormatLabel);
  exportNamingFormatLabel.appendChild(betaTag);
  return content;
}
function newsletterTabContent() {
  const content = document.createElement('div');
  content.id = 'settings-modal-tab-content';
  content.style = 'display: flex; flex-direction: column; justify-content: start; align-items: start;overflow-y: scroll; width:100%; padding: 16px; margin-width:100%; height: 100%;';
  // daily newsletter
  const dailyNewsletterSwitch = createSwitch('Hide daily newsletter', 'Automatically hide the daily newsletter popup.', 'hideNewsletter', false);
  content.appendChild(dailyNewsletterSwitch);

  // const sendNewsletterToEmailSwitch = createSwitch('Email newsletter', 'Send the Superpower for ChatGPT daily newsletter to my email', 'emailNewsletter', false, updateEmailNewsletter, 'Coming soon');

  // content.appendChild(sendNewsletterToEmailSwitch);
  return content;
}
function createSwitch(title, subtitle, settingsKey, defaultValue, callback = null, tag = '', disabled = false) {
  const switchWrapper = document.createElement('div');
  switchWrapper.style = 'display: flex; flex-direction: column; justify-content: start; align-items: start; width: 100%; margin: 8px 0;';
  const switchElement = document.createElement('div');
  switchElement.style = `display: flex; flex-direction: row; justify-content: start; align-items: center; width: 100%; margin: 8px 0;color:white; ${disabled ? 'opacity: 0.5;' : ''}`;
  switchElement.innerHTML = title;
  const label = document.createElement('label');
  label.className = 'switch';
  const input = document.createElement('input');
  input.id = `switch-${title.toLowerCase().replaceAll(' ', '-')}`;
  input.type = 'checkbox';
  input.disabled = disabled;
  const betaTag = document.createElement('span');
  betaTag.style = 'background-color: #ff9800; color: white; padding: 2px 4px; border-radius: 8px; margin-left: 8px; font-size: 0.6em;';
  betaTag.textContent = tag;
  const helper = document.createElement('div');
  helper.style = 'font-size: 12px; color: #999;';
  helper.innerHTML = subtitle;
  if (settingsKey) {
    chrome.storage.local.get('settings', ({ settings }) => {
      const settingValue = settings[settingsKey];
      if (settingValue === undefined) {
        settings[settingsKey] = defaultValue;
        chrome.storage.local.set(settings);
      } else {
        input.checked = settingValue;
      }
    });
    input.addEventListener('change', () => {
      chrome.storage.local.get('settings', ({ settings }) => {
        settings[settingsKey] = input.checked;
        chrome.storage.local.set({ settings }, () => {
          if (callback) {
            callback(input.checked);
          }
        });
      });
    });
  } else {
    input.checked = defaultValue;
    input.addEventListener('change', () => {
      if (callback) {
        callback(input.checked);
      }
    });
  }
  const slider = document.createElement('span');
  slider.className = 'slider round';

  label.appendChild(input);
  label.appendChild(slider);
  switchElement.appendChild(label);
  if (tag) switchElement.appendChild(betaTag);
  switchWrapper.appendChild(switchElement);
  switchWrapper.appendChild(helper);
  return switchWrapper;
}
function refreshPage() {
  window.location.reload();
}
// function safeModeTrigger(safeMode) {
//   chrome.runtime.sendMessage({ type: 'safeMode', safeMode });
// }
function settingsModalActions() {
  // add actionbar at the bottom of the content
  const actionBar = document.createElement('div');
  actionBar.style = 'display: flex; flex-direction: row; justify-content: start; align-items: end; margin-top: 8px;';
  const logo = document.createElement('img');
  logo.src = chrome.runtime.getURL('icons/logo.png');
  logo.style = 'width: 40px; height: 40px;';
  logo.addEventListener('click', (event) => {
    // if shift and cmnd
    if (event.shiftKey && event.metaKey) {
      chrome.storage.local.get('environment', ({ environment }) => {
        if (environment === 'production') {
          API_URL = 'https://dev.wfh.team:8000';
          chrome.storage.local.set({ environment: 'development' }, () => {
            refreshPage();
          });
        } else {
          API_URL = 'https://api.wfh.team';
          chrome.storage.local.set({ environment: 'production' }, () => {
            refreshPage();
          });
        }
      });
    }
  });
  actionBar.appendChild(logo);
  const textWrapper = document.createElement('div');
  textWrapper.style = 'display: flex; flex-direction: column; justify-content: start; align-items: start; margin-left: 8px;';
  // powere by
  const poweredBy = document.createElement('div');
  poweredBy.textContent = 'Powered by';
  poweredBy.style = 'color: #999; font-size: 12px;';
  const superpowerChatGPT = document.createElement('a');
  superpowerChatGPT.href = 'https://chrome.google.com/webstore/detail/superpower-chatgpt/amhmeenmapldpjdedekalnfifgnpfnkc';
  superpowerChatGPT.target = '_blank';
  superpowerChatGPT.textContent = 'Superpower for ChatGPT';
  superpowerChatGPT.style = 'color: #999; font-size: 12px; margin-left: 4px; text-decoration: underline;';
  superpowerChatGPT.addEventListener('mouseover', () => {
    superpowerChatGPT.style = 'color: gold; font-size: 12px; margin-left: 4px;text-decoration: underline;';
  });
  superpowerChatGPT.addEventListener('mouseout', () => {
    superpowerChatGPT.style = 'color: #999; font-size: 12px; margin-left: 4px;text-decoration: underline;';
  });
  poweredBy.appendChild(superpowerChatGPT);
  const versionNumber = document.createElement('span');
  const { version } = chrome.runtime.getManifest();
  versionNumber.textContent = `(v ${version}`;
  versionNumber.style = 'color: #999; font-size: 12px; margin-left: 4px;';
  poweredBy.appendChild(versionNumber);
  const releaseNote = document.createElement('span');
  releaseNote.textContent = 'Release Note)';
  releaseNote.style = 'color: #999; font-size: 12px; margin-left: 4px; text-decoration: underline; cursor: pointer;';
  releaseNote.addEventListener('mouseover', () => {
    releaseNote.style = 'color: gold; font-size: 12px; margin-left: 4px;text-decoration: underline; cursor: pointer;';
  });
  releaseNote.addEventListener('mouseout', () => {
    releaseNote.style = 'color: #999; font-size: 12px; margin-left: 4px;text-decoration: underline; cursor: pointer;';
  });
  releaseNote.addEventListener('click', () => {
    // click on close settings modal close button
    document.querySelector('button[id^=modal-close-button-release-note]')?.click();
    createReleaseNoteModal(version);
  });
  poweredBy.appendChild(releaseNote);
  textWrapper.appendChild(poweredBy);
  // made by
  const madeBy = document.createElement('div');
  madeBy.textContent = 'Made by';
  madeBy.style = 'color: #999; font-size: 12px;';
  const madeByLink = document.createElement('a');
  madeByLink.href = 'https://twitter.com/eeeziii';
  madeByLink.target = '_blank';
  madeByLink.textContent = 'Saeed Ezzati';
  madeByLink.style = 'color: #999; font-size: 12px; margin-left: 4px; text-decoration: underline;';
  madeByLink.addEventListener('mouseover', () => {
    madeByLink.style = 'color: gold; font-size: 12px; margin-left: 4px;text-decoration: underline;';
  });
  madeByLink.addEventListener('mouseout', () => {
    madeByLink.style = 'color: #999; font-size: 12px; margin-left: 4px;text-decoration: underline;';
  });
  // support
  const support = document.createElement('span');
  support.textContent = ' - ';
  support.style = 'color: #999; font-size: 12px;';
  const supportLink = document.createElement('a');
  supportLink.href = 'https://buy.stripe.com/6oE6s0dQS7y2bjG9AA';
  supportLink.target = '_blank';
  supportLink.textContent = 'Support this extension ➜';
  supportLink.style = 'color: #999; font-size: 12px; margin-left: 4px; text-decoration: underline;';
  supportLink.addEventListener('mouseover', () => {
    supportLink.style = 'color: gold; font-size: 12px; margin-left: 4px;text-decoration: underline;';
  });
  supportLink.addEventListener('mouseout', () => {
    supportLink.style = 'color: #999; font-size: 12px; margin-left: 4px;text-decoration: underline;';
  });
  madeBy.appendChild(madeByLink);
  support.appendChild(supportLink);
  madeBy.appendChild(madeByLink);
  madeBy.appendChild(support);

  textWrapper.appendChild(madeBy);
  actionBar.appendChild(textWrapper);
  return actionBar;
}
function addSettingsButton() {
  const nav = document.querySelector('nav');
  if (!nav) return;

  // check if the setting button is already added
  if (document.querySelector('#settings-button')) return;
  // create the setting button by copying the nav button
  const settingsButton = document.createElement('a');
  settingsButton.classList = 'flex py-3 px-3 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-white cursor-pointer text-sm';
  settingsButton.textContent = 'Settings';

  const settingsButtonIcon = document.createElement('img');
  settingsButtonIcon.style = 'width: 16px; height: 16px;';
  settingsButtonIcon.src = chrome.runtime.getURL('icons/settings.png');
  settingsButton.id = 'settings-button';
  settingsButton.prepend(settingsButtonIcon);
  settingsButton.style = `${settingsButton.style.cssText}; width: 100%;`;
  // Add click event listener to setting button
  settingsButton.addEventListener('click', () => {
    // open the setting modal
    createSettingsModal();
  });
  const userMenu = nav.querySelector('#user-menu');
  userMenu.prepend(settingsButton);
}
// eslint-disable-next-line no-unused-vars
function initializeSettings() {
  // get dark mode from html tag class="dark"
  // create setting storage
  chrome.storage.local.get(['settings', 'presetPrompts', 'selectedConversations', 'customPrompts'], (result) => {
    let newCustomPrompts = Array.isArray(result.customPrompts)
      ? result.customPrompts
      : [
        ...(result.presetPrompts ? Object.keys(result.presetPrompts).map((key) => ({ title: key, text: result.presetPrompts[key], isDefault: false })) : []),
        ...(result.customPrompts ? Object.keys(result.customPrompts).map((key) => ({ title: key, text: result.customPrompts[key], isDefault: false })) : []),
      ];
    if (newCustomPrompts.length === 0) {
      newCustomPrompts = defaultPrompts;
    }
    const hasDefault = newCustomPrompts.find((prompt) => prompt.isDefault);
    if (!hasDefault) {
      newCustomPrompts[0].isDefault = true;
    }
    chrome.storage.local.set({
      settings: {
        ...result.settings,
        autoSync: result.settings?.autoSync !== undefined ? result.settings.autoSync : true,
        safeMode: result.settings?.safeMode !== undefined ? result.settings.safeMode : true,
        promptHistory: result.settings?.promptHistory !== undefined ? result.settings.promptHistory : true,
        copyMode: result.settings?.copyMode !== undefined ? result.settings.copyMode : false,
        hideBottomSidebar: result.settings?.hideBottomSidebar !== undefined ? result.settings.hideBottomSidebar : false,
        hideNewsletter: result.settings?.hideNewsletter !== undefined ? result.settings.hideNewsletter : false,
        saveHistory: result.settings?.saveHistory !== undefined ? result.settings.saveHistory : true,
        emailNewsletter: result.settings?.emailNewsletter !== undefined ? result.settings.emailNewsletter : false,
        showGpt4Counter: result.settings?.showGpt4Counter !== undefined ? result.settings.showGpt4Counter : true,
        conversationTimestamp: result.settings?.conversationTimestamp !== undefined ? result.settings.conversationTimestamp : false,
        autoHideTopNav: result.settings?.autoHideTopNav !== undefined ? result.settings.autoHideTopNav : false,
        navOpen: result.settings?.navOpen !== undefined ? result.settings.navOpen : true,
        showPinNav: result.settings?.showPinNav !== undefined ? result.settings.showPinNav : true,
        selectedLanguage: result.settings?.selectedLanguage || languageList.find((language) => language.code === 'default'),
        selectedTone: result.settings?.selectedTone || toneList.find((tone) => tone.code === 'default'),
        selectedWritingStyle: result.settings?.selectedWritingStyle || writingStyleList.find((writingStyle) => writingStyle.code === 'default'),
        exportMode: result.settings?.exportMode || 'both',
        historyFilter: result.settings?.historyFilter || 'favorites',
        selectedLibrarySortBy: result.settings?.selectedLibrarySortBy || { name: 'New', code: 'recent' },
        selectedLibraryCategory: result.settings?.selectedLibraryCategory || { name: 'All', code: 'all' },
        selectedLibraryLanguage: result.settings?.selectedLibraryLanguage || { name: 'All', code: 'all' },
        selectedPromptLanguage: result.settings?.selectedPromptLanguage || { name: 'Select', code: 'select' },
      },
      presetPrompts: {},
      customPrompts: newCustomPrompts,
    }, () => addSettingsButton());
  });
}
