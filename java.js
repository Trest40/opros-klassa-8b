document.addEventListener('DOMContentLoaded', function () {
    const signInButton = document.getElementById('sign-in-button');
    const signOutButton = document.getElementById('sign-out-button');
    const userInfo = document.getElementById('user-info');
    const userNameElement = document.getElementById('user-name');
    const votingForm = document.getElementById('voting-form');
    const messageDiv = document.getElementById('message');
    const voteButton = document.querySelector('.vote-button');
    const nominationsContainer = document.getElementById('nominations-container');

    // Массив номинаций
    const nominations = [
        { id: 'golden_ball', title: 'Золотой мяч', options: ['Степа', 'Мирас', 'Алижан', 'Аднан'] },
        { id: 'art_boss', title: 'Босс художки', options: ['Алиса', 'Вероника', 'Маша', 'Малика'] },
        { id: 'late_boss', title: 'Босс опозданий', options: ['Даниил', 'Асель', 'Ян', 'Руслан'] },
        { id: 'strong_men', title: 'Тестостероновые мужики', options: ['Артур', 'Ян', 'Костя', 'Коля'] },
        { id: 'math_genius', title: 'Алгебраические гении', options: ['Аднан', 'Алижан', 'Акниет', 'Коля'] },
        { id: 'lunch_lovers', title: 'Война войной, а обед по расписанию', options: ['Руслан', 'Алина Р.', 'Степа', 'Шерхан'] },
        { id: 'anti_sport', title: 'Анти-спортсмен', options: ['Шерхан', 'Меседа', 'Алина Т.'] },
        { id: 'it_geek', title: 'Айтишник', options: ['Костя', 'Артур', 'Коля', 'Асылбек'] },
        { id: 'meloman', title: 'Меломан', options: ['Эвелина', 'Коля', 'Ангелина', 'Камиль'] },
        { id: 'loudest', title: 'Самый громкий', options: ['Степа', 'Игорь', 'Ян', 'Руслан'] },
    ];

    // Генерация HTML для номинаций
    nominations.forEach(nomination => {
        const section = document.createElement('section');
        section.className = 'nomination';
        section.id = nomination.id;

        const title = document.createElement('h2');
        title.textContent = nomination.title;

        section.appendChild(title);

        nomination.options.forEach(option => {
            const label = document.createElement('label');
            const input = document.createElement('input');

            input.type = 'radio';
            input.name = nomination.id;
            input.value = option;

            label.appendChild(input);
            label.append(option);
            section.appendChild(label);
        });

        nominationsContainer.appendChild(section);
    });

    // Функции аутентификации
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

        localStorage.setItem('userName', responsePayload.name);
        checkAuthentication();
    }

    window.onload = function () {
        if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
            google.accounts.id.initialize({
                client_id: '847429882483-05f9mev63nq15t1ccilrjbnb27vrem42.apps.googleusercontent.com',
                callback: handleCredentialResponse,
            });
            google.accounts.id.renderButton(signInButton, { theme: 'outline', size: 'large' });
        }
        checkAuthentication();
    };

    signOutButton.addEventListener('click', function () {
        localStorage.clear();
        checkAuthentication();
    });

    // Голосование
    voteButton.addEventListener('click', function (event) {
        event.preventDefault();

        if (!localStorage.getItem('userName')) {
            messageDiv.textContent = 'Пожалуйста, войдите в аккаунт, чтобы проголосовать.';
            messageDiv.style.display = 'block';
            setTimeout(() => { messageDiv.style.display = 'none'; }, 5000);
            return;
        }

        voteButton.textContent = 'Отправка...';
        voteButton.disabled = true;

        const formData = new FormData(votingForm);
        fetch(votingForm.action, {
            method: 'POST',
            body: formData,
        })
            .then(response => response.text())
            .then(() => {
                messageDiv.textContent = 'Спасибо за ваш голос!';
                messageDiv.style.display = 'block';
                votingForm.reset();
            })
            .catch(error => console.error(error))
            .finally(() => {
                voteButton.textContent = 'Голосовать';
                voteButton.disabled = false;
            });
    });
});
