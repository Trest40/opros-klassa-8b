document.addEventListener('DOMContentLoaded', function () {
  const signOutButton = document.getElementById('sign-out-button');
  const userInfo = document.getElementById('user-info');
  const userNameElement = document.getElementById('user-name');
  const votingForm = document.getElementById('voting-form');
  const voteButton = document.querySelector('.vote-button');
  const authButtons = document.getElementById('auth-buttons');
  const notification = document.getElementById('notification');
  const googleClientId = "847429882483-05f9mev63nq15t1ccilrjbnb27vrem42.apps.googleusercontent.com";
  // const signInButton = document.getElementById('sign-in-button'); // Удалили

  // Initialize Google API
  function initializeGoogleSignIn() {
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
      google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleCredentialResponse,
        auto_prompt: false,
        context: "signin",
        ux_mode: "popup",
        itp_support: true
      });
        google.accounts.id.prompt(); // Возвращаем автоматический вызов
    } else {
      console.error("Google API is not initialized.");
    }
  }

  initializeGoogleSignIn();

  // signInButton.addEventListener('click', () => {
  //     google.accounts.id.prompt(); // Вызываем окно входа при клике на "Войти"
  // }); //Удалили

  const elementsToAnimate = document.querySelectorAll('header, .nomination, .vote-button, footer');
  elementsToAnimate.forEach(element => {
    element.classList.add('animate-fade-in');
  });

  function checkAuthentication() {
    const userName = localStorage.getItem('userName');

    if (userName) {
      authButtons.style.display = 'none';
      userNameElement.textContent = userName;
      userInfo.style.display = 'flex';
      voteButton.disabled = false;
    } else {
      authButtons.style.display = 'block';
      voteButton.disabled = true;
      userInfo.style.display = 'none';
    }
  }

  window.handleCredentialResponse = (response) => {
    try {
      const responsePayload = jwt_decode(response.credential);
      console.log("ID: " + responsePayload.sub);
      console.log('Full Name: ' + responsePayload.name);
      console.log("Image URL: " + responsePayload.picture);
      console.log("Email: " + responsePayload.email);

      localStorage.setItem('userName', responsePayload.name);
      localStorage.setItem('userEmail', responsePayload.email);
      checkAuthentication();
      showNotification('success', 'Вы успешно авторизовались!');
    } catch (error) {
      console.error("Error decoding or storing credentials:", error);
      showNotification('error', 'Ошибка авторизации. Пожалуйста, попробуйте еще раз.');
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
    .then(response => {
      if (response.ok) {
        console.log('Форма успешно отправлена!');
        showNotification('success', 'Спасибо за ваш голос!');
        votingForm.reset();
      } else {
        console.error('Ошибка при отправке формы:', response.statusText);
        showNotification('error', 'Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз.');
      }
    })
    .catch(error => {
      console.error('Ошибка при отправке формы:', error);
      showNotification('error', 'Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз.');
    })
    .finally(() => {
      voteButton.textContent = 'Голосовать';
      voteButton.disabled = false;
    });
  }

  function showNotification(type, message) {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';

    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000);
  }

  checkAuthentication();
});
