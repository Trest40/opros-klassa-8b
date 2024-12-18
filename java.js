document.addEventListener('DOMContentLoaded', function () {
  const elements = document.querySelectorAll('main.container, footer');

  function checkScroll() {
    elements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      if (elementTop < windowHeight - 100) {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }
    });
  }

  window.addEventListener('scroll', checkScroll);
  checkScroll();

  const signInButton = document.getElementById('sign-in-button');
  const signOutButton = document.getElementById('sign-out-button');
  const userInfo = document.getElementById('user-info');
  const userName = document.getElementById('user-name');
  const votingForm = document.getElementById('voting-form');
  const messageDiv = document.getElementById('message');
  const voteButton = document.querySelector('.vote-button');

  function checkAuthentication() {
    const userName = localStorage.getItem('userName');
    if (userName) {
      // Пользователь аутентифицирован
      voteButton.disabled = false; // Разблокируем кнопку голосования
      signInButton.style.display = 'none'; // Скрываем кнопку "Войти"
      userNameElement.textContent = userName; // Показываем имя пользователя
      userInfo.style.display = 'flex'; // Отображаем блок с информацией о пользователе
    } else {
      // Пользователь не аутентифицирован
      voteButton.disabled = true; // Блокируем кнопку голосования
      signInButton.style.display = 'block'; // Показываем кнопку "Войти"
      userInfo.style.display = 'none'; // Скрываем блок с информацией о пользователе
    }
  }

  function handleCredentialResponse(response) {
    const responsePayload = jwt_decode(response.credential);
    console.log("ID: " + responsePayload.sub);
    console.log('Full Name: ' + responsePayload.name);
    console.log("Image URL: " + responsePayload.picture);
    console.log("Email: " + responsePayload.email);

    // Сохраняем имя пользователя в localStorage
    localStorage.setItem('userName', responsePayload.name);
    // Проверяем аутентификацию и отображаем опрос
    checkAuthentication();
  }

  window.onload = function () {
    google.accounts.id.initialize({
      client_id: '847429882483-05f9mev63nq15t1ccilrjbmb27vrem42.apps.googleusercontent.com', // Твой Client ID
      callback: handleCredentialResponse,
    });
    google.accounts.id.renderButton(
        signInButton,
        { theme: "outline", size: "large" }  // customization attributes
    );
    checkAuthentication();
  }

  // Обработчик нажатия на кнопку выхода
  signOutButton.addEventListener('click', function() {
    localStorage.clear(); // Очищаем localStorage
    checkAuthentication(); // Проверяем аутентификацию
  });

  votingForm.addEventListener('submit', function (event) {
    event.preventDefault();
    if (voteButton.disabled) {
      // Если кнопка голосования заблокирована
      document.body.classList.add('shake'); // Трясем всю страницу
      setTimeout(() => {
        document.body.classList.remove('shake'); // Убираем класс тряски через 300 мс
      }, 300);
      return; // Прерываем отправку формы
    }

    // Здесь логика отправки данных опроса
    // ...
  });

  const button = document.querySelector('button.vote-button');
  if (button) {
    button.addEventListener('mouseover', function () {
      button.style.transform = 'scale(1.08) translateY(-3px)';
      button.style.boxShadow = '0 0 20px gold';
    });

    button.addEventListener('mouseout', function () {
      button.style.transform = 'scale(1) translateY(0)';
      button.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.4)';
    });
  }
});
