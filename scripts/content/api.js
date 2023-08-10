/* global SSE */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-unused-vars */
let API_URL = 'https://api.wfh.team';
chrome.storage.local.get(['environment'], (result) => {
  if (result.environment === 'development') {
    API_URL = 'https://dev.wfh.team:8000';
  }
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
  return chrome.storage.sync.get(['auth_token']).then((result) => fetch(url, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.auth_token,
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
  return chrome.storage.sync.get(['auth_token']).then((result) => fetch(`https://chat.openai.com/backend-api/conversation/${conversationId}/experimental/generate_suggestions`, {
    method: 'POST',
    headers: {
      ...defaultHeaders,
      Authorization: result.auth_token,
    },
    body: JSON.stringify(payload),
  }).then((response) => response.json()))
    .then((data) => {
      lastPromptSuggestions = data.suggestions;
      return data;
    });
}
function generateChat(message, conversationId, messageId, parentMessageId, token, suggestions = [], saveHistory = true, role = 'user', action = 'next') {
  return chrome.storage.local.get(['settings', 'enabledPluginIds']).then((res) => chrome.storage.sync.get(['auth_token']).then((result) => {
    const payload = {
      action,
      arkose_token: res.settings.selectedModel.slug.includes('gpt-4') && !res.settings.selectedModel.tags.includes('Unofficial') ? token : null,
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
      payload.plugin_ids = res.enabledPluginIds;
    }
    const eventSource = new SSE(
      '/backend-api/conversation',
      {
        method: 'POST',
        headers: {
          ...defaultHeaders,
          accept: 'text/event-stream',
          Authorization: result.auth_token,
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
    return chrome.storage.sync.get(['auth_token']).then((result) => fetch(`https://chat.openai.com/backend-api/conversation/${conversationId}`, {
      method: 'GET',
      headers: {
        ...defaultHeaders,
        Authorization: result.auth_token,
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
  return chrome.storage.sync.get(['auth_token']).then((result) => fetch('https://chat.openai.com/backend-api/accounts/check', {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.auth_token,
    },
  }).then((response) => response.json()))
    .then((data) => {
      if (data.account_plan) {
        chrome.storage.local.get(['account'], (res) => {
          chrome.storage.local.set({ ...res.account, account: data });
        });
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
  return chrome.storage.sync.get(['auth_token']).then((result) => fetch('https://chat.openai.com/backend-api/user_system_messages', {
    method: 'POST',
    headers: {
      ...defaultHeaders,
      Authorization: result.auth_token,
    },
    body: JSON.stringify(data),
  }).then((res) => res.json()));
}
function getUserSystemMessage() {
  return chrome.storage.sync.get(['auth_token']).then((result) => fetch('https://chat.openai.com/backend-api/user_system_messages', {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.auth_token,
    },
  }).then((res) => res.json()))
    .then((data) => {
      chrome.storage.local.get(['customInstructionProfiles'], (result) => {
        const { customInstructionProfiles } = result;

        const newCustomInstructionProfiles = customInstructionProfiles.map((p) => {
          if (p.isSelected) {
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
  return chrome.storage.sync.get(['auth_token']).then((result) => fetch('https://chat.openai.com/backend-api/models', {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.auth_token,
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
            const isPaid = account?.account_plan?.is_paid_subscription_active || account?.accounts?.default?.entitlement?.has_active_subscription || false;
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
  return chrome.storage.sync.get(['auth_token']).then((result) => fetch('https://chat.openai.com/public-api/conversation_limit', {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.auth_token,
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
  return chrome.storage.sync.get(['auth_token']).then((result) => fetch('https://chat.openai.com/backend-api/conversation/message_feedback', {
    method: 'POST',
    headers: {
      ...defaultHeaders,
      Authorization: result.auth_token,
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
  getPlugins(0, 100, true, undefined).then((res) => {
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
  return chrome.storage.sync.get(['auth_token']).then((result) => fetch(url, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.auth_token,
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
  return chrome.storage.sync.get(['auth_token']).then((result) => fetch(url, {
    method: 'PATCH',
    headers: {
      ...defaultHeaders,
      Authorization: result.auth_token,
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
  return chrome.storage.sync.get(['auth_token']).then((result) => fetch(url, {
    method: 'PATCH',
    headers: {
      ...defaultHeaders,
      Authorization: result.auth_token,
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
  return chrome.storage.sync.get(['auth_token']).then((result) => fetch(url, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.auth_token,
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
  return chrome.storage.sync.get(['auth_token']).then((result) => fetch(url, {
    method: 'POST',
    headers: {
      ...defaultHeaders,
      Authorization: result.auth_token,
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
  return chrome.storage.sync.get(['auth_token']).then((result) => fetch(url, {
    method: 'PATCH',
    headers: {
      ...defaultHeaders,
      Authorization: result.auth_token,
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
  return chrome.storage.sync.get(['auth_token']).then((result) => fetch(url, {
    method: 'DELETE',
    headers: {
      ...defaultHeaders,
      Authorization: result.auth_token,
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
    chrome.storage.sync.get('conversationsOrder', ({ conversationsOrder }) => {
      chrome.storage.local.get(['conversations', 'conversationsAreSynced', 'settings']).then((res) => {
        const {
          conversations, conversationsAreSynced, settings,
        } = res;
        const { autoSync, quickSync, quickSyncCount } = settings;

        // const allVisibleConversationsOrderIds = conversationsOrder.filter((conv) => conv.id !== 'trash').map((conv) => (typeof conv === 'object' ? conv.conversationIds : conv)).flat();

        // const quickSyncCount = Math.max(settings.quickSyncCount || 0, allVisibleConversationsOrderIds.length);

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
  });
}
function getSharedConversations(offset = 0, limit = 100) {
  const url = new URL('https://chat.openai.com/backend-api/shared_conversations');
  // without passing limit it returns 50 by default
  // limit cannot be more than 20
  // const params = { offset, limit };
  // url.search = new URLSearchParams(params).toString();
  return chrome.storage.sync.get(['auth_token']).then((result) => fetch(url, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.auth_token,
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
  return chrome.storage.sync.get(['auth_token']).then((result) => fetch(url, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.auth_token,
    },
  }).then((res) => {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(res);
  }));
}
function updateConversation(id, data) {
  return chrome.storage.sync.get(['auth_token']).then((result) => fetch(`https://chat.openai.com/backend-api/conversation/${id}`, {
    method: 'PATCH',
    headers: {
      ...defaultHeaders,
      Authorization: result.auth_token,
    },
    body: JSON.stringify(data),
  }).then((res) => res.json()));
}
function generateTitle(conversationId, messageId) {
  return chrome.storage.local.get(['settings']).then((res) => {
    const data = {
      message_id: messageId,
      model: res.settings.selectedModel.slug,
    };
    return chrome.storage.sync.get(['auth_token']).then((result) => fetch(`https://chat.openai.com/backend-api/conversation/gen_title/${conversationId}`, {
      method: 'POST',
      headers: {
        ...defaultHeaders,
        Authorization: result.auth_token,
      },
      body: JSON.stringify(data),
    }).then((response) => response.json()));
  });
}
function renameConversation(conversationId, title) {
  return chrome.storage.sync.get(['auth_token']).then((result) => fetch(`https://chat.openai.com/backend-api/conversation/${conversationId}`, {
    method: 'PATCH',
    headers: {
      ...defaultHeaders,
      Authorization: result.auth_token,
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
    return chrome.storage.sync.get(['auth_token']).then((result) => fetch(`https://chat.openai.com/backend-api/conversation/${conversationId}`, {
      method: 'PATCH',
      headers: {
        ...defaultHeaders,
        Authorization: result.auth_token,
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
  return chrome.storage.sync.get(['auth_token']).then((result) => fetch('https://chat.openai.com/backend-api/conversations', {
    method: 'PATCH',
    headers: {
      ...defaultHeaders,
      Authorization: result.auth_token,
    },
    body: JSON.stringify({ is_visible: false }),
  }).then((res) => {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(res);
  }));
}
function submitPrompt(openAiId, prompt, promptTitle, categories, promptLangage, modelSlug, nickname, url, hideFullPrompt = false, promptId = null) {
  chrome.storage.sync.set({
    name,
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
      ...defaultHeaders,
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
        ...defaultHeaders,
      },
      body: JSON.stringify({
        openai_id: openAiId,
        prompt_id: promptId,
      }),
    }).then((res) => res.json());
  });
}
function getNewsletters() {
  return fetch(`${API_URL}/gptx/newsletters/`, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
    },
  }).then((res) => res.json());
}
function getNewsletter(id) {
  return fetch(`${API_URL}/gptx/${id}/newsletter/`, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
    },
  }).then((res) => res.json());
}
function getLatestNewsletter(id) {
  return fetch(`${API_URL}/gptx/latest-newsletter/`, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
    },
  }).then((res) => res.json());
}
function getReleaseNote(version) {
  return fetch(`${API_URL}/gptx/release-notes/`, {
    method: 'POST',
    headers: {
      ...defaultHeaders,
    },
    body: JSON.stringify({ version }),
  }).then((res) => res.json());
}
function getLatestAnnouncement() {
  return fetch(`${API_URL}/gptx/announcements/`, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
    },
  }).then((res) => res.json());
}
function getSponsor(version) {
  return fetch(`${API_URL}/gptx/sponsor/`, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
    },
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
function getPrompt(pid) {
  // get user id from sync storage
  return chrome.storage.sync.get(['openai_id']).then((result) => {
    const openaiId = result.openai_id;
    const url = `${API_URL}/gptx/${pid}/`;
    return fetch(url)
      .then((response) => response.json());
  });
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

function updateEmailNewsletter(emailNewsletter) {
  chrome.storage.sync.get(['openai_id'], (result) => {
    const openaiId = result.openai_id;
    // increment report count
    const url = `${API_URL}/gptx/update-email-newsletter/`;
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ p: openaiId, email_newsletter: emailNewsletter }),
    });
  });
}
