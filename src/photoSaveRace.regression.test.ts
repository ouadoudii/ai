import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./components/AddMomentModal.tsx', import.meta.url), 'utf8');

describe('selected photo save readiness regression (#267)', () => {
  it('tracks FileReader readiness independently from image recognition', () => {
    expect(source).toContain("const [imageReading,setImageReading]=React.useState(false)");
    expect(source).toContain('const imageReadId=React.useRef(0)');
    expect(source).toContain('setImageReading(true)');
    expect(source).toContain('reader.onload=()=>{if(readId!==imageReadId.current)return;');
    expect(source).toContain('reader.onerror=()=>{if(readId!==imageReadId.current)return;');
  });

  it('cannot emit a meal while image bytes or photo confirmation are still pending', () => {
    expect(source).toContain('const save=()=>{if(imageReading||photoConfirmationPending)return;');
    expect(source).toContain("disabled={imageReading||photoConfirmationPending||(Boolean(clarificationQuestion)&&clarificationResolution==='pending')}");
    expect(source).toContain('data-testid="meal-clarification-save" onClick={save} disabled={imageReading||photoConfirmationPending}');
  });

  it('invalidates stale reads and pending recognition when the editor session closes or resets', () => {
    expect(source).toContain('const photoAnalysisGuard=React.useRef(createLatestRequestGuard());');
    expect(source).toContain('const invalidatePhotoAnalysis=()=>{');
    expect(source).toContain('photoAnalysisGuard.current.invalidate();');
    expect(source).toContain("if(!isOpen){imageReadId.current+=1;setImageReading(false);setPhotoRecognition(createPhotoRecognitionState([]));setImageRecognitionNote('');return;}");
    expect(source).toContain("imageReadId.current+=1;setImageReading(false);setShowMainMeals(false);setClarificationAnswer('');setPhotoRecognition(createPhotoRecognitionState([]));");
  });

  it('accepts recognition output only for the active photo capture token', () => {
    expect(source).toContain('const analysisToken=photoAnalysisGuard.current.start();');
    expect(source).toContain('if(!photoAnalysisGuard.current.isCurrent(analysisToken))return;');
    expect(source).toContain('if(photoAnalysisGuard.current.isCurrent(analysisToken)){setPhotoRecognition(createPhotoRecognitionState([]));setImageRecognitionNote(copy.photoUnavailable)}');
    expect(source).toContain('if(photoAnalysisGuard.current.isCurrent(analysisToken))setImageAnalyzing(false)');
  });
});
