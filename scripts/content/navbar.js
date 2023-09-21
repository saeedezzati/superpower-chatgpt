/* global modelSwitcher, dropdown, addDropdownEventListener, languageList, writingStyleList, toneList, addModelSwitcherEventListener, pluginsDropdown, addPluginsDropdownEventListener */
function addNavbar() {
  const existingNavbar = document.querySelector('#gptx-nav-wrapper');
  if (existingNavbar) existingNavbar.remove();
  const existingSyncBanner = document.querySelector('#sync-nav-wrapper');
  if (existingSyncBanner) existingSyncBanner.remove();
  const navWrapper = document.createElement('div');
  navWrapper.id = 'gptx-nav-wrapper';
  navWrapper.className = 'w-full z-10 bg-transparent transition-all relative top-0';
  navWrapper.style = 'height: 56px;';
  const navbar = document.createElement('div');
  navbar.id = 'gptx-navbar';
  navbar.className = 'w-full flex items-center justify-between border-b h-14 border-black/10 bg-gray-50 px-3 py-1 text-gray-500 dark:border-gray-900/50 dark:bg-gray-700 dark:text-gray-300 shadow-md';

  chrome.storage.local.get(['settings', 'models', 'installedPlugins', 'enabledPluginIds', 'unofficialModels', 'customModels'], (result) => {
    const {
      models, settings, unofficialModels, customModels, installedPlugins, enabledPluginIds,
    } = result;
    const {
      selectedModel, selectedLanguage, selectedTone, selectedWritingStyle, autoHideTopNav,
    } = settings;
    const allModels = [...models, ...unofficialModels, ...customModels];
    // Add model switcher
    if (!selectedModel) {
      // eslint-disable-next-line prefer-destructuring
      settings.selectedModel = allModels[0];
      chrome.storage.local.set({ settings });
    } else if (!allModels.map((m) => m.slug).includes(settings.selectedModel.slug)) {
      // eslint-disable-next-line prefer-destructuring
      settings.selectedModel = allModels[0];
      chrome.storage.local.set({ settings });
    }
    const leftSection = document.createElement('div');
    leftSection.style = 'display:flex;z-index:1000;margin-right:auto;';
    const modelSwitcherWrapper = document.createElement('div');
    modelSwitcherWrapper.style = 'position:relative;width:240px;z-index:1000';
    const idPrefix = 'navbar';
    modelSwitcherWrapper.id = `model-switcher-wrapper-${idPrefix}`;
    modelSwitcherWrapper.innerHTML = modelSwitcher(allModels, settings.selectedModel, idPrefix, customModels, settings.autoSync);
    leftSection.appendChild(modelSwitcherWrapper);

    // Add plugins dropdown
    if (models.map((m) => m.slug).find((m) => m.includes('plugins'))) {
      const pluginsDropdownWrapper = document.createElement('div');
      pluginsDropdownWrapper.style = 'position:relative;width:200px;margin-left:8px;z-index:1000;display:none';
      if (settings.selectedModel.slug.includes('plugins')) {
        pluginsDropdownWrapper.style.display = 'block';
      }
      pluginsDropdownWrapper.id = `plugins-dropdown-wrapper-${idPrefix}`;
      pluginsDropdownWrapper.innerHTML = pluginsDropdown(installedPlugins, enabledPluginIds, idPrefix);
      leftSection.appendChild(pluginsDropdownWrapper);
    }
    navbar.appendChild(leftSection);
    addModelSwitcherEventListener(idPrefix);
    if (models.map((m) => m.slug).find((m) => m.includes('plugins'))) {
      addPluginsDropdownEventListener(idPrefix);
    }
    const rightSection = document.createElement('div');
    rightSection.style = 'display:flex;z-index:1000;margin-left:auto;';

    // Add writing style selector
    const toneSelectorWrapper = document.createElement('div');
    toneSelectorWrapper.style = 'position:relative;width:150px;margin-left:8px;';
    toneSelectorWrapper.innerHTML = dropdown('Tone', toneList, selectedTone, 'right');
    rightSection.appendChild(toneSelectorWrapper);

    // Add tone selector
    const writingStyleSelectorWrapper = document.createElement('div');
    writingStyleSelectorWrapper.style = 'position:relative;width:150px;margin-left:8px;';
    writingStyleSelectorWrapper.innerHTML = dropdown('Writing-Style', writingStyleList, selectedWritingStyle, 'right');
    rightSection.appendChild(writingStyleSelectorWrapper);

    // Add language selector
    const languageSelectorWrapper = document.createElement('div');
    languageSelectorWrapper.style = 'position:relative;width:150px;margin-left:8px;';
    languageSelectorWrapper.innerHTML = dropdown('Language', languageList, selectedLanguage, 'right');
    rightSection.appendChild(languageSelectorWrapper);

    navbar.appendChild(rightSection);
    addDropdownEventListener('Tone', toneList);
    addDropdownEventListener('Writing-Style', writingStyleList);
    addDropdownEventListener('Language', languageList);

    if (autoHideTopNav) {
      navWrapper.style.top = '-56px';
      navWrapper.style.position = 'absolute';
      navWrapper.style.height = '112px';
    }
    navWrapper.addEventListener('mouseover', () => {
      chrome.storage.local.get(['settings'], (res) => {
        if (res.settings.autoHideTopNav) {
          navWrapper.style.top = '0px';
        }
      });
    });
    navWrapper.addEventListener('mouseout', () => {
      chrome.storage.local.get(['settings'], (res) => {
        if (res.settings.autoHideTopNav) {
          navWrapper.style.top = '-56px';
        }
      });
    });
  });

  const main = document.querySelector('main');
  if (!main) return;
  navWrapper.appendChild(navbar);
  main.parentNode.insertBefore(navWrapper, main);
}

// eslint-disable-next-line no-unused-vars
function initializeNavbar() {
  addNavbar();
}
