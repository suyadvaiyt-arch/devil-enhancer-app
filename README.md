# Devil Enhancer

A premium iPhone-style video enhancement app UI built with HTML/CSS/JavaScript and Capacitor.

## Current features
- Premium dark iPhone-style interface
- Devil Enhancer branding
- Profile avatar support
- Video picker
- Enhancement modes: 4K, 8K, 120 FPS, 240 FPS
- Quality/progress preview
- Task history screen
- Responsive mobile layout

## Important
This repository currently provides the app interface and client-side workflow. Real 4K/8K super-resolution and 120/240 FPS frame interpolation require a video-processing engine/backend (for example FFmpeg plus an AI super-resolution/interpolation model). The demo UI does not falsely claim that browser JavaScript has performed AI enhancement.

## Android build
1. Install Node.js and Android Studio.
2. Run:
   npm install
   npx cap add android
   npx cap sync android
   npx cap open android
3. Build the APK from Android Studio.

You can also connect this project to GitHub Actions later for automated Android builds.
