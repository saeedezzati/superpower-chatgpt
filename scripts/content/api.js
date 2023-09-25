/* global SSE */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-unused-vars */
let API_URL = 'https://api.wfh.team';
chrome.storage.local.get(['API_URL'], (r) => {
  API_URL = r.API_URL;
});
let lastPromptSuggestions = [];

// get auth token from sync storage
const defaultHeaders = {
  'content-type': 'application/json',
};
function getExamplePrompts(offset = 0, limit = 4) {
  const url = new URL('https://chat.openai.com/backend-api/prompt_library/');
  const params = { offset, limit };
  url.search = new URLSearchParams(params).toString();
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(url, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
  }).then((response) => response.json()))
    .then((data) => {
      lastPromptSuggestions = data.items.map((item) => item.prompt);
      return data;
    });
}

function generateSuggestions(conversationId, messageId, model, numSuggestions = 2) {
  const payload = {
    message_id: messageId,
    model,
    num_suggestions: numSuggestions,
  };
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(`https://chat.openai.com/backend-api/conversation/${conversationId}/experimental/generate_suggestions`, {
    method: 'POST',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
    body: JSON.stringify(payload),
  }).then((response) => response.json()))
    .then((data) => {
      lastPromptSuggestions = data.suggestions;
      return data;
    });
}
function generateChat(message, conversationId, messageId, parentMessageId, token, suggestions = [], saveHistory = true, role = 'user', action = 'next') {
  return chrome.storage.local.get(['settings', 'enabledPluginIds', 'installedPlugins']).then((res) => chrome.storage.sync.get(['accessToken']).then((result) => {
    const payload = {
      action,
      arkose_token: res.settings.selectedModel.tags.includes('gpt4') && !res.settings.selectedModel.tags.includes('Unofficial') ? token : null,
      model: res.settings.selectedModel.slug,
      parent_message_id: parentMessageId,
      history_and_training_disabled: !saveHistory,
      suggestions,
      timezone_offset_min: new Date().getTimezoneOffset(),
    };
    if (action === 'next') {
      payload.messages = messageId
        ? [
          {
            id: messageId,
            author: { role },
            content: {
              content_type: 'text',
              parts: [message],
            },
          },
        ]
        : null;
    }
    if (conversationId) {
      payload.conversation_id = conversationId;
    }
    // plugin model: text-davinci-002-plugins
    if (!conversationId && res.settings.selectedModel.slug.includes('plugins')) {
      // remove plugin ids from enabledPluginIds that are not installed
      const newEnabledPluginIds = res.enabledPluginIds.filter((id) => res.installedPlugins.find((p) => p.id === id));
      payload.plugin_ids = newEnabledPluginIds;
      chrome.storage.local.set({ enabledPluginIds: newEnabledPluginIds });
    }
    const eventSource = new SSE(
      '/backend-api/conversation',
      {
        method: 'POST',
        headers: {
          ...defaultHeaders,
          accept: 'text/event-stream',
          Authorization: result.accessToken,
        },
        payload: JSON.stringify(payload),
      },
    );
    eventSource.stream();
    return eventSource;
  }));
}
function getConversation(conversationId) {
  return chrome.storage.local.get(['conversations', 'conversationsAreSynced', 'settings']).then((res) => {
    const { conversations, conversationsAreSynced } = res;
    const { autoSync } = res.settings;
    if ((typeof autoSync === 'undefined' || autoSync) && conversationsAreSynced && conversations && conversations[conversationId]) {
      if (!conversations[conversationId].shouldRefresh) {
        return conversations[conversationId];
      }
    }
    return chrome.storage.sync.get(['accessToken']).then((result) => fetch(`https://chat.openai.com/backend-api/conversation/${conversationId}`, {
      method: 'GET',
      headers: {
        ...defaultHeaders,
        Authorization: result.accessToken,
      },

    }).then((response) => {
      if (response.ok) {
        return response.json();
      }
      return Promise.reject(response);
    }));
  });
}
function getAccount() {
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch('https://chat.openai.com/backend-api/accounts/check', {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
  }).then((response) => response.json()))
    .then((data) => {
      if (data.accounts) {
        chrome.storage.local.set({ account: data });
      }
    });
}
// {
//   "account_plan": {
//     "is_paid_subscription_active": true,
//     "subscription_plan": "chatgptplusplan",
//     "account_user_role": "account-owner",
//     "was_paid_customer": true,
//     "has_customer_object": true
//   },
//   "user_country": "US",
//   "features": [
//     "model_switcher",
//     "system_message"
//   ]
// }
function setUserSystemMessage(aboutUser, aboutModel, enabled) {
  const data = {
    about_user_message: aboutUser,
    about_model_message: aboutModel,
    enabled,
  };
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch('https://chat.openai.com/backend-api/user_system_messages', {
    method: 'POST',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
    body: JSON.stringify(data),
  }).then((res) => res.json()));
}
function getUserSystemMessage() {
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch('https://chat.openai.com/backend-api/user_system_messages', {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
  }).then((res) => res.json()))
    .then((data) => {
      chrome.storage.local.get(['customInstructionProfiles'], (result) => {
        const { customInstructionProfiles } = result;

        const newCustomInstructionProfiles = customInstructionProfiles.map((p) => {
          if (p.isSelected) {
            if (p.aboutModel === data.about_model_message && p.aboutUser === data.about_user_message) {
              return p;
            }
            return { ...p, isSelected: false };
          }
          if (p.aboutModel === data.about_model_message && p.aboutUser === data.about_user_message) {
            return { ...p, isSelected: true };
          }
          return p;
        });
        chrome.storage.local.set({ customInstructionProfiles: newCustomInstructionProfiles });
      });
      return data;
    });
}
function getModels() {
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch('https://chat.openai.com/backend-api/models', {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
  }).then((response) => response.json()))
    .then((data) => {
      if (data.models) {
        chrome.storage.local.get(['settings', 'models', 'account'], (res) => {
          const { models, settings, account } = res;
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
      }
    });
}
function getConversationLimit() {
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch('https://chat.openai.com/public-api/conversation_limit', {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
  }).then((response) => response.json())
    .then((data) => {
      if (data.message_cap) {
        chrome.storage.local.set({
          conversationLimit: data,
        });
      }
    }));
}
function messageFeedback(conversationId, messageId, rating, text = '') {
  const data = {
    conversation_id: conversationId,
    message_id: messageId,
    rating,
    tags: [],
  };
  if (text) {
    data.text = text;
  }
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch('https://chat.openai.com/backend-api/conversation/message_feedback', {
    method: 'POST',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
    body: JSON.stringify(data),
  }).then((res) => res.json()));
}
function getAllPlugins() {
  return getPlugins(0, 250, undefined, 'approved').then((res) => {
    chrome.storage.local.set({
      allPlugins: res.items,
    });
  });
}
function getApprovedPlugins() {
  getPlugins(0, 100, undefined, 'approved').then((res) => res);
}
function getInstalledPlugins() {
  getPlugins(0, 250, true, undefined).then((res) => {
    chrome.storage.local.set({
      installedPlugins: res.items,
    });
  });
}
function getPlugins(offset = 0, limit = 20, isInstalled = undefined, statuses = undefined) {
  const url = new URL('https://chat.openai.com/backend-api/aip/p');
  // without passing limit it returns 20 by default
  // limit cannot be more than 100
  const params = { offset, limit };
  url.search = new URLSearchParams(params).toString();
  if (isInstalled !== undefined) {
    url.searchParams.append('is_installed', isInstalled);
  }
  if (statuses) {
    url.searchParams.append('statuses', statuses);
  }
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(url, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
  }).then((res) => {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(res);
  }));
}
function installPlugin(pluginId) {
  const url = new URL(`https://chat.openai.com/backend-api/aip/p/${pluginId}/user-settings`);
  // without passing limit it returns 20 by default
  // limit cannot be more than 100
  const data = {
    is_installed: true,
  };
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(url, {
    method: 'PATCH',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
    body: JSON.stringify(data),

  }).then((res) => {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(res);
  }));
}
function uninstallPlugin(pluginId) {
  const url = new URL(`https://chat.openai.com/backend-api/aip/p/${pluginId}/user-settings`);
  // without passing limit it returns 20 by default
  // limit cannot be more than 100
  const data = {
    is_installed: false,
  };
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(url, {
    method: 'PATCH',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
    body: JSON.stringify(data),

  }).then((res) => {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(res);
  }));
}
function userSettings(pluginId) {
  const url = new URL(`https://chat.openai.com/backend-api/aip/${pluginId}/user-settings`);
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(url, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
  }).then((res) => {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(res);
  }));
}

function createShare(conversationId, currentNodeId, isAnnonymous = true) {
  const url = new URL('https://chat.openai.com/backend-api/share/create');
  // without passing limit it returns 50 by default
  // limit cannot be more than 20
  const data = {
    is_anonymous: isAnnonymous,
    conversation_id: conversationId,
    current_node_id: currentNodeId,
    // message_id: `aaa1${self.crypto.randomUUID().slice(4)}`,
  };
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(url, {
    method: 'POST',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
    body: JSON.stringify(data),

  }).then((res) => {
    if (res.ok) {
      const jsonData = res.json();
      // if (!jsonData.already_exists) {
      //   getSharedConversations().then((sharedConversations) => {
      //     const conversation = sharedConversations.items.find((c) => c.conversation_id === conversationId);
      //     chrome.storage.local.get(['conversations'], (localResult) => {
      //       chrome.storage.local.set({
      //         conversations: {
      //           ...localResult.conversations,
      //           [conversationId]: {
      //             ...Object.values(localResult.conversations).find((c) => c.id === conversationId),
      //             update_time: new Date(conversation.update_time).getTime() / 1000,
      //           },
      //         },
      //       });
      //     });
      //   });
      // }
      return jsonData;
    }
    return Promise.reject(res);
  }));
}

function share(shareId, title, highlightedMessageId, isAnonymous = true, isVisibile = true, isPublic = true) {
  const url = new URL(`https://chat.openai.com/backend-api/share/${shareId}`);
  // without passing limit it returns 50 by default
  // limit cannot be more than 20
  const data = {
    is_public: isPublic,
    is_anonymous: isAnonymous,
    is_visible: isVisibile,
    title,
    highlighted_message_id: highlightedMessageId,
    share_id: shareId,
  };
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(url, {
    method: 'PATCH',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
    body: JSON.stringify(data),

  }).then((res) => {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(res);
  }));
}

function deleteShare(shareId) {
  const url = new URL(`https://chat.openai.com/backend-api/share/${shareId}`);
  // without passing limit it returns 50 by default
  // limit cannot be more than 20
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(url, {
    method: 'DELETE',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
  }).then((res) => {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(res);
  }));
}
// returnsa thenable promise. If selectedConversations exist, return them, otherwise get all conversations
function getSelectedConversations(forceRefresh = false) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['selectedConversations'], (result) => {
      if (!forceRefresh && result.selectedConversations && result.selectedConversations.length > 0) {
        resolve(result.selectedConversations);
      } else {
        resolve(getAllConversations());
      }
    });
  });
}

function getAllConversations(forceRefresh = false) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['conversations', 'conversationsAreSynced', 'settings']).then((res) => {
      const {
        conversations, conversationsAreSynced, settings,
      } = res;
      const { autoSync, quickSync, quickSyncCount } = settings;

      if (!forceRefresh && conversationsAreSynced && (typeof autoSync === 'undefined' || autoSync)) {
        const visibleConversation = Object.values(conversations);
        resolve(visibleConversation);
      } else {
        const allConversations = [];
        const initialOffset = 0;
        const initialLimit = (autoSync && quickSync && quickSyncCount > 0) ? Math.min(100, quickSyncCount) : 100;
        getConversations(initialOffset, initialLimit).then((convs) => {
          const {
            limit, offset, items,
          } = convs;
          // eslint-disable-next-line no-nested-ternary
          const total = (autoSync && quickSync && quickSyncCount > 0)
            ? quickSyncCount
            : convs.total ? Math.min(convs.total, 10000) : 10000; // sync last 10000 conversations
          if (items.length === 0 || total === 0) {
            resolve([]);
            return;
          }
          allConversations.push(...items);
          if (offset + limit < total) {
            const promises = [];
            for (let i = 1; i < Math.ceil(total / limit); i += 1) {
              promises.push(getConversations(i * limit, limit));
            }
            Promise.all(promises).then((results) => {
              results.forEach((result) => {
                if (result.items) {
                  allConversations.push(...result.items);
                }
              });
              resolve(allConversations);
            }, (err) => {
              if (conversationsAreSynced) {
                const visibleConversation = Object.values(conversations).filter((conversation) => !conversation.archived && !conversation.skipped);
                resolve(visibleConversation);
              }
              resolve(Promise.reject(err));
            });
          } else {
            resolve(allConversations);
          }
        }, (err) => {
          if (conversationsAreSynced) {
            const visibleConversation = Object.values(conversations).filter((conversation) => !conversation.archived && !conversation.skipped);
            resolve(visibleConversation);
          }
          resolve(Promise.reject(err));
        });
      }
    });
  });
}
function getSharedConversations(offset = 0, limit = 100) {
  const url = new URL('https://chat.openai.com/backend-api/shared_conversations');
  // without passing limit it returns 50 by default
  // limit cannot be more than 20
  // const params = { offset, limit };
  // url.search = new URLSearchParams(params).toString();
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(url, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
  }).then((res) => {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(res);
  }));
}
function getConversations(offset = 0, limit = 100, order = 'updated') {
  const url = new URL('https://chat.openai.com/backend-api/conversations');
  // without passing limit it returns 50 by default
  // limit cannot be more than 20
  const params = { offset, limit, order };
  url.search = new URLSearchParams(params).toString();
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(url, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
  }).then((res) => {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(res);
  }));
}
function updateConversation(id, data) {
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(`https://chat.openai.com/backend-api/conversation/${id}`, {
    method: 'PATCH',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
    body: JSON.stringify(data),
  }).then((res) => res.json()));
}
function generateTitle(conversationId, messageId) {
  return chrome.storage.local.get(['settings']).then((res) => {
    const data = {
      message_id: messageId,
    };
    return chrome.storage.sync.get(['accessToken']).then((result) => fetch(`https://chat.openai.com/backend-api/conversation/gen_title/${conversationId}`, {
      method: 'POST',
      headers: {
        ...defaultHeaders,
        Authorization: result.accessToken,
      },
      body: JSON.stringify(data),
    }).then((response) => response.json()));
  });
}
function renameConversation(conversationId, title) {
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch(`https://chat.openai.com/backend-api/conversation/${conversationId}`, {
    method: 'PATCH',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
    body: JSON.stringify({ title }),
  }).then((res) => res.json()));
}
function deleteConversation(conversationId) {
  return chrome.storage.local.get(['conversations']).then((localRes) => {
    const { conversations } = localRes;
    if (!conversations[conversationId].saveHistory) {
      return { success: true };
    }
    return chrome.storage.sync.get(['accessToken']).then((result) => fetch(`https://chat.openai.com/backend-api/conversation/${conversationId}`, {
      method: 'PATCH',
      headers: {
        ...defaultHeaders,
        Authorization: result.accessToken,
      },
      body: JSON.stringify({ is_visible: false }),
    }).then((res) => {
      if (res.ok) {
        return res.json();
      }
      return Promise.reject(res);
    }));
  });
}
function deleteAllConversations() {
  return chrome.storage.sync.get(['accessToken']).then((result) => fetch('https://chat.openai.com/backend-api/conversations', {
    method: 'PATCH',
    headers: {
      ...defaultHeaders,
      Authorization: result.accessToken,
    },
    body: JSON.stringify({ is_visible: false }),
  }).then((res) => {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(res);
  }));
}
