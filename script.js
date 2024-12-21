document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('myForm');
    const submitButton = document.getElementById('submit-button');
    const userEmailInput = document.getElementById('user-email');
    const candidateCards = document.querySelectorAll('.candidate-card');

    function handleCredentialResponse(response) {
        const responsePayload = decodeJwtResponse(response.credential);
        userEmailInput.value = responsePayload.email;
        submitButton.disabled = false;
        console.log("Email: " + responsePayload.email);
    }

    function decodeJwtResponse(token) {
        let base64Url = token.split('.')[1];
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        let jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    }

    window.onload = function () {
        google.accounts.id.initialize({
            client_id: '847429882483-05f9mev63nq15t1ccilrjbnb27vrem42.apps.googleusercontent.com',
            callback: handleCredentialResponse
        });
        google.accounts.id.renderButton(
            document.getElementById("g_id_onload"),
            { theme: "dark", size: "large" }
        );
    }

    form.addEventListener('submit', function(event) {
        if (!userEmailInput.value) {
            event.preventDefault();
            alert('Пожалуйста, войдите через Google перед отправкой формы.');
        }
    });

    candidateCards.forEach(card => {
        card.addEventListener('click', function() {
            candidateCards.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            const radio = this.querySelector('input[type="radio"]');
            radio.checked = true;
        });
    });
});
