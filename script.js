// 🧱 елементи
const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const chatLog = document.getElementById("chat-log");

// 🔘 Текущ избран модел
let currentModel = "gpt-4";

// 🧭 Свързваме бутоните за модели
const modelButtons = document.querySelectorAll(".model-btn");

modelButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentModel = btn.dataset.model;

    // визуално маркираме избрания бутон
    modelButtons.forEach((b) => b.classList.remove("active-model"));
    btn.classList.add("active-model");

    console.log("✅ Избран модел:", currentModel);
  });
});

sendBtn.addEventListener("click", async () => {
  const message = userInput.value.trim();
  if (!message) return;
  
  // 🟦 Твоето съобщение
  addMessage("Ти", message);
  userInput.value = "";

  try {
    // 🧠 Взимаме отговор от AI
    const reply = await getAIResponse(message);

    // 🖋️ Показваме анимирано изписване (без “пише...” индикация)
    const messageDiv = document.createElement("div");
    const bubble = document.createElement("div");
    messageDiv.classList.add("message", "ai");
    bubble.classList.add("bubble");
    messageDiv.appendChild(bubble);
    chatLog.appendChild(messageDiv);
    chatLog.scrollTop = chatLog.scrollHeight;

    let index = 0;
    const speed = 3;

    function type() {
      if (index < reply.length) {
        bubble.textContent += reply.charAt(index);
        index++;
        chatLog.scrollTop = chatLog.scrollHeight;
        setTimeout(type, speed);
      } else {
        saveMessage("AI", reply);
      }
    }
    type();
  } catch (error) {
    addMessage("AI", "⚠️ Възникна грешка при свързване с AI.");
    console.error("Грешка:", error);
  }
});

// ➤ добавяне на съобщение в чата
function addMessage(sender, text) {
  const messageDiv = document.createElement("div");
  const bubble = document.createElement("div");

  messageDiv.classList.add("message");
  bubble.classList.add("bubble");

  if (sender === "Ти") {
    messageDiv.classList.add("user");
  } else {
    messageDiv.classList.add("ai");
  }

  bubble.textContent = text;
  messageDiv.appendChild(bubble);
  chatLog.appendChild(messageDiv);
  chatLog.scrollTop = chatLog.scrollHeight;

  saveMessage(sender, text); // 💾 записва съобщението
}

// 💾 Запис на съобщение в localStorage
function saveMessage(sender, text) {
  let history = JSON.parse(localStorage.getItem("chatHistory")) || [];
  history.push({ sender, text });
  localStorage.setItem("chatHistory", JSON.stringify(history));
}

// 📜 Зареждане на съобщения от localStorage
function loadChatHistory() {
  const history = JSON.parse(localStorage.getItem("chatHistory")) || [];
  history.forEach((msg) => {
    const messageDiv = document.createElement("div");
    const bubble = document.createElement("div");

    messageDiv.classList.add("message");
    bubble.classList.add("bubble");
    if (msg.sender === "Ти") {
      messageDiv.classList.add("user");
    } else {
      messageDiv.classList.add("ai");
    }

    bubble.textContent = msg.text;
    messageDiv.appendChild(bubble);
    chatLog.appendChild(messageDiv);
  });

  chatLog.scrollTop = chatLog.scrollHeight;
}

// 🧹 Изчистване на историята
function clearChatHistory() {
  localStorage.removeItem("chatHistory");
  chatLog.innerHTML = "";
}

// 🌐 Избира правилния сървър
const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://ai-chat-demo-v31a.onrender.com";

// 🧠 Изпраща заявка към AI сървъра
async function getAIResponse(prompt) {
  try {
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inputs: prompt,
        model: currentModel, // 💡 добавяме избрания модел
      }),
    });

    const data = await response.json();
    console.log("Отговор от сървъра:", data);

    const reply = data.choices?.[0]?.message?.content;
    if (reply) {
      return reply;
    } else if (data.error) {
      return "⚠️ Грешка: " + data.error;
    } else {
      return "❌ Няма отговор от модела.";
    }
  } catch (err) {
    console.error("Fetch error:", err);
    return "⚠️ Проблем при връзката с API.";
  }
}

// ➕ Опция – Enter също изпраща
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendBtn.click();
  }
});

// 🧭 Зареждаме всичко когато страницата е готова
window.addEventListener("DOMContentLoaded", () => {
  console.log("✅ script.js е зареден");
  loadChatHistory(); // зарежда историята при стартиране

  // 🎨 Логика за темите:
  const buttons = {
    light: document.getElementById("light-btn"),
    dark: document.getElementById("dark-btn"),
    blue: document.getElementById("blue-btn"),
  };

  function applyTheme(theme) {
    document.body.classList.remove("dark", "blue");
    if (theme !== "light") document.body.classList.add(theme);
    localStorage.setItem("selectedTheme", theme);
  }

  // 🔁 зарежда последната избрана тема
  const saved = localStorage.getItem("selectedTheme");
  if (saved) applyTheme(saved);

  // 🖱️ свързва бутоните за теми
  Object.keys(buttons).forEach((key) => {
    if (buttons[key]) {
      buttons[key].addEventListener("click", () => applyTheme(key));
    }
  });
});









