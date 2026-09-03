import type { MomentCategory } from '../types';
import { PRESET_PHOTOS } from '../data/momentsData';

type DishPhoto = { title:string; url:string; category:string };

const normalize=(value:string)=>value.trim().toLocaleLowerCase().replace(/[–—-]/g,' ').replace(/\s+/g,' ');
const photoByTitle=(fragment:string)=>PRESET_PHOTOS.find(p=>normalize(p.title).includes(normalize(fragment))) as DishPhoto|undefined;

const rules:Array<{category:MomentCategory; terms:string[]; photo:()=>DishPhoto|undefined}> = [
  {category:'breakfast',terms:['avocado toast','avocado sourdough toast','توست بالأفوكادو','توست العجين المخمر بالأفوكادو'],photo:()=>photoByTitle('Avocado Sauerteig Toast')},
  {category:'breakfast',terms:['smoothie bowl','acai smoothie bowl','açai smoothie bowl','وعاء سموذي'],photo:()=>photoByTitle('Açai Smoothie Bowl')},
  {category:'dinner',terms:['pizza','margherita pizza','neapolitan pizza','بيتزا','بيتزا مارغريتا','بيتزا نابولية'],photo:()=>photoByTitle('Neapolitanische Pizza')},
  {category:'dessert',terms:['cheesecake','pistachio cheesecake','تشيز كيك'],photo:()=>photoByTitle('Pistazien Cheesecake')},
];

export function getDishPhoto(title:string,category:MomentCategory):DishPhoto|null{
  const n=normalize(title);
  if(!n)return null;
  for(const rule of rules){
    if(rule.category!==category)continue;
    if(rule.terms.some(term=>n===normalize(term)||n.includes(normalize(term)))) return rule.photo()||null;
  }
  return null;
}

export function isDishPhotoMatch(title:string,category:MomentCategory,url:string):boolean{
  const match=getDishPhoto(title,category);
  return Boolean(match&&match.url===url);
}
