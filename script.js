function initializeGoogleSignIn() {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = "https://accounts.google.com/gsi/client";
    script.onload = () => {
      if (google && google.accounts && google.accounts.id) {
        resolve();
      } else {
        console.error("Google Identity Services library failed to load.");
      }
    };
    document.head.appendChild(script);
  });
}

document.addEventListener("DOMContentLoaded", async function () {
  const signInButton = document.getElementById("sign-in-button");
  const signOutButton = document.getElementById("sign-out-button");
  const userInfo = document.getElementById("user-info");
  const userNameElement = document.getElementById("user-name");
  const votingForm = document.getElementById("voting-form");
  const voteButton = document.querySelector(".vote-button");

  function checkAuthentication() {
    const userName = localStorage.getItem("userName");

    if (userName) {
      signInButton.style.display = "none";
      userNameElement.textContent = userName;
      userInfo.style.display = "flex";
      voteButton.disabled = false;
    } else {
      voteButton.disabled = true;
      signInButton.style.display = "block";
      userInfo.style.display = "none";
    }
  }

  function handleCredentialResponse(response) {
    const responsePayload = jwt_decode(response.credential);
    console.log("ID: " + responsePayload.sub);
    console.log("Full Name: " + responsePayload.name);
    console.log("Image URL: " + responsePayload.picture);
    console.log("Email: " + responsePayload.email);

    localStorage.setItem("userName", responsePayload.name);
    localStorage.setItem("userEmail", responsePayload.email);
    checkAuthentication();
  }

  try {
    await initializeGoogleSignIn();
    google.accounts.id.initialize({
      client_id:
        "847429882483-05f9mev63nq15t1ccilrjbnb27vrem42.apps.googleusercontent.com",
      callback: handleCredentialResponse,
    });
    google.accounts.id.renderButton(signInButton, {
      theme: "outline",
      size: "large",
    });
    checkAuthentication();
  } catch (error) {
    console.error("Error initializing Google Sign-In:", error);
  }

  signOutButton.addEventListener("click", function () {
    localStorage.clear();
    checkAuthentication();
    voteButton.disabled = false;
    voteButton.textContent = "Голосовать";
  });

  voteButton.addEventListener("click", function (event) {
    event.preventDefault();

    if (localStorage.getItem("userName")) {
      submitForm();
    } else {
      alert("Пожалуйста, войдите в аккаунт, чтобы проголосовать.");
      document
        .getElementById("auth-container")
        .scrollIntoView({ behavior: "smooth" });
      signInButton.click();
    }
  });

  function submitForm() {
    voteButton.textContent = "Отправка...";
    voteButton.disabled = true
