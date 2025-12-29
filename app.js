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

// --- RADIO CONFIG ---
const stations = [
  { freq: "100.1", type: "empty" },
  { freq: "100.3", type: "empty" },
  { freq: "100.5", type: "msg", src: "assets/radio/msg1.mp3", name: "SIGNAL FOUND" },

  { freq: "100.7", type: "empty" },
  { freq: "100.9", type: "empty" },
  { freq: "101.1", type: "msg", src: "assets/radio/msg2.mp3", name: "SIGNAL FOUND" },

  { freq: "101.3", type: "empty" },
  { freq: "101.5", type: "music", src: "assets/radio/music.mp3", name: "CAKE IS LIE" , volume: 0.05 },

  { freq: "101.7", type: "empty" },
  { freq: "101.9", type: "msg", src: "assets/radio/key.mp3", name: "SIGNAL FOUND" },
];

let radioIndex = 0;
let radioOn = false;
let audioLocked = false;

// Чтобы не проигрывать станцию повторно, если человек просто сидит на частоте
let lastPlayedIndex = null;

// --- AUDIO ---
const staticAudio = new Audio("assets/radio/static.mp3");
staticAudio.loop = true;
staticAudio.volume = 0;

let stationAudio = null;

// --- UI ---
const elFreq = document.getElementById("radioFreq");
const elStatus = document.getElementById("radioStatus");
const btnPrev = document.getElementById("radioPrev");
const btnNext = document.getElementById("radioNext");
const btnPower = document.getElementById("radioPower");

function setStatus(text) {
  if (elStatus) elStatus.textContent = text;
}

function setFreq() {
  if (elFreq) elFreq.textContent = `${stations[radioIndex].freq} MHz`;
}

// Плавная смена громкости
function fadeTo(audio, target, ms = 500) {
  if (!audio) return;
  const start = audio.volume;
  const diff = target - start;
  const steps = 20;
  const stepMs = ms / steps;
  let i = 0;

  const timer = setInterval(() => {
    i++;
    audio.volume = Math.max(0, Math.min(1, start + diff * (i / steps)));
    if (i >= steps) clearInterval(timer);
  }, stepMs);
}

// Остановить текущую станцию
function stopStation() {
  if (stationAudio) {
    stationAudio.pause();
    stationAudio.currentTime = 0;
    stationAudio = null;
  }
}

function playStationOnce(st) {
  stopStation();

  stationAudio = new Audio(st.src);
  stationAudio.loop = false;
  stationAudio.volume = st.volume ?? 1;

  stationAudio.addEventListener("ended", () => {
    setStatus("NO SIGNAL");
    fadeTo(staticAudio, 0.35, 600);
  });

  stationAudio.play().catch(() => {
    audioLocked = true;
    setStatus("PRESS POWER");
  });
}

function tune() {
  if (!radioOn) return;

  const st = stations[radioIndex];
  setFreq();

  // Всегда держим шум включенным (loop)
  // но громкость зависит от типа частоты
  if (st.type === "empty") {
    setStatus("NO SIGNAL");
    stopStation();
    fadeTo(staticAudio, 0.35, 250);
    lastPlayedIndex = null; // чтобы при возвращении на станцию она играла
    return;
  }

  // Есть станция
  setStatus(st.name || "SIGNAL");

  // Если мы уже проиграли эту станцию и не уходили — не повторяем, просто шум
  if (lastPlayedIndex === radioIndex) {
    fadeTo(staticAudio, 0.2, 250);
    return;
  }

  // При попадании на станцию: шум приглушаем, проигрываем сообщение 1 раз
  fadeTo(staticAudio, 0.08, 400);

  playStationOnce(st);
  lastPlayedIndex = radioIndex;
}

function powerOn() {
  radioOn = true;
  audioLocked = false;
  setFreq();
  setStatus("NO SIGNAL");

  staticAudio.play().catch(() => { audioLocked = true; setStatus("PRESS POWER"); });
  fadeTo(staticAudio, 0.35, 400);

  updatePowerUI();
  tune();
}

function powerOff() {
  radioOn = false;
  audioLocked = false;
  setStatus("POWER OFF");
  stopStation();
  fadeTo(staticAudio, 0, 250);
  updatePowerUI();
}

function step(dir) {
  if (!radioOn) return;
  radioIndex = (radioIndex + dir + stations.length) % stations.length;
  tune();
}

// --- EVENTS ---
btnPower?.addEventListener("click", async () => {
  // Если выключено — включаем
  if (!radioOn) {
    powerOn();
    return;
  }

  // Если включено, но звук заблокирован — пытаемся “разблокировать”, НЕ выключая радио
  if (audioLocked) {
    audioLocked = false;

    // пробуем заново стартануть шум и текущую станцию
    staticAudio.play().catch(() => { audioLocked = true; });
    tune();

    // если снова не вышло — статус уже покажется через catch
    return;
  }

  // Иначе обычное выключение
  powerOff();
});

btnPrev?.addEventListener("click", () => step(-1));
btnNext?.addEventListener("click", () => step(+1));

function updatePowerUI() {
  if (!btnPower) return;
  btnPower.textContent = "Питание";
  btnPower.classList.toggle("btn--power-on", radioOn);
  btnPower.classList.toggle("btn--power-off", !radioOn);
}

// Инициализация отображения
setFreq();
setStatus("POWER OFF");
updatePowerUI();

const fileModal = document.getElementById("fileModal");
const fileModalTitle = document.getElementById("fileModalTitle");
const fileModalText = document.getElementById("fileModalText");
const fileModalClose = document.getElementById("fileModalClose");

const passModal = document.getElementById("passModal");
const passInput = document.getElementById("passInput");
const passOk = document.getElementById("passOk");
const passCancel = document.getElementById("passCancel");
const passError = document.getElementById("passError");

const videoModal = document.getElementById("videoModal");
const videoModalTitle = document.getElementById("videoModalTitle");
const videoModalClose = document.getElementById("videoModalClose");
const videoPlayer = document.getElementById("videoPlayer");
const videoSource = document.getElementById("videoSource");

const FILE_PASSWORD = "YIPPEE";

let pendingLockedFile = null; // сюда кладём кнопку файла, если он locked

function show(el) {
  el?.classList.remove("hidden");
}
function hide(el) {
  el?.classList.add("hidden");
}

fileModalClose?.addEventListener("click", () => hide(fileModal));
videoModalClose?.addEventListener("click", () => {
  // остановить видео при закрытии
  if (videoPlayer) {
    videoPlayer.pause();
    videoPlayer.currentTime = 0;
  }
  hide(videoModal);
});

passCancel?.addEventListener("click", () => {
  pendingLockedFile = null;
  passInput.value = "";
  passError.textContent = "";
  hide(passModal);
});

passOk?.addEventListener("click", () => {
  const entered = (passInput.value || "").trim().toUpperCase();
  if (entered !== FILE_PASSWORD) {
    passError.textContent = "ACCESS DENIED";
    return;
  }
  passError.textContent = "";
  hide(passModal);

  // Открываем видео
  if (pendingLockedFile) {
    const src = pendingLockedFile.getAttribute("data-src");
    const title = pendingLockedFile.getAttribute("data-title") || "Video";
    openVideo(title, src);
  }

  pendingLockedFile = null;
  passInput.value = "";
});

passInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") passOk?.click();
});

function openTextFile(title, text) {
  fileModalTitle.textContent = title || "File";
  fileModalText.textContent = text || "";
  show(fileModal);
}

function openVideo(title, src) {
  videoModalTitle.textContent = title || "Video";

  if (!src) {
    openTextFile("ERROR", "Видео не найдено (не указан путь src).");
    return;
  }

  videoSource.src = src;
  videoPlayer.load();
  show(videoModal);
}

document.querySelectorAll(".files__item").forEach((btn) => {
  btn.addEventListener("click", () => {
    const status = btn.getAttribute("data-status");

    // Открываем только available + locked (через пароль)
    if (status === "available") {
      const type = (btn.getAttribute("data-type") || "").toLowerCase();
      const title = btn.getAttribute("data-title") || "File";

      if (type === "txt") {
        const text = btn.getAttribute("data-text") || "";
        openTextFile(title, text);
        return;
      }

      if (type === "jpg" || type === "png" || type === "jpeg" || type === "webp") {
        const src = btn.getAttribute("data-src");
        openImage(title, src);
        return;
      }

      openTextFile(title, "FILE доступен, но предпросмотр для этого типа пока не настроен.");
      return;
    }

    if (status === "locked") {
      pendingLockedFile = btn;
      passInput.value = "";
      passError.textContent = "";
      show(passModal);
      passInput.focus();
      return;
    }

    // На всякий случай, если забудешь поставить disabled
    openTextFile("ACCESS", "Этот файл недоступен.");
  });
});

const imgModal = document.getElementById("imgModal");
const imgModalTitle = document.getElementById("imgModalTitle");
const imgViewer = document.getElementById("imgViewer");
const imgModalClose = document.getElementById("imgModalClose");

imgModalClose?.addEventListener("click", () => hide(imgModal));

function openImage(title, src) {
  imgModalTitle.textContent = title || "Image";

  if (!src) {
    openTextFile("ERROR", "Изображение не найдено (не указан путь src).");
    return;
  }

  imgViewer.src = src;
  show(imgModal);
}