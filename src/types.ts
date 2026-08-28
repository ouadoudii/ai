export type MomentCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink' | 'other';

export interface FoodMoment {
  id: string;
  title: string;
  description?: string;
  category: MomentCategory;
  timestamp: string;
  image?: string;
  mood?: string;
  tags?: string[];
}

export type AppView = 'today' | 'calendar' | 'favorites' | 'stats' | 'coach' | 'analysis';
