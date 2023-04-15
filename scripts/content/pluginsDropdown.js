/* eslint-disable no-unused-vars */
/* global */
// eslint-disable-next-line no-unused-vars
function pluginsDropdown(models, selectedModel, idPrefix, customModels, forceDark = false) {
  return `<button id="${idPrefix}-plugins-dropdown-button" class="relative w-full cursor-pointer rounded-md border ${forceDark ? 'border-white/20 bg-gray-800' : 'border-gray-300 bg-white'} pt-1 pl-3 pr-10 text-left focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600 dark:border-white/20 dark:bg-gray-800 sm:text-sm" type="button">
  <label class="block text-xs ${forceDark ? 'text-gray-500' : 'text-gray-700'} dark:text-gray-500">Plugins</label>
  <span class="inline-flex w-full truncate font-semibold ${forceDark ? 'text-gray-100' : 'text-gray-800'} dark:text-gray-100">
    <span class="flex h-6 items-center gap-1 truncate"><span id="${idPrefix}-selected-plugin-title">${selectedModel.title} ${selectedModel.tags?.map((tag) => `<span class="py-0.25 rounded px-1 text-[10px] font-semibold uppercase bg-blue-200 text-[#4559A4]">${tag}</span>`)}</span>
    </span>
  </span>
  <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
    <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4  text-gray-400" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  </span>
</button>
<ul id="${idPrefix}-plugin-list-dropdown" style="width:400px;max-height:400px" class="hidden absolute z-10 mt-1 overflow-auto rounded-md py-1 text-base ring-1 ring-opacity-5 focus:outline-none ${forceDark ? 'bg-gray-800 ring-white/20 last:border-0' : 'bg-white'} dark:bg-gray-800 dark:ring-white/20 dark:last:border-0 sm:text-sm -translate-x-1/4" role="menu" aria-orientation="vertical" aria-labelledby="plugins-dropdown-button" tabindex="-1">
  <div class="flex h-8 items-center justify-center border-b border-black/10 bg-gray-50 text-xs ${forceDark ? 'text-white border-white/20 bg-[#272832]' : 'text-gray-800 border-black/10 bg-gray-50'} dark:border-white/20 dark:bg-[#272832] dark:text-white transition-colors duration-300">0/3 Enabled</div>
  ${createPluginsDropDown(models, selectedModel, idPrefix, customModels, forceDark)}
  <li id="plugin-store-button" class="group relative flex h-[42px] cursor-pointer select-none items-center overflow-hidden border-b border-black/10 pl-3 pr-9 last:border-0 ${forceDark ? 'border-white/20' : 'border-b border-black/10'}dark:border-white/20 text-gray-900" id="headlessui-listbox-option-:rc:" role="option" tabindex="-1" aria-selected="false" data-headlessui-state="">
  <div class="${forceDark ? 'text-gray-100' : 'text-gray-800'} dark:text-gray-100">Plugin store</div>
  <span class="absolute inset-y-0 right-0 flex items-center pr-3 ${forceDark ? 'text-gray-100' : 'text-gray-800'} dark:text-gray-100">
    <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 h-5 w-5" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
  </span>
</li>
</ul>
<div style="width:200px; left:400px;" id="${idPrefix}-plugin-specifics" class="hidden absolute z-10 mt-1 ml-1 overflow-auto rounded-md p-2 text-base ring-1 ring-opacity-5 focus:outline-none ${forceDark ? 'bg-gray-800 ring-white/20 last:border-0' : 'bg-white'} dark:bg-gray-800 dark:ring-white/20 dark:last:border-0 sm:text-sm -translate-x-1/4">
asd
</div>`;
}
function createPluginsDropDown(models, selectedModel, idPrefix, customModels, forceDark = false) {
  return `${models.map((model) => `<li class="text-gray-900 group relative cursor-pointer select-none border-b py-1 pl-3 pr-9 last:border-0 ${forceDark ? 'border-white/20' : 'border-gray-100'} dark:border-white/20" id="${idPrefix}-plugins-dropdown-option-${model.slug}" role="option" tabindex="-1">
  <span id="${idPrefix}-plugin-dropdown-option-${model.slug}" class="flex items-center gap-1.5 truncate">
    <span class="h-6 w-6 shrink-0">
      <div class="relative" style="width: 100%; height: 100%;">
        <img src="https://cdn.otstatic.com/third-party/images/opentable-logo-512.png" alt="OpenTable logo" class="h-full w-full bg-white rounded-sm">
        <div class="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-sm"></div>
      </div>
    </span>
    <span class="flex h-6 items-center gap-1 ${forceDark ? 'text-gray-100' : 'text-gray-800'} dark:text-gray-100">OpenTable</span>
  </span>
  <span class="absolute inset-y-0 right-0 flex items-center pr-3 ${forceDark ? 'text-gray-100' : 'text-gray-800'} dark:text-gray-100">
    <div class="flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${forceDark ? 'border-white/20' : 'border-black/5'} dark:border-white/20" aria-hidden="true">
      <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 h-3 w-3 transition-opacity opacity-0 group-hover:opacity-50" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </div>
  </span> : ''}
  </li>`).join('')}`;
}
function createPluginSpecifics(rating, forceDark = false) {
  const [filled, total] = rating;
  const filledPills = [...Array(filled)].map(() => '<div class="h-2 w-full rounded-lg ml-1 bg-green-600"></div>');
  const emptyPills = [...Array(total - filled)].map(() => `<div class="h-2 w-full ml-1 rounded-lg ${forceDark ? 'bg-gray-600' : 'bg-gray-200'} dark:bg-gray-600"></div>`);
  return filledPills.concat(emptyPills).join('');
}
function addPluginsDropdownEventListener(idPrefix, forceDark = false) {
  const pluginDropdownButton = document.querySelector(`#${idPrefix}-plugins-dropdown-button`);
  pluginDropdownButton.addEventListener('click', () => {
    const modelListDropdown = document.querySelector(`#${idPrefix}-plugin-list-dropdown`);
    const cl = modelListDropdown.classList;
    if (cl.contains('block')) {
      modelListDropdown.classList.replace('block', 'hidden');
    } else {
      modelListDropdown.classList.replace('hidden', 'block');
    }
  });
  // close modelListDropdown when clicked outside
  document.addEventListener('click', (e) => {
    const modelListDropdown = document.querySelector(`#${idPrefix}-plugin-list-dropdown`);
    const cl = modelListDropdown?.classList;
    if (cl && cl.contains('block') && !e.target.closest(`#${idPrefix}-plugins-dropdown-button`)) {
      modelListDropdown.classList.replace('block', 'hidden');
    }
  });

  const pluginDropdownOptions = document.querySelectorAll(`[id^=${idPrefix}-plugins-dropdown-option-]`);

  pluginDropdownOptions.forEach((option) => {
    option.addEventListener('mousemove', () => {
      const dardMode = document.querySelector('html').classList.contains('dark');
      option.classList.add((dardMode || forceDark) ? 'bg-gray-600' : 'bg-gray-200');
      const modelSpecifics = document.querySelector(`#${idPrefix}-plugin-specifics`);
      chrome.storage.local.get(['models', 'unofficialModels', 'customModels'], (result) => {
        const { models, unofficialModels, customModels } = result;
        const allModels = [...models, ...unofficialModels, ...customModels];

        const slug = option.id.split(`${idPrefix}-plugins-dropdown-option-`)[1];
        const model = allModels.find((m) => m.slug === slug);
        const specifics = model?.qualitative_properties;
        if (specifics && Object.keys(specifics).length > 0) {
          modelSpecifics.innerHTML = Object.keys(specifics).map((key) => `<div class="flex items-center justify-between"><div class="text-sm capitalize ${forceDark ? 'text-gray-100' : 'text-gray-800'} dark:text-gray-100">${key}</div><div class="flex w-1/2">${createPluginSpecifics(specifics[key], forceDark)}</div></div>`).join('');
          modelSpecifics.classList.remove('hidden');
        }
      });
    });

    option.addEventListener('mouseleave', () => {
      const dardMode = document.querySelector('html').classList.contains('dark');
      option.classList.remove((dardMode || forceDark) ? 'bg-gray-600' : 'bg-gray-200');
      const modelSpecifics = document.querySelector(`#${idPrefix}-plugin-specifics`);
      modelSpecifics.classList.add('hidden');
    });
    option.addEventListener('click', () => {
      chrome.storage.local.get(['settings', 'models', 'unofficialModels', 'customModels'], ({
        settings, models, unofficialModels, customModels,
      }) => {
        const allModels = [...models, ...unofficialModels, ...customModels];
        const modelSlug = option.id.split(`${idPrefix}-plugins-dropdown-option-`)[1];
        const selectedModel = allModels.find((m) => m.slug === modelSlug);
        chrome.storage.local.set({ settings: { ...settings, selectedModel } });
      });
    });
    chrome.storage.onChanged.addListener((e) => {
      if (e.settings && e.settings.newValue.selectedModel !== e.settings.oldValue.selectedModel) {
        const modelListDropdown = document.querySelector(`#${idPrefix}-plugin-list-dropdown`);
        modelListDropdown.classList.replace('block', 'hidden');
        const pluginCheckmark = document.querySelector(`#${idPrefix}-plugins-dropdown-checkmark`);
        pluginCheckmark.remove();
        const { selectedModel } = e.settings.newValue;
        const selectedModelTitle = document.querySelector(`#${idPrefix}-selected-plugin-title`);
        selectedModelTitle.innerHTML = `${selectedModel.title} ${selectedModel.tags?.map((tag) => `<span class="py-0.25 rounded px-1 text-[10px] font-semibold uppercase bg-blue-200 text-[#4559A4]">${tag}</span>`)}`;
        const selectedModelOption = document.querySelector(`#${idPrefix}-plugins-dropdown-option-${selectedModel.slug}`);
        selectedModelOption.appendChild(pluginCheckmark);
      }
    });
  });
}
