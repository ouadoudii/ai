import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(path.resolve(process.cwd(), 'src/components/VoiceCaptureModal.tsx'), 'utf8');

describe('VoiceCaptureModal pending microphone lifecycle', () => {
  it('invalidates capture attempts when the user leaves or the modal closes', () => {
    expect(source).toContain('const captureRequestRef=React.useRef(0)');
    expect(source).toContain('const requestId=++captureRequestRef.current');
    expect(source).toContain('captureRequestRef.current++;cancelRef.current=true');
    expect(source).toContain('if(!isOpen){captureRequestRef.current++;cancelRef.current=true;cleanup();setRecording(false)}');
  });

  it('stops a microphone stream that resolves after its capture request became stale', () => {
    expect(source).toContain('captureRequestRef.current!==requestId||!isOpenRef.current');
    expect(source).toContain('stream.getTracks().forEach(track=>track.stop());return');
    const staleGuard = source.indexOf('if(cancelRef.current||captureRequestRef.current!==requestId||!isOpenRef.current)');
    const recorderConstruction = source.indexOf('const recorder=new MediaRecorder(stream)');
    const recorderStart = source.indexOf('recorder.start(250)');
    expect(staleGuard).toBeGreaterThan(-1);
    expect(staleGuard).toBeLessThan(recorderConstruction);
    expect(recorderConstruction).toBeLessThan(recorderStart);
  });

  it('ignores a late permission rejection from an abandoned capture request', () => {
    expect(source).toContain('if(captureRequestRef.current!==requestId||cancelRef.current||!isOpenRef.current)return;cleanup();setError(copy.permission)');
  });
});
