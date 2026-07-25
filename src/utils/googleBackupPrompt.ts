import { AuthMode, GoogleBackupPromptState } from '../types';
import { toDateKey } from './dates';

export function addUsageDate(
  prompt: GoogleBackupPromptState,
  date = new Date(),
): GoogleBackupPromptState {
  const dateKey = toDateKey(date);
  if (prompt.usageDates.includes(dateKey)) return prompt;
  return {
    ...prompt,
    usageDates: [...prompt.usageDates, dateKey].slice(-30),
  };
}

export function shouldShowGoogleBackupPrompt(
  prompt: GoogleBackupPromptState,
  authMode: AuthMode,
): boolean {
  if (authMode !== 'anonymous' || prompt.autoPromptShownAt) return false;
  return prompt.subjectsAddedCount >= 3 || prompt.usageDates.length >= 3;
}
