import type { MomentCategory } from '../types';

export type FoodSuggestion = { name: string; category: MomentCategory };

const global: FoodSuggestion[] = [
  ['Avocado toast','breakfast'],['Scrambled eggs','breakfast'],['Greek yogurt with fruit','breakfast'],['Oatmeal with berries','breakfast'],['Pancakes','breakfast'],['Croissant','breakfast'],['Smoothie bowl','breakfast'],['Granola bowl','breakfast'],['Egg sandwich','breakfast'],['Fruit bowl','breakfast'],
  ['Chicken and rice','lunch'],['Pasta with tomato sauce','lunch'],['Caesar salad','lunch'],['Salmon with vegetables','lunch'],['Buddha bowl','lunch'],['Vegetable wrap','lunch'],['Chicken curry','lunch'],['Burger and fries','lunch'],['Spaghetti and meatballs','lunch'],['Vegetable soup','lunch'],['Couscous salad','lunch'],['Club sandwich','lunch'],['Tuna sandwich','lunch'],['Rice bowl','lunch'],['Grilled chicken salad','lunch'],
  ['Steak and potatoes','dinner'],['Beef stir-fry','dinner'],['Shrimp pasta','dinner'],['Vegetable stir-fry','dinner'],['Mushroom pasta','dinner'],['Lasagna','dinner'],['Tomato soup','dinner'],['Stuffed peppers','dinner'],['Roast chicken','dinner'],['Grilled fish','dinner'],['Pizza','dinner'],['Sushi','dinner'],['Tacos','dinner'],['Ramen','dinner'],['Risotto','dinner'],
  ['Apple','snack'],['Banana','snack'],['Nuts','snack'],['Protein yogurt','snack'],['Hummus and vegetables','snack'],['Dark chocolate','snack'],['Cheese and crackers','snack'],['Dates','snack'],
  ['Espresso','coffee'],['Cappuccino','coffee'],['Latte','coffee'],['Tea','coffee'],['Matcha latte','coffee'],
  ['Cheesecake','dessert'],['Ice cream','dessert'],['Chocolate cake','dessert'],['Fruit salad','dessert'],['Tiramisu','dessert'],
].map(([name, category]) => ({ name, category: category as MomentCategory }));

const countryPacks: Record<string, FoodSuggestion[]> = {
  MA: [
    ['Moroccan mint tea','coffee'],['Msemen','breakfast'],['Baghrir','breakfast'],['Harcha','breakfast'],['Khobz with olive oil','breakfast'],['Bissara','breakfast'],
    ['Chicken tagine with preserved lemon','lunch'],['Beef tagine with prunes','lunch'],['Vegetable tagine','lunch'],['Couscous with seven vegetables','lunch'],['Rfissa','lunch'],['Harira','lunch'],['Pastilla','lunch'],['Kefta tagine','lunch'],['Grilled sardines','lunch'],['Taktouka and bread','lunch'],['Zaalouk and bread','lunch'],
    ['Lamb tagine','dinner'],['Kefta skewers','dinner'],['Grilled fish','dinner'],['Tangia','dinner'],['Seffa medfouna','dinner'],['Briouat','snack'],['Chebakia','dessert'],['Sellou','dessert'],['Orange with cinnamon','dessert'],
  ].map(([name, category]) => ({ name, category: category as MomentCategory })),
  DE: [
    ['Bread rolls with cheese','breakfast'],['Muesli','breakfast'],['Pretzel','snack'],['Currywurst','lunch'],['Schnitzel with potatoes','lunch'],['Potato soup','lunch'],['Käsespätzle','dinner'],['Bratwurst','dinner'],['Döner kebab','lunch'],['Apple strudel','dessert'],
  ].map(([name, category]) => ({ name, category: category as MomentCategory })),
  FR: [
    ['Croissant and coffee','breakfast'],['Pain au chocolat','breakfast'],['Croque monsieur','lunch'],['Quiche Lorraine','lunch'],['Salade niçoise','lunch'],['Ratatouille','dinner'],['Steak frites','dinner'],['Boeuf bourguignon','dinner'],['Crème brûlée','dessert'],
  ].map(([name, category]) => ({ name, category: category as MomentCategory })),
  IT: [
    ['Cornetto and cappuccino','breakfast'],['Caprese salad','lunch'],['Pasta carbonara','lunch'],['Pasta pomodoro','lunch'],['Margherita pizza','dinner'],['Risotto','dinner'],['Lasagna','dinner'],['Gnocchi','dinner'],['Tiramisu','dessert'],['Gelato','dessert'],
  ].map(([name, category]) => ({ name, category: category as MomentCategory })),
  ES: [
    ['Pan con tomate','breakfast'],['Tortilla española','lunch'],['Paella','lunch'],['Gazpacho','lunch'],['Patatas bravas','snack'],['Croquetas','snack'],['Grilled fish','dinner'],['Churros','dessert'],
  ].map(([name, category]) => ({ name, category: category as MomentCategory })),
  TR: [
    ['Turkish breakfast','breakfast'],['Menemen','breakfast'],['Simit','snack'],['Lentil soup','lunch'],['Döner','lunch'],['Pide','lunch'],['Köfte','dinner'],['Adana kebab','dinner'],['Baklava','dessert'],
  ].map(([name, category]) => ({ name, category: category as MomentCategory })),
  GB: [
    ['Full English breakfast','breakfast'],['Porridge','breakfast'],['Beans on toast','breakfast'],['Fish and chips','lunch'],['Jacket potato','lunch'],['Sunday roast','dinner'],['Chicken tikka masala','dinner'],['Shepherd’s pie','dinner'],['Sticky toffee pudding','dessert'],
  ].map(([name, category]) => ({ name, category: category as MomentCategory })),
  US: [
    ['Eggs and bacon','breakfast'],['Bagel with cream cheese','breakfast'],['Pancakes and maple syrup','breakfast'],['Turkey sandwich','lunch'],['Mac and cheese','lunch'],['Cheeseburger','lunch'],['BBQ chicken','dinner'],['Chili','dinner'],['Apple pie','dessert'],
  ].map(([name, category]) => ({ name, category: category as MomentCategory })),
  IN: [
    ['Poha','breakfast'],['Idli and sambar','breakfast'],['Paratha','breakfast'],['Dal and rice','lunch'],['Chana masala','lunch'],['Biryani','lunch'],['Butter chicken','dinner'],['Palak paneer','dinner'],['Masala dosa','dinner'],['Gulab jamun','dessert'],
  ].map(([name, category]) => ({ name, category: category as MomentCategory })),
  JP: [
    ['Miso soup and rice','breakfast'],['Onigiri','snack'],['Soba noodles','lunch'],['Udon noodles','lunch'],['Chicken katsu','lunch'],['Sushi','dinner'],['Ramen','dinner'],['Yakitori','dinner'],['Mochi','dessert'],
  ].map(([name, category]) => ({ name, category: category as MomentCategory })),
  MX: [
    ['Chilaquiles','breakfast'],['Huevos rancheros','breakfast'],['Tacos','lunch'],['Quesadilla','lunch'],['Pozole','lunch'],['Burrito','dinner'],['Enchiladas','dinner'],['Guacamole and tortilla chips','snack'],['Churros','dessert'],
  ].map(([name, category]) => ({ name, category: category as MomentCategory })),
};

export function getFoodSuggestions(country: string | null | undefined, category?: MomentCategory, query = ''): FoodSuggestion[] {
  const local = country ? countryPacks[country.toUpperCase()] || [] : [];
  const seen = new Set<string>();
  const q = query.trim().toLowerCase();
  return [...local, ...global].filter((item) => {
    if (category && item.category !== category) return false;
    if (q && !item.name.toLowerCase().includes(q)) return false;
    const key = item.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function inferCountryFromLocale(locale = typeof navigator !== 'undefined' ? navigator.language : ''): string | null {
  const match = locale.match(/[-_]([A-Za-z]{2})$/);
  return match ? match[1].toUpperCase() : null;
}
