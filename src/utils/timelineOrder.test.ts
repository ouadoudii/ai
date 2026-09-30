import { describe, expect, it } from 'vitest';
import type { FoodMoment } from '../types';
import { compareTimelineMoments } from './timelineOrder';

const moment = (id:string, category:FoodMoment['category'], time:string, createdAt:number):FoodMoment => ({
  id,title:id,label:id,category,date:'2026-09-30',time,location:'',locationCategory:'home',imageUrl:'',rating:4,mood:'satisfied',tags:[],createdAt
});

describe('compareTimelineMoments', () => {
  it('orders timed breakfast, untimed lunch and timed dinner deterministically without inventing a time', () => {
    const items=[moment('breakfast','breakfast','08:00',1),moment('lunch','lunch','',2),moment('dinner','dinner','20:00',3)];
    expect([...items].sort(compareTimelineMoments).map(item=>item.id)).toEqual(['dinner','lunch','breakfast']);
    expect(items[1].time).toBe('');
  });

  it('uses semantic category then creation order for multiple untimed entries', () => {
    const items=[moment('older-lunch','lunch','',1),moment('newer-lunch','lunch','',2),moment('dinner','dinner','',3)];
    expect([...items].sort(compareTimelineMoments).map(item=>item.id)).toEqual(['dinner','newer-lunch','older-lunch']);
  });

  it('keeps ordering stable regardless of persisted array order', () => {
    const items=[moment('breakfast','breakfast','08:00',1),moment('lunch','lunch','',2),moment('dinner','dinner','20:00',3)];
    const expected=['dinner','lunch','breakfast'];
    expect([...items].sort(compareTimelineMoments).map(item=>item.id)).toEqual(expected);
    expect([...items].reverse().sort(compareTimelineMoments).map(item=>item.id)).toEqual(expected);
  });
});
