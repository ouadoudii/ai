import type { AppLanguage } from '../i18n';
import type { CaryPatternInsight } from './patternInsights';

type Copy = { observation: string; experiment: string };

const association = {
  de: 'Das ist ein Zusammenhang in deinen Einträgen, kein Beweis für Ursache und Wirkung.',
  fr: 'C’est une association dans tes entrées, pas une preuve de cause à effet.',
  ar: 'هذا ارتباط في إدخالاتك، وليس دليلاً على أن أحدهما سبب الآخر.',
  en: 'This is an association in your entries, not proof that one caused the other.',
} satisfies Record<AppLanguage, string>;

const numbers = (text: string) => [...text.matchAll(/\d+/g)].map(match => Number(match[0]));

export function localizePatternInsight(item: CaryPatternInsight, language: AppLanguage): Copy {
  if (language === 'en' || item.id === 'learning') return { observation: item.observation, experiment: item.experiment };
  const [a = 0, b = item.evidenceCount] = numbers(item.observation);

  if (item.id === 'sleep-energy') {
    const hasAssociation = /low on \d+ of \d+/.test(item.observation);
    return {
      observation: hasAssociation
        ? language === 'de' ? `Nach kürzeren Nächten war deine spätere Energie an ${a} von ${b} beobachteten Tagen niedrig. ${association.de}`
        : language === 'fr' ? `Après des nuits plus courtes, ton énergie plus tard était basse ${a} jours sur ${b}. ${association.fr}`
        : `بعد الليالي الأقصر، كانت طاقتك لاحقاً منخفضة في ${a} من ${b} أيام تمت ملاحظتها. ${association.ar}`
        : language === 'de' ? `Du hast ${a} kürzere Nächte erfasst, aber danach zeigt sich noch kein stabiler Zusammenhang mit deiner Energie.`
        : language === 'fr' ? `Tu as enregistré ${a} nuits plus courtes, mais aucun lien stable avec ton énergie n’apparaît encore ensuite.`
        : `سجلت ${a} ليالٍ أقصر، لكن لا يظهر بعد ارتباط ثابت مع طاقتك لاحقاً.`,
      experiment: language === 'de' ? 'Achte nach deiner nächsten kurzen Nacht besonders auf deine Energie am frühen Nachmittag.' : language === 'fr' ? 'Après ta prochaine nuit courte, observe particulièrement ton énergie en début d’après-midi.' : 'بعد ليلتك القصيرة القادمة، انتبه بشكل خاص إلى طاقتك في بداية فترة بعد الظهر.',
    };
  }
  if (item.id === 'pace-energy') return {
    observation: /After \d+ of \d+/.test(item.observation)
      ? language === 'de' ? `Nach ${a} von ${b} hastigen Mahlzeiten hast du dich danach träger gefühlt. ${association.de}` : language === 'fr' ? `Après ${a} repas pris rapidement sur ${b}, tu t’es senti plus léthargique ensuite. ${association.fr}` : `بعد ${a} من ${b} وجبات سريعة الأكل، شعرت بخمول أكبر بعدها. ${association.ar}`
      : language === 'de' ? `Du hast ${a} hastige Mahlzeiten erfasst; ein klarer Zusammenhang mit deiner Energie zeigt sich danach noch nicht.` : language === 'fr' ? `Tu as enregistré ${a} repas pris rapidement ; aucun lien clair avec ton énergie n’apparaît encore ensuite.` : `سجلت ${a} وجبات سريعة الأكل؛ ولا يظهر بعد ارتباط واضح مع طاقتك بعدها.`,
    experiment: language === 'de' ? 'Nimm dir bei einer ähnlichen Mahlzeit fünf Minuten mehr Zeit und vergleiche, wie du dich danach fühlst.' : language === 'fr' ? 'Prends cinq minutes de plus pour un repas similaire et compare comment tu te sens ensuite.' : 'امنح نفسك خمس دقائق إضافية مع وجبة مشابهة وقارن شعورك بعدها.',
  };
  if (item.id === 'lunch-rhythm') return {
    observation: /often late/.test(item.observation) ? (language === 'de' ? `Dein Mittagessen ist oft spät: ${a} von ${b} Einträgen waren um 14 Uhr oder später.` : language === 'fr' ? `Ton déjeuner est souvent tardif : ${a} entrées sur ${b} étaient à 14 h ou plus tard.` : `غداؤك غالباً متأخر: ${a} من ${b} إدخالات كانت عند الساعة 14:00 أو بعدها.`) : (language === 'de' ? 'Dein Mittagessen war bisher meistens vor 14 Uhr und wirkt recht regelmäßig.' : language === 'fr' ? 'Jusqu’ici, ton déjeuner a surtout eu lieu avant 14 h et semble assez régulier.' : 'كان غداؤك حتى الآن غالباً قبل الساعة 14:00 ويبدو منتظماً إلى حد ما.'),
    experiment: language === 'de' ? 'Vergleiche Hunger und Energie zwei Stunden nach einem früheren und einem späteren Mittagessen.' : language === 'fr' ? 'Compare ta faim et ton énergie deux heures après un déjeuner plus tôt et un autre plus tard.' : 'قارن الجوع والطاقة بعد ساعتين من غداء مبكر وآخر متأخر.',
  };
  if (item.id === 'late-lunch-snacking') return {
    observation: language === 'de' ? `An ${a} von ${b} Tagen mit Mittagessen um 14 Uhr oder später hast du auch einen Snack am Abend erfasst. ${association.de}` : language === 'fr' ? `Lors de ${a} jours sur ${b} avec un déjeuner à 14 h ou plus tard, tu as aussi enregistré une collation le soir. ${association.fr}` : `في ${a} من ${b} أيام كان الغداء فيها عند الساعة 14:00 أو بعدها، سجلت أيضاً وجبة خفيفة مساءً. ${association.ar}`,
    experiment: language === 'de' ? 'Probiere an einem vergleichbaren Tag ein etwas früheres Mittagessen und beobachte einfach, ob sich dein Hunger am Abend anders anfühlt.' : language === 'fr' ? 'Un jour comparable, essaie de déjeuner un peu plus tôt et observe simplement si ta faim du soir change.' : 'في يوم مشابه، جرّب تناول الغداء أبكر قليلاً ولاحظ ببساطة إن كان جوع المساء مختلفاً.',
  };
  if (item.id === 'distraction-fullness') return {
    observation: /After \d+ of \d+/.test(item.observation) ? (language === 'de' ? `Nach ${a} von ${b} abgelenkten Mahlzeiten war dein Sättigungsgefühl eher hoch. ${association.de}` : language === 'fr' ? `Après ${a} repas distraits sur ${b}, ta satiété était plutôt élevée. ${association.fr}` : `بعد ${a} من ${b} وجبات مع تشتت، كان شعورك بالشبع أعلى. ${association.ar}`) : (language === 'de' ? 'Ablenkung beim Essen taucht in deinen Einträgen auf, aber noch ohne wiederkehrenden Zusammenhang mit Sättigung.' : language === 'fr' ? 'La distraction pendant les repas apparaît dans tes entrées, mais sans lien répété avec la satiété pour le moment.' : 'يظهر التشتت أثناء الأكل في إدخالاتك، لكن دون ارتباط متكرر بالشبع حتى الآن.'),
    experiment: language === 'de' ? 'Iss eine vergleichbare Mahlzeit ohne Bildschirm und beobachte, ob sich deine Sättigung anders anfühlt.' : language === 'fr' ? 'Mange un repas comparable sans écran et observe si ta satiété est différente.' : 'تناول وجبة مشابهة من دون شاشة ولاحظ إن كان شعورك بالشبع مختلفاً.',
  };
  return { observation: item.observation, experiment: item.experiment };
}
