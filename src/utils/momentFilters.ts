import { FoodMoment } from '../types';

export type MomentListFilter='all'|'favorites';
export type MomentCategoryFilter=FoodMoment['category']|'all';

const normalizeSearch=(value:string)=>value.normalize('NFD').replace(/\p{M}/gu,'').toLocaleLowerCase().trim();

export const filterMoments=(moments:FoodMoment[],filter:MomentListFilter,query='',category:MomentCategoryFilter='all'):FoodMoment[]=>{
  const byFavorite=filter==='favorites'?moments.filter(moment=>Boolean(moment.isFavorite)):moments;
  const byCategory=category==='all'?byFavorite:byFavorite.filter(moment=>moment.category===category);
  const needle=normalizeSearch(query);
  if(!needle)return byCategory;
  return byCategory.filter(moment=>normalizeSearch([moment.title,moment.location,...(moment.tags||[])].filter(Boolean).join(' ')).includes(needle));
};