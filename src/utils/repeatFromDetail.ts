import type { FoodMoment } from '../types';

export type SupportedLanguage='en'|'de'|'fr'|'ar';

const copy:Record<SupportedLanguage,{label:string;aria:string}>={
  en:{label:'Again',aria:'Log this meal again'},
  de:{label:'Nochmal',aria:'Diese Mahlzeit erneut eintragen'},
  fr:{label:'À nouveau',aria:'Enregistrer ce repas à nouveau'},
  ar:{label:'مرة أخرى',aria:'سجّل هذه الوجبة مرة أخرى'},
};

export const getRepeatFromDetailCopy=(language:string)=>copy[(language in copy?language:'en') as SupportedLanguage];

export const canRepeatFromDetail=(moment:FoodMoment|null|undefined):moment is FoodMoment=>{
  if(!moment)return false;
  if(/^moment-\d{1,2}$/.test(moment.id))return false;
  return Boolean(moment.title?.trim()&&moment.category);
};
