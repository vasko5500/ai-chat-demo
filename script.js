const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const chatLog = document.getElementById("chat-log");

sendBtn.addEventListener("click", async () => {
  const message = userInput.value.trim();
  if (!message) return;

  addMessage("Ти", message);
  userInput.value = "";

  const reply = await getAIResponse(message);
  addMessage("AI", reply);
});

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
}

// 🌐 Автоматично избира правилния сървър
const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://ai-chat-demo-v31a.onrender.com"; // <-- сложи твоя реален Render адрес

// 🧠 Изпращане към AI API през нашия сървър
async function getAIResponse(prompt) {
  try {
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inputs: prompt }),
    });

    const data = await response.json();
    console.log("Отговор от сървъра:", data);

    // взимаме текста от отговора на модела
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
    return "⚠️ Проблем при връзката с локалния API.";
  }
}

// ➕ опция – изпращане с Enter
userInput.addEventListener("keypress", async (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendBtn.click();
  }
});

const themeToggle = document.getElementById("theme-toggle");

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

document.getElementById('theme-toggle');

console.log("✅ script.js е зареден");



