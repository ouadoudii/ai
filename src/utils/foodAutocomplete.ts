import { foodSearchMatches, normalizeFoodSearchText } from './arabicFoodIntelligence';

export function normalizeAutocomplete(value:string):string{
  return normalizeFoodSearchText(value);
}

export function rankLocalAutocomplete(names:string[],query:string,limit=6):string[]{
  const q=normalizeAutocomplete(query);
  if(!q)return names.slice(0,limit);
  const starts:string[]=[]; const contains:string[]=[];
  for(const name of names){
    const n=normalizeAutocomplete(name);
    if(n===q)continue;
    if(n.startsWith(q))starts.push(name);
    else if(n.includes(q)||foodSearchMatches(name,query))contains.push(name);
  }
  return [...starts,...contains].slice(0,limit);
}

export function mergeAutocompleteSuggestions(local:string[],ai:string[],current:string,limit=6):string[]{
  const seen=new Set<string>(); const q=normalizeAutocomplete(current);
  return [...local,...ai].filter(name=>{
    const key=normalizeAutocomplete(name);
    if(!key||key===q||seen.has(key))return false;
    seen.add(key); return true;
  }).slice(0,limit);
}
