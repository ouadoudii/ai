import { FoodMoment } from '../types';

const isDemoMoment=(moment:FoodMoment)=>/^moment-\d{1,2}$/.test(moment.id);

/** Returns the newest real meal eligible for a Today one-tap repeat shortcut. */
export function getLatestRepeatMeal(moments:FoodMoment[]):FoodMoment|undefined{
  return [...moments]
    .filter(moment=>!isDemoMoment(moment))
    .sort((a,b)=>(b.createdAt||0)-(a.createdAt||0))[0];
}
