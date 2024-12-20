function initializeGoogleSignIn() {
  return new Promise((resolve, reject) => { // Добавил reject для обработки ошибок
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (google && google.accounts && google.accounts.id) {
        resolve();
      } else {
        console.error("Google Identity Services library failed to load.");
        reject("Google Identity Services library failed to load."); // Добавил reject
      }
    };
    script.onerror = () => {
      reject("Error loading Google Identity Services library.");
    };
    document.head.appendChild(script);
  });
}

document.addEventListener('DOMContentLoaded', async function () {
  const signInButton = document.getElementById('sign-in-button');
  const signOutButton = document.getElementById('sign-out-button');
  const userInfo = document.getElementById('user-info');
  const userNameElement = document.getElementById('user-name');
  const votingForm = document.getElementById('voting-form');
  const voteButton = document.querySelector('.vote-button');
  const voteMessage = document.getElementById('vote-message'); // Добавил элемент для сообщений

  // Добавляем класс animate-fade-in для анимации появления
  const elementsToAnimate = document.querySelectorAll('header, .nomination, .vote-button, footer');
  elementsToAnimate.forEach(element => {
    element.classList.add('animate-fade-in');
  });

  function checkAuthentication() {
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail'); // Добавил проверку email

    if (userName && userEmail) {
      signInButton.style.display = 'none';
      userNameElement.textContent = userName;
      userInfo.style.display = 'flex';
      voteButton.disabled = false;
      // Проверяем, голосовал ли уже пользователь
      if (localStorage.getItem('hasVoted')) {
        voteButton.disabled = true;
        voteButton.textContent = 'Вы уже голосовали';
        voteMessage.textContent = 'Вы уже голосовали.';
        voteMessage.style.display = 'block';
      }
    } else {
      voteButton.disabled = true;
      signInButton.style.display = 'block';
      userInfo.style.display = 'none';
      voteMessage.style.display = 'none'; // Скрываем сообщение при выходе
    }
  }

  function handleCredentialResponse(response) {
    if (response.credential) { // Проверяем наличие credential
      const responsePayload = jwt_decode(response.credential);
      console.log("ID: " + responsePayload.sub);
      console.log('Full Name: " + responsePayload.name);
      console.log("Image URL: " + responsePayload.picture);
      console.log("Email: " + responsePayload.email);

      localStorage.setItem('userName', responsePayload.name);
      localStorage.setItem('userEmail', responsePayload.email);
      checkAuthentication();
    } else {
      console.error("Authentication failed.");
      voteMessage.textContent = 'Ошибка аутентификации. Попробуйте еще раз.';
      voteMessage.style.display = 'block';
    }
  }

  try {
    await initializeGoogleSignIn();
    google.accounts.id.initialize({
      client_id: '847429882483-05f9mev63nq15t1ccilrjbnb27vrem42.apps.googleusercontent.com',
      callback: handleCredentialResponse
    });
    google.accounts.id.renderButton(
      signInButton,
      { theme: "outline", size: "large" }
    );
    checkAuthentication();
  } catch (error) {
    console.error("Error initializing Google Sign-In:", error);
    voteMessage.textContent = 'Ошибка инициализации Google Sign-In. Попробуйте позже.';
    voteMessage.style.display = 'block';
  }

  signOutButton.addEventListener('click', function () {
    localStorage.clear();
    google.accounts.id.disableAutoSelect(); // Отключаем автовыбор аккаунта
    checkAuthentication();
    voteButton.disabled = true;
    voteButton.textContent = 'Голосовать';
  });

  voteButton.addEventListener('click', function (event) {
    event.preventDefault();

    if (localStorage.getItem('userName') && localStorage.getItem('userEmail')) {
      // Показываем модальное окно с подтверждением
      document.getElementById('confirmation-modal').style.display = 'block';
    } else {
      voteMessage.textContent = 'Пожалуйста, войдите в аккаунт, чтобы проголосовать.';
      voteMessage.style.display = 'block';
      // Добавляем кнопку "Войти" в сообщение
      const signInLink = document.createElement('button');
      signInLink.textContent = 'Войти';
      signInLink.classList.add('auth-button');
      signInLink.addEventListener('click', () => {
        signInButton.click();
        voteMessage.style.display = 'none'; // Скрываем сообщение после клика
      });
      voteMessage.appendChild(signInLink);
    }
  });

    // Обработчики для кнопок в модальном окне
    document.getElementById('confirm-vote').addEventListener('click', submitForm);
    document.getElementById('cancel-vote').addEventListener('click', () => {
      document.getElementById('confirmation-modal').style.display = 'none';
    });

    function submitForm() {
      document.getElementById('confirmation-modal').style.display = 'none'; // Скрываем модальное окно
      voteButton.textContent = 'Отправка...';
      voteButton.disabled = true;
      voteButton.setAttribute('aria-disabled', 'true'); // Добавил ARIA-атрибут
      voteButton.setAttribute('aria-label', 'Отправка...'); // Добавил ARIA-атрибут

      // Валидация формы
      if (!validateForm()) {
        voteMessage.textContent = 'Пожалуйста, выберите по одному варианту в каждой номинации.';
        voteMessage.style.display = 'block';
        voteButton.textContent = 'Голосовать';
        voteButton.disabled = false;
        voteButton.removeAttribute('aria-disabled'); // Добавил ARIA-атрибут
        voteButton.removeAttribute('aria-label'); // Добавил ARIA-атрибут
        return;
      }

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
      .then(response => {
        if (response.ok) {
          voteMessage.textContent = 'Спасибо за ваш голос!';
          voteMessage.style.display = 'block';
          voteButton.textContent = 'Вы уже голосовали';
          localStorage.setItem('hasVoted', 'true'); // Помечаем, что пользователь проголосовал
        } else {
          throw new Error('Form submission failed.');
        }
      })
      .catch(error => {
        console.error('Error submitting form:', error);
        voteMessage.textContent = 'Ошибка отправки формы. Попробуйте еще раз.';
        voteMessage.style.display = 'block';
        voteButton.textContent = 'Голосовать';
        voteButton.disabled = false;
        voteButton.removeAttribute('aria-disabled'); // Добавил ARIA-атрибут
        voteButton.removeAttribute('aria-label'); // Добавил ARIA-атрибут
      });
    }

    function validateForm() {
      const nominations = votingForm.querySelectorAll('section.nomination');
      for (const nomination of nominations) {
        const checked = nomination.querySelector('input[type="radio"]:checked');
        if (!checked) {
          return false;
        }
      }
      return true;
    }
});
