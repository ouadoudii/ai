import {describe,expect,it,vi} from 'vitest';
import {captureFullPageStrict,isRetryableCaptureProtocolError} from '../../e2e/support/strictScreenshot';

const protocolError=new Error('page.screenshot: Protocol error (Page.captureScreenshot): Unable to capture screenshot');

describe('strict full-page screenshot capture',()=>{
  it('repeats the same mandatory full-page capture once for the exact CDP error',async()=>{
    const screenshot=vi.fn()
      .mockRejectedValueOnce(protocolError)
      .mockResolvedValueOnce(Buffer.from('png'));
    const waitForTimeout=vi.fn().mockResolvedValue(undefined);

    await captureFullPageStrict({screenshot,waitForTimeout} as never,{path:'artifact.png'});

    expect(screenshot).toHaveBeenCalledTimes(2);
    expect(screenshot).toHaveBeenNthCalledWith(1,{path:'artifact.png',fullPage:true});
    expect(screenshot).toHaveBeenNthCalledWith(2,{path:'artifact.png',fullPage:true});
    expect(waitForTimeout).toHaveBeenCalledWith(250);
  });

  it('does not retry unrelated failures or hide a second capture failure',async()=>{
    const unrelated=new Error('Target page has been closed');
    const unrelatedScreenshot=vi.fn().mockRejectedValue(unrelated);
    await expect(captureFullPageStrict({
      screenshot:unrelatedScreenshot,
      waitForTimeout:vi.fn(),
    } as never,{path:'unrelated.png'})).rejects.toBe(unrelated);
    expect(unrelatedScreenshot).toHaveBeenCalledOnce();

    const repeatedScreenshot=vi.fn().mockRejectedValue(protocolError);
    await expect(captureFullPageStrict({
      screenshot:repeatedScreenshot,
      waitForTimeout:vi.fn().mockResolvedValue(undefined),
    } as never,{path:'repeated.png'})).rejects.toBe(protocolError);
    expect(repeatedScreenshot).toHaveBeenCalledTimes(2);
    expect(isRetryableCaptureProtocolError(unrelated)).toBe(false);
  });
});
