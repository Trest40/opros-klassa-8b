document.addEventListener('DOMContentLoaded', function () {
  const signOutButton = document.getElementById('sign-out-button');
  const userInfo = document.getElementById('user-info');
  const userNameElement = document.getElementById('user-name');
  const votingForm = document.getElementById('voting-form');
  const voteButton = document.querySelector('.vote-button');
  const authButtons = document.getElementById('auth-buttons');
  const notification = document.getElementById('notification');
  const notificationMessage = document.getElementById('notification-message');
  // const googleClientId = "847429882483-05f9mev63nq15t1ccilrjbnb27vrem42.apps.googleusercontent.com"; // Client ID moved here - not required

  // Initialize Google API
  function initializeGoogleSignIn() {
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
      google.accounts.id.initialize({
        // client_id: googleClientId, //No need for client_id here
        callback: handleCredentialResponse,
        auto_prompt: true, // Enable auto prompt
        context: 'signin', // Set the context for the sign-in prompt
        ux_mode: 'popup', // Use popup mode for a cleaner UX
        itp_support: true, // Enable Intelligent Tracking Prevention support
      });
      //  google.accounts.id.prompt();
    } else {
      console.error('Google API is not initialized.');
    }
  }

  initializeGoogleSignIn();

  // Add animate-fade-in class for animation
  const elementsToAnimate = document.querySelectorAll(
    'header, .nomination, .vote-button, footer'
  );
  elementsToAnimate.forEach((element) => {
    element.classList.add('animate-fade-in');
  });

  function checkAuthentication() {
    const userName = localStorage.getItem('userName');
    if (userName) {
      authButtons.style.display = 'none';
      userInfo.style.display = 'flex';
      userNameElement.textContent = userName;
      voteButton.disabled = false;
    } else {
      authButtons.style.display = 'block';
      userInfo.style.display = 'none';
      voteButton.disabled = true;
      userNameElement.textContent = '';
    }
  }

  function handleCredentialResponse(response) {
    if (response && response.credential) {
      try {
        const responsePayload = jwt_decode(response.credential);
        console.log('ID: ' + responsePayload.sub);
        console.log('Full Name: ' + responsePayload.name);
        console.log('Image URL: ' + responsePayload.picture);
        console.log('Email: ' + responsePayload.email);

        localStorage.setItem('userName', responsePayload.name);
        localStorage.setItem('userEmail', responsePayload.email);
        checkAuthentication();
        showNotification('success', 'Вы успешно авторизовались!');
      } catch (error) {
        console.error('Error decoding or storing credentials:', error);
        showNotification(
          'error',
          'Ошибка авторизации. Пожалуйста, попробуйте еще раз.'
        );
