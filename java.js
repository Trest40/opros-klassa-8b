import { auth, database } from './firebase-config.js';

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
  checkScroll(); // Проверяем при загрузке

  const googleSignInButton = document.getElementById('google-signin-button');
  const signOutButton = document.getElementById('sign-out-button');
  const userInfo = document.getElementById('user-info');
  const userName = document.getElementById('user-name');
  const votingForm = document.getElementById('voting-form');
  const form = document.querySelector('#voting-form');
  const messageDiv = document.getElementById('message');

  // Проверка состояния аутентификации при загрузке страницы
  auth.onAuthStateChanged(function(user) {
    if (user) {
      // Пользователь вошел в систему
      userName.textContent = user.displayName;
      userInfo.style.display = 'flex';
      googleSignInButton.style.display = 'none';
      checkIfUserVoted(user.uid); // Проверяем, голосовал ли пользователь
    } else {
      // Пользователь не вошел в систему
      userInfo.style.display = 'none';
      googleSignInButton.style.display = 'block';
    }
  });

  // Обработчик нажатия на кнопку входа через Google
  googleSignInButton.addEventListener('click', function() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
      .then((result) => {
        const user = result.user;
        console.log("User signed in:", user);
      })
      .catch((error) => {
        console.error("Error during sign in:", error);
      });
  });

  // Обработчик нажатия на кнопку выхода
  signOutButton.addEventListener('click', function() {
    auth.signOut()
      .then(() => {
        console.log("User signed out");
      })
      .catch((error) => {
        console.error("Error during sign out:", error);
      });
  });

  async function checkIfUserVoted(userId) {
    const snapshot = await database.ref('votes/' + userId).once('value');
    return snapshot.exists();
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    let user = auth.currentUser;
    if (!user) {
      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        user = result.user;
        console.log("User signed in:", user);
      } catch (error) {
        console.error("Error during sign in:", error);
        // Выходим из функции, если произошла ошибка входа
        return;
      }
    }

    // Вызываем функцию submitForm после авторизации (или если пользователь уже авторизован)
    submitForm(user);
  });

  async function submitForm(user) {
    const userId = user.uid;

    // Проверка, голосовал ли пользователь уже
    const hasVoted = await checkIfUserVoted(userId);
    if (hasVoted) {
      messageDiv.textContent = 'Вы уже голосовали!';
      messageDiv.style.display = 'block';
      setTimeout(() => {
        messageDiv.style.display = 'none';
      }, 3000);
      return;
    }

    const formData = {};
    const nominations = document.querySelectorAll('.nomination');

    nominations.forEach(nomination => {
      const nominationName = nomination.id;
      const selectedOption = nomination.querySelector('input:checked');

      if (selectedOption) {
        formData[nominationName] = selectedOption.value;
      }
    });

    // Сохранение голоса в Firebase
    database.ref('votes/' + userId).set(formData)
      .then(() => {
        messageDiv.textContent = 'Спасибо за голос!';
        messageDiv.style.display = 'block';
        form.reset();
        setTimeout(() => {
          messageDiv.style.display = 'none';
        }, 3000);
      })
      .catch((error) => {
        console.error("Ошибка при сохранении голоса:", error);
        messageDiv.textContent = 'Произошла ошибка при сохранении голоса.';
        messageDiv.style.display = 'block';
        setTimeout(() => {
          messageDiv.style.display = 'none';
        }, 3000);
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
