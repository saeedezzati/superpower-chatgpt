/* eslint-disable no-unused-vars */
/* global getAllPlugins, initializePluginStoreModal, addPluginStoreEventListener */
// eslint-disable-next-line no-unused-vars
function pluginsDropdown(installedPlugins, enabledPluginIds, idPrefix, forceDark = false) {
  const enabledPlugins = installedPlugins?.filter((plugin) => enabledPluginIds?.includes(plugin.id));
  return `<button id="${idPrefix}-plugins-dropdown-button" class="relative w-full cursor-pointer rounded-md border ${forceDark ? 'border-white/20 bg-gray-800' : 'border-gray-300 bg-white'} pt-1 pl-3 pr-10 text-left focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600 dark:border-white/20 dark:bg-gray-800 sm:text-sm" type="button">
  <label class="block text-xs ${forceDark ? 'text-gray-500' : 'text-gray-700'} dark:text-gray-500">Plugins</label>
  <span class="inline-flex w-full truncate font-semibold ${forceDark ? 'text-gray-100' : 'text-gray-800'} dark:text-gray-100">
    <span id="${idPrefix}-enabled-plugins-list" class="flex h-6 items-center gap-1 truncate">
    ${enabledPlugins?.length > 0 ? `<div class="flex gap-1">
      ${enabledPlugins?.map((enabledPlugin) => `<div class="relative" style="width: 16px; height: 16px;"><img src="${enabledPlugin?.manifest.logo_url}" alt="${enabledPlugin.manifest.name_for_human} logo" class="h-full w-full bg-white rounded-sm"><div class="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-sm"></div></div>`).join('')}
      </div>` : '<span class="flex h-6 items-center gap-1 truncate">No plugins enabled</span>'}
    </span>
  </span>
  <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
    <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4  text-gray-400" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  </span>
</button>
<ul id="${idPrefix}-plugin-list-dropdown" style="width:400px;max-height:400px" class="hidden absolute z-10 mt-1 overflow-auto rounded-md py-1 text-base ring-1 ring-opacity-5 focus:outline-none ${forceDark ? 'bg-gray-800 ring-white/20 last:border-0' : 'bg-white'} dark:bg-gray-800 dark:ring-white/20 dark:last:border-0 sm:text-sm -translate-x-1/4" role="menu" aria-orientation="vertical" aria-labelledby="plugins-dropdown-button" tabindex="-1">
  <div id="enabled-plugins-limit" class="flex h-8 items-center justify-center border-b border-black/10 bg-gray-50 text-xs ${forceDark ? 'text-white border-white/20 bg-[#272832]' : 'text-gray-800 border-black/10 bg-gray-50'} dark:border-white/20 dark:bg-[#272832] dark:text-white transition-colors duration-300">${enabledPluginIds?.length || 0}/3 Enabled</div>
  ${createPluginsDropDown(installedPlugins, enabledPluginIds, idPrefix, forceDark)}
  <li id="plugin-store-button" class="group relative flex h-[42px] cursor-pointer select-none items-center overflow-hidden border-b border-black/10 pl-3 pr-9 last:border-0 ${forceDark ? 'border-white/20' : 'border-b border-black/10'} dark:border-white/20 text-gray-900" role="option" tabindex="-1" aria-selected="false">
  <div class="${forceDark ? 'text-gray-100' : 'text-gray-800'} dark:text-gray-100">Plugin store (CMD/CTRL + SHIFT + P)</div>
  <span class="absolute inset-y-0 right-0 flex items-center pr-3 ${forceDark ? 'text-gray-100' : 'text-gray-800'} dark:text-gray-100">
    <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 h-5 w-5" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
  </span>
</li>
</ul>
<div id="${idPrefix}-plugin-specifics" style="width: 260px; min-height: 240px; top:50px; left: 405px;"  class="hidden rounded ring-1 ring-black/10 absolute z-[17] -ml-[1px] flex flex-col gap-2 p-3 sm:p-4 ${forceDark ? 'bg-gray-800 ring-white/20 last:border-0' : 'bg-white'} dark:bg-gray-800 dark:ring-white/20 dark:last:border-0">
asd
</div>`;
}
function createPluginsDropDown(installedPlugins, enabledPluginIds, idPrefix, forceDark = false) {
  return `${installedPlugins?.map((installedPlugin) => `<li class="text-gray-900 group relative cursor-pointer select-none border-b py-1 pl-3 pr-9 last:border-0 ${forceDark ? 'border-white/20' : 'border-gray-100'} dark:border-white/20" id="${idPrefix}-plugins-dropdown-option-${installedPlugin.id}" role="option" tabindex="-1">
  <span id="${idPrefix}-plugin-dropdown-option-${installedPlugin.id}" class="flex items-center gap-1.5 truncate">
    <span class="h-6 w-6 shrink-0">
      <div class="relative" style="width: 100%; height: 100%;">
        <img src="${installedPlugin.manifest.logo_url}" alt="${installedPlugin.manifest.name_for_human} logo" class="h-full w-full bg-white rounded-sm">
        <div class="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-sm"></div>
      </div>
    </span>
    <span class="flex h-6 items-center gap-1 ${forceDark ? 'text-gray-100' : 'text-gray-800'} dark:text-gray-100">${installedPlugin.manifest.name_for_human}</span>
    ${installedPlugin.status !== 'approved' ? '<div class="flex h-[18px] w-[18px] items-center justify-center rounded-[5px] bg-red-200 text-red-800"><svg stroke="currentColor" fill="none" stroke-width="2.5" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 h-3 w-3" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M19.69 14a6.9 6.9 0 0 0 .31-2V5l-8-3-3.16 1.18"></path><path d="M4.73 4.73L4 5v7c0 6 8 10 8 10a20.29 20.29 0 0 0 5.62-4.38"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg></div>' : ''}
  </span>
  <span id="${idPrefix}-plugin-checkmark-${installedPlugin.id}" class="absolute inset-y-0 right-0 flex items-center pr-3 ${forceDark ? 'text-gray-100' : 'text-gray-800'} dark:text-gray-100">
  ${enabledPluginIds?.includes(installedPlugin.id) ? `<div class="flex h-6 w-6 items-center justify-center rounded-full border transition-colors border-transparent bg-green-600 text-white" aria-hidden="true">
      <svg stroke="currentColor" fill="none" stroke-width="2.5" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 h-3 w-3 transition-opacity opacity-100" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"> <polyline points="20 6 9 17 4 12"></polyline></svg></div>` : `<div class="flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${forceDark ? 'border-white/20' : 'border-black/5'} dark:border-white/20" aria-hidden="true">
      <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 h-3 w-3 transition-opacity opacity-0 group-hover:opacity-50" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      </div>`}
  </span>
  </li>`).join('')} `;
}

function addPluginsDropdownEventListener(idPrefix, forceDark = false) {
  const pluginDropdownButton = document.querySelector(`#${idPrefix}-plugins-dropdown-button`);
  pluginDropdownButton.addEventListener('click', () => {
    const pluginListDropdown = document.querySelector(`#${idPrefix}-plugin-list-dropdown`);
    const cl = pluginListDropdown.classList;
    if (cl.contains('block')) {
      pluginListDropdown.classList.replace('block', 'hidden');
    } else {
      pluginListDropdown.classList.replace('hidden', 'block');
    }
  });
  // close pluginListDropdown when clicked outside
  document.addEventListener('click', (e) => {
    const pluginListDropdown = document.querySelector(`#${idPrefix}-plugin-list-dropdown`);
    const cl = pluginListDropdown?.classList;
    if (cl && cl.contains('block') && (!e.target.closest(`#${idPrefix}-plugins-dropdown-button`) && !e.target.closest(`#${idPrefix}-plugin-list-dropdown`))) {
      pluginListDropdown.classList.replace('block', 'hidden');
    }
  });

  const pluginStoreButton = document.querySelector('#plugin-store-button');
  pluginStoreButton.addEventListener('click', () => {
    const pluginListDropdown = document.querySelector(`#${idPrefix}-plugin-list-dropdown`);
    pluginListDropdown.classList.replace('block', 'hidden');
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
  });

  const pluginDropdownOptions = document.querySelectorAll(`[id ^= ${idPrefix}-plugins-dropdown-option-]`);

  pluginDropdownOptions.forEach((option) => {
    option.addEventListener('mousemove', () => {
      const darkMode = document.querySelector('html').classList.contains('dark');
      option.classList.add((darkMode || forceDark) ? 'bg-gray-600' : 'bg-gray-200');
      const pluginSpecifics = document.querySelector(`#${idPrefix}-plugin-specifics`);
      if (pluginSpecifics.classList.contains('hidden')) {
        chrome.storage.local.get(['installedPlugins'], (result) => {
          const { installedPlugins } = result;

          const pluginId = option.id.split(`${idPrefix}-plugins-dropdown-option-`)[1];
          const plugin = installedPlugins.find((p) => p.id === pluginId);
          pluginSpecifics.innerHTML = `<div class="relative" style="width: 70px; height: 70px;"><img src="${plugin.manifest.logo_url}" alt="${plugin.manifest.name_for_human} logo" class="h-full w-full bg-white rounded-sm"><div class="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-sm"></div></div><div class="flex items-center gap-1">${plugin.manifest.name_for_human}  ${plugin.status !== 'approved' ? '<div class="flex h-[18px] w-[18px] items-center justify-center rounded-[5px] bg-red-200 text-red-800"><svg stroke="currentColor" fill="none" stroke-width="2.5" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 h-3 w-3" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M19.69 14a6.9 6.9 0 0 0 .31-2V5l-8-3-3.16 1.18"></path><path d="M4.73 4.73L4 5v7c0 6 8 10 8 10a20.29 20.29 0 0 0 5.62-4.38"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg></div>' : ''}</div><div class="whitespace-pre-line text-xs">${plugin.manifest.description_for_human}</div>`;

          pluginSpecifics.classList.remove('hidden');
        });
      }
    });

    option.addEventListener('mouseleave', () => {
      const darkMode = document.querySelector('html').classList.contains('dark');
      option.classList.remove((darkMode || forceDark) ? 'bg-gray-600' : 'bg-gray-200');
      const pluginSpecifics = document.querySelector(`#${idPrefix}-plugin-specifics`);
      pluginSpecifics.classList.add('hidden');
    });
    option.addEventListener('click', () => {
      chrome.storage.local.get(['installedPlugins', 'enabledPluginIds'], ({
        installedPlugins, enabledPluginIds,
      }) => {
        const pluginId = option.id.split(`${idPrefix}-plugins-dropdown-option-`)[1];
        const plugin = installedPlugins.find((p) => p.id === pluginId);

        if (enabledPluginIds.includes(pluginId)) {
          const newEnabledPluginIds = enabledPluginIds.filter((id) => id !== pluginId);
          chrome.storage.local.set({ enabledPluginIds: newEnabledPluginIds });
        } else {
          // eslint-disable-next-line no-lonely-if
          if (enabledPluginIds.length >= 3) {
            const enabledPluginLimit = document.querySelector('#enabled-plugins-limit');
            enabledPluginLimit.classList = `flex h-8 flex-shrink-0 items-center justify-center border-b ${forceDark ? 'border-white/20 bg-red-200 text-red-800' : 'border-black/10 bg-red-200 text-red-800'} text-xs dark:border-white/20 transition-colors duration-300 dark:bg-red-200 dark:text-red-800`;
            setTimeout(() => {
              enabledPluginLimit.classList = `flex h-8 items-center justify-center border-b border-black/10 bg-gray-50 text-xs ${forceDark ? 'text-white border-white/20 bg-[#272832]' : 'text-gray-800 border-black/10 bg-gray-50'} dark:border-white/20 dark:bg-[#272832] dark:text-white transition-colors duration-300`;
            }, 500);
          } else {
            const newEnabledPluginIds = [...(enabledPluginIds || []), pluginId];
            chrome.storage.local.set({ enabledPluginIds: newEnabledPluginIds });
          }
        }
      });
    });
    chrome.storage.onChanged.addListener((e) => {
      if (e.enabledPluginIds && JSON.stringify(e.enabledPluginIds.newValue) !== JSON.stringify(e.enabledPluginIds.oldValue)) {
        chrome.storage.local.get(['installedPlugins'], ({
          installedPlugins,
        }) => {
          const newEnabledPluginIds = e.enabledPluginIds.newValue;
          const enabledPluginLimit = document.querySelector('#enabled-plugins-limit');
          enabledPluginLimit.innerHTML = `${newEnabledPluginIds?.length || 0}/3 Enabled`;
          const enabledPluginsListElement = document.querySelector('#navbar-enabled-plugins-list');
          if (newEnabledPluginIds.length === 0) {
            enabledPluginsListElement.innerHTML = '<span class="flex h-6 items-center gap-1 truncate">No plugins enabled</span>';
          } else {
            const enabledPlugins = installedPlugins.filter((p) => newEnabledPluginIds?.includes(p.id));
            enabledPluginsListElement.innerHTML = `<div class="flex gap-1">
              ${enabledPlugins?.map((enabledPlugin) => `<div class="relative" style="width: 16px; height: 16px;"><img src="${enabledPlugin?.manifest.logo_url}" alt="${enabledPlugin.manifest.name_for_human} logo" class="h-full w-full bg-white rounded-sm"><div class="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-sm"></div></div>`).join('')}
              </div>`;
          }
          const allPluginCheckmarkWrappers = document.querySelectorAll(`[id^=${idPrefix}-plugin-checkmark-]`);
          allPluginCheckmarkWrappers.forEach((pluginCheckmarkWrapper) => {
            pluginCheckmarkWrapper.innerHTML = `<div class="flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${forceDark ? 'border-white/20' : 'border-black/5'} dark:border-white/20" aria-hidden="true">
            <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 h-3 w-3 transition-opacity opacity-0 group-hover:opacity-50" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            </div>`;
          });
          newEnabledPluginIds.forEach((enabledPluginId) => {
            const pluginCheckmarkWrapper = document.querySelector(`#${idPrefix}-plugin-checkmark-${enabledPluginId}`);
            pluginCheckmarkWrapper.innerHTML = `<div class="flex h-6 w-6 items-center justify-center rounded-full border transition-colors border-transparent bg-green-600 text-white" aria-hidden="true">
              <svg stroke="currentColor" fill="none" stroke-width="2.5" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 h-3 w-3 transition-opacity opacity-100" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"> <polyline points="20 6 9 17 4 12"></polyline></svg></div>`;
          });
        });
      }
    });
  });
}
