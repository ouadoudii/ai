export type PhotoRecognitionState = {
  suggestions: string[];
  accepted: string | null;
};

export const createPhotoRecognitionState = (suggestions: string[]): PhotoRecognitionState => ({
  suggestions: suggestions.map(value => value.trim()).filter(Boolean),
  accepted: null,
});

export const acceptPhotoRecognition = (
  state: PhotoRecognitionState,
  value: string,
): PhotoRecognitionState => ({
  ...state,
  accepted: state.suggestions.includes(value) ? value : null,
});

export const resolveConfirmedMealInput = ({
  typedTitle,
  items,
  photoRecognition,
}: {
  typedTitle: string;
  items: string[];
  photoRecognition: PhotoRecognitionState;
}): { title: string; items: string[] } => {
  const title = typedTitle.trim();
  if (title || items.length > 0) return { title, items };
  if (photoRecognition.accepted) return { title: photoRecognition.accepted, items };
  return { title: '', items };
};
