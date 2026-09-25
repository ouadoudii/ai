export function isActiveCaptureRequest(requestId:number,currentRequestId:number,cancelled:boolean,isOpen:boolean){
  return !cancelled&&currentRequestId===requestId&&isOpen;
}
