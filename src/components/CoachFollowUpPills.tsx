import React from 'react';

interface CoachFollowUpPillsProps {
  suggestions: string[];
  onPrefill: (suggestion: string) => void;
}

/** Optional follow-up prompts that only prefill Cary's composer.
 * Selecting a prompt must never submit a message automatically.
 */
export const CoachFollowUpPills: React.FC<CoachFollowUpPillsProps> = ({ suggestions, onPrefill }) => {
  if (suggestions.length === 0) return null;

  return (
    <div data-testid="cary-contextual-followups" className="flex flex-wrap gap-1.5 pt-1 max-w-full">
      {suggestions.slice(0, 3).map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          onClick={() => onPrefill(suggestion)}
          className="text-left px-2.5 py-1.5 rounded-xl bg-white hover:bg-amber-50 border border-stone-200 hover:border-amber-300 text-stone-700 text-xs font-medium transition-colors shadow-2xs"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
};
