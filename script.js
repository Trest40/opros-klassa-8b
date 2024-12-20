document.addEventListener('DOMContentLoaded', function () {
  const signInButton = document.getElementById('sign-in-button');
  const signOutButton = document.getElementById('sign-out-button');
  const userInfo = document.getElementById('user-info');
  const userNameElement = document.getElementById('user-name');
  const votingForm = document.getElementById('voting-form');
  const voteButton = document.querySelector('.vote-button');

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
    checkAuthentication();

    // !!! УДАЛИЛ submitForm() ОТСЮДА !!!
  }

  window.onload = function() {
    let googleApiInterval = setInterval(() => {
      if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
        clearInterval(googleApiInterval); // Останавливаем интервал
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
    }, 100); // Проверяем каждые 100ms
    checkAuthentication();
  }

  signOutButton.addEventListener('click', function() {
      localStorage.clear();
      checkAuthentication();

      voteButton.disabled = false;
      voteButton.textContent = 'Голосовать';
  });

  // Обработчик на кнопку голосования
  voteButton.addEventListener('click', function(event) {
    event.preventDefault();

    if (localStorage.getItem('userName')) {
      // Пользователь авторизован, отправляем форму
      submitForm();
    } else {
      // Пользователь не авторизован, показываем сообщение и инициируем вход
      alert('Пожалуйста, войдите в аккаунт, чтобы проголосовать.');
      document.getElementById('auth-container').scrollIntoView({ behavior: 'smooth' });

      // Показываем кнопку входа
      signInButton.click();
    }
  });

  // Функция отправки формы
  function submitForm() {
        voteButton.textContent = 'Отправка...';
        voteButton.disabled = true;

        // Добавляем флаг
        let formSubmitted = false;

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
              throw new Error('Произошла ошибка при отправке формы.');
            }
          })
          .then(responseText => {
            console.log(responseText);
            // Проверяем флаг
            if (!formSubmitted) {
                console.log('Спасибо за ваш голос!'); // Вместо alert()
                formSubmitted = true; // Устанавливаем флаг
            }

            votingForm.reset();
          })
          .catch(error => {
            console.error('Ошибка:', error);
            alert(error.message);
          })
          .finally(() => {
            voteButton.textContent = 'Голосовать';
            voteButton.disabled = false;
          });
  }
});
