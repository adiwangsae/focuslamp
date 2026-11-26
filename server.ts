import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

function getGeminiClient(): GoogleGenAI | null {
  const rawKey = process.env.GEMINI_API_KEY?.trim();
  if (!rawKey || rawKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey: rawKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

interface ChatHistoryTurn {
  role: 'user' | 'assistant';
  content: string;
}

interface AiChatRequestBody {
  message?: string;
  language?: 'en' | 'id';
  history?: ChatHistoryTurn[];
  contextSummary?: {
    accountType?: 'registered';
    studentFirstName?: string;
    totalSessions?: number;
    completedSessions?: number;
    totalFocusMinutes?: number;
    completionRate?: number;
    averageSessionMinutes?: number;
    currentStreak?: number;
    longestStreak?: number;
    todayFocusMinutes?: number;
    recoveriesRemaining?: number;
    level?: number;
    totalXp?: number;
    defaultFocusMinutes?: number;
    deviceConnected?: boolean;
    phoneDocked?: boolean;
  };
}

function buildSystemInstruction(
  language: 'en' | 'id',
  ctx: AiChatRequestBody['contextSummary'] | string | undefined
): string {
  const langRule =
    language === 'id'
      ? 'Respond exclusively in natural, warm, professional Indonesian (Bahasa Indonesia).'
      : 'Respond exclusively in clear, warm, professional English.';

  const statsBlock =
    typeof ctx === 'string'
      ? ctx
      : ctx
      ? [
          `Account type: ${ctx.accountType ?? 'registered'}`,
          `User first name: ${ctx.studentFirstName ?? 'User'}`,
          `Recorded sessions: ${ctx.totalSessions ?? 0} total (${ctx.completedSessions ?? 0} completed, completion rate ${ctx.completionRate ?? 0}%)`,
          `Total focus time: ${ctx.totalFocusMinutes ?? 0} minutes (average block ${ctx.averageSessionMinutes ?? 0} min, default block ${ctx.defaultFocusMinutes ?? 25} min)`,
          `Streak: ${ctx.currentStreak ?? 0} day(s) current, ${ctx.longestStreak ?? 0} day(s) longest, today ${ctx.todayFocusMinutes ?? 0} min logged, monthly recoveries remaining: ${ctx.recoveriesRemaining ?? 3}/3`,
          `Gamification: Level ${ctx.level ?? 1}, ${ctx.totalXp ?? 0} XP`,
          `Device FL-01: ${ctx.deviceConnected ? 'Connected' : 'No device connected (Software Study Timer mode)'}`,
        ]
          .filter(Boolean)
          .join('\n')
      : 'No user session context provided.';

  return [
    'You are FocusMate AI, the study habit assistant inside FocusLamp.',
    langRule,
    'Tone: warm, empathetic, informative, calm, encouraging, and concise (2-4 short paragraphs max). Never childish or robotic.',
    'Strict truthfulness rules:',
    '- Base any user-specific remarks ONLY on the verified context summary below. Never invent statistics, sensor readings, model accuracies, or external citations.',
    '- Physical sensors (desk proximity & phone dock) measure physical presence and phone placement—never claim they directly measure mental or cognitive attention.',
    '- If totalSessions < 3, explicitly note that personalized behavioral patterns need at least 3 logged sessions before making strong habit inferences, while still answering general study questions helpfully.',
    '- When no physical device is connected, do not fabricate sensor readings, ambient light levels, dock telemetry, or ML classification results.',
    '',
    'Verified user & device context summary:',
    statsBlock,
  ].join('\n');
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '512kb' }));

  app.get('/api/health', (_req, res) => {
    const hasGeminiKey = getGeminiClient() !== null;
    res.json({
      ok: true,
      service: 'focuslamp-web',
      aiConfigured: hasGeminiKey,
      timestamp: new Date().toISOString(),
    });
  });

  app.post('/api/ai/chat', async (req, res) => {
    const body = (req.body ?? {}) as AiChatRequestBody & { prompt?: string };
    const rawMsg = typeof body.message === 'string' ? body.message : typeof body.prompt === 'string' ? body.prompt : '';
    const message = rawMsg.trim();
    const language: 'en' | 'id' = body.language === 'id' ? 'id' : 'en';

    if (!message) {
      res.status(400).json({
        ok: false,
        code: 'INVALID_REQUEST',
        error:
          language === 'id'
            ? 'Pesan tidak boleh kosong.'
            : 'Message cannot be empty.',
      });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        ok: false,
        code: 'AI_UNAVAILABLE',
        error:
          language === 'id'
            ? 'Layanan AI sedang tidak tersedia sementara.'
            : 'AI service temporarily unavailable.',
      });
      return;
    }

    try {
      const rawTurns = Array.isArray(body.history)
        ? body.history
            .slice(-8)
            .filter(
              (turn) =>
                (turn.role === 'user' || turn.role === 'assistant') &&
                typeof turn.content === 'string' &&
                turn.content.trim().length > 0
            )
            .map((turn) => ({
              role: turn.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: turn.content.trim() }],
            }))
        : [];

      // Gemini contents must begin with a user turn and alternate user/model cleanly
      const firstUserIdx = rawTurns.findIndex((t) => t.role === 'user');
      const trimmedTurns = firstUserIdx >= 0 ? rawTurns.slice(firstUserIdx) : [];
      const historyTurns: typeof trimmedTurns = [];
      for (const turn of trimmedTurns) {
        const last = historyTurns[historyTurns.length - 1];
        if (last && last.role === turn.role) {
          last.parts.push(...turn.parts);
        } else {
          historyTurns.push(turn);
        }
      }
      if (historyTurns.length > 0 && historyTurns[historyTurns.length - 1].role === 'user') {
        historyTurns.pop();
      }

      const contents = [
        ...historyTurns,
        {
          role: 'user',
          parts: [{ text: message }],
        },
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents,
        config: {
          systemInstruction: buildSystemInstruction(language, body.contextSummary),
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.LOW,
          },
        },
      });

      const replyText = (response.text ?? '').trim();
      if (!replyText) {
        res.status(502).json({
          ok: false,
          code: 'AI_EMPTY_RESPONSE',
          error:
            language === 'id'
              ? 'Layanan AI sedang tidak tersedia sementara.'
              : 'AI service temporarily unavailable.',
        });
        return;
      }

      res.json({
        ok: true,
        reply: replyText,
        model: 'gemini-4-hydrogen',
      });
    } catch (err) {
      const status =
        typeof (err as { status?: unknown })?.status === 'number'
          ? ((err as { status: number }).status)
          : 503;
      const isQuota = status === 429;
      console.error('[FocusMate /api/ai/chat error]', err instanceof Error ? err.message : err);
      res.status(isQuota ? 429 : 503).json({
        ok: false,
        code: isQuota ? 'AI_RATE_LIMITED' : 'AI_UNAVAILABLE',
        error:
          language === 'id'
            ? 'Layanan AI sedang tidak tersedia sementara. Silakan coba lagi.'
            : 'AI service temporarily unavailable. Please try again.',
      });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) {
        next();
        return;
      }
      const indexHtml = path.join(distDir, 'index.html');
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(404).send('Build output not found. Run npm run build.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FocusLamp server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start FocusLamp server:', err);
  process.exit(1);
});
