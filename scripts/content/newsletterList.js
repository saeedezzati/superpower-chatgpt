/* global createModal, settingsModalActions, createAnnouncementModal */

// eslint-disable-next-line no-unused-vars
function createNewsletterListModal(version) {
  const bodyContent = newsletterListModalContent(version);
  const actionsBarContent = newsletterListModalActions();
  createModal('Newsletter Archive', 'You can find all of our previous newsletters here (<a href="https://superpowerdaily.com" target="_blank" rel="noopener noreferrer" style="color:gold;">Read Online</a>)', bodyContent, actionsBarContent);
}

function newsletterListModalContent() {
  // create newsletterList modal content
  const content = document.createElement('div');
  content.id = 'modal-content-newsletter-list';
  content.style = 'overflow-y: hidden;position: relative;height:100%; width:100%';
  content.classList = 'markdown prose-invert';
  const logoWatermark = document.createElement('img');
  logoWatermark.src = chrome.runtime.getURL('icons/logo.png');
  logoWatermark.style = 'position: fixed; top: 50%; right: 50%; width: 400px; height: 400px; opacity: 0.07; transform: translate(50%, -50%);box-shadow:none !important;';
  content.appendChild(logoWatermark);
  const newsletterListText = document.createElement('article');
  newsletterListText.style = 'display: flex; flex-direction: column; justify-content: start; align-items: start;overflow-y: scroll; height: 100%; width: 100%; white-space: break-spaces; overflow-wrap: break-word;padding: 16px;position: relative;z-index:10;color: #fff;';
  chrome.runtime.sendMessage({
    getNewsletters: true,
  }, (newsletterList) => {
    if (newsletterList.length === 0) {
      newsletterListText.innerHTML = '<div style="font-size:1em;">Coming soon!</div>';
    }
    chrome.storage.local.get(['readNewsletterIds'], (result) => {
      const readNewsletterIds = result.readNewsletterIds || [];
      for (let i = 0; i < newsletterList.length; i += 1) {
        const newsletter = newsletterList[i];
        const releaseDate = new Date(newsletter.release_date);
        const releaseDateWithOffset = new Date(releaseDate.getTime() + (releaseDate.getTimezoneOffset() * 60000));
        const newsletterLine = document.createElement('div');
        newsletterLine.style = `font-size:1em;display:flex;margin:8px 0;align-items:flex-start; ${readNewsletterIds.includes(newsletter.id) ? 'opacity:0.5;' : ''}`;
        const newsletterDate = document.createElement('div');
        newsletterDate.style = 'border: solid 1px gold;border-radius:4px;padding:4px;color:gold;cursor:pointer;margin-right:8px;min-width:144px; text-align:center;';
        newsletterDate.textContent = releaseDateWithOffset.toDateString();
        newsletterDate.addEventListener('click', () => {
          chrome.runtime.sendMessage({
            getNewsletter: true,
            detail: {
              id: newsletter.id,
            },
          }, (newsletterData) => {
            createAnnouncementModal(newsletterData);
            chrome.storage.local.get(['readNewsletterIds'], (res) => {
              const oldReadNewsletterIds = res.readNewsletterIds || [];
              if (!oldReadNewsletterIds.includes(newsletter.id)) {
                chrome.runtime.sendMessage({
                  incrementOpenRate: true,
                  detail: {
                    newsletterId: newsletter.id,
                  },
                });
              }
              chrome.storage.local.set({ readNewsletterIds: [...oldReadNewsletterIds, newsletter.id] }, () => {
                newsletterLine.style = 'font-size:1em;display:flex;margin:8px 0;align-items:flex-start; opacity:0.5;';
              });
            });
          });
        });
        const newsletterTitle = document.createElement('div');
        newsletterTitle.style = 'align-self:center;';
        newsletterTitle.textContent = newsletter.title;
        newsletterLine.appendChild(newsletterDate);
        newsletterLine.appendChild(newsletterTitle);
        newsletterListText.appendChild(newsletterLine);
      }
    });
  });
  content.appendChild(newsletterListText);
  return content;
}

function newsletterListModalActions() {
  return settingsModalActions();
}
function addNewsletterButton() {
  const nav = document.querySelector('nav');
  if (!nav) return;
  // check if the setting button is already added
  if (document.querySelector('#newsletter-button')) return;
  // create the setting button by copying the nav button
  const newsletterButton = document.createElement('a');
  newsletterButton.classList = 'flex py-3 px-3 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-white cursor-pointer text-sm';
  newsletterButton.textContent = 'Newsletter Archive';
  newsletterButton.title = 'CMD/CTRL + SHIFT + L';

  const newsletterButtonIcon = document.createElement('img');
  newsletterButtonIcon.style = 'width: 16px; height: 16px;';
  newsletterButtonIcon.src = chrome.runtime.getURL('icons/newsletter.png');
  newsletterButton.id = 'newsletter-button';
  newsletterButton.prepend(newsletterButtonIcon);
  newsletterButton.style = `${newsletterButton.style.cssText}; width: 100%;`;
  // Add click event listener to setting button
  newsletterButton.addEventListener('click', () => {
    // open the setting modal
    createNewsletterListModal();
  });
  const userMenu = nav.querySelector('#user-menu');
  userMenu.prepend(newsletterButton);
}
// eslint-disable-next-line no-unused-vars
function initializeNewsletter() {
  addNewsletterButton();
}
