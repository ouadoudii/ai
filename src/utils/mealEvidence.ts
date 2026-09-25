export interface MealEvidenceInput {
  editingExisting: boolean;
  items: string[];
  draftTitle: string;
  imageUrl: string;
}

/**
 * A new FoodMoment may only be persisted when the user supplied actual food
 * evidence. Category labels and optional notes are presentation/context, not
 * evidence that a meal happened.
 *
 * Existing moments remain saveable while editing so a correction cannot be
 * blocked merely because legacy data lacks one of the newer evidence fields.
 */
export const hasMealEvidence = ({
  editingExisting,
  items,
  draftTitle,
  imageUrl,
}: MealEvidenceInput): boolean => {
  if (editingExisting) return true;
  return items.some(item => item.trim().length > 0) || draftTitle.trim().length > 0 || imageUrl.trim().length > 0;
};
