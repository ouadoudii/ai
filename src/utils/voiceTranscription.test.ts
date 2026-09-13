import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../apiClient', () => ({
  transcribeRecordedAudio: vi.fn(),
}));

vi.mock('./localAi', () => ({
  transcribeAudio: vi.fn(),
}));

import { transcribeRecordedAudio } from '../apiClient';
import { transcribeAudio } from './localAi';
import { transcribeVoiceRecording } from './voiceTranscription';

const serverMock = vi.mocked(transcribeRecordedAudio);
const localMock = vi.mocked(transcribeAudio);

afterEach(() => {
  vi.clearAllMocks();
});

describe('voice transcription routing', () => {
  it('sends Arabic recordings through the language-aware server client', async () => {
    const audio = new Blob(['voice'], { type: 'audio/webm' });
    serverMock.mockResolvedValue('بيض مسلوق وقهوة');

    await expect(transcribeVoiceRecording(audio, 'ar')).resolves.toBe('بيض مسلوق وقهوة');
    expect(serverMock).toHaveBeenCalledWith(audio, 'ar');
    expect(localMock).not.toHaveBeenCalled();
  });

  it('falls back to local Whisper with the Arabic hint when the server is unavailable', async () => {
    const audio = new Blob(['voice'], { type: 'audio/webm' });
    serverMock.mockRejectedValue(new Error('server unavailable'));
    localMock.mockResolvedValue('كسكس بالخضر');

    await expect(transcribeVoiceRecording(audio, 'ar')).resolves.toBe('كسكس بالخضر');
    expect(serverMock).toHaveBeenCalledWith(audio, 'ar');
    expect(localMock).toHaveBeenCalledWith(audio, 'ar');
  });

  it('keeps non-Arabic fallback recordings local', async () => {
    const audio = new Blob(['voice'], { type: 'audio/webm' });
    localMock.mockResolvedValue('Kaffee und Brot');

    await expect(transcribeVoiceRecording(audio, 'de')).resolves.toBe('Kaffee und Brot');
    expect(serverMock).not.toHaveBeenCalled();
    expect(localMock).toHaveBeenCalledWith(audio, 'de');
  });
});
