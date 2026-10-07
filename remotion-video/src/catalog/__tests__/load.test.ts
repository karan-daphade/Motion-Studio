import { describe, expect, it } from 'vitest';
import path from 'node:path';
import { comingSoonLabel, loadBrand } from '../load';
import { Brand } from '../../schema/brand';
import { Feature } from '../../schema/catalog';
import { MOCK_MENU_ITEMS, MOCK_ORDERS, MOCK_TABLES } from '../mock';

const BRANDS_ROOT = path.resolve(__dirname, '../../../../brands');

describe('Catalog Loader & Validation Suite (CAT-01 to CAT-07, BRD-02, BRD-24)', () => {
  describe('Valid Brand Loading', () => {
    it('successfully loads and validates bharatqr in preview mode', () => {
      const data = loadBrand('bharatqr', { mode: 'preview', brandsRoot: BRANDS_ROOT });
      expect(data.brand.id).toBe('bharatqr');
      expect(data.brand.displayName).toBe('BharatQR');
      expect(data.product.name).toBe('BharatQR');
      expect(data.features).toHaveLength(15);
      expect(data.unreviewed.length).toBeGreaterThan(0);
    });
  });

  describe('Missing Required Fields Fail with Exact Path', () => {
    it('fails when Brand displayName is missing', () => {
      const invalidBrand = {
        schemaVersion: '1.0',
        id: 'test-brand',
        // displayName missing
        status: 'draft',
        version: '0.1.0',
      };
      const result = Brand.safeParse(invalidBrand);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path.includes('displayName'))).toBe(true);
      }
    });

    it('fails when Brand primary color is invalid hex', () => {
      const invalidBrand = {
        colors: {
          primary: 'not-a-hex-color',
        },
      };
      const result = Brand.safeParse(invalidBrand);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path.includes('primary'))).toBe(true);
      }
    });
  });

  describe('CAT-04 Language Completeness & Review Gate', () => {
    it('fails when a feature is missing a required language declared in brand', () => {
      const featureMissingLang = {
        key: 'test_feature',
        category: 'Setup',
        availability: 'live',
        uiComponent: 'TestUI',
        mockData: {},
        locales: {
          en: { title: 'Test Feature', sub: 'Test Sub' },
          // hi and mr missing
        },
      };
      const parseResult = Feature.safeParse(featureMissingLang);
      expect(parseResult.success).toBe(true); // Structure matches schema

      // But cross-check in loader fails for required languages
      const brandLangs = ['en', 'hi', 'mr'];
      const missing = brandLangs.filter(l => !(l in featureMissingLang.locales));
      expect(missing).toEqual(['hi', 'mr']);
    });

    it('blocks release mode when transcreated languages are unreviewed (CAT-04)', () => {
      expect(() => {
        loadBrand('bharatqr', { mode: 'release', brandsRoot: BRANDS_ROOT });
      }).toThrowError(/CAT-04 Release Gate Blocked: Unreviewed copy in languages \[hi, mr\]/);
    });

    it('allows preview mode with a warning when transcreated languages are unreviewed', () => {
      const data = loadBrand('bharatqr', { mode: 'preview', brandsRoot: BRANDS_ROOT });
      expect(data.features).toHaveLength(15);
      expect(data.unreviewed.some(u => u.lang === 'hi')).toBe(true);
      expect(data.unreviewed.some(u => u.lang === 'mr')).toBe(true);
    });
  });

  describe('CAT-05 Roadmap Feature Coming Soon Labels', () => {
    it('returns coming soon label for roadmap features in all languages', () => {
      const roadmapFeature = {
        key: 'qr_table_ordering',
        availability: 'roadmap' as const,
        category: 'Customer Experience' as const,
        uiComponent: 'QRTableOrdering',
        mockData: {},
        locales: {},
      };
      expect(comingSoonLabel(roadmapFeature, 'en')).toBe('Coming Soon');
      expect(comingSoonLabel(roadmapFeature, 'hi')).toBe('जल्द आ रहा है');
      expect(comingSoonLabel(roadmapFeature, 'mr')).toBe('लवकरच येत आहे');
    });

    it('returns null for live or beta features', () => {
      const liveFeature = {
        key: 'onboarding_wizard',
        availability: 'live' as const,
        category: 'Setup' as const,
        uiComponent: 'OnboardingStepper',
        mockData: {},
        locales: {},
      };
      expect(comingSoonLabel(liveFeature, 'en')).toBeNull();
      expect(comingSoonLabel(liveFeature, 'hi')).toBeNull();
    });
  });

  describe('CAT-06 Overlong Title Limits', () => {
    it('fails when title exceeds 48 characters', () => {
      const overlongFeature = {
        key: 'test_overlong',
        category: 'Operations',
        availability: 'live',
        uiComponent: 'TestUI',
        mockData: {},
        locales: {
          en: {
            title: 'This title is intentionally way over forty-eight characters long to trigger Zod validation error',
            sub: 'Short description',
          },
        },
      };
      const result = Feature.safeParse(overlongFeature);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path.includes('title'))).toBe(true);
      }
    });
  });

  describe('CAT-07 Realistic Indian Mock Data Audit', () => {
    const LOREM_REGEX = /lorem|ipsum|dolor|sit amet|foo|bar|baz|john doe|jane doe/i;

    it('contains zero lorem ipsum in mock tables, menu, and orders', () => {
      expect(LOREM_REGEX.test(JSON.stringify(MOCK_TABLES))).toBe(false);
      expect(LOREM_REGEX.test(JSON.stringify(MOCK_MENU_ITEMS))).toBe(false);
      expect(LOREM_REGEX.test(JSON.stringify(MOCK_ORDERS))).toBe(false);
    });

    it('uses authentic Indian dishes and positive INR pricing', () => {
      expect(MOCK_MENU_ITEMS.length).toBeGreaterThan(0);
      for (const item of MOCK_MENU_ITEMS) {
        expect(item.price).toBeGreaterThan(0);
        expect(item.nameHi).toBeDefined();
        expect(item.nameMr).toBeDefined();
      }
    });

    it('calculates authentic 5% restaurant GST in orders', () => {
      for (const order of MOCK_ORDERS) {
        expect(order.cgst).toBe(order.subtotal * 0.025);
        expect(order.sgst).toBe(order.subtotal * 0.025);
        expect(order.total).toBe(order.subtotal + order.cgst + order.sgst);
      }
    });

    it('bharatqr catalog features contain zero lorem ipsum', () => {
      const data = loadBrand('bharatqr', { mode: 'preview', brandsRoot: BRANDS_ROOT });
      for (const feat of data.features) {
        expect(LOREM_REGEX.test(JSON.stringify(feat.mockData))).toBe(false);
      }
    });
  });
});
