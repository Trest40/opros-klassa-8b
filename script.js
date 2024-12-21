document.addEventListener('DOMContentLoaded', function () {
  const signOutButton = document.getElementById('sign-out-button');
  const userInfo = document.getElementById('user-info');
  const userNameElement = document.getElementById('user-name');
  const voteButton = document.querySelector('.vote-button');
  const authButtons = document.getElementById('auth-buttons');

  // Инициализация Google Sign-In
  function initializeGoogleSignIn() {
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
      google.accounts.id.initialize({
        client_id: "847429882483-05f9mev63nq15t1ccilrjbnb27vrem42.apps.googleusercontent.com",
        callback: handleCredentialResponse,
        auto_prompt: true,
        context: 'signin',
        ux_mode: 'popup',
        itp_support: true,
      });
      google.accounts.id.prompt();
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
        localStorage.setItem('userName', responsePayload.name);
        checkAuthentication();
      } catch (error) {
        console.error('Ошибка при декодировании данных:', error);
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
    }
  }

  // Выход из аккаунта
  signOutButton.addEventListener('click', function () {
    localStorage.clear();
    checkAuthentication();
    voteButton.disabled = true;
  });

  // Инициализация Google Sign-In
  initializeGoogleSignIn();

  checkAuthentication();
});
