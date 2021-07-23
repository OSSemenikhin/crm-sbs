//  иконка для кнопки "удалить клиента"
const delSvg = `
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 2C4.682 2 2 4.682 2 8C2 11.318 4.682 14 8 14C11.318 14 14 11.318 14 8C14 4.682 11.318 2 8 2ZM8 12.8C5.354 12.8 3.2 10.646 3.2 8C3.2 5.354 5.354 3.2 8 3.2C10.646 3.2 12.8 5.354 12.8 8C12.8 10.646 10.646 12.8 8 12.8ZM10.154 5L8 7.154L5.846 5L5 5.846L7.154 8L5 10.154L5.846 11L8 8.846L10.154 11L11 10.154L8.846 8L11 5.846L10.154 5Z" fill="#B0B0B0"></path>
  </svg>
`;


// GET DATA FROM SERVER
// function get clients Arr from server
async function getClientsArr(value) {
  let url;
  if (!value) url = 'http://localhost:3000/api/clients';
  if (value) url = `http://localhost:3000/api/clients?search=${value}`;

  const getClients = await fetch(`${url}`);
  const getClientsArr = await getClients.json();
  let clientsArr = [...getClientsArr];

  // create obj metod for create full client name with first letter
  for (const client of clientsArr) {
    client.fullName = () => nameToUpperCase(client);
  }
  return clientsArr;
}


// функция для отложенного действия
// (для ограничения колличества запросв на сервер из формы поиска по таблице)
function debounce(func, wait, immediate) {
  let timeout;
  return function executedFunction() {
    const context = this;
    const args = arguments;
    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    }
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  }
}




// ПРИЛОЖЕНИЕ

document.addEventListener('DOMContentLoaded', async () => {

  // функция, вызывающая модельное окно с формой и информацией о клиенте
  // принимает в качестве аргументов
  // либо объект с клиентом,
  // либо хэш страницы (ид клиента)
  function _openChangeClientData(client, hash) {
    let nowClient;

    // находим клиента
    for (const c of clientsArr) {
      if (client && c.id === client.id) {
        nowClient = c;
      } else if (hash && hash === c.id) {
        nowClient = c;
      }
    }


    const contactsList = document.querySelector('.modal-body-contactsList__wrap');
    contactsList.classList.remove('active');

    const saveClientButton = document.querySelector('[data-button="save"]');
    saveClientButton.setAttribute('data-method', 'PATCH');
    saveClientButton.setAttribute('data-client', nowClient.id);
    const deleteClientButton = document.querySelector('.delete__button');
    deleteClientButton.classList.remove('__hiden');
    const cancelClientButton = document.querySelector('[data-button="cancel"]');
    cancelClientButton.classList.add('__hiden');

    const addButton = document.querySelector('.modal-contactsList__newContact');
    if (addButton.classList.contains('__hiden')) addButton.classList.remove('__hiden');

    const targetLable = 'data-modal_lable';
    const targetInput = 'data-modal_input';


    // обращаемся к методу плагина модального окна, для  вывода информации о клиенте
    modalWithForm.setContent([{
        target: 'data-modal_header',
        value: 'title',
        content: 'Изменить данные',
      },
      {
        target: 'data-modal_header',
        value: 'id',
        content: `ID: ${nowClient.id}`,
      },
      {
        target: targetInput,
        value: 'name',
        content: table.getName(nowClient, 1),
      },
      {
        target: targetInput,
        value: 'surname',
        content: table.getName(nowClient, 2),
      },
      {
        target: targetInput,
        value: 'lastName',
        content: table.getName(nowClient, 3),
      },
      {
        target: targetLable,
        value: 'surname',
        content: 'Фамилия*',
      },
      {
        target: targetLable,
        value: 'name',
        content: 'Имя*',
      },
      {
        target: targetLable,
        value: 'lastName',
        content: 'Отчество',
      },
      {
        target: 'data-modal_contacts',
        value: 'path',
        content: '',
      },
    ]);
    for (const contact of nowClient.contacts) modalWithForm.contacts.addContact(contact);
    if (nowClient.contacts.length >= 1) {
      contactsList.classList.add('active');
    }
    if (nowClient.contacts.length >= 10) addButton.classList.add('__hiden');


    modalWithForm.form.removeAllErrors();
    modalWithForm.open();
  }

  const table = {

    element: document.querySelector('#table'),

    getDateForDisplay(clientDate) {

      const date = new Date(clientDate);
      const optDate = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      }
      const optTime = {
        hour: 'numeric',
        minute: 'numeric',
      }
      const dispDate = date.toLocaleString('ru', optDate);
      const dispTime = date.toLocaleString('ru', optTime);
      return {
        dispDate,
        dispTime,
      }
    },
    getName(client, a = 4) {
      const clientName = client.name.slice(0, 1).toUpperCase() + client.name.slice(1);
      if (a === 1) return clientName;
      const clientSurname = client.surname.slice(0, 1).toUpperCase() + client.surname.slice(1);
      if (a === 2) return clientSurname;
      const clientLastname = client.lastName.slice(0, 1).toUpperCase() + client.lastName.slice(1);
      if (a === 3) return clientLastname;
      const clientFullName = `${clientSurname} ${clientName} ${clientLastname}`;
      if (a === 4) return clientFullName;
    },
    createContactsList(contacts) {
      const list = document.createElement('ul');
      for (const contact of contacts) {
        let socType;
        if (contact.type === 'Телефон') {
          socType = 'tel';
        } else if (contact.type === 'Email') {
          socType = 'email';
        } else if (contact.type === 'Vk') {
          socType = 'vk';
        } else if (contact.type === 'Facebook') {
          socType = 'fb';
        } else {
          socType = 'another';
        }
        const element = /* HTML*/ `
          <li class="table-row-item-contacts__item contacts__${socType} __popupParent">
            <span class="table-row-item-contacts__info __popup">
              ${contact.type}: ${contact.value}
            </span>
          </li>
        `;
        list.innerHTML += element;
      }
      return list.innerHTML;
    },
    createLinkOrButton(options, link) {
      let button;
      button = link ? document.createElement('a') : document.createElement('button');
      // const button = document.createElement('button');
      button.classList.add(options.className);
      button.innerHTML = options.text;
      if (options.attrs) {
        for (const attr of options.attrs) {
          button.setAttribute(attr.type, attr.value);
        }
      }
      button.addEventListener('click', options.onClick)
      return button;
    },
    createTableRow(client) {
      const row = document.createElement('tr');
      row.classList.add('table-row');
      row.setAttribute('id', client.id);
      row.setAttribute('data-table', 'row');

      const tdClass = 'table-row-item';
      const createdAtDate = this.getDateForDisplay(client.createdAt);
      const updateAtDate = this.getDateForDisplay(client.updatedAt);

      const contactsMoreButton = /*HTML*/ `
        <button class="${tdClass}-contacts__button" data-button="moreContacts">+${client.contacts.length - 4}</button>
      `

      const rowContent = /*HTML*/ `
        <tr class="table-row" id="${client.id}">
          <td class="${tdClass}">${client.id}</td>
          <td class="${tdClass}">
            ${this.getName(client, 4)}
          </td>
          <td class="${tdClass}">
            <span class="${tdClass}--dark">
              ${createdAtDate.dispDate}
            </span>
            <span class="${tdClass}--opacity">
              ${createdAtDate.dispTime}
            </span>
          </td>
          <td class="${tdClass}">
            <span class="${tdClass}--dark">
              ${updateAtDate.dispDate}
            </span>
            <span class="${tdClass}--opacity">
              ${updateAtDate.dispTime}
            </span>
          </td>
          <td class="${tdClass}">
            <ul class="${tdClass}-contacts__list ${client.contacts.length > 5 ? "_overLoad" : ""}">
              ${table.createContactsList(client.contacts, tdClass)}
              ${client.contacts.length > 5 ? contactsMoreButton : ""}
            </ul>
          </td>
          </tr>
          `;

      const buttonsWrap = document.createElement('td');
      buttonsWrap.classList.add(tdClass);

      const changeButton = this.createLinkOrButton({
        className: `${tdClass}__button`,
        text: 'Изменить',
        attrs: [{
            type: 'data-button_change',
            value: client.id,
          },
          {
            type: 'href',
            value: `#${client.id}`,
          },
        ],
        onClick() {
          _openChangeClientData(client);
        },
      }, true);
      buttonsWrap.append(changeButton);

      const deleteButton = this.createLinkOrButton({
        className: `${tdClass}__button`,
        text: 'Удалить',
        attrs: [{
          type: 'data-button_delete',
          value: client.id,
        }, ],
      });
      buttonsWrap.append(deleteButton);

      const copyLinkWrap = document.createElement('td');
      copyLinkWrap.classList.add(tdClass);

      const copyLinkButton = this.createLinkOrButton({
        className: `${tdClass}__copyLink`,
        text: /*HTML */ `
          <span class="__popup">
            Копировать сслыку
          </span>
          <input class="clientLink--hidden" type="text" value="${window.location.host}#${client.id}">
        `,
        attrs: [{
            type: 'data-button',
            value: 'copyLink',
          },
          {
            type: 'data-copy',
            value: `${client.id}`,
          },
        ],
      }, true);
      copyLinkButton.classList.add('__popupParent');
      copyLinkWrap.append(copyLinkButton);

      row.innerHTML = rowContent;
      row.append(buttonsWrap, copyLinkWrap);
      this.element.append(row);
    },

    changeTableRowData(client) {
      const changeDataRow = document.getElementById(client.id);
      const fullName = table.getName(client);
      changeDataRow.children[1].innerHTML = fullName;
      const clientDateLastChange = table.getDateForDisplay(client.updatedAt);
      changeDataRow.children[3].children[0].textContent = clientDateLastChange.dispDate;
      changeDataRow.children[3].children[1].textContent = clientDateLastChange.dispTime;
      const oldContactsList = changeDataRow.children[4].children[0];
      if (oldContactsList) oldContactsList.childNodes.forEach(el => el.remove())
      const contactsList = table.createContactsList(client.contacts);
      oldContactsList.innerHTML = contactsList;
    },


    sortClients(clients, click, type) {
      // inner function delete table and create new table
      function _deleteTableAndCreateNewTable() {
        const tableRows = document.querySelectorAll('[data-table="row"]');
        tableRows.forEach(el => {
          el.remove();
        });
        for (const client of clients) {
          table.createTableRow(client);
        }
      }
      switch (type) {
        case 'id':
          clients = clients.sort(function (a, b) {
            return a.id - b.id;
          });
          break;
        case 'name':
          clients = clients.sort(function (a, b) {
            const nameA = (a.surname + a.name + a.lastName).toLowerCase();
            const nameB = (b.surname + b.name + b.lastName).toLowerCase();
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return 0;
          });
          break;
        case 'createdAt':
          clients = clients.sort(function (a, b) {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateA - dateB;
          });
          break;
        case 'updatedAt':
          clients = clients.sort(function (a, b) {
            const dateA = new Date(a.updatedAt);
            const dateB = new Date(b.updatedAt);
            return dateA - dateB;
          });
          break;
      }
      if (!click) clients = clients.reverse();
      _deleteTableAndCreateNewTable();
    },
  }


  // // check click for sort table
  // defult true
  let clickSort = true;
  // // last element`s type for sort table
  // defult 'id'
  let lastElementTargetSort = 'id';

  table.element.parentElement.classList.add('_loading');
  const arr = await getClientsArr();
  let clientsArr = [...arr];
  table.element.parentElement.classList.remove('_loading');



  const delClient = $$.modal({
    element: '#delClient',
    elementContent: '.modal-delClient-content',
    footerButtons: [{
        text: 'Удалить',
        classList: [
          'modal__delClient',
          'modal__button',
        ],
        attr: {
          'data-button': 'delete',
        },
        async onClick(e) {
          e.preventDefault();
          modalWithForm.domElModal.classList.add('_loading');
          const resp = await modalWithForm.client.clientAction({}, e.target.dataset.method, e.target.dataset.client);
          if (resp) delClient.close();
          modalWithForm.domElModal.classList.remove('_loading');
        },
      },
      {
        text: 'Отмена',
        classList: [
          'modal__delClient',
          'cancel__button',
        ],
        onClick(e) {
          delClient.close();
        },
      },
    ],
    onCloseModal() {
      const state = {
        foo: ''
      };
      history.pushState(state, '', '#');
    }
  });

  const modalWithForm = $$.modal({
    element: '#modalWithForm',
    elementContent: '.modal-content',
    footerButtons: [{
        text: 'Сохранить',
        classList: [
          'modal__saveButton',
          'modal__button',
        ],
        attr: {
          'data-button': 'save',
          'type': 'submit',
          'form': 'client__form',
        },
        async onClick(e) {
          e.preventDefault();

          console.log(modalWithForm.domElModal);

          const oldValidErrors = document.querySelector('[data-modal_error="validate"]');
          oldValidErrors.textContent = '';

          const validateErrors = modalWithForm.form.validate();

          if(validateErrors === 0) {
            modalWithForm.domElModal.classList.add('_loading');
            const newClientData = modalWithForm.client.getNewClientData();
            let id;
            if (e.target.dataset.method === "PATCH") id = e.target.dataset.client;
            const resp = await modalWithForm.client.clientAction(newClientData, e.target.dataset.method, id);
            if (resp) modalWithForm.close();
            modalWithForm.domElModal.classList.remove('_loading');
          }
        },
      },
      {
        text: 'Удалить клиента',
        classList: [
          'modal__delClient',
          'delete__button',
        ],
        // attr: {
        //   'data-button': 'delete',
        // },
        onClick(e) {
          e.preventDefault();
          delClient.open();
        },
      },
      {
        text: 'Отмена',
        classList: [
          'modal__delClient',
          'cancel__button',
        ],
        attr: {
          'data-button': 'cancel',
        },
        onClick(e) {
          modalWithForm.close();
        },
      },
    ],
    onCloseModal() {
      const state = {
        foo: ''
      };
      history.pushState(state, '', '#')
    }
  });

  modalWithForm.contacts = {
    addContact(options) {
      const list = document.querySelector('.modal-body-contactsList');

      const wrap = document.createElement('div');
      wrap.classList.add('modal-contactsList__contact');
      wrap.setAttribute('data-modal', 'contact');

      const selectWrap = document.createElement('div');
      selectOptions.id = selectOptions.generateSelectMenuId();
      selectWrap.setAttribute('id', `${selectOptions.id}`);
      wrap.append(selectWrap);

      const lable = document.createElement('label');
      lable.classList.add('modal-contactsList-contact__lable');

      const errorDataContactText = document.createElement('span');
      errorDataContactText.classList.add('modal-contactsList-contact__contactError');
      lable.setAttribute('data-modal_lable', 'contact');
      lable.append(errorDataContactText);

      const input = document.createElement('input');
      input.classList.add('modal-contactsList-contact__input');
      input.setAttribute('type', 'tel');
      input.setAttribute('data-modal_req', 'true');
      input.setAttribute('data-contacts_input', `${selectOptions.id}`);
      input.setAttribute('data-modal_input', `otherContact`);
      input.addEventListener('input', () => {
        modalWithForm.form.removeError(input);
      });
      lable.append(input);
      wrap.append(lable);

      const button = document.createElement('button');
      button.classList.add('modal-contactsList-contact__delButton');

      button.addEventListener('click', e => {
        select.destroy(e);
        modalWithForm.contacts.delContact(wrap);
        let checkContactsLength = document.querySelectorAll('.modal-contactsList__contact');
        if (checkContactsLength.length < 10) {
          const element = document.querySelector('[data-button=addContact');
          element.classList.remove('__hiden');
        };
      });

      button.innerHTML = /*HTML*/ `
        ${delSvg}
        <span class="__popupParent">
          <span class="__popup">
            Удалить контакт
          </span>
        </span>
      `;

      if (options) {
        if (options.type === 'Телефон' || options.type === 'доп.Телефон') {
          selectOptions.current = 1;
          input.setAttribute('type', 'tel');
        } else if (options.type === 'Email') {
          selectOptions.current = 2;
          input.setAttribute('type', 'email');
        } else if (options.type === 'Vk') {
          selectOptions.current = 3;
          input.setAttribute('type', 'url');
        } else if (options.type === 'Facebook') {
          selectOptions.current = 4;
          input.setAttribute('type', 'url');
        } else {
          selectOptions.current = options.type;
          input.setAttribute('type', 'text');
        }
        input.value = options.value;
      } else {
        selectOptions.current = 1;
      }
      wrap.append(button);
      list.append(wrap);
      const select = $$.select(selectOptions);

      return {
        wrap,
        input,
        button,
        select,
      };
    },

    delContact(element) {
      const checkContactsLength = document.querySelectorAll('.modal-contactsList__contact');
      if (checkContactsLength.length === 1) {
        const contactsList = document.querySelector('.modal-body-contactsList__wrap');
        contactsList.classList.remove('active');
      }
      element.remove();
    },
  }

  modalWithForm.client = {
    getNewClientData() {
      const contactsArr = document.querySelectorAll('[data-modal="contact"]');
      const inputName = document.querySelector('[data-modal_input="name"]');
      const inputSurname = document.querySelector('[data-modal_input="surname"]');
      const inputLastname = document.querySelector('[data-modal_input="lastName"]');

      const newContactsArr = [];
      contactsArr.forEach(e => {
        const contact = {};
        const contactValue = e.querySelector('[data-contacts_input]');
        const contactType = e.querySelector('[data-scurrent]').textContent;
        const otherContactInput = e.querySelector('[data-sother_input="input"]');
        contact.type = contactType;
        if (otherContactInput) {
          contact.type = otherContactInput.value.trim();
          contact.type = contact.type.slice(0, 1).toUpperCase() + contact.type.slice(1);
        };
        contact.value = contactValue.value.trim();
        newContactsArr.push(contact);
      });
      const data = {};
      data.name = inputName.value.trim().toLowerCase();
      data.surname = inputSurname.value.trim().toLowerCase();
      data.lastName = inputLastname.value.trim().toLowerCase();
      data.contacts = newContactsArr;
      return data;
    },

    async clientAction(data, method, id) {
      function _checkResponse(response) {
        const textElement = document.querySelector('[data-modal_error="server"]');
        if (response && (response.status === 200 || response.status === 201)) {

        } else if (response && (response.status === 422 || response.status === 404 || response.status >= 500)) {
          textElement.textContent = 'Ошибка: ' + response.statusText;
        } else {
          textElement.textContent = 'Что-то пошло не так...';
        };
      };

      let receivedUrl;
      switch (method) {
        case 'POST':
          receivedUrl = 'http://localhost:3000/api/clients/';
          break;
        case 'PATCH':
          receivedUrl = `http://localhost:3000/api/clients/${id}`;
          break;
        case 'DELETE':
          const response = await fetch(`http://localhost:3000/api/clients/${id}`, {
            method: 'DELETE',
          });
          if (response) {
            if (response.status === 200 || response.status === 201) {
              // delete client`s row from table
              const clientRow = document.getElementById(id);
              clientRow.remove();
              // delete client from variable with data from server
              for (const client of clientsArr) {
                if (client.id === id) {
                  const i = clientsArr.indexOf(client);
                  clientsArr.splice(i, 1);
                };
              };
              return true;
            }
            checkResponse(response);
          } else {
            checkResponse();
          };
          return false;
      }

      const response = await fetch(receivedUrl, {
        method: method,
        body: JSON.stringify({
          name: data.name,
          surname: data.surname,
          lastName: data.lastName,
          contacts: data.contacts,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response) {
        // check response status
        //  if response status 200 or 201
        if (response.status === 200 || response.status === 201) {

          // get response with client data
          const newClient = await response.json();
          switch (method) {
            case 'POST':
              table.createTableRow(newClient);
              clientsArr.push(newClient);
              break;
            case 'PATCH':
              table.changeTableRowData(newClient);
              // clientsArr = await getClientsArr();
              for (const client of clientsArr) {
                if (client.id === id) {
                  const i = clientsArr.indexOf(client);
                  clientsArr.splice(i, 1, newClient);
                }
              }
              // sortClients(clientsArr, clickSort, lastElementTargetSort);
              break;
          }
          return true;
        }
        _checkResponse(response)
      } else {
        _checkResponse();
      };
      return false;
    },
  }

  modalWithForm.form = {
    validate() {
      let errors = 0;
      let errorText = '';
      const formReq = modalWithForm.domElModal.querySelectorAll(`[data-modal_req]`);
      const errorTextElement = document.querySelector(`[data-modal_error="validate"]`);

      formReq.forEach(input => {
        modalWithForm.form.removeError(input);
        const inputName = input.dataset.modal_input;

        if (input.type === 'email') {
          if (modalWithForm.form.emailTest(input)) {
            modalWithForm.form.addError(input);
            errorText += /*HTML*/`<span class= "_validError email__error" data-modal_error="${input.dataset.contacts_input}">- Некоррекный email (укажите email: myEmail@example.com)</span>`;
            errors++;
          }
        }
        if (input.type === 'tel') {
          if (modalWithForm.form.phoneTest(input)) {
            modalWithForm.form.addError(input);
            errorText += /*HTML*/`<span class= "_validError tel__error" data-modal_error="${input.dataset.contacts_input}">- Некоррекный телефон (укажите телефон: 89999999999)</span>`;
            errors++;
          }
        }
        if (input.type === 'url') {
          if (modalWithForm.form.urlTest(input)) {
            modalWithForm.form.addError(input);
            errorText += /*HTML*/`<span class= "_validError url__error" data-modal_error="${input.dataset.contacts_input}">- Некоррекный url адрес(пример: example.com/myaccount)</span>`;
            errors++;
          }
        }
        if (input.type === 'text') {
          if (input.value.trim().length < 2) {
            modalWithForm.form.addError(input);
            if (inputName === 'name') errorText += /*HTML*/`<span class= "_validError name__error" data-modal_error="${input.dataset.contacts_input}">- Слишком короткое имя</span>`;
            if (inputName === 'surname') errorText += /*HTML*/`<span class= "_validError surname__error" data-modal_error="${input.dataset.contacts_input}">- Слишком короткая фамилия</span>`;
            if (inputName === 'other') errorText += /*HTML*/`<span class= "_validError other__error" data-modal_error="${input.dataset.contacts_input}">- Слишком короткое название контакта</span>`;
            if (inputName === 'otherContact') errorText += /*HTML*/`<span class= "_validError other__error" data-modal_error="${input.dataset.contacts_input}">- Укажите контакт</span>`;
            errors++;
          }
        }
      });
      errorTextElement.innerHTML = errorText;
      return errors;
    },
    emailTest(input) {
      return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(input.value.trim());
    },
    urlTest(input) {
      return !/(^https?:\/\/)?[a-z0-9~_\-\.]+\.[a-z]{2,9}(\/|:|\?[!-~]*)?$/i.test(input.value.trim());
    },
    phoneTest(input) {
      return !/^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/.test(input.value.trim());
    },
    addError(input) {
      input.parentElement.classList.add('__error');
      input.classList.add('__error');
    },
    removeError(input) {
      input.parentElement.classList.remove('__error');
      input.classList.remove('__error');
      const textError = document.querySelector(`[data-modal_error="${input.dataset.contacts_input}"]`);
      if(textError)textError.remove();
    },
    removeAllErrors() {
      const errors = document.querySelectorAll('.__error');
      if(errors) errors.forEach(el => el.classList.remove('__error'));
      const textErrors = document.querySelectorAll(`.modal__textError`);
      if(textErrors)textErrors.forEach( el => el.innerHTML = '');
    },

  }

  // Настройки для плагина селкт меню
  const selectOptions = {
    // element: selectOptions.generateSelectMenuId(),

    // генерируем ид
    generateSelectMenuId() {
      const abc = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let id = '';
      while (id.length < 6) {
        const random = abc[Math.floor(Math.random() * abc.length)];
        id += random
      };
      if (document.querySelector(`#${id}`)) selectOptions.generateSelectMenuId();
      return id;
    },

    // вsносим в отдельную функцию действие по клику на пункт меню
    actionItemsTarget(el, type) {
      const target = document.querySelector(`[data-contacts_input=${el.dataset.starget}]`);
      target.setAttribute('type', type);
      // target.setAttribute('data-modal_req', type);
    },

    // список итемов селект меню
    items: [{
        name: 'Телефон',           // имя
        noGroupHide: true,         // если true то итем не скрывается при скрытии его группы итемов
        secondName: 'доп.Телефон', // если noGroupHide: true, то при указании secondName вместо скрытия итем получает другое имя

        // фунцкия выполяется по клику на итем
        onClick(e) {
          selectOptions.actionItemsTarget(e.target, 'tel');
        },
      },
      {
        name: 'Email',
        onClick(e) {
          selectOptions.actionItemsTarget(e.target, 'email');
        },
      },
      {
        name: 'Vk',
        onClick(e) {
          selectOptions.actionItemsTarget(e.target, 'url');
        },
      },
      {
        name: 'Facebook',
        onClick(e) {
          selectOptions.actionItemsTarget(e.target, 'url');
        },
      },
    ],

    // итем с возможностью ввода текста
    other: {
      active: true,         // активируем
      noGroupHide: true,
      name: 'Другое...',
      onClick(e) {
        const selectMenuId = e.target.parentElement.parentElement.parentElement.parentElement.id;

        selectOptions.actionItemsTarget(e.target, 'text');
        const rootContactElement = document.querySelector(`#${e.target.dataset.starget}`);
        const headerElement = rootContactElement.querySelector('.selectMenu__header');
        headerElement.classList.add('_otherInput');

        const label = document.createElement('label');
        label.classList.add('selectMenu__otherLable');

        const textError = document.createElement('span');
        textError.classList.add('modal-contactsList-contact__contactError');
        textError.setAttribute('data-modal_lable', 'other');

        const input = document.createElement('input');
        input.classList.add('selectMenu__textInput');
        input.setAttribute('type', 'text');
        input.setAttribute(`data-sother_input`, `input`);
        input.setAttribute(`data-modal_input`, `other`);
        input.setAttribute('data-modal_req', 'true');
        input.setAttribute('data-contacts_input', `${selectMenuId}Other`);
        // input.addEventListener('input', )

        label.append(textError, input)
        headerElement.append(label);
        // const contactWrap = document.querySelector(`[id="${e.target.dataset.starget}"]`);
        // const otherInput = contactWrap.querySelector(`[data-sother_input="input"]`);
        input.addEventListener('input', () =>{
          modalWithForm.form.removeError(input);
        });
      },
    },

    // скрытие итема из списка при выборе
    hideItem: true,


    // так как на странице много элементов селект-меню
    // группируем итемы разных элементов для скрытия
    groupHideItem: 'modal_group',
  };





  const search = {
    inputEl: document.getElementById('searchInput'),
    searchList: document.querySelector('#searchList'),
    focusedItem: -1,

    listItems(){
      return document.querySelectorAll('.searchList__item');
    },

    itemsAddToSearchList(clientsArr) {
      for(const client of clientsArr) {
        const a = document.createElement('a');
        a.classList.add('searchList__item');
        a.textContent = table.getName(client, 1) + ' ' + table.getName(client, 2);
        a.setAttribute('href', `#${client.id}`)
        a.onmouseover = a.onmouseout = search.handler;
        a.addEventListener('click', e => {
          search.removeSearchedClass();
          const id = e.target.hash.slice(1);
          const row = document.getElementById(id);
          row.classList.add('_searched');
          search.listClose();
        });


        search.searchList.append(a);
      }
    },
    handler(e) {
      if (e.type == 'mouseover') {
        search.unfocusAllItems();
        e.target.classList.add('focused');
      }
      if (e.type == 'mouseout') {
        search.unfocusAllItems();
        search.focusedItem = -1;
      }
    },
    focusItem(index) {
      const list = search.listItems();
      if(!list.length) return false;
      if(index > list.length - 1) return search.focusItem(0);
      if(index < 0) return focusItem(list.length - 1);
      search.focusedItem = index;
      search.unfocusAllItems();
      list[search.focusedItem].classList.add('focused');
    },
    unfocusAllItems(){
      const list = search.listItems();
      list.forEach(item => item.classList.remove('focused'));
    },
    listOpen(){
      search.searchList.classList.add('open');
    },
    listClose(){
      search.searchList.classList.remove('open');
    },
    removeSearchedClass() {
      const lastSearched = document.querySelector('._searched');
      console.log(lastSearched);
      if(lastSearched)lastSearched.classList.remove('_searched');
      if(lastSearched)console.log(lastSearched);
    },
  };
  search.start = debounce(async function () {
    search.focusedItem = -1;
    const value = searchInput.value.trim().toLowerCase();
    search.searchList.innerHTML = '';
    clientsArr = await getClientsArr(value);
    if(value != '') {
      search.itemsAddToSearchList(clientsArr);
      search.listOpen();
    }
    if(value === '') {
      search.listClose();
    }
  }, 500);
  // search.inputEl.addEventListener('click', search.start);
  search.inputEl.addEventListener('input', search.start);
  search.inputEl.addEventListener('input', search.removeSearchedClass);
  search.inputEl.addEventListener('keydown', e => {
    const key = e.key;
    if(key === 'ArrowDown'){
      e.preventDefault;
      search.focusedItem++;
      search.focusItem(search.focusedItem);
    }
    if(key === 'ArrowUp'){
      e.preventDefault;
      if(search.focusedItem > 0) search.focusedItem--;
      else search.focusedItem = search.listItems().length - 1;
      search.focusItem(search.focusedItem);
    }
    if(key === 'Escape'){
      search.listClose();
    }
    if(key === 'Enter'){}
    // console.log(e)
  });


  if (window.location.hash) {
    _openChangeClientData(null, window.location.hash.slice(1));
  }

  table.sortClients(clientsArr, true, 'id')




  // ADD EVENT LISTENER 'CLICK' TO DOCUMENT

  document.addEventListener('click', (e) => {
    const element = e.target;

    // close search form searched list
    if(!element.classList.contains('searchForm__input')) search.listClose();
    else search.listOpen();


    // to document for dataset`s targets
    if (element.dataset) {
      // for data-set_button group
      if (element.dataset.button) {

        const contactsList = document.querySelector('.modal-body-contactsList__wrap');

        switch (element.dataset.button) {
          // button 'изменить' open modal for add new client
          case 'addClient':
            modalWithForm.form.removeAllErrors();
            const saveClientButton = document.querySelector('[data-button="save"]');
            saveClientButton.setAttribute('data-method', 'POST');
            const deleteClientButton = document.querySelector('.delete__button');
            deleteClientButton.classList.add('__hiden');
            const cancelClientButton = document.querySelector('[data-button="cancel"]');
            cancelClientButton.classList.remove('__hiden');
            const addButton = document.querySelector('.modal-contactsList__newContact');
            if (addButton.classList.contains('__hiden')) addButton.classList.remove('__hiden');
            if (contactsList.classList.contains('active')) contactsList.classList.remove('active');
            const targetLable = 'data-modal_lable';
            const targetInput = 'data-modal_input';
            modalWithForm.setContent([{
                target: 'data-modal_header',
                value: 'title',
                content: 'Новый клиент',
              },
              {
                target: 'data-modal_header',
                value: 'id',
                content: '',
              },
              {
                target: targetLable,
                value: 'surname',
                content: '',
              },
              {
                target: targetLable,
                value: 'name',
                content: '',
              },
              {
                target: targetLable,
                value: 'lastName',
                content: '',
              },
              {
                target: 'data-modal_contacts',
                value: 'path',
                content: '',
              },
              {
                target: targetInput,
                value: 'name',
                content: '',
              },
              {
                target: targetInput,
                value: 'surname',
                content: '',
              },
              {
                target: targetInput,
                value: 'lastName',
                content: '',
              },
            ]);
            modalWithForm.open();
            break;

            // to contacts add contact button
          case 'addContact':
            modalWithForm.contacts.addContact();
            if (!contactsList.classList.contains('active')) contactsList.classList.add('active');
            let checkContactsLength = document.querySelectorAll('.modal-contactsList__contact');
            if (checkContactsLength.length >= 10) element.classList.add('__hiden');
            if (checkContactsLength.length <= 0) contactsList.classList.remove('active');
            break;

            // to contacts list more button
          case 'moreContacts':
            element.classList.add('__hiden');
            element.parentNode.classList.remove('_overLoad');
            break;

          case 'copyLink':
            const id = element.dataset.copy;
            const text = document.querySelector(`[value="${window.location.host}#${id}"]`);
            window.navigator.clipboard.writeText(text.value);
            const message = element.querySelector('.__popup');
            message.textContent = 'Скопировано'
            const showMessage = () => {
              message.textContent = 'Копировать сслыку';
            }
            setTimeout(showMessage, 1000)
            break;
        }
      }
      // button 'удалить' open modal for delete client
      if (element.dataset.button_delete) {
        const deleteClientButton = document.querySelector('[data-button="delete"]');
        if (deleteClientButton.classList.contains('__hiden')) deleteClientButton.classList.remove('__hiden');
        deleteClientButton.setAttribute('data-method', 'DELETE');
        deleteClientButton.setAttribute('data-client', element.dataset.button_delete);
        delClient.open();
      }
    }
    if (element.id) {
      function _addSortClass(type) {
        document.querySelector('._sortActive').classList.remove('_sortActive');
        element.classList.add('_sortActive');
        clickSort = lastElementTargetSort === type ? !clickSort : true;
        lastElementTargetSort = type;
        clickSort ? element.classList.add('_sortDown') : element.classList.remove('_sortDown');
      }
      switch (element.id) {
        case 'id':
          _addSortClass(element.id);
          table.sortClients(clientsArr, clickSort, element.id);
          break;
        case 'name':
          _addSortClass(element.id);
          table.sortClients(clientsArr, clickSort, element.id);
          break;
        case 'createdAt':
          _addSortClass(element.id);
          table.sortClients(clientsArr, clickSort, element.id);
          break;
        case 'updatedAt':
          _addSortClass(element.id);
          table.sortClients(clientsArr, clickSort, element.id);
          break;
      }
    }
  });


  const inputsFormValidateElements = document.querySelectorAll('[data-modal_req]');
  inputsFormValidateElements.forEach(el => {
    el.addEventListener('input', () => {
      modalWithForm.form.removeError(el);
    });
  });

  // Проверяем событие изменения хэша страницы
  window.addEventListener("hashchange", (e) => {
    _openChangeClientData(null, window.location.hash.slice(1));
  });
});
