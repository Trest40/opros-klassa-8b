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

  // Initialize Google API
  function initializeGoogleSignIn() {
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
      google.accounts.id.initialize({
        callback: handleCredentialResponse,
        auto_prompt: true, // Enable auto prompt
        context: 'signin', // Set the context for the sign-in prompt
        ux_mode: 'popup', // Use popup mode for a cleaner UX
        itp_support: true, // Enable Intelligent Tracking Prevention support
      });
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

  function handleCredentialResponse(response) {
    if (response && response.credential) {
      try {
        // Decode the ID token to get user information
        const idToken = response.credential;
        const decodedToken = jwt_decode(idToken);

        console.log('Decoded Token:', decodedToken);

        const userName = decodedToken.name;
        const userEmail = decodedToken.email;

        // Store user information in localStorage
        localStorage.setItem('userName', userName);
        localStorage.setItem('userEmail', userEmail);

        // Update UI
        checkAuthentication();
        showNotification('success', 'Вы успешно авторизовались!');
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
