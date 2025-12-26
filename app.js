const splash = document.getElementById("splash");
const app = document.getElementById("app");
const enterBtn = document.getElementById("enterBtn");

function enterApp() {
  splash.classList.add("hidden");
  app.classList.remove("hidden");
}

// Кнопка "Войти"
enterBtn.addEventListener("click", enterApp);

const navButtons = document.querySelectorAll(".nav-btn");
const tabs = document.querySelectorAll(".tab");

navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.tab;

    navButtons.forEach(b => b.classList.remove("active"));
    tabs.forEach(t => t.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById("tab-" + target).classList.add("active");
  });
});

// Map pins -> modal
const mapModal = document.getElementById("mapModal");
const mapModalTitle = document.getElementById("mapModalTitle");
const mapModalDesc = document.getElementById("mapModalDesc");
const mapModalClose = document.getElementById("mapModalClose");

document.querySelectorAll(".map__pin").forEach(pin => {
  pin.addEventListener("click", () => {
    mapModalTitle.textContent = pin.dataset.title || "Локация";
    mapModalDesc.textContent = pin.dataset.desc || "";
    mapModal.classList.remove("hidden");
  });
});

mapModalClose.addEventListener("click", () => {
  mapModal.classList.add("hidden");
});

// закрытие по клику на затемнение
mapModal.addEventListener("click", (e) => {
  if (e.target === mapModal) mapModal.classList.add("hidden");
});