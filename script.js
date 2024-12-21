document.addEventListener('DOMContentLoaded', function () {
  const signOutButton = document.getElementById('sign-out-button');
  const userInfo = document.getElementById('user-info');
  const userNameElement = document.getElementById('user-name');
  const votingForm = document.getElementById('voting-form');
  const voteButton = document.querySelector('.vote-button');
  const authButtons = document.getElementById('auth-buttons');
  const notification = document.getElementById('notification');
  const notificationMessage = document.getElementById('notification-message');
  const closeButton = document.getElementById('close-notification');

  // Проверка наличия функции jwt_decode
  if (typeof jwt_decode !== 'function') {
    console.error(
      'jwt_decode is not a function. Please make sure the library is properly loaded.'
    );
    showNotification(
      'error',
      'Ошибка: библиотека jwt_decode не найдена. Пожалуйста, перезагрузите страницу.'
    );
    return; // Прерываем выполнение скрипта, если jwt_decode не найдена
  }

  // Initialize Google API
  function initializeGoogleSignIn() {
    console.log('initializeGoogleSignIn called');
    // Добавляем явную загрузку gapi.client
    gapi.load('client', () => {
      console.log('gapi.client loaded');
      if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
        console.log('Google API is defined. Initializing.');
        google.accounts.id.initialize({
          callback: handleCredentialResponse,
          auto_prompt: true, // Enable auto prompt
          context: 'signin', // Set the context for the sign-in prompt
          ux_mode: 'popup', // Use popup mode for a cleaner UX
          itp_support: true, // Enable Intelligent Tracking Prevention support
        });
        // google.accounts.id.prompt(); // Автоматический показ диалога входа
      } else {
        console.error('Google API is not initialized.');
        showNotification(
          'error',
          'Google API не инициализировано! Попробуйте перезагрузить страницу.'
        );
      }
    });
  }

  // Add animate-slide-in class for animation
  const elementsToAnimate = document.querySelectorAll(
    'header, .nomination, .vote-button'
  );
  elementsToAnimate.forEach((element) => {
    element.classList.add('animate-slide-in');
  });

  function checkAuthentication() {
    const userName = localStorage.getItem('userName');
    console.log('checkAuthentication called. userName:', userName);

    if (userName) {
      console.log('Updating UI - logged in');
      authButtons.style.display = 'none'; // Скрываем кнопки входа
      userInfo.style.display = 'flex'; // Показываем инфо о пользователе
      userNameElement.textContent = userName;
      voteButton.disabled = false;
    } else {
      console.log('Updating UI - logged out');
      authButtons.style.display = 'block'; // Показываем кнопки входа
      userInfo.style.display = 'none'; // Скрываем инфо о пользователе
      voteButton.disabled = true;
      userNameElement.textContent = '';
    }
  }

  function handleCredentialResponse(response) {
    console.log('handleCredentialResponse called. response:', response);

    if (response && response.credential) {
      try {
        const responsePayload = jwt_decode(response.credential);
        console.log('responsePayload:', responsePayload);

        localStorage.setItem('userName', responsePayload.name);
        localStorage.setItem('userEmail', responsePayload.email);

        console.log('localStorage userName:', localStorage.getItem('userName'));

        if (localStorage.getItem('userName')) {
          console.log('User is logged in. Updating UI.');
          checkAuthentication();
          showNotification('success', 'Вы успешно авторизовались!');
        } else {
          console.error('User name not found in local storage after login.');
          showNotification('error', 'Ошибка авторизации. Имя пользователя не найдено.');
        }
      } catch (error) {
        console.error('Error decoding or storing credentials:', error);
        showNotification(
          'error',
          'Ошибка авторизации: ' + error.message + '. Пожалуйста, попробуйте еще раз.'
        );
      }
    } else {
      console.error('Credential response is invalid or missing.');
      showNotification('error', 'Ошибка авторизации. Пожалуйста, попробуйте еще раз.');
    }
  }

  signOutButton.addEventListener('click', function () {
    localStorage.clear();
    checkAuthentication();
    voteButton.disabled = true;
    voteButton.textContent = 'Голосовать';
    userNameElement.textContent = '';
    showNotification('info', 'Вы успешно вышли из аккаунта.');
  });

  voteButton.addEventListener('click', function (event) {
    event.preventDefault();

    if (localStorage.getItem('userName')) {
      // Проверяем, заполнены ли все поля формы
      if (validateForm()) {
        submitForm();
      } else {
        showNotification('error', 'Пожалуйста, выберите вариант в каждой номинации.');
      }
    } else {
      showNotification('error', 'Пожалуйста, войдите в аккаунт, чтобы проголосовать.');
      document.getElementById('auth-container').scrollIntoView({ behavior: 'smooth' });
    }
  });

  // Функция валидации формы
  function validateForm() {
    const nominations = document.querySelectorAll('.nomination');
    for (const nomination of nominations) {
      const selected = nomination.querySelector('input[type="radio"]:checked');
      if (!selected) {
        return false;
      }
    }
    return true;
  }

  function submitForm() {
    voteButton.textContent = 'Отправка...';
    voteButton.disabled = true;

    const formData = {};
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
      .then((response) => {
        if (response.ok) {
          console.log('Форма успешно отправлена!');
          showNotification('success', 'Спасибо за ваш голос!');
          votingForm.reset();
        } else {
          console.error('Ошибка при отправке формы:', response.statusText);
          return response.json().then(data => {
            throw new Error('Formspree Error: ' + response.status + ' - ' + JSON.stringify(data));
          });
        }
      })
      .catch((error) => {
        console.error('Ошибка при отправке формы:', error);
        showNotification('error', 'Произошла ошибка при отправке формы: ' + error.message);
      })
      .finally(() => {
        voteButton.textContent = 'Голосовать';
        voteButton.disabled = false;
      });
  }

  function showNotification(type, message) {
    notificationMessage.textContent = message;
    notification.className = `notification ${type} show`;
    notification.style.display = 'block';

    // Добавляем обработчик события для закрытия уведомления по клику на кнопку
    closeButton.onclick = () => {
      notification.classList.remove('show');
      notification.classList.add('hidden');
      setTimeout(() => {
        notification.style.display = 'none';
      }, 300); // Скрываем после завершения анимации
    };

    setTimeout(() => {
      notification.classList.remove('show');
      notification.classList.add('hidden');
      setTimeout(() => {
        notification.style.display = 'none';
      }, 300); // Скрываем после завершения анимации
    }, 3000);
  }

  initializeGoogleSignIn();
  checkAuthentication();
});
