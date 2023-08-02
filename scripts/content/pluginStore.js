/* eslint-disable no-unused-vars */
/* global installPlugin, uninstallPlugin, pluginsDropdown, addPluginsDropdownEventListener */
let currentPluginStorePage = 1;
function initializePluginStoreModal(plugins) {
  const pageSize = 8;
  const total = plugins.length;
  const totalPages = Math.ceil(total / pageSize);
  return `<div
        data-state="open"
        class="fixed inset-0 bg-gray-500/90 dark:bg-gray-800/90"
        style="pointer-events: auto;"
      >
        <div
          class="grid-cols-[minmax(10px,30px)_1fr_minmax(10px,30px)] grid h-full w-full grid-rows-[minmax(10px,_1fr)_auto_minmax(10px,_1fr)] md:grid-rows-[minmax(20px,_1fr)_auto_minmax(20px,_1fr)] overflow-y-auto"
        >
          <div
            role="dialog"
            id="plugin-store-dialog"
            aria-describedby="radix-:r2r:"
            aria-labelledby="radix-:r2q:"
            data-state="open"
            class="relative col-auto col-start-2 row-auto row-start-2 w-full rounded-lg text-left shadow-xl transition-all left-1/2 -translate-x-1/2 bg-white dark:bg-gray-900 max-w-md w-full !max-w-7xl bg-gray-50 md:min-w-[672px] lg:min-w-[896px] xl:min-w-[1024px]"
            tabindex="-1"
            style="pointer-events: auto;"
          >
            <div
              class="px-4 pb-4 pt-5 sm:p-6 flex items-center justify-between border-b border-black/10 dark:border-white/10"
            >
              <div class="flex items-center">
                <div class="text-center sm:text-left">
                  <h2
                    id="radix-:r2q:"
                    as="h3"
                    class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-200"
                  >
                    Plugin store
                  </h2>
                </div>
              </div>
              <button id="plugin-store-close-button" class="inline-block text-gray-500 hover:text-gray-700">
                <svg
                  stroke="currentColor"
                  fill="none"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="text-gray-900 dark:text-gray-200"
                  height="20"
                  width="20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div class="p-4 sm:p-6 sm:pt-4">
              <div class="mt-4 flex flex-col gap-4">
                <div class="flex flex-wrap gap-3">
                  <button
                    id="plugin-filter-popular"
                    class="btn relative btn-light focus:ring-0 hover:bg-gray-200"
                  >
                    <div class="flex w-full gap-2 items-center justify-center">
                      Popular
                    </div></button
                  ><button
                    id="plugin-filter-new"
                    class="btn relative btn-neutral focus:ring-0 text-black/50"
                  >
                    <div class="flex w-full gap-2 items-center justify-center">
                      New
                    </div></button
                  ><button
                    id="plugin-filter-all"
                    class="btn relative btn-neutral focus:ring-0 text-black/50"
                  >
                    <div class="flex w-full gap-2 items-center justify-center">
                      All
                    </div></button
                  ><button
                    id="plugin-filter-installed"
                    class="btn relative btn-neutral focus:ring-0 text-black/50"
                  >
                    <div class="flex w-full gap-2 items-center justify-center">
                      Installed
                    </div>
                  </button>
                  <div class="relative">
                    <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 text-gray-500 dark:text-gray-400" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                    </div>
                    <div class="rounded-md border border-gray-300 px-3 py-2 shadow-sm focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600 dark:bg-gray-700 pl-10">
                      <label for="search" class="block text-xs font-medium text-gray-900 dark:text-gray-100"></label>
                      <div class="relative">
                        <input type="search" name="search" id="plugin-store-search" class="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 outline-none focus:ring-0 dark:bg-gray-700 dark:text-gray-100 sm:text-sm" placeholder="Search plugins" value="">
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  id="plugin-list-wrapper"
                  class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:grid-rows-2 lg:grid-cols-3 xl:grid-cols-4"
                >
                ${renderPluginList(plugins)}
                </div>
                <div
                  class="flex flex-col flex-wrap items-center justify-center gap-6 sm:flex-row md:justify-between"
                >
                <div class="flex flex-1 justify-start max-lg:justify-center">
                  <div id="plugin-store-pagination-wrapper" class="flex flex-wrap gap-2 text-sm text-black/60 dark:text-white/70">
                    ${renderPageNumbers(plugins)}
                  </div>
                </div>
                  <!-- div class="flex flex-col items-center gap-2 sm:flex-row">
                    <button
                      id="install-unverified-plugin"
                      class="text-sm text-black/70 dark:text-white/70 whitespace-nowrap hover:text-black/50 dark:hover:text-white/50"
                    >
                      Install an unverified plugin
                    </button>
                    <div
                      class="hidden h-4 border-l border-black/30 dark:border-white/30 sm:block"
                    ></div>
                    <button
                      id="develop-plugin"
                      class="text-sm text-black/70 dark:text-white/70 whitespace-nowrap hover:text-black/50 dark:hover:text-white/50"
                    >
                      Develop your own plugin
                    </button>
                    <div
                      class="hidden h-4 border-l border-black/30 dark:border-white/30 sm:block"
                    ></div>
                    <button
                      id="about-plugins" 
                      class="text-sm text-black/70 dark:text-white/70 whitespace-nowrap hover:text-black/50 dark:hover:text-white/50"
                    >
                      About plugins
                    </button>
                  </div--!>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>`;
}
function renderPluginList(plugins) {
  const pluginListWrapper = document.querySelector('#plugin-list-wrapper');
  if (pluginListWrapper) {
    pluginListWrapper.innerHTML = '';
  }
  return `
  ${plugins.slice((currentPluginStorePage - 1) * 8, currentPluginStorePage * 8).map((plugin) => `<div
    id="${plugin.id}"
    class="flex flex-col gap-4 rounded border border-black/10 bg-white p-6 dark:border-white/20 dark:bg-gray-900"
  >
    <div class="flex gap-4">
      <div class="h-[70px] w-[70px] shrink-0">
        <div class="relative" style="width: 100%; height: 100%;">
          <img
            src="${plugin?.manifest.logo_url}"
            alt="${plugin?.manifest.name_for_human} logo"
            class="h-full w-full bg-white rounded-[5px]"
          />
          <div
            class="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-[5px]"
          ></div>
        </div>
      </div>
      <div
        class="flex min-w-0 flex-col items-start justify-between"
      >
        <div class="max-w-full truncate text-lg leading-6">
        ${plugin.manifest.name_for_human}
        </div>
        <button id="plugin-store-install-button-${plugin.id}" class="btn relative ${plugin.user_settings.is_installed ? 'btn-light' : 'btn-primary'} hover:bg-gray-200">
          <div
            class="flex w-full gap-2 items-center justify-center"
          >
            ${plugin.user_settings.is_installed ? `Uninstall<svg
              stroke="currentColor"
              fill="none"
              stroke-width="2"
              viewBox="0 0 24 24"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-4 w-4"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>` : `Install<svg
                stroke="currentColor"
                fill="none"
                stroke-width="2"
                viewBox="0 0 24 24"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-4 w-4"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
            >
                <polyline points="8 17 12 21 16 17"></polyline>
                <line x1="12" y1="12" x2="12" y2="21"></line>
                <path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"></path>
            </svg>`}
          </div>
        </button>
      </div>
    </div>
    <div
      class="h-[60px] text-sm text-black/70 line-clamp-3 dark:text-white/70"
    >
      ${plugin.manifest.description_for_human}
    </div>
  </div>`).join('')}`;
}
function renderPageNumbers(plugins) {
  const pluginStorePaginationWrapper = document.querySelector('#plugin-store-pagination-wrapper');
  if (pluginStorePaginationWrapper) {
    pluginStorePaginationWrapper.innerHTML = '';
  }
  const pageSize = 8;
  const total = plugins.length;
  const totalPages = Math.ceil(total / pageSize);
  return `<button
      id="plugin-pagination-prev"
      role="button"
      class="text-sm text-black/70 dark:text-white/70 whitespace-nowrap cursor-default flex items-center ${currentPluginStorePage === 1 ? 'opacity-50' : 'hover:text-black/50 dark:hover:text-white/50'}"
    >
      <svg
      stroke="currentColor"
      fill="none"
      stroke-width="2"
      viewBox="0 0 24 24"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="h-4 w-4"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
      >
      <polyline points="15 18 9 12 15 6"></polyline></svg
      >Prev</button
    >
    ${Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => `<button
      id="plugin-page-${page}"
      role="button"
      class="${currentPluginStorePage === page ? 'text-sm whitespace-nowrap flex h-5 w-5 items-center justify-center text-blue-600 hover:text-blue-600 dark:text-blue-600 dark:hover:text-blue-600' : 'text-sm text-black/70 dark:text-white/70 whitespace-nowrap hover:text-black/50 dark:hover:text-white/50 flex h-5 w-5 items-center justify-center'}"
    >
      ${page}</button
    >
    `).join('')}
    <button
      id="plugin-pagination-next"
      role="button"
      class="text-sm text-black/70 dark:text-white/70 whitespace-nowrap flex items-center  ${currentPluginStorePage === totalPages ? 'opacity-50' : 'hover:text-black/50 dark:hover:text-white/50'}"
    >
      Next<svg
      stroke="currentColor"
      fill="none"
      stroke-width="2"
      viewBox="0 0 24 24"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="h-4 w-4"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
      >
      <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </button>`;
}
function addPluginStoreEventListener(plugins) {
  const pluginStoreWrapper = document.getElementById('plugin-store-wrapper');
  pluginStoreWrapper.addEventListener('click', (event) => {
    // if outside plugin-store-dialog close it
    const pluginStoreDialog = document.getElementById('plugin-store-dialog');
    if (pluginStoreDialog && !pluginStoreDialog?.contains(event.target)) {
      currentPluginStorePage = 1;
      pluginStoreWrapper.remove();
    }
  });
  const pluginStoreCloseButton = document.getElementById('plugin-store-close-button');
  pluginStoreCloseButton.addEventListener('click', () => {
    currentPluginStorePage = 1;
    pluginStoreWrapper.remove();
  });
  const pluginSearchInput = document.getElementById('plugin-store-search');
  pluginSearchInput.addEventListener('input', () => {
    chrome.storage.local.get(['allPlugins'], (result) => {
      document.querySelector('[id="plugin-filter-all"]').click();
    });
  });

  const pluginFilterButtons = document.querySelectorAll('[id^="plugin-filter-"]');
  pluginFilterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      chrome.storage.local.get(['allPlugins'], (result) => {
        const { allPlugins } = result;
        const filterType = button.id.split('plugin-filter-')[1];
        currentPluginStorePage = 1;
        const searchValue = pluginSearchInput.value;
        const previousActivePageButton = document.querySelector('[id^="plugin-page-"].text-blue-600');
        if (previousActivePageButton) {
          previousActivePageButton.classList = 'text-sm text-black/70 dark:text-white/70 whitespace-nowrap hover:text-black/50 dark:hover:text-white/50';
        }
        const previousSelectedFilter = document.querySelector('[id^="plugin-filter-"].btn-light');
        previousSelectedFilter.classList = 'btn relative btn-neutral focus:ring-0 text-black/50';
        button.classList = 'btn relative btn-light focus:ring-0 hover:bg-gray-200';

        const pluginListWrapper = document.getElementById('plugin-list-wrapper');
        const pluginStorePaginationWrapper = document.getElementById('plugin-store-pagination-wrapper');
        let filteredPlugins = allPlugins;
        if (filterType === 'popular') {
          filteredPlugins = allPlugins.filter((plugin) => plugin.categories.map((c) => c.id).includes('most_popular'));
          if (searchValue.trim() !== '') {
            filteredPlugins = filteredPlugins.filter((plugin) => `${plugin.manifest.name_for_human} ${plugin.manifest.description_for_human}`.toLowerCase().includes(searchValue.toLowerCase()));
          }
          pluginListWrapper.innerHTML = renderPluginList(filteredPlugins);
          pluginStorePaginationWrapper.innerHTML = renderPageNumbers(filteredPlugins);
          addInstallButtonEventListener(filteredPlugins);
          addPaginationEventListener(filteredPlugins);
        } else if (filterType === 'new') {
          filteredPlugins = allPlugins.filter((plugin) => plugin.categories.map((c) => c.id).includes('newly_added'));
          if (searchValue.trim() !== '') {
            filteredPlugins = filteredPlugins.filter((plugin) => `${plugin.manifest.name_for_human} ${plugin.manifest.description_for_human}`.toLowerCase().includes(searchValue.toLowerCase()));
          }
          pluginListWrapper.innerHTML = renderPluginList(filteredPlugins);
          pluginStorePaginationWrapper.innerHTML = renderPageNumbers(filteredPlugins);
          addInstallButtonEventListener(filteredPlugins);
          addPaginationEventListener(filteredPlugins);
        } else if (filterType === 'installed') {
          chrome.storage.local.get(['installedPlugins'], (res) => {
            const { installedPlugins } = res;
            filteredPlugins = installedPlugins;
            if (searchValue.trim() !== '') {
              filteredPlugins = filteredPlugins.filter((plugin) => `${plugin.manifest.name_for_human} ${plugin.manifest.description_for_human}`.toLowerCase().includes(searchValue.toLowerCase()));
            }
            pluginListWrapper.innerHTML = renderPluginList(filteredPlugins);
            pluginStorePaginationWrapper.innerHTML = renderPageNumbers(filteredPlugins);
            addInstallButtonEventListener(filteredPlugins);
            addPaginationEventListener(filteredPlugins);
          });
        } else {
          if (searchValue.trim() !== '') {
            filteredPlugins = filteredPlugins.filter((plugin) => `${plugin.manifest.name_for_human} ${plugin.manifest.description_for_human}`.toLowerCase().includes(searchValue.toLowerCase()));
          }
          pluginListWrapper.innerHTML = renderPluginList(filteredPlugins);
          pluginStorePaginationWrapper.innerHTML = renderPageNumbers(filteredPlugins);
          addInstallButtonEventListener(filteredPlugins);
          addPaginationEventListener(filteredPlugins);
        }
      });
    });
  });

  addPaginationEventListener(plugins);
  addInstallButtonEventListener(plugins);
}
function addPaginationEventListener(plugins) {
  const pluginPaginationPreviousButton = document.getElementById('plugin-pagination-prev');
  pluginPaginationPreviousButton.addEventListener('click', () => {
    if (currentPluginStorePage > 1) {
      const prevPage = document.querySelector(`[id="plugin-page-${currentPluginStorePage - 1}"]`);
      prevPage.click();
    }
  });
  const pluginPaginationNextButton = document.getElementById('plugin-pagination-next');
  pluginPaginationNextButton.addEventListener('click', () => {
    const pageSize = 8;
    const total = plugins.length;
    const totalPages = Math.ceil(total / pageSize);
    if (currentPluginStorePage < totalPages) {
      const nextPage = document.querySelector(`[id="plugin-page-${currentPluginStorePage + 1}"]`);
      nextPage.click();
    }
  });

  const pluginStorePageNumberButtons = document.querySelectorAll('[id^="plugin-page-"]');
  pluginStorePageNumberButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const pageNumber = parseInt(button.id.split('plugin-page-')[1], 10);
      currentPluginStorePage = pageNumber;
      const previousActiveButton = document.querySelector('[id^="plugin-page-"].text-blue-600');
      previousActiveButton.classList = 'text-sm text-black/70 dark:text-white/70 whitespace-nowrap hover:text-black/50 dark:hover:text-white/50 flex h-5 w-5 items-center justify-center';
      button.classList = 'text-sm whitespace-nowrap flex h-5 w-5 items-center justify-center text-blue-600 hover:text-blue-600 dark:text-blue-600 dark:hover:text-blue-600';
      const pluginListWrapper = document.querySelector('#plugin-list-wrapper');
      // const pluginStorePaginationWrapper = document.querySelector('#plugin-store-pagination-wrapper');
      const pageSize = 8;
      const total = plugins.length;
      const totalPages = Math.ceil(total / pageSize);
      const curPluginPaginationPrevButton = document.getElementById('plugin-pagination-prev');
      const curPluginPaginationNextButton = document.getElementById('plugin-pagination-next');
      if (pageNumber === 1) {
        curPluginPaginationPrevButton.disabled = true;
        curPluginPaginationPrevButton.classList = 'text-sm text-black/70 dark:text-white/70 whitespace-nowrap cursor-default flex items-center opacity-50';
        curPluginPaginationNextButton.disabled = false;
        curPluginPaginationNextButton.classList = 'text-sm text-black/70 dark:text-white/70 whitespace-nowrap flex items-center  hover:text-black/50 dark:hover:text-white/50';
      } else if (pageNumber === totalPages) {
        curPluginPaginationPrevButton.disabled = false;
        curPluginPaginationPrevButton.classList = 'text-sm text-black/70 dark:text-white/70 whitespace-nowrap flex items-center  hover:text-black/50 dark:hover:text-white/50';
        curPluginPaginationNextButton.disabled = true;
        curPluginPaginationNextButton.classList = 'text-sm text-black/70 dark:text-white/70 whitespace-nowrap cursor-default flex items-center opacity-50';
      } else {
        curPluginPaginationPrevButton.disabled = false;
        curPluginPaginationPrevButton.classList = 'text-sm text-black/70 dark:text-white/70 whitespace-nowrap flex items-center  hover:text-black/50 dark:hover:text-white/50';
        curPluginPaginationNextButton.disabled = false;
        curPluginPaginationNextButton.classList = 'text-sm text-black/70 dark:text-white/70 whitespace-nowrap flex items-center  hover:text-black/50 dark:hover:text-white/50';
      }
      if (pluginListWrapper) {
        pluginListWrapper.innerHTML = renderPluginList(plugins);
        addInstallButtonEventListener(plugins);
      }
    });
  });
}

function addInstallButtonEventListener(plugins) {
  const pluginInstallButtons = document.querySelectorAll('[id^="plugin-store-install-button-"]');
  pluginInstallButtons.forEach((button) => {
    const pluginId = button.id.split('plugin-store-install-button-')[1];
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      button.disabled = true;
      if (button.innerText.toLowerCase() === 'install') {
        const plugin = plugins.find((p) => p.id === pluginId);
        if (plugin.oauth_client_id) {
          const url = `${plugin.manifest.auth.client_url}?response_type=code&client_id=${plugin.oauth_client_id}&redirect_uri=https://chat.openai.com/aip/${plugin.id}/oauth/callback&scope=${plugin.manifest.auth.scope}`;
          window.open(url, '_self');
        } else {
          button.classList = 'btn relative btn-light bg-green-100 hover:bg-green-100';
          button.innerHTML = 'Installing <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="animate-spin text-center" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>';

          installPlugin(pluginId).then((res) => {
            chrome.storage.local.get(['allPlugins', 'installedPlugins', 'enabledPluginIds'], (result) => {
              button.disabled = false;
              button.classList = 'btn relative btn-light hover:bg-gray-200';
              button.innerHTML = 'Uninstall <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" > <circle cx="12" cy="12" r="10"></circle> <line x1="15" y1="9" x2="9" y2="15"></line> <line x1="9" y1="9" x2="15" y2="15"></line> </svg>';
              const { allPlugins, installedPlugins, enabledPluginIds } = result;
              const allPluginIndex = allPlugins.findIndex((p) => p.id === pluginId);
              allPlugins[allPluginIndex] = res;
              const newInstalledPlugins = installedPlugins.map((p) => p.id).includes(res.id) ? installedPlugins : [...installedPlugins, res];
              chrome.storage.local.set({ allPlugins, installedPlugins: newInstalledPlugins });
              const idPrefix = 'navbar';
              const pluginsDropdownWrapper = document.getElementById(`plugins-dropdown-wrapper-${idPrefix}`);
              pluginsDropdownWrapper.innerHTML = pluginsDropdown(newInstalledPlugins, enabledPluginIds, idPrefix);
              addPluginsDropdownEventListener(idPrefix);
            });
          });
        }
      } else {
        button.classList = 'btn relative btn-light bg-green-100 hover:bg-green-100';
        button.innerHTML = 'Unnstalling <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="animate-spin text-center" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>';
        uninstallPlugin(pluginId).then((res) => {
          chrome.storage.local.get(['allPlugins', 'installedPlugins', 'enabledPluginIds'], (result) => {
            button.disabled = false;
            button.classList = 'btn relative btn-primary';
            button.innerHTML = 'Install <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" > <polyline points="8 17 12 21 16 17"></polyline> <line x1="12" y1="12" x2="12" y2="21"></line> <path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"></path> </svg>';
            const { allPlugins, installedPlugins, enabledPluginIds } = result;
            const allPluginIndex = allPlugins.findIndex((p) => p.id === pluginId);
            // replace item at index using with res
            allPlugins[allPluginIndex] = res;
            const installedPluginIndex = installedPlugins.findIndex((p) => p.id === pluginId);
            installedPlugins.splice(installedPluginIndex, 1);
            const selectedFilter = document.querySelector('[id^="plugin-filter-"].btn-light');
            const filter = selectedFilter ? selectedFilter.id.split('plugin-filter-')[1] : 'all';
            if (filter === 'installed') {
              document.querySelector(`#${pluginId}`).remove();
              const pluginListWrapper = document.getElementById('plugin-list-wrapper');
              const pluginStorePaginationWrapper = document.getElementById('plugin-store-pagination-wrapper');
              pluginListWrapper.innerHTML = renderPluginList(installedPlugins);
              pluginStorePaginationWrapper.innerHTML = renderPageNumbers(installedPlugins);
              addInstallButtonEventListener(installedPlugins);
              addPaginationEventListener(installedPlugins);
            }

            chrome.storage.local.set({ allPlugins, installedPlugins });
            const idPrefix = 'navbar';
            const pluginsDropdownWrapper = document.getElementById(`plugins-dropdown-wrapper-${idPrefix}`);
            pluginsDropdownWrapper.innerHTML = pluginsDropdown(installedPlugins, enabledPluginIds, idPrefix);
            addPluginsDropdownEventListener(idPrefix);
          });
        });
      }
    });
  });
}
