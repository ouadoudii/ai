import { FoodMoment } from '../types';

export type MomentListFilter='all'|'favorites';
export type MomentDateRange='all'|'7d'|'30d';

const normalizeSearch=(value:string)=>value.normalize('NFD').replace(/\p{M}/gu,'').toLocaleLowerCase().trim();
const localDateKey=(date:Date)=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;

export const filterMoments=(moments:FoodMoment[],filter:MomentListFilter,query='',dateRange:MomentDateRange='all',now=new Date()):FoodMoment[]=>{
  let filtered=filter==='favorites'?moments.filter(moment=>Boolean(moment.isFavorite)):moments;
  if(dateRange!=='all'){
    const days=dateRange==='7d'?7:30;
    const start=new Date(now.getFullYear(),now.getMonth(),now.getDate());
    start.setDate(start.getDate()-(days-1));
    const startKey=localDateKey(start),endKey=localDateKey(now);
    filtered=filtered.filter(moment=>moment.date>=startKey&&moment.date<=endKey);
  }
  const needle=normalizeSearch(query);
  if(!needle)return filtered;
  return filtered.filter(moment=>normalizeSearch([moment.title,moment.location,moment.notes,...(moment.tags||[])].filter(Boolean).join(' ')).includes(needle));
};
