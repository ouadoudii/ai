import { TimeOfDayPhase } from '../types';
import { AppLanguage } from '../i18n';

export function shouldUseFullDayVoiceRecap(hour:number, completed:Iterable<TimeOfDayPhase>):boolean {
  const phases=new Set(completed);
  return hour>=18 && phases.size<3;
}

export function voiceHomePrompt(language:AppLanguage, fullDay:boolean){
  if(fullDay){
    if(language==='ar')return{title:'عاود ليا نهارك كامل',body:'هضر براحتك على الصباح، الغدا والعشا. Moment غادي يوزّع كل حاجة فبلاصتها بلا ما يعاود يسجّل اللي راه موجود.',cta:'بدا تهضر'};
    if(language==='de')return{title:'Erzähl mir deinen ganzen Tag',body:'Erzähl frei von Morgen, Mittag und Abend. Moment ordnet alles ein und vermeidet doppelte Einträge.',cta:'Jetzt erzählen'};
    if(language==='fr')return{title:'Raconte-moi toute ta journée',body:'Parle librement du matin, du midi et du soir. Moment range chaque détail au bon endroit sans doublons.',cta:'Commencer à parler'};
    return{title:'Tell me about your whole day',body:'Speak freely about morning, lunch and evening. Moment files each detail in the right place without duplicates.',cta:'Start talking'};
  }
  if(language==='ar')return{title:'هضر مع Moment',body:'قول شنو كلّيتي، كيف نعستي ولا كيف حسيتي. صوتك هو أسرع طريقة تسجّل نهارك.',cta:'بدا تهضر'};
  if(language==='de')return{title:'Sprich mit Moment',body:'Erzähl, was du gegessen hast, wie du geschlafen hast oder wie du dich fühlst. Deine Stimme ist der schnellste Weg.',cta:'Jetzt erzählen'};
  if(language==='fr')return{title:'Parle à Moment',body:'Raconte ce que tu as mangé, comment tu as dormi ou comment tu te sens. Ta voix est le chemin le plus direct.',cta:'Commencer à parler'};
  return{title:'Talk to Moment',body:'Tell me what you ate, how you slept or how you feel. Your voice is the fastest way to capture your day.',cta:'Start talking'};
}
