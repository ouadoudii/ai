import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DailyCheckInModal } from './components/DailyCheckInModal';
import { LanguageProvider } from './i18n';

describe('morning sleep timing', () => {
  it('saves bedtime and wake time with the morning sleep check-in', () => {
    const onSaveCheckIn = vi.fn();
    render(
      <LanguageProvider>
        <DailyCheckInModal isOpen onClose={vi.fn()} onSaveCheckIn={onSaveCheckIn} phase="morning" />
      </LanguageProvider>,
    );

    fireEvent.change(screen.getByLabelText('Went to bed'), { target: { value: '23:40' } });
    fireEvent.change(screen.getByLabelText('Woke up'), { target: { value: '07:10' } });
    fireEvent.click(screen.getByRole('button', { name: 'One more step' }));
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));

    expect(onSaveCheckIn).toHaveBeenCalledWith(expect.objectContaining({
      sleep: expect.objectContaining({ bedtime: '23:40', wakeTime: '07:10' }),
    }));
  });
});
