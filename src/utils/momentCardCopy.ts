import type { AppLanguage } from '../i18n';
export const momentCardCopy = {
 de:{home:'Zuhause',favorite:'Als Favorit markieren',unfavorite:'Aus Favoriten entfernen',feeling:'Gefühl',hunger:'Hunger',fullness:'Sättigung',slow:'Langsam',rushed:'Gehetzt',normal:'Normal',details:'Details',options:'Optionen',edit:'Bearbeiten',remove:'Löschen'},
 en:{home:'Home',favorite:'Add to favorites',unfavorite:'Remove from favorites',feeling:'Feeling',hunger:'Hunger',fullness:'Fullness',slow:'Slow',rushed:'Rushed',normal:'Normal',details:'Details',options:'Options',edit:'Edit',remove:'Delete'},
 fr:{home:'Maison',favorite:'Ajouter aux favoris',unfavorite:'Retirer des favoris',feeling:'Ressenti',hunger:'Faim',fullness:'Satiété',slow:'Lent',rushed:'Pressé',normal:'Normal',details:'Détails',options:'Options',edit:'Modifier',remove:'Supprimer'},
 ar:{home:'المنزل',favorite:'إضافة إلى المفضلة',unfavorite:'إزالة من المفضلة',feeling:'الشعور',hunger:'الجوع',fullness:'الشبع',slow:'ببطء',rushed:'بسرعة',normal:'عادي',details:'التفاصيل',options:'الخيارات',edit:'تعديل',remove:'حذف'}
} satisfies Record<AppLanguage,Record<string,string>>;
export const momentCardDate = (date:string, language:AppLanguage):string => {
 const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
 if(!match)return date;
 const value=new Date(Date.UTC(Number(match[1]),Number(match[2])-1,Number(match[3])));
 if(Number.isNaN(value.getTime())||value.getUTCMonth()!==Number(match[2])-1||value.getUTCDate()!==Number(match[3]))return date;
 return new Intl.DateTimeFormat(({de:'de-DE',en:'en-GB',fr:'fr-FR',ar:'ar'} as const)[language],{day:'numeric',month:'short',timeZone:'UTC'}).format(value);
};
