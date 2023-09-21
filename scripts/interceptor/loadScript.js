function injectScript(scriptUrl) {
  const newScriptElement = document.createElement('script');
  newScriptElement.setAttribute('src', scriptUrl);
  newScriptElement.setAttribute('type', 'text/javascript');

  newScriptElement.onload = function () {
    this.remove();
  };

  document.documentElement.prepend(newScriptElement);
}

const interceptorScriptUrl = chrome.runtime.getURL('scripts/interceptor/interceptor.js');
injectScript(interceptorScriptUrl);
