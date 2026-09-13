import type { VoiceLanguage } from '../apiClient';
import { transcribeRecordedAudio } from '../apiClient';
import { transcribeAudio } from './localAi';

export async function transcribeVoiceRecording(blob: Blob, language: VoiceLanguage): Promise<string> {
  if (language === 'ar') {
    try {
      return await transcribeRecordedAudio(blob, language);
    } catch {
      return transcribeAudio(blob, language);
    }
  }

  return transcribeAudio(blob, language);
}
