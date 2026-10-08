// src/test/fixtures.ts
import brandJson from '../../../brands/bharatqr/brand.json';
import { Brand } from '../schema/brand';

export const baseBrand = Brand.parse(brandJson);

export const alternateBrand: Brand = {
  ...baseBrand,
  colors: {
    ...baseBrand.colors,
    primary: '#854D0E',
    secondary: '#166534',
    accent: '#B45309',
  },
};
