app.post("/api/chat", async (req, res) => {
  const { inputs, model } = req.body;

  console.log("🧠 Получена заявка от клиент:");
  console.log("   👉 Модел:", model);
  console.log("   👉 Въпрос:", inputs);

  try {
    let apiUrl = "";
    let headers = {};
    let body = {};

    // 🧩 1. Различни AI доставчици
    if (model === "basic") {
      // ⛔ беше грешно: if (model === "basic") { model === "process.env.HF_API_KEY")
      apiUrl = "https://router.huggingface.co/v1/chat/completions";
      headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
      };
      body = {
        model: "meta-llama/Llama-3.2-1B-Instruct",
        messages: [{ role: "user", content: inputs }],
        max_tokens: 500,
      };
    } else if (model === "gemini") {
      apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${process.env.GOOGLE_API_KEY}`;
      headers = { "Content-Type": "application/json" };
      body = {
        contents: [{ parts: [{ text: inputs }] }],
      };
    } else {
      // 🟠 моделът не е разпознат
      return res.json({ error: "Неподдържан модел: " + model });
    }

    // 📨 Изпращаме заявката към съответния AI
    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // 🩵 Преобразуваме отговора до единен формат
    let replyText = "";

    if (data.choices?.[0]?.message?.content) {
      // Hugging Face & OpenAI формат
      replyText = data.choices[0].message.content;
    } else if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      // Gemini формат
      replyText = data.candidates[0].content.parts[0].text;
    } else if (data.content) {
      replyText = data.content;
    } else {
      replyText = "😕 Няма отговор от модела.";
    }

    // 🎯 Връщаме отговора към клиента (frontend)
    return res.json({
      choices: [{ message: { content: replyText } }],
    });
  } catch (error) {
    console.error("❌ Error calling model:", error);
    res.json({ error: "Проблем при свързване с модела." });
  }
});
