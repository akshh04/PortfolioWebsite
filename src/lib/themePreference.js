export function normalizeThemePreference(value) {
  return ['light', 'dark', 'system'].includes(value) ? value : 'dark';
}

export function resolveTheme(preference, systemLight) {
  return preference === 'light' || preference === 'dark' ? preference : systemLight ? 'light' : 'dark';
}
