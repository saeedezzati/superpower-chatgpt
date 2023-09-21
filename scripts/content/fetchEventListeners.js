/* global getAllPlugins, getInstalledPlugins */

function registerUser(data) {
  chrome.storage.local.get(['account', 'API_URL'], (r) => {
    const { account, API_URL } = r;
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

window.addEventListener('authReceived', (event) => {
  const data = event.detail;
  chrome.storage.sync.get(['user_id', 'openai_id', 'version', 'avatar', 'lastUserSync', 'accessToken'], (result) => {
    // or conditionor
    const { version } = chrome.runtime.getManifest();

    const shouldRegister = !result.lastUserSync
      || result.lastUserSync < Date.now() - 1000 * 60 * 60 * 24
      || !result.avatar
      || !result.user_id
      || !result.openai_id
      || !result.accessToken
      || result.version !== version;

    if (result.openai_id !== data.user.id) {
      // remove any key from localstorage except the following keys: API_URL, settings, customInstructionProfiles, customPrompts, readNewsletterIds, promptChains, userInputValueHistory
      chrome.storage.local.get(['API_URL', 'settings', 'customInstructionProfiles', 'customPrompts', 'readNewsletterIds', 'promptChains', 'userInputValueHistory'], (res) => {
        const {
          API_URL, settings, customInstructionProfiles, customPrompts, readNewsletterIds, promptChains, userInputValueHistory,
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
          }, () => registerUser(data));
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
});

window.addEventListener('accountReceived', (event) => {
  chrome.storage.local.set({ account: event.detail });
});

window.addEventListener('conversationLimitReceived', (event) => {
  chrome.storage.local.set({
    conversationLimit: event.detail,
  });
});

window.addEventListener('modelsReceived', (event) => {
  const data = event.detail;
  chrome.storage.local.get(['settings', 'models', 'account'], (res) => {
    const { settings, account } = res;
    if (!settings) return;
    chrome.storage.local.set({
      models: data.models,
      settings: { ...settings, selectedModel: settings.selectedModel || data.models?.[0] },
    });
    if (data.models.map((m) => m.slug).find((m) => m.includes('plugins'))) {
      const isPaid = account?.accounts?.default?.entitlement?.has_active_subscription || false;
      if (isPaid) {
        getAllPlugins();
        getInstalledPlugins();
      }
    }
  });
});
