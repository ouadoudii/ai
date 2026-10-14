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

export const momentCategoryLabels: Record<AppLanguage,Record<string,string>> = {
 de:{breakfast:'Frühstück',lunch:'Mittagessen',dinner:'Abendessen',snack:'Snack',coffee:'Kaffee & Kuchen',dessert:'Dessert',drinks:'Getränke & Bar',travel:'Kulinarische Reise'},
 en:{breakfast:'Breakfast',lunch:'Lunch',dinner:'Dinner',snack:'Snack',coffee:'Coffee & Cake',dessert:'Dessert',drinks:'Drinks & Bar',travel:'Culinary Travel'},
 fr:{breakfast:'Petit-déjeuner',lunch:'Déjeuner',dinner:'Dîner',snack:'En-cas',coffee:'Café et gâteau',dessert:'Dessert',drinks:'Boissons et bar',travel:'Voyage culinaire'},
 ar:{breakfast:'فطور',lunch:'غداء',dinner:'عشاء',snack:'وجبة خفيفة',coffee:'قهوة وحلوى',dessert:'حلوى',drinks:'مشروبات',travel:'رحلة طعام'}
};
export const momentMoodLabels: Record<AppLanguage,Record<string,string>> = {
 de:{energized:'Energiegeladen',satisfied:'Satt & Zufrieden',light:'Leicht & Bekömmlich',indulgent:'Genuss pur',comfort:'Wohlfühl-Essen',joyful:'Feierlich / Gesellig'},
 en:{energized:'Energized',satisfied:'Satisfied',light:'Light',indulgent:'Indulgent',comfort:'Comfort food',joyful:'Joyful'},
 fr:{energized:'Plein d’énergie',satisfied:'Rassasié et satisfait',light:'Léger',indulgent:'Gourmand',comfort:'Réconfortant',joyful:'Festif'},
 ar:{energized:'مفعم بالطاقة',satisfied:'شبعان وراضٍ',light:'خفيف',indulgent:'لذيذ',comfort:'طعام مريح',joyful:'احتفالي'}
};
