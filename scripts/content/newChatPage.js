/* global createSwitch */
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

  // const systemMessageWrapper = document.createElement('div');
  // systemMessageWrapper.classList = 'w-full flex flex-col items-start justify-center border border-gray-500 rounded-md p-4';
  // content.appendChild(systemMessageWrapper);

  // const systemMessageLabel = document.createElement('div');
  // systemMessageLabel.classList = 'text-gray-500 text-sm font-semibold';
  // systemMessageLabel.textContent = 'System Message';
  // systemMessageWrapper.appendChild(systemMessageLabel);

  // const systemMessageInput = document.createElement('textarea');
  // systemMessageInput.classList = 'w-full h-32 border-0 rounded-md p-2 mt-2 bg-gray-700 focus:ring-0 focus-visible:ring-0 resize-none';
  // systemMessageInput.placeholder = 'Enter your system message here';
  // systemMessageWrapper.appendChild(systemMessageInput);

  const settings = document.createElement('div');
  settings.classList = 'flex flex-col items-start justify-center border border-gray-500 rounded-md p-4';
  settings.style = 'width: 400px;';
  content.appendChild(settings);

  const saveHistorySwitch = createSwitch('Chat History & Training', `<div class="text-left">Save new chats to your history and allow them to be used to
  improve ChatGPT via model training. Unsaved chats will be
  deleted from our systems within 30 days. <a href="https://help.openai.com/en/articles/7730893 " target="_blank" class="underline" rel="noreferrer">Learn more</a></div>`, 'saveHistory', true);
  settings.appendChild(saveHistorySwitch);

  const bottom = document.createElement('div');
  bottom.classList = 'w-full h-32 md:h-48 flex-shrink-0';
  innerDiv.appendChild(bottom);

  return outerDiv;
}
