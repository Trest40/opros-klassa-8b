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

  function checkAuthentication() {
    const userName = localStorage.getItem('userName');
    if (userName) {
      voteButton.disabled = false;
      signInButton.style.display = 'none';
      userNameElement.textContent = userName;
      userInfo.style.display = 'flex';
    } else {
      voteButton.disabled = true;
      signInButton.style.display = 'block';
      userInfo.style.display = 'none';
    }
  }

  function handleCredentialResponse(response) {
    const responsePayload = jwt_decode(response.credential);
    localStorage.setItem('userName', responsePayload.name);
    checkAuthentication();
  }

  window.onload = function() {
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      checkAuthentication();
    } else {
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
    }
  }

  signOutButton.addEventListener('click', function() {
    localStorage.clear();
    checkAuthentication();
  });

  votingForm.addEventListener('submit', function (event) {
    event.preventDefault();
    if (voteButton.disabled) {
      messageDiv.textContent = 'Вы не выполнили вход!';
      messageDiv.style.display = 'block';
      window.location.href = '#top';
      setTimeout(() => { messageDiv.style.display = 'none'; }, 5000);
      return;
    }
    const formData = new FormData(votingForm);

    fetch('https://formspree.io/f/xkgnlvgv', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(response => {
      if (response.ok) {
        messageDiv.textContent = 'Успех!';
        messageDiv.style.display = 'block';
        votingForm.reset();
        setTimeout(() => { messageDiv.style.display = 'none'; }, 5000);
      } else {
        messageDiv.textContent = 'Произошла ошибка при отправке голоса.';
        messageDiv.style.display = 'block';
        setTimeout(() => { messageDiv.style.display = 'none'; }, 5000);
      }
    })
    .catch(error => {
      messageDiv.textContent = 'Произошла ошибка при отправке голоса.';
      messageDiv.style.display = 'block';
      setTimeout(() => { messageDiv.style.display = 'none'; }, 5000);
    });
  });

  if (voteButton) {
    voteButton.addEventListener('mouseover', function () {
      voteButton.style.transform = 'scale(1.08) translateY(-3px)';
      voteButton.style.boxShadow = '0 0 20px gold';
    });

    voteButton.addEventListener('mouseout', function () {
      voteButton.style.transform = 'scale(1) translateY(0)';
      voteButton.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.4)';
    });
  }
});
