import { describe, expect, it } from 'vitest';
import { Feature } from '../catalog';
import { Product } from '../brand';

describe('Zod Catalog & Brand Schemas (docs/schema.md)', () => {
  describe('Feature Schema', () => {
    it('successfully parses a valid feature definition', () => {
      const validFeature = {
        key: 'qr_table_ordering',
        category: 'Customer Experience',
        availability: 'live',
        uiComponent: 'QRTableOrdering',
        mockData: { table: 'T-12', total: 450 },
        heroMetric: { value: '3x', label: 'en' },
        locales: {
          en: {
            title: 'QR Ordering',
            sub: 'Let customers order from their phone',
          },
          hi: {
            title: 'क्यूआर ऑर्डरिंग',
            sub: 'ग्राहक अपने फोन से ऑर्डर कर सकते हैं',
          },
          mr: {
            title: 'क्यूआर ऑर्डरिंग',
            sub: 'ग्राहक त्यांच्या फोनवरून ऑर्डर करू शकतात',
          },
        },
        voiceover: {
          en: 'Scan the QR code to order instantly.',
          hi: 'तुरंत ऑर्डर करने के लिए क्यूआर कोड स्कैन करें।',
          mr: 'त्वरित ऑर्डर करण्यासाठी क्यूआर कोड स्कॅन करा.',
        },
        sfxCues: [{ frame: 15, sfx: 'click' }],
        hooks: ['Hook A', 'Hook B'],
      };

      const result = Feature.safeParse(validFeature);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.key).toBe('qr_table_ordering');
        expect(result.data.category).toBe('Customer Experience');
      }
    });

    it('rejects an invalid feature (invalid category and title exceeding 48 chars)', () => {
      const invalidFeature = {
        key: 'qr_table_ordering',
        category: 'InvalidCategory', // Not in enum
        availability: 'unsupported_status',
        uiComponent: 'QRTableOrdering',
        mockData: {},
        locales: {
          en: {
            title:
              'This title is intentionally way longer than forty-eight characters to fail Zod validation',
            sub: 'A short sub',
          },
          hi: { title: 'hi', sub: 'sub' },
          mr: { title: 'mr', sub: 'sub' },
        },
      };

      const result = Feature.safeParse(invalidFeature);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.flatten();
        expect(errors.fieldErrors.category).toBeDefined();
        expect(errors.fieldErrors.availability).toBeDefined();
        expect(result.error.issues.some((i) => i.path.includes('title'))).toBe(
          true
        );
      }
    });
  });

  describe('Product Schema', () => {
    it('successfully parses a valid product definition', () => {
      const validProduct = {
        name: 'BharatQR',
        domain: 'bharatqr.in',
        palette: {
          background: '#0B0F17',
          surface: '#151D2A',
          primary: '#2563EB',
          accent: '#38BDF8',
        },
        cta: {
          en: 'Get Started Today',
          hi: 'आज ही शुरू करें',
          mr: 'आजच सुरू करा',
        },
        logo: {
          svg: '<svg viewBox="0 0 100 100"></svg>',
          sting: 'brand/sonic-logo.wav',
        },
      };

      const result = Product.safeParse(validProduct);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('BharatQR');
        expect(result.data.domain).toBe('bharatqr.in');
      }
    });

    it('rejects an invalid product (missing required logo and invalid cta language keys)', () => {
      const invalidProduct = {
        name: 'BharatQR',
        domain: 'bharatqr.in',
        palette: { background: '#0B0F17' },
        cta: {
          fr: 'Commencer', // 'fr' is not in Lang ('en' | 'hi' | 'mr')
        },
        // missing logo
      };

      const result = Product.safeParse(invalidProduct);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.flatten();
        expect(errors.fieldErrors.logo).toBeDefined();
        expect(result.error.issues.some((i) => i.path.includes('cta'))).toBe(
          true
        );
      }
    });
  });
});
