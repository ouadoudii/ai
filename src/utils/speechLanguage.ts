import type { AppLanguage } from '../i18n';

export function browserSpeechLocale(language: AppLanguage): string {
  if (language === 'ar') return 'ar-MA';
  if (language === 'de') return 'de-DE';
  return 'en-US';
}

export function voiceCopy(language: AppLanguage) {
  if (language === 'ar') return {
    back:'رجوع', close:'إغلاق', title:'قل ماذا أكلت', subtitle:'تحدث بطريقتك — العربية أو الدارجة أو الإنجليزية.',
    start:'ابدأ التسجيل', stop:'إيقاف التسجيل', idle:'اضغط وابدأ الكلام', processing:'نفهم التسجيل على جهازك…',
    permission:'نحتاج إذن الميكروفون للتسجيل.', unsupported:'التسجيل الصوتي غير مدعوم في هذا المتصفح.',
    noSpeech:'لم نفهم الكلام. جرّب مرة أخرى وتكلم بوضوح.', failed:'تعذر التعرف على الكلام. جرّب مرة أخرى.'
  };
  if (language === 'de') return {
    back:'Zurück', close:'Schließen', title:'Erzähl mir, was du gegessen hast', subtitle:'Sprich ganz natürlich auf Deutsch.',
    start:'Aufnahme starten', stop:'Aufnahme stoppen', idle:'Tippen und sprechen', processing:'Aufnahme wird verstanden…',
    permission:'Für die Aufnahme wird Mikrofonzugriff benötigt.', unsupported:'Sprachaufnahme wird von diesem Browser nicht unterstützt.',
    noSpeech:'Ich konnte dich nicht verstehen. Versuch es noch einmal und sprich deutlich.', failed:'Spracherkennung fehlgeschlagen. Versuch es noch einmal.'
  };
  return {
    back:'Back', close:'Close', title:'Tell me what you had', subtitle:'Speak naturally — Arabic, Darija or English.',
    start:'Start recording', stop:'Stop recording', idle:'Tap and start speaking', processing:'Understanding it on your device…',
    permission:'Microphone permission is needed to record.', unsupported:'Voice recording is not supported in this browser.',
    noSpeech:'We could not understand that. Try again and speak clearly.', failed:'Speech recognition failed. Try again.'
  };
}
