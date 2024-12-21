document.addEventListener('DOMContentLoaded', function () {
  const signOutButton = document.getElementById('sign-out-button');
  const userInfo = document.getElementById('user-info');
  const userNameElement = document.getElementById('user-name');
  const voteButton = document.querySelector('.vote-button');
  const authButtons = document.getElementById('auth-buttons');
  const notification = document.getElementById('notification');
  const notificationMessage = document.getElementById('notification-message');
  const closeButton = document.getElementById('close-notification');

  // Инициализация Google Sign-In
  function initializeGoogleSignIn() {
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
      google.accounts.id.initialize({
        client_id: "847429882483-05f9mev63nq15t1ccilrjbnb27vrem42.apps.googleusercontent.com", // Ваш ID клиента
        callback: handleCredentialResponse,
        auto_prompt: true,
        context: 'signin',
        ux_mode: 'popup',
        itp_support: true,
      });
    } else {
      console.error('Google API не инициализировано.');
      showNotification('error', 'Google API не инициализировано! Попробуйте перезагрузить страницу.');
    }
  }

  // Обработка ответа от Google
  function handleCredentialResponse(response) {
    if (response && response.credential) {
      try {
        const responsePayload = jwt_decode(response.credential);
        console.log('ID: ' + responsePayload.sub);
        console.log('Имя: ' + responsePayload.name);
        console.log('URL изображения: ' + responsePayload.picture);
        console.log('Email: ' + responsePayload.email);

        localStorage.setItem('userName', responsePayload.name);
        localStorage.setItem('userEmail', responsePayload.email);
        checkAuthentication();
        showNotification('success', 'Вы успешно авторизовались!');
      } catch (error) {
        console.error('Ошибка при декодировании данных:', error);
        showNotification('error', 'Ошибка авторизации. Попробуйте еще раз.');
      }
    }
  }

  // Функция для проверки аутентификации
  function checkAuthentication() {
    const userName = localStorage.getItem('userName');
    if (userName) {
      authButtons.style.display = 'none';
      userInfo.style.display = 'flex';
      userNameElement.textContent = userName;
      voteButton.disabled = false;
    } else {
      authButtons.style.display = 'block';
      userInfo.style.display = 'none';
      voteButton.disabled = true;
      userNameElement.textContent = '';
    }
  }

  // Выход из аккаунта
  signOutButton.addEventListener('click', function () {
    localStorage.clear();
    checkAuthentication();
    voteButton.disabled = true;
    showNotification('info', 'Вы успешно вышли из аккаунта.');
  });

  // Включение или отключение кнопки для голосования
  voteButton.addEventListener('click', function (event) {
    event.preventDefault();
    if (localStorage.getItem('userName')) {
      submitForm();
    } else {
      showNotification('error', 'Пожалуйста, войдите в аккаунт, чтобы проголосовать.');
    }
  });

  // Функция для отправки формы голосования
  function submitForm() {
    voteButton.textContent = 'Отправка...';
    voteButton.disabled = true;
    let formData = {};
    const votingForm = document.getElementById('voting-form');
    for (const element of votingForm.elements) {
      if (element.name && element.type !== 'submit') {
        if (element.type === 'radio' && element.checked) {
          formData[element.name] = element.value;
        } else if (element.type !== 'radio') {
          formData[element.name] = element.value;
        }
      }
    }
    formData['email'] = localStorage.getItem('userEmail');
    console.log('Отправляемые данные:', JSON.stringify(formData));

    fetch(votingForm.action, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
    .then(response => {
      if (response.ok) {
        showNotification('success', 'Спасибо за ваш голос!');
        votingForm.reset();
      } else {
        showNotification('error', 'Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз.');
      }
    })
    .catch(error => {
      showNotification('error', 'Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз.');
    })
    .finally(() => {
      voteButton.textContent = 'Голосовать';
      voteButton.disabled = false;
    });
  }

  // Функция для отображения уведомлений
  function showNotification(type, message) {
    notificationMessage.textContent = message;
    notification.className = `notification ${type} show`;
    notification.style.display = 'block';

    closeButton.onclick = () => {
      notification.classList.remove('show');
      notification.classList.add('hidden');
      setTimeout(() => {
        notification.style.display = 'none';
      }, 300);
    };

    setTimeout(() => {
      notification.classList.remove('show');
      notification.classList.add('hidden');
      setTimeout(() => {
        notification.style.display = 'none';
      }, 300);
    }, 3000);
  }

  // Инициализация Google Sign-In
  initializeGoogleSignIn();

  checkAuthentication();
});
