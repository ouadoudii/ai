const MEAL_ITEM_SEPARATOR=' · ';

export function normalizeMealItem(value:string):string{
  return value.trim().replace(/\s+/g,' ');
}

/**
 * Rehydrates titles produced by buildMealTitle back into editable components.
 * The separator is our own serialization contract, so localized food names and
 * mixed-script content are preserved verbatim instead of being heuristically parsed.
 */
export function parseMealTitle(value:string):string[]{
  return value
    .split(MEAL_ITEM_SEPARATOR)
    .map(normalizeMealItem)
    .filter(Boolean);
}

export function addMealItem(items:string[],value:string):string[]{
  const clean=normalizeMealItem(value);
  if(!clean)return items;
  const key=clean.toLocaleLowerCase();
  if(items.some(item=>normalizeMealItem(item).toLocaleLowerCase()===key))return items;
  return [...items,clean];
}

export function removeMealItem(items:string[],index:number):string[]{
  return items.filter((_,i)=>i!==index);
}

export function buildMealTitle(items:string[],pending=''):string{
  return addMealItem(items,pending).join(MEAL_ITEM_SEPARATOR);
}