const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const chatLog = document.getElementById("chat-log");

sendBtn.addEventListener("click", async () => {
  const message = userInput.value.trim();
  if (!message) return;

  addMessage("Ти", message);
  userInput.value = "";

  // 🧠 получаваме отговор от сървъра
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

// ⚙️ функция за заявка към твоя сървър
async function getAIResponse(prompt) {
  try {
    const response = await fetch("https://ai-chat-demo.onrender.com/api/chat", {
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

// ➕ по желание – да можеш да изпращаш и с Enter
userInput.addEventListener("keypress", async (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendBtn.click();
  }

});
