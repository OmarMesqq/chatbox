import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'xyz.chatboxapp.ce',
  appName: 'Chatbox',
  webDir: 'release/app/dist/renderer',
   server: {
    cleartext: true,
    androidScheme: 'http'
  }
};

export default config;
