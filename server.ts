import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Lazy GoogleGenAI client
let genAiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!genAiClient) {
    genAiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAiClient;
}

/* ==========================================================================
   API ENDPOINTS: AI & Business Intelligence
   ========================================================================== */

/**
 * 1. Health check
 */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Cary Engine" });
});

/**
 * 2. "Sag's mir!" Voice & Text Processing with Gemini
 * Parses natural voice input into structured nutrition & wellbeing check-in
 * and produces warm, empathetic, time-appropriate coach feedback from Cary.
 */
app.post("/api/voice-checkin", async (req, res) => {
  try {
    const { transcript, timeOfDay, userArchetype, currentHour } = req.body;

    if (!transcript || typeof transcript !== "string") {
      return res.status(400).json({ error: "Transcript is required" });
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Fallback if GEMINI_API_KEY is not configured yet
      return res.json({
        coachFeedback: {
          title: "Cary ist für dich da 💚",
          message: `Ich habe dein Audio erfasst: „${transcript.slice(0, 100)}...“. Toll, dass du dir den Moment für dich nimmst!`,
          type: "praise",
          badge: "Cary Check-in",
          habitScore: 90,
        },
        extractedData: {
          mealDetected: false,
          sleepHours: null,
          energyLevel: 4,
          mood: "energized",
        },
      });
    }

    const systemPrompt = `Du bist "Cary", die fürsorgliche, herzliche und feinfühlige Begleiterin für achtsame Ernährung, Schlaf und echtes Wohlbefinden. Dein Name ist Programm: Du sorgst dich aufrichtig ("to care") um den Menschen, der zu dir spricht.
Der Nutzer hat soeben über die Sprachfunktion ("Sag's mir!") eine vertraute WhatsApp-ähnliche Sprachnachricht an dich gerichtet.

Deine Haltung & Tonalität:
- Fürsorglich, warm, verständnisvoll und bestärkend (wie eine empathische, kluge Freundin).
- Niemals belehrend, dogmatisch oder strafend. Keine starren Diät-Regeln.
- Verstehe die Nachricht im Kontext der aktuellen Tageszeit (${timeOfDay || "heute"}, ca. ${currentHour || 12}:00 Uhr) und des Ernährungstyps (${userArchetype || "intuitiv"}).
- Formuliere eine herzliche Antwort (max. 2-3 kurze, kraftvolle Sätze). Schließe gerne einen sanften Wohlfühl- oder Bio-Impuls ein (z. B. Glas Wasser, 3 Minuten frische Luft, genussvolles Kauen, sanftes Entspannen).
- Extrahiere strukturierte Daten aus dem Gesagten.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `Transkript der Sprachnachricht: "${transcript}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            coachTitle: {
              type: Type.STRING,
              description: "Kurze herzliche Überschrift, z. B. 'Super Tagesstart! 🌅' oder 'Achtsamer Genussmoment 🥑'",
            },
            coachResponse: {
              type: Type.STRING,
              description: "Herzliche, einfühlsame Antwort (2-3 Sätze)",
            },
            badge: {
              type: Type.STRING,
              description: "Kurzes Badge-Label, z. B. 'Mindful Check-in', 'Schlaf-Erholung', 'Protein-Booster'",
            },
            habitScore: {
              type: Type.NUMBER,
              description: "Achtsamkeits-Score von 60 bis 100",
            },
            extractedData: {
              type: Type.OBJECT,
              properties: {
                mealTitle: { type: Type.STRING, description: "Falls ein Gericht erwähnt wurde, sonst leer" },
                mealCategory: { type: Type.STRING, description: "breakfast, lunch, dinner, snack oder leer" },
                sleepHours: { type: Type.NUMBER, description: "Erwähnte Schlafstunden oder null" },
                energyLevel: { type: Type.NUMBER, description: "Geschätztes Energielevel 1 bis 5" },
                mood: { type: Type.STRING, description: "energized, happy, relaxed, sluggish, stressed" },
                hungerBefore: { type: Type.NUMBER, description: "Geschätzter Vor-Hunger 1 bis 5" },
                fullnessAfter: { type: Type.NUMBER, description: "Geschätzte Sättigung 1 bis 5" },
              },
            },
          },
          required: ["coachTitle", "coachResponse", "badge", "habitScore"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");

    return res.json({
      coachFeedback: {
        title: parsed.coachTitle || "Danke für dein Teilen! 💚",
        message: parsed.coachResponse || "Toll, dass du dir heute diesen Moment für deine Gesundheit nimmst.",
        badge: parsed.badge || "Sag's mir! Impuls",
        habitScore: parsed.habitScore || 88,
        type: "praise",
      },
      extractedData: parsed.extractedData || {},
    });
  } catch (error: any) {
    console.error("Error in /api/voice-checkin:", error);
    return res.status(500).json({
      error: "AI Voice Processing failed",
      details: error.message,
    });
  }
});

/**
 * 3. Business Intelligence & Matrix Classification (Server-side Core)
 * Evaluates physiological logs, circadian markers, and calculates archetype scores.
 * Enriched with Gemini deep insights.
 */
app.post("/api/analyze-archetype", async (req, res) => {
  try {
    const { moments = [], checkIns = [] } = req.body;

    const totalDataPoints = moments.length + checkIns.length;
    const targetDataPoints = 6;
    const confidenceScore = Math.min(
      100,
      Math.round((totalDataPoints / targetDataPoints) * 92) + (totalDataPoints > 3 ? 8 : 0)
    );
    const isUnlocked = totalDataPoints >= 3;

    // Metric accumulators (Core Business Algorithm protected on Server)
    let proteinHeavyCount = 0;
    let mindfulSlowCount = 0;
    let screenDistractedCount = 0;
    let lateDinnerCount = 0;
    let breakfastCount = 0;
    let overfullCount = 0;
    let highEnergyCount = 0;

    moments.forEach((m: any) => {
      if (m.nutrition?.protein && m.nutrition.protein >= 25) proteinHeavyCount++;
      if (m.eatingPace === "slow" && (!m.distraction || m.distraction === "mindful")) mindfulSlowCount++;
      if (m.distraction === "screen" || m.distraction === "work") screenDistractedCount++;
      if (m.fullnessLevel && m.fullnessLevel >= 5) overfullCount++;
      if (m.energyAfter === "energized" || m.mood === "energized") highEnergyCount++;

      const hour = parseInt((m.time || "12:00").split(":")[0] || "12", 10);
      if (hour >= 20) lateDinnerCount++;
      if (m.category === "breakfast" || (hour >= 6 && hour <= 10)) breakfastCount++;
    });

    checkIns.forEach((c: any) => {
      if (c.food?.distraction === "mindful" && c.food?.eatingPace === "slow") mindfulSlowCount++;
      if (c.food?.fullnessAfter && c.food.fullnessAfter >= 5) overfullCount++;
      if (c.wellbeing?.energyLevel >= 4) highEnergyCount++;
      if (c.timeOfDay === "morning") breakfastCount++;
    });

    const momentCount = Math.max(1, moments.length);
    const proteinRatio = proteinHeavyCount / momentCount;
    const mindfulRatio = mindfulSlowCount / momentCount;
    const lateDinnerRatio = lateDinnerCount / momentCount;

    // Archetype Classification Matrix
    let archetype = "intuitive_mindful";
    let typeName = "Der intuitive Genießer";
    let subtitle = "Ausgewogene Balance aus Genuss, Körpergefühl & Achtsamkeit";
    let badge = "Intuitiv & Achtsam";
    let description =
      "Du hörst gut auf deine natürlichen Hunger- und Sättigungssignale. Deine Mahlzeiten werden bevorzugt in Ruhe genossen. Dein Körper reagiert direkt auf Qualität und Bekömmlichkeit.";
    let sleepNutritionCorrelation =
      "Guter Schlaf führt bei dir direkt zu stabilerem Sättigungsgefühl und weniger Snack-Bedürfnis am Vormittag.";
    let optimalMealTiming = "Regelmäßiges 3-Mahlzeiten-Intervall (08:00 | 12:30 | 18:30) ohne späte Nachtsnacks.";

    if (proteinRatio >= 0.35) {
      archetype = "protein_performer";
      typeName = "Der protein-optimierte Performer";
      subtitle = "Fokus auf Muskelregeneration, Sättigungsdichte & Energie";
      badge = "High Protein Focus";
      description =
        "Du achtest gezielt auf nährstoff- und proteinreiche Mahlzeiten. Du nutzt Ernährung aktiv als Treibstoff für Leistungsfähigkeit, Konzentration und sportliche Regeneration.";
      sleepNutritionCorrelation =
        "Ausreichend Protein am Abend verbessert deine Tiefschlafphasen und verhindert nächtliche Blutzuckerschwankungen.";
      optimalMealTiming = "Protein-Timing: 25-35g Protein pro Hauptmahlzeit mit 4-stündigem Abstand.";
    } else if (lateDinnerRatio >= 0.35 || screenDistractedCount >= 3) {
      archetype = "circadian_rhythm";
      typeName = "Der circadiane Abend-Genießer";
      subtitle = "Tendenz zu späteren Mahlzeiten & geselligem Ausklang";
      badge = "Circadian Optimization";
      description =
        "Du nimmst dir abends gerne Zeit für reichhaltigere Gerichte. Deine größte Coaching-Chance liegt in der zeitlichen Vorverlegung des Abendessens, um die Schlafregeneration zu maximieren.";
      sleepNutritionCorrelation =
        "Ein Abendessen vor 19:30 Uhr vertieft deine REM-Schlafphasen spürbar und verhindert morgendliche Trägheit.";
      optimalMealTiming = "Früheres Abendessen (vor 19:30 Uhr) + 12h nächtliche Magenpause.";
    } else if (breakfastCount === 0 && momentCount >= 3) {
      archetype = "intermittent_balancer";
      typeName = "Der Intervall- & Rhythmus-Typ";
      subtitle = "Natürliches 16:8 Fasten & stabiles Nachmittags-Plateau";
      badge = "Intermittent Rhythm";
      description =
        "Dein Körper kommt morgens hervorragend ohne schwere Kost in Schwung. Dein erstes Energiefenster öffnet sich gegen Mittag, wo du nährstoffreich auftankst.";
      sleepNutritionCorrelation =
        "Durch die frühere letzte Mahlzeit schläfst du tiefer und wachst mit natürlicher Leichtigkeit auf.";
      optimalMealTiming = "Essensfenster von 11:30 bis 19:30 Uhr (16:8 Fasten-Rhythmus).";
    }

    const traits = [
      {
        name: "Achtsamkeits-Index",
        score: Math.min(10, Math.max(4, Math.round(mindfulRatio * 10) + 5)),
        max: 10,
        label: mindfulRatio > 0.4 ? "Sehr hoch" : "Ausbaufähig",
        color: "amber",
      },
      {
        name: "Sättigungs-Präzision",
        score: overfullCount > 1 ? 6 : 9,
        max: 10,
        label: overfullCount > 1 ? "Sensibel bei Stufe 5" : "Hervorragend (Stufe 4)",
        color: "emerald",
      },
      {
        name: "Nährstoff- & Proteindichte",
        score: Math.min(10, Math.max(5, Math.round(proteinRatio * 10) + 4)),
        max: 10,
        label: proteinRatio > 0.3 ? "Optimal (High)" : "Solide Basis",
        color: "indigo",
      },
      {
        name: "Schlaf-Ernährungs-Harmonie",
        score: lateDinnerRatio > 0.3 ? 6 : 9,
        max: 10,
        label: lateDinnerRatio > 0.3 ? "Optimierungs-Potenzial" : "Stark synchronisiert",
        color: "rose",
      },
    ];

    const dos = [
      "Halte das 20-Minuten-Ess-Tempo bei, damit das natürliche Sättigungssignal greift.",
      "Kombiniere jede Hauptmahlzeit mit einer verlässlichen Proteinquelle (Ei, Fisch, Hülsenfrüchte, Tofu).",
      "Trinke 15 Minuten vor dem Essen ein Glas stilles Wasser für optimale Verdauungsenzyme.",
      "Nutze den WhatsApp-Sprach-Check-in ('Sag's mir!') für müheloses Dokumentieren ohne Tippaufwand.",
    ];

    const donts = [
      "Keine Mahlzeiten nebenbei am Laptop oder mit Social-Media-Scrolling herunterschlingen.",
      "Große fettige Portionen nach 21:00 Uhr vermeiden, um das Herz-Kreislauf-System nachts zu schonen.",
      "Hungersignale nicht mit übermäßigem Kaffee oder Energy Drinks unterdrücken.",
    ];

    // Optional Gemini Deep Personalization if available
    let geminiInsight = null;
    const ai = getGeminiClient();
    if (ai && moments.length > 0) {
      try {
        const prompt = `Analysiere kurz das Ernährungsmuster:
Archetyp: ${typeName}
Momente: ${JSON.stringify(moments.slice(0, 5).map((m: any) => ({ title: m.title, time: m.time, mood: m.mood, pace: m.eatingPace, fullness: m.fullnessLevel })))}
Gib 1 fürsorglichen, präzisen Bio-Rhythmus-Tipp von Cary für diesen Nutzer.`;

        const geminiRes = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: {
            systemInstruction: "Du bist Cary, die fürsorgliche Begleiterin für Gesundheit und Ernährung. Antworte in 1 prägnanten, warmen Satz auf Deutsch.",
          },
        });
        geminiInsight = geminiRes.text?.trim();
      } catch (err) {
        console.log("Gemini deep insight optional step:", err);
      }
    }

    return res.json({
      id: `profile-${archetype}`,
      archetype,
      typeName,
      subtitle,
      badge,
      confidenceScore,
      unlocked: isUnlocked,
      dataPointsNeeded: targetDataPoints,
      dataPointsCurrent: totalDataPoints,
      description,
      traits,
      dos,
      donts,
      recommendedFocus:
        geminiInsight || "Fokussiere dich auf die Synchronisation zwischen Schlafqualität und leichtem Abendessen für maximale Tagesenergie.",
      sleepNutritionCorrelation,
      optimalMealTiming,
    });
  } catch (error: any) {
    console.error("Error in /api/analyze-archetype:", error);
    return res.status(500).json({ error: "Archetype analysis failed", details: error.message });
  }
});

/**
 * 4. AI Coach Interactive Chat with Cary
 */
app.post("/api/coach-chat", async (req, res) => {
  try {
    const { query, moments = [], checkIns = [], userArchetype } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Fallback
      return res.json({
        reply: `Als deine fürsorgliche Begleiterin Cary bin ich immer für dich da 💚 Zu deiner Frage „${query}“: Achte auf bewusste Pausen, nimm dir Zeit zum Kauen und spüre in deinen Körper hinein.`,
      });
    }

    const recentSummary = moments.slice(0, 4).map((m: any) => `${m.title} (${m.category}, Rating: ${m.rating}★, Pace: ${m.eatingPace || "normal"})`).join(", ");

    const systemPrompt = `Du bist "Cary", die warmherzige, feinfühlige und fürsorgliche Expertin für intuitive Ernährung, Chronobiologie und achtsames Wohlbefinden ("Cary cares for you").
Nutzerprofil: Ernährungstyp ${userArchetype || "intuitiv"}.
Letzte Mahlzeiten des Nutzers: ${recentSummary || "Bisher keine geloggt"}.

Grundsätze:
- Zeige echte Fürsorge, Empathie und Wärme. Kein Perfektionismus, keine rigiden Diät-Dogmen.
- Fokus auf Körpergefühl, sanfte Entlastung, Hunger & Sättigung (Skala 1-5), Esstempo, Schlaf-Ernährungs-Zusammenspiel.
- Antworte prägnant, freundlich, warmherzig (2-4 Absätze mit nützlichen Bulletpoints falls hilfreich).
- Verwende gelegentlich passende Emojis (💚, 🥑, ☕, 🌿, 🌙, ⚡).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: query,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    return res.json({
      reply: response.text || "Ich bin immer für dich da. Wie kann ich dir heute guttun?",
    });
  } catch (error: any) {
    console.error("Error in /api/coach-chat:", error);
    return res.status(500).json({ error: "Coach chat failed", details: error.message });
  }
});

/* ==========================================================================
   Vite & Static Server setup
   ========================================================================== */
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NimmApp server running on port ${PORT}`);
  });
}

startServer();
