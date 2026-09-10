import { afterEach, describe, expect, it, vi } from 'vitest';
import handler from './voice-checkin';

const originalGeminiKey = process.env.GEMINI_API_KEY;
const originalGroqKey = process.env.GROQ_API_KEY;
afterEach(() => {
  vi.unstubAllGlobals();
  if (originalGeminiKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = originalGeminiKey;
  if (originalGroqKey === undefined) delete process.env.GROQ_API_KEY;
  else process.env.GROQ_API_KEY = originalGroqKey;
});

function createResponse() {
  const headers = new Map<string, string>();
  let statusCode = 200;
  let body: any;
  const res: any = {
    setHeader(name: string, value: string) { headers.set(name.toLowerCase(), String(value)); return res; },
    status(code: number) { statusCode = code; return res; },
    json(value: any) { body = value; return res; },
  };
  return { res, get statusCode() { return statusCode; }, get body() { return body; }, headers };
}

function groqResponse(extracted: any) {
  return { ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify(extracted) } }] }) } as Response;
}

const wellbeingEmpty = { sleepHours:0, sleepQuality:0, wakeFeeling:'', wellbeingEntries:[] };

describe('voice check-in endpoint', () => {
  it('preserves a complete free-form report with several meals and energy observations', async () => {
    delete process.env.GEMINI_API_KEY;
    process.env.GROQ_API_KEY = 'test-key';
    const fetchMock = vi.fn(async () => groqResponse({
      mealDetected:true, mealTitle:'بيض وخبز', mealItems:['بيض','خبز'], mealCategory:'breakfast', mealContext:'',
      meals:[
        {category:'breakfast',timeOfDay:'morning',time:'',mealTitle:'بيض وخبز',mealItems:['بيض','خبز'],hungerBefore:0,fullnessAfter:0},
        {category:'lunch',timeOfDay:'midday',time:'',mealTitle:'كسكس بالخضرة',mealItems:['كسكس بالخضرة'],hungerBefore:4,fullnessAfter:0},
      ],
      sleepHours:7,sleepQuality:4,wakeFeeling:'tired',
      wellbeingEntries:[{timeOfDay:'morning',energyLevel:2,mood:'',stressLevel:0,waterGlasses:0,note:'عيان'},{timeOfDay:'midday',energyLevel:4,mood:'energized',stressLevel:0,waterGlasses:0,note:''}],
    }));
    vi.stubGlobal('fetch', fetchMock);
    const response=createResponse();
    await handler({method:'POST',headers:{'x-forwarded-for':'203.0.113.30'},ip:'203.0.113.30',body:{transcript:'فالفطور كليت البيض والخبز، فالغدا كسكس. نعست 7 ساعات، الصباح كنت عيان ومن بعد الغدا رجعات لي الطاقة',timeOfDay:'midday',currentHour:14,language:'ar'}} as any,response.res);
    expect(response.statusCode).toBe(200);
    expect(response.body.extractedData.extractionEngine).toBe('groq-semantic');
    expect(response.body.extractedData.meals).toHaveLength(2);
    expect(response.body.extractedData.sleepHours).toBe(7);
    expect(response.body.extractedData.wellbeingEntries).toEqual(expect.arrayContaining([expect.objectContaining({timeOfDay:'morning',energyLevel:2}),expect.objectContaining({timeOfDay:'midday',energyLevel:4})]));
  });

  it('accepts an energy/sleep-only voice note instead of discarding it because there is no meal', async () => {
    delete process.env.GEMINI_API_KEY;
    process.env.GROQ_API_KEY = 'test-key';
    vi.stubGlobal('fetch', vi.fn(async () => groqResponse({
      mealDetected:false,mealTitle:'',mealItems:[],mealCategory:'',mealContext:'',meals:[],sleepHours:6,sleepQuality:2,wakeFeeling:'exhausted',
      wellbeingEntries:[{timeOfDay:'morning',energyLevel:1,mood:'',stressLevel:4,waterGlasses:0,note:'مرهق'}],
    })));
    const response=createResponse();
    await handler({method:'POST',headers:{'x-forwarded-for':'203.0.113.31'},ip:'203.0.113.31',body:{transcript:'نعست ست ساعات وفقت مهلوك ومتوتر',language:'ar'}} as any,response.res);
    expect(response.statusCode).toBe(200);
    expect(response.body.extractedData.mealDetected).toBe(false);
    expect(response.body.extractedData.sleepHours).toBe(6);
    expect(response.body.extractedData.wellbeingEntries[0]).toMatchObject({energyLevel:1,stressLevel:4});
  });

  it('uses semantic AI for a new dish absent from the static dictionary and passes Arabic UI language', async () => {
    delete process.env.GEMINI_API_KEY;
    process.env.GROQ_API_KEY = 'test-key';
    let requestBody = '';
    const fetchMock = vi.fn(async (_url:string,options?:RequestInit)=>{requestBody=String(options?.body||'');return groqResponse({mealDetected:true,mealTitle:'رفيسة بالدجاج والزبيب',mealItems:['رفيسة بالدجاج والزبيب'],mealCategory:'lunch',mealContext:'',meals:[],...wellbeingEmpty});});
    vi.stubGlobal('fetch',fetchMock);
    const response=createResponse();
    await handler({method:'POST',headers:{'x-forwarded-for':'203.0.113.20'},ip:'203.0.113.20',body:{transcript:'كليت رفيسة بالدجاج والزبيب',timeOfDay:'midday',currentHour:13,language:'ar'}} as any,response.res);
    expect(response.statusCode).toBe(200);
    expect(response.body.extractedData.extractionEngine).toBe('groq-semantic');
    expect(response.body.extractedData.mealItems).toEqual(['رفيسة بالدجاج والزبيب']);
    expect(JSON.parse(requestBody).messages[0].content).toContain('UI language is Arabic');
  });

  it('keeps deterministic extraction as fallback when semantic providers are unavailable', async () => {
    delete process.env.GEMINI_API_KEY;delete process.env.GROQ_API_KEY;
    const response=createResponse();
    await handler({method:'POST',headers:{'x-forwarded-for':'203.0.113.10'},ip:'203.0.113.10',body:{transcript:'كليت جوج بيضات مسلوقين مع الخبز ومن بعد شربت قهوة بالحليب',timeOfDay:'morning',currentHour:8,language:'ar'}} as any,response.res);
    expect(response.statusCode).toBe(200);
    expect(response.body.extractedData.extractionEngine).toBe('deterministic-fallback');
    expect(response.body.extractedData.mealItems).toEqual(expect.arrayContaining(['جوج بيض مسلوق','خبز','قهوة بالحليب']));
    expect(response.body.extractedData.meals).toHaveLength(1);
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('recognizes exact live transcript خبيزة بالفرماج in fallback mode', async () => {
    delete process.env.GEMINI_API_KEY;delete process.env.GROQ_API_KEY;
    const response=createResponse();
    await handler({method:'POST',headers:{'x-forwarded-for':'203.0.113.12'},ip:'203.0.113.12',body:{transcript:'كليت خبيزة بالفرماج.',timeOfDay:'morning',currentHour:9,language:'ar'}} as any,response.res);
    expect(response.body.extractedData.mealItems).toEqual(['خبز بالجبن']);
  });
});
