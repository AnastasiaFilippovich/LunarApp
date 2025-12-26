const splash = document.getElementById("splash");
const app = document.getElementById("app");
const enterBtn = document.getElementById("enterBtn");

function enterApp() {
  splash.classList.add("hidden");
  app.classList.remove("hidden");
}

// Кнопка "Войти"
enterBtn.addEventListener("click", enterApp);
