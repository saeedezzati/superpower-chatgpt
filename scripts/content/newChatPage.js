/* global createSwitch, getUserSystemMessage, setUserSystemMessage, profileDropdown, profileDropdownButton */
// eslint-disable-next-line no-unused-vars
function newChatPage(planName) {
  const outerDiv = document.createElement('div');
  outerDiv.classList = 'h-full dark:bg-gray-800" style="scroll-behavior: smooth;';

  const innerDiv = document.createElement('div');
  innerDiv.classList = 'flex flex-col items-center text-sm h-full dark:bg-gray-800;';
  outerDiv.appendChild(innerDiv);

  const body = document.createElement('div');
  body.classList = 'text-gray-800 w-full md:max-w-2xl lg:max-w-3xl md:h-full md:flex md:flex-col px-6 dark:text-gray-100';
  innerDiv.appendChild(body);

  const header = document.createElement('div');
  header.classList = 'text-4xl font-semibold text-center mt-6 sm:mt-[20vh] ml-auto mr-auto mb-10 sm:mb-16 flex gap-2 items-center justify-center';
  header.innerHTML = `ChatGPT ${planName === 'chatgptplusplan' ? `<span
  class="bg-yellow-200 text-yellow-900 py-0.5 px-1.5 text-xs md:text-sm rounded-md uppercase">Plus</span>` : ''}`;
  body.appendChild(header);

  const content = document.createElement('div');
  content.classList = 'flex items-center justify-center text-center gap-3.5';
  body.appendChild(content);

  const settings = document.createElement('div');
  settings.id = 'new-page-settings';
  settings.classList = 'flex flex-col items-start justify-end border border-gray-500 rounded-md p-4';
  settings.style = 'width: 600px;';
  content.appendChild(settings);
  settings.style.minHeight = '260px';
  // custom instruction settings
  const customInstructionSettings = customInstructionSettingsElement();
  settings.appendChild(customInstructionSettings);

  // divider
  const divider = document.createElement('div');
  divider.classList = 'border border-gray-500';
  divider.style = 'width: 70%; height: 1px; background-color: #e5e7eb; margin: 16px auto;';
  settings.appendChild(divider);

  const saveHistorySwitch = createSwitch('<span style="color:#8e8ea0 !important;">Chat History & Training</span>', '<div class="text-left">Save new chats to your history and allow them to be used to improve ChatGPT via model training. Unsaved chats will be deleted from our systems within 30 days. <a href="https://help.openai.com/en/articles/7730893" target="_blank" class="underline" rel="noreferrer">Learn more</a></div>', 'saveHistory', true);
  settings.appendChild(saveHistorySwitch);
  const bottom = document.createElement('div');
  bottom.classList = 'w-full h-32 md:h-48 flex-shrink-0';
  innerDiv.appendChild(bottom);

  return outerDiv;
}
function customInstructionSettingsElement() {
  const customInstructionSettings = document.createElement('div');
  customInstructionSettings.id = 'custom-instruction-settings';
  customInstructionSettings.classList = 'flex items-start justify-between w-full';
  const customInstructionSettingsLeft = document.createElement('div');
  customInstructionSettingsLeft.style = 'width: 60%;';
  const customInstructionSettingsRight = document.createElement('div');
  customInstructionSettingsRight.style = 'width: 40%;display:flex;justify-content:flex-end;';
  customInstructionSettings.appendChild(customInstructionSettingsLeft);
  customInstructionSettings.appendChild(customInstructionSettingsRight);
  getUserSystemMessage().then((systemMessage) => {
    const customInstructionSwitch = createSwitch('<span style="color:#8e8ea0 !important;">Custom Instruction</span>', '<div class="text-left"><a href="https://help.openai.com/en/articles/8096356-custom-instructions-for-chatgpt" target="_blank" class="underline" rel="noreferrer">Learn more</a> about Custom instructions and how they’re used to help ChatGPT provide better responses.</div>', null, systemMessage.enabled, (checked) => setUserSystemMessageCallback(checked, systemMessage));
    customInstructionSettingsLeft.appendChild(customInstructionSwitch);
    chrome.storage.local.get(['customInstructionProfiles'], (result) => {
      const { customInstructionProfiles } = result;
      let newCustomInstructionProfiles = customInstructionProfiles;
      const selectedProfile = customInstructionProfiles.find((p) => p.isSelected);

      if (!selectedProfile || selectedProfile.aboutUser.replace(/[^a-zA-Z]/g, '') !== systemMessage.about_user_message.replace(/[^a-zA-Z]/g, '') || selectedProfile.aboutModel.replace(/[^a-zA-Z]/g, '') !== systemMessage.about_model_message.replace(/[^a-zA-Z]/g, '')) {
        newCustomInstructionProfiles = customInstructionProfiles.map((p) => {
          if (p.aboutModel.replace(/[^a-zA-Z]/g, '') === systemMessage.about_model_message.replace(/[^a-zA-Z]/g, '') && p.aboutUser.replace(/[^a-zA-Z]/g, '') === systemMessage.about_user_message.replace(/[^a-zA-Z]/g, '')) {
            return { ...p, isSelected: true };
          }
          if (p.isSelected) {
            return { ...p, isSelected: false };
          }
          return p;
        });

        chrome.storage.local.set({ customInstructionProfiles: newCustomInstructionProfiles });
      }

      const profileButtonWrapper = document.createElement('div');
      profileButtonWrapper.style = 'position:relative;width: 200px;margin-top:8px;';
      profileButtonWrapper.id = 'custom-instructions-profile-button-wrapper-new-page';
      if (!systemMessage.enabled) {
        profileButtonWrapper.style.pointerEvents = 'none';
        profileButtonWrapper.style.opacity = '0.5';
      }
      profileButtonWrapper.appendChild(profileDropdown(newCustomInstructionProfiles, 'new-page'));
      profileButtonWrapper.appendChild(profileDropdownButton(newCustomInstructionProfiles, 'new-page'));
      customInstructionSettingsRight.appendChild(profileButtonWrapper);
    });
  });
  return customInstructionSettings;
}
function setUserSystemMessageCallback(checked, systemMessage) {
  const profileButtonWrapper = document.getElementById('custom-instructions-profile-button-wrapper-new-page');
  if (checked) {
    profileButtonWrapper.style.pointerEvents = 'unset';
    profileButtonWrapper.style.opacity = '1';
  } else {
    profileButtonWrapper.style.pointerEvents = 'none';
    profileButtonWrapper.style.opacity = '0.5';
  }
  setUserSystemMessage(systemMessage.about_user_message, systemMessage.about_model_message, checked);
}
