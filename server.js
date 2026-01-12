import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config(); // зарежда .env локално

const app = express();
app.use(cors());
app.use(express.json());

// 📍 HuggingFace router settings
const HF_API_KEY = process.env.HF_API_KEY;
const HF_URL = "https://router.huggingface.co/v1/chat/completions";

// 📍 Gemini settings
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent";
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

app.post("/api/chat", async (req, res) => {
  const { inputs, model } = req.body;

  console.log("📩 Получена заявка:");
  console.log("   ▶️ Модел:", model);
  console.log("   💬 Въпрос:", inputs);

  try {
    let apiUrl = "";
    let headers = {};
    let body = {};

    if (model === "basic") {
      apiUrl = HF_URL;
      headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${HF_API_KEY}`,
      };
      body = {
        model: "meta-llama/Llama-3.2-1B-Instruct",
        messages: [{ role: "user", content: inputs }],
        max_tokens: 300,
      };
    } else if (model === "gemini") {
      apiUrl = `${GEMINI_URL}?key=${GOOGLE_API_KEY}`;
      headers = { "Content-Type": "application/json" };
      body = {
        contents: [{ parts: [{ text: inputs }] }],
      };
    } else {
      return res.json({ error: "Непознат модел: " + model });
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const raw = await response.text();
    console.log("💬 Суров отговор:", raw.slice(0, 200));

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      console.error("⚠️ Неуспешен JSON парсинг.");
      return res.status(500).json({ error: "Invalid JSON от модела." });
    }

    // 🩵 Еднотипен изход към frontend
    let replyText = "";
    if (data.choices?.[0]?.message?.content) {
      replyText = data.choices[0].message.content;
    } else if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      replyText = data.candidates[0].content.parts[0].text;
    } else {
      replyText = "😕 Няма отговор от модела.";
    }

    res.json({ choices: [{ message: { content: replyText } }] });
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ error: "Грешка при комуникацията с AI." });
  }
});

// 🏗️ Настройка на статичните файлове
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(__dirname));

app.listen(3000, () =>
  console.log("✅ Server running at http://localhost:3000")
);

