window.useArkoseSetupEnforcement = function (e) {
  // console.warn('arkoseSetupEnforcement', e);
  e.setConfig({
    selector: '#enforcement-trigger',
    onCompleted(x) {
      // console.warn('onCompleted', x);
      window.localStorage.setItem('arkoseToken', x.token);
    },
    onError(x) {
      // console.warn('onError', x);
    },
    onFailed(x) {
      // console.warn('onFailed', x);
    },
    onShown(x) {
      // console.warn('onShown', x);
    },
  });
};
