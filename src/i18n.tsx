import React from 'react';

export type AppLanguage = 'en' | 'ar';
type Dictionary = Record<string, { en: string; ar: string }>;
const dictionary: Dictionary = {
  today:{en:'Today',ar:'اليوم'}, add:{en:'Add a moment',ar:'سجّل لحظة'}, patterns:{en:'Discoveries',ar:'اكتشافاتك'}, sleepFoodEnergy:{en:'Sleep · Food · Energy',ar:'النوم · الطعام · الطاقة'}, mainNav:{en:'Main navigation',ar:'التنقل الرئيسي'},
  nothingLogged:{en:'A fresh day',ar:'يوم جديد'}, entry:{en:'moment',ar:'لحظة'}, entries:{en:'moments',ar:'لحظات'}, todaySuffix:{en:'today',ar:'اليوم'},
  captureOnly:{en:'Start with one small moment.',ar:'ابدأ بلحظة صغيرة من يومك.'}, dayBuilds:{en:'Your picture is getting clearer.',ar:'صورتك تصبح أوضح مع كل لحظة.'},
  captureHint:{en:'Food, sleep, energy or mood — a photo, your voice or a few taps is enough.',ar:'طعام، نوم، طاقة أو شعور — صورة أو صوتك أو بضع نقرات تكفي.'},
  todaySoFar:{en:'Your moments today',ar:'لحظاتك اليوم'}, tooEarly:{en:'We’re getting to know your rhythm',ar:'نبدأ بالتعرّف على إيقاعك'}, whatRepeats:{en:'What are you discovering?',ar:'ماذا تكتشف عن نفسك؟'},
  everydayReveal:{en:'A few everyday moments can reveal surprisingly useful connections.',ar:'بضع لحظات من يومك قد تكشف روابط مفيدة لم تلاحظها من قبل.'}, viewPatterns:{en:'See what I’m discovering',ar:'شاهد ما أكتشفه'},
  noPerfectDay:{en:'No perfect day needed — real life is what matters.',ar:'لا نحتاج يوماً مثالياً — يومك الحقيقي هو المهم.'}, noticeDontObsess:{en:'Curiosity, not perfection',ar:'فضول، لا مثالية'},
  understandRhythm:{en:'Discover what helps you feel your best.',ar:'اكتشف ما يساعدك لتشعر بأفضل حال.'},
  onboardingBody:{en:'Share a few everyday moments about food, sleep, energy and mood. Over time, we connect the dots and reveal your personal rhythm.',ar:'شارك بضع لحظات عادية عن الطعام والنوم والطاقة والشعور. مع الوقت نربط بينها ونساعدك على اكتشاف إيقاعك الخاص.'},
  photo:{en:'Photo',ar:'صورة'}, speak:{en:'Tell me',ar:'احكِ لي'}, tap:{en:'Quick check',ar:'اختيار سريع'}, noPerfectTracking:{en:'Keep it easy.',ar:'خلّها بسيطة.'},
  ordinaryEnough:{en:'You don’t have to log everything. Small, honest moments are enough to learn from.',ar:'لا تحتاج لتسجيل كل شيء. لحظات بسيطة وصادقة تكفي لنتعلّم منها.'}, startToday:{en:'Discover my rhythm',ar:'ابدأ اكتشاف إيقاعي'}, language:{en:'العربية',ar:'English'},
  addWhat:{en:'What would you like to capture?',ar:'ما اللحظة التي تريد تسجيلها؟'}, addLabel:{en:'One quick moment',ar:'لحظة سريعة'}, again:{en:'Have it again?',ar:'تكرر شيء من قبل؟'}, type:{en:'Write',ar:'اكتب'},
  captureKinds:{en:'Choose whatever feels easiest. A few seconds is enough.',ar:'اختر الأسهل لك. بضع ثوانٍ تكفي.'}, yourData:{en:'Your discoveries',ar:'اكتشافاتك'},
  patternsIntro:{en:'This is where everyday moments start turning into useful discoveries about you.',ar:'هنا تتحول لحظاتك اليومية تدريجياً إلى اكتشافات مفيدة عنك.'}, observations:{en:'moments',ar:'لحظات'}, tryWeek:{en:'A small experiment',ar:'تجربة صغيرة'},
  realDataPoints:{en:'moments helping us learn',ar:'لحظات تساعدنا على التعلّم'}, ordinaryDaysEnough:{en:'Everyday life gives us the best clues.',ar:'حياتك اليومية تعطينا أفضل الإشارات.'}
};
const fallbackT=(key:string)=>dictionary[key]?.en??key;
const LanguageContext=React.createContext<{language:AppLanguage;setLanguage:(lang:AppLanguage)=>void;t:(key:string)=>string}>({language:'en',setLanguage:()=>{},t:fallbackT});
export const LanguageProvider:React.FC<React.PropsWithChildren>=({children})=>{const [language,setLanguageState]=React.useState<AppLanguage>(()=>{try{return localStorage.getItem('rhythm_language_v1')==='ar'?'ar':'en'}catch{return'en'}});const setLanguage=React.useCallback((lang:AppLanguage)=>{setLanguageState(lang);try{localStorage.setItem('rhythm_language_v1',lang)}catch{}},[]);React.useEffect(()=>{document.documentElement.lang=language;document.documentElement.dir=language==='ar'?'rtl':'ltr';document.body.dir=language==='ar'?'rtl':'ltr'},[language]);const t=React.useCallback((key:string)=>dictionary[key]?.[language]??key,[language]);return <LanguageContext.Provider value={{language,setLanguage,t}}>{children}</LanguageContext.Provider>};
export const useLanguage=()=>React.useContext(LanguageContext);
