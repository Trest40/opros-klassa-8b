document.addEventListener('DOMContentLoaded', function () {
  const elements = document.querySelectorAll('main.container, footer'); // Добавлен main.container

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
  const userNameElement = document.getElementById('user-name');
  const votingForm = document.getElementById('voting-form');
  const messageDiv = document.getElementById('message');
  const voteButton = document.querySelector('.vote-button');
  const userEmailInput = document.getElementById('user-email');

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

    // Сохраняем имя пользователя и email в localStorage
    localStorage.setItem('userName', responsePayload.name);
    localStorage.setItem('userEmail', responsePayload.email);
    userEmailInput.value = responsePayload.email;
    // Проверяем аутентификацию и отображаем опрос
    checkAuthentication();
  }

  // Инициализируем GIS после полной загрузки страницы и отрисовки кнопки "Войти"
  window.onload = function() {
    // Проверяем, загрузилась ли библиотека GIS
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
      google.accounts.id.initialize({
        client_id: '847429882483-05f9mev63nq15t1ccilrjbnb27vrem42.apps.googleusercontent.com', // Твой Client ID
        callback: handleCredentialResponse,
      });
      google.accounts.id.renderButton(
        signInButton,
        { theme: "outline", size: "large" }  // customization attributes
      );
    } else {
      console.error("Google Identity Services library is not loaded.");
    }
    checkAuthentication();
  }

  // Обработчик нажатия на кнопку выхода
  signOutButton.addEventListener('click', function() {
    localStorage.clear(); // Очищаем localStorage
    checkAuthentication(); // Проверяем аутентификацию
  });

  votingForm.addEventListener('submit', function (event) {
    if (voteButton.disabled) {
      // Если кнопка голосования заблокирована
      event.preventDefault();
      document.body.classList.add('shake'); // Трясем всю страницу
      setTimeout(() => {
        document.body.classList.remove('shake'); // Убираем класс тряски через 300 мс
      }, 300);
      // Переход на плашку входа
      document.getElementById('auth-container').scrollIntoView({ behavior: 'smooth' });
      return; // Прерываем отправку формы
    }

    // Меняем текст на кнопке
    voteButton.textContent = "Отправка...";
    voteButton.disabled = true;

    // Создаем объект FormData для сбора данных формы
    const formData = new FormData(votingForm);

    // Добавляем email пользователя в данные формы
    formData.append('email', localStorage.getItem('userEmail'));

    // Отправляем данные формы с помощью Fetch API
    fetch(votingForm.action, {
      method: 'POST',
      body: formData,
    })
    .then(response => {
      if (response.ok) {
        return response.text(); // Получаем текстовый ответ
      } else {
        throw new Error('Произошла ошибка при отправке формы.');
      }
    })
    .then(responseText => {
      console.log(responseText); // Выводим ответ в консоль

      // Показываем сообщение об успехе
      messageDiv.textContent = "Спасибо за ваш голос!";
      messageDiv.style.display = "block";

      // Очищаем форму
      votingForm.reset();

      // Скрываем сообщение об успехе через 5 секунд
      setTimeout(() => {
        messageDiv.style.display = "none";
      }, 5000);
    })
    .catch(error => {
      console.error('Ошибка:', error);
      messageDiv.textContent = "Произошла ошибка при отправке. Пожалуйста, попробуйте еще раз.";
      messageDiv.style.display = "block";
    })
    .finally(() => {
      // Возвращаем исходный текст на кнопке и разблокируем ее
      voteButton.textContent = "Голосовать";
      voteButton.disabled = false;
    });

    // Предотвращаем стандартное поведение формы
    event.preventDefault();
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
