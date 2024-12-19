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
  const userNameElement = document.getElementById('user-name');
  const votingForm = document.getElementById('voting-form');
  const messageDiv = document.getElementById('message');
  const voteButton = document.querySelector('.vote-button');
  const userEmailInput = document.getElementById('user-email');

  function checkAuthentication() {
    const userName = localStorage.getItem('userName');

    if (userName) {
      signInButton.style.display = 'none';
      userNameElement.textContent = userName;
      userInfo.style.display = 'flex';
      voteButton.disabled = false;
    } else {
      voteButton.disabled = true;
      signInButton.style.display = 'block';
      userInfo.style.display = 'none';
    }
  }

  function handleCredentialResponse(response) {
    const responsePayload = jwt_decode(response.credential);
    console.log("ID: " + responsePayload.sub);
    console.log('Full Name: ' + responsePayload.name);
    console.log("Image URL: " + responsePayload.picture);
    console.log("Email: " + responsePayload.email);

    localStorage.setItem('userName', responsePayload.name);
    localStorage.setItem('userEmail', responsePayload.email);
    userEmailInput.value = responsePayload.email;
    checkAuthentication();

    // Отправляем форму после успешной авторизации (без лишних проверок)
    submitForm();
  }

  window.onload = function() {
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
      google.accounts.id.initialize({
        client_id: '847429882483-05f9mev63nq15t1ccilrjbnb27vrem42.apps.googleusercontent.com',
        callback: handleCredentialResponse,
      });
      google.accounts.id.renderButton(
        signInButton,
        { theme: "outline", size: "large" }
      );
    } else {
      console.error("Google Identity Services library is not loaded.");
    }
    checkAuthentication();
  }

  signOutButton.addEventListener('click', function() {
      localStorage.clear();
      checkAuthentication();

      voteButton.disabled = false;
      voteButton.textContent = 'Голосовать';
  });

  // Добавляем обработчик на кнопку, который проверяет авторизацию
  voteButton.addEventListener('click', function(event) {
    event.preventDefault();

    if (localStorage.getItem('userName')) {
      // Пользователь авторизован, отправляем форму
      submitForm();
    } else {
      // Пользователь не авторизован, показываем сообщение и инициируем вход
      messageDiv.textContent = 'Пожалуйста, войдите в аккаунт, чтобы проголосовать.';
      messageDiv.style.display = 'block';
      document.getElementById('auth-container').scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        messageDiv.style.display = 'none';
      }, 5000);

      // Показываем кнопку входа
      signInButton.click();
    }
  });

  // Функция отправки формы (вызываем её после авторизации)
  function submitForm() {
        voteButton.textContent = 'Отправка...';
        voteButton.disabled = true;

        // Сбор данных формы вручную
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
              return response.text();
            } else {
              // Убрали проверку на статус 422
              throw new Error('Произошла ошибка при отправке формы.');
            }
          })
          .then(responseText => {
            console.log(responseText);

            messageDiv.textContent = 'Спасибо за ваш голос!';
            messageDiv.style.display = 'block';

            votingForm.reset();

            setTimeout(() => {
              messageDiv.style.display = 'none';
            }, 5000);
          })
          .catch(error => {
            console.error('Ошибка:', error);
            messageDiv.textContent = error.message;
            messageDiv.style.display = 'block';
          })
          .finally(() => {
            voteButton.textContent = 'Голосовать';
            voteButton.disabled = false;
          });
  }

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
