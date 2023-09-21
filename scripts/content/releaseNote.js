/* global createModal, settingsModalActions */

function createReleaseNoteModal(version) {
  const bodyContent = releaseNoteModalContent(version);
  const actionsBarContent = releaseNoteModalActions();
  createModal(`Release note (v ${version})`, 'You can see the latest changes here', bodyContent, actionsBarContent, true);
}

function releaseNoteModalContent(version) {
  // create releaseNote modal content
  const content = document.createElement('div');
  content.id = `modal-content-release-note-(v-${version})`;
  content.style = 'position: relative;height:100%;';
  content.classList = 'markdown prose-invert';
  const base = document.createElement('base');
  base.target = '_blank';
  content.appendChild(base);
  const logoWatermark = document.createElement('img');
  logoWatermark.src = chrome.runtime.getURL('icons/logo.png');
  logoWatermark.style = 'position: fixed; top: 50%; right: 50%; width: 400px; height: 400px; opacity: 0.07; transform: translate(50%, -50%);box-shadow:none !important;';
  content.appendChild(logoWatermark);
  const releaseNoteText = document.createElement('article');
  releaseNoteText.style = 'display: flex; flex-direction: column; justify-content: start; align-items: start;height: 100%; width: 100%; white-space: break-spaces; overflow-wrap: break-word;padding:16px;position: relative;z-index:10;color: #fff;';
  chrome.runtime.sendMessage({
    getReleaseNote: true,
    detail: {
      version,
    },
  }, (data) => {
    const releaseNote = data;
    releaseNoteText.innerHTML = `<div style="font-size:1em;">Release date: ${new Date(data.created_at).toDateString()} (<span id="previous-version" data-version="${data.previous_version}" style="color:gold;cursor:pointer;">Previous release note</span>)</div>${releaseNote.text}`;
    setTimeout(() => {
      const previousVersion = document.getElementById('previous-version');
      if (previousVersion) {
        previousVersion.addEventListener('click', () => {
          // cose current modal
          document.querySelector(`button[id="modal-close-button-release-note-(v-${version})"]`).click();
          createReleaseNoteModal(previousVersion.dataset.version);
        });
      }
    }, 1000);
  });
  content.appendChild(releaseNoteText);
  return content;
}

function releaseNoteModalActions() {
  // add actionbar at the bottom of the content
  const actionBar = document.createElement('div');
  actionBar.style = 'display: flex; flex-wrap:wrap;justify-content: space-between; align-items: center;width: 100%; font-size: 12px;';
  actionBar.appendChild(settingsModalActions());
  return actionBar;
}
// eslint-disable-next-line no-unused-vars
function initializeReleaseNote() {
  setTimeout(() => {
    // get current app version
    const { version } = chrome.runtime.getManifest();
    // get lastSeenReleaseNoteVersion from storage
    chrome.storage.sync.get(['lastSeenReleaseNoteVersion'], (result) => {
      const { lastSeenReleaseNoteVersion } = result;
      // if lastSeenReleaseNoteVersion is not equal to current app version
      if (lastSeenReleaseNoteVersion !== version) {
        // create releaseNote modal
        createReleaseNoteModal(version);
        // update lastSeenReleaseNoteVersion in storage
        chrome.storage.sync.set({ lastSeenReleaseNoteVersion: version }, () => {
          // const previousVersion = document.getElementById('previous-version');
          // if (previousVersion) {
          //   previousVersion.addEventListener('click', () => {
          //     // cose current modal
          //     document.querySelector(`button[id="modal-close-button-release-note-(v-${version})"]`).click();
          //     createReleaseNoteModal(previousVersion.dataset.version);
          //   });
          // }
        });
      }
    });
  }, 3000);
}
