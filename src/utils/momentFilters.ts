import { FoodMoment } from '../types';

export type MomentListFilter='all'|'favorites';

const normalizeSearch=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase().trim();

export const filterMoments=(moments:FoodMoment[],filter:MomentListFilter,query=''):FoodMoment[]=>{
  const filtered=filter==='favorites'?moments.filter(moment=>Boolean(moment.isFavorite)):moments;
  const needle=normalizeSearch(query);
  if(!needle)return filtered;
  return filtered.filter(moment=>normalizeSearch([moment.title,moment.location,...(moment.tags||[])].filter(Boolean).join(' ')).includes(needle));
};
