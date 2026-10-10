export type RequestToken={generation:number};

export const createLatestRequestGuard=()=>{
  let generation=0;
  return{
    start():RequestToken{return{generation:++generation}},
    invalidate(){generation+=1},
    isCurrent(token:RequestToken){return token.generation===generation},
  };
};
