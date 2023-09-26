// eslint-disable-next-line prefer-const
// initialize environment to be production
let API_URL = 'https://api.wfh.team';

chrome.storage.local.set({ API_URL });

chrome.management.getSelf(
  (extensionInfo) => {
    if (extensionInfo.installType === 'development') {
      API_URL = 'https://dev.wfh.team:8000';
    }
    chrome.storage.local.set({ API_URL });
  },
);

chrome.runtime.onMessage.addListener(
  // eslint-disable-next-line no-unused-vars
  (request, sender, sendResponse) => {
    if (request.setUninstallURL) {
      chrome.runtime.setUninstallURL(`${API_URL}/gptx/uninstall?p=${request.userId}`);
    }
  },
);
chrome.runtime.onInstalled.addListener((detail) => {
  chrome.management.getSelf(
    (extensionInfo) => {
      if (extensionInfo.installType !== 'development') {
        if (detail.reason === 'install') {
          chrome.tabs.create({ url: 'https://ezi.notion.site/Superpower-ChatGPT-FAQ-9d43a8a1c31745c893a4080029d2eb24' });
          chrome.tabs.create({ url: 'https://superpowerdaily.com' });
          chrome.tabs.create({ url: 'https://chat.openai.com', active: true });
        } else {
          chrome.tabs.create({ url: 'https://superpowerdaily.com' });
        }
      }
    },
  );
});
chrome.action.onClicked.addListener((tab) => {
  if (!tab.url) {
    chrome.tabs.update(tab.id, { url: 'https://chat.openai.com' });
  } else {
    chrome.tabs.create({ url: 'https://chat.openai.com', active: true });
  }
});
//-----------------------------------
function registerUser(data) {
  chrome.storage.local.get(['account'], (r) => {
    const { account } = r;
    const isPaid = account?.accounts?.default?.entitlement?.has_active_subscription || false;
    const { user, accessToken } = data;
    const { version } = chrome.runtime.getManifest();
    const body = {
      openai_id: user.id,
      email: user.email,
      avatar: user.image,
      name: user.name,
      plus: isPaid,
      version,
    };
    chrome.storage.sync.set({
      openai_id: user.id,
      accessToken: `Bearer ${accessToken}`,
      mfa: user.mfa ? user.mfa : false,
      lastUserSync: Date.now(),
    }, () => {
      // register user to the server
      fetch(`${API_URL}/gptx/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }).then((res) => res.json())
        .then((newData) => {
          chrome.storage.sync.set({
            user_id: newData.id,
            name: newData.name,
            nickname: newData.nickname ? newData.nickname : newData.name,
            email: newData.email,
            avatar: newData.avatar,
            url: newData.url,
            version: newData.version,
          });
          chrome.storage.local.get(['settings'], (result) => {
            chrome.storage.local.set({ settings: { ...result.settings, emailNewsletter: newData.email_newsletter } });
          });
          chrome.runtime.sendMessage({ setUninstallURL: true, userId: user.id.split('-')[1] });
        });
    });
  });
}
chrome.runtime.onMessage.addListener(
  // eslint-disable-next-line no-unused-vars
  (request, sender, sendResponse) => {
    if (request.authReceived) {
      const data = request.detail;
      chrome.storage.sync.get(['user_id', 'openai_id', 'version', 'avatar', 'lastUserSync', 'accessToken'], (result) => {
        // or conditionor
        const { version } = chrome.runtime.getManifest();
        const shouldRegister = !result.lastUserSync
          || result.lastUserSync < Date.now() - 1000 * 60 * 60 * 24
          || !result.avatar
          || !result.user_id
          || !result.openai_id
          || !result.accessToken
          || result.accessToken !== `Bearer ${data.accessToken}`
          || result.version !== version;

        if (result.openai_id !== data.user.id) {
          // remove any key from localstorage except the following keys: API_URL, settings, customInstructionProfiles, customPrompts, readNewsletterIds, promptChains, userInputValueHistory
          chrome.storage.local.get(['settings', 'customInstructionProfiles', 'customPrompts', 'readNewsletterIds', 'promptChains', 'userInputValueHistory'], (res) => {
            const {
              settings, customInstructionProfiles, customPrompts, readNewsletterIds, promptChains, userInputValueHistory,
            } = res;
            chrome.storage.local.clear(() => {
              chrome.storage.local.set({
                API_URL,
                settings,
                customInstructionProfiles,
                customPrompts,
                readNewsletterIds,
                promptChains,
                userInputValueHistory,
              });
            });
          });
          // remove any key from syncstorage except the following keys: lastSeenAnnouncementId, lastSeenNewsletterId, lastSeenReleaseNoteVersion
          chrome.storage.sync.get(['lastSeenAnnouncementId', 'lastSeenNewsletterId', 'lastSeenReleaseNoteVersion'], (res) => {
            const {
              lastSeenAnnouncementId, lastSeenNewsletterId, lastSeenReleaseNoteVersion,
            } = res;
            chrome.storage.sync.clear(() => {
              chrome.storage.sync.set({
                lastSeenAnnouncementId,
                lastSeenNewsletterId,
                lastSeenReleaseNoteVersion,
              }, () => registerUser(data));
            });
          });
        } else if (shouldRegister) {
          registerUser(data);
        }
      });
    }
  },
);
//-----------------------------------
function submitPrompt(openAiId, prompt, promptTitle, categories, promptLangage, modelSlug, nickname, url, hideFullPrompt = false, promptId = null) {
  chrome.storage.sync.set({
    name: nickname,
    url,
  });
  const body = {
    openai_id: openAiId,
    text: prompt.trim(),
    title: promptTitle.trim(),
    nickname,
    hide_full_prompt: hideFullPrompt,
    url,
  };
  if (modelSlug) {
    body.model_slug = modelSlug;
  }
  if (promptId) {
    body.prompt_id = promptId;
  }
  if (categories) {
    body.categories = categories.map((category) => category.trim().toLowerCase().replaceAll(/\s/g, '_')).join(',');
  }
  if (promptLangage && promptLangage !== 'select') {
    body.language = promptLangage;
  }
  return fetch(`${API_URL}/gptx/add-prompt/`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  }).then((res) => res.json());
}

function deletePrompt(promptId) {
  return chrome.storage.sync.get(['openai_id']).then((result) => {
    const openAiId = result.openai_id;
    return fetch(`${API_URL}/gptx/delete-prompt/`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        openai_id: openAiId,
        prompt_id: promptId,
      }),
    }).then((res) => res.json());
  });
}
function getNewsletters() {
  return fetch(`${API_URL}/gptx/newsletters/`).then((res) => res.json());
}
function getNewsletter(id) {
  return fetch(`${API_URL}/gptx/${id}/newsletter/`).then((res) => res.json());
}
function getLatestNewsletter() {
  return fetch(`${API_URL}/gptx/latest-newsletter/`).then((res) => res.json());
}
function getLatestAnnouncement() {
  return fetch(`${API_URL}/gptx/announcements/`).then((res) => res.json());
}
function getReleaseNote(version) {
  return fetch(`${API_URL}/gptx/release-notes/`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ version }),
  }).then((res) => res.json());
}
function getPrompts(pageNumber, searchTerm, sortBy = 'recent', language = 'all', category = 'all') {
  // get user id from sync storage
  return chrome.storage.sync.get(['openai_id']).then((result) => {
    const openaiId = result.openai_id;
    let url = `${API_URL}/gptx/?order_by=${sortBy}`;
    if (sortBy === 'mine') url = `${API_URL}/gptx/?order_by=${sortBy}&id=${openaiId}`;
    if (pageNumber) url += `&page=${pageNumber}`;
    if (language !== 'all') url += `&language=${language}`;
    if (category !== 'all') url += `&category=${category}`;
    if (searchTerm && searchTerm.trim().length > 0) url += `&search=${searchTerm}`;
    return fetch(url)
      .then((response) => response.json());
  });
}
function getPrompt(promptId) {
  const url = `${API_URL}/gptx/${promptId}/`;
  return fetch(url)
    .then((response) => response.json());
}

function incrementUseCount(promptId) {
  return chrome.storage.sync.get(['openai_id']).then((result) => {
    const openaiId = result.openai_id;
    // increment use count
    const url = `${API_URL}/gptx/${promptId}/use-count/`;
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ openai_id: openaiId }),
    }).then((response) => response.json());
  });
}

function vote(promptId, voteType) {
  return chrome.storage.sync.get(['openai_id']).then((result) => {
    const openaiId = result.openai_id;
    // update vote count
    const url = `${API_URL}/gptx/${promptId}/vote/`;
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ openai_id: openaiId, vote_type: voteType }),
    }).then((response) => response.json());
  });
}

function report(promptId) {
  return chrome.storage.sync.get(['openai_id']).then((result) => {
    const openaiId = result.openai_id;
    // increment report count
    const url = `${API_URL}/gptx/${promptId}/report/`;
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ openai_id: openaiId }),
    }).then((response) => response.json());
  });
}

function incrementOpenRate(newsletterId) {
  const url = `${API_URL}/gptx/increment-open-rate/`;
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ newsletter_id: newsletterId }),
  }).then((response) => response.json());
}

function incrementClickRate(newsletterId) {
  const url = `${API_URL}/gptx/increment-click-rate/`;
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ newsletter_id: newsletterId }),
  }).then((response) => response.json());
}

//-----------------------------------
chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    (async () => {
      const data = request.detail;
      if (request.submitPrompt) {
        submitPrompt(data.openAiId, data.prompt, data.promptTitle, data.categories, data.promptLangage, data.modelSlug, data.nickname, data.url, data.hideFullPrompt, data.promptId).then((res) => {
          sendResponse(res);
        });
      }
      if (request.deletePrompt) {
        deletePrompt(data.promptId).then((res) => {
          sendResponse(res);
        });
      }
      if (request.getNewsletters) {
        getNewsletters().then((res) => {
          sendResponse(res);
        });
      }
      if (request.getNewsletter) {
        getNewsletter(data.id).then((res) => {
          sendResponse(res);
        });
      }
      if (request.getLatestNewsletter) {
        getLatestNewsletter().then((res) => {
          sendResponse(res);
        });
      }
      if (request.getReleaseNote) {
        getReleaseNote(data.version).then((res) => {
          sendResponse(res);
        });
      }
      if (request.getLatestAnnouncement) {
        getLatestAnnouncement().then((res) => {
          sendResponse(res);
        });
      }
      if (request.getPrompts) {
        getPrompts(data.pageNumber, data.searchTerm, data.sortBy, data.language, data.category).then((res) => {
          sendResponse(res);
        });
      }
      if (request.getPrompt) {
        getPrompt(data.promptId).then((res) => {
          sendResponse(res);
        });
      }
      if (request.incrementUseCount) {
        incrementUseCount(data.promptId).then((res) => {
          sendResponse(res);
        });
      }
      if (request.vote) {
        vote(data.promptId, data.voteType).then((res) => {
          sendResponse(res);
        });
      }
      if (request.report) {
        report(data.promptId).then((res) => {
          sendResponse(res);
        });
      }
      if (request.incrementOpenRate) {
        incrementOpenRate(data.newsletterId).then((res) => {
          sendResponse(res);
        });
      }
      if (request.incrementClickRate) {
        incrementClickRate(data.newsletterId).then((res) => {
          sendResponse(res);
        });
      }
    })();
    return true;
  },
);
