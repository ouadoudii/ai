import { FoodMoment } from '../types';

export type MomentListFilter='all'|'favorites';

export const filterMoments=(moments:FoodMoment[],filter:MomentListFilter):FoodMoment[]=>
  filter==='favorites'?moments.filter(moment=>Boolean(moment.isFavorite)):moments;
