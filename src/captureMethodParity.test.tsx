import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CaptureChoiceModal } from './components/CaptureChoiceModal';
import { LanguageProvider } from './i18n';

describe('capture method parity', () => {
  it('offers photo, voice and text as first-class capture paths', () => {
    const { container } = render(<LanguageProvider><CaptureChoiceModal isOpen onClose={vi.fn()} onFood={vi.fn()} onTellCary={vi.fn()} /></LanguageProvider>);
    expect(container.querySelector('[data-capture-method="photo"]')).toBeTruthy();
    expect(container.querySelector('[data-capture-method="voice"]')).toBeTruthy();
    expect(container.querySelector('[data-capture-method="text"]')).toBeTruthy();
  });

  it('keeps the text path understandable without requiring voice', () => {
    render(<LanguageProvider><CaptureChoiceModal isOpen onClose={vi.fn()} onFood={vi.fn()} onTellCary={vi.fn()} /></LanguageProvider>);
    expect(screen.getByRole('button', { name: /type/i })).toBeTruthy();
  });
});
