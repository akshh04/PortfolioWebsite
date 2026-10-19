import { getApp, getApps, initializeApp } from 'firebase/app';
import { getToken, initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { getAI, getGenerativeModel, GoogleAIBackend, Schema } from 'firebase/ai';
import { assistantInstruction } from './assistantKnowledge';
import { assistantConfig } from './assistantConfig';
import { assistantSources, conversationContents, createRequestLimiter, parseAssistantReply, withTimeout } from './assistantPolicy';

let model;
let appCheck;
const takeRequest = createRequestLimiter();
export const localAssistantPreview = import.meta.env.DEV && ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);

export function prepareAssistant() {
  if (model) return;
  const { config, siteKey } = assistantConfig(import.meta.env);
  const app = getApps().length ? getApp() : initializeApp(config);
  if (localAssistantPreview) {
    // Firebase prints the generated token in DevTools. Register it in App Check
    // for this browser; debug mode is removed from production builds by Vite.
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN || true;
  }
  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(siteKey),
    isTokenAutoRefreshEnabled: true,
  });
  const ai = getAI(app, { backend: new GoogleAIBackend() });
  model = getGenerativeModel(ai, {
    model: import.meta.env.VITE_AI_MODEL || 'gemini-3.5-flash-lite',
    systemInstruction: assistantInstruction,
    generationConfig: {
      maxOutputTokens: 1024, temperature: 0.3, responseMimeType: 'application/json',
      responseSchema: Schema.object({ properties: {
        answer: Schema.string(),
        sources: Schema.array({ items: Schema.enumString({ enum: assistantSources.map(source => source.id) }), maxItems: 3 }),
      } }),
    },
  }, { timeout: 25000 });
}

export async function askAssistant(messages, question) {
  const contents = conversationContents(messages, question);
  prepareAssistant();
  takeRequest();
  // Require verification before contacting the model. The SDK otherwise logs
  // token failures and may still attempt a request with a placeholder token.
  await withTimeout(getToken(appCheck), 10000);
  const result = await model.generateContent({ contents });
  return parseAssistantReply(result.response.text());
}
