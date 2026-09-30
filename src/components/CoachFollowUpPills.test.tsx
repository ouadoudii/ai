import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CoachFollowUpPills } from './CoachFollowUpPills';

describe('CoachFollowUpPills', () => {
  it('prefills the selected follow-up without submitting it', () => {
    const onPrefill = vi.fn();
    const suggestions = ['Why did this happen?', 'What can I try next?', 'What do my entries show?'];

    render(<CoachFollowUpPills suggestions={suggestions} onPrefill={onPrefill} />);
    fireEvent.click(screen.getByRole('button', { name: suggestions[1] }));

    expect(onPrefill).toHaveBeenCalledTimes(1);
    expect(onPrefill).toHaveBeenCalledWith(suggestions[1]);
  });

  it('renders nothing when Cary has no safe follow-ups', () => {
    const { container } = render(<CoachFollowUpPills suggestions={[]} onPrefill={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });
});
