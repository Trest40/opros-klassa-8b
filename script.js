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
  // const googleClientId = "847429882483-05f9mev63nq15t1ccilrjbnb27vrem42.apps.googleusercontent.com"; // Client ID moved here - not required

  // Initialize Google API
  function initializeGoogleSignIn() {
    console.log('initializeGoogleSignIn called'); // Логируем
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
      console.log('Google API is defined. Initializing.'); // Логируем
      google.accounts.id.initialize({
        // client_id: googleClientId, //No need for client_id here
        callback: handleCredentialResponse,
        auto_prompt: true, // Enable auto prompt
        context: 'signin', // Set the context for the sign-in prompt
        ux_mode: 'popup', // Use popup mode for a cleaner UX
        itp_support: true, // Enable Intelligent Tracking Prevention support
      });
      // google.accounts.id.prompt();
    } else {
      console.error('Google API is not initialized.');
      showNotification(
        'error',
        'Google API не инициализировано! Попробуйте перезагрузить страницу.'
      );
    }
  }

  initializeGoogleSignIn();

  // Add animate-fade-in class for animation
  const elementsToAnimate = document.querySelectorAll(
    'header, .nomination, .vote-button, footer'
  );
  elementsToAnimate.forEach((element) => {
    element.classList.add('animate-fade-in');
  });

  function checkAuthentication() {
    const userName = localStorage.getItem('userName');
    console.log('checkAuthentication called. userName:', userName); // Логируем

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

  window.handleCredentialResponse = (response) => {
    console.log('handleCredentialResponse called. response:', response); // Логируем

    if (response && response.credential) {
      try {
        const responsePayload = jwt_decode(response.credential);
        console.log('responsePayload', responsePayload);

        localStorage.setItem('userName', responsePayload.name);
        localStorage.setItem('userEmail', responsePayload.email);

        // ПРОВЕРКА НА НАЛИЧИЕ ИМЕНИ В localstorage
        if (localStorage.getItem('userName')) {
          console.log('User is logged in. Updating UI.'); // Логируем
          checkAuthentication();
          showNotification('success', 'Вы успешно авторизовались!');
        } else {
          console.error('User name not found in local storage after login.');
          showNotification(
            'error',
            'Ошибка авторизации. Имя пользователя не найдено.'
          );
        }
      } catch (error) {
        console.error('Error decoding or storing credentials:', error);
        showNotification(
          'error',
          'Ошибка авторизации. Пожалуйста, попробуйте еще раз.'
        );
      }
    } else {
      console.error('Credential response is invalid or missing.');
      showNotification(
        'error',
        'Ошибка авторизации. Пожалуйста, попробуйте еще раз.'
      );
    }
  };

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
      submitForm();
    } else {
      showNotification('error', 'Пожалуйста, войдите в аккаунт, чтобы проголосовать.');
      document.getElementById('auth-container').scrollIntoView({ behavior: 'smooth' });
    }
  });

  function submitForm() {
    voteButton.textContent = 'Отправка...';
    voteButton.disabled = true;
    let formSubmitted = false;

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
          showNotification(
            'error',
            'Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз.'
          );
        }
      })
      .catch((error) => {
        console.error('Ошибка при отправке формы:', error);
        showNotification(
          'error',
          'Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз.'
        );
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

  checkAuthentication();
});
