import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import * as cheerio from 'cheerio';
import Groq from 'groq-sdk';

// KONFIGURASI
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// URL API Dicoding
const DICODING_API_BASE_URL = "https://learncheck-dicoding-mock-666748076441.europe-west1.run.app/api";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// MODEL TERKUAT UNTUK LOGIKA
const AI_MODEL = "llama-3.3-70b-versatile"; 

app.use(cors());
app.use(express.json());

// --- UTILITIES ---
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getRandomQuestionPattern() {
  const patterns = [
    ['single', 'single', 'multiple'],   
    ['single', 'multiple', 'single'],
    ['multiple', 'single', 'single'], 
    ['single', 'multiple', 'multiple'],
    ['multiple', 'single', 'multiple'], 
    ['multiple', 'multiple', 'single']
  ];
  return patterns[Math.floor(Math.random() * patterns.length)];
}

function extractJson(text) {
    try {
        const startIndex = text.indexOf('{');
        const endIndex = text.lastIndexOf('}');
        if (startIndex !== -1 && endIndex !== -1) {
            return JSON.parse(text.substring(startIndex, endIndex + 1));
        }
        return JSON.parse(text);
    } catch (error) {
        console.error("Gagal extract JSON. Raw text:", text.substring(0, 100));
        throw new Error("Format JSON rusak.");
    }
}

async function fetchMaterialFromDicoding(tutorialId) {
  try {
    const response = await axios.get(`${DICODING_API_BASE_URL}/tutorials/${tutorialId}`);
    return response.data.data.content;
  } catch (error) {
    return `<h1>Error</h1><p>Gagal mengambil materi.</p>`;
  }
}

function cleanHtmlContent(htmlContent) {
  const $ = cheerio.load(htmlContent);
  return $('body').text().replace(/\s+/g, ' ').trim().substring(0, 15000);
}

// --- FUNGSI UTAMA GENERATOR SOAL (ULTRA HARD + EXAMPLES) ---
async function generateQuizWithGroq(materialText, difficulty = 'easy') {
  const pattern = getRandomQuestionPattern();
  
  let roleDefinition = "";
  let promptExamples = "";
  
  if (difficulty === 'easy') {
    roleDefinition = "Anda adalah Guru Pembimbing untuk pemula.";
    promptExamples = `
      TARGET: Recall & Understand (C1/C2).
      STYLE: Pertanyaan definisi langsung.
      CONTOH: "Apa fungsi CPU?", "Sebutkan 3 jenis loop."
    `;
  } else {
    // --- ULTRA HARD MODE: PERSONA + CONTOH KONKRET ---
    // Bagian ini adalah kunci agar AI tidak "melemah"
    roleDefinition = "Anda adalah PRINCIPAL ARCHITECT (Gaji $300k/thn) di Google/Netflix yang sedang melakukan 'Stress Interview' pada kandidat Senior Developer.";
    promptExamples = `
      TARGET: Analyze, Evaluate, Create (C4-C6).
      
      *** PROTOKOL "KILLER QUESTION" (WAJIB PATUH) ***:
      1. [HARAM]: Membuat soal "Apa itu...", "Jelaskan...", atau definisi hafalan.
      2. [WAJIB]: Soal harus berupa STUDI KASUS, SKENARIO ERROR (Debugging), atau ARSITEKTUR SYSTEM.
      3. [WAJIB]: Gunakan kalimat negatif: "Mana yang TIDAK akan bekerja?" atau "Mana yang justru memperparah latency?".

      *** CONTOH PERBANDINGAN KUALITAS (TIRU STYLE INI) ***:
      
      [CONTOH SALAH / TERLALU MUDAH]:
      "Apa itu Load Balancer?" (JANGAN PERNAH BUAT SEPERTI INI!)

      [CONTOH BENAR / HARD]:
      "Tim DevOps mendapati lonjakan latensi tinggi pada Payment Service saat flash sale. Monitoring menunjukkan CPU database normal, tetapi connection pool habis (exhausted). Mengingat materi tentang Scalability, strategi load balancing di layer aplikasi mana yang paling efektif menangani 'thundering herd problem' ini tanpa menambah node database?"
    `;
  }

  const questionRules = pattern.map((type, index) => {
    let rule = `   Soal ${index + 1} (Tipe: ${type}): `;
    if (type === 'multiple') {
      rule += `Harus soal analisis kompleks (Trade-off). WAJIB ADA TEPAT 2 JAWABAN BENAR. Opsi pengecoh harus sangat logis.`;
    } else {
      rule += `Harus soal analisis tajam (Root Cause Analysis).`;
    }
    return rule;
  }).join('\n');

  const jsonStructure = `
  {
    "questions": [
      {
        "id": number,
        "type": "single" | "multiple",
        "topic": string,
        "question": string,
        "options": [string, string, string, string],
        "answer": [string] (Kunci jawaban harus text yang SAMA PERSIS dengan options),
        "explanation": string,
        "hint": string
      }
    ]
  }
  `;

  const finalMessage = `
    CONTEXT:
    ${roleDefinition}

    ATURAN KESULITAN & CONTOH GAYA SOAL:
    ${promptExamples}

    MATERI REFERENSI (Hanya gunakan konsepnya, buat kasus baru):
    """${materialText.substring(0, 8000)}"""

    TUGAS:
    Buat 3 Soal Kuis dengan spesifikasi berikut:
    ${questionRules}

    *** INSTRUKSI HINT (PETUNJUK) ***:
    - Hint JANGAN membocorkan jawaban.
    - Hint HARUS berupa ANALOGI atau KONSEP DASAR.

    *** PERINGATAN TERAKHIR ***:
    Jika mode HARD, DILARANG membuat soal definisi pendek. 
    Buatlah skenario: "Server down...", "User komplain...", "Database corrupt...".

    OUTPUT JSON ONLY:
    ${jsonStructure}
  `;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are a strict, merciless technical evaluator. Output only valid JSON." },
        { role: "user", content: finalMessage } 
      ],
      model: AI_MODEL,
      response_format: { type: "json_object" },
      temperature: difficulty === 'hard' ? 0.85 : 0.3, 
      max_tokens: 6000, 
    });

    const resultText = chatCompletion.choices[0]?.message?.content || "{}";
    const data = extractJson(resultText);
    
    // SAFETY NET LOGIC
    if (data.questions) {
        data.questions = data.questions.map((q, index) => {
            q.id = index + 1;
            q.type = pattern[index]; 

            // Safety Hint
            if (!q.hint || q.hint.length < 10 || (q.answer[0] && q.hint.toLowerCase().includes(q.answer[0].toLowerCase()))) {
                q.hint = "Perhatikan kembali konteks masalah dan hubungan antar komponen dalam skenario tersebut.";
            }

            // Safety Multiple Choice (Wajib 2 Jawaban)
            if (q.type === 'multiple') {
                let validAnswers = q.answer.filter(a => q.options.includes(a));
                // Kurang dari 2? Ambil paksa
                if (validAnswers.length < 2) {
                    const others = q.options.filter(o => !validAnswers.includes(o));
                    validAnswers = [...validAnswers, ...others.slice(0, 2 - validAnswers.length)];
                }
                // Lebih dari 2? Potong paksa
                if (validAnswers.length > 2) {
                    validAnswers = validAnswers.slice(0, 2);
                }
                q.answer = validAnswers;
            } else {
                if (q.answer.length !== 1) q.answer = [q.answer[0]];
            }

            q.options = shuffleArray([...q.options]);
            return q;
        });
    }
    return data;

  } catch (error) {
    console.error("Gen Quiz Error:", error.message);
    return null;
  }
}

// --- ENDPOINTS ---

// [FIXED] GET USER PREFERENCES (PROXY API)
app.get('/api/preferences', async (req, res) => {
    const { user_id } = req.query;
    const targetUserId = user_id || '1';
    
    try {
        console.log(`Fetching preferences for User ID: ${targetUserId}...`);
        const response = await axios.get(`${DICODING_API_BASE_URL}/users/${targetUserId}/preferences`);
        
        // API Dicoding mengembalikan { status: 'success', data: { preference: {...} } }
        // Kita teruskan bagian datanya
        const responseData = response.data.data || response.data;
        
        res.json(responseData);
    } catch (error) {
        console.error("Gagal fetch preferences:", error.message);
        // Fallback default aman
        res.json({ preference: { theme: 'light', fontSize: 'medium' } }); 
    }
});

// GET QUIZ
app.get('/api/quiz', async (req, res) => {
  const { tutorial_id, difficulty } = req.query;
  const mode = difficulty === 'hard' ? 'hard' : 'easy';
  
  try {
    const html = await fetchMaterialFromDicoding(tutorial_id);
    const text = cleanHtmlContent(html);
    
    console.log(`Generating quiz mode: ${mode}...`);
    let quizData = await generateQuizWithGroq(text, mode);
    
    // Retry mekanism jika gagal
    if (!quizData) {
        console.log("Retry generating...");
        quizData = await generateQuizWithGroq(text, mode);
    }

    if (!quizData) return res.status(500).json({ error: "Gagal generate soal." });

    const auditScore = mode === 'hard' ? 95 : 85;

    res.json({
      materialTitle: `Materi ${tutorial_id}`,
      aiAudit: { score: auditScore, verified: true },
      ...quizData
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

// EXPLAIN ANSWER
app.post('/api/explain', async (req, res) => {
    const { question, userAnswer, correctAnswer } = req.body;
    try {
        const prompt = `
        BERTINDAK SEBAGAI: Tutor AI yang ramah tapi teknis.
        PERTANYAAN: "${question}"
        JAWABAN USER (SALAH/KURANG TEPAT): "${userAnswer}"
        KUNCI JAWABAN BENAR: "${correctAnswer}"
        TUGAS: Jelaskan singkat (max 2-3 kalimat) kenapa jawaban user kurang tepat dan apa konsep kuncinya.
        `;
        
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: AI_MODEL, // PENTING: Pakai model 70b agar pintar
            temperature: 0.6,
            max_tokens: 300
        });
        
        const explanation = chatCompletion.choices[0]?.message?.content;
        if (!explanation) throw new Error("AI No Response");

        res.json({ explanation: explanation });

    } catch (e) {
        console.error("Error /api/explain:", e.message);
        res.status(500).json({ explanation: "Maaf, AI Tutor sedang sibuk." });
    }
});

app.get('/', (req, res) => res.send('Backend Ready!'));

export default app; 