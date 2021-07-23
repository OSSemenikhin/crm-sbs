function _checkCurrentValue(value) {
  const currentElements = document.querySelectorAll(`[data-scurrent]`);
  let check = false;
  currentElements.forEach(el => {
    if((el.dataset.svalue === value) && (el.dataset.svalue === el.textContent)) check = true;
  });
  return check;
}

function _createItems(item, id, hideItem, groupHideItem, noGroupHide) {

  const newItem = document.createElement('li');
  newItem.classList.add('selectMenu__item');
  newItem.setAttribute('data-starget', `${id}`);
  newItem.setAttribute('data-svalue', `${item.name}`);
  newItem.textContent = item.name;

  if (groupHideItem) {
    const hideCheck = document.querySelector(`[data-${groupHideItem}="${item.name}"]`);
    if (noGroupHide) newItem.setAttribute('data-no_groupe_hide', `${item.name}`);
    if (hideCheck && hideCheck.classList.contains('selectGroupHide') && !noGroupHide) newItem.classList.add('selectGroupHide');
    if (hideCheck && noGroupHide && _checkCurrentValue(item.name)) newItem.textContent = item.secondName;
    if (hideCheck && noGroupHide && !_checkCurrentValue(item.name)) groupHideItems(groupHideItem, item);
  }


  if (hideItem) {
    const newOnClick = (e) => {

      const selectElement = document.getElementById(id);
      const checkInput = selectElement.querySelector('[data-sother_input="input"]');
      if (checkInput) {
        const headerElement = selectElement.querySelector('.selectMenu__header');
        headerElement.classList.remove('_otherInput');
        checkInput.remove();
      }
      if (e.target.dataset && groupHideItem) {
          groupShowtems(groupHideItem, e.target.dataset.starget, id);
      }
      const hideItem = () => {
        const itemHide = selectElement.querySelector('.item_hide');
        if (itemHide) itemHide.classList.remove('item_hide');
        e.target.classList.add('item_hide');
        if (groupHideItem) groupHideItems(groupHideItem, item);
      }
      setTimeout(hideItem, 300);
      item.onClick(e);
    }

    newItem.addEventListener('click', newOnClick);
    return newItem;
  }

  newItem.addEventListener('click', item.onClick);
  return newItem;
}

function _createSelect(options) {

  const element = document.querySelector(`#${options.id}`);

  if (element) {
    const _addClasses = (classList, element) => classList.forEach(elClass => element.classList.add(elClass));

    element.classList.add('selectMenu');
    if (options.classAdd && options.classAdd.element) _addClasses(options.classAdd.element, element);


    const wrap = document.createElement('div');
    wrap.classList.add('selectMenu__wrap');
    if (options.classAdd && options.classAdd.wrap) _addClasses(options.classAdd.wrap, wrap);

    //create selectMenuHeader and append it to selectMenu
    const header = document.createElement('div');
    header.classList.add('selectMenu__header');
    if (options.classAdd && options.classAdd.header) _addClasses(options.classAdd.header, header);

    // create element for display choose of select menu
    const current = document.createElement('span');
    current.classList.add('selectMenu__currentValue');
    if (options.classAdd && options.classAdd.current) _addClasses(options.classAdd.current, current);
    current.setAttribute('data-scurrent', options.id);


    const listWrap = document.createElement('div');
    listWrap.classList.add('selectMenu__listWrap');
    if (options.classAdd && options.classAdd.listWrap) _addClasses(options.classAdd.listWrap, listWrap);

    const list = document.createElement('ul');
    list.classList.add('selectMenu__list');
    if (options.classAdd && options.classAdd.list) _addClasses(options.classAdd.list, list);

    const items = options.items;
    for (const item of items) {
      const newItem = _createItems(item, options.id, options.hideItem, options.groupHideItem, item.noGroupHide);
      if (options.classAdd && options.classAdd.item) _addClasses(options.classAdd.item, newItem);
      if (options.hideItem) {
        if (options.current && (typeof options.current === 'number')) {
          if (items[options.current - 1].name === item.name) {
            newItem.classList.add('item_hide');
            if (options.groupHideItem && (!item.noGroupHide)) {
              const checkGroup = document.querySelectorAll(`[data-${options.groupHideItem}="${item.name}"]`);
              newItem.classList.add('selectGroupHide');
              if (checkGroup) {
                checkGroup.forEach(el => {
                  el.classList.add('selectGroupHide');
                });
              }
            }
          }
        }
      }
      if (options.groupHideItem) {
        const checkGroup = document.querySelector(`[data-${options.groupHideItem}="${item.name}"]`);
        if (checkGroup && checkGroup.classList.contains('selectGroupHide')) {
          newItem.classList.add('selectGroupHide');
        }
        newItem.setAttribute(`data-${options.groupHideItem}`, item.name);
      }
      list.append(newItem);
    }
    // _createItems();
    if (options.other && options.other.active) {
      const newItem = _createItems(options.other, options.id, options.hideItem, options.groupHideItem, options.other.noGroupHide);
      newItem.setAttribute(`data-sother_input`, `list_item`);
      if (options.other.class) newItem.classList.add(options.other.class);
      if (options.classAdd && options.classAdd.item) _addClasses(options.classAdd.item, newItem);
      // if (options.other.dataSet) newItem.setAttribute(`data-${options.other.dataSet.dataSetName}`, `${options.other.dataSet.dataSetValue}`);
      list.append(newItem);
    }

    if (options.current) {
      if (typeof options.current === 'string') current.textContent = options.current;
      if (typeof options.current === 'number') {
        if ((options.current > 0) && (options.current <= options.items.length)) {
          current.textContent = list.children[options.current - 1].textContent;
          current.setAttribute(`data-svalue`, `${list.children[options.current - 1].dataset.svalue}`);
        } else {
          current.textContent = list.children[0].name;
          current.setAttribute(`data-svalue`, `${list.children[options.current - 1].dataset.svalue}`);
          // current.textContent = options.items[0].name;
        }
      }
    }
    header.append(current);
    listWrap.append(list);
    wrap.append(header, listWrap);
    element.append(wrap);

    return {
      wrap,
      header,
      current,
      list,
    }
  } else {
    console.log('_createSelect !element')
  }

}

function groupHideItems(groupHideItem, item) {
  const selectElements = document.querySelectorAll(`[data-${groupHideItem}="${item.name}"]`);
  selectElements.forEach(el => {
    if (!el.dataset.no_groupe_hide) el.classList.add('selectGroupHide');
    if(el.dataset.no_groupe_hide && item.secondName){
      el.textContent = item.secondName;
    }
  });
}

function groupShowtems(groupHideItem, id) {
  const selectElement = document.getElementById(id);
  const lastCurrentElement = selectElement.querySelector(`[data-scurrent=${id}]`);
  const hiddenGroup = document.querySelectorAll(`[data-${groupHideItem}="${lastCurrentElement.dataset.svalue}"]`);
  if (hiddenGroup) {
    hiddenGroup.forEach(el => {
      if (!el.dataset.no_groupe_hide) el.classList.remove('selectGroupHide');
      if(el.dataset.no_groupe_hide){
        if (lastCurrentElement.dataset.svalue === lastCurrentElement.textContent) {
          el.textContent = lastCurrentElement.dataset.svalue;
        }
      }
    });
  }
}

$$.select = function (options) {
  let destroyed = false;
  const domElSelect = _createSelect(options);
  const closeSelectListener = event => {
    if (event.target.dataset.starget) {
      const current = document.querySelector(`[data-scurrent=${event.target.dataset.starget}]`);
      current.setAttribute(`data-svalue`, `${event.target.dataset.svalue}`);
      current.textContent = event.target.textContent;
      if (event.target.dataset.sother_input) {
        current.textContent = '';
      }
    }
    if (event.target !== domElSelect.header) {
      select.close();
    } else if (event.target == domElSelect.header) {
      select.open();
    }
  }
  domElSelect.header.addEventListener('click', closeSelectListener);

  const groupHide = groupHideItems;
  const groupShow = groupShowtems;

  const select = {

    id: options.id,

    groupHide,

    groupShow,

    open() {
      if (destroyed) return console.log('Select is destroyed...');
      domElSelect.wrap.classList.add('open');
      domElSelect.list.classList.add('open');
      document.addEventListener('click', closeSelectListener);
    },
    close() {
      domElSelect.wrap.classList.remove('open');
      domElSelect.list.classList.remove('open');
      document.removeEventListener('click', closeSelectListener);
    },
    destroy(e) {
      if(options.groupHideItem){
        groupShowtems(options.groupHideItem, select.id)
      }
      destroyed = true;
      domElSelect.wrap.remove();
      document.removeEventListener('click', closeSelectListener);
      domElSelect.header.addEventListener('click', closeSelectListener);
    },
  }
  return select;
}
