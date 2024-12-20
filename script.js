document.addEventListener('DOMContentLoaded', function () {
  const signOutButton = document.getElementById('sign-out-button');
  const userInfo = document.getElementById('user-info');
  const userNameElement = document.getElementById('user-name');
  const votingForm = document.getElementById('voting-form');
  const voteButton = document.querySelector('.vote-button');

  // Добавляем класс animate-fade-in для анимации появления
  const elementsToAnimate = document.querySelectorAll('header, .nomination, .vote-button, footer');
  elementsToAnimate.forEach(element => {
    element.classList.add('animate-fade-in');
  });

  function checkAuthentication() {
    const userName = localStorage.getItem('userName');

    if (userName) {
      //signInButton.style.display = 'none';
      userNameElement.textContent = userName;
      userInfo.style.display = 'flex';
      voteButton.disabled = false;
    } else {
      voteButton.disabled = true;
      //signInButton.style.display = 'block'; // Показывать кнопку, если не авторизован
      userInfo.style.display = 'none';
    }
  }

  window.handleCredentialResponse = (response) => {
    try {
      const responsePayload = jwt_decode(response.credential);
      console.log("ID: " + responsePayload.sub);
      console.log('Full Name: " + responsePayload.name);
      console.log("Image URL: " + responsePayload.picture);
      console.log("Email: " + responsePayload.email);

      localStorage.setItem('userName', responsePayload.name);
      localStorage.setItem('userEmail', responsePayload.email);
      checkAuthentication();
    } catch (error) {
      console.error("Error decoding or storing credentials:", error);
    }
  }

  signOutButton.addEventListener('click', function () {
    localStorage.clear();
    checkAuthentication();
    voteButton.disabled = false;
    voteButton.textContent = 'Голосовать';
    userNameElement.textContent = '';
    alert('Вы успешно вышли из аккаунта.');
  });

  voteButton.addEventListener('click', function (event) {
    event.preventDefault();

    if (localStorage.getItem('userName')) {
      submitForm();
    } else {
      alert('Пожалуйста, войдите в аккаунт, чтобы проголосовать.');
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
        alert('Спасибо за ваш голос!');
        votingForm.reset();
      } else {
        console.error('Ошибка при отправке формы:', response.statusText);
        alert('Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз.');
      }
    })
    .catch(error => {
      console.error('Ошибка при отправке формы:', error);
      alert('Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз.');
    })
    .finally(() => {
      voteButton.textContent = 'Голосовать';
      voteButton.disabled = false;
    });
  }
});
