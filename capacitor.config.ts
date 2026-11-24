import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.touchpoint.cadepo',
  appName: 'cdpm',
  webDir: 'dist/cdpm',
  server: {
    androidScheme: 'https'
  }
};

export default config;
