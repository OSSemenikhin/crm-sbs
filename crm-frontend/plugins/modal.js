function _createFooterButtons(buttons = []) {
  if(buttons.length === 0) return document.createElement('div');

  const wrap = document.createElement('div');
  wrap.classList.add('modal-buttonsWrap');

  for (const button of buttons) {
    const buttonEl = document.createElement('button');
    buttonEl.textContent = button.text;
    if (button.attr) {
      for (let key in button.attr) {
        buttonEl.setAttribute(key, button.attr[key])
      }
    }
    if (button.classList && button.classList.length > 0) {
      for (const className of button.classList) {
        buttonEl.classList.add(className);
      }
    }
    buttonEl.addEventListener('click', button.onClick);
    wrap.append(buttonEl);
  }

  return wrap;
}

$$.modal = function (options) {
  let destroyed = false;
  const  domElModal = document.querySelector(options.element);
  const  domElModalContent = document.querySelector(options.elementContent);

  if (options.footerButtons){
    const footerButtons = _createFooterButtons(options.footerButtons);
    domElModalContent.appendChild(footerButtons);
  }

  const closeModalListener = event => {
    if (event.target.dataset.modal_close) modal.close();
  }
  domElModal.addEventListener('click', closeModalListener);

  const modal = {

    domElModal,

    open() {
      if(destroyed) return console.log('modal is destroyed...');
      domElModal.classList.add('open');
    },
    close() {
      options.onCloseModal();
      domElModal.classList.remove('open');
    },
    destroy() {
      domElModal.parentNode.removeChild(domElModal);
      domElModal.removeEventListener('click', closeModalListener)
      destroyed = true;
    },
    setContent(options) {
      if(!options) return;
      for(const opt of options) {
        if(opt.target === 'data-modal_input') {
          domElModal.querySelector(`[${opt.target}=${opt.value}]`).value = opt.content;
        }else{
          domElModal.querySelector(`[${opt.target}=${opt.value}]`).innerHTML = opt.content;
        }
      }
    },
  }
  return modal;
}
