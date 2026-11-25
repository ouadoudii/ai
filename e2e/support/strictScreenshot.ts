import type {Page} from '@playwright/test';

type FullPageScreenshotOptions=Parameters<Page['screenshot']>[0];
type ScreenshotPage=Pick<Page,'screenshot'|'waitForTimeout'>;

const CAPTURE_PROTOCOL_ERROR='Protocol error (Page.captureScreenshot): Unable to capture screenshot';

export function isRetryableCaptureProtocolError(error:unknown){
  return error instanceof Error&&error.message.includes(CAPTURE_PROTOCOL_ERROR);
}

export async function captureFullPageStrict(
  page:ScreenshotPage,
  options:FullPageScreenshotOptions,
){
  const requiredOptions={...options,fullPage:true} as const;
  try{
    await page.screenshot(requiredOptions);
  }catch(error){
    if(!isRetryableCaptureProtocolError(error))throw error;
    await page.waitForTimeout(250);
    await page.screenshot(requiredOptions);
  }
}
