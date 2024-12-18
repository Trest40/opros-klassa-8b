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

  const googleSignInButton = document.getElementById('google-signin-button');
  const signOutButton = document.getElementById('sign-out-button');
  const userInfo = document.getElementById('user-info');
  const userName = document.getElementById('user-name');
  const votingForm = document.getElementById('voting-form');
  const messageDiv = document.getElementById('message');

  function checkAuthentication() {
    const userName = localStorage.getItem('userName');
    if (userName) {
      // Пользователь аутентифицирован
      votingForm.style.display = 'block';
      googleSignInButton.style.display = 'none';
      document.getElementById('user-name').textContent = userName;
      document.getElementById('user-info').style.display = 'flex';
    } else {
      // Пользователь не аутентифицирован
      votingForm.style.display = 'none';
      googleSignInButton.style.display = 'block';
      document.getElementById('user-info').style.display = 'none';
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
        client_id: 'YOUR_GOOGLE_CLIENT_ID', // Замени на свой Client ID
        callback: handleCredentialResponse
      });
      google.accounts.id.renderButton(
        document.getElementById("google-signin-button"),
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
