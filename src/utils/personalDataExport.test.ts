import { describe, expect, it } from 'vitest';
import type { DailyCheckIn, FoodMoment } from '../types';
import { buildPersonalDataExport, serializePersonalDataExport } from './personalDataExport';
const moment = (id: string, title: string): FoodMoment => ({id,title,label:title,category:'lunch',date:'2026-09-30',time:'12:30',location:'',locationCategory:'home',imageUrl:'',mood:'satisfied',tags:[],createdAt:1});
const checkIn = (id: string, note: string): DailyCheckIn => ({id,date:'2026-09-30',time:'12:30',timeOfDay:'midday',wellbeing:{note},createdAt:1});
describe('personal data export',()=>{
  it('exports real history and excludes demo seed records',()=>{const data=buildPersonalDataExport([moment('real-1','Couscous'),moment('moment-1','Demo')],[checkIn('real-check','real'),checkIn('checkin-2','demo')],new Date('2026-09-30T10:00:00.000Z'));expect(data.schemaVersion).toBe(1);expect(data.exportedAt).toBe('2026-09-30T10:00:00.000Z');expect(data.moments.map(e=>e.id)).toEqual(['real-1']);expect(data.checkIns.map(e=>e.id)).toEqual(['real-check']);});
  it('preserves mixed-language user-authored text through serialization',()=>{const title='بيض مسلوق + pain complet + Kaffee';const note='اليوم énergie كانت gut';const parsed=JSON.parse(serializePersonalDataExport(buildPersonalDataExport([moment('real-2',title)],[checkIn('real-2',note)],new Date('2026-09-30T10:00:00.000Z'))));expect(parsed.moments[0].title).toBe(title);expect(parsed.checkIns[0].wellbeing.note).toBe(note);});
});
