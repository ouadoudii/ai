import { describe, expect, it } from 'vitest';
import type { DailyCheckIn, FoodMoment, TimeOfDayPhase } from './types';
import { buildPatternInsights } from './utils/patternInsights';
import { getNextJourneyStep } from './utils/dailyJourney';
import { getRepeatCandidates, repeatMeal } from './utils/repeatMeal';

const check=(day:number,phase:TimeOfDayPhase,energy:number,sleep?:number):DailyCheckIn=>({id:`user-check-${day}-${phase}`,date:`2026-08-${String(day).padStart(2,'0')}`,time:phase==='morning'?'08:00':phase==='midday'?'14:30':'20:30',timeOfDay:phase,...(sleep?{sleep:{durationHours:sleep,quality:2,wakeFeeling:'tired'}}:{}),wellbeing:{energyLevel:energy,mood:'satisfied',stressLevel:2},createdAt:day*100+(phase==='morning'?1:phase==='midday'?2:3)});
const lunch=(day:number,time='14:30',pace:FoodMoment['eatingPace']='moderate'):FoodMoment=>({id:`user-meal-${day}`,title:day%2?'Bowl':'Pasta',label:'Lunch',category:'lunch',date:`2026-08-${String(day).padStart(2,'0')}`,time,location:'Home',locationCategory:'home',imageUrl:'',rating:4,mood:'satisfied',eatingPace:pace,distraction:'mindful',energyAfter:'neutral',tags:[],createdAt:day*100+4});

describe('realistic multi-day user journey',()=>{
  it('does not invent a pattern after the first day',()=>{const insights=buildPatternInsights([lunch(1)],[check(1,'morning',3,6.5),check(1,'midday',2)]);expect(insights).toHaveLength(1);expect(insights[0].id).toBe('learning');});
  it('finds a cautious sleep/energy signal after repeated days',()=>{const checks=[1,2,3,4].flatMap(d=>[check(d,'morning',3,6.2),check(d,'midday',2)]);const insights=buildPatternInsights([1,2,3,4].map(d=>lunch(d)),checks);const sleep=insights.find(i=>i.id==='sleep-energy');expect(sleep?.confidence).toBe('Trend');expect(sleep?.observation).toContain('4 of 4');});
  it('upgrades repeated evidence to a pattern after a week',()=>{const checks=[1,2,3,4,5,6,7].flatMap(d=>[check(d,'morning',3,6),check(d,'midday',2)]);const insights=buildPatternInsights([1,2,3,4,5,6,7].map(d=>lunch(d)),checks);expect(insights.find(i=>i.id==='sleep-energy')?.confidence).toBe('Pattern');expect(insights.find(i=>i.id==='lunch-rhythm')?.confidence).toBe('Pattern');});
  it('keeps missed midday available to catch up in the evening',()=>{const next=getNextJourneyStep(20,{morning:true,midday:false,evening:false});expect(next.phase).toBe('midday');expect(next.catchUp).toBe(true);expect(next.complete).toBe(false);});
  it('stops prompting when all eligible day phases are complete',()=>{const next=getNextJourneyStep(20,{morning:true,midday:true,evening:true});expect(next.complete).toBe(true);expect(next.catchUp).toBe(false);expect(next.title).toContain('captured');});
  it('lets a returning user repeat a recent meal without mutating the old day',()=>{const source=lunch(7,'13:10');const repeated=repeatMeal(source,new Date(2026,8,1,12,15));expect(repeated.id).not.toBe(source.id);expect(repeated.date).toBe('2026-09-01');expect(repeated.time).toBe('12:15');expect(repeated.tags).toContain('Repeated');expect(source.date).toBe('2026-08-07');});
  it('shows only useful unique repeat candidates after many days',()=>{const moments=[lunch(7),lunch(6),lunch(5),lunch(4),lunch(3),lunch(2),lunch(1)];const candidates=getRepeatCandidates(moments,3);expect(candidates.length).toBe(2);expect(new Set(candidates.map(m=>m.title)).size).toBe(2);});
});
