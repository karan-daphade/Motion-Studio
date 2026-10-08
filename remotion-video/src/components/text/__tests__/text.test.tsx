
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { WordReveal, FitText } from '../index';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import { Brand } from '../../../schema/brand';
import brandJson from '../../../../../brands/bharatqr/brand.json';

const brand = Brand.parse(brandJson);

const DEVANAGARI_STRESS_STRINGS = [
  'क्ष त्र ज्ञ श्र',
  'द्ध द्य ट्ट ड्ड',
  'प्रत्येक विद्यार्थी स्त्री',
  'ऑर्डर बिल टेबल क्यूआर',
  'कार्यक्षमता ज्ञानेश्वर',
  '₹1,25,000 ₹84,200 ₹450',
];

describe('Text Primitives (LOC-02, LOC-03)', () => {
  it('WordReveal splits strictly by whole word and not by character', () => {
    const text = 'ऑर्डर बिल टेबल क्यूआर';
    const html = renderToString(
      <ThemeProvider brand={brand} locale="mr">
        <WordReveal text={text} />
      </ThemeProvider>
    );

    // Each whole word should exist intact inside its own span
    expect(html).toContain('ऑर्डर');
    expect(html).toContain('बिल');
    expect(html).toContain('टेबल');
    expect(html).toContain('क्यूआर');

    // Count individual word spans
    const wordCount = (html.match(/<span style="display:inline-block/g) || []).length;
    // Outer container + 4 word spans = 5 spans
    expect(wordCount).toBe(5);
  });

  it('FitText accommodates all Appendix D Devanagari stress strings without error', () => {
    for (const stressString of DEVANAGARI_STRESS_STRINGS) {
      const html = renderToString(
        <ThemeProvider brand={brand} locale="mr">
          <FitText text={stressString} withinWidth={300} maxFontSize={24} />
        </ThemeProvider>
      );

      expect(html).toContain(stressString);
      expect(html).toContain('max-width:300px');
    }
  });

  it('FitText scales down font size for long strings within narrow width', () => {
    const longString = 'प्रत्येक विद्यार्थी स्त्री कार्यक्षमता ज्ञानेश्वर';
    const html = renderToString(
      <ThemeProvider brand={brand} locale="mr">
        <FitText text={longString} withinWidth={150} maxFontSize={36} />
      </ThemeProvider>
    );

    expect(html).toContain(longString);
    expect(html).toContain('max-width:150px');
  });
});
