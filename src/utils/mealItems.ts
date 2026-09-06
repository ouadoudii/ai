export function normalizeMealItem(value:string):string{
  return value.trim().replace(/\s+/g,' ');
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
  return addMealItem(items,pending).join(' · ');
}
