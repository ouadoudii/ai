import type { Request, Response } from 'express';
import { LIMITS, cleanText, publicError } from './security.js';

const MAX_AUDIO_BYTES = 20 * 1024 * 1024;

async function readRawBody(req: Request): Promise<Buffer> {
  if (Buffer.isBuffer(req.body)) return req.body;
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of req as any) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += buf.length;
    if (total > MAX_AUDIO_BYTES) throw new Error('audio-too-large');
    chunks.push(buf);
  }
  return Buffer.concat(chunks);
}

function extensionFor(contentType: string) {
  if (contentType.includes('ogg')) return 'ogg';
  if (contentType.includes('wav')) return 'wav';
  if (contentType.includes('mp4') || contentType.includes('m4a')) return 'm4a';
  return 'webm';
}

async function groqTranscribe(audio: Buffer, contentType: string, forceArabic: boolean) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('not-configured');

  const form = new FormData();
  form.append('file', new Blob([audio], { type: contentType }), `voice.${extensionFor(contentType)}`);
  form.append('model', 'whisper-large-v3');
  form.append('response_format', 'verbose_json');
  form.append('temperature', '0');
  if (forceArabic) form.append('language', 'ar');
  form.append(
    'prompt',
    'اكتب الكلام كما قيل حرفياً بلا ترجمة. افهم الدارجة المغربية والجزائرية والتونسية والليبية والمصرية والسودانية والشامية والعراقية والخليجية واليمنية، وكذلك العربية الفصحى والكلام المختلط بالفرنسية أو الإنجليزية. انتبه خصوصاً لأسماء الأكل والشرب والكميات وطريقة التحضير مثل: بيض، بيض مسلوق، بيض مقلي، مسمن، بغرير، حريرة، طاجين، كسكس، رفيسة، بسطيلة، بيصارة، زعلوك، تكتوكة، أتاي، قهوة بالحليب، خبز، زيت الزيتون. لا تعيد الصياغة.'
  );

  const upstream = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!upstream.ok) {
    const err = new Error(`groq-${upstream.status}`);
    (err as any).status = upstream.status;
    throw err;
  }

  const data = await upstream.json() as { text?: unknown; language?: unknown };
  const text = cleanText(data?.text, LIMITS.transcript);
  if (!text) throw new Error('empty-transcription');
  return { text, language: typeof data.language === 'string' ? data.language : null };
}

export default async function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.GROQ_API_KEY) return res.status(503).json({ error: 'Server transcription is not configured' });

  try {
    const contentType = String(req.headers['content-type'] || 'audio/webm').split(';')[0].toLowerCase();
    if (!contentType.startsWith('audio/') && contentType !== 'application/octet-stream') {
      return publicError(res, 415, 'Unsupported audio type');
    }

    const audio = await readRawBody(req);
    if (!audio.length) return publicError(res, 400, 'Missing audio');

    // First let Whisper identify the language itself. This performs better for
    // Darija and Arabic/French mixtures than forcing Modern Standard Arabic.
    try {
      const auto = await groqTranscribe(audio, contentType, false);
      return res.status(200).json({ text: auto.text, engine: 'whisper-large-v3-auto', detectedLanguage: auto.language });
    } catch (firstError) {
      // If auto detection itself fails, retry once with Arabic forced rather than
      // falling immediately to the much heavier browser-side Whisper model.
      const forced = await groqTranscribe(audio, contentType, true);
      return res.status(200).json({ text: forced.text, engine: 'whisper-large-v3-ar-retry', detectedLanguage: forced.language });
    }
  } catch (error: any) {
    if (error?.message === 'audio-too-large') return publicError(res, 413, 'Audio too large');
    const status = Number(error?.status);
    if (status === 429) return res.status(429).json({ error: 'Transcription rate limit reached' });
    console.warn('Server transcription unavailable');
    return res.status(502).json({ error: 'Server transcription unavailable' });
  }
}
