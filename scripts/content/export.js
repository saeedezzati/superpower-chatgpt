/* global allAsistantChats, getConversation,getConversations, getSelectedConversations, toast, JSZip, saveAs, canSubmitPrompt, resetSelection, getBrowser */
let exportAllCanceled = false;
let exportFailed = false;
let interval;
let timeout;
function getSingelConversation(conversationId, title) {
  getConversation(conversationId).then((conversation) => {
    const conversationTitle = conversation.title.replace(/[^a-zA-Z0-9]/g, '_');
    const createDate = new Date(conversation.create_time * 1000);
    const filePrefix = `${createDate.getHours()}-${createDate.getMinutes()}-${createDate.getSeconds()}`;

    let currentNode = conversation.current_node;
    let messages = [];
    while (currentNode) {
      const { message, parent } = conversation.mapping[currentNode];
      if (message) messages.push(message);
      currentNode = parent;
    }
    // get export mode from settings
    chrome.storage.local.get('settings', ({ settings }) => {
      const { exportMode } = settings;

      if (exportMode === 'assistant') {
        messages = messages.filter((m) => m.role === 'assistant' || m.author?.role === 'assistant');
      }
      if (title.toLowerCase() === 'json') {
        const conversationJson = conversation;
        const element = document.createElement('a');
        element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(JSON.stringify(conversationJson))}`);
        element.setAttribute('download', `${filePrefix}-${conversationTitle}.${fileFormatConverter(title.toLowerCase())}`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        navigator.clipboard.writeText(JSON.stringify(conversationJson));
        toast('Copied to clipboard');
      }
      // download as .txt file
      if (title.toLowerCase() === 'text') {
        const conversationText = messages.reverse().filter((m) => ['user', 'assistant'].includes(m.role) || ['user', 'assistant'].includes(m.author?.role)).map((m) => `${exportMode === 'both' ? `>> ${m.role ? m.role.toUpperCase() : m.author?.role.toUpperCase()}: ` : ''}${m.content.parts.join('\n').replace(/## Instructions[\s\S]*## End Instructions\n\n/, '')}`).join('\n\n');
        const element = document.createElement('a');
        element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(conversationText)}`);
        element.setAttribute('download', `${filePrefix}-${conversationTitle}.${fileFormatConverter(title.toLowerCase())}`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        navigator.clipboard.writeText(conversationText);
        toast('Copied to clipboard');
      }
      // download as .md file
      if (title.toLowerCase() === 'markdown') {
        const conversationMarkdown = messages.reverse().filter((m) => ['user', 'assistant'].includes(m.role) || ['user', 'assistant'].includes(m.author?.role)).map((m) => `${exportMode === 'both' ? `## ${m.role ? m.role.toUpperCase() : m.author?.role.toUpperCase()}\n` : ''}${m.content.parts.join('\n').replace(/## Instructions[\s\S]*## End Instructions\n\n/, '')}`).join('\n\n');
        const element = document.createElement('a');
        element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(conversationMarkdown)}`);
        // add timestamp to conversation title to make file name
        element.setAttribute('download', `${filePrefix}-${conversationTitle}.${fileFormatConverter(title.toLowerCase())}`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        navigator.clipboard.writeText(conversationMarkdown);
        toast('Copied to clipboard');
      }
      // download as .html file
      if (title.toLowerCase() === 'html') {
        if (getBrowser() === 'Firefox') {
          toast('This feature is only available on Chrome browser', 'error');
        } else {
          chrome.runtime.sendMessage({ type: 'readMhtml', title: `${filePrefix}-${conversationTitle}` });
        }
      }
    });
  });
}
function fileFormatConverter(fileFormat) {
  switch (fileFormat) {
    case 'json':
      return 'json';
    case 'text':
      return 'txt';
    case 'markdown':
      return 'md';
    case 'html':
      return 'html';
    default:
      return 'txt';
  }
}

function addExportAsButton(title) {
  const canSubmit = canSubmitPrompt();
  if (!canSubmit) return null;

  const exportAsButton = document.createElement('button');
  // add event listener to darkmode change
  exportAsButton.id = `${title.toLowerCase()}-export-conversation-button`;
  exportAsButton.textContent = title;
  exportAsButton.type = 'button';
  exportAsButton.style = 'width:100px;border:none;';
  exportAsButton.classList.add('btn', 'flex', 'justify-center', 'gap-2', 'btn-neutral', 'border-0', 'md:border');

  exportAsButton.addEventListener('click', () => {
    const { pathname } = new URL(window.location.toString());
    let conversationId = pathname.split('/').pop().replace(/[^a-z0-9-]/gi, '');
    //  if conversation id is not valid uuid v4
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(conversationId)) {
      // happens when auto-sync is off and create a new chat. there is no id in url initially
      getConversations(0, 1).then((conversations) => {
        const lastConversation = conversations.items[0];
        if (lastConversation) {
          conversationId = lastConversation.id;
        }
        getSingelConversation(conversationId, title);
      }, () => {
        toast('Error while getting conversation');
      });
    } else {
      getSingelConversation(conversationId, title);
    }
  });
  return exportAsButton;
}
function addExportButton() {
  const assistantChats = allAsistantChats();
  const main = document.querySelector('main');
  if (!main) return;
  const inputForm = main.querySelector('form');
  if (!inputForm) return;
  const textAreaElement = inputForm.querySelector('textarea');
  if (!textAreaElement) return;
  const canSubmit = canSubmitPrompt();

  const otherExportButton = document.querySelector('#export-button');
  if (otherExportButton) otherExportButton.remove();
  const lastExportButton = document.querySelector('#export-conversation-button');
  if ((!canSubmit || assistantChats.length === 0) && lastExportButton) {
    lastExportButton.remove();
    return;
  }
  if (lastExportButton) return;
  if (!canSubmit) return;
  if (assistantChats.length === 0) return;
  const exportButton = document.createElement('button');
  exportButton.id = 'export-conversation-button';
  exportButton.type = 'button';
  exportButton.textContent = 'Export';
  exportButton.classList.add('btn', 'flex', 'justify-center', 'gap-2', 'btn-neutral', 'border-0', 'md:border');
  exportButton.style = 'position:absolute;right:0px;width:104px;';
  // add icon
  const exportButtonIcon = document.createElement('img');
  exportButtonIcon.style = 'height:20px;';
  exportButtonIcon.src = chrome.runtime.getURL('icons/export.png');
  exportButton.prepend(exportButtonIcon);

  // export menu
  const exportMenu = document.createElement('div');
  exportMenu.style = 'position:absolute;right:0px;bottom:44px;border:1px solid #565869;border-radius:4px;display:none;z-index:200;';
  exportMenu.id = 'export-menu';
  const divider = document.createElement('div');
  divider.style = 'height:1px;background-color:#565869;margin:0px 4px;';

  exportMenu.appendChild(addExportAsButton('Markdown'));
  exportMenu.appendChild(divider);
  exportMenu.appendChild(addExportAsButton('Json'));
  exportMenu.appendChild(divider.cloneNode());
  exportMenu.appendChild(addExportAsButton('Text'));
  // exportMenu.appendChild(divider.cloneNode());
  // exportMenu.appendChild(addExportAsButton('Html'));
  // add exportMenu as sibling of exportButton
  exportButton.appendChild(exportMenu);
  const connector = document.createElement('div');
  connector.style = 'position:absolute;right:-10px;bottom:34px;width:100px;height:12px;display:none;';
  exportButton.appendChild(connector);

  // add hover style to button
  exportButton.addEventListener('mouseover', () => {
    exportMenu.style.display = 'block';
    connector.style.display = 'block';
  });
  exportButton.addEventListener('mouseout', () => {
    // if not focused hide it
    if (document.activeElement !== exportButton) {
      exportMenu.style.display = 'none';
      connector.style.display = 'none';
    }
  });
  // if click outside hide it
  document.addEventListener('click', (e) => {
    if (e.target !== exportButton) {
      exportMenu.style.display = 'none';
      connector.style.display = 'none';
    }
  });

  if (canSubmit) {
    const textAreaElementWrapper = textAreaElement.parentNode;
    const nodeBeforetTextAreaElement = textAreaElementWrapper.previousSibling;
    nodeBeforetTextAreaElement.style.minHeight = '38px';
    nodeBeforetTextAreaElement.appendChild(exportButton);
  }
}

// countDown to use async/await
async function exportCountDownAsync() {
  let count = 2;
  interval = setInterval(() => {
    const progressBarFilename = document.getElementById('export-all-modal-progress-bar-filename');
    if (count <= 0) {
      clearInterval(interval);
      clearTimeout(timeout);
      if (progressBarFilename) {
        progressBarFilename.textContent = '';
      }
      return;
    }
    if (progressBarFilename) {
      progressBarFilename.textContent = `Waiting ${count} seconds to prevent rate limit...`;
    }
    count -= 1;
  }, 1000);
  await new Promise((resolve) => {
    timeout = setTimeout(() => {
      clearInterval(interval);
      clearTimeout(timeout);
      resolve();
    }, 2000);
  });
}

function exportAllConversations(exportFormat) {
  const exportAllModalProgressBarLabel = document.getElementById('export-all-modal-progress-bar-label');
  const exportAllModalProgressBarFill = document.getElementById('export-all-modal-progress-bar-fill');
  const exportAllModalProgressBarFilename = document.getElementById('export-all-modal-progress-bar-filename');
  getSelectedConversations().then((convs) => {
    const zip = new JSZip();
    // fetch every conversation
    const fetchConversation = async (conversationId, exportMode) => {
      if (exportAllCanceled || exportFailed) {
        return;
      }
      await getConversation(conversationId).then((conversation) => {
        const conversationTitle = conversation.title.replace(/[^a-zA-Z0-9]/g, '_');
        let currentNode = conversation.current_node;
        const createDate = new Date(conversation.create_time * 1000);
        //  folderName = conversation.create_time in local time in the format of YYYY-MM-DD
        const folderName = `${createDate.getFullYear()}-${createDate.getMonth() + 1}-${createDate.getDate()}`;
        // create filePrefix  from conversation.create_time in user local time in the format of HH-MM-SS
        const filePrefix = `${createDate.getHours()}-${createDate.getMinutes()}-${createDate.getSeconds()}`;
        // create zip folder with date as name if it doesn't exist
        zip.folder(folderName);
        let messages = [];
        while (currentNode) {
          const { message, parent } = conversation.mapping[currentNode];
          if (message) messages.push(message);
          currentNode = parent;
        }

        if (exportMode === 'assistant') {
          messages = messages.filter((m) => m.role === 'assistant' || m.author?.role === 'assistant');
        }
        // download as .txt file
        if (exportFormat === 'text') {
          const conversationText = messages.reverse().filter((m) => ['user', 'assistant'].includes(m.role) || ['user', 'assistant'].includes(m.author?.role)).map((m) => `${exportMode === 'both' ? `>> ${m.role ? m.role.toUpperCase() : m.author?.role.toUpperCase()}: ` : ''}${m.content?.parts?.join('\n').replace(/## Instructions[\s\S]*## End Instructions\n\n/, '')}`)?.join('\n\n');
          zip.file(`${folderName}/${filePrefix}-${conversationTitle}.${fileFormatConverter(exportFormat)}`, conversationText);
        }
        // download as .json file
        if (exportFormat === 'json') {
          const conversationJson = conversation;
          zip.file(`${folderName}/${filePrefix}-${conversationTitle}.${fileFormatConverter(exportFormat)}`, JSON.stringify(conversationJson));
        }
        // download as .md file
        if (exportFormat === 'markdown') {
          const conversationMarkdown = messages.reverse().filter((m) => ['user', 'assistant'].includes(m.role) || ['user', 'assistant'].includes(m.author?.role)).map((m) => `${exportMode === 'both' ? `## ${m.role ? m.role.toUpperCase() : m.author?.role.toUpperCase()}\n` : ''}${m.content?.parts?.join('\n').replace(/## Instructions[\s\S]*## End Instructions\n\n/, '')}`)?.join('\n\n');
          zip.file(`${folderName}/${filePrefix}-${conversationTitle}.${fileFormatConverter(exportFormat)}`, conversationMarkdown);
        }

        // update exportAllModalProgressBar.style
        const fileCount = Object.values(zip.files).filter((f) => !f.dir).length;
        const percentage = Math.round((fileCount / convs.length) * 100);
        exportAllModalProgressBarLabel.textContent = `${fileCount} / ${convs.length}`;
        exportAllModalProgressBarFill.style.width = `${percentage}%`;
        exportAllModalProgressBarFilename.textContent = `${conversationTitle}.${fileFormatConverter(exportFormat)}`;
      })
        .catch((_err) => {
          exportAllModalProgressBarFilename.textContent = 'Something went wrong. Please try again in a few minutes.';
          exportAllModalProgressBarFilename.style.color = '#ff4a4a';
          exportFailed = true;
        });
    };

    const fetchAllConversationsAsync = async (conversations, exportMode) => {
      for (let i = 0; i < conversations.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await fetchConversation(conversations[i].id, exportMode, i);
        const fileCount = Object.values(zip.files).filter((f) => !f.dir).length;
        if (fileCount > 0 && fileCount % 1 === 0) {
          // eslint-disable-next-line no-await-in-loop
          await chrome.storage.local.get(['conversations', 'conversationsAreSynced', 'settings']).then(async (res) => {
            const { conversationsAreSynced, settings } = res;
            const { autoSync } = settings;
            if (!conversationsAreSynced || !autoSync) {
              await exportCountDownAsync();
            }
          });
        }
      }
    };
    chrome.storage.local.get('settings', ({ settings }) => {
      const { exportMode } = settings;
      fetchAllConversationsAsync(convs, exportMode).then(() => {
        if (exportAllCanceled) {
          exportAllCanceled = false;
          return;
        }
        clearInterval(interval);
        clearTimeout(timeout);
        zip.generateAsync({ type: 'blob', compression: 'DEFLATE' }).then((content) => {
          saveAs(content, `${new Date().toISOString().slice(0, 10)}-conversations.zip`);
          if (!exportFailed) {
            const exportAllModal = document.getElementById('export-all-modal');
            const exportAllButton = document.querySelector('#export-all-button');
            exportAllButton.innerHTML = exportAllButton.innerHTML.replace(`Export ${convs.length} Selected`, 'Export All');
            resetSelection();
            setTimeout(() => {
              exportAllModal.remove();
            }, 500);
          }
        });
      });
    });
  }, () => {
  });
}

function openExportAllModal() {
  const exportAllModal = document.createElement('div');
  exportAllModal.style = 'position:fixed;top:0px;left:0px;width:100%;height:100%;background-color:rgba(0,0,0,0.5);z-index:1000;display:flex;align-items:center;justify-content:center;color:lightslategray;';
  exportAllModal.id = 'export-all-modal';
  exportAllModal.addEventListener('click', (e) => {
    if (e.target.id === 'export-all-modal') {
      exportAllModal.remove();
    }
  });
  const exportAllModalContent = document.createElement('div');
  exportAllModalContent.style = 'width:400px;min-height:300px;background-color:#0b0d0e;border-radius:4px;padding:16px;display:flex;flex-direction:column;align-items:flex-start;justify-content:start;';
  exportAllModal.appendChild(exportAllModalContent);
  const exportAllModalTitle = document.createElement('div');
  exportAllModalTitle.style = 'font-size:1.25rem;font-weight:500;';
  chrome.storage.local.get(['selectedConversations'], (result) => {
    const { selectedConversations } = result;
    if (!selectedConversations || selectedConversations.length === 0) {
      exportAllModalTitle.textContent = 'Export All';
    } else {
      exportAllModalTitle.textContent = `Export ${selectedConversations.length} Selected`;
    }
  });
  exportAllModalContent.appendChild(exportAllModalTitle);
  // const exportAllModalDescription = document.createElement('div');
  // exportAllModalDescription.style = 'font-size:0.875rem;color:#565869;';
  // exportAllModalDescription.textContent = 'This can take a few seconds.';
  // exportAllModalContent.appendChild(exportAllModalDescription);

  // 3 radio buttons in a row for export format: input/label, input/label, input/label
  const exportAllModalFormatTitle = document.createElement('div');
  exportAllModalFormatTitle.style = 'font-size:0.875rem;font-weight:500;margin-top:32px;';
  exportAllModalFormatTitle.textContent = 'In what format do you want to export?';
  exportAllModalContent.appendChild(exportAllModalFormatTitle);
  const exportAllModalRadioButtonsWrapper = document.createElement('div');
  exportAllModalRadioButtonsWrapper.style = 'display:flex;align-items:center;justify-content:space-between;width:100%;margin-top:8px;';
  exportAllModalContent.appendChild(exportAllModalRadioButtonsWrapper);
  const exportAllModalRadioButtons = [
    {
      id: 'export-all-modal-radio-button-markdown',
      name: 'export-all-modal-radio-button',
      value: 'markdown',
      label: 'Markdown',
    },
    {
      id: 'export-all-modal-radio-button-json',
      name: 'export-all-modal-radio-button',
      value: 'json',
      label: 'Json',
    },
    {
      id: 'export-all-modal-radio-button-text',
      name: 'export-all-modal-radio-button',
      value: 'text',
      label: 'Text',
    },
  ];
  let exportFormat = 'markdown';
  // onchange event listener for radio buttons
  const exportAllModalRadioButtonsOnChange = (e) => {
    const { value } = e.target;
    exportFormat = value;
  };
  exportAllModalRadioButtons.forEach((radioButton) => {
    const exportAllModalRadioButtonWrapper = document.createElement('div');
    exportAllModalRadioButtonWrapper.style = 'display:flex;align-items:center;justify-content:center;';
    exportAllModalRadioButtonsWrapper.appendChild(exportAllModalRadioButtonWrapper);
    const exportAllModalRadioButton = document.createElement('input');
    exportAllModalRadioButton.type = 'radio';
    exportAllModalRadioButton.id = radioButton.id;
    exportAllModalRadioButton.name = radioButton.name;
    exportAllModalRadioButton.value = radioButton.value;
    exportAllModalRadioButton.checked = radioButton.value === 'markdown';
    exportAllModalRadioButton.addEventListener('change', exportAllModalRadioButtonsOnChange);
    exportAllModalRadioButtonWrapper.appendChild(exportAllModalRadioButton);
    const exportAllModalRadioButtonLabel = document.createElement('label');
    exportAllModalRadioButtonLabel.htmlFor = radioButton.id;
    exportAllModalRadioButtonLabel.style = 'font-size:0.875rem;margin-left:8px;';
    exportAllModalRadioButtonLabel.textContent = radioButton.label;

    exportAllModalRadioButtonWrapper.appendChild(exportAllModalRadioButtonLabel);
  });

  // progress bar label
  const exportAllModalProgressBarLabel = document.createElement('div');
  exportAllModalProgressBarLabel.id = 'export-all-modal-progress-bar-label';
  exportAllModalProgressBarLabel.style = 'font-size:0.875rem;margin:32px auto 8px;';
  exportAllModalProgressBarLabel.textContent = '0 / --';

  exportAllModalContent.appendChild(exportAllModalProgressBarLabel);
  // progress bar
  const exportAllModalProgressBar = document.createElement('div');
  exportAllModalProgressBar.id = 'export-all-modal-progress-bar';
  exportAllModalProgressBar.style = 'position:relative;width:100%;height:12px;min-height:12px;background-color:#565869;border-radius:4px;overflow:hidden;';
  exportAllModalContent.appendChild(exportAllModalProgressBar);

  const exportAllModalProgressBarFill = document.createElement('div');
  exportAllModalProgressBarFill.id = 'export-all-modal-progress-bar-fill';
  exportAllModalProgressBarFill.style = 'position:absolute;top:0px;left:0px;width:0%;height:12px;min-height:12px;background-color:gold;border-radius:4px;';
  exportAllModalProgressBar.appendChild(exportAllModalProgressBarFill);
  // progress bar filename
  const exportAllModalProgressBarFilename = document.createElement('div');
  exportAllModalProgressBarFilename.id = 'export-all-modal-progress-bar-filename';
  exportAllModalProgressBarFilename.style = 'font-size:0.875rem;margin:8px auto 32px;';
  exportAllModalProgressBarFilename.textContent = ' ';
  exportAllModalContent.appendChild(exportAllModalProgressBarFilename);

  // modal action wrapper
  const exportAllModalActionWrapper = document.createElement('div');
  exportAllModalActionWrapper.style = 'display:flex;align-items:center;justify-content:space-between;width:100%;margin-top:auto;';
  exportAllModalContent.appendChild(exportAllModalActionWrapper);

  // cancel button
  const exportAllModalCancelButton = document.createElement('button');
  exportAllModalCancelButton.style = 'width:100%;height:40px;border-radius:4px;border:1px solid #565869;background-color:#40414f;color:white;font-size:0.875rem;margin-top:auto; margin-right: 8px;';
  exportAllModalCancelButton.textContent = 'Cancel';
  exportAllModalCancelButton.addEventListener('click', () => {
    exportAllCanceled = true;
    // Get a reference to the last interval + 1
    const intervalId = setInterval(() => { }, Number.MAX_SAFE_INTEGER);
    // Clear any timeout/interval up to that id
    for (let i = 1; i < intervalId; i += 1) {
      clearInterval(i);
    }
    clearTimeout(timeout);

    exportAllModal.remove();
  });
  exportAllModalActionWrapper.appendChild(exportAllModalCancelButton);
  // export button
  const exportAllModalExportButton = document.createElement('button');
  exportAllModalExportButton.style = 'width:100%;height:40px;border-radius:4px;border:1px solid #565869;background-color:#40414f;color:white;font-size:0.875rem;margin-top:auto; margin-left: 8px;opacity:0.5;';
  exportAllModalExportButton.textContent = 'Export';
  exportAllModalExportButton.disabled = true;
  exportAllModalExportButton.addEventListener('click', () => {
    exportAllCanceled = false;
    exportFailed = false;
    exportAllModalExportButton.disabled = true;
    exportAllModalExportButton.textContent = 'Exporting...';
    exportAllModalExportButton.style.opacity = '0.5';
    const formatRadioButtons = document.querySelectorAll('input[name="export-all-modal-radio-button"]');
    formatRadioButtons.forEach((radioButton) => {
      radioButton.disabled = true;
    });
    exportAllConversations(exportFormat);
  });
  exportAllModalActionWrapper.appendChild(exportAllModalExportButton);

  chrome.storage.local.get(['selectedConversations'], (result) => {
    const { selectedConversations } = result;
    if (selectedConversations?.length > 0) {
      exportAllModalExportButton.disabled = false;
      exportAllModalExportButton.style.opacity = '1';
      exportAllModalProgressBarLabel.textContent = `0 / ${selectedConversations?.length}`;
    } else {
      chrome.storage.local.get(['conversations', 'conversationsAreSynced', 'settings']).then((res) => {
        const { conversations: storageConversations, conversationsAreSynced, settings } = res;
        const { autoSync } = settings;
        if (conversationsAreSynced && autoSync) {
          const allConversations = Object.values(storageConversations).filter((conversation) => !conversation.skipped);

          exportAllModalProgressBarLabel.textContent = `0 / ${allConversations.length}`;
          exportAllModalExportButton.disabled = allConversations.length === 0;
          exportAllModalExportButton.style.opacity = allConversations.length === 0 ? '0.5' : '1';
        } else {
          getConversations(0, 1).then((conversations) => {
            const { total } = conversations;
            exportAllModalProgressBarLabel.textContent = `0 / ${total}`;
            exportAllModalExportButton.disabled = total === 0;
            exportAllModalExportButton.style.opacity = total === 0 ? '0.5' : '1';
          }, () => {
            exportAllModalProgressBarLabel.textContent = '0 / --';
          });
        }
      });
    }
  });
  document.body.appendChild(exportAllModal);
}
function addExportAllButton() {
  const nav = document.querySelector('nav');
  if (!nav) return;

  // check if the export all button is already added
  if (document.querySelector('#export-all-button')) return;
  // create the export all button by copying the nav button
  const exportAllButton = document.createElement('a');
  exportAllButton.classList = 'flex py-3 px-3 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-white cursor-pointer text-sm';
  exportAllButton.id = 'export-all-button';
  chrome.storage.local.get(['selectedConversations'], (result) => {
    const { selectedConversations } = result;
    if (!selectedConversations || selectedConversations.length === 0) {
      exportAllButton.textContent = 'Export All';
    } else {
      exportAllButton.textContent = `Export ${selectedConversations.length} Selected`;
    }
    const exportAllButtonIcon = document.createElement('img');
    exportAllButtonIcon.style = 'width: 16px; height: 16px;';
    exportAllButtonIcon.src = chrome.runtime.getURL('icons/export-all.png');
    exportAllButton.prepend(exportAllButtonIcon);
    exportAllButton.style = `${exportAllButton.style.cssText}; width: 100%;`;
  });
  // Add click event listener to setting button
  exportAllButton.addEventListener('click', () => {
    clearInterval(interval);
    clearTimeout(timeout);
    exportAllCanceled = false;
    exportFailed = false;
    interval = '';
    // open the export all modal
    openExportAllModal();
  });
  // add the export all button immediately after the navgap element
  const userMenu = nav.querySelector('#user-menu');
  userMenu.prepend(exportAllButton);
}

// eslint-disable-next-line no-unused-vars
function initializeExport() {
  const main = document.querySelector('main');
  if (!main) return;
  const inputForm = main.querySelector('form');
  if (!inputForm) return;
  addExportButton();
  const observer = new MutationObserver(() => {
    // const submitButton = inputForm.querySelector('textarea ~ button');
    setTimeout(() => {
      addExportButton();
    }, 100);
  });
  observer.observe(main.parentElement.parentElement, { childList: true, subtree: true });

  addExportAllButton();
  // add event listener to dark mode button
  const darkModeButton = document.querySelector('#dark-mode-button');
  if (darkModeButton) {
    darkModeButton.addEventListener('click', () => {
      const lastExportButton = document.querySelector('#export-conversation-button');
      if (lastExportButton) lastExportButton.remove();
      // since this cause input form dom to change, the export button will be added back by the event listener above
    });
  }
}
