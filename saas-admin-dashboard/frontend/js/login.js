document.addEventListener("DOMContentLoaded", () => {
  if (getToken()) {
    window.location.href = "/dashboard.html";
    return;
  }

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const errorBox = document.getElementById("authError");
  const authTitle = document.getElementById("authTitle");
  const authSub = document.getElementById("authSub");

  const toggleToRegister = document.getElementById("toggleToRegister");
  const toggleToLogin = document.getElementById("toggleToLogin");
  const toggleToRegisterWrap = document.getElementById("toggleToRegisterWrap");
  const toggleToLoginWrap = document.getElementById("toggleToLoginWrap");

  function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
  }
  function hideError() {
    errorBox.hidden = true;
  }

  toggleToRegister.addEventListener("click", (e) => {
    e.preventDefault();
    hideError();
    loginForm.hidden = true;
    registerForm.hidden = false;
    toggleToRegisterWrap.hidden = true;
    toggleToLoginWrap.hidden = false;
    authTitle.textContent = "Create your account";
    authSub.textContent = "Start managing your SaaS business today.";
  });

  toggleToLogin.addEventListener("click", (e) => {
    e.preventDefault();
    hideError();
    loginForm.hidden = false;
    registerForm.hidden = true;
    toggleToRegisterWrap.hidden = false;
    toggleToLoginWrap.hidden = true;
    authTitle.textContent = "Welcome back";
    authSub.textContent = "Sign in to manage your SaaS business.";
  });

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError();
    const form = new FormData(loginForm);
    try {
      const data = await api.post("/auth/login", {
        email: form.get("email"),
        password: form.get("password"),
      });
      setSession(data.token, data.user);
      window.location.href = "/dashboard.html";
    } catch (err) {
      showError(err.message);
    }
  });

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError();
    const form = new FormData(registerForm);
    try {
      const data = await api.post("/auth/register", {
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
      });
      setSession(data.token, data.user);
      window.location.href = "/dashboard.html";
    } catch (err) {
      showError(err.message);
    }
  });
});
