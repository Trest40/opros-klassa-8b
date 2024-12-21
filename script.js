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

  // Initialize Google API
   function initializeGoogleSignIn() {
     console.log('initializeGoogleSignIn called');

     // Явная загрузка gapi.client с коллбеком
     gapi.load('client', () => {
       console.log('gapi.client loaded');
       if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
         console.log('Google API is defined. Initializing.');
         google.accounts.id.initialize({
           client_id: '847429882483-05f8m63nsg115it1coij8nb27vrem42.apps.googleusercontent.com', // Добавлен client_id
           callback: handleCredentialResponse,
           auto_prompt: false, // Отключаем автоматический вход
           context: 'signin', // Set the context for the sign-in prompt
           ux_mode: 'popup', // Use popup mode for a cleaner UX
           itp_support: true, // Enable Intelligent Tracking Prevention support
         });
         google.accounts.id.renderButton(
             document.getElementById("signInDiv"), // Укажи ID элемента, в котором будет отображаться кнопка
             {
               theme: 'outline',
               size: 'large',
               type: 'standard',
               shape: 'rectangular',
               text: 'signin_with',
               logo_alignment: 'left'
             });
           checkForSignedInUser();
       } else {
         console.error('Google API is not initialized.');
         showNotification(
             'error',
             'Google API не инициализировано! Попробуйте перезагрузить страницу.'
         );
       }
     });
   }

     // Проверка наличия залогиненного пользователя
   function checkForSignedInUser() {
       const token = gapi.auth.getToken(); // Проверяем наличие токена в сессии
       if (token) {
           // Если токен присутствует, пытаемся его декодировать
           try {
               const payload = jwt_decode(token.access_token); // Декодируем access_token
               // Проверяем, не истек ли срок действия токена
               const now = Math.floor(Date.now() / 1000);
               if (payload.exp > now) {
                   // Если токен действителен, обновляем интерфейс
                   localStorage.setItem('userName', payload.name);
                   localStorage.setItem('userEmail', payload.email);
                   checkAuthentication();
               } else {
                   // Если токен просрочен, удаляем его из хранилища
                   console.log('Token expired, clearing local storage');
                   localStorage.clear();
               }
           } catch (error) {
               console.error('Error decoding or verifying token:', error);
               localStorage.clear(); // В случае ошибки также очищаем хранилище
           }
       }
   }

   function handleCredentialResponse(response) {
   console.log('handleCredentialResponse called. response:', response); // Логируем

   if (response && response.credential) {
     try {
       const responsePayload = jwtDecode(response.credential); // Исправлено: jwt_decode -> jwtDecode
       console.log('responsePayload:', responsePayload); // Логируем декодированный токен

       localStorage.setItem('userName', responsePayload.name);
       localStorage.setItem('userEmail', responsePayload.email);

       console.log('localStorage userName:', localStorage.getItem('userName')); // Проверяем, сохранилось ли имя

       // ПРОВЕРКА НА НАЛИЧИЕ ИМЕНИ В localstorage
       if (localStorage.getItem('userName')) {
         console.log('User is logged in. Updating UI.'); // Логируем
         checkAuthentication(); // Вызов после успешного логина
         showNotification('success', 'Вы успешно авторизовались!');
       } else {
         console.error('User name not found in local storage after login.');
         showNotification(
           'error',
           'Ошибка авторизации. Имя пользователя не найдено.'
         );
       }
     } catch (error) {
       console.error('Error decoding or storing credentials:', error);
       showNotification(
         'error',
         'Ошибка авторизации. Пожалуйста, попробуйте еще раз.'
       );
     }
   } else {
     console.error('Credential response is invalid or missing.');
     showNotification(
       'error',
       'Ошибка авторизации. Пожалуйста, попробуйте еще раз.'
     );
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
      .then((response) => {
        if (response.ok) {
          console.log('Форма успешно отправлена!');
          showNotification('success', 'Спасибо за ваш голос!');
          votingForm.reset();
        } else {
          console.error('Ошибка при отправке формы:', response.statusText);
          showNotification(
            'error',
            'Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз.'
          );
        }
      })
      .catch((error) => {
        console.error('Ошибка при отправке формы:', error);
        showNotification(
          'error',
          'Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз.'
        );
      })
      .finally(() => {
        voteButton.textContent = 'Голосовать';
        voteButton.disabled = false;
      });
  }

  function showNotification(type, message) {
    notificationMessage.textContent = message;
    notification.className = `notification ${type} show`;
    notification.style.display = 'block';

    // Добавляем обработчик события для закрытия уведомления по клику на кнопку
    closeButton.onclick = () => {
      notification.classList.remove('show');
      notification.classList.add('hidden');
      setTimeout(() => {
        notification.style.display = 'none';
      }, 300); // Скрываем после завершения анимации
    };

    setTimeout(() => {
      notification.classList.remove('show');
      notification.classList.add('hidden');
      setTimeout(() => {
        notification.style.display = 'none';
      }, 300); // Скрываем после завершения анимации
    }, 3000);
  }

  initializeGoogleSignIn();
  checkAuthentication();
});
