/* global messageFeedback */
function feedbackModal(rating) {
  return rating === 'thumbsUp' ? `<div id="headlessui-portal-root">
<div data-headlessui-portal=""><button type="button" aria-hidden="true"
  style="position: fixed; top: 1px; left: 1px; width: 1px; height: 0px; padding: 0px; margin: -1px; overflow: hidden; clip: rect(0px, 0px, 0px, 0px); white-space: nowrap; border-width: 0px;"></button>
  <div>
  <div class="relative z-50" id="headlessui-dialog-:r0:" role="dialog" aria-modal="true"
    data-headlessui-state="open" aria-labelledby="headlessui-dialog-title-:r2:">
    <div class="fixed inset-0 bg-gray-500/75 transition-opacity dark:bg-gray-800/75"></div>
    <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
      <div class="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all dark:bg-gray-900 sm:my-8 sm:w-full sm:p-6 sm:max-w-lg"
      id="headlessui-dialog-panel-:r1:" data-headlessui-state="open">
      <div class="flex items-center sm:flex">
        <div
        class="mr-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10 bg-green-100">
        <svg stroke="currentColor" fill="none" stroke-width="1.5" viewBox="0 0 24 24"
          stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6 text-green-700"
          height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
          <path
          d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3">
          </path>
        </svg></div>
        <div class="mt-3 text-center sm:mt-0 sm:text-left">
        <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-200"
          id="headlessui-dialog-title-:r2:" data-headlessui-state="open">Provide
          additional feedback</h3>
        </div>
      </div>
      <form><textarea id="feedback-other" placeholder="What would the ideal answer have been?"
        rows="3" class="mt-4 mb-1 w-full rounded-md dark:bg-gray-800 dark:focus:border-white dark:focus:ring-white" tabindex="0" style="height: 90px; overflow-y: hidden;"></textarea></form>
      <div class="mt-5 flex flex-col gap-3 sm:mt-4 sm:flex-row-reverse"><button id="feedback-submit"
        class="btn flex justify-center gap-2 btn-neutral">Submit feedback</button></div>
      </div>
    </div>
    </div>
  </div>
  </div><button type="button" aria-hidden="true"
  style="position: fixed; top: 1px; left: 1px; width: 1px; height: 0px; padding: 0px; margin: -1px; overflow: hidden; clip: rect(0px, 0px, 0px, 0px); white-space: nowrap; border-width: 0px;"></button>
</div>
</div>`
    : `<div id="headlessui-portal-root">
<div data-headlessui-portal=""><button type="button" aria-hidden="true"
  style="position: fixed; top: 1px; left: 1px; width: 1px; height: 0px; padding: 0px; margin: -1px; overflow: hidden; clip: rect(0px, 0px, 0px, 0px); white-space: nowrap; border-width: 0px;"></button>
  <div>
  <div class="relative z-50" id="headlessui-dialog-:r0:" role="dialog" aria-modal="true"
    data-headlessui-state="open" aria-labelledby="headlessui-dialog-title-:r2:">
    <div class="fixed inset-0 bg-gray-500/75 transition-opacity dark:bg-gray-800/75"></div>
    <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
      <div
      class="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all dark:bg-gray-900 sm:my-8 sm:w-full sm:p-6 sm:max-w-lg"
      id="headlessui-dialog-panel-:r1:" data-headlessui-state="open">
      <div class="flex items-center sm:flex">
        <div
        class="mr-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10 bg-red-100">
        <svg stroke="currentColor" fill="none" stroke-width="1.5" viewBox="0 0 24 24" stroke-linecap="round"
          stroke-linejoin="round" class="h-6 w-6 text-red-600" height="1em" width="1em"
          xmlns="http://www.w3.org/2000/svg">
          <path
          d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17">
          </path>
        </svg></div>
        <div class="mt-3 text-center sm:mt-0 sm:text-left">
        <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-200"
          id="headlessui-dialog-title-:r2:" data-headlessui-state="open">Provide additional feedback</h3>
        </div>
      </div>
      <form><textarea id="feedback-other" placeholder="What would the ideal answer have been?" rows="3"
        class="mt-4 mb-1 w-full rounded-md dark:bg-gray-800 dark:focus:border-white dark:focus:ring-white"
        tabindex="0" style="height: 90px; overflow-y: hidden;"></textarea>
        <div class="form-check"><input
          class="form-check-input float-left mt-1 mr-2 h-4 w-4 cursor-pointer appearance-none rounded-sm border border-gray-300 bg-white bg-contain bg-center bg-no-repeat align-top transition duration-200 checked:border-blue-600 checked:bg-blue-600 focus:outline-none"
          type="checkbox" id="feedback-harmful" value=""><label
          class="form-check-label inline-block text-gray-800 dark:text-gray-100" for="feedback-harmful">This
          is harmful / unsafe</label></div>
        <div class="form-check"><input
          class="form-check-input float-left mt-1 mr-2 h-4 w-4 cursor-pointer appearance-none rounded-sm border border-gray-300 bg-white bg-contain bg-center bg-no-repeat align-top transition duration-200 checked:border-blue-600 checked:bg-blue-600 focus:outline-none"
          type="checkbox" id="feedback-false" value=""><label
          class="form-check-label inline-block text-gray-800 dark:text-gray-100" for="feedback-false">This
          isn't true</label></div>
        <div class="form-check"><input
          class="form-check-input float-left mt-1 mr-2 h-4 w-4 cursor-pointer appearance-none rounded-sm border border-gray-300 bg-white bg-contain bg-center bg-no-repeat align-top transition duration-200 checked:border-blue-600 checked:bg-blue-600 focus:outline-none"
          type="checkbox" id="feedback-not-helpful" value=""><label
          class="form-check-label inline-block text-gray-800 dark:text-gray-100"
          for="feedback-not-helpful">This isn't helpful</label></div>
      </form>
      <div class="mt-5 flex flex-col gap-3 sm:mt-4 sm:flex-row-reverse"><button id="feedback-submit"
        class="btn flex justify-center gap-2 btn-neutral">Submit feedback</button></div>
      </div>
    </div>
    </div>
  </div>
  </div><button type="button" aria-hidden="true"
  style="position: fixed; top: 1px; left: 1px; width: 1px; height: 0px; padding: 0px; margin: -1px; overflow: hidden; clip: rect(0px, 0px, 0px, 0px); white-space: nowrap; border-width: 0px;"></button>
</div>
</div>`;
}
// eslint-disable-next-line no-unused-vars
function openFeedbackModal(conversationId, messageId, rating) {
  const div = document.createElement('div');
  div.innerHTML = feedbackModal(rating);
  const modalWrapper = div.firstChild;
  document.body.appendChild(modalWrapper);

  const submitFeedbackButton = modalWrapper.querySelector('[id="feedback-submit"]');
  submitFeedbackButton.addEventListener('click', () => {
    const feedbackText = document.querySelector('[id="feedback-other"]').value;
    messageFeedback(conversationId, messageId, rating, feedbackText);
    // close modal
    modalWrapper.parentNode.removeChild(modalWrapper);
  });
  const modal = modalWrapper.querySelector('[id="headlessui-dialog-panel-:r1:"]');
  modalWrapper.addEventListener('click', (e) => {
    if (!modal.contains(e.target)) {
      modalWrapper.parentNode.removeChild(modalWrapper);
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modalWrapper.parentNode.removeChild(modalWrapper);
    }
  });
}
