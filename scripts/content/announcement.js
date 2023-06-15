/* global createModal, getSponsor, settingsModalActions, getLatestAnnouncement, getLatestNewsletter, incrementOpenRate, incrementClickRate */
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
function addSponsorElement(sponsor) {
  getSponsor().then((res) => {
    const { name, image, url } = res;

    const sponsorLink = document.createElement('a');
    sponsorLink.href = url;
    sponsorLink.target = '_blank';
    sponsorLink.rel = 'noopener noreferrer';
    const sponsorImage = document.createElement('img');
    sponsorImage.src = image;
    sponsorImage.alt = name;
    sponsorImage.style = 'border-radius: 3px;margin:0 !important;';
    sponsorLink.appendChild(sponsorImage);
    const sponsorTag = document.createElement('a');
    sponsorTag.href = 'https://www.passionfroot.me/superpower';
    sponsorTag.target = '_blank';
    sponsorTag.rel = 'noopener noreferrer';
    sponsorTag.style = 'background-color:#595959;color:darkgrey;padding:0px 2px;border-radius: 0px 3px 0px 3px;font-size:10px;position:absolute;top:2px;right:2px;';
    sponsorTag.textContent = 'sponsor';
    sponsorTag.addEventListener('mouseover', () => {
      sponsorTag.style.color = 'gold';
    });
    sponsorTag.addEventListener('mouseout', () => {
      sponsorTag.style.color = 'darkgrey';
    });
    sponsor.appendChild(sponsorTag);

    sponsor.appendChild(sponsorLink);
  });
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
  // if release_data is before march 21, 2023, add sponsor
  if (announcement.category === 'newsletter' && new Date(announcement.release_date) < new Date('2023-03-20')) {
    const sponsor = document.createElement('div');
    sponsor.id = 'sponsor';
    sponsor.style = 'border-radius:4px; margin-bottom:0.5rem;border:1px solid #3e3f41;line-height:11px;background-color:#595959;position:relative;margin:16px auto;';
    addSponsorElement(sponsor);
    announcementText.prepend(sponsor);
  }
  content.appendChild(announcementText);
  content.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && e.target.href) {
      incrementClickRate(data.id);
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
        getLatestAnnouncement().then((announcement) => {
          if (announcement && announcement.id && lastSeenAnnouncementId !== announcement.id) {
            createAnnouncementModal(announcement);
            chrome.storage.sync.set({ lastSeenAnnouncementId: announcement.id });
          } else {
            // if no announcement was found, try getting the latest newsletter
            if (res.settings?.hideNewsletter) return;
            getLatestNewsletter().then((newsletter) => {
              if (!newsletter || !newsletter.id) return;
              if (lastSeenNewsletterId !== newsletter.id) {
                createAnnouncementModal(newsletter, email);
                chrome.storage.sync.set({ lastSeenNewsletterId: newsletter.id });
                chrome.storage.local.get(['readNewsletterIds'], (results) => {
                  const readNewsletterIds = results.readNewsletterIds || [];
                  chrome.storage.local.set({ readNewsletterIds: [...readNewsletterIds, newsletter.id] });
                });
                incrementOpenRate(newsletter.id);
              }
            });
          }
        });
      });
    });
  }, 7000);
}
