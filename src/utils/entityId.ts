let fallbackCounter = 0;

function fallbackEntropy(){
  fallbackCounter = (fallbackCounter + 1) % Number.MAX_SAFE_INTEGER;
  return `${fallbackCounter.toString(36)}-${Math.random().toString(36).slice(2,10)}`;
}

export function createEntityId(prefix:string, now=Date.now()){
  const randomUUID = globalThis.crypto?.randomUUID?.bind(globalThis.crypto);
  const entropy = randomUUID ? randomUUID() : fallbackEntropy();
  return `${prefix}-${now}-${entropy}`;
}
