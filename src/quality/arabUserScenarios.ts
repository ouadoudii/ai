import type { MomentCategory, TimeOfDayPhase } from '../types';

export type TestGender='male'|'female';
export type EatingPattern=
  |'traditional_family'
  |'office_modern'
  |'light_breakfast'
  |'skip_breakfast'
  |'late_dinner'
  |'frequent_snacks'
  |'tea_coffee_routine'
  |'fasting_style';

export type ArabUserScenario={
  id:string;
  country:string;
  countryName:string;
  gender:TestGender;
  pattern:EatingPattern;
  phases:TimeOfDayPhase[];
  categories:MomentCategory[];
  hasSnack:boolean;
  notes:string;
};

const countries=[
  ['DZ','Algeria'],['BH','Bahrain'],['KM','Comoros'],['DJ','Djibouti'],['EG','Egypt'],['IQ','Iraq'],
  ['JO','Jordan'],['KW','Kuwait'],['LB','Lebanon'],['LY','Libya'],['MR','Mauritania'],['MA','Morocco'],
  ['OM','Oman'],['PS','Palestine'],['QA','Qatar'],['SA','Saudi Arabia'],['SO','Somalia'],['SD','Sudan'],
  ['SY','Syria'],['TN','Tunisia'],['AE','United Arab Emirates'],['YE','Yemen'],
] as const;

const patterns:EatingPattern[]=[
  'traditional_family','office_modern','light_breakfast','skip_breakfast',
  'late_dinner','frequent_snacks','tea_coffee_routine','fasting_style',
];

function profileFor(pattern:EatingPattern){
  switch(pattern){
    case 'traditional_family': return {phases:['morning','midday','evening'] as TimeOfDayPhase[],categories:['breakfast','lunch','dinner'] as MomentCategory[],hasSnack:false,notes:'Three meals, family-centered rhythm'};
    case 'office_modern': return {phases:['morning','midday','evening'] as TimeOfDayPhase[],categories:['breakfast','lunch','coffee','dinner'] as MomentCategory[],hasSnack:false,notes:'Workday lunch and coffee'};
    case 'light_breakfast': return {phases:['morning','midday','evening'] as TimeOfDayPhase[],categories:['breakfast','lunch','snack','dinner'] as MomentCategory[],hasSnack:true,notes:'Small breakfast with an afternoon snack'};
    case 'skip_breakfast': return {phases:['midday','evening'] as TimeOfDayPhase[],categories:['lunch','snack','dinner'] as MomentCategory[],hasSnack:true,notes:'No breakfast, first meal around midday'};
    case 'late_dinner': return {phases:['morning','midday','evening'] as TimeOfDayPhase[],categories:['breakfast','lunch','snack','dinner'] as MomentCategory[],hasSnack:true,notes:'Dinner late in the evening'};
    case 'frequent_snacks': return {phases:['morning','midday','evening'] as TimeOfDayPhase[],categories:['breakfast','snack','lunch','snack','dinner'] as MomentCategory[],hasSnack:true,notes:'Several small eating moments'};
    case 'tea_coffee_routine': return {phases:['morning','midday','evening'] as TimeOfDayPhase[],categories:['breakfast','coffee','lunch','coffee','dinner'] as MomentCategory[],hasSnack:false,notes:'Tea or coffee between meals'};
    case 'fasting_style': return {phases:['evening'] as TimeOfDayPhase[],categories:['drinks','dinner','snack'] as MomentCategory[],hasSnack:true,notes:'Little or no daytime food, larger evening eating window'};
  }
}

export const ARAB_USER_SCENARIOS:ArabUserScenario[]=countries.flatMap(([country,countryName],countryIndex)=>
  (['male','female'] as TestGender[]).map((gender,genderIndex)=>{
    const pattern=patterns[(countryIndex*2+genderIndex)%patterns.length];
    return {
      id:`${country.toLowerCase()}-${gender}`,
      country,
      countryName,
      gender,
      pattern,
      ...profileFor(pattern),
    };
  })
);

export const ARAB_COUNTRY_CODES=countries.map(([code])=>code);
