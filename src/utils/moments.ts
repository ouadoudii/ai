export type Moment = {
  id: number;
  title: string;
  meal: string;
  note: string;
  favorite: boolean;
  rating: number;
  date: string;
};

export function toggleFavorite(moments: Moment[], id: number): Moment[] {
  return moments.map(moment =>
    moment.id === id ? { ...moment, favorite: !moment.favorite } : moment,
  );
}

export function averageRating(moments: Moment[]): number {
  if (moments.length === 0) return 0;
  return Math.round(
    moments.reduce((sum, moment) => sum + moment.rating, 0) / moments.length,
  );
}

export function createMoment(title: string, id = Date.now()): Moment | null {
  const cleanTitle = title.trim();
  if (!cleanTitle) return null;

  return {
    id,
    title: cleanTitle,
    meal: 'Moment',
    note: 'A new food memory.',
    favorite: false,
    rating: 5,
    date: 'Just now',
  };
}
