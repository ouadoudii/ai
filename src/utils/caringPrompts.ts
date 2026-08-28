export interface CaringPrompt {
  id: string;
  timeSlot: 'morning' | 'lunch' | 'afternoon' | 'evening' | 'night';
  headline: string;
  subtext: string;
  bubbleText: string;
  emoji: string;
  audioExample: string;
  careTip: string;
  quickQuestions: string[];
}

export function getCurrentCaringPrompt(): CaringPrompt {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 11) {
    return {
      id: 'morning',
      timeSlot: 'morning',
      headline: 'Guten Morgen! Gut geschlafen? ☕',
      subtext: 'Wie bist du aus den Federn gekommen? Erzähl mir von deinem Morgen.',
      bubbleText: '„Guten Morgen! ☀️ Wie fühlst du dich heute nach dem Aufwachen?“',
      emoji: '🌅',
      audioExample: '„Habe ca. 7 Stunden geschlafen, fühle mich fit und trinke gerade einen Kaffee.“',
      careTip: 'Ich achte darauf, dass du heute mit stabiler Energie durchstartest!',
      quickQuestions: [
        '😴 Wie viele Stunden hast du geschlafen?',
        '🥐 Schon gefrühstückt oder noch nüchtern?',
        '💧 Schon ein Glas Wasser getrunken?'
      ]
    };
  } else if (hour >= 11 && hour < 14) {
    return {
      id: 'lunch',
      timeSlot: 'lunch',
      headline: 'Mahlzeit! Lecker zu Mittag gegessen? 🥗',
      subtext: 'Was gab\'s Feines auf dem Teller? Ich bin neugierig!',
      bubbleText: '„Mahlzeit! 🍲 Was gab es Schönes zum Mittagessen und wie fühlst du dich?“',
      emoji: '🥗',
      audioExample: '„Mittags gab\'s eine leckere Bowl mit Lachs, Quinoa und Avocado. Fühle mich angenehm satt.“',
      careTip: 'Lass dir Zeit beim Kauen – dein Magen wird es dir danken.',
      quickQuestions: [
        '🥑 Was gab es zu essen?',
        '😌 War es in Ruhe oder gehetzt?',
        '⚡ Fühlst du dich fit oder eher voll?'
      ]
    };
  } else if (hour >= 14 && hour < 18) {
    return {
      id: 'afternoon',
      timeSlot: 'afternoon',
      headline: 'Wie steht dein Nachmittags-Akku? ⚡',
      subtext: 'Brauchst du grad Kaffee oder frische Luft? Lass mal hören!',
      bubbleText: '„Hey du! 👋 Wie geht\'s deiner Energie am Nachmittag?“',
      emoji: '☕',
      audioExample: '„Spüre gerade ein kleines Tief, habe mir aber ein großes Glas Wasser und ein paar Nüsse geholt.“',
      careTip: 'Wenn die Augen schwer werden: 5 Minuten Fenster auf und tief durchatmen!',
      quickQuestions: [
        '🔋 Wie steht dein Energielevel (1-5)?',
        '💧 Schon genug Wasser getrunken?',
        '🍫 Heißhunger auf Süßes?'
      ]
    };
  } else if (hour >= 18 && hour < 23) {
    return {
      id: 'evening',
      timeSlot: 'evening',
      headline: 'Schönen Feierabend! Wie war dein Tag? 🍲',
      subtext: 'Wie fühlt sich dein Bauch an? Lass mal hören, wie dein Abendessen war!',
      bubbleText: '„Feierabend! 🌙 Was gab\'s zum Abendessen und wie fühlst du dich?“',
      emoji: '🍲',
      audioExample: '„Hatte Gemüsesuppe und etwas Vollkornbrot. Entspanne jetzt auf der Couch und fühle mich wohl.“',
      careTip: 'Ein leichtes Abendessen schenkt dir heute Nacht tiefe Erholung.',
      quickQuestions: [
        '🥑 Leichtes oder üppiges Abendessen?',
        '🛋️ Konntest du schon abschalten?',
        '✨ Was war heute dein Wohlfühl-Moment?'
      ]
    };
  } else {
    return {
      id: 'night',
      timeSlot: 'night',
      headline: 'Noch wach? Wie geht es dir? 🌙',
      subtext: 'Kommst du gut zur Ruhe oder kreisen die Gedanken?',
      bubbleText: '„Spät geworden! 🌌 Alles okay bei dir? Lass den Tag ganz ruhig ausklingen.“',
      emoji: '😴',
      audioExample: '„Gehe gleich ins Bett, lese noch 10 Minuten und schalte das Handy ab.“',
      careTip: 'Schalte das Display am besten auf Nachtmodus. Schlaf gut!',
      quickQuestions: [
        '📖 Handy schon zur Seite gelegt?',
        '🫖 Noch einen warmen Kamillentee?',
        '✨ Bereit für die Nachtruhe?'
      ]
    };
  }
}
