// eslint-disable-next-line no-unused-vars
/* global createModal, createReleaseNoteModal, languageList, writingStyleList, toneList, toast, loadConversationList, modelSwitcher, addModelSwitcherEventListener, API_URL:true */
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
      return splitterTabContent();
    case 6:
      return newsletterTabContent();
    case 7:
      return supportersTabContent();
    default:
      return generalTabContent();
  }
}
function settingsModalContent(initialTab = 0) {
  const settingsTabs = ['General', 'Auto Sync', 'Models', 'Custom Prompts', 'Export', 'Splitter', 'Newsletter', 'Supporters'];
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

  // show word counter
  const showWordCountSwitch = createSwitch('Word/Char Count', 'Show/hide word/char count on each message', 'showWordCount', true, reloadConversationList);
  leftContent.appendChild(showWordCountSwitch);

  // auto scroll
  const autoScrollSwitch = createSwitch('Auto Scroll', 'Automatically scroll down while responding', 'autoScroll', true);
  leftContent.appendChild(autoScrollSwitch);

  // prompt template
  const promptTemplateSwitch = createSwitch('Prompt Template', 'Enable/disable the doube {{curly}} brackets replacement (<a style="text-decoration:underline; color:gold;" href="https://www.notion.so/ezi/Superpower-ChatGPT-FAQ-9d43a8a1c31745c893a4080029d2eb24?pvs=4#d744b8220a374af394b0bcf82274e290" target="blank">Learn More</a>)', 'promptTemplate', true);
  leftContent.appendChild(promptTemplateSwitch);

  // conversation width
  const customConversationWidthSwitch = createSwitch('Custom Conversation Width', 'OFF: Use default / ON: Set Conversation Width (30%-90%)', 'customConversationWidth', false, toggleCustomWidthInput);
  leftContent.appendChild(customConversationWidthSwitch);

  const conversationWidthInput = document.createElement('input');
  conversationWidthInput.id = 'conversation-width-input';
  conversationWidthInput.type = 'number';
  conversationWidthInput.classList = 'w-full px-4 py-2 mr-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-800 disabled:opacity-40 text-white';
  chrome.storage.local.get(['settings'], (result) => {
    conversationWidthInput.disabled = !result.settings.customConversationWidth;
    conversationWidthInput.value = result.settings.conversationWidth;
    conversationWidthInput.addEventListener('change', () => {
      const curConversationWidthInput = document.querySelector('#conversation-width-input');
      const newValue = Math.round(curConversationWidthInput.value);
      curConversationWidthInput.value = newValue;
      Array.from(document.querySelectorAll('[id^=message-wrapper]')).forEach((el) => {
        el.querySelector('div').style.maxWidth = `${newValue}%`;
      });
      if (document.querySelector('#conversation-bottom')) {
        document.querySelector('#conversation-bottom').firstChild.style.maxWidth = `${newValue}%`;
      }
      document.querySelector('main').querySelector('form').style.maxWidth = `${newValue}%`;
      chrome.storage.local.set({ settings: { ...result.settings, conversationWidth: newValue, customConversationWidth: true } });
    });
    conversationWidthInput.addEventListener('input', () => {
      const curConversationWidthInput = document.querySelector('#conversation-width-input');
      const newValue = Math.round(curConversationWidthInput.value);
      curConversationWidthInput.value = newValue;
      Array.from(document.querySelectorAll('[id^=message-wrapper]')).forEach((el) => {
        el.querySelector('div').style.maxWidth = `${newValue}%`;
      });
      if (document.querySelector('#conversation-bottom')) {
        document.querySelector('#conversation-bottom').firstChild.style.maxWidth = `${newValue}%`;
      }
      document.querySelector('main').querySelector('form').style.maxWidth = `${newValue}%`;
      chrome.storage.local.set({ settings: { ...result.settings, conversationWidth: newValue, customConversationWidth: true } });
    });
  });
  leftContent.appendChild(conversationWidthInput);

  const importExportWrapper = document.createElement('div');
  importExportWrapper.style = 'display: flex; flex-direction: row; flex-wrap: wrap; justify-content: start; align-items: center; width: 100%; margin: 8px 0; color:white;';
  const importExportLabel = document.createElement('div');
  importExportLabel.style = 'width: 100%; margin: 8px 0;';
  importExportLabel.innerHTML = 'Import / Export Settings, Custom Prompts, and Folders (<a style="text-decoration:underline; color:gold;" href="https://www.notion.so/ezi/Superpower-ChatGPT-FAQ-9d43a8a1c31745c893a4080029d2eb24?pvs=4#efc8c6a6004142b189412e8e6785956d" target="blank">Learn More</a>)';
  importExportWrapper.appendChild(importExportLabel);

  const importExportButtonWrapper = document.createElement('div');
  importExportButtonWrapper.style = 'display: flex; flex-direction: row; justify-content: start; align-items: center; width: 100%; margin: 8px 0;';

  const importButton = document.createElement('button');
  importButton.className = 'w-full px-4 py-2 mr-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-800';
  importButton.textContent = 'Import';
  importButton.addEventListener('click', () => {
    // open file picker
    const filePicker = document.createElement('input');
    filePicker.type = 'file';
    filePicker.accept = '.json';
    filePicker.addEventListener('change', (event) => {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (document.querySelector('[id*=close-button]')) {
          document.querySelector('[id*=close-button]').click();
        }
        const importedData = JSON.parse(e.target.result);
        const {
          settings, customModels, customPrompts, conversationsOrder, customInstructionProfiles, promptChains,
        } = importedData;
        chrome.storage.local.set({
          settings, customModels, customPrompts, customInstructionProfiles, promptChains, conversationsOrder,
        }, () => {
          window.location.reload();
          toast('Imported Settings Successfully');
        });
      };
      reader.readAsText(file);
    });
    filePicker.click();
  });
  importExportButtonWrapper.appendChild(importButton);

  const exportButton = document.createElement('button');
  exportButton.className = 'w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-800';
  exportButton.textContent = 'Export';
  exportButton.addEventListener('click', () => {
    chrome.storage.local.get(['conversationsOrder', 'settings', 'customModels', 'customPrompts', 'customInstructionProfiles', 'promptChains'], (result) => {
      const {
        settings, customModels, customPrompts, customInstructionProfiles, promptChains, conversationsOrder,
      } = result;
      const data = {
        settings, customModels, customPrompts, conversationsOrder, customInstructionProfiles, promptChains,
      };
      const element = document.createElement('a');
      element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(JSON.stringify(data))}`);
      const todatDate = new Date();
      const filePostfix = `${todatDate.getFullYear()}-${todatDate.getMonth() + 1}-${todatDate.getDate()}`;

      element.setAttribute('download', `superpower-chatgpt-settings-${filePostfix}.json`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast('Settings exported');
    });
  });
  importExportButtonWrapper.appendChild(exportButton);
  importExportWrapper.appendChild(importExportButtonWrapper);

  leftContent.appendChild(importExportWrapper);

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
  feedbackLink.href = 'mailto:saeed@superpowerdaily.com?subject=Superpower ChatGPT Feature Request&body=Hi Marko,%0DReporting a bug? Any of the following information would help me figure it out faster: %0D- What version of the extension do you have? (You can find that at the bottom of the "settings" menu) %0D- What browser are you using? %0D- Do you see any errors in the console log? %0D- Do you have a plus account? %0D- How many conversations do you have approximately? %0D- Do you have the Auto Sync feature ON? %0D- Are all of your conversations synced? %0D- Do you see the "settings" menu on the sidebar? %0D- Does your issue go away if you turn the Auto Sync OFF in the settings menu? %0D- Does this issue happen to all prompts? Or only the first prompt? %0D- Are you using any other ChatGPT extensions at the same time? %0D- Can you email me a screenshot or video of the ChatGPT page when the bug happens? (with the extension installed)%0DThanks!';
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
  sponsorLink.href = 'https://www.passionfroot.me/superpower';
  sponsorLink.target = '_blank';
  sponsorLink.textContent = 'Advertise with us ➜';
  sponsorLink.style = 'color: #999; font-size: 12px; margin: 8px 0;min-width: 25%;text-align:center;padding-right: 8px;';
  sponsorLink.addEventListener('mouseover', () => {
    sponsorLink.style = 'color: gold; font-size: 12px; margin: 8px 0;min-width: 25%;text-align:center;padding-right: 8px;';
  });
  sponsorLink.addEventListener('mouseout', () => {
    sponsorLink.style = 'color: #999; font-size: 12px; margin: 8px 0;min-width: 25%;text-align:center;padding-right: 8px;';
  });
  linkWrapper.appendChild(sponsorLink);

  // add link for FAQ
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
function toggleCustomWidthInput(customConversationWidth) {
  chrome.storage.local.get(['settings'], (result) => {
    const customWidthInput = document.getElementById('conversation-width-input');
    customWidthInput.disabled = !customConversationWidth;
    const { settings } = result;
    if (customConversationWidth) {
      Array.from(document.querySelectorAll('[id^=message-wrapper]')).forEach((el) => {
        el.querySelector('div').style.maxWidth = `${settings.conversationWidth}%`;
      });
      if (document.querySelector('#conversation-bottom')) {
        document.querySelector('#conversation-bottom').firstChild.style.maxWidth = `${settings.conversationWidth}%`;
      }
      document.querySelector('main').querySelector('form').style.maxWidth = `${settings.conversationWidth}%`;
    } else {
      Array.from(document.querySelectorAll('[id^=message-wrapper]')).forEach((el) => {
        el.querySelector('div').style.removeProperty('max-width');
      });
      if (document.querySelector('#conversation-bottom')) {
        document.querySelector('#conversation-bottom').firstChild.style.removeProperty('max-width');
      }
      document.querySelector('main').querySelector('form').style.removeProperty('max-width');
    }
  });
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

    const autoRefreshAfterSyncSwitch = createSwitch('Auto Refresh After Sync', 'Automatically refresh the page after syncing conversations is completed', 'autoRefreshAfterSync', true, null, 'Requires Auto-Sync', !autoSync);
    content.appendChild(autoRefreshAfterSyncSwitch);

    const quickSyncSwitch = createSwitch('Quick Sync', 'OFF: Sync All Conversations, ON: Sync only the last 100 conversations (Best performance)', 'quickSync', false, resetSync, 'Experimental - Requires Auto-Sync', !autoSync);
    content.appendChild(quickSyncSwitch);

    const showExamplePromptsSwitch = createSwitch('Show Example Prompts', 'Show the example prompts when starting a new chat', 'showExamplePrompts', false, null, 'Requires Auto-Sync', !autoSync);
    content.appendChild(showExamplePromptsSwitch);

    const keepFoldersAtTheTopSwitch = createSwitch('Keep folders at the top', 'Always show the folders at the top of the history', 'keepFoldersAtTheTop', false, toggleKeepFoldersAtTheTop, 'Requires Auto-Sync', !autoSync);
    content.appendChild(keepFoldersAtTheTopSwitch);

    const conversationTimestampSwitch = createSwitch('Conversation Order', 'OFF: Created time, ON: Last updated time', 'conversationTimestamp', false, toggleConversationTimestamp, 'Requires Auto-Sync', !autoSync);
    content.appendChild(conversationTimestampSwitch);

    const showMessageTimestampSwitch = createSwitch('Message Timestamp', 'Show/hide timestamps on each message', 'showMessageTimestamp', false, reloadConversationList, 'Requires Auto-Sync', !autoSync);
    content.appendChild(showMessageTimestampSwitch);

    const pinNavSwitch = createSwitch('Pin Navigation', 'Show/hide message pins for quick navigation(only when conversations are fully synced)', 'showPinNav', true, refreshPage, 'Requires Auto-Sync', !autoSync);
    content.appendChild(pinNavSwitch);

    const showGpt4Counter = createSwitch('Show GPT-4 Counter', 'Show the number of GPT-4 messages in the last 3 hours', 'showGpt4Counter', true, toggleGpt4Counter, 'Requires Auto-Sync', !autoSync);
    content.appendChild(showGpt4Counter);

    const autoHideTopNav = createSwitch('Auto Hide Top Navbar', 'Automatically hide the navbar at the top of the page when move the mouse out of it.', 'autoHideTopNav', true, toggleTopNav, 'Requires Auto-Sync', !autoSync);
    content.appendChild(autoHideTopNav);

    const autoResetTopNav = createSwitch('Auto Reset Top Navbar', 'Automatically reset the tone, writing style, and language to default when switching to new chats', 'autoResetTopNav', false, toggleTopNav, 'Requires Auto-Sync', !autoSync);
    content.appendChild(autoResetTopNav);

    const chatEndedSoundSwitch = createSwitch('Sound Alarm', 'Play a sound when the chat ends', 'chatEndedSound', false, null, 'Requires Auto-Sync', !autoSync);
    content.appendChild(chatEndedSoundSwitch);
  });
  return content;
}
function resetSync() {
  chrome.storage.local.set({
    conversations: {},
    conversationsAreSynced: false,
  }, () => {
    refreshPage();
  });
}
function reloadConversationList() {
  chrome.storage.local.get(['settings'], (result) => {
    const { autoSync } = result.settings;
    if (autoSync) {
      loadConversationList(true);
    } else {
      refreshPage();
    }
  });
}

function sortConversationsByTimestamp(conversationsOrder, conversations, byUpdateTime) {
  const folders = conversationsOrder.filter((c) => typeof c !== 'string' && c.id !== 'trash');
  // close all folders
  folders.forEach((f) => {
    f.isOpen = false;
  });
  const conversationIds = conversationsOrder.filter((c) => typeof c === 'string');
  const trash = conversationsOrder.find((c) => c.id === 'trash');
  // close trash
  trash.isOpen = false;

  if (byUpdateTime) {
    // sort conversationIds by last updated time
    conversationIds.sort((a, b) => {
      const aLastUpdated = conversations[a].update_time;
      const bLastUpdated = conversations[b].update_time;
      return bLastUpdated - aLastUpdated;
    });
  } else {
    // sort conversations by created time
    conversationIds.sort((a, b) => {
      const aCreated = conversations[a].create_time;
      const bCreated = conversations[b].create_time;
      return bCreated - aCreated;
    });
  }
  const newConversationsOrder = [...folders, ...conversationIds, trash];
  return newConversationsOrder;
}
// eslint-disable-next-line no-unused-vars
function toggleKeepFoldersAtTheTop(isChecked) {
  chrome.storage.local.get(['settings'], (result) => {
    const { settings } = result;
    toggleConversationTimestamp(settings.conversationTimestamp);
  });
}
function toggleConversationTimestamp(isChecked) {
  chrome.storage.local.get(['conversationsOrder', 'conversations'], (result) => {
    const { conversationsOrder, conversations } = result;
    const newConversationsOrder = sortConversationsByTimestamp(conversationsOrder, conversations, isChecked);
    chrome.storage.local.set({ conversationsOrder: newConversationsOrder }, () => reloadConversationList());
  });
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
  } else {
    navWrapperElement.style.top = '0px';
    navWrapperElement.style.position = 'relative';
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
  betaTag.style = 'background-color: #ff9800; color: black; padding: 2px 4px; border-radius: 8px; font-size: 0.7em;margin-top:8px;';
  betaTag.textContent = 'Requires Auto-Sync';
  content.appendChild(betaTag);
  chrome.storage.local.get(['settings', 'models', 'unofficialModels', 'customModels'], (result) => {
    const {
      models, unofficialModels, customModels, settings,
    } = result;
    const allModels = [...models, ...unofficialModels, ...customModels];
    const { autoSync } = result.settings;
    modelSwitcherWrapper.innerHTML = modelSwitcher(allModels, settings.selectedModel, idPrefix, customModels, settings.autoSync, true);
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
  newCustomModelWrapperTitle.innerHTML = 'Add a Custom Model<span style="background-color: rgb(255, 152, 0); color: black; padding: 2px 4px; border-radius: 8px; font-size: 0.7em; margin-left: 8px;position:relative; bottom:2px;">Experimental</span>';

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
          wrapper.innerHTML = modelSwitcher(newAllModels, res.settings.selectedModel, curIdPrefix, newCustomModels, res.settings.autoSync, true);
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
function toggleCustomPromptsButtonVisibility(isChecked) {
  const customPromptsButton = document.querySelector('#continue-conversation-button-wrapper');
  if (!customPromptsButton) return;
  if (isChecked) {
    customPromptsButton.style.display = 'flex';
  } else {
    customPromptsButton.style.display = 'none';
  }
}
function customPromptTabContent() {
  const content = document.createElement('div');
  content.id = 'settings-modal-tab-content';
  content.style = 'display: flex; flex-direction: column; justify-content: start; align-items: start;overflow-y: scroll; width:100%; padding: 16px; margin-width:100%; height: 100%;';

  chrome.storage.local.get(['customPrompts', 'settings'], (result) => {
    // custom prompts section
    const customPromptSectionWrapper = document.createElement('div');
    customPromptSectionWrapper.style = 'display: flex; justify-content:space-between; align-items:center; width: 100%; color: lightslategray; font-size: 16px;';
    const customPromptSection = document.createElement('div');
    customPromptSection.style = 'color: lightslategray; font-size: 16px; margin: 12px 0;';
    // customPromptSection.textContent = 'Custom Prompts';

    const showCustomPromptsButtonSwitch = createSwitch('Show Custom Prompts Button', 'Show/hide the button to use custom prompts', 'showCustomPromptsButton', true, toggleCustomPromptsButtonVisibility);
    customPromptSection.appendChild(showCustomPromptsButtonSwitch);

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

      const helperText = document.createElement('div');
      helperText.style = 'color: #999; font-size: 12px; margin: 8px 0;';
      helperText.textContent = 'Tip: You can use @promptTitle anywhere in your prompt input to automatically replace it with the prompt text. For this feature to work make sure you don\'t have any space in the prompt title. Smart replace is not case sensitive.';

      const repeatedNameError = document.createElement('div');
      repeatedNameError.id = 'repeated-name-error';
      repeatedNameError.style = 'color: #f56565; font-size: 12px;visibility: hidden;';
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
      newCustomPromptWrapper.appendChild(helperText);
      newCustomPromptWrapper.appendChild(repeatedNameError);
      newCustomPromptWrapper.appendChild(newCustomPromptButtonWrapper);
      // insert after customPromptSectionWrapper
      customPromptSectionWrapper.parentNode.insertBefore(newCustomPromptWrapper, customPromptSectionWrapper.nextSibling);
    });
    customPromptSectionWrapper.appendChild(customPromptSection);
    customPromptSectionWrapper.appendChild(newCustomPromptButton);
    content.appendChild(customPromptSectionWrapper);
    const { customPrompts, settings } = result;
    const { autoSync, customInstruction } = settings;
    if (customPrompts) {
      for (let i = 0; i < customPrompts?.length; i += 1) {
        const promptTitle = customPrompts[i].title;
        const promptText = customPrompts[i].text;
        const { isDefault } = customPrompts[i];
        const promptRow = createPromptRow(promptTitle, promptText, isDefault, 'customPrompts');
        content.appendChild(promptRow);
      }
    }
    // custom inststruction section
    const customInstructionSection = document.createElement('div');
    customInstructionSection.style = 'display: flex; flex-direction: column; justify-content: start; align-items: start; width: 100%; margin: 16px 0;';

    const customInstructionSwitch = createSwitch('Custom Instruction', 'Custom instruction will be added to the end of each promps. You can use it to add instructions that you like to include in every prompt. For example, you can add "Please repeat the prompt after me.", or "Please refrain from writing warnings about your knowledge cutoff" to the custom instruction, and it will be added to the end of every prompt.(Make sure to add a space or new-line in the beggining!)', 'useCustomInstruction', false, toggleCustomInstructionInput, 'Requires Auto-Sync', !autoSync);

    const customInstructionInputWrapper = document.createElement('div');
    customInstructionInputWrapper.style = 'display: flex; flex-direction: row; justify-content: start; align-items: center; width: 100%; margin-bottom: 8px;';
    const customInstructionInput = document.createElement('textarea');
    customInstructionInput.id = 'custom-instruction-input';
    customInstructionInput.style = 'width: 100%; height: 100px; border-radius: 4px; border: 1px solid #565869; background-color: #2d2d3a; color: #eee; padding: 8px;';
    customInstructionInput.placeholder = 'Enter your custom instruction here...';
    customInstructionInput.value = customInstruction;
    customInstructionInput.addEventListener('input', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const newCustomInstruction = e.target.value;
      chrome.storage.local.get(['settings'], (res) => {
        chrome.storage.local.set({ settings: { ...res.settings, customInstruction: newCustomInstruction } });
      });
    });
    customInstructionInputWrapper.appendChild(customInstructionInput);

    customInstructionSection.appendChild(customInstructionSwitch);
    customInstructionSection.appendChild(customInstructionInputWrapper);
    content.appendChild(customInstructionSection);

    const extraSpaceDiv = document.createElement('div');
    extraSpaceDiv.style = 'min-height: 200px;';
    content.appendChild(extraSpaceDiv);
  });
  return content;
}
function toggleCustomInstructionInput(isChecked) {
  const customInstructionInput = document.getElementById('custom-instruction-input');
  if (isChecked) {
    customInstructionInput.style.opacity = '1';
    customInstructionInput.disabled = false;
  } else {
    customInstructionInput.style.opacity = '0.5';
    customInstructionInput.disabled = true;
  }
}
function createPromptRow(promptTitle, promptText, isDefault, promptObjectName) {
  const promptWrapper = document.createElement('div');
  promptWrapper.style = 'display: flex; flex-direction: row; justify-content: start; align-items: center; width: 100%; margin: 8px 0;';
  const promptLabel = document.createElement('div');
  promptLabel.style = 'min-width: 100px; max-width:100px; margin-right: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;color:white;text-transform: capitalize;';
  promptLabel.innerText = `@${promptTitle}`;
  promptLabel.title = promptTitle;
  promptLabel.dir = 'auto';
  const promptInput = document.createElement('textarea');
  promptInput.style = 'width: 100%; height: 34px; min-height: 34px; border-radius: 4px; border: 1px solid #565869; background-color: #1e1e2f; color: #eee; padding: 4px 8px; font-size: 14px;margin-right: 8px;';
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
    deleteButton.classList = 'btn flex justify-center gap-2 btn-dark border-0 md:border mr-2';
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
    defaultButton.classList = `btn flex justify-center gap-2 ${isDefault ? 'btn-primary' : 'btn-dark'} border-0 md:border`;
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
          curDefaultButton.classList = 'btn flex justify-center gap-2 btn-dark border-0 md:border';
          defaultButton.classList = 'btn flex justify-center gap-2 btn-primary border-0 md:border';
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
function toggleExportButtonVisibility(isChecked) {
  const exportButton = document.querySelector('#export-conversation-button');
  if (!exportButton) return;
  if (isChecked) {
    exportButton.style.display = 'flex';
  } else {
    exportButton.style.display = 'none';
  }
}
function exportTabContent() {
  const content = document.createElement('div');
  content.id = 'settings-modal-tab-content';
  content.style = 'display: flex; flex-direction: column; justify-content: start; align-items: start;overflow-y: scroll; width:100%; padding: 16px; margin-width:100%; height: 100%;';

  // showExportButton
  const showExportButtonSwitch = createSwitch('Show Export Button', 'Show/hide the button to export the conversation', 'showExportButton', true, toggleExportButtonVisibility);
  content.appendChild(showExportButtonSwitch);
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
  betaTag.style = 'background-color: #ff9800; color: black; padding: 2px 4px; border-radius: 8px; margin-left: 8px; font-size: 0.7em;';
  betaTag.textContent = 'Coming soon';
  content.appendChild(exportModeSwitchWrapper);
  content.appendChild(exportNamingFormatLabel);
  exportNamingFormatLabel.appendChild(betaTag);
  return content;
}
function splitterTabContent() {
  const content = document.createElement('div');
  content.id = 'settings-modal-tab-content';
  content.style = 'display: flex; flex-direction: column; justify-content: start; align-items: start;overflow-y: scroll; width:100%; padding: 16px; margin-width:100%; height: 100%;';

  // conversation width
  chrome.storage.local.get(['settings'], (result) => {
    const { autoSync } = result.settings;
    const splitterSwitchWrapper = document.createElement('div');
    splitterSwitchWrapper.style = 'display: flex; gap:16px; justify-content: start; align-items: start; width: 100%; margin: 8px 0;';
    const autoSplitSwitch = createSwitch('Auto Split', 'Automatically split long prompts into smaller chunks (<a style="text-decoration:underline; color:gold;" href="https://www.notion.so/ezi/Superpower-ChatGPT-FAQ-9d43a8a1c31745c893a4080029d2eb24?pvs=4#4fe6dfb33eea451d92ed4d8c240bac1e" target="blank">Learn More</a>)', 'autoSplit', true, toggleAutoSummarizerSwitch, 'Requires Auto-Sync', !autoSync);
    const autoSummarizeSwitch = createSwitch('Auto Summarize', 'Automatically summarize each chunk after auto split (<a style="text-decoration:underline; color:gold;" href="https://www.notion.so/ezi/Superpower-ChatGPT-FAQ-9d43a8a1c31745c893a4080029d2eb24?pvs=4#edb708ffea3647509d4957765ab0529c" target="blank">Learn More</a>)', 'autoSummarize', false, updateAutoSplitPrompt, 'Requires Auto-Sync', !autoSync);

    const autoSplitChunkSizeLabel = document.createElement('div');
    autoSplitChunkSizeLabel.style = 'display: flex; flex-direction: row; justify-content: start; align-items: center; width: 100%; margin: 8px 0; color:white;';
    autoSplitChunkSizeLabel.textContent = 'Auto Split Chunk Size (1000-16000)';

    const autoSplitChunkSizeInput = document.createElement('input');
    autoSplitChunkSizeInput.id = 'split-prompt-limit-input';
    autoSplitChunkSizeInput.type = 'number';
    autoSplitChunkSizeInput.classList = 'w-full px-4 py-2 mb-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-800 disabled:opacity-40';
    autoSplitChunkSizeInput.value = result.settings.autoSplitLimit;
    autoSplitChunkSizeInput.addEventListener('change', () => {
      const curAutoSplitChunkSizeInput = document.querySelector('#split-prompt-limit-input');
      const newValue = Math.round(curAutoSplitChunkSizeInput.value);

      curAutoSplitChunkSizeInput.value = newValue;
      chrome.storage.local.set({ settings: { ...result.settings, autoSplitLimit: newValue } });
    });
    autoSplitChunkSizeInput.addEventListener('input', () => {
      const curAutoSplitChunkSizeInput = document.querySelector('#split-prompt-limit-input');
      const newValue = Math.round(curAutoSplitChunkSizeInput.value);

      curAutoSplitChunkSizeInput.value = newValue;
      chrome.storage.local.set({ settings: { ...result.settings, autoSplitLimit: newValue } });
    });

    // splitter initial prompt
    const autoSplitInitialPromptLabel = document.createElement('div');
    autoSplitInitialPromptLabel.style = 'display: flex; flex-direction: row; justify-content: start; align-items: center; width: 100%; margin-top: 16px; color:white;';
    autoSplitInitialPromptLabel.textContent = 'Auto Split Prompt';

    const autoSplitInitialPromptHelper = document.createElement('div');
    autoSplitInitialPromptHelper.style = 'font-size: 12px; color: #999;margin-bottom: 8px;';
    autoSplitInitialPromptHelper.textContent = 'Splitter prompt is a text that will be used when the user prompt in divided into chunkc due to the character limit.';

    const autoSplitInitialPromptText = document.createElement('textarea');
    autoSplitInitialPromptText.id = 'split-initial-prompt-textarea';
    autoSplitInitialPromptText.style = 'width: 100%; height: 200px; min-height: 200px; border-radius: 4px; border: 1px solid #565869; background-color: #0b0d0e; color: #eee; padding: 4px 8px; font-size: 14px;';
    autoSplitInitialPromptText.placeholder = 'Enter splitter prompt here...';
    chrome.storage.local.get('settings', ({ settings }) => {
      autoSplitInitialPromptText.value = settings.autoSplitInitialPrompt;
    });
    autoSplitInitialPromptText.dir = 'auto';
    autoSplitInitialPromptText.addEventListener('input', () => {
      autoSplitInitialPromptText.style.borderColor = '#565869';
      chrome.storage.local.get('settings', ({ settings }) => {
        chrome.storage.local.set({ settings: { ...settings, autoSplitInitialPrompt: autoSplitInitialPromptText.value } });
      });
    });

    // splitter chunk prompt
    const autoSplitChunkPromptLabel = document.createElement('div');
    autoSplitChunkPromptLabel.style = 'display: flex; flex-direction: row; justify-content: start; align-items: center; width: 100%; margin-top: 16px; color:white;';
    autoSplitChunkPromptLabel.textContent = 'Auto Split Chunk Prompt';

    const autoSplitChunkPromptHelper = document.createElement('div');
    autoSplitChunkPromptHelper.style = 'font-size: 12px; color: #999;margin-bottom: 8px;';
    autoSplitChunkPromptHelper.textContent = 'Chunk prompt is a text that will be added to the end of each chunk. It can be used to summarize the previous chunk or do other things.';

    const autoSplitChunkPromptText = document.createElement('textarea');
    autoSplitChunkPromptText.id = 'split-chunk-prompt-textarea';
    autoSplitChunkPromptText.style = 'width: 100%; height: 100px; min-height: 100px; border-radius: 4px; border: 1px solid #565869; background-color: #0b0d0e; color: #eee; padding: 4px 8px; font-size: 14px;';
    autoSplitChunkPromptText.placeholder = 'Enter splitter prompt here...';
    chrome.storage.local.get('settings', ({ settings }) => {
      autoSplitChunkPromptText.value = settings.autoSplitChunkPrompt;
    });
    autoSplitChunkPromptText.dir = 'auto';
    autoSplitChunkPromptText.addEventListener('input', () => {
      autoSplitChunkPromptText.style.borderColor = '#565869';
      chrome.storage.local.get('settings', ({ settings }) => {
        chrome.storage.local.set({ settings: { ...settings, autoSplitChunkPrompt: autoSplitChunkPromptText.value } });
      });
    });

    splitterSwitchWrapper.appendChild(autoSplitSwitch);
    splitterSwitchWrapper.appendChild(autoSummarizeSwitch);
    content.appendChild(splitterSwitchWrapper);
    content.appendChild(autoSplitChunkSizeLabel);
    content.appendChild(autoSplitChunkSizeInput);
    content.appendChild(autoSplitInitialPromptLabel);
    content.appendChild(autoSplitInitialPromptHelper);
    content.appendChild(autoSplitInitialPromptText);
    content.appendChild(autoSplitChunkPromptLabel);
    content.appendChild(autoSplitChunkPromptHelper);
    content.appendChild(autoSplitChunkPromptText);
  });
  return content;
}
function toggleAutoSummarizerSwitch(isChecked) {
  // if autoSplit is off, check autoSummarize and turn it off if it's on
  if (!isChecked) {
    const autoSummarizeSwitch = document.querySelector('#switch-auto-summarize');
    if (autoSummarizeSwitch.checked) {
      autoSummarizeSwitch.checked = false;
      chrome.storage.local.get('settings', ({ settings }) => {
        chrome.storage.local.set({ settings: { ...settings, autoSummarize: false } });
      });
    }
  }
}
function updateAutoSplitPrompt(autoSummarize) {
  const autoSplitChunkPrompt = `Reply with OK: [CHUNK x/TOTAL]
Don't reply with anything else!`;
  const autoSplitChunkPromptSummarize = `Reply with OK: [CHUNK x/TOTAL]
Summary: A short summary of the last chunk. Keep important facts and names in the summary. Don't reply with anything else!`;
  chrome.storage.local.get('settings', ({ settings }) => {
    chrome.storage.local.set({ settings: { ...settings, autoSplitChunkPrompt: autoSummarize ? autoSplitChunkPromptSummarize : autoSplitChunkPrompt } }, () => {
      const autoSplitInitialPromptText = document.querySelector('#split-chunk-prompt-textarea');
      autoSplitInitialPromptText.value = autoSummarize ? autoSplitChunkPromptSummarize : autoSplitChunkPrompt;
    });
  });
}
function newsletterTabContent() {
  const content = document.createElement('div');
  content.id = 'settings-modal-tab-content';
  content.style = 'display: flex; flex-direction: column; justify-content: start; align-items: start;overflow-y: scroll; width:100%; padding: 16px; margin-width:100%; height: 100%;';
  // daily newsletter
  const dailyNewsletterSwitch = createSwitch('Hide daily newsletter', 'Automatically hide the daily newsletter popup.', 'hideNewsletter', false);
  content.appendChild(dailyNewsletterSwitch);

  // content.appendChild(sendNewsletterToEmailSwitch);
  return content;
}
function supportersTabContent() {
  const content = document.createElement('div');
  content.id = 'settings-modal-tab-content';
  content.style = 'display: flex; flex-direction:column; justify-content: start; align-items: start;overflow-y: scroll; width:100%; padding: 16px; margin-width:100%; height: 100%;gap:16px;';

  const goldSupporter = document.createElement('a');
  goldSupporter.href = 'https://buy.stripe.com/dR6g2A7subOigE09AF';
  goldSupporter.target = '_blank';
  goldSupporter.classList = 'h-64 w-full rounded bg-gray-700 text-gray-300 p-2 flex justify-center items-center text-4xl';
  goldSupporter.textContent = 'Gold';

  const silverSupporterwrapper = document.createElement('div');
  silverSupporterwrapper.style = 'display: flex; flex-direction: row; justify-content: start; align-items: start; width: 100%; margin: 8px 0;gap:16px;';

  const silverSupporter1 = document.createElement('a');
  silverSupporter1.href = 'https://buy.stripe.com/dR6bMk5km5pU87u5ko';
  silverSupporter1.target = '_blank';
  silverSupporter1.classList = 'h-32 rounded bg-gray-700 text-gray-300 p-2 flex justify-center items-center text-2xl';
  silverSupporter1.style = 'width: 50%;';
  silverSupporter1.textContent = 'Silver';
  silverSupporterwrapper.appendChild(silverSupporter1);

  const silverSupporter2 = document.createElement('a');
  silverSupporter2.href = 'https://buy.stripe.com/dR6bMk5km5pU87u5ko';
  silverSupporter2.target = '_blank';
  silverSupporter2.classList = 'h-32 rounded bg-gray-700 text-gray-300 p-2 flex justify-center items-center text-2xl';
  silverSupporter2.style = 'width: 50%;';
  silverSupporter2.textContent = 'Silver';
  silverSupporterwrapper.appendChild(silverSupporter2);

  const bronzeSupporterwrapper = document.createElement('div');
  bronzeSupporterwrapper.style = 'display: flex; flex-direction: row; justify-content: start; align-items: start; width: 100%; margin: 8px 0;gap:16px;';

  const bronzeSupporter1 = document.createElement('a');
  bronzeSupporter1.href = 'https://buy.stripe.com/6oE17G4gibOifzW5kn';
  bronzeSupporter1.target = '_blank';
  bronzeSupporter1.classList = 'h-16 rounded bg-gray-700 text-gray-300 p-2 flex justify-center items-center text-xl';
  bronzeSupporter1.style = 'width: 33.33%;';
  bronzeSupporter1.textContent = 'Bronze';
  bronzeSupporterwrapper.appendChild(bronzeSupporter1);

  const bronzeSupporter2 = document.createElement('a');
  bronzeSupporter2.href = 'https://buy.stripe.com/6oE17G4gibOifzW5kn';
  bronzeSupporter2.target = '_blank';
  bronzeSupporter2.classList = 'h-16 rounded bg-gray-700 text-gray-300 p-2 flex justify-center items-center text-xl';
  bronzeSupporter2.style = 'width: 33.33%;';
  bronzeSupporter2.textContent = 'Bronze';
  bronzeSupporterwrapper.appendChild(bronzeSupporter2);

  const bronzeSupporter3 = document.createElement('a');
  bronzeSupporter3.href = 'https://buy.stripe.com/6oE17G4gibOifzW5kn';
  bronzeSupporter3.target = '_blank';
  bronzeSupporter3.classList = 'h-16 rounded bg-gray-700 text-gray-300 p-2 flex justify-center items-center text-xl';
  bronzeSupporter3.style = 'width: 33.33%;';
  bronzeSupporter3.textContent = 'Bronze';
  bronzeSupporterwrapper.appendChild(bronzeSupporter3);

  content.appendChild(goldSupporter);
  content.appendChild(silverSupporterwrapper);
  content.appendChild(bronzeSupporterwrapper);
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
  betaTag.style = 'background-color: #ff9800; color: black; padding: 2px 4px; border-radius: 8px; font-size: 0.7em;border:';
  betaTag.textContent = tag;
  const helper = document.createElement('div');
  helper.style = 'font-size: 12px; color: #999;';
  helper.innerHTML = subtitle;
  if (settingsKey) {
    chrome.storage.local.get('settings', ({ settings }) => {
      const settingValue = settings[settingsKey];
      if (settingValue === undefined && defaultValue !== undefined) {
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
  actionBar.style = 'display: flex; flex-direction: row; justify-content: start; align-items: end; margin-top: 8px;width:100%;';
  const logo = document.createElement('img');
  logo.src = chrome.runtime.getURL('icons/logo.png');
  logo.style = 'width: 40px; height: 40px;';

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
  superpowerChatGPT.textContent = 'Superpower ChatGPT';
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

  const buyMeAPizza = document.createElement('a');
  buyMeAPizza.classList = 'flex py-3 px-3 items-center gap-3 rounded-md bg-gold hover:bg-gold-dark transition-colors duration-200 text-black cursor-pointer text-sm ml-auto font-bold';
  buyMeAPizza.textContent = '🍕 Buy me a pizza';
  // make the button shake every 5 seconds
  setInterval(() => {
    buyMeAPizza.classList.add('animate-shake');
    setTimeout(() => {
      buyMeAPizza.classList.remove('animate-shake');
    }, 1000);
  }, 7000);

  buyMeAPizza.href = 'https://www.buymeacoffee.com/ezii';
  buyMeAPizza.target = '_blank';

  actionBar.appendChild(buyMeAPizza);
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
  settingsButton.title = 'CMD/CTRL + SHIFT + S';

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
  chrome.storage.local.get(['settings', 'presetPrompts', 'selectedConversations', 'customPrompts', 'customInstructionProfiles'], (result) => {
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
        autoScroll: result.settings?.autoScroll !== undefined ? result.settings.autoScroll : true,
        autoSync: result.settings?.autoSync !== undefined ? result.settings.autoSync : true,
        autoRefreshAfterSync: result.settings?.autoRefreshAfterSync !== undefined ? result.settings.autoRefreshAfterSync : true,
        quickSync: result.settings?.quickSync !== undefined ? result.settings.quickSync : false,
        quickSyncCount: result.settings?.quickSyncCount !== undefined ? result.settings.quickSyncCount : 100,
        safeMode: result.settings?.safeMode !== undefined ? result.settings.safeMode : true,
        promptHistory: result.settings?.promptHistory !== undefined ? result.settings.promptHistory : true,
        copyMode: result.settings?.copyMode !== undefined ? result.settings.copyMode : false,
        autoResetTopNav: result.settings?.autoResetTopNav !== undefined ? result.settings.hideBottomSidebar : false,
        hideBottomSidebar: result.settings?.hideBottomSidebar !== undefined ? result.settings.hideBottomSidebar : false,
        showExamplePrompts: result.settings?.showExamplePrompts !== undefined ? result.settings.showExamplePrompts : false,
        showMessageTimestamp: result.settings?.showMessageTimestamp !== undefined ? result.settings.showMessageTimestamp : false,
        showCustomPromptsButton: result.settings?.showCustomPromptsButton !== undefined ? result.settings.showCustomPromptsButton : true,
        showExportButton: result.settings?.showExportButton !== undefined ? result.settings.showExportButton : true,
        showWordCount: result.settings?.showWordCount !== undefined ? result.settings.showWordCount : true,
        hideNewsletter: result.settings?.hideNewsletter !== undefined ? result.settings.hideNewsletter : false,
        chatEndedSound: result.settings?.chatEndedSound !== undefined ? result.settings.chatEndedSound : false,
        customInstruction: result.settings?.customInstruction !== undefined ? result.settings.customInstruction : '',
        useCustomInstruction: result.settings?.useCustomInstruction !== undefined ? result.settings.useCustomInstruction : false,
        customConversationWidth: result.settings?.customConversationWidth !== undefined ? result.settings.customConversationWidth : false,
        conversationWidth: result.settings?.conversationWidth !== undefined ? result.settings.conversationWidth : 50,
        saveHistory: result.settings?.saveHistory !== undefined ? result.settings.saveHistory : true,
        promptTemplate: result.settings?.promptTemplate !== undefined ? result.settings.promptTemplate : true,
        emailNewsletter: result.settings?.emailNewsletter !== undefined ? result.settings.emailNewsletter : false,
        autoClick: result.settings?.autoClick !== undefined ? result.settings.autoClick : false,
        showGpt4Counter: result.settings?.showGpt4Counter !== undefined ? result.settings.showGpt4Counter : true,
        autoSummarize: result.settings?.autoSummarize !== undefined ? result.settings.autoSummarize : false,
        autoSplit: result.settings?.autoSplit !== undefined ? result.settings.autoSplit : true,
        autoSplitLimit: result.settings?.autoSplitLimit !== undefined ? result.settings.autoSplitLimit : 8000,
        autoSplitInitialPrompt: result.settings?.autoSplitInitialPrompt !== undefined ? result.settings?.autoSplitInitialPrompt : `Act like a document/text loader until you load and remember the content of the next text/s or document/s.
There might be multiple files, each file is marked by name in the format ### DOCUMENT NAME.
I will send them to you in chunks. Each chunk starts will be noted as [START CHUNK x/TOTAL], and the end of this chunk will be noted as [END CHUNK x/TOTAL], where x is the number of current chunks, and TOTAL is the number of all chunks I will send you.
I will split the message in chunks, and send them to you one by one. For each message follow the instructions at the end of the message.
Let's begin:

`,
        autoSplitChunkPrompt: result.settings?.autoSplitChunkPrompt !== undefined ? result.settings?.autoSplitChunkPrompt : `Reply with OK: [CHUNK x/TOTAL]
Don't reply with anything else!`,
        keepFoldersAtTheTop: result.settings?.keepFoldersAtTheTop !== undefined ? result.settings.keepFoldersAtTheTop : false,
        conversationTimestamp: result.settings?.conversationTimestamp !== undefined ? result.settings.conversationTimestamp : true,
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
      customInstructionProfiles: result.customInstructionProfiles !== undefined ? result.customInstructionProfiles : [],
      customPrompts: newCustomPrompts,
    }, () => addSettingsButton());
  });
}
