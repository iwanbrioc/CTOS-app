import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { SplashScreen } from "@capacitor/splash-screen";

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
        // Request notification permission on first load
        if ('Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission();
        }
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);

// Hide splash screen once the app has rendered
SplashScreen.hide({ fadeOutDuration: 300 });
