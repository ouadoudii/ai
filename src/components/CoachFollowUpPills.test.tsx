import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { CoachFollowUpPills } from './CoachFollowUpPills';

describe('CoachFollowUpPills', () => {
  it('renders bounded optional follow-ups as buttons', () => {
    const suggestions = ['Why did this happen?', 'What can I try next?', 'What do my entries show?', 'extra'];
    const html = renderToStaticMarkup(<CoachFollowUpPills suggestions={suggestions} onPrefill={vi.fn()} />);
    expect(html).toContain('data-testid="cary-contextual-followups"');
    expect(html).toContain(suggestions[0]);
    expect(html).toContain(suggestions[2]);
    expect(html).not.toContain('extra');
    expect((html.match(/<button/g) ?? []).length).toBe(3);
  });

  it('renders nothing when Cary has no safe follow-ups', () => {
    expect(renderToStaticMarkup(<CoachFollowUpPills suggestions={[]} onPrefill={vi.fn()} />)).toBe('');
  });
});
