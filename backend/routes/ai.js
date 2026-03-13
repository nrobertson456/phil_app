/**
 * AI writing assistant: suggests ideas when you're stuck.
 * Requires OPENAI_API_KEY in .env. If not set, returns a friendly message.
 */
import express from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

router.post('/suggest', async (req, res) => {
  const { context, type } = req.body || {};
  // type: 'plot', 'character', 'song', 'dialogue', etc.
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!openaiKey) {
    return res.json({
      suggestion: "Add your OpenAI API key in the backend .env file (OPENAI_API_KEY) to get AI suggestions. Until then, try: jot down the last thing that happened, then ask 'What would make things worse for the hero?' or 'What does the villain want in this moment?'",
      fromAi: false,
    });
  }

  const prompt = buildPrompt(context, type);
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful Broadway musical writing coach. Keep suggestions concise, dramatic, and in the spirit of musical theater. Respond with plain text only.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 400,
      }),
    });
    const data = await response.json();
    const suggestion = data.choices?.[0]?.message?.content?.trim() || 'No suggestion this time. Try rephrasing or adding more context.';
    res.json({ suggestion, fromAi: true });
  } catch (err) {
    console.error('AI suggest error:', err);
    res.status(500).json({
      suggestion: "The AI assistant couldn't be reached. Check your API key and connection.",
      fromAi: false,
    });
  }
});

function buildPrompt(context, type) {
  const base = context && typeof context === 'string' ? context : 'I\'m working on a new musical.';
  const typePrompt = {
    plot: 'Suggest the next beat or twist in the plot. Be brief.',
    character: 'Suggest a character trait, motivation, or line that would deepen this character. Be brief.',
    song: 'Suggest a song idea (title or moment) that could fit. Be brief.',
    dialogue: 'Suggest a line of dialogue or a reaction. Be brief.',
  }[type] || 'Give me one short creative idea to unstick my writing.';
  return `${base}\n\n${typePrompt}`;
}

export default router;
