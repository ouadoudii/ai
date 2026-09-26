export interface MealImagePolicyInput {
  isEditing: boolean;
  currentImageUrl: string;
  matchedImageUrl?: string | null;
}

/**
 * Automatic dish-photo matching is allowed to tidy images for a new meal,
 * but it must never remove a persisted image while an existing meal is being
 * edited. Replacing an image remains an explicit user action in the editor.
 */
export const shouldClearAutoMatchedMealImage = ({
  isEditing,
  currentImageUrl,
  matchedImageUrl,
}: MealImagePolicyInput): boolean => {
  if (isEditing) return false;
  if (!currentImageUrl || !matchedImageUrl) return false;
  return currentImageUrl === matchedImageUrl;
};
