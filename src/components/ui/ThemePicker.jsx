import React from 'react';
import { ChevronDown, Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemePicker() {
  const { preference, setPreference } = useTheme();
  const Icon = preference === 'system' ? Monitor : preference === 'dark' ? Moon : Sun;
  return <label className="theme-picker" title={`Color theme: ${preference}`}>
    <span className="sr-only">Color theme</span>
    <Icon className="theme-icon" size={16} aria-hidden="true" />
    <select value={preference} onChange={event => setPreference(event.target.value)}>
      <option value="system">System</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
    <ChevronDown className="theme-chevron" size={12} aria-hidden="true" />
  </label>;
}
