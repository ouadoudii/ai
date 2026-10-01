import { FoodMoment } from '../types';

export type MomentListFilter='all'|'favorites';
export type MomentSearchScope='all'|'notes';

const normalizeSearch=(value:string)=>value.normalize('NFD').replace(/\p{M}/gu,'').toLocaleLowerCase().trim();

export const filterMoments=(moments:FoodMoment[],filter:MomentListFilter,query='',scope:MomentSearchScope='all'):FoodMoment[]=>{
  const filtered=filter==='favorites'?moments.filter(moment=>Boolean(moment.isFavorite)):moments;
  const needle=normalizeSearch(query);
  if(!needle)return filtered;
  return filtered.filter(moment=>{
    const searchable=scope==='notes'
      ? moment.note||''
      : [moment.title,moment.location,...(moment.tags||[]),moment.note].filter(Boolean).join(' ');
    return normalizeSearch(searchable).includes(needle);
  });
};
