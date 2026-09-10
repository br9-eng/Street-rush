# StreetRush — iPhone + Android App

This is the cross-platform app version of StreetRush.

## Stack
- Vite
- Three.js
- Capacitor 8
- iOS + Android targets

Capacitor is designed to turn an existing web app into a native iOS/Android app while allowing access to native device APIs.

## Build
On a computer with Node.js installed:

```bash
npm install
npm run build
npx cap add ios
npx cap add android
npx cap sync
```

Then use Xcode for iOS and Android Studio for Android.

## Important
The current game is a prototype. It does not contain payments, online multiplayer, real-money gambling, or other financial functionality.
