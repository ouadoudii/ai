import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const navSource = readFileSync(fileURLToPath(new URL('./components/MobileBottomNav.tsx', import.meta.url)), 'utf8');
const appSource = readFileSync(fileURLToPath(new URL('./App.tsx', import.meta.url)), 'utf8');

describe('mobile moments navigation', () => {
  it('routes the My moments item to the timeline tab and marks that tab active', () => {
    expect(navSource).toContain("nav('timeline','moments')");
    expect(navSource).toContain("activeTab==='timeline'");
    expect(navSource).toContain('data-testid="mobile-moments-nav"');
  });

  it('renders the existing chronology when the timeline tab is selected', () => {
    expect(appSource).toContain("activeTab==='timeline'");
    expect(appSource).toContain('<FoodCalendarView moments={moments}');
    expect(appSource).toContain("onNavigateToTimeline={()=>setActiveTab('timeline')}");
  });
});
