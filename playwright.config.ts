import {defineConfig,devices} from '@playwright/test';

// Keep product journeys deterministic even when CI runs around midnight.
// The app intentionally reveals meal phases by local clock time, while most
// browser specs test the flows themselves rather than the wall clock. Choose
// a synthetic timezone that makes the browser's local time roughly noon for
// every CI start hour; dedicated unit tests cover the actual phase thresholds.
const TARGET_BROWSER_HOUR=12;
const utcHour=new Date().getUTCHours();
const offsetToTarget=TARGET_BROWSER_HOUR-utcHour;
const deterministicTimezone=offsetToTarget===0
  ? 'Etc/GMT'
  : offsetToTarget>0
    ? `Etc/GMT-${offsetToTarget}`
    : `Etc/GMT+${Math.abs(offsetToTarget)}`;

export default defineConfig({
  testDir:'./e2e',
  timeout:45_000,
  retries:1,
  use:{baseURL:'http://127.0.0.1:4173',trace:'retain-on-failure',screenshot:'only-on-failure',video:'retain-on-failure',timezoneId:deterministicTimezone},
  webServer:{command:'npm run build && npm run preview -- --host 127.0.0.1 --port 4173',url:'http://127.0.0.1:4173',reuseExistingServer:false,timeout:120_000},
  projects:[{name:'android-arabic',use:{...devices['Pixel 7']}}],
  reporter:[['list'],['html',{outputFolder:'playwright-report',open:'never'}]],
});