import { defineConfig } from '@playwright/test';
export default defineConfig({
 testDir: './tests/browser',
 use: { baseURL:'http://127.0.0.1:4173', channel:'chrome', headless:true, timezoneId:'Europe/Berlin' },
 webServer: [
  {command:'python3 -m http.server 4173 --bind 127.0.0.1 --directory site',url:'http://127.0.0.1:4173',reuseExistingServer:true},
  {command:'python3 -m http.server 4174 --bind 127.0.0.1',url:'http://127.0.0.1:4174',reuseExistingServer:true},
 ],
 reporter:'list',
});
