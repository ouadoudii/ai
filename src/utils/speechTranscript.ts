export function mergeSpeechSegments(segments:string[]):string{
  let merged='';
  for(const raw of segments){
    const next=String(raw||'').trim().replace(/\s+/g,' ');
    if(!next)continue;
    if(!merged){merged=next;continue}
    if(next===merged||merged.endsWith(next))continue;
    if(next.includes(merged)){merged=next;continue}
    if(merged.includes(next))continue;
    const a=merged.split(' ');
    const b=next.split(' ');
    let overlap=0;
    const max=Math.min(a.length,b.length);
    for(let n=max;n>0;n--){
      if(a.slice(-n).join(' ')===b.slice(0,n).join(' ')){overlap=n;break}
    }
    merged=[merged,b.slice(overlap).join(' ')].filter(Boolean).join(' ').trim();
  }
  return merged.replace(/\s+/g,' ').trim();
}
