import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';

const app = express();
app.use(express.json({ limit: '15mb' }));

let client: GoogleGenAI | null = null;
function ai() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!client) client = new GoogleGenAI({ apiKey });
  return client;
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Cary Engine', geminiConfigured: Boolean(process.env.GEMINI_API_KEY) });
});

app.post('/api/voice-checkin', async (req, res) => {
  try {
    const { transcript, timeOfDay, userArchetype, currentHour } = req.body || {};
    if (!transcript || typeof transcript !== 'string') return res.status(400).json({ error: 'Transcript is required' });
    const gemini = ai();
    if (!gemini) return res.json({
      coachFeedback: { title: 'Cary ist für dich da 💚', message: `Ich habe dein Audio erfasst: „${transcript.slice(0, 100)}“.`, type: 'praise', badge: 'Cary Check-in', habitScore: 90 },
      extractedData: { mealDetected: false, sleepHours: null, energyLevel: 4, mood: 'energized' }
    });

    const response = await gemini.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: `Transkript: "${transcript}"`,
      config: {
        systemInstruction: `Du bist Cary, eine warme, empathische Begleiterin für Ernährung und Wohlbefinden. Tageszeit: ${timeOfDay || 'heute'}, ca. ${currentHour || 12}:00. Ernährungstyp: ${userArchetype || 'intuitiv'}. Antworte kurz, fürsorglich und ohne Diät-Dogmen.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            coachTitle: { type: Type.STRING }, coachResponse: { type: Type.STRING }, badge: { type: Type.STRING }, habitScore: { type: Type.NUMBER },
            extractedData: { type: Type.OBJECT, properties: { mealTitle: { type: Type.STRING }, mealCategory: { type: Type.STRING }, sleepHours: { type: Type.NUMBER }, energyLevel: { type: Type.NUMBER }, mood: { type: Type.STRING }, hungerBefore: { type: Type.NUMBER }, fullnessAfter: { type: Type.NUMBER } } }
          },
          required: ['coachTitle', 'coachResponse', 'badge', 'habitScore']
        }
      }
    });
    const p = JSON.parse(response.text || '{}');
    res.json({ coachFeedback: { title: p.coachTitle || 'Danke fürs Teilen 💚', message: p.coachResponse || 'Schön, dass du dir diesen Moment nimmst.', badge: p.badge || 'Cary Check-in', habitScore: p.habitScore || 88, type: 'praise' }, extractedData: p.extractedData || {} });
  } catch (e: any) { res.status(500).json({ error: 'AI Voice Processing failed', details: e?.message }); }
});

app.post('/api/analyze-archetype', async (req, res) => {
  try {
    const { moments = [], checkIns = [] } = req.body || {};
    const total = moments.length + checkIns.length;
    let protein = 0, mindful = 0, late = 0, overfull = 0;
    for (const m of moments) {
      if (m.nutrition?.protein >= 25) protein++;
      if (m.eatingPace === 'slow' && (!m.distraction || m.distraction === 'mindful')) mindful++;
      if (m.fullnessLevel >= 5) overfull++;
      if (parseInt((m.time || '12:00').split(':')[0], 10) >= 20) late++;
    }
    for (const c of checkIns) {
      if (c.food?.distraction === 'mindful' && c.food?.eatingPace === 'slow') mindful++;
      if (c.food?.fullnessAfter >= 5) overfull++;
    }
    const n = Math.max(1, moments.length);
    const proteinRatio = protein / n, lateRatio = late / n, mindfulRatio = mindful / n;
    let archetype = 'intuitive_mindful', typeName = 'Der intuitive Genießer', subtitle = 'Ausgewogene Balance aus Genuss, Körpergefühl & Achtsamkeit', badge = 'Intuitiv & Achtsam';
    if (proteinRatio >= .35) { archetype = 'protein_performer'; typeName = 'Der protein-optimierte Performer'; subtitle = 'Fokus auf Muskelregeneration, Sättigungsdichte & Energie'; badge = 'High Protein Focus'; }
    else if (lateRatio >= .35) { archetype = 'circadian_rhythm'; typeName = 'Der circadiane Abend-Genießer'; subtitle = 'Tendenz zu späteren Mahlzeiten & geselligem Ausklang'; badge = 'Circadian Optimization'; }
    let recommendedFocus = 'Fokussiere dich auf die Synchronisation zwischen Schlafqualität und leichtem Abendessen für maximale Tagesenergie.';
    const gemini = ai();
    if (gemini && moments.length) {
      try {
        const r = await gemini.models.generateContent({ model: 'gemini-3.7-flash', contents: `Ernährungstyp: ${typeName}. Letzte Momente: ${JSON.stringify(moments.slice(0, 5))}. Gib einen kurzen warmen Bio-Rhythmus-Tipp auf Deutsch.` });
        if (r.text) recommendedFocus = r.text.trim();
      } catch {}
    }
    res.json({
      id: `profile-${archetype}`, archetype, typeName, subtitle, badge,
      confidenceScore: Math.min(100, Math.round(total / 6 * 92) + (total > 3 ? 8 : 0)), unlocked: total >= 3, dataPointsNeeded: 6, dataPointsCurrent: total,
      description: 'Dein Muster zeigt, wie Körpergefühl, Mahlzeitenrhythmus und Achtsamkeit zusammenspielen.',
      traits: [
        { name: 'Achtsamkeits-Index', score: Math.min(10, Math.max(4, Math.round(mindfulRatio * 10) + 5)), max: 10, label: mindfulRatio > .4 ? 'Sehr hoch' : 'Ausbaufähig', color: 'amber' },
        { name: 'Sättigungs-Präzision', score: overfull > 1 ? 6 : 9, max: 10, label: overfull > 1 ? 'Sensibel bei Stufe 5' : 'Hervorragend (Stufe 4)', color: 'emerald' },
        { name: 'Nährstoff- & Proteindichte', score: Math.min(10, Math.max(5, Math.round(proteinRatio * 10) + 4)), max: 10, label: proteinRatio > .3 ? 'Optimal (High)' : 'Solide Basis', color: 'indigo' },
        { name: 'Schlaf-Ernährungs-Harmonie', score: lateRatio > .3 ? 6 : 9, max: 10, label: lateRatio > .3 ? 'Optimierungs-Potenzial' : 'Stark synchronisiert', color: 'rose' }
      ],
      dos: ['Iss bewusst und langsam.', 'Kombiniere Hauptmahlzeiten mit einer verlässlichen Proteinquelle.', 'Nutze Cary für kurze Check-ins.'],
      donts: ['Mahlzeiten nicht dauerhaft nebenbei am Bildschirm essen.', 'Sehr große späte Mahlzeiten möglichst vermeiden.'],
      recommendedFocus,
      sleepNutritionCorrelation: 'Guter Schlaf unterstützt ein stabileres Sättigungsgefühl und gleichmäßigere Energie.',
      optimalMealTiming: lateRatio > .3 ? 'Abendessen möglichst vor 19:30 Uhr.' : 'Regelmäßige Mahlzeiten passend zu deinem natürlichen Rhythmus.'
    });
  } catch (e: any) { res.status(500).json({ error: 'Archetype analysis failed', details: e?.message }); }
});

app.post('/api/coach-chat', async (req, res) => {
  try {
    const { query, moments = [], userArchetype } = req.body || {};
    if (!query) return res.status(400).json({ error: 'Query is required' });
    const gemini = ai();
    if (!gemini) return res.json({ reply: `Cary ist für dich da 💚 Zu „${query}“: Nimm dir einen Moment, spüre in deinen Körper und wähle den nächsten kleinen Schritt, der dir guttut.` });
    const recent = moments.slice(0, 4).map((m: any) => `${m.title} (${m.category || ''}, ${m.rating || ''}★)`).join(', ');
    const r = await gemini.models.generateContent({
      model: 'gemini-3.7-flash', contents: query,
      config: { systemInstruction: `Du bist Cary, warmherzige Begleiterin für intuitive Ernährung und Wohlbefinden. Nutzerprofil: ${userArchetype || 'intuitiv'}. Letzte Mahlzeiten: ${recent || 'keine'}. Antworte prägnant, empathisch, ohne Diät-Dogmen.` }
    });
    res.json({ reply: r.text || 'Ich bin für dich da 💚' });
  } catch (e: any) { res.status(500).json({ error: 'Coach chat failed', details: e?.message }); }
});

export default app;
