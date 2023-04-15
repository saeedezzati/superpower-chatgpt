/* eslint-disable no-unused-vars */
/* global getInstalledPlugins */
// eslint-disable-next-line no-unused-vars
function modelSwitcher(models, selectedModel, idPrefix, customModels, forceDark = false) {
  return `<button id="${idPrefix}-model-switcher-button" class="relative w-full cursor-pointer rounded-md border ${forceDark ? 'border-white/20 bg-gray-800' : 'border-gray-300 bg-white'} pt-1 pl-3 pr-10 text-left focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600 dark:border-white/20 dark:bg-gray-800 sm:text-sm" type="button">
  <label class="block text-xs ${forceDark ? 'text-gray-500' : 'text-gray-700'} dark:text-gray-500">Model</label>
  <span class="inline-flex w-full truncate font-semibold ${forceDark ? 'text-gray-100' : 'text-gray-800'} dark:text-gray-100">
    <span class="flex h-6 items-center gap-1 truncate"><span id="${idPrefix}-selected-model-title">${selectedModel.title} ${selectedModel.tags?.map((tag) => `<span class="py-0.25 rounded px-1 text-[10px] font-semibold uppercase bg-blue-200 text-[#4559A4]">${tag}</span>`)}</span>
    </span>
  </span>
  <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
    <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4  text-gray-400" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  </span>
</button>
<ul id="${idPrefix}-model-list-dropdown" style="width:400px;max-height:400px" class="hidden absolute z-10 mt-1 overflow-auto rounded-md py-1 text-base ring-1 ring-opacity-5 focus:outline-none ${forceDark ? 'bg-gray-800 ring-white/20 last:border-0' : 'bg-white'} dark:bg-gray-800 dark:ring-white/20 dark:last:border-0 sm:text-sm -translate-x-1/4" role="menu" aria-orientation="vertical" aria-labelledby="model-switcher-button" tabindex="-1">
  ${createModelListDropDown(models, selectedModel, idPrefix, customModels, forceDark)}
</ul>
<div style="width:200px; left:400px;" id="${idPrefix}-model-specifics" class="hidden absolute z-10 mt-1 ml-1 overflow-auto rounded-md p-2 text-base ring-1 ring-opacity-5 focus:outline-none ${forceDark ? 'bg-gray-800 ring-white/20 last:border-0' : 'bg-white'} dark:bg-gray-800 dark:ring-white/20 dark:last:border-0 sm:text-sm -translate-x-1/4">
asd
</div>`;
}
function createModelListDropDown(models, selectedModel, idPrefix, customModels, forceDark = false) {
  return `${models.map((model) => `<li class="text-gray-900 group relative cursor-pointer select-none border-b py-1 pl-3 pr-9 last:border-0 ${forceDark ? 'border-white/20' : 'border-gray-100'} dark:border-white/20" id="${idPrefix}-model-switcher-option-${model.slug}" role="option" tabindex="-1">
 <div class="flex flex-col">
   <span class="font-semibold flex h-6 items-center gap-1 truncate ${forceDark ? 'text-gray-100' : 'text-gray-800'} dark:text-gray-100">${model.title} ${model?.tags?.map((tag) => `<span class="py-0.25 rounded px-1 text-[10px] font-semibold uppercase bg-blue-200 text-[#4559A4]">${tag}</span>`)}</span>
   <span class="${forceDark ? 'text-gray-500' : 'text-gray-800'} dark:text-gray-500 text-xs">${model.description}</span>
 </div>
 ${customModels.map((m) => m.slug).includes(model.slug) ? `<span id="delete-model-${model.slug}" class="absolute w-4 h-4 inset-y-0 flex items-center pr-4 ${forceDark ? 'text-gray-100' : 'text-gray-800'} dark:text-gray-100 invisible group-hover:visible" style="right:40px;top:13px;"><svg xmlns="http://www.w3.org/2000/svg" fill="#ddd" viewBox="0 0 448 512"><path d="M160 400C160 408.8 152.8 416 144 416C135.2 416 128 408.8 128 400V192C128 183.2 135.2 176 144 176C152.8 176 160 183.2 160 192V400zM240 400C240 408.8 232.8 416 224 416C215.2 416 208 408.8 208 400V192C208 183.2 215.2 176 224 176C232.8 176 240 183.2 240 192V400zM320 400C320 408.8 312.8 416 304 416C295.2 416 288 408.8 288 400V192C288 183.2 295.2 176 304 176C312.8 176 320 183.2 320 192V400zM317.5 24.94L354.2 80H424C437.3 80 448 90.75 448 104C448 117.3 437.3 128 424 128H416V432C416 476.2 380.2 512 336 512H112C67.82 512 32 476.2 32 432V128H24C10.75 128 0 117.3 0 104C0 90.75 10.75 80 24 80H93.82L130.5 24.94C140.9 9.357 158.4 0 177.1 0H270.9C289.6 0 307.1 9.358 317.5 24.94H317.5zM151.5 80H296.5L277.5 51.56C276 49.34 273.5 48 270.9 48H177.1C174.5 48 171.1 49.34 170.5 51.56L151.5 80zM80 432C80 449.7 94.33 464 112 464H336C353.7 464 368 449.7 368 432V128H80V432z"/></svg></span>` : ''}
 ${model.slug === selectedModel.slug ? `<span id="${idPrefix}-model-switcher-checkmark" class="absolute inset-y-0 right-4 flex items-center pr-4 ${forceDark ? 'text-gray-100' : 'text-gray-800'} dark:text-gray-100">
 <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 h-5 w-5" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
   <polyline points="20 6 9 17 4 12"></polyline>
 </svg>
 </span>` : ''}
</li>`).join('')}`;
}

function createModelSpecifics(rating, forceDark = false) {
  const [filled, total] = rating;
  const filledPills = [...Array(filled)].map(() => '<div class="h-2 w-full rounded-lg ml-1 bg-green-600"></div>');
  const emptyPills = [...Array(total - filled)].map(() => `<div class="h-2 w-full ml-1 rounded-lg ${forceDark ? 'bg-gray-600' : 'bg-gray-200'} dark:bg-gray-600"></div>`);
  return filledPills.concat(emptyPills).join('');
}
function addModelSwitcherEventListener(idPrefix, forceDark = false) {
  const modelSwitcherButton = document.querySelector(`#${idPrefix}-model-switcher-button`);
  modelSwitcherButton.addEventListener('click', () => {
    const modelListDropdown = document.querySelector(`#${idPrefix}-model-list-dropdown`);
    const cl = modelListDropdown.classList;
    if (cl.contains('block')) {
      modelListDropdown.classList.replace('block', 'hidden');
    } else {
      modelListDropdown.classList.replace('hidden', 'block');
    }
  });
  // close modelListDropdown when clicked outside
  document.addEventListener('click', (e) => {
    const modelListDropdown = document.querySelector(`#${idPrefix}-model-list-dropdown`);
    const cl = modelListDropdown?.classList;
    if (cl && cl.contains('block') && !e.target.closest(`#${idPrefix}-model-switcher-button`)) {
      modelListDropdown.classList.replace('block', 'hidden');
    }
  });

  const modelSwitcherOptions = document.querySelectorAll(`[id^=${idPrefix}-model-switcher-option-]`);

  modelSwitcherOptions.forEach((option) => {
    option.addEventListener('mousemove', () => {
      const dardMode = document.querySelector('html').classList.contains('dark');
      option.classList.add((dardMode || forceDark) ? 'bg-gray-600' : 'bg-gray-200');
      const modelSpecifics = document.querySelector(`#${idPrefix}-model-specifics`);
      chrome.storage.local.get(['models', 'unofficialModels', 'customModels'], (result) => {
        const { models, unofficialModels, customModels } = result;
        const allModels = [...models, ...unofficialModels, ...customModels];

        const slug = option.id.split(`${idPrefix}-model-switcher-option-`)[1];
        const model = allModels.find((m) => m.slug === slug);
        const specifics = model?.qualitative_properties;
        if (specifics && Object.keys(specifics).length > 0) {
          modelSpecifics.innerHTML = Object.keys(specifics).map((key) => `<div class="flex items-center justify-between"><div class="text-sm capitalize ${forceDark ? 'text-gray-100' : 'text-gray-800'} dark:text-gray-100">${key}</div><div class="flex w-1/2">${createModelSpecifics(specifics[key], forceDark)}</div></div>`).join('');
          modelSpecifics.classList.remove('hidden');
        }
      });
    });
    const deleteButton = option.querySelector('[id^=delete-model-]');
    if (deleteButton) {
      deleteButton.addEventListener('click', (e) => {
        e.stopPropagation();
        const slug = deleteButton.id.split('delete-model-')[1];
        chrome.storage.local.get(['customModels'], (result) => {
          const { customModels } = result;
          const newCustomModels = customModels.filter((m) => m.slug !== slug);
          chrome.storage.local.set({ customModels: newCustomModels }, () => {
            const modelSwitcherOption = document.querySelector(`[id$=-model-switcher-option-${slug}]`);
            modelSwitcherOption.remove();
          });
        });
      });
    }
    option.addEventListener('mouseleave', () => {
      const dardMode = document.querySelector('html').classList.contains('dark');
      option.classList.remove((dardMode || forceDark) ? 'bg-gray-600' : 'bg-gray-200');
      const modelSpecifics = document.querySelector(`#${idPrefix}-model-specifics`);
      modelSpecifics.classList.add('hidden');
    });
    option.addEventListener('click', () => {
      chrome.storage.local.get(['settings', 'models', 'unofficialModels', 'customModels'], ({
        settings, models, unofficialModels, customModels,
      }) => {
        const allModels = [...models, ...unofficialModels, ...customModels];
        const modelSlug = option.id.split(`${idPrefix}-model-switcher-option-`)[1];
        const selectedModel = allModels.find((m) => m.slug === modelSlug);
        // const pluginsDropdownWrapper = document.querySelector(`#plugins-dropdown-wrapper-${idPrefix}`);
        // if (selectedModel.slug.includes('plugins')) {
        //   getInstalledPlugins();
        //   pluginsDropdownWrapper.style.display = 'block';
        // } else {
        //   pluginsDropdownWrapper.style.display = 'none';
        // }
        chrome.storage.local.set({ settings: { ...settings, selectedModel } });
      });
    });
    chrome.storage.onChanged.addListener((e) => {
      if (e.settings && e.settings.newValue.selectedModel !== e.settings.oldValue.selectedModel) {
        const modelListDropdown = document.querySelector(`#${idPrefix}-model-list-dropdown`);
        modelListDropdown.classList.replace('block', 'hidden');
        const modelSwitcherCheckmark = document.querySelector(`#${idPrefix}-model-switcher-checkmark`);
        modelSwitcherCheckmark.remove();
        const { selectedModel } = e.settings.newValue;
        const selectedModelTitle = document.querySelector(`#${idPrefix}-selected-model-title`);
        selectedModelTitle.innerHTML = `${selectedModel.title} ${selectedModel.tags?.map((tag) => `<span class="py-0.25 rounded px-1 text-[10px] font-semibold uppercase bg-blue-200 text-[#4559A4]">${tag}</span>`)}`;
        const selectedModelOption = document.querySelector(`#${idPrefix}-model-switcher-option-${selectedModel.slug}`);
        selectedModelOption.appendChild(modelSwitcherCheckmark);
      }
    });
  });
}
