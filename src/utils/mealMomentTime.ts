export const resolveMealMomentTime = (
  editingTime: string | undefined,
  currentTime: string,
  isEditing: boolean,
): string | undefined => (isEditing ? editingTime : currentTime);
