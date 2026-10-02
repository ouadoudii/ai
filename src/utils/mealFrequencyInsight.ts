type MealLike={id:string;title?:string;date?:string;time?:string};

export type MealFrequencyInsight={title:string;count:number};

const demoId=/^moment-\d{1,2}$/;
const harakat=/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;

const normalizeTitle=(value:string)=>value
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g,'')
  .replace(harakat,'')
  .toLocaleLowerCase()
  .replace(/\s+/g,' ')
  .trim();

const dayNumber=(key:string)=>{
  const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if(!match)return null;
  const value=Date.UTC(Number(match[1]),Number(match[2])-1,Number(match[3]));
  return Number.isFinite(value)?Math.floor(value/86400000):null;
};

export const deriveMealFrequencyInsight=(moments:MealLike[],referenceDate:string):MealFrequencyInsight|null=>{
  const referenceDay=dayNumber(referenceDate);
  if(referenceDay===null)return null;
  const groups=new Map<string,{count:number;title:string;latest:string}>();

  for(const moment of moments){
    if(demoId.test(moment.id))continue;
    const title=moment.title?.trim();
    const day=moment.date?dayNumber(moment.date):null;
    if(!title||day===null||day>referenceDay||referenceDay-day>6)continue;
    const key=normalizeTitle(title);
    if(!key)continue;
    const stamp=`${moment.date}T${moment.time||'00:00'}`;
    const current=groups.get(key);
    if(!current)groups.set(key,{count:1,title,latest:stamp});
    else {
      current.count+=1;
      if(stamp>=current.latest){current.latest=stamp;current.title=title;}
    }
  }

  const candidates=[...groups.values()].filter(item=>item.count>=3)
    .sort((a,b)=>b.count-a.count||b.latest.localeCompare(a.latest));
  return candidates[0]?{title:candidates[0].title,count:candidates[0].count}:null;
};
