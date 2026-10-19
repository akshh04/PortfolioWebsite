export const QUESTION_LIMIT = 600;
export const HISTORY_LIMIT = 6;

export const assistantSources = [
  { id: 'about', label: 'About Akash', href: '#about' },
  { id: 'skills', label: 'Skills & training', href: '#skills' },
  { id: 'experience', label: 'Work experience', href: '#experience' },
  { id: 'projects', label: 'Research & projects', href: '#projects' },
  { id: 'contact', label: 'Contact Akash', href: '#contact' },
  { id: 'exoplanet-explorer', label: 'Exoplanet Explorer', href: '#project/exoplanet-explorer' },
  { id: 'dark-matter-rotation-curves', label: 'Dark matter research', href: '#project/dark-matter-rotation-curves' },
  { id: 'exoplanets-search-for-life', label: 'Exoplanet presentation', href: '#project/exoplanets-search-for-life' },
  { id: 'astrophysics-literature-review', label: 'Literature review', href: '#project/astrophysics-literature-review' },
];

export function cleanQuestion(value) {
  if (typeof value !== 'string' || !value.trim()) throw new Error('chat/empty-question');
  if (value.trim().length > QUESTION_LIMIT) throw new Error('chat/question-too-long');
  return value.trim();
}

export function conversationContents(messages, question) {
  const history = messages.filter(message => ['user', 'assistant'].includes(message.role) && typeof message.text === 'string')
    .slice(-HISTORY_LIMIT);
  // Never begin a shortened conversation with a model turn.
  if (history[0]?.role === 'assistant') history.shift();
  return [...history.map(message => ({ role: message.role === 'assistant' ? 'model' : 'user', parts: [{ text: message.text.slice(0, 4000) }] })),
    { role: 'user', parts: [{ text: cleanQuestion(question) }] }];
}

export function parseAssistantReply(text) {
  const reply = JSON.parse(text);
  if (typeof reply.answer !== 'string' || !reply.answer.trim() || reply.answer.length > 5000) throw new Error('chat/invalid-response');
  const ids = new Set(Array.isArray(reply.sources) ? reply.sources : []);
  return { text: reply.answer.trim(), sources: assistantSources.filter(source => ids.has(source.id)).slice(0, 3) };
}

export function assistantError(error, local = false) {
  const detail = `${error?.code || ''} ${error?.message || ''}`.toLowerCase();
  if (/429|quota|resource.exhausted|too-many|chat\/rate-limit/.test(detail)) return 'The assistant has reached its current request limit. Please try later, or contact Akash directly.';
  if (/403|appcheck|app-check|permission|unauthorized|attestation/.test(detail)) return local
    ? 'This local preview still needs a registered App Check debug token. You can use the portfolio links below in the meantime.'
    : 'The assistant could not verify this browser. Please try again later, or contact Akash directly.';
  if (/offline|network|fetch|timeout/.test(detail)) return 'The assistant could not connect. Check your connection and try again. Your question is still in the input.';
  return 'AI replies are temporarily unavailable. Please try later, or explore the portfolio links below.';
}

// A small UX throttle; production enforcement belongs to Firebase's quotas/App Check.
export function createRequestLimiter(now = Date.now) {
  let attempts = [];
  return () => {
    const time = now();
    attempts = attempts.filter(value => time - value < 60000);
    if (attempts.length >= 5) throw new Error('chat/rate-limit');
    attempts.push(time);
  };
}

export async function withTimeout(promise, milliseconds) {
  let timer;
  try {
    return await Promise.race([promise, new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('chat/timeout')), milliseconds);
    })]);
  } finally { clearTimeout(timer); }
}
