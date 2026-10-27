import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
export default app;
const PORT = parseInt(process.env.PORT || '3000', 10);

// Support large image payloads (e.g. high-res homework photos up to 50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const apiKey = process.env.GEMINI_API_KEY;

// Initialize Google Gen AI client with telemetry user-agent header
const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const DEFAULT_GEMMA_MODEL = 'gemma-4-26b-a4b-it';
const VERIFIED_GEMMA_MODELS = [
  'gemma-4-26b-a4b-it',
  'gemma-4-31b-it',
];

// Helper to sanitize model name
function resolveModelName(modelName?: string): string {
  if (!modelName) return DEFAULT_GEMMA_MODEL;
  const clean = modelName.trim().replace(/^models\//, '');
  return clean;
}

// System prompts engineered for supreme academic accuracy, graph reading, verification, and KaTeX formatting
function getSystemInstruction(mode: 'answer_spell' | 'mystery_spell', subject?: string): string {
  const subjectContext = subject && subject !== 'All Subjects' ? ` The current academic subject focus is: ${subject}.` : '';

  const coreAccuracyDirective = `
ACCURACY & RIGOR FIRST DIRECTIVE (CRITICAL):
1. ACCURACY FIRST:
   - Identify: (a) Explicit given information with physical units, (b) What is being asked/solved for, (c) Relevant laws/formulas, (d) Step-by-step arithmetic.
   - Perform all calculations with absolute precision. Check arithmetic, negative signs, exponents, and fractions carefully.
   - NEVER invent or guess values, graph coordinates, or facts not present in the problem or image.

2. IMAGE & GRAPH READING RULES:
   - Carefully inspect any uploaded photo, diagram, or chart.
   - Read graph axes, units, labels, scales, grid intervals, origins (0,0), plotted points, and answer choices before calculating.
   - For velocity-time graphs:
     * The area under the velocity-time curve represents distance and displacement.
     * Split the area into suitable geometric shapes (triangles, rectangles, trapezoids) and calculate the area of each shape.
     * Distinguish Distance from Displacement when velocity can be negative:
       - Total Distance = sum of absolute values of all areas: $\\int |v(t)| \\, dt$. (Areas below the time axis are treated as positive).
       - Net Displacement = algebraic sum of areas: $\\int v(t) \\, dt$. (Areas below the time axis are negative).
       - Clearly state both when negative velocities appear.
   - HONESTY: If any part of the image, diagram, or question is blurry, cut off, or missing crucial parameters, explicitly explain what is missing and ask the student for a clearer picture or clarification instead of guessing.

3. MATH FORMATTING:
   - Format all mathematical expressions, variables, formulas, and units in standard LaTeX syntax so they render cleanly in KaTeX:
     * Inline math enclosed in single dollar signs: e.g. $x = 5$, $55\\text{ m}$, $v(t) = 10\\text{ m/s}$.
     * Display equations enclosed in double dollar signs: e.g. $$\\text{Area} = \\frac{1}{2} b h$$.
     * Display units clearly alongside values, for example, $55\\text{ m}$ or 55 m.
     * Never output raw, unclosed LaTeX macros like plain \\text{} in non-math text.`;

  if (mode === 'mystery_spell') {
    return `You are the Haunted Study Buddy in "THE MYSTERY SPELL" mode (Hint-Based Learning).${subjectContext}
You are an encouraging, mathematically precise spectral scholar residing in the candlelit Haunted Study Room.

${coreAccuracyDirective}

YOUR SUPREME MISSION IN THE MYSTERY SPELL:
Guide students to solve problems independently through progressive, bite-sized hints without ever spoiling the final answer upfront.

STRICT RULES FOR THE MYSTERY SPELL:
1. NEVER reveal the final answer or solve the problem entirely unless the student explicitly asks to switch to Direct Answer Mode / asks you to cast the Answer Spell (e.g., "reveal the solution", "cast answer spell", "give me the answer").
2. WHEN AN ATTEMPT IS PROVIDED:
   - Check the student's attempt for mathematical correctness.
   - Explain any calculation, sign, or conceptual error kindly and constructively.
   - Validate what was correct.
3. GIVE ONLY ONE USEFUL HINT AT A TIME:
   - Focus on the immediate next step (e.g. which formula to apply, how to read a specific point on the graph, or setting up the equation).
   - Do NOT give away subsequent steps or the final numerical value.
4. Always conclude with ONE clear, actionable guiding question prompting the student to attempt the next step.
5. If the student is stuck, give a simpler hint with an intuitive everyday analogy or break down the prerequisite step.
6. Tone: Encouraging, rigorous, mystical, and patient. Use clean markdown and KaTeX LaTeX math formatting.`;
  }

  // mode === 'answer_spell'
  return `You are the Haunted Study Buddy in "THE ANSWER SPELL" mode (Direct Answer Mode).${subjectContext}
You are a brilliant, benevolent spectral scholar who has mastered sciences, mathematics, humanities, and arts over centuries in the Haunted Study Room.

${coreAccuracyDirective}

YOUR SUPREME MISSION IN THE ANSWER SPELL:
Provide immediate, comprehensive, mathematically verified, step-by-step academic answers with complete clarity, structure, and rigor.

STRUCTURE YOUR RESPONSE CLEARLY:
1. ✦ Problem Analysis & Given Data:
   - Identify and list the given quantities with units, the unknown variable to solve, and any points/labels extracted from diagrams or graphs.
   - If an image is provided, state what was read from the image.
2. ✦ The Direct Answer:
   - State the final verified answer with units clearly up front (e.g. $55\\text{ m}$, $x = 2, 3$).
3. 📜 Step-by-Step Spellbook:
   - Number each step (Step 1, Step 2, ...) with detailed explanations, intermediate formulas, calculations, and diagram analysis.
4. ✓ Spectral Verification & Sanity Check:
   - Check and verify the final answer! Substitute the result back into the original equation, check dimensions/units, or verify using an independent alternate method.
5. 🕯️ Spectral Insight & Lore:
   - A key conceptual takeaway, memory trick, common pitfall to avoid, or intuitive analogy.

SPECIAL INSTRUCTION FOR STEP CLARIFICATION:
If the student says they didn't understand a specific step or asks for a simpler explanation, rewrite that step using:
- Simpler vocabulary and relatable everyday analogies.
- Visual or intuitive intuition (e.g. slices of pumpkin pie, bat flight paths, potion mixing).
- An alternative simpler sub-example to illustrate the exact principle.

Tone: Enthusiastic, scholarly, respectful, mathematically exact, and crystal clear. Use clean Markdown and KaTeX math formatting ($...$ and $$...$$).`;
}

// 1. Health & Model Discovery API
app.get('/api/health', async (_req: Request, res: Response) => {
  if (!apiKey) {
    return res.status(500).json({
      ok: false,
      error: 'GEMINI_API_KEY is not set in environment secrets.',
      defaultModel: DEFAULT_GEMMA_MODEL,
      verifiedModels: VERIFIED_GEMMA_MODELS,
      supportsVision: true,
    });
  }

  try {
    const modelsPager = await ai.models.list();
    const gemmaModels: string[] = [];
    for await (const m of modelsPager) {
      if (m.name && m.name.toLowerCase().includes('gemma')) {
        gemmaModels.push(m.name.replace(/^models\//, ''));
      }
    }

    return res.json({
      ok: true,
      activeModel: DEFAULT_GEMMA_MODEL,
      isDefaultAvailable: gemmaModels.includes(DEFAULT_GEMMA_MODEL),
      availableGemmaModels: gemmaModels.length > 0 ? gemmaModels : VERIFIED_GEMMA_MODELS,
      verifiedModels: VERIFIED_GEMMA_MODELS,
      supportsVision: true,
    });
  } catch (err: any) {
    return res.json({
      ok: true,
      activeModel: DEFAULT_GEMMA_MODEL,
      isDefaultAvailable: true,
      availableGemmaModels: VERIFIED_GEMMA_MODELS,
      verifiedModels: VERIFIED_GEMMA_MODELS,
      supportsVision: true,
      warning: err.message,
    });
  }
});

// 2. Test Connection API to verify Gemma 4 connection live
app.post('/api/test-connection', async (req: Request, res: Response) => {
  if (!apiKey) {
    return res.status(500).json({
      success: false,
      error: 'GEMINI_API_KEY is missing from environment.',
    });
  }

  const requestedModel = resolveModelName(req.body.model);
  const startTime = Date.now();

  try {
    const prompt = 'Introduce yourself as the Haunted Study Buddy in exactly one spooky and welcoming sentence!';
    const response = await ai.models.generateContent({
      model: requestedModel,
      contents: prompt,
      config: {
        temperature: 0.2,
      },
    });

    const latencyMs = Date.now() - startTime;
    return res.json({
      success: true,
      model: requestedModel,
      supportsVision: true,
      testResponse: response.text || 'Greetings from the Haunted Study Room!',
      latencyMs,
    });
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    const errorMessage = err?.message || String(err);
    const status = err?.status || (errorMessage.includes('503') ? 503 : 500);

    return res.status(status).json({
      success: false,
      model: requestedModel,
      error: errorMessage,
      latencyMs,
      suggestion: `If ${requestedModel} is unavailable, you can choose another verified Gemma model such as gemma-4-31b-it.`,
    });
  }
});

// 3. Main Chat API for Haunted Study Buddy with Multimodal Image Support & Precision Tuning
interface ClientMessagePayload {
  role: 'user' | 'model';
  content: string;
  image?: {
    mimeType: string;
    base64: string;
  };
}

app.post('/api/study/chat', async (req: Request, res: Response) => {
  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY is not configured in server environment.',
    });
  }

  const {
    messages,
    mode = 'answer_spell',
    model = DEFAULT_GEMMA_MODEL,
    subject = 'All Subjects',
    simplifyStepPrompt,
  } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required.' });
  }

  const selectedModel = resolveModelName(model);
  const systemInstruction = getSystemInstruction(mode, subject);

  // 1. Sanitize and structure contents to enforce strict alternating turns for Google GenAI
  // (Prevents ApiError 500: Internal error caused by consecutive user/user or model/model turns)
  const prepared: { role: 'user' | 'model'; parts: any[] }[] = [];

  for (const m of messages) {
    // Skip previous error notices
    if (
      m.content &&
      (m.content.startsWith('Spectral Spell Error') ||
        m.content.startsWith('Network Anomaly') ||
        m.content.startsWith('Spectral Overload') ||
        m.content.includes('"status":"INTERNAL"'))
    ) {
      continue;
    }

    const role = m.role === 'model' ? 'model' : 'user';
    const parts: any[] = [];

    if (m.image && m.image.base64 && m.image.mimeType) {
      const cleanBase64 = m.image.base64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: m.image.mimeType,
          data: cleanBase64,
        },
      });
    }

    const textContent = m.content?.trim() || (m.image ? 'Please analyze this problem shown in the image.' : '');
    if (textContent) {
      parts.push({ text: textContent });
    }

    if (parts.length === 0) continue;

    // If consecutive message of the same role, merge parts into the previous turn
    const prevTurn = prepared[prepared.length - 1];
    if (prevTurn && prevTurn.role === role) {
      prevTurn.parts.push(...parts);
    } else {
      prepared.push({ role, parts });
    }
  }

  // If simplify step was requested, cleanly merge into the final user turn
  if (simplifyStepPrompt) {
    const simplifyText = `\n\n[Clarification Request]: Could you please explain this specific step again using simpler words, a friendly everyday analogy, and a clearer breakdown: "${simplifyStepPrompt}"?`;
    const last = prepared[prepared.length - 1];
    if (last && last.role === 'user') {
      last.parts.push({ text: simplifyText });
    } else {
      prepared.push({
        role: 'user',
        parts: [{ text: simplifyText }],
      });
    }
  }

  // Ensure conversation starts with 'user'
  while (prepared.length > 0 && prepared[0].role !== 'user') {
    prepared.shift();
  }

  // Ensure conversation ends with 'user'
  while (prepared.length > 0 && prepared[prepared.length - 1].role !== 'user') {
    prepared.pop();
  }

  if (prepared.length === 0) {
    return res.status(400).json({ error: 'No valid user query provided.' });
  }

  // 2. Call GenAI with automatic retry on transient 500/503 errors
  const temperature = mode === 'mystery_spell' ? 0.25 : 0.1;
  let response: any = null;
  let lastError: any = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      response = await ai.models.generateContent({
        model: selectedModel,
        contents: prepared,
        config: {
          systemInstruction,
          temperature,
        },
      });

      if (response && response.text) {
        break;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Gemini API call attempt ${attempt + 1} failed:`, err?.message || err);
      if (attempt === 0) {
        // Wait 1.5 seconds before auto-retrying
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
  }

  if (response && response.text) {
    return res.json({
      reply: response.text,
      model: selectedModel,
      mode,
    });
  }

  // 3. Graceful, humanized error formatting
  const rawMsg = lastError?.message || String(lastError || 'Unknown error');
  console.error('Final Gemini API failure after retry:', rawMsg);

  if (rawMsg.includes('503') || lastError?.status === 503) {
    return res.status(503).json({
      error:
        'Spectral Overload (HTTP 503): The haunted model is currently handling a surge of ghostly scholars. Please press the "Retry Spell" button below.',
      canRetry: true,
      model: selectedModel,
    });
  }

  if (rawMsg.includes('500') || lastError?.status === 500 || rawMsg.includes('INTERNAL')) {
    return res.status(500).json({
      error:
        'The spectral Gemma 4 server encountered a momentary surge (Internal Error 500). Please click the "Retry Spell" button below, or switch to the alternate verified model gemma-4-31b-it in Diagnostics.',
      canRetry: true,
      model: selectedModel,
    });
  }

  if (rawMsg.includes('404') || rawMsg.toLowerCase().includes('not found')) {
    return res.status(404).json({
      error: `Model "${selectedModel}" is unavailable or unsupported on this API key. Please select a supported Gemma 4 model from Diagnostics.`,
      unsupportedModel: selectedModel,
      canRetry: false,
    });
  }

  if (rawMsg.includes('429') || lastError?.status === 429) {
    return res.status(429).json({
      error:
        'Rate limit reached on the spectral realm. Please pause for a few seconds before chanting another spell.',
      canRetry: true,
      model: selectedModel,
    });
  }

  return res.status(500).json({
    error: `Spectral Spell Anomaly: The spirits could not complete the calculation. Please click "Retry Spell" to cast again.`,
    canRetry: true,
    model: selectedModel,
  });
});

// Setup Vite in Dev or serve static in Prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎃 Haunted Study Buddy server brewing on http://localhost:${PORT}`);
    console.log(`👻 Default AI Brain: ${DEFAULT_GEMMA_MODEL} (Accuracy, Rigor & KaTeX Formatting Enabled)`);
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  void startServer();
}
