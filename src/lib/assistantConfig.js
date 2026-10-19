// Only Firebase Web configuration belongs here. Server credentials must never
// use VITE_ variables, since Vite includes those values in browser builds.
export function assistantConfig(env) {
  const config = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  };
  const siteKey = env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY;
  if (![...Object.values(config), siteKey].every(value => typeof value === 'string' && value.trim())) {
    throw new Error('chat/missing-configuration');
  }
  return { config, siteKey };
}
