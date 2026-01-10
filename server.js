import express from "express";
import fetch from "node-fetch";
import cors from "cors";
const app = express();
app.use(cors());
app.use(express.json());

// новият Router API
const HF_URL = "https://router.huggingface.co/v1/chat/completions";
const HF_API_KEY = process.env.HF_API_KEY;

app.post("/api/chat", async (req, res) => {
  const prompt = req.body.inputs;
  console.log("📩 Получена заявка от клиента:", prompt);

  try {
    const response = await fetch(HF_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${HF_API_KEY}`,
      },
      // форматът, който Router очаква
      body: JSON.stringify({
        model: "meta-llama/Llama-3.2-1B-Instruct",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
      }),
    });

    const raw = await response.text();
    console.log("💬 Суров отговор:", raw);

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      console.error("⚠️ Неуспешен JSON парсинг.");
      return res.status(500).json({ error: "Invalid JSON from router" });
    }

    res.json(data);
  } catch (err) {
    console.error("⚠️ Грешка при заявката към Router:", err);
    res.status(500).json({ error: "Server error" });
  }
});

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🧱 Статични файлове (показва index.html, style.css, script.js)
app.use(express.static(__dirname));

app.listen(3000, () =>
  console.log("✅ Server running at http://localhost:3000")
);


console.log("hf_wQfPSrz:", HF_API_KEY.slice(0, 10));
