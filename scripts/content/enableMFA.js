/* eslint-disable no-unused-vars */
function showEnableMFA() {
  return `<div
  data-state="open"
  class="fixed inset-0 bg-gray-500/90 dark:bg-gray-800/90"
  style="pointer-events: auto;"
  >
  <div
    class="grid-cols-[minmax(10px,_auto)_minmax(300px,_800px)_minmax(10px,_auto)] md:grid-cols-[minmax(40px,_30%)_minmax(300px,_800px)_minmax(40px,_30%)] grid h-full w-full grid-rows-[minmax(10px,_1fr)_auto_minmax(10px,_1fr)] md:grid-rows-[minmax(20px,_1fr)_auto_minmax(20px,_1fr)] overflow-y-auto"
  >
    <div
    role="dialog"
    id="enable-mfa-dialog"
    aria-describedby="radix-:r5r:"
    aria-labelledby="radix-:r5q:"
    data-state="open"
    class="relative col-auto col-start-2 row-auto row-start-2 w-full rounded-lg text-left shadow-xl transition-all bg-white dark:bg-gray-900"
    tabindex="-1"
    style="pointer-events: auto;"
    >
    <div
      class="px-4 pb-4 pt-5 sm:p-6 flex items-center justify-between border-b border-black/10 dark:border-white/10"
    >
      <div class="flex items-center">
      <div class="text-center sm:text-left">
        <h2
        id="radix-:r5q:"
        as="h3"
        class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-200"
        >
        Enable two-factor authentication
        </h2>
      </div>
      </div>
    </div>
    <div class="p-4 sm:p-6 sm:pt-4">
      <div class="mt-4 flex flex-col gap-4">
      <div class="flex gap-4 flex-col text-sm">
        <div
        class="flex p-4 bg-gray-50 dark:bg-white/5 rounded-md items-center gap-4 min-h-[71px]"
        >
        <div class="w-10 text-2xl text-center">🚨</div>
        <div class="flex-1 leading-5">
          This plugin requires you to have two-factor authentication
          enabled for additional security. Please set up two-factor
          authentication in the settings and try again.
        </div>
        </div>
      </div>
      </div>
      <!--div class="flex flex-col gap-3 sm:flex-row-reverse mt-5 sm:mt-4">
      <button class="btn relative btn-primary" as="button">
        <div class="flex w-full gap-2 items-center justify-center">
        Enable two-factor authentication
        </div></button
      ><button class="btn relative btn-neutral" as="button">
        <div class="flex w-full gap-2 items-center justify-center">
        Cancel
        </div>
      </button>
      </div--!>
    </div>
    </div>
  </div>
  </div>
`;
}
