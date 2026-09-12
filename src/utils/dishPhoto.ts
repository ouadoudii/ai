import type { MomentCategory } from '../types';
import { PRESET_PHOTOS } from '../data/momentsData';

type DishPhoto = { title:string; url:string; category:string };

const normalize=(value:string)=>value
  .normalize('NFD')
  .replace(/[\u0300-\u036f\u064B-\u065F\u0670]/g,'')
  .trim()
  .toLocaleLowerCase()
  .replace(/[’'`´‘ʼʹ]/g,' ')
  .replace(/[–—-]/g,' ')
  .replace(/[^\p{L}\p{N}\s]/gu,' ')
  .replace(/\s+/g,' ');
const photoByTitle=(fragment:string)=>PRESET_PHOTOS.find(p=>normalize(p.title).includes(normalize(fragment))) as DishPhoto|undefined;

const rules:Array<{category:MomentCategory; terms:string[]; photo:()=>DishPhoto|undefined}> = [
  {category:'breakfast',terms:['avocado toast','avocado sourdough toast','توست بالأفوكادو','توست العجين المخمر بالأفوكادو','avocado sauerteig toast','toast à l’avocat','toast à l\'avocat','tartine à l’avocat','tartine à l\'avocat'],photo:()=>photoByTitle('Avocado Sauerteig Toast')},
  {category:'breakfast',terms:['smoothie bowl','acai smoothie bowl','açai smoothie bowl','وعاء سموذي','açai bowl','acai bowl','bol smoothie','bol d’açaï','bol d\'açaï','bol açai'],photo:()=>photoByTitle('Açai Smoothie Bowl')},
  {category:'lunch',terms:['poke bowl','poké bowl','salmon poke bowl','salmon poké bowl','rainbow poke bowl','rainbow poké bowl','بوكي بول','وعاء بوكي','بوكي السلمون','بول السلمون','lachs poke bowl','lachs poké bowl','bunte poke bowl','bunte poké bowl','poke bowl saumon','poké bowl saumon','bol poke saumon','bol poké saumon'],photo:()=>photoByTitle('Bunte Poké Bowl')},
  {category:'dinner',terms:['pizza','margherita pizza','neapolitan pizza','بيتزا','بيتزا مارغريتا','بيتزا نابولية','pizza margherita','neapolitanische pizza','pizza napolitaine'],photo:()=>photoByTitle('Neapolitanische Pizza')},
  {category:'dinner',terms:['tagliatelle','truffle tagliatelle','truffle pasta','pasta with truffle','تاليوليني','تاغلياتيلي','باستا بالكمأة','معكرونة بالكمأة','trüffel tagliatelle','trüffelpasta','pasta mit trüffel','tagliatelles à la truffe','pâtes à la truffe','pates à la truffe'],photo:()=>photoByTitle('Trüffel Tagliatelle')},
  {category:'dessert',terms:['cheesecake','pistachio cheesecake','تشيز كيك','pistazien cheesecake','pistazien käsekuchen','cheesecake pistache','cheesecake à la pistache','gâteau au fromage pistache'],photo:()=>photoByTitle('Pistazien Cheesecake')},
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
