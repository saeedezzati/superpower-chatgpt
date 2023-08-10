/* eslint-disable no-restricted-globals */
/* global toast, setUserSystemMessage, customInstructionSettingsElement, getUserSystemMessage */

function checkmarkIcon(placement, profileId) {
  const checkmark = document.createElement('span');
  checkmark.id = `custom-instructions-profile-dropdown-checkmark-${placement}-${profileId}`;
  checkmark.classList = 'absolute inset-y-0 right-0 flex items-center pr-2 text-gray-800 dark:text-gray-100';
  checkmark.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="20 6 9 17 4 12"></polyline></svg>';
  return checkmark;
}
function trashIcon(placement, profileId) {
  const trash = document.createElement('span');
  trash.id = `custom-instructions-profile-dropdown-trash-${placement}-${profileId}`;
  trash.classList = 'absolute inset-y-0 right-0 flex items-center pr-2 text-gray-800 dark:text-gray-100';
  trash.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>';
  trash.addEventListener('click', (e) => {
    e.stopPropagation();
    chrome.storage.local.get(['customInstructionProfiles'], (res) => {
      const { customInstructionProfiles: cip } = res;
      const newCip = cip.filter((p) => p.id !== profileId);
      chrome.storage.local.set({ customInstructionProfiles: newCip }, () => {
        document.querySelectorAll(`[id^="custom-instructions-profile-dropdown-item-"][id$="-${profileId}"]`).forEach((el) => el.remove());
        reloadCustomInstructionSettings();
      });
    });
  });
  return trash;
}
function profileDropdown(customInstructionProfiles, placement) {
  const dropdown = document.createElement('ul');
  dropdown.id = `custom-instructions-profile-dropdown-list-${placement}`;
  dropdown.style = 'max-height:300px;overflow-y:scroll;width:200px;top:46px;right:0;z-index:200;';
  dropdown.classList = 'hidden absolute z-10 right-0 mt-1 overflow-auto rounded py-1 text-base ring-1 ring-opacity-5 focus:outline-none bg-white dark:bg-gray-800 dark:ring-white/20 dark:last:border-0 sm:text-sm -translate-x-1/4';
  dropdown.setAttribute('role', 'menu');
  dropdown.setAttribute('aria-orientation', 'vertical');
  dropdown.setAttribute('aria-labelledby', `custom-instructions-profile-dropdown-button-${placement}`);
  dropdown.setAttribute('tabindex', '-1');
  const newCustomInstructionProfiles = [...customInstructionProfiles, {
    name: '+ Add new profile', aboutUser: '', aboutModel: '', isSelected: false,
  }];
  for (let i = 0; i < newCustomInstructionProfiles.length; i += 1) {
    const profileId = newCustomInstructionProfiles[i].id;
    const profileName = newCustomInstructionProfiles[i].name;
    const profileAboutUser = newCustomInstructionProfiles[i].aboutUser;
    const profileAboutModel = newCustomInstructionProfiles[i].aboutModel;
    const { isSelected } = newCustomInstructionProfiles[i];
    const dropdownItem = document.createElement('li');
    dropdownItem.id = `custom-instructions-profile-dropdown-item-${placement}-${profileId}`;
    dropdownItem.dir = 'auto';
    dropdownItem.classList = 'text-gray-900 relative cursor-pointer select-none border-b p-2 last:border-0 border-gray-100 dark:border-white/20 hover:bg-gray-600';
    const dropdownOption = document.createElement('span');
    dropdownOption.classList = 'font-semibold flex h-6 items-center gap-1 truncate text-gray-800 dark:text-gray-100';
    dropdownOption.style = 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;display:block;margin-right: 24px; text-align:left';
    dropdownOption.innerText = profileName;
    dropdownOption.title = profileName;
    dropdownItem.appendChild(dropdownOption);
    dropdownItem.setAttribute('role', 'option');
    dropdownItem.setAttribute('tabindex', '-1');

    if (isSelected) {
      const checkmark = checkmarkIcon(placement, profileId);
      dropdownItem.appendChild(checkmark);
    } else if (i !== newCustomInstructionProfiles.length - 1) {
      const trash = trashIcon(placement, profileId);
      dropdownItem.appendChild(trash);
    }
    dropdownItem.addEventListener('mousemove', () => {
      dropdownItem.classList.add('bg-gray-600');
    });
    dropdownItem.addEventListener('mouseleave', () => {
      dropdownItem.classList.remove('bg-gray-600');
    });
    dropdownItem.addEventListener('click', () => {
      const customInstructionsDialog = document.querySelector('[role="dialog"][data-state="open"][tabindex="-1"]');
      if (placement === 'new-page') {
        setUserSystemMessage(profileAboutUser, profileAboutModel, true);
      }
      if (profileName === '+ Add new profile' && !customInstructionsDialog) {
        const userMenu = document.querySelector('#user-menu');
        userMenu.querySelector('button').click();
        // div element that contains the text "Custom instructions"
        setTimeout(() => {
          const menuButtons = userMenu.querySelectorAll('nav a');
          const customInstructionsButton = [...menuButtons].find((b) => b.textContent === 'Custom instructions');
          customInstructionsButton.click();

          setTimeout(() => {
            const cusstomInstructionsProfileDropdown = document.querySelector('#custom-instructions-profile-dropdown-list-settings');
            cusstomInstructionsProfileDropdown.lastChild.click();
          }, 1000);
        }, 300);
        return;
      }
      if (customInstructionsDialog) {
        const nameInput = document.querySelector('#custom-instructions-name-input');
        nameInput.value = profileName !== '+ Add new profile' ? profileName : '';
        const textAreaFields = document.querySelectorAll('[role="dialog"][data-state="open"][tabindex="-1"] textarea');
        const aboutUserInput = textAreaFields[0];
        const aboutModelInput = textAreaFields[1];
        aboutUserInput.value = profileAboutUser;
        aboutUserInput.dispatchEvent(new Event('input', { bubbles: true }));
        aboutUserInput.dispatchEvent(new Event('change', { bubbles: true }));
        aboutModelInput.value = profileAboutModel;
        aboutModelInput.dispatchEvent(new Event('input', { bubbles: true }));
        aboutModelInput.dispatchEvent(new Event('change', { bubbles: true }));
        nameInput.focus();
      }

      chrome.storage.local.get(['customInstructionProfiles'], (result) => {
        const { customInstructionProfiles: oldCip } = result;
        const previousSelectedProfile = oldCip.find((p) => p.isSelected);

        setTimeout(() => {
          const newCip = oldCip.map((p) => {
            if (p.id === profileId) {
              return { ...p, isSelected: true };
            }
            return { ...p, isSelected: false };
          });

          chrome.storage.local.set({ customInstructionProfiles: newCip }, () => {
            const selectedProfileTitle = document.querySelector(`#custom-instructions-selected-profile-title-${placement}`);
            selectedProfileTitle.textContent = profileName;
            // remove the old checkmark from the previous selected profile
            const oldCheckmark = document.querySelector(`[id^=custom-instructions-profile-dropdown-checkmark-${placement}-`);
            if (oldCheckmark) oldCheckmark.remove();
            // add the new trash icon to the previous selected profile
            if (previousSelectedProfile) {
              const previousSelectedProfileDropdownItem = document.querySelector(`#custom-instructions-profile-dropdown-item-${placement}-${previousSelectedProfile?.id}`);
              const newTrash = trashIcon(placement, previousSelectedProfile?.id);
              previousSelectedProfileDropdownItem.appendChild(newTrash);
            }

            // remove the old trash icon from the new selected profile
            const oldTrash = dropdownItem.querySelector(`#custom-instructions-profile-dropdown-trash-${placement}-${profileId}`);
            if (oldTrash) oldTrash.remove();

            // add the new checkmark to the new selected profile
            const newCheckmark = checkmarkIcon(placement, profileId);
            dropdownItem.appendChild(newCheckmark);

            // hide the dropdown
            const customInstructionsProfileDropdown = document.querySelector(`#custom-instructions-profile-dropdown-list-${placement}`);
            customInstructionsProfileDropdown.classList.replace('block', 'hidden');
          });
        }, 100);
      });
    });
    dropdown.appendChild(dropdownItem);
  }

  document.addEventListener('click', (e) => {
    const customInstructionsProfileDropdown = document.querySelector(`#custom-instructions-profile-dropdown-list-${placement}`);
    const cl = customInstructionsProfileDropdown?.classList;
    if (cl?.contains('block') && !e.target.closest(`#custom-instructions-profile-dropdown-button-${placement}`)) {
      customInstructionsProfileDropdown.classList.replace('block', 'hidden');
    }
  });
  return dropdown;
}
function profileDropdownButton(customInstructionProfiles, placement) {
  const selectedProfile = customInstructionProfiles.find((p) => p.isSelected);
  const button = document.createElement('button');
  button.id = `custom-instructions-profile-dropdown-button-${placement}`;
  button.title = 'Change the custom instructions profile';
  button.className = 'w-full relative cursor-pointer rounded-md border bg-white border-gray-300 pt-1 pl-3 pr-10 text-left focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600 dark:border-white/20 dark:bg-gray-800 sm:text-sm';
  button.type = 'button';
  const label = document.createElement('label');
  label.className = 'block text-xs text-gray-700 dark:text-gray-500';
  label.textContent = 'Profile';
  button.appendChild(label);
  const span = document.createElement('span');
  span.className = 'inline-flex w-full truncate font-semibold  text-gray-800 dark:text-gray-100';
  button.appendChild(span);
  const span2 = document.createElement('span');
  span2.className = 'flex h-6 items-center gap-1 truncate';
  span.appendChild(span2);
  const span3 = document.createElement('span');
  span3.className = 'font-semibold truncate';
  span3.id = `custom-instructions-selected-profile-title-${placement}`;
  span3.textContent = selectedProfile?.name || customInstructionProfiles[0]?.name || 'No saved profile';
  span2.appendChild(span3);
  const span4 = document.createElement('span');
  span4.className = 'pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2';
  button.appendChild(span4);
  span4.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4  text-gray-400" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="6 9 12 15 18 9"></polyline></svg>';
  button.addEventListener('click', () => {
    const customInstructionsProfileDropdown = document.querySelector(`#custom-instructions-profile-dropdown-list-${placement}`);
    const cl = customInstructionsProfileDropdown.classList;
    if (cl.contains('block')) {
      customInstructionsProfileDropdown.classList.replace('block', 'hidden');
    } else {
      customInstructionsProfileDropdown.classList.replace('hidden', 'block');
    }
  });
  return button;
}
function upgradeCustomInstructions() {
  // observe the body and wait for the custom instructions dialog to be added
  // there should be a div with role="dialog" and a h2 with text "Custom instructions"
  const targetNode = document.body;
  const config = { childList: true, subtree: true };
  const callback = (mutationsList) => {
    mutationsList.forEach((mutation) => {
      if (mutation.type === 'childList') {
        setTimeout(() => {
          chrome.storage.local.get(['customInstructionProfiles'], (result) => {
            const customInstructionsDialog = document.querySelector('[role="dialog"][data-state="open"][tabindex="-1"]');
            if (!customInstructionsDialog) return;
            const customInstructionsDialogHeader = customInstructionsDialog.querySelector('h2');
            const existingProfileButtonWrapper = customInstructionsDialog.querySelector('#custom-instructions-profile-button-wrapper-settings');
            const textAreaFields = customInstructionsDialog.querySelectorAll('textarea');
            if (textAreaFields.length > 0 && !existingProfileButtonWrapper && customInstructionsDialog && customInstructionsDialogHeader.textContent === 'Custom instructions') {
              // const aboutUser = textAreaFields[0]?.value;
              // const aboutModel = textAreaFields[1]?.value;
              const { customInstructionProfiles } = result;
              const newCustomInstructionProfiles = customInstructionProfiles;
              const selectedProfile = customInstructionProfiles.find((p) => p.isSelected);
              if (selectedProfile) {
                textAreaFields[0].value = selectedProfile.aboutUser;
                textAreaFields[0].dispatchEvent(new Event('input', { bubbles: true }));
                textAreaFields[0].dispatchEvent(new Event('change', { bubbles: true }));
                textAreaFields[1].value = selectedProfile.aboutModel;
                textAreaFields[1].dispatchEvent(new Event('input', { bubbles: true }));
                textAreaFields[1].dispatchEvent(new Event('change', { bubbles: true }));
              }
              // if (!selectedProfile || selectedProfile.aboutUser.replace(/[^a-zA-Z]/g, '') !== aboutUser.replace(/[^a-zA-Z]/g, '') || selectedProfile.aboutModel.replace(/[^a-zA-Z]/g, '') !== aboutModel.replace(/[^a-zA-Z]/g, '')) {
              //   newCustomInstructionProfiles = customInstructionProfiles.map((p) => {
              //     if (p.aboutModel.replace(/[^a-zA-Z]/g, '') === aboutModel.replace(/[^a-zA-Z]/g, '') && p.aboutUser.replace(/[^a-zA-Z]/g, '') === aboutUser.replace(/[^a-zA-Z]/g, '')) {
              //       selectedProfile = { ...p, isSelected: true };
              //       return { ...p, isSelected: true };
              //     }
              //     if (p.isSelected) {
              //       selectedProfile = undefined;
              //       return { ...p, isSelected: false };
              //     }
              //     return p;
              //   });
              //   chrome.storage.local.set({ customInstructionProfiles: newCustomInstructionProfiles });
              // }

              // header = first child
              const header = customInstructionsDialog.firstChild;
              const profileButtonWrapper = document.createElement('div');
              profileButtonWrapper.style = 'position:relative;width: 200px;';
              profileButtonWrapper.id = 'custom-instructions-profile-button-wrapper-settings';
              profileButtonWrapper.appendChild(profileDropdown(newCustomInstructionProfiles, 'settings'));
              profileButtonWrapper.appendChild(profileDropdownButton(newCustomInstructionProfiles, 'settings'));
              header.appendChild(profileButtonWrapper);
              // body  = second child
              const body = customInstructionsDialog.children[1];
              const nameLabel = document.createElement('label');
              nameLabel.className = 'block text-xs text-gray-700 dark:text-gray-500 mb-2 text-gray-600';
              nameLabel.textContent = 'Name';
              const nameInput = document.createElement('input');
              nameInput.id = 'custom-instructions-name-input';
              nameInput.placeholder = 'Profile Name';
              nameInput.value = selectedProfile?.name || '';
              nameInput.classList = 'w-full rounded p-2 mb-6 border dark:bg-gray-800 bg-white border-gray-100 focus:border-brand-green focus:ring-0 focus-visible:ring-0 bg-gray-50 outline-none focus-visible:outline-none';
              if (textAreaFields[0].disabled) {
                nameInput.disabled = true;
                nameInput.classList.add('text-gray-300');
              }
              nameInput.addEventListener('input', () => {
                const curSelectedProfileName = selectedProfile?.name || '';
                const allButtons = body.querySelectorAll('button');
                const saveButton = [...allButtons].find((b) => b.textContent === 'Save');
                const curTextAreaFields = document.querySelectorAll('[role="dialog"][data-state="open"][tabindex="-1"] textarea');
                const curAboutUserInput = curTextAreaFields[0];
                const curAboutModelInput = curTextAreaFields[1];
                if (nameInput.value === '' || (nameInput.value === curSelectedProfileName && curAboutUserInput.value === selectedProfile?.aboutUser && curAboutModelInput.value === selectedProfile?.aboutModel)) {
                  saveButton.disabled = true;
                  saveButton.classList.add('opacity-50', 'cursor-not-allowed');
                } else if (saveButton.disabled) {
                  saveButton.disabled = false;
                  saveButton.classList.remove('opacity-50', 'cursor-not-allowed');
                }
              });
              // add the input field to the beginning of the body
              body.insertBefore(nameInput, body.firstChild);
              body.insertBefore(nameLabel, body.firstChild);
              // add a change listener to the text area fields
              textAreaFields.forEach((t) => {
                t.addEventListener('input', () => {
                  setTimeout(() => {
                    const curNameInput = document.querySelector('#custom-instructions-name-input');
                    if (curNameInput.value === '') {
                      saveButton.disabled = true;
                      saveButton.classList.add('opacity-50', 'cursor-not-allowed');
                    } else if (curNameInput.value !== selectedProfile?.name) {
                      saveButton.disabled = false;
                      saveButton.classList.remove('opacity-50', 'cursor-not-allowed');
                    }
                  }, 10);
                });
              });
              // find a button inside body that has text "Save"
              const allButtons = body.querySelectorAll('button');
              const toggleButton = [...allButtons].find((b) => b.role === 'switch');
              const saveButton = [...allButtons].find((b) => b.textContent === 'Save');
              // add a chane listener to the toggle button
              toggleButton.addEventListener('click', () => {
                const currState = toggleButton.getAttribute('aria-checked');

                // when toggle off nameinput shoud be disabled
                const curNameInput = document.querySelector('#custom-instructions-name-input');
                if (currState === 'true') {
                  curNameInput.disabled = true;
                  curNameInput.classList.add('text-gray-300');
                } else {
                  curNameInput.disabled = false;
                  curNameInput.classList.remove('text-gray-300');
                }
                setTimeout(() => {
                  if (curNameInput.value === '') {
                    saveButton.disabled = true;
                    saveButton.classList.add('opacity-50', 'cursor-not-allowed');
                  } else if (curNameInput.value !== selectedProfile?.name) {
                    saveButton.disabled = false;
                    saveButton.classList.remove('opacity-50', 'cursor-not-allowed');
                  }
                }, 10);
              });
              // add a click listener to the save button
              saveButton.addEventListener('click', () => {
                chrome.storage.local.get(['customInstructionProfiles'], (res) => {
                  const { customInstructionProfiles: cip } = res;
                  const curNameInput = document.querySelector('#custom-instructions-name-input');
                  const curTextAreaFields = document.querySelectorAll('[role="dialog"][data-state="open"][tabindex="-1"] textarea');
                  const curAboutUserInput = curTextAreaFields[0];
                  const curAboutModelInput = curTextAreaFields[1];
                  const curSelectedProfile = cip.find((p) => p.isSelected);

                  if (!curSelectedProfile) {
                    const newCip = [...cip, {
                      name: curNameInput.value, aboutUser: curAboutUserInput.value, aboutModel: curAboutModelInput.value, isSelected: true, id: self.crypto.randomUUID(),
                    }];
                    chrome.storage.local.set({ customInstructionProfiles: newCip }, () => {
                      toast('Profile saved');
                      reloadCustomInstructionSettings();
                    });
                  } else {
                    const newCip = cip.map((p) => {
                      if (p.isSelected) {
                        return {
                          ...p, name: curNameInput.value, aboutUser: curAboutUserInput.value, aboutModel: curAboutModelInput.value,
                        };
                      }
                      return p;
                    });
                    chrome.storage.local.set({ customInstructionProfiles: newCip }, () => {
                      toast('Profile updated');
                      reloadCustomInstructionSettings();
                    });
                  }
                });
              });
            }
          });
        }, 200);
      }
    });
  };
  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);
}
function reloadCustomInstructionSettings() {
  const existingCustomInstructionSettings = document.querySelector('#custom-instruction-settings');

  if (existingCustomInstructionSettings) {
    existingCustomInstructionSettings.remove();
    const newPageSettings = document.querySelector('#new-page-settings');
    setTimeout(() => {
      const customInstructionSettings = customInstructionSettingsElement();
      // prepend the custom instruction settings to the new page settings
      newPageSettings.insertBefore(customInstructionSettings, newPageSettings.firstChild);
    }, 500);
  }
}
