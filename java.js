document.addEventListener('DOMContentLoaded', function () {
  const elements = document.querySelectorAll('main.container, header, footer, button.vote-button');

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
  const form = document.querySelector('#voting-form');
  const messageDiv = document.getElementById('message');

  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    try {
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        messageDiv.textContent = 'Спасибо за ваш голос!';
        messageDiv.style.display = 'block';
        form.reset(); // Очистить форму после отправки
        setTimeout(() => {
          messageDiv.style.display = 'none';
        }, 3000);
      } else {
        messageDiv.textContent = 'Ошибка отправки. Пожалуйста, попробуйте еще раз.';
        messageDiv.style.display = 'block';
        setTimeout(() => {
          messageDiv.style.display = 'none';
        }, 3000);
      }
    } catch (error) {
      messageDiv.textContent = 'Произошла ошибка сети. Пожалуйста, проверьте подключение к интернету.';
      messageDiv.style.display = 'block';
      setTimeout(() => {
        messageDiv.style.display = 'none';
      }, 3000);
    }
  });
});
