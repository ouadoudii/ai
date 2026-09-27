import { describe, expect, it } from 'vitest';
import { buildVoiceJournalEntries } from './voiceJournalApply';

const feedback={title:'ok',message:'ok',type:'praise' as const,badge:'voice'};
const now=new Date('2026-09-10T14:00:00');
const meal=(title:string,category:string,timeOfDay:string)=>({category,timeOfDay,time:'',mealTitle:title,mealItems:[title],hungerBefore:0,fullnessAfter:0});

describe('voice journal relative dates',()=>{
  it.each([
    ['Gestern zum Frühstück hatte ich Eier.','Eier','de'],
    ['Yesterday for breakfast I had eggs.','eggs','en'],
    ['Hier au petit-déjeuner j’ai mangé des œufs.','œufs','fr'],
    ['البارح فالفطور كليت بيض.','بيض','ar'],
  ] as const)('stores an explicit previous-day meal on yesterday: %s',(transcript,title,language)=>{
    const result=buildVoiceJournalEntries({coachFeedback:feedback,extractedData:{meals:[meal(title,'breakfast','morning')],wellbeingEntries:[]}},transcript,language,now);
    expect(result.moments[0].date).toBe('2026-09-09');
    expect(result.checkIns[0].date).toBe('2026-09-09');
  });

  it('keeps yesterday and today meals separate inside one mixed utterance',()=>{
    const transcript='Gestern zum Frühstück hatte ich Eier. Today for lunch I had couscous.';
    const result=buildVoiceJournalEntries({coachFeedback:feedback,extractedData:{meals:[meal('Eier','breakfast','morning'),meal('couscous','lunch','midday')],wellbeingEntries:[]}},transcript,'de',now);
    expect(result.moments.map(item=>[item.title,item.date])).toEqual([['Eier','2026-09-09'],['couscous','2026-09-10']]);
    expect(result.checkIns.map(item=>[item.timeOfDay,item.date])).toEqual([['morning','2026-09-09'],['midday','2026-09-10']]);
  });

  it('does not merge the same meal phase across yesterday and today',()=>{
    const transcript='Yesterday breakfast eggs. Today breakfast toast.';
    const result=buildVoiceJournalEntries({coachFeedback:feedback,extractedData:{meals:[meal('eggs','breakfast','morning'),meal('toast','breakfast','morning')],wellbeingEntries:[]}},transcript,'en',now);
    expect(result.checkIns).toHaveLength(2);
    expect(result.checkIns.map(item=>item.date)).toEqual(['2026-09-09','2026-09-10']);
  });
});