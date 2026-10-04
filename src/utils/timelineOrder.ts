import type { FoodMoment } from '../types';

const phaseRank: Record<string, number> = { breakfast:0, coffee:1, lunch:2, snack:3, dinner:4, dessert:5, drinks:6, travel:7 };
const validTime=(value:string|undefined)=>/^([01]\d|2[0-3]):[0-5]\d$/.test(value||'');

/** Newest dates first; unknown times remain unknown and use semantic phase/order fallback. */
export function compareTimelineMoments(a:FoodMoment,b:FoodMoment):number {
 const dateOrder=b.date.localeCompare(a.date); if(dateOrder)return dateOrder;
 const aTimed=validTime(a.time),bTimed=validTime(b.time);
 if(aTimed&&bTimed)return (b.time||'').localeCompare(a.time||'');
 if(!aTimed&&!bTimed){const categoryOrder=(phaseRank[b.category]??99)-(phaseRank[a.category]??99);if(categoryOrder)return categoryOrder;const createdOrder=(b.createdAt||0)-(a.createdAt||0);if(createdOrder)return createdOrder;return b.id.localeCompare(a.id);}
 const timed=aTimed?a:b,untimed=aTimed?b:a;const hour=Number((timed.time||'00:00').slice(0,2));const timedRank=hour<11?0:hour<15?2:hour<18?3:4;const untimedRank=phaseRank[untimed.category]??99;const result=untimedRank-timedRank;if(result)return aTimed?result:-result;return aTimed?-1:1;
}
