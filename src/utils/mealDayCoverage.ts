type MealLike={id:string;date?:string};

export type MealDayCoverage={days:number;windowDays:7};

const demoId=/^moment-\d{1,2}$/;

const dayNumber=(key:string)=>{
  const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if(!match)return null;
  const year=Number(match[1]);
  const month=Number(match[2]);
  const day=Number(match[3]);
  const value=Date.UTC(year,month-1,day);
  const check=new Date(value);
  if(check.getUTCFullYear()!==year||check.getUTCMonth()!==month-1||check.getUTCDate()!==day)return null;
  return Math.floor(value/86400000);
};

export const deriveMealDayCoverage=(moments:MealLike[],referenceDate:string):MealDayCoverage|null=>{
  const referenceDay=dayNumber(referenceDate);
  if(referenceDay===null)return null;
  const represented=new Set<number>();
  for(const moment of moments){
    if(demoId.test(moment.id))continue;
    const day=moment.date?dayNumber(moment.date):null;
    if(day===null||day>referenceDay||referenceDay-day>6)continue;
    represented.add(day);
  }
  if(represented.size<2)return null;
  return {days:represented.size,windowDays:7};
};
