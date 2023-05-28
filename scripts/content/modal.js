/* global */
/* eslint-disable no-unused-vars */
function createModal(title, subtitle, modalBodyContent, modalActionBarContent, allowFullscreen) {
  const modal = document.createElement('div');
  modal.id = `modal-${title.toLowerCase().replaceAll(' ', '-')}`;
  modal.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background-color:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:10000;';
  const modalWrapper = document.createElement('div');
  modalWrapper.id = `modal-wrapper-${title.toLowerCase().replaceAll(' ', '-')}`;
  modalWrapper.style = `width: ${window.innerWidth > 780 ? '50vw' : '100vw'}; height: ${window.innerWidth > 780 ? '70vh' : '80vh'}; background-color: #0b0d0e; border-radius: 8px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between;box-shadow: rgb(0 0 0 / 72%) 0px 0px 20px 0px`;
  window.addEventListener('resize', () => {
    // eslint-disable-next-line no-nested-ternary
    modalWrapper.style.width = window.innerWidth > 960 ? '50vw' : window.innerWidth > 780 ? '70vw' : '100vw';
    // eslint-disable-next-line no-nested-ternary
    modalWrapper.style.height = window.innerWidth > 960 ? '70vh' : window.innerWidth > 780 ? '80vh' : '90vh';
  });
  const modalHeader = document.createElement('div');
  modalHeader.style = 'display: flex; justify-content: space-between; align-items: center;';
  const modalHeaderLeft = document.createElement('div');
  modalHeaderLeft.style = 'display: flex; align-items: start; flex-direction: column;';
  const modalHeaderRight = document.createElement('div');
  modalHeaderRight.style = 'display: flex; align-items: end;';

  const modalTitle = document.createElement('div');
  modalTitle.style = 'font-size: 1.5em; font-weight: 600; color: lightslategray;';
  modalTitle.innerHTML = title;
  const modalSubtitle = document.createElement('div');
  modalSubtitle.style = 'font-size: 0.7em; font-weight:200; margin:2px 0; color: lightslategray';
  modalSubtitle.innerHTML = subtitle;
  modalHeaderLeft.appendChild(modalTitle);
  modalHeaderLeft.appendChild(modalSubtitle);

  const modalFullScreenButton = document.createElement('button');
  modalFullScreenButton.id = `modal-fullscreen-button-${title.toLowerCase().replaceAll(' ', '-')}`;
  modalFullScreenButton.style = 'font-size: 0.8em; padding: 4px;color: lightslategray; margin-right:8px; position:relative; bottom:2px; width:24px;';
  modalFullScreenButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="lightslategrey" viewBox="0 0 512 512"><path d="M183 295l-81.38 81.38l-47.03-47.03c-6.127-6.117-14.29-9.367-22.63-9.367c-4.117 0-8.279 .8086-12.25 2.43c-11.97 4.953-19.75 16.63-19.75 29.56v135.1C.0013 501.3 10.75 512 24 512h136c12.94 0 24.63-7.797 29.56-19.75c4.969-11.97 2.219-25.72-6.938-34.87l-47.03-47.03l81.38-81.38c9.375-9.375 9.375-24.56 0-33.94S192.4 285.7 183 295zM487.1 0h-136c-12.94 0-24.63 7.797-29.56 19.75c-4.969 11.97-2.219 25.72 6.938 34.87l47.04 47.03l-81.38 81.38c-9.375 9.375-9.375 24.56 0 33.94s24.56 9.375 33.94 0l81.38-81.38l47.03 47.03c6.127 6.117 14.3 9.35 22.63 9.35c4.117 0 8.275-.7918 12.24-2.413C504.2 184.6 512 172.9 512 159.1V23.1C512 10.75 501.3 0 487.1 0z"/></svg>';
  modalFullScreenButton.addEventListener('click', () => {
    const modalContent = document.querySelector(`[id="modal-content-${title.toLowerCase().replaceAll(' ', '-')}"]`);
    const modalBody = document.querySelector(`[id="modal-body-${title.toLowerCase().replaceAll(' ', '-')}"]`);
    const curModalWrapper = document.querySelector(`[id="modal-wrapper-${title.toLowerCase().replaceAll(' ', '-')}"]`);
    if (curModalWrapper.style.width === '100vw' && curModalWrapper.style.height === '100vh') {
      curModalWrapper.style.width = window.innerWidth > 780 ? '50vw' : '100vw';
      curModalWrapper.style.height = window.innerWidth > 780 ? '70vh' : '80vh';
      modalContent.style.width = '100%';
      modalBody.style.alignItems = 'center';
      return;
    }

    curModalWrapper.style.width = '100vw';
    curModalWrapper.style.height = '100vh';
    modalContent.style.width = '50%';
    modalBody.style.alignItems = 'center';
  });
  if (allowFullscreen) modalHeaderRight.appendChild(modalFullScreenButton);

  const modalCloseButton = document.createElement('button');
  modalCloseButton.id = `modal-close-button-${title.toLowerCase().replaceAll(' ', '-')}`;
  modalCloseButton.style = 'border-radius: 4px; font-size: 0.8em; border: 1px solid lightslategray; padding: 4px 8px;color: lightslategray;';
  modalCloseButton.textContent = 'Close';
  modalCloseButton.addEventListener('click', () => {
    modal.remove();
  });
  modal.addEventListener('mousedown', (event) => {
    if (modalWrapper.contains(event.target)) return;
    modal.remove();
  });
  modalHeaderRight.appendChild(modalCloseButton);
  modalHeader.appendChild(modalHeaderLeft);
  modalHeader.appendChild(modalHeaderRight);

  const modalBody = document.createElement('div');
  modalBody.id = `modal-body-${title.toLowerCase().replaceAll(' ', '-')}`;
  modalBody.style = `display: flex; flex-direction: column; justify-content: space-between; border: solid 1px lightslategray; border-radius: 8px; height: 100%; overflow-y: ${allowFullscreen ? 'scroll' : 'hidden'};position: relative;`;
  modalBody.appendChild(modalBodyContent);
  const modalActionBar = document.createElement('div');
  modalActionBar.style = 'display: flex; justify-content: start; 8px; ';
  modalActionBar.appendChild(modalActionBarContent);
  modal.appendChild(modalWrapper);
  modalWrapper.appendChild(modalHeader);
  modalWrapper.appendChild(modalBody);
  modalWrapper.appendChild(modalActionBar);
  document.body.appendChild(modal);
}
