import {describe,expect,it} from 'vitest';
import {mergeSpeechSegments} from './speechTranscript';

describe('mergeSpeechSegments',()=>{
  it('keeps the longest cumulative Arabic hypothesis instead of repeating it',()=>{
    expect(mergeSpeechSegments([
      'الصباح كليت',
      'الصباح كليت المسمن',
      'الصباح كليت المسمن مع العسل'
    ])).toBe('الصباح كليت المسمن مع العسل');
  });

  it('handles repeated cumulative finals like Android can emit',()=>{
    expect(mergeSpeechSegments([
      'الصباح',
      'الصباح كليت',
      'الصباح كليت المسمن',
      'الصباح كليت المسمن مع العسل',
      'الصباح كليت المسمن مع العسل'
    ])).toBe('الصباح كليت المسمن مع العسل');
  });

  it('appends genuinely new non-overlapping speech',()=>{
    expect(mergeSpeechSegments([
      'الصباح كليت المسمن مع العسل',
      'ومن بعد شربت قهوة بالحليب'
    ])).toBe('الصباح كليت المسمن مع العسل ومن بعد شربت قهوة بالحليب');
  });

  it('merges token overlap without duplication',()=>{
    expect(mergeSpeechSegments([
      'كليت المسمن مع',
      'مع العسل'
    ])).toBe('كليت المسمن مع العسل');
  });
});
