import type { MomentCategory } from '../types';

export type FoodVisual = {
  id:string;
  nameEn:string;
  nameAr:string;
  category:MomentCategory;
  imageUrl:string;
  keywords:string[];
};

const u=(id:string)=>`https://images.unsplash.com/${id}?auto=format&fit=crop&w=700&q=82`;

export const FOOD_VISUALS:FoodVisual[]=[
  {id:'moroccan-table',nameEn:'Moroccan tagine',nameAr:'طاجين مغربي',category:'dinner',imageUrl:'https://images.unsplash.com/photo-1517314626714-ac1b9a16515e?auto=format&fit=crop&w=700&q=82',keywords:['tagine','tajine','moroccan','طاجين','مغربي']},
  {id:'vegetable-tagine',nameEn:'Vegetable tagine',nameAr:'طاجين الخضار',category:'lunch',imageUrl:'https://images.unsplash.com/photo-1517314597476-e1788060b6cb?auto=format&fit=crop&w=700&q=82',keywords:['tagine','tajine','vegetable','طاجين','خضار']},
  {id:'pizza',nameEn:'Pizza',nameAr:'بيتزا',category:'dinner',imageUrl:u('photo-1574071318508-1cdbab80d002'),keywords:['pizza','بيتزا','cheese','tomato']},
  {id:'pasta',nameEn:'Pasta',nameAr:'باستا',category:'lunch',imageUrl:u('photo-1473093295043-cdd812d0e601'),keywords:['pasta','spaghetti','باستا','مكرونة']},
  {id:'sushi',nameEn:'Sushi',nameAr:'سوشي',category:'dinner',imageUrl:u('photo-1579871494447-9811cf80d66c'),keywords:['sushi','سوشي','rice','fish']},
  {id:'burger',nameEn:'Burger',nameAr:'برغر',category:'lunch',imageUrl:u('photo-1568901346375-23c9450c58cd'),keywords:['burger','hamburger','برغر']},
  {id:'salad',nameEn:'Fresh salad',nameAr:'سلطة طازجة',category:'lunch',imageUrl:u('photo-1540420773420-3366772f4999'),keywords:['salad','vegetable','سلطة','خضار']},
  {id:'breakfast',nameEn:'Breakfast plate',nameAr:'طبق فطور',category:'breakfast',imageUrl:u('photo-1533089860892-a7c6f0a88666'),keywords:['breakfast','eggs','toast','فطور','بيض']},
  {id:'avocado-toast',nameEn:'Avocado toast',nameAr:'توست بالأفوكادو',category:'breakfast',imageUrl:u('photo-1525351484163-7529414344d8'),keywords:['avocado','toast','breakfast','أفوكادو','توست']},
  {id:'pancakes',nameEn:'Pancakes',nameAr:'بان كيك',category:'breakfast',imageUrl:u('photo-1528207776546-365bb710ee93'),keywords:['pancake','pancakes','بان كيك','breakfast']},
  {id:'coffee',nameEn:'Coffee',nameAr:'قهوة',category:'coffee',imageUrl:u('photo-1495474472287-4d71bcdd2085'),keywords:['coffee','espresso','latte','قهوة','كابتشينو']},
  {id:'cake',nameEn:'Chocolate cake',nameAr:'كيك الشوكولاتة',category:'dessert',imageUrl:u('photo-1578985545062-69928b1d9587'),keywords:['cake','chocolate','dessert','كيك','شوكولاتة']},
  {id:'ramen',nameEn:'Ramen',nameAr:'رامن',category:'dinner',imageUrl:u('photo-1569718212165-3a8278d5f624'),keywords:['ramen','noodles','رامن','نودلز']},
  {id:'curry',nameEn:'Chicken curry',nameAr:'كاري الدجاج',category:'dinner',imageUrl:u('photo-1603894584373-5ac82b2ae398'),keywords:['curry','chicken','كاري','دجاج']},
  {id:'grilled-fish',nameEn:'Grilled fish',nameAr:'سمك مشوي',category:'dinner',imageUrl:u('photo-1519708227418-c8fd9a32b7a2'),keywords:['fish','grilled fish','سمك','مشوي']},
  {id:'tacos',nameEn:'Tacos',nameAr:'تاكوس',category:'lunch',imageUrl:u('photo-1551504734-5ee1c4a1479b'),keywords:['tacos','taco','تاكوس']},
  {id:'fruit',nameEn:'Fruit bowl',nameAr:'طبق فواكه',category:'snack',imageUrl:u('photo-1490474418585-ba9bad8fd0ea'),keywords:['fruit','berries','فواكه','فاكهة']},
  {id:'yogurt',nameEn:'Yogurt bowl',nameAr:'زبادي مع الفاكهة',category:'breakfast',imageUrl:u('photo-1511690656952-34342bb7c2f2'),keywords:['yogurt','granola','fruit','زبادي','جرانولا']},
  {id:'ice-cream',nameEn:'Ice cream',nameAr:'آيس كريم',category:'dessert',imageUrl:u('photo-1563805042-7684c019e1cb'),keywords:['ice cream','dessert','آيس كريم']},
  {id:'sandwich',nameEn:'Sandwich',nameAr:'ساندويتش',category:'lunch',imageUrl:u('photo-1528735602780-2552fd46c7af'),keywords:['sandwich','ساندويتش','bread']},
];

const norm=(s:string)=>s.trim().toLocaleLowerCase().replace(/\s+/g,' ');

export function getFoodVisuals(category:MomentCategory,query='',limit=18):FoodVisual[]{
  const q=norm(query);
  const preferred=FOOD_VISUALS.filter(v=>v.category===category);
  const pool=[...preferred,...FOOD_VISUALS.filter(v=>v.category!==category)];
  if(!q)return pool.slice(0,limit);
  return pool.filter(v=>{
    const hay=[v.nameEn,v.nameAr,...v.keywords].map(norm);
    return hay.some(k=>k.includes(q)||q.includes(k));
  }).slice(0,limit);
}

export function localizeFoodVisualName(v:FoodVisual,language:'en'|'ar'){
  return language==='ar'?v.nameAr:v.nameEn;
}
