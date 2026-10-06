import { describe, expect, it } from 'vitest';
import type { FoodMoment } from '../types';
import { sortJournalMoments } from './journalSort';

const moment = (id:string,date:string,time:string):FoodMoment => ({id,date,time,title:id,category:'breakfast',location:'',rating:0,mood:'satisfied',tags:[],createdAt:1} as FoodMoment);

describe('sortJournalMoments',()=>{
 const history=[moment('old-morning','2026-09-01','08:00'),moment('new-evening','2026-09-03','20:00'),moment('new-morning','2026-09-03','07:30')];
 it('orders newest by default',()=>expect(sortJournalMoments(history).map(x=>x.id)).toEqual(['new-evening','new-morning','old-morning']));
 it('orders oldest without mutating input',()=>{const original=history.map(x=>x.id);expect(sortJournalMoments(history,'oldest').map(x=>x.id)).toEqual(['old-morning','new-morning','new-evening']);expect(history.map(x=>x.id)).toEqual(original);});
 it('keeps unknown times deterministic after known times',()=>expect(sortJournalMoments([moment('unknown','2026-09-03',''),moment('known','2026-09-03','12:15')]).map(x=>x.id)).toEqual(['known','unknown']));
});
