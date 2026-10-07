import fs from 'node:fs';
import path from 'node:path';
import { Brand, type Brand as BrandType, Product, type ProductType } from '../schema/brand';
import { Feature, type FeatureType } from '../schema/catalog';
import { z } from 'zod';

export interface LoadBrandOptions {
  mode?: 'preview' | 'release';
  brandsRoot?: string;
}

export interface LoadedBrandData {
  brand: BrandType;
  product: ProductType;
  features: FeatureType[];
  unreviewed: Array<{ featureKey: string; lang: string }>;
}

const COMING_SOON_LABELS: Record<string, string> = {
  en: 'Coming Soon',
  hi: 'जल्द आ रहा है',
  mr: 'लवकरच येत आहे',
};

/**
 * Returns the localized 'Coming Soon' label for roadmap features (CAT-05).
 * Returns null if the feature is already live or beta.
 */
export function comingSoonLabel(feature: FeatureType, lang: string): string | null {
  if (feature.availability === 'roadmap') {
    return COMING_SOON_LABELS[lang] || COMING_SOON_LABELS.en;
  }
  return null;
}

/**
 * Checks if a feature's localized copy has been reviewed by a native reviewer.
 */
export function isLocaleReviewed(feature: FeatureType, lang: string): boolean {
  const loc = feature.locales[lang];
  return Boolean(loc && loc.reviewedBy && loc.reviewedOn);
}

/**
 * Loads a brand by id and validates brand.json, product.json, and features.json.
 * Cross-checks that every feature has copy for every language in brand.localization.languages (CAT-04).
 * Modes:
 *   - 'preview': warns on unreviewed languages
 *   - 'release': BLOCKS with an error if non-English languages are unreviewed
 */
export function loadBrand(
  brandId: string,
  options: LoadBrandOptions = {}
): LoadedBrandData {
  const mode = options.mode || 'preview';
  const defaultBrandsRoot = path.resolve(__dirname, '../../../brands');
  const brandsRoot = options.brandsRoot || defaultBrandsRoot;
  const brandDir = path.resolve(brandsRoot, brandId);

  const brandJsonPath = path.resolve(brandDir, 'brand.json');
  const productJsonPath = path.resolve(brandDir, 'catalog/product.json');
  const featuresJsonPath = path.resolve(brandDir, 'catalog/features.json');

  if (!fs.existsSync(brandJsonPath)) {
    throw new Error(`Brand profile not found: ${brandJsonPath}`);
  }
  if (!fs.existsSync(productJsonPath)) {
    throw new Error(`Product catalog not found: ${productJsonPath}`);
  }
  if (!fs.existsSync(featuresJsonPath)) {
    throw new Error(`Features catalog not found: ${featuresJsonPath}`);
  }

  const rawBrand = JSON.parse(fs.readFileSync(brandJsonPath, 'utf8'));
  const rawProduct = JSON.parse(fs.readFileSync(productJsonPath, 'utf8'));
  const rawFeatures = JSON.parse(fs.readFileSync(featuresJsonPath, 'utf8'));

  // 1. Validate Brand Profile
  const brandParsed = Brand.safeParse(rawBrand);
  if (!brandParsed.success) {
    const errorMessages = brandParsed.error.issues
      .map((i) => `[${i.path.join('.') || 'root'}] ${i.message}`)
      .join(', ');
    throw new Error(`Invalid brand.json for "${brandId}": ${errorMessages}`);
  }

  // 2. Validate Product Catalog
  const productParsed = Product.safeParse(rawProduct);
  if (!productParsed.success) {
    const errorMessages = productParsed.error.issues
      .map((i) => `[${i.path.join('.') || 'root'}] ${i.message}`)
      .join(', ');
    throw new Error(`Invalid product.json for "${brandId}": ${errorMessages}`);
  }

  // 3. Validate Features Catalog
  const featuresArraySchema = z.array(Feature).min(1);
  const featuresParsed = featuresArraySchema.safeParse(rawFeatures);
  if (!featuresParsed.success) {
    const errorMessages = featuresParsed.error.issues
      .map((i) => `[${i.path.join('.') || 'root'}] ${i.message}`)
      .join(', ');
    throw new Error(`Invalid features.json for "${brandId}": ${errorMessages}`);
  }

  const brand = brandParsed.data;
  const product = productParsed.data;
  const features = featuresParsed.data;

  // 4. Cross-check CAT-04: copy exists for EVERY language in brand.localization.languages
  const requiredLanguages = brand.localization.languages;
  for (const feat of features) {
    for (const lang of requiredLanguages) {
      if (!feat.locales[lang]) {
        throw new Error(
          `CAT-04 Violation: Feature "${feat.key}" is missing required copy for language "${lang}".`
        );
      }
    }
  }

  // 5. Review Gate Check (CAT-04)
  const unreviewed: Array<{ featureKey: string; lang: string }> = [];
  for (const feat of features) {
    for (const lang of requiredLanguages) {
      if (lang === 'en') continue; // English is primary authoring language
      if (!isLocaleReviewed(feat, lang)) {
        unreviewed.push({ featureKey: feat.key, lang });
      }
    }
  }

  if (unreviewed.length > 0) {
    const distinctUnreviewedLangs = [
      ...new Set(unreviewed.map((u) => u.lang)),
    ];
    if (mode === 'release') {
      throw new Error(
        `CAT-04 Release Gate Blocked: Unreviewed copy in languages [${distinctUnreviewedLangs.join(
          ', '
        )}]. Native review is required before release.`
      );
    } else {
      console.warn(
        `[WARN] Preview mode: ${unreviewed.length} feature-language combinations pending review in [${distinctUnreviewedLangs.join(
          ', '
        )}]. Allowed in preview.`
      );
    }
  }

  return {
    brand,
    product,
    features,
    unreviewed,
  };
}
