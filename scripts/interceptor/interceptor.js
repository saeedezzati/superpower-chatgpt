// intercept fetch requests
const originalFetch = window.fetch;

// eslint-disable-next-line func-names
window.fetch = async function (...args) {
  const input = args[0];
  let url;

  if (input instanceof Request) {
    url = input.url;
  } else if (input instanceof URL) {
    url = input.href;
  } else {
    url = input;
  }

  const response = await originalFetch(...args);

  if (response && url.includes('api/auth/session')) {
    const responseData = await response.clone().json();

    if (responseData.accessToken) {
      const authReceivedEvent = new CustomEvent('authReceived', {
        detail: responseData,
      });
      window.dispatchEvent(authReceivedEvent);
    }
  }
  if (response && url.includes('backend-api/accounts/check')) {
    const responseData = await response.clone().json();
    if (responseData.accounts) {
      const accountReceivedEvent = new CustomEvent('accountReceived', {
        detail: responseData,
      });
      window.dispatchEvent(accountReceivedEvent);
    }
  }
  if (response && url.includes('public-api/conversation_limit')) {
    const responseData = await response.clone().json();
    if (responseData.message_cap) {
      const conversationLimitReceivedEvent = new CustomEvent('conversationLimitReceived', {
        detail: responseData,
      });
      window.dispatchEvent(conversationLimitReceivedEvent);
    }
  }
  if (response && url.includes('backend-api/models')) {
    const responseData = await response.clone().json();
    if (responseData.models) {
      const modelsReceivedEvent = new CustomEvent('modelsReceived', {
        detail: responseData,
      });
      window.dispatchEvent(modelsReceivedEvent);
    }
  }
  return response;
};
