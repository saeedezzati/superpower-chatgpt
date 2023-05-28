/* eslint-disable no-unused-vars */
/* global markdown, katex, texmath, highlight, markdownitSup, deleteShare, share, toast */
let sharingConversationName = '';
let shareConversationAnonymously = true;
const dataIsUpdated = false;
function shareModal(conversation, shareData, name) {
  // const {
  //   share_id,
  //   share_url,
  //   title,
  //   is_public,
  //   is_visible,
  //   is_anonymous,
  //   highlighted_message_id,
  //   current_node_id,
  // } = shareData;
  /* today date in format May 26, 2023 */
  const today = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const date = today.toLocaleDateString('en-US', options);
  shareConversationAnonymously = true;
  sharingConversationName = shareData.title;
  const sortedNodes = [];
  let currentNodeId = conversation.current_node;
  while (currentNodeId) {
    const currentNode = conversation.mapping[currentNodeId];
    const parentId = currentNode.parent;
    const parent = parentId ? conversation.mapping[parentId] : null;
    const siblings = parent ? parent.children : [];

    // eslint-disable-next-line no-loop-func
    const currentNodeIndex = siblings.findIndex((id) => currentNodeId === id);

    const threadIndex = currentNodeIndex === -1 ? siblings.length : currentNodeIndex + 1;
    const threadCount = siblings.length;
    sortedNodes.push({ ...currentNode, threadIndex, threadCount });
    currentNodeId = parentId;
  }
  sortedNodes.reverse();
  const filteredSortedNodes = sortedNodes.filter((n) => n?.message?.author?.role === 'user' || (n?.message?.recipient === 'all' && n?.message?.author?.role === 'assistant'));

  return `<div
  data-state="open"
  class="fixed inset-0 bg-gray-500/90 dark:bg-gray-800/90"
  style="pointer-events: auto;"
>
  <div
    class="grid-cols-[10px_minmax(300px,_100%)_10px] md:grid-cols-[60px_minmax(300px,_100%)_60px] grid h-full w-full grid-rows-[minmax(10px,_1fr)_auto_minmax(10px,_1fr)] md:grid-rows-[minmax(20px,_1fr)_auto_minmax(20px,_1fr)] overflow-y-auto"
  >
    <div
      role="dialog"
      id="share-modal-dialog"
      aria-describedby="radix-:r5u:"
      aria-labelledby="radix-:r5t:"
      data-state="open"
      class="relative col-auto col-start-2 row-auto row-start-2 w-full rounded-lg text-left shadow-xl transition-all left-1/2 -translate-x-1/2 bg-white dark:bg-gray-900 max-w-2xl"
      tabindex="-1"
      style="pointer-events: auto;"
    >
      <div
        class="px-4 pb-4 pt-5 sm:p-6 flex items-center justify-between border-b border-black/10 dark:border-white/10"
      >
        <div class="flex items-center">
          <div class="text-center sm:text-left">
            <h2
              id="radix-:r5t:"
              as="h3"
              class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-200"
            >
              Share Link to Conversation
            </h2>
          </div>
        </div>
        <button id="share-modal-close-button" class="inline-block text-gray-500 hover:text-gray-700">
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
        <div class="w-full">
          <p class="mb-6 text-gray-500">
          ${!shareData.already_exists ? 'Messages you send after creating your link won\'t be shared. Anyone with the URL will be able to view the shared conversation.' : `You have shared this conversation <a
              href="${shareData.share_url}"
              target="_blank"
              rel="noreferrer"
              class="underline"
              >before</a
            >. If you want to update the shared conversation content,
            delete this link and create a new
            shared link.`}
          </p>
        </div>
        <div
          class="w-full mb-4 shadow-[0_2px_12px_0px_rgba(0,0,0,0.08)] dark:bg-gray-800/90 rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden bg-gray-50"
        >
          <div class="flex h-full max-w-full flex-1 flex-col">
            <main
              class="relative h-full w-full transition-width flex flex-col overflow-hidden items-stretch"
            >
              <div class="flex-1 overflow-hidden">
                <div
                  data-radix-aspect-ratio-wrapper=""
                  style="position: relative; width: 100%; padding-bottom: 52.6316%;"
                >
                  <div
                    class="overflow-auto bg-white dark:bg-gray-800"
                    style="position: absolute; inset: 0px;"
                  >
                    <div class="flex flex-col text-sm dark:bg-gray-800">
                    ${generateContent(filteredSortedNodes)}
                    </div >
                  </div >
                </div >
  <div
    class="flex p-4 bg-white dark:bg-gray-800/90 border-t border-gray-100 dark:border-gray-700 rounded-b-lg w-full h-full"
  >
    <div class="flex-1 pr-1">
      <div id="share-modal-name-wrapper"
        class="flex w-full items-center justify-left gap-2 min-h-[1.5rem]"
      >
        ${sharingConversationName}<button id="share-modal-edit-name-button" class="text-gray-500">
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
            <path d="M12 20h9"></path>
            <path
              d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
            ></path>
          </svg>
        </button>
      </div>
      <div class="mt-1 text-gray-500">
      <span id="share-modal-user-name">${shareConversationAnonymously ? '' : `${name}  · `}</span>
      ${date}
      </div>
    </div>
    <div class="flex-none h-full mt-auto mb-auto">
      <button
        id="share-modal-anon-button"
        class="btn relative btn-neutral mb-auto mt-auto"
        type="button"
        aria-haspopup="dialog"
        aria-expanded="false"
        aria-controls="radix-:r5v:"
        data-state="closed"
        title="Share with your name or anonymously"
      >
        <div
          class="flex w-full gap-2 items-center justify-center"
        >
          <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
              <line x1="24" y1="0" x2="0" y2="24"></line>
          </svg>
        </div>
      </button>
      ${shareData.already_exists ? `
      <button
        id="share-modal-delete-button"
        class="btn relative btn-neutral mb-auto mt-auto"
        type="button"
        aria-haspopup="dialog"
        aria-expanded="false"
        aria-controls="radix-:r5v:"
        data-state="closed"
        title="Delete this shared conversation"
      >
        <div
          class="flex w-full gap-2 items-center justify-center"
        >
         <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </div>
      </button>
      ` : ''}
    </div>
  </div>
              </div >
            </main >
          </div >
        </div >
  <div class="flex items-center justify-between">
    <div>
      <a
        href="https://help.openai.com/en/articles/7925741-chatgpt-shared-links-faq"
        class="flex items-center gap-2 text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
        target="_blank"
        rel="noreferrer"
      >More Info<svg
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
          <path
            d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
          ></path>
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line></svg
        ></a>
    </div>
    <div class="text-right">
      <button id="copy-share-link-button" class="btn relative btn-primary" as="button">
        <div class="flex w-full gap-2 items-center justify-center">
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
            <path
              d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
            ></path>
            <path
              d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
            ></path></svg
          ><span id="copy-link-button-text">Copy Link</span>
        </div>
      </button>
    </div>
  </div>
      </div >
    </div >
  </div >
</div >
  `;
}
function addShareModalEventListener(shareData, name) {
  const shareModalWrapper = document.getElementById('share-modal-wrapper');

  shareModalWrapper.addEventListener('click', (event) => {
    // if outside plugin-store-dialog close it
    const shareModalDialog = document.getElementById('share-modal-dialog');
    if (shareModalDialog && !shareModalDialog?.contains(event.target)) {
      shareModalWrapper.remove();
    }
  });
  const shareModalCloseButton = document.getElementById('share-modal-close-button');
  shareModalCloseButton.addEventListener('click', () => {
    shareModalWrapper.remove();
  });

  const shareModalAnonButton = document.getElementById('share-modal-anon-button');
  shareModalAnonButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const shareModalAnonButtonIcon = shareModalAnonButton.querySelector('svg');
    if (shareConversationAnonymously) {
      shareConversationAnonymously = false;
      shareModalAnonButton.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
      const shareModalUserName = document.getElementById('share-modal-user-name');
      shareModalUserName.innerHTML = `${name}  · `;
    } else {
      shareConversationAnonymously = true;
      shareModalAnonButton.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"> <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path> <circle cx="12" cy="7" r="4"></circle> <line x1="24" y1="0" x2="0" y2="24"></line> </svg>';
      const shareModalUserName = document.getElementById('share-modal-user-name');
      shareModalUserName.innerHTML = '';
    }
    const copyLinkButtonText = document.getElementById('copy-link-button-text');
    if (shareData.already_exists && shareData.is_anonymous !== shareConversationAnonymously) {
      copyLinkButtonText.innerText = 'Update and Copy Link';
    } else {
      copyLinkButtonText.innerText = 'Copy Link';
    }
  });

  const shareModalDeleteButton = document.getElementById('share-modal-delete-button');
  if (shareModalDeleteButton) {
    shareModalDeleteButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const shareModalDeleteButtonIcon = shareModalDeleteButton.querySelector('svg');
      // replace delete button with a red check button
      if (!shareModalDeleteButtonIcon.classList.contains('text-red-500')) {
        shareModalDeleteButton.style.borderColor = '#ff4a4a';
        shareModalDeleteButton.style.backgroundColor = '#864e6140';
        shareModalDeleteButton.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="text-red-500 h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        setTimeout(() => {
          shareModalDeleteButton.style = '';
          shareModalDeleteButton.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>';
        }, 3000);
      } else {
        // delete
        deleteShare(shareData.share_id);
        shareModalDeleteButton.style = '';
        shareModalDeleteButton.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>';
        shareModalWrapper.remove();
        toast('Deleted shared conversation!');
      }
    });
  }
  const copyShareLinkButton = document.getElementById('copy-share-link-button');
  copyShareLinkButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    share(shareData.share_id, sharingConversationName, shareData.highlighted_message_id, shareConversationAnonymously).then((res) => {
      navigator.clipboard.writeText(shareData.share_url);
      toast('Copied shared conversation URL to clipboard! ');
      shareModalWrapper.remove();
    });
  });
  addConversationNameEventListener(shareData);
}
function addConversationNameEventListener(shareData) {
  const shareModalNameWrapper = document.getElementById('share-modal-name-wrapper');
  shareModalNameWrapper.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    // get shareModalNameWrapper
    // replace name with input
    const shareModalNameInput = document.createElement('input');
    shareModalNameInput.id = 'share-modal-name-input';
    shareModalNameInput.classList = 'border-none focus:ring-gray-200 dark:focus:ring-gray-600 bg-transparent py-0.5 -my-0.5 pl-1 -ml-1 w-full';
    shareModalNameInput.value = sharingConversationName;
    // replace shareModalNameWrapper with shareModalNameInput
    shareModalNameWrapper.replaceWith(shareModalNameInput);
    shareModalNameInput.focus();
    shareModalNameInput.addEventListener('blur', () => {
      sharingConversationName = shareModalNameInput.value;
      const copyLinkButtonText = document.getElementById('copy-link-button-text');
      if (shareData.already_exists && sharingConversationName !== shareData.title) {
        copyLinkButtonText.innerText = 'Update and Copy Link';
      } else {
        copyLinkButtonText.innerText = 'Copy Link';
      }
      const newShareModalNameWrapper = `<div id="share-modal-name-wrapper"
      class="flex w-full items-center justify-left gap-2 min-h-[1.5rem]"
    >
      ${sharingConversationName}<button id="share-modal-edit-name-button" class="text-gray-500">
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
          <path d="M12 20h9"></path>
          <path
            d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
          ></path>
        </svg>
      </button>
    </div>`;
      // convert html to element
      const newShareModalNameWrapperElement = new DOMParser().parseFromString(newShareModalNameWrapper, 'text/html').body.firstChild;
      // replace shareModalNameInput with shareModalNameWrapper html
      shareModalNameInput.replaceWith(newShareModalNameWrapperElement);
      addConversationNameEventListener(shareData);
    });
    shareModalNameInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        sharingConversationName = shareModalNameInput.value;
        shareModalNameInput.blur();
      }
    });
  });
}
function generateContent(nodes) {
  return nodes.map((node, index) => {
    const { message } = node;
    if (message.author?.role === 'user') {
      return userRow(message);
    }
    return assistantRow(message);
  }).join('');
}

function userRow(message) {
  const messageContent = message.content.parts.join('\n');
  const messageContentPartsHTML = markdown('user')
    .render(messageContent);
  return `<div
  class="group w-full text-gray-800 dark:text-gray-100 dark:bg-gray-800"
>
  <div
    class="flex p-4 gap-4 text-base md:gap-6 md:max-w-2xl lg:max-w-xl xl:max-w-3xl md:py-6 lg:px-0 ml-5"
  >
    <div
      class="flex-shrink-0 flex flex-col relative items-end"
    >
      <div class="w-[30px]">
        <div
          class="relative p-1 rounded-sm h-[30px] w-[30px] text-white flex items-center justify-center"
          style="background-color: rgb(171, 104, 255);"
        >
          <svg
            stroke="currentColor"
            fill="none"
            stroke-width="1.5"
            viewBox="0 0 24 24"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-6 w-6"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
            ></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
      </div>
    </div>
    <div
      class="relative flex w-[calc(100%-50px)] flex-col gap-1 md:gap-3 lg:w-[calc(100%-115px)]"
    >
      <div class="flex flex-grow flex-col gap-3">
        <div
          class="min-h-[20px] flex flex-col items-start gap-4 whitespace-pre-wrap break-words"
        >
          ${messageContentPartsHTML}
        </div>
      </div>
    </div>
  </div>
</div>`;
}
function assistantRow(message) {
  let messageContent = message.content.parts.join('\n');

  // if citations array is not mpty, replace text from start_ix to end_ix position with citation
  if (message.metadata.citations?.length > 0) {
    message.metadata.citations.reverse().forEach((citation, index) => {
      const startIndex = citation.start_ix;
      const endIndex = citation.end_ix;
      const citationMetadata = citation.metadata;
      const { url } = citationMetadata;
      // number 1 with link to  url
      let citationText = `[^1^](${url})`;
      if (endIndex === message.metadata.citations[index - 1]?.start_ix) {
        citationText = '';
      }

      messageContent = messageContent.replace(messageContent.substring(startIndex, endIndex), citationText);
    });
  }
  const messageContentPartsHTML = markdown('assistant')
    .use(markdownitSup)
    .use(texmath, {
      engine: katex,
      delimiters: 'dollars',
      katexOptions: { macros: { '\\RR': '\\mathbb{R}' } },
    }).render(messageContent);
  const avatarColor = (message.metadata.model_slug?.includes('plugins') || message.metadata.model_slug?.startsWith('gpt-4')) ? 'rgb(171, 104, 255)' : 'rgb(25, 195, 125)';

  return `<div
  class="group w-full text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-[#444654]"
>
  <div
    class="flex p-4 gap-4 text-base md:gap-6 md:max-w-2xl lg:max-w-xl xl:max-w-3xl md:py-6 lg:px-0 ml-5"
  >
    <div
      class="flex-shrink-0 flex flex-col relative items-end"
    >
      <div class="w-[30px]">
        <div
          class="relative p-1 rounded-sm h-[30px] w-[30px] text-white flex items-center justify-center"
          style="background-color:${avatarColor}"
        >
          <svg
            width="41"
            height="41"
            viewBox="0 0 41 41"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            stroke-width="1.5"
            class="h-6 w-6"
            role="img"
          >
            <title>ChatGPT</title>
            <text x="-9999" y="-9999">ChatGPT</text>
            <path
              d="M37.5324 16.8707C37.9808 15.5241 38.1363 14.0974 37.9886 12.6859C37.8409 11.2744 37.3934 9.91076 36.676 8.68622C35.6126 6.83404 33.9882 5.3676 32.0373 4.4985C30.0864 3.62941 27.9098 3.40259 25.8215 3.85078C24.8796 2.7893 23.7219 1.94125 22.4257 1.36341C21.1295 0.785575 19.7249 0.491269 18.3058 0.500197C16.1708 0.495044 14.0893 1.16803 12.3614 2.42214C10.6335 3.67624 9.34853 5.44666 8.6917 7.47815C7.30085 7.76286 5.98686 8.3414 4.8377 9.17505C3.68854 10.0087 2.73073 11.0782 2.02839 12.312C0.956464 14.1591 0.498905 16.2988 0.721698 18.4228C0.944492 20.5467 1.83612 22.5449 3.268 24.1293C2.81966 25.4759 2.66413 26.9026 2.81182 28.3141C2.95951 29.7256 3.40701 31.0892 4.12437 32.3138C5.18791 34.1659 6.8123 35.6322 8.76321 36.5013C10.7141 37.3704 12.8907 37.5973 14.9789 37.1492C15.9208 38.2107 17.0786 39.0587 18.3747 39.6366C19.6709 40.2144 21.0755 40.5087 22.4946 40.4998C24.6307 40.5054 26.7133 39.8321 28.4418 38.5772C30.1704 37.3223 31.4556 35.5506 32.1119 33.5179C33.5027 33.2332 34.8167 32.6547 35.9659 31.821C37.115 30.9874 38.0728 29.9178 38.7752 28.684C39.8458 26.8371 40.3023 24.6979 40.0789 22.5748C39.8556 20.4517 38.9639 18.4544 37.5324 16.8707ZM22.4978 37.8849C20.7443 37.8874 19.0459 37.2733 17.6994 36.1501C17.7601 36.117 17.8666 36.0586 17.936 36.0161L25.9004 31.4156C26.1003 31.3019 26.2663 31.137 26.3813 30.9378C26.4964 30.7386 26.5563 30.5124 26.5549 30.2825V19.0542L29.9213 20.998C29.9389 21.0068 29.9541 21.0198 29.9656 21.0359C29.977 21.052 29.9842 21.0707 29.9867 21.0902V30.3889C29.9842 32.375 29.1946 34.2791 27.7909 35.6841C26.3872 37.0892 24.4838 37.8806 22.4978 37.8849ZM6.39227 31.0064C5.51397 29.4888 5.19742 27.7107 5.49804 25.9832C5.55718 26.0187 5.66048 26.0818 5.73461 26.1244L13.699 30.7248C13.8975 30.8408 14.1233 30.902 14.3532 30.902C14.583 30.902 14.8088 30.8408 15.0073 30.7248L24.731 25.1103V28.9979C24.7321 29.0177 24.7283 29.0376 24.7199 29.0556C24.7115 29.0736 24.6988 29.0893 24.6829 29.1012L16.6317 33.7497C14.9096 34.7416 12.8643 35.0097 10.9447 34.4954C9.02506 33.9811 7.38785 32.7263 6.39227 31.0064ZM4.29707 13.6194C5.17156 12.0998 6.55279 10.9364 8.19885 10.3327C8.19885 10.4013 8.19491 10.5228 8.19491 10.6071V19.808C8.19351 20.0378 8.25334 20.2638 8.36823 20.4629C8.48312 20.6619 8.64893 20.8267 8.84863 20.9404L18.5723 26.5542L15.206 28.4979C15.1894 28.5089 15.1703 28.5155 15.1505 28.5173C15.1307 28.5191 15.1107 28.516 15.0924 28.5082L7.04046 23.8557C5.32135 22.8601 4.06716 21.2235 3.55289 19.3046C3.03862 17.3858 3.30624 15.3413 4.29707 13.6194ZM31.955 20.0556L22.2312 14.4411L25.5976 12.4981C25.6142 12.4872 25.6333 12.4805 25.6531 12.4787C25.6729 12.4769 25.6928 12.4801 25.7111 12.4879L33.7631 17.1364C34.9967 17.849 36.0017 18.8982 36.6606 20.1613C37.3194 21.4244 37.6047 22.849 37.4832 24.2684C37.3617 25.6878 36.8382 27.0432 35.9743 28.1759C35.1103 29.3086 33.9415 30.1717 32.6047 30.6641C32.6047 30.5947 32.6047 30.4733 32.6047 30.3889V21.188C32.6066 20.9586 32.5474 20.7328 32.4332 20.5338C32.319 20.3348 32.154 20.1698 31.955 20.0556ZM35.3055 15.0128C35.2464 14.9765 35.1431 14.9142 35.069 14.8717L27.1045 10.2712C26.906 10.1554 26.6803 10.0943 26.4504 10.0943C26.2206 10.0943 25.9948 10.1554 25.7963 10.2712L16.0726 15.8858V11.9982C16.0715 11.9783 16.0753 11.9585 16.0837 11.9405C16.0921 11.9225 16.1048 11.9068 16.1207 11.8949L24.1719 7.25025C25.4053 6.53903 26.8158 6.19376 28.2383 6.25482C29.6608 6.31589 31.0364 6.78077 32.2044 7.59508C33.3723 8.40939 34.2842 9.53945 34.8334 10.8531C35.3826 12.1667 35.5464 13.6095 35.3055 15.0128ZM14.2424 21.9419L10.8752 19.9981C10.8576 19.9893 10.8423 19.9763 10.8309 19.9602C10.8195 19.9441 10.8122 19.9254 10.8098 19.9058V10.6071C10.8107 9.18295 11.2173 7.78848 11.9819 6.58696C12.7466 5.38544 13.8377 4.42659 15.1275 3.82264C16.4173 3.21869 17.8524 2.99464 19.2649 3.1767C20.6775 3.35876 22.0089 3.93941 23.1034 4.85067C23.0427 4.88379 22.937 4.94215 22.8668 4.98473L14.9024 9.58517C14.7025 9.69878 14.5366 9.86356 14.4215 10.0626C14.3065 10.2616 14.2466 10.4877 14.2479 10.7175L14.2424 21.9419ZM16.071 17.9991L20.4018 15.4978L24.7325 17.9975V22.9985L20.4018 25.4983L16.071 22.9985V17.9991Z"
              fill="currentColor"
            ></path>
          </svg>
        </div>
      </div>
    </div>
    <div
      class="relative flex w-[calc(100%-50px)] flex-col gap-1 md:gap-3 lg:w-[calc(100%-115px)]"
    >
      <div class="flex flex-grow flex-col gap-3">
        <div
          class="min-h-[20px] flex flex-col items-start gap-4 whitespace-pre-wra break-words"
        >
          <div
            class="markdown prose w-full break-words dark:prose-invert dark"
          >
            ${messageContentPartsHTML}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`;
}
