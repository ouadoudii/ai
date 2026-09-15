import { afterEach, describe, expect, it } from 'vitest';
import handler from '../../api/voice-intent';

const originalGeminiKey=process.env.GEMINI_API_KEY;
afterEach(()=>{
  if(originalGeminiKey===undefined)delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY=originalGeminiKey;
});

function createResponse(){
  const headers=new Map<string,string>();let statusCode=200;let body:any;
  const res:any={
    setHeader(name:string,value:string){headers.set(name.toLowerCase(),String(value));return res;},
    status(code:number){statusCode=code;return res;},
    json(value:any){body=value;return res;},
  };
  return{res,get statusCode(){return statusCode},get body(){return body},headers};
}

describe('voice intent endpoint',()=>{
  it('fails open to other when semantic AI is unavailable instead of guessing from keywords',async()=>{
    delete process.env.GEMINI_API_KEY;
    const response=createResponse();
    await handler({method:'POST',headers:{'x-forwarded-for':'203.0.113.71'},ip:'203.0.113.71',body:{transcript:'Ich habe Übergewicht, ich möchte abnehmen.',language:'de'}} as any,response.res);
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({intent:'other',confidence:0});
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('rejects an empty transcript',async()=>{
    delete process.env.GEMINI_API_KEY;
    const response=createResponse();
    await handler({method:'POST',headers:{'x-forwarded-for':'203.0.113.72'},ip:'203.0.113.72',body:{transcript:'',language:'de'}} as any,response.res);
    expect(response.statusCode).toBe(400);
  });

  it('rejects non-POST requests',async()=>{
    const response=createResponse();
    await handler({method:'GET',headers:{'x-forwarded-for':'203.0.113.73'},ip:'203.0.113.73',body:{}} as any,response.res);
    expect(response.statusCode).toBe(405);
  });
});
