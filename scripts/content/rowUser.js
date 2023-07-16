/* global highlight, languageList,toneList, writingStyleList, escapeHtml */
// eslint-disable-next-line no-unused-vars
function rowUser(conversation, node, childIndex, childCount, name, avatar, customConversationWidth, conversationWidth, searchValue = '') {
  const { pinned, message } = node;
  const { id } = message;

  // remove any text between ## Instructions and ## End Instructions\n\n including the instructions
  const messageContent = message.content.parts.join('\n').replace(/## Instructions[\s\S]*## End Instructions\n\n/, '');
  const highlightedMessageContent = highlight(escapeHtml(messageContent), searchValue);
  const messageText = message.content.parts.join('\n');
  const languageCode = messageText.match(/\(languageCode: (.*)\)/)?.[1];
  const toneCode = messageText.match(/\(toneCode: (.*)\)/)?.[1];
  const writingStyleCode = messageText.match(/\(writingStyleCode: (.*)\)/)?.[1];
  const languageName = languageList.find((lang) => lang.code === languageCode)?.name;
  const toneName = toneList.find((tone) => tone.code === toneCode)?.name;
  const writingStyleName = writingStyleList.find((writingStyle) => writingStyle.code === writingStyleCode)?.name;
  return `<div id="message-wrapper-${id}" data-role="user"
  class="w-full border-b border-black/10 dark:border-gray-900/50 text-gray-800 dark:text-gray-100 group ${pinned ? 'border-l-pinned bg-pinned dark:bg-pinned' : 'dark:bg-gray-800'}">
  <div class="relative text-base gap-4 md:gap-6 m-auto md:max-w-2xl lg:max-w-2xl xl:max-w-3xl p-4 md:py-6 flex lg:px-0" style="${customConversationWidth ? `max-width:${conversationWidth}%` : ''}">
  <button id="message-pin-button-${id}" title="pin/unpin message" class="${pinned ? 'visible' : 'invisible group-hover:visible'}" style="background-color: transparent; border: none; cursor: pointer;min-width: 18px;position: absolute; top: -8px; right: 6px;z-index:0;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="${pinned ? 'gold' : '#aaa'}" d="M48 0H336C362.5 0 384 21.49 384 48V487.7C384 501.1 373.1 512 359.7 512C354.7 512 349.8 510.5 345.7 507.6L192 400L38.28 507.6C34.19 510.5 29.32 512 24.33 512C10.89 512 0 501.1 0 487.7V48C0 21.49 21.49 0 48 0z"/></svg></button>
    <div class="flex flex-col relative items-end">
      <div class="relative flex"><span
          style="box-sizing: border-box; display: inline-block; overflow: hidden; width: initial; height: initial; background: none; opacity: 1; border: 0px; margin: 0px; padding: 0px; position: relative; max-width: 100%;"><span
            style="box-sizing: border-box; display: block; width: initial; height: initial; background: none; opacity: 1; border: 0px; margin: 0px; padding: 0px; max-width: 100%;"><img
              alt="" aria-hidden="true"
              src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2730%27%20height=%2730%27/%3e"
              style="display: block; max-width: 100%; width: initial; height: initial; background: none; opacity: 1; border: 0px; margin: 0px; padding: 0px;"></span><img
            alt=${name}
            src="/_next/image?url=${encodeURIComponent(avatar)}&amp;w=64&amp;q=75"
            decoding="async" data-nimg="intrinsic" class="rounded-sm"
            srcset="/_next/image?url=${encodeURIComponent(avatar)}&amp;w=32&amp;q=75 1x, /_next/image?url=${encodeURIComponent(avatar)}&amp;w=64&amp;q=75 2x"
            style="position: absolute; inset: 0px; box-sizing: border-box; padding: 0px; border: none; margin: auto; display: block; width: 0px; height: 0px; min-width: 100%; max-width: 100%; min-height: 100%; max-height: 100%;"></span>
      </div>
      <div id="thread-buttons-wrapper-${id}" class="text-xs flex items-center justify-center gap-1 invisible absolute left-0 top-2 -ml-4 -translate-x-full ${childCount > 1 ? 'group-hover:visible' : ''}"><button id="thread-prev-button-${id}" class="dark:text-white disabled:text-gray-300 dark:disabled:text-gray-400" ${childIndex === 1 ? 'disabled' : ''}><svg stroke="currentColor" fill="none" stroke-width="1.5" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="15 18 9 12 15 6"></polyline></svg></button><span id="thread-count-wrapper-${id}" class="flex-grow flex-shrink-0">${childIndex} / ${childCount}</span><button id="thread-next-button-${id}" ${childIndex === childCount ? 'disabled' : ''} class="dark:text-white disabled:text-gray-300 dark:disabled:text-gray-400"><svg stroke="currentColor" fill="none" stroke-width="1.5" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="9 18 15 12 9 6"></polyline></svg></button></div>
    </div>
    <div class="relative flex w-[calc(100%-50px)] flex-col gap-1 md:gap-3 lg:w-[calc(100%-115px)]">
      <div class="flex flex-grow flex-col gap-3">
        <div id="message-text-${id}" dir="auto" class="min-h-[20px] flex-col items-start gap-4 whitespace-pre-wrap">${highlightedMessageContent}</div>
      </div>
      <div
        class="text-gray-400 flex self-end lg:self-center justify-center mt-2 gap-3 md:gap-4 lg:gap-1 lg:absolute lg:top-0 lg:translate-x-full lg:right-0 lg:mt-0 lg:pl-2 visible">
        <button
          class="p-1 rounded-md hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 disabled:dark:hover:text-gray-400 md:invisible md:group-hover:visible"
          id="add-to-library-button-${id}"><svg stroke="currentColor" fill="currentColor" stroke-width="2"
            viewBox="0 0 448 512" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"
            height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M432 256C432 269.3 421.3 280 408 280h-160v160c0 13.25-10.75 24.01-24 24.01S200 453.3 200 440v-160h-160c-13.25 0-24-10.74-24-23.99C16 242.8 26.75 232 40 232h160v-160c0-13.25 10.75-23.99 24-23.99S248 58.75 248 72v160h160C421.3 232 432 242.8 432 256z">
            </path>
          </svg></button><button id="edit-button-${id}"
          class="p-1 rounded-md hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 disabled:dark:hover:text-gray-400 md:invisible md:group-hover:visible"><svg
            stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round"
            stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em"
            xmlns="http://www.w3.org/2000/svg">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg></button></div>
      <div class="flex justify-between"></div>
    </div>
    <div class="absolute left-0 flex" style="bottom:-16px;">
      ${languageName ? `<div id="language-code-${id}" title="You changed the response language here. This prompt includes a hidden language instructions" class="h-8 p-2 mr-1 flex items-center justify-center rounded-md border text-sm text-gray-500 dark:text-gray-400 border-gray-500 dark:border-gray-400 bg-white dark:bg-gray-800">Language: ${languageName}</div>` : ''}
      ${toneName ? `<div id="tone-code-${id}" title="You changed the response tone here. This prompt includes a hidden tone instructions" class="h-8 p-2 mr-1 flex items-center justify-center rounded-md border text-sm text-gray-500 dark:text-gray-400 border-gray-500 dark:border-gray-400 bg-white dark:bg-gray-800">Tone: ${toneName}</div>` : ''}
      ${writingStyleName ? `<div id="writing-style-code-${id}" title="You changed the response writing style here. This prompt includes a hidden writing style instructions" class="h-8 p-2 mr-1 flex items-center justify-center rounded-md border text-sm text-gray-500 dark:text-gray-400 border-gray-500 dark:border-gray-400 bg-white dark:bg-gray-800">Writing Style: ${writingStyleName}</div>` : ''}
    </div>
  </div>
</div>
`;
}
