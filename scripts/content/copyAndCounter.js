/* global allAsistantChats, TurndownService, addActionWrapperToResult */
const copyRichText = (element) => {
  let content = element.cloneNode(true);
  // remove all div with id=code-header from content
  const codeHeader = content.querySelectorAll('#code-header');
  codeHeader.forEach((header) => {
    header.remove();
  });
  content = content.innerHTML.trim();
  const clipboardItem = new ClipboardItem({
    'text/html': new Blob(
      [content],
      { type: 'text/html' },
    ),
    'text/plain': new Blob(
      [content],
      { type: 'text/plain' },
    ),
  });
  navigator.clipboard.write([clipboardItem]);
};
// eslint-disable-next-line no-unused-vars
function addCopyButtonToResult(resultElement, index) {
  const lastCopyButton = document.querySelector(`#result-copy-button-${index}`);
  if (lastCopyButton) return;

  const copyHtmlButton = document.createElement('button');
  copyHtmlButton.textContent = 'HTML';
  copyHtmlButton.id = `result-html-copy-button-${index}`;
  copyHtmlButton.style = 'border-radius:4px;border:1px solid lightslategray;padding:4px;width:64px;background-color:#444554;';
  copyHtmlButton.addEventListener('mouseover', () => {
    copyHtmlButton.style = 'border-radius:4px;border:1px solid lightslategray;padding:4px;width:64px;background-color:#3b3b43;color:white;';
  });
  copyHtmlButton.addEventListener('mouseout', () => {
    copyHtmlButton.style = 'border-radius:4px;border:1px solid lightslategray;padding:4px;width:64px;background-color:#3b3b43;';
  });

  const copyMarkdownButton = document.createElement('button');
  copyMarkdownButton.textContent = 'Markdown';
  copyMarkdownButton.id = `result-markdown-copy-button-${index}`;
  copyMarkdownButton.style = 'border-radius:4px;border:1px solid lightslategray;padding:4px;width:64px;background-color:#444554;';
  copyMarkdownButton.addEventListener('mouseover', () => {
    copyMarkdownButton.style = 'border-radius:4px;border:1px solid lightslategray;padding:4px;width:64px;background-color:#3b3b43;color:white;';
  });
  copyMarkdownButton.addEventListener('mouseout', () => {
    copyMarkdownButton.style = 'border-radius:4px;border:1px solid lightslategray;padding:4px;width:64px;background-color:#3b3b43;';
  });

  const copyMenu = document.createElement('div');
  copyMenu.style = 'font-size:10px;position:absolute;right:0;bottom:49px;display:none;width:64px;background-color:#3b3b43;';
  copyMenu.appendChild(copyMarkdownButton);
  copyMenu.appendChild(copyHtmlButton);

  const copyButton = document.createElement('button');
  copyButton.textContent = 'Copy';
  copyButton.id = `result-copy-button-${index}`;
  copyButton.style = 'border-radius:4px;border:1px solid lightslategray;padding:4px;position:absolute;right:0;width:64px;background-color:#444554;';
  // add hover style to button
  copyButton.addEventListener('mouseover', () => {
    copyButton.style = 'border-radius:4px;border:1px solid lightslategray;padding:4px;position:absolute;right:0;width:64px;background-color:#3b3b43;color:white;';
    copyMenu.style = 'font-size:10px;position:absolute;right:0;bottom:49px;width:64px;background-color:#444554;';
  });
  copyButton.addEventListener('mouseout', () => {
    copyButton.style = 'border-radius:4px;border:1px solid lightslategray;padding:4px;position:absolute;right:0;width:64px;background-color:#444554;';
    copyMenu.style = 'font-size:10px;position:absolute;right:0;bottom:49px;display:none;width:64px;background-color:#444554;';
  });
  copyMenu.addEventListener('mouseover', () => {
    copyMenu.style = 'font-size:10px;position:absolute;right:0;bottom:49px;width:64px;background-color:#444554;';
  });
  copyMenu.addEventListener('mouseout', () => {
    copyMenu.style = 'font-size:10px;position:absolute;right:0;bottom:49px;display:none;width:64px;background-color:#444554;';
  });
  copyButton.addEventListener('click', () => {
    chrome.storage.local.get(['settings'], (result) => {
      const { copyMode } = result.settings;
      let resultText = resultElement.innerText;
      if (copyMode) {
        const parentElement = resultElement.closest('div.bg-gray-50.dark\\:bg-\\[\\#444654\\]');
        const previousText = parentElement.previousElementSibling.querySelector('.whitespace-pre-wrap').textContent;
        resultText = `>> USER: ${previousText}\n>> ASSISTANT: ${resultElement.innerText}`;
      }

      navigator.clipboard.writeText(resultText);
      // animate copy button text to copied and back in 3 seconds
      copyButton.textContent = 'Copied!';
      setTimeout(
        () => {
          copyButton.textContent = 'Copy';
        },
        1000,
      );
    });
  });
  copyHtmlButton.addEventListener('click', () => {
    chrome.storage.local.get(['settings'], (result) => {
      const { copyMode } = result.settings;
      const newResultElement = resultElement.cloneNode(true);
      if (copyMode) {
        const parentElement = resultElement.closest('div.bg-gray-50.dark\\:bg-\\[\\#444654\\]');
        const previousText = parentElement.previousElementSibling.querySelector('.whitespace-pre-wrap').textContent;
        newResultElement.innerHTML = `<div>USER:</div><div>${previousText}</div><br><div>ASSISTANT:</div>${newResultElement.innerHTML}`;
      }
      copyRichText(newResultElement);
      // animate copy button text to copied and back in 3 seconds
      copyHtmlButton.textContent = 'Copied!';
      setTimeout(
        () => {
          copyHtmlButton.textContent = 'HTML';
        },
        1000,
      );
    });
  });
  copyMarkdownButton.addEventListener('click', () => {
    chrome.storage.local.get(['settings'], (result) => {
      const { copyMode } = result.settings;
      const turndownService = new TurndownService();
      let markdown = turndownService.turndown(resultElement.innerHTML);

      if (copyMode) {
        const parentElement = resultElement.closest('div.bg-gray-50.dark\\:bg-\\[\\#444654\\]');
        const previousText = parentElement.previousElementSibling.querySelector('.whitespace-pre-wrap').textContent;
        markdown = `##USER:\n${previousText}\n\n##ASSISTANT:\n ${markdown}`;
      }
      navigator.clipboard.writeText(markdown);
      // animate copy markdownButton text to copied and back in 3 seconds
      copyMarkdownButton.textContent = 'Copied!';
      setTimeout(
        () => {
          copyMarkdownButton.textContent = 'Markdown';
        },
        1500,
      );
    });
  });
  const actionWrapper = document.querySelector(`#result-action-wrapper-${index}`);
  actionWrapper.appendChild(copyMenu);
  actionWrapper.appendChild(copyButton);
}
function updateCounterForResult(resultElement, index) {
  chrome.storage.local.get(['settings'], (result) => {
    const { showWordCount } = result.settings;
    if (!showWordCount) return;
    const prevCounter = document.querySelector(`#result-counter-${index}`);
    let prevCounterText = '';
    if (prevCounter) {
      prevCounterText = prevCounter.innerText;
    }
    const resultText = resultElement.innerText;
    const wordCount = resultText.split(/[ /]/).length; // +1 because of the "/" in the counter
    const charCount = resultText.length;
    const counterElement = document.createElement('div');
    counterElement.textContent = `${Math.max(charCount, 0)} chars / ${Math.max(wordCount, 0)} words`;
    if (prevCounterText !== counterElement.textContent) {
      if (prevCounter) {
        prevCounter.remove();
      }
      counterElement.id = `result-counter-${index}`;
      const actionWrapper = document.querySelector(`#result-action-wrapper-${index}`);
      if (!actionWrapper) return;
      actionWrapper.appendChild(counterElement);
    }
  });
}

function updateCounters() {
  const assistantChats = allAsistantChats();
  for (let i = 0; i < assistantChats.length; i += 1) {
    const resultElement = assistantChats[i];
    resultElement.parentElement.classList.add('flex-col');
    addActionWrapperToResult(resultElement, i);
    updateCounterForResult(resultElement, i);
    addCopyButtonToResult(resultElement, i);
  }
}
function updateCounterEventListeners() {
  const assistantChats = allAsistantChats();
  for (let i = 0; i < assistantChats.length; i += 1) {
    const resultElement = assistantChats[i];
    resultElement.parentElement.classList.add('flex-col');
    addActionWrapperToResult(resultElement, i);
    updateCounterForResult(resultElement, i);
    addCopyButtonToResult(resultElement, i);
  }
}
// eslint-disable-next-line no-unused-vars
function initializeCopyAndCounter() {
  const main = document.querySelector('main');
  if (!main) return;
  const contentWrapper = main.querySelector('.flex-1.overflow-hidden');
  const scrollableArea = contentWrapper.firstChild;
  // make scrollableArea scroll behavior smooth
  if (scrollableArea) {
    scrollableArea.style.scrollBehavior = 'smooth';
  }
  // Event listener to body change
  updateCounters();
  const observer = new MutationObserver(() => {
    // Add counter to all results
    updateCounters();
    updateCounterEventListeners();
  });
  observer.observe(main.parentElement.parentElement, {
    childList: true,
    subtree: true,
  });
  if (scrollableArea) {
    scrollableArea.scrollTop = scrollableArea.scrollHeight;
  }
}
