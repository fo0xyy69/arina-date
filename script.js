const API_URL = "https://arina-date-telegram.strygin647.workers.dev";

const state = {
  date: "",
  time: "",
  activity: "",
  food: ""
};

const data = {
  date: [
    ["📅 Сегодня", "Сегодня"],
    ["🌸 Завтра", "Завтра"],
    ["💗 В ближайшие дни", "В ближайшие дни"],
    ["🫶 Когда тебе удобно", "Когда тебе удобно"]
  ],
  time: [
    ["🌅 Утро", "Утро"],
    ["☀️ День", "День"],
    ["🌇 Вечер", "Вечер"],
    ["🌙 Поздний вечер", "Поздний вечер"]
  ],
  activity: [
    ["🍿 Фильм", "Посмотреть фильм"],
    ["🚶 Прогулка", "Погулять вместе"],
    ["🎮 Игры", "Поиграть"],
    ["🍽️ Свидание", "Красиво провести вечер"],
    ["🏠 Дома", "Остаться дома"],
    ["❤️ Сюрприз", "Андрей, придумай сам"]
  ],
  food: [
    ["🍕 Пицца", "Пицца"],
    ["🍣 Суши", "Суши"],
    ["🍔 Бургеры", "Бургеры"],
    ["🍝 Что-нибудь вкусное", "Что-нибудь вкусное"],
    ["🍰 Десерт", "Десерт"],
    ["🤷 Выбирай сам", "Андрей, выбери сам"]
  ]
};

function renderOptions(id, items, key) {
  const box = document.getElementById(id);
  box.innerHTML = "";
  items.forEach(([label, value]) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.innerHTML = label;
    btn.onclick = () => {
      state[key] = value;
      box.querySelectorAll(".option").forEach(x => x.classList.remove("selected"));
      btn.classList.add("selected");
    };
    box.appendChild(btn);
  });
}

function start() {
  renderOptions("dateOptions", data.date, "date");
  renderOptions("timeOptions", data.time, "time");
  renderOptions("activityOptions", data.activity, "activity");
  renderOptions("foodOptions", data.food, "food");
  go("date");
}

function go(id) {
  const required = {
    time: ["date", "Сначала выбери дату ❤️"],
    activity: ["time", "Сначала выбери время ❤️"],
    food: ["activity", "Сначала выбери занятие ❤️"]
  };

  if (required[id] && !state[required[id][0]]) {
    alert(required[id][1]);
    return;
  }

  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

async function finish() {
  if (!state.food) {
    alert("Выбери, что будем кушать ❤️");
    return;
  }

  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById("done").classList.add("active");

  document.getElementById("summary").innerHTML = `
    <div class="summary-row"><span class="summary-label">📅 Дата</span><span class="summary-value">${escapeHtml(state.date)}</span></div>
    <div class="summary-row"><span class="summary-label">⏰ Время</span><span class="summary-value">${escapeHtml(state.time)}</span></div>
    <div class="summary-row"><span class="summary-label">🥰 Занятие</span><span class="summary-value">${escapeHtml(state.activity)}</span></div>
    <div class="summary-row"><span class="summary-label">🍽️ Еда</span><span class="summary-value">${escapeHtml(state.food)}</span></div>
  `;

  const sending = document.getElementById("sending");

  if (!API_URL || API_URL === "YOUR_CLOUDFLARE_WORKER_URL") {
    sending.textContent = "Сайт готов. Осталось подключить Telegram ❤️";
    document.getElementById("again").style.display = "inline-block";
    return;
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state)
    });

    if (!response.ok) throw new Error("send failed");

    sending.textContent = "Андрей уже получил твой выбор ❤️";
  } catch (e) {
    sending.textContent = "Не получилось отправить выбор. Попробуй ещё раз.";
    document.getElementById("again").style.display = "inline-block";
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
