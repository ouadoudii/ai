import { describe, expect, it } from 'vitest';
import type { FoodMoment } from '../types';
import { sortJournalMoments } from './journalSort';

const moment = (id:string,date:string,time:string,category:FoodMoment['category']='breakfast',createdAt=1):FoodMoment => ({id,date,time,title:id,category,location:'',rating:0,mood:'satisfied',tags:[],createdAt} as FoodMoment);

describe('sortJournalMoments',()=>{
 const history=[moment('old-morning','2026-09-01','08:00'),moment('new-evening','2026-09-03','20:00'),moment('new-morning','2026-09-03','07:30')];
 it('orders newest by default',()=>expect(sortJournalMoments(history).map(x=>x.id)).toEqual(['new-evening','new-morning','old-morning']));
 it('orders oldest without mutating input',()=>{const original=history.map(x=>x.id);expect(sortJournalMoments(history,'oldest').map(x=>x.id)).toEqual(['old-morning','new-morning','new-evening']);expect(history.map(x=>x.id)).toEqual(original);});
 it('places an untimed meal by semantic phase without inventing a clock time',()=>{
  const day=[moment('untimed-lunch','2026-09-03','','lunch',2),moment('dinner','2026-09-03','20:00','dinner',3),moment('breakfast','2026-09-03','08:00','breakfast',1)];
  expect(sortJournalMoments(day).map(x=>x.id)).toEqual(['dinner','untimed-lunch','breakfast']);
  expect(sortJournalMoments([...day].reverse(),'oldest').map(x=>x.id)).toEqual(['breakfast','untimed-lunch','dinner']);
  expect(day[0].time).toBe('');
 });
 it('orders multiple untimed meals deterministically by creation time',()=>expect(sortJournalMoments([
  moment('earlier','2026-09-03','','snack',1),
  moment('later','2026-09-03','','snack',2),
 ]).map(x=>x.id)).toEqual(['later','earlier']));
});
