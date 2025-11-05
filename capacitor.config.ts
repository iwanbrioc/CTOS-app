import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ctos.mindfulness',
  appName: 'CTOS',
  webDir: 'dist/public',
  ...(process.env.API_URL ? {
    server: {
      url: process.env.API_URL,
      cleartext: true,
      androidScheme: 'https'
    }
  } : {
    server: {
      androidScheme: 'https'
    }
  }),
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#f8f9fa'
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      launchShowDuration: 2000,
      backgroundColor: '#f8f9fa',
      androidSplashResourceName: 'splash',
      showSpinner: false
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#488AFF',
      sound: 'beep.wav'
    }
  }
};

export default config;
