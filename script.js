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

  // Инициализация Google API
  function initializeGoogleSignIn() {
  if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
    google.accounts.id.initialize({
      client_id: "847429882483-05f9mev63nq15t1ccilrjbnb27vrem42.apps.googleusercontent.com", // Ваш клиентский ID
      callback: handleCredentialResponse,
      auto_prompt: true, // Включение авто-подсказки
      context: 'signin',
      ux_mode: 'popup',
      itp_support: true,
    });
    // google.accounts.id.prompt(); // Можно раскомментировать, чтобы показать кнопку сразу
  } else {
    
  }
}

  // Инициализация при загрузке
  initializeGoogleSignIn();

  // Добавляем анимацию появления
  const elementsToAnimate = document.querySelectorAll('header, .nomination, .vote-button, footer');
  elementsToAnimate.forEach((element) => {
    element.classList.add('animate-fade-in');
  });

  // Проверка состояния авторизации
  function checkAuthentication() {
    const userName = localStorage.getItem('userName');
    console.log('Пользователь авторизован:', userName); // Для отладки
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

  // Обработка ответа после авторизации
  function handleCredentialResponse(response) {
    if (response && response.credential) {
      try {
        const responsePayload = jwt_decode(response.credential);
        console.log('ID: ' + responsePayload.sub);
        console.log('Full Name: ' + responsePayload.name);
        console.log('Email: ' + responsePayload.email);

        localStorage.setItem('userName', responsePayload.name);
        localStorage.setItem('userEmail', responsePayload.email);
        checkAuthentication();
        showNotification('success', 'Вы успешно авторизовались!');
      } catch (error) {
        console.error('Ошибка при обработке данных:', error);
        showNotification('error', 'Ошибка авторизации. Пожалуйста, попробуйте еще раз.');
      }
    }
  }

  // Обработчик выхода из аккаунта
  signOutButton.addEventListener('click', function () {
    localStorage.clear(); // Очистка данных
    checkAuthentication(); // Обновление интерфейса
    voteButton.disabled = true; // Отключение кнопки голосования
    userNameElement.textContent = ''; // Очистка имени пользователя
    showNotification('info', 'Вы успешно вышли из аккаунта.');
  });

  // Обработчик нажатия кнопки голосования
  voteButton.addEventListener('click', function (event) {
    event.preventDefault();
    if (localStorage.getItem('userName')) {
      submitForm();
    } else {
      showNotification('error', 'Пожалуйста, войдите в аккаунт, чтобы проголосовать.');
      document.getElementById('auth-container').scrollIntoView({ behavior: 'smooth' });
    }
  });

  // Отправка формы
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
          showNotification('error', 'Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз.');
        }
      })
      .catch((error) => {
        console.error('Ошибка при отправке формы:', error);
        showNotification('error', 'Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз.');
      })
      .finally(() => {
        voteButton.textContent = 'Голосовать';
        voteButton.disabled = false;
      });
  }

  // Функция отображения уведомлений
  function showNotification(type, message) {
    notificationMessage.textContent = message;
    notification.className = `notification ${type} show`;
    notification.style.display = 'block';

    closeButton.onclick = () => {
      notification.classList.remove('show');
      notification.classList.add('hidden');
      setTimeout(() => {
        notification.style.display = 'none';
      }, 300); // Скрытие уведомления после завершения анимации
    };

    setTimeout(() => {
      notification.classList.remove('show');
      notification.classList.add('hidden');
      setTimeout(() => {
        notification.style.display = 'none';
      }, 300); // Скрытие уведомления после завершения анимации
    }, 3000);
  }

  // Инициализация состояния страницы
  checkAuthentication();
});
