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
    if (model === "gpt-4" || model === "gpt-3.5-turbo") {
      apiUrl = "https://api.openai.com/v1/chat/completions";
      headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      };
      body = {
        model: model,
        messages: [{ role: "user", content: inputs }],
      };
    } else if (model === "claude") {
      apiUrl = "https://api.anthropic.com/v1/messages";
      headers = {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
      };
      body = {
        model: "claude-3-5-sonnet-20241022",
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
      // ако моделът не е разпознат
      return res.json({ error: "Неподдържан модел: " + model });
    }

    // 📨 Изпращаме заявката към съответния API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // 🩵 Превеждаме резултата до simple формат за фронтенда
    let replyText = "";

    if (data.choices?.[0]?.message?.content) {
      replyText = data.choices[0].message.content;
    } else if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      replyText = data.candidates[0].content.parts[0].text;
    } else if (data.content) {
      replyText = data.content;
    } else {
      replyText = "😕 Няма отговор от модела.";
    }

    return res.json({
      choices: [{ message: { content: replyText } }],
    });
  } catch (error) {
    console.error("❌ Error calling model:", error);
    res.json({ error: "Проблем при свързване с модела." });
  }
});
