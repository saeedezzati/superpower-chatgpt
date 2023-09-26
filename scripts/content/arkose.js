/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
// eslint-disable-next-line func-names
window.useArkoseSetupEnforcement = function (e) {
  // console.warn('arkoseSetupEnforcement', e);
  e.setConfig({
    selector: '#enforcement-trigger',
    onCompleted(x) {
      window.localStorage.setItem('arkoseToken', x.token);
    },
    onError(x) {
      console.warn('onError', x);
    },
    onFailed(x) {
      console.warn('onFailed', x);
    },
    onShown(x) {
      console.warn('onShown', x);
    },
  });
};
