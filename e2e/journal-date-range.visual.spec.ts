import { expect,test } from '@playwright/test';

const today=new Date();
const key=(offset:number)=>{const d=new Date(today.getFullYear(),today.getMonth(),today.getDate());d.setDate(d.getDate()-offset);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
const moments=[
 {id:'today-range',title:'Today meal',label:'Meal',category:'lunch',date:key(0),time:'12:00',location:'Home',imageUrl:'',rating:5,mood:'satisfied',tags:[],createdAt:1,isFavorite:false},
 {id:'seven-edge-range',title:'Seven day meal',label:'Meal',category:'lunch',date:key(6),time:'12:00',location:'Home',imageUrl:'',rating:5,mood:'satisfied',tags:[],createdAt:2,isFavorite:true},
 {id:'old-range',title:'Older meal',label:'Meal',category:'lunch',date:key(31),time:'12:00',location:'Home',imageUrl:'',rating:5,mood:'satisfied',tags:[],createdAt:3,isFavorite:true}
];
const prepare=async(page:any)=>page.addInitScript((items)=>{localStorage.setItem('rhythm_language_v1','de');localStorage.setItem('cary_access_mode_v1','guest');localStorage.setItem('cary_onboarding_v2_complete','true');localStorage.setItem('rhythm_voice_entry_seen_v1','true');localStorage.setItem('nimmapp_moments_v1',JSON.stringify(items));localStorage.setItem('nimmapp_checkins_v1','[]');sessionStorage.setItem('nimmapp_checkin_auto_opened','true');},moments);
const openTimeline=async(page:any,mobile:boolean)=>mobile?page.getByTestId('mobile-moments-nav').click():page.getByRole('button',{name:'Momente',exact:true}).click();

for(const viewport of [{name:'desktop',width:1280,height:900},{name:'mobile',width:390,height:844}])test(`journal date range filters history on ${viewport.name}`,async({page},testInfo)=>{
 await page.setViewportSize({width:viewport.width,height:viewport.height});await prepare(page);await page.goto('/');await openTimeline(page,viewport.name==='mobile');
 const range=page.getByTestId('timeline-date-range');await expect(range).toHaveValue('all');await expect(page.getByTestId('timeline-moment-old-range')).toBeVisible();
 await range.selectOption('7d');await expect(page.getByTestId('timeline-moment-today-range')).toBeVisible();await expect(page.getByTestId('timeline-moment-seven-edge-range')).toBeVisible();await expect(page.getByTestId('timeline-moment-old-range')).toHaveCount(0);
 await page.getByTestId('timeline-filter-favorites').click();await expect(page.getByTestId('timeline-moment-seven-edge-range')).toBeVisible();await expect(page.getByTestId('timeline-moment-today-range')).toHaveCount(0);
 await range.selectOption('all');await expect(page.getByTestId('timeline-moment-old-range')).toBeVisible();
 await page.screenshot({path:testInfo.outputPath(`journal-date-range-${viewport.name}.png`),fullPage:true});
});
