/* global createModal, settingsModalActions */
const titleMap = {
  general: 'Announcement',
  newsletter: 'Newsletter',
};
const subtitleMap = {
  general: 'You can see the latest announcement here',
  newsletter: 'Daily dose of AI news and resources from the community',
};
function createAnnouncementModal(data, email = '') {
  const bodyContent = announcementModalContent(data, email);
  const actionsBarContent = announcementModalActions(data);
  const title = titleMap[data.category];
  const subtitle = subtitleMap[data.category];
  const releaseDate = new Date(data.release_date);
  createModal(title, `${subtitle} (${(new Date(releaseDate.getTime() + (releaseDate.getTimezoneOffset() * 60000))).toDateString()})`, bodyContent, actionsBarContent, true);
}

function announcementModalContent(data, email = '') {
  // create announcement modal content
  const content = document.createElement('div');
  content.id = `modal-content-${data.category}`;
  content.tabIndex = 0;
  content.style = 'position: relative;height:100%;';
  content.classList = 'markdown prose-invert';

  const base = document.createElement('base');
  base.target = '_blank';
  content.appendChild(base);
  const logoWatermark = document.createElement('img');
  logoWatermark.src = chrome.runtime.getURL('icons/logo.png');
  logoWatermark.style = 'position: fixed; top: 50%; right: 50%; width: 400px; height: 400px; opacity: 0.07; transform: translate(50%, -50%);box-shadow:none !important;';
  content.appendChild(logoWatermark);
  const announcementText = document.createElement('article');
  announcementText.style = 'display: flex; flex-direction: column; justify-content: start; align-items: start; min-height: 100%; width: 100%; white-space: break-spaces; overflow-wrap: break-word;padding:16px;position: relative;z-index:10;color: #fff;';
  const announcement = data;
  // add ?ref=superpower-chatgpt-chrome-extension to the end of all href links
  const updatedTextWithRef = announcement.text.replace(/href="([^"]*)"/g, 'href="$1?ref=superpower-chatgpt-extension"').replace(/\{\{email\}\}/g, email);
  announcementText.innerHTML = announcement.category === 'newsletter' ? updatedTextWithRef : `<h1 style="margin-bottom: 24px; ">${announcement.title}</h1>${announcement.text}`;
  content.appendChild(announcementText);
  content.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && e.target.href) {
      chrome.runtime.sendMessage({
        incrementClickRate: true,
        detail: {
          newsletterId: data.id,
        },
      });
    }
  });

  return content;
}

function announcementModalActions(data) {
  // add actionbar at the bottom of the content
  const actionBar = document.createElement('div');
  actionBar.style = 'display: flex; flex-wrap:wrap;justify-content: space-between; align-items: center;width: 100%; font-size: 12px;';
  actionBar.appendChild(settingsModalActions());

  if (data.category === 'newsletter') {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'hide-newsletter-checkbox';
    checkbox.style = 'margin-right: 8px; width:12px; height:12px;';
    chrome.storage.local.get(['settings'], (result) => {
      checkbox.checked = result.settings?.hideNewsletter || false;
    });

    checkbox.addEventListener('change', (e) => {
      chrome.storage.local.get(['settings'], (result) => {
        chrome.storage.local.set({ settings: { ...result.settings, hideNewsletter: e.target.checked } });
      });
    });
    const checkboxLabel = document.createElement('label');
    checkboxLabel.htmlFor = 'hide-newsletter-checkbox';
    checkboxLabel.textContent = 'Don’t show me this newsletter again';
    checkboxLabel.style = 'color: lightslategray;';

    const checkBoxWrapper = document.createElement('div');
    checkBoxWrapper.style = 'display: flex; justify-content: flex-start; align-items: center; margin-left:48px;min-width:220px;';
    checkBoxWrapper.appendChild(checkbox);
    checkBoxWrapper.appendChild(checkboxLabel);
    actionBar.appendChild(checkBoxWrapper);
  }
  return actionBar;
}
// eslint-disable-next-line no-unused-vars
function initializeAnnouncement() {
  setTimeout(() => {
    chrome.storage.sync.get(['lastSeenAnnouncementId', 'lastSeenNewsletterId', 'email'], (result) => {
      chrome.storage.local.get(['settings'], (res) => {
        const { lastSeenAnnouncementId, lastSeenNewsletterId, email } = result;
        // try getting latest announcement first
        chrome.runtime.sendMessage({
          getLatestAnnouncement: true,
        }, (announcement) => {
          if (announcement && announcement.id && lastSeenAnnouncementId !== announcement.id) {
            createAnnouncementModal(announcement);
            chrome.storage.sync.set({ lastSeenAnnouncementId: announcement.id });
          } else {
            // if no announcement was found, try getting the latest newsletter
            if (res.settings?.hideNewsletter) return;
            chrome.runtime.sendMessage({
              getLatestNewsletter: true,
            }, (newsletter) => {
              if (!newsletter || !newsletter.id) return;
              if (lastSeenNewsletterId !== newsletter.id) {
                createAnnouncementModal(newsletter, email);
                chrome.storage.sync.set({ lastSeenNewsletterId: newsletter.id });
                chrome.storage.local.get(['readNewsletterIds'], (results) => {
                  const readNewsletterIds = results.readNewsletterIds || [];
                  chrome.storage.local.set({ readNewsletterIds: [...readNewsletterIds, newsletter.id] });
                });
                chrome.runtime.sendMessage({
                  incrementOpenRate: true,
                  detail: {
                    newsletterId: newsletter.id,
                  },
                });
              }
            });
          }
        });
      });
    });
  }, 7000);
}
