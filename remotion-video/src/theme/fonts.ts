// src/theme/fonts.ts
// Font Loading via @remotion/google-fonts (DS-03)
import { delayRender, continueRender } from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadNotoSansDevanagari } from '@remotion/google-fonts/NotoSansDevanagari';

let fontsLoaded = false;
let fontLoadingPromise: Promise<void> | null = null;

export function loadBrandFonts(): Promise<void> {
  if (fontsLoaded) return Promise.resolve();
  if (fontLoadingPromise) return fontLoadingPromise;

  // In non-browser / node test environments, document may not exist
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    fontsLoaded = true;
    return Promise.resolve();
  }

  let handle: number | null = null;
  try {
    handle = delayRender('Loading brand Google Fonts (Inter, Noto Sans Devanagari)');
  } catch {
    // If called outside Remotion composition context, delayRender throws
    handle = null;
  }

  const { waitUntilDone: waitInter } = loadInter('normal', {
    weights: ['400', '500', '600', '700', '800'],
  });

  const { waitUntilDone: waitNoto } = loadNotoSansDevanagari('normal', {
    weights: ['400', '600', '700'],
  });

  fontLoadingPromise = Promise.all([waitInter(), waitNoto()])
    .then(() => {
      fontsLoaded = true;
      if (handle !== null) {
        continueRender(handle);
      }
    })
    .catch((err) => {
      console.warn('Google fonts loading failed or timed out:', err);
      fontsLoaded = true;
      if (handle !== null) {
        continueRender(handle);
      }
    });

  return fontLoadingPromise;
}
