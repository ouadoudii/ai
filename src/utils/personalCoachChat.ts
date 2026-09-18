import { DailyCheckIn, FoodMoment } from '../types';

export type CoachLanguage = 'de' | 'en' | 'fr' | 'ar';

export interface PersonalCoachAnswer {
  personalObservations: string[];
  generalGuidance: string[];
  uncertainty: string;
  answer: string;
}

const copy = {
  de: { personal:'Aus deinen Daten', general:'Allgemeiner Hinweis', uncertain:'Vorläufige Einschätzung', gap:'Dafür habe ich noch zu wenig persönliche Daten.', sleep:'Du hast zuletzt eher wenig Schlaf dokumentiert.', energy:'Du hast zuletzt eher niedrige Energie dokumentiert.', meals:'Du hast zuletzt Mahlzeiten erfasst; ich kann deshalb Essensmuster berücksichtigen.', guide:'Plane heute etwas Puffer ein und beobachte, was dir tatsächlich hilft.' },
  en: { personal:'From your data', general:'General guidance', uncertain:'Preliminary assessment', gap:'I do not have enough personal data for a strong conclusion yet.', sleep:'You recently logged relatively little sleep.', energy:'You recently logged relatively low energy.', meals:'You recently logged meals, so I can take eating patterns into account.', guide:'Leave some buffer today and notice what actually helps you.' },
  fr: { personal:'D’après tes données', general:'Conseil général', uncertain:'Évaluation provisoire', gap:'Je n’ai pas encore assez de données personnelles pour conclure solidement.', sleep:'Tu as récemment noté plutôt peu de sommeil.', energy:'Tu as récemment noté une énergie plutôt basse.', meals:'Tu as récemment enregistré des repas, je peux donc tenir compte de tes habitudes alimentaires.', guide:'Prévois un peu de marge aujourd’hui et observe ce qui t’aide réellement.' },
  ar: { personal:'من بياناتك', general:'إرشاد عام', uncertain:'تقييم مبدئي', gap:'لا توجد لدي بيانات شخصية كافية بعد لاستنتاج قوي.', sleep:'سجلت مؤخراً ساعات نوم قليلة نسبياً.', energy:'سجلت مؤخراً مستوى طاقة منخفضاً نسبياً.', meals:'سجلت وجبات مؤخراً، لذلك يمكنني أخذ نمط الأكل في الاعتبار.', guide:'اترك بعض المساحة في يومك وراقب ما يساعدك فعلاً.' },
} as const;

export function buildPersonalCoachAnswer(question:string, moments:FoodMoment[], checkIns:DailyCheckIn[], language:CoachLanguage='de'):PersonalCoachAnswer {
  const t=copy[language] || copy.de;
  const recent=checkIns.slice(0,7);
  const observations:string[]=[];
  const sleepHours=recent.map(c=>c.sleep?.durationHours).filter((v):v is number=>typeof v==='number');
  const energies=recent.map(c=>c.wellbeing?.energyLevel).filter((v):v is number=>typeof v==='number');
  if(sleepHours.length && sleepHours.reduce((a,b)=>a+b,0)/sleepHours.length < 7) observations.push(t.sleep);
  if(energies.length && energies.reduce((a,b)=>a+b,0)/energies.length < 3) observations.push(t.energy);
  if(moments.length) observations.push(t.meals);
  const uncertainty=observations.length ? t.uncertain : t.gap;
  const guidance=[t.guide];
  const personal=observations.length ? observations.join(' ') : t.gap;
  return { personalObservations:observations, generalGuidance:guidance, uncertainty, answer:`${t.personal}: ${personal}\n\n${t.general}: ${guidance.join(' ')}\n\n${uncertainty}` };
}
