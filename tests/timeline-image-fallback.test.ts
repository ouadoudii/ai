import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync(new URL('../src/components/FoodCalendarView.tsx', import.meta.url), 'utf8');

describe('timeline meal image fallback', () => {
  it('does not render an image without a URL and hides images that fail to load', () => {
    expect(source).toContain('moment.imageUrl&&<img');
    expect(source).toContain("onError={(event)=>{event.currentTarget.style.display='none';}}");
    expect(source).toContain('timeline-image-fallback-${moment.id}');
  });
});
