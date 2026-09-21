import React from 'react';
import { fireEvent,render,screen } from '@testing-library/react';
import { describe,expect,it,vi } from 'vitest';
import { LanguageProvider } from '../i18n';
import { CatchUpMiddayCheckInModal } from './CatchUpMiddayCheckInModal';

const renderModal=(onSave=vi.fn())=>{localStorage.setItem('rhythm_language_v1','en');render(<LanguageProvider><CatchUpMiddayCheckInModal isOpen onClose={()=>{}} onSaveCheckIn={onSave}/></LanguageProvider>);return onSave};

describe('CatchUpMiddayCheckInModal explicit data',()=>{
  it('does not invent untouched wellbeing or eating facts',()=>{const onSave=renderModal();fireEvent.click(screen.getByRole('button',{name:'Add this moment'}));expect(onSave).toHaveBeenCalledOnce();const saved=onSave.mock.calls[0][0];expect(saved.food).toBeUndefined();expect(saved.wellbeing).toEqual({voiceTranscription:''});expect(saved.wellbeing).not.toHaveProperty('mood');expect(saved.wellbeing).not.toHaveProperty('stressLevel');expect(saved.wellbeing).not.toHaveProperty('waterGlasses')});
  it('persists a slider only after explicit interaction',()=>{const onSave=renderModal();fireEvent.change(screen.getByLabelText('How hungry were you?'),{target:{value:'5'}});fireEvent.click(screen.getByRole('button',{name:'Add this moment'}));const saved=onSave.mock.calls[0][0];expect(saved.wellbeing).toEqual({voiceTranscription:''});expect(saved.food).toBeUndefined()});
  it('renders German catch-up chrome instead of English',()=>{localStorage.setItem('rhythm_language_v1','de');render(<LanguageProvider><CatchUpMiddayCheckInModal isOpen onClose={()=>{}} onSaveCheckIn={()=>{}}/></LanguageProvider>);expect(screen.getByText('Möchtest du ergänzen, was du gegessen hast?')).toBeInTheDocument();expect(screen.queryByText('Want to add what you ate?')).not.toBeInTheDocument()});
});
