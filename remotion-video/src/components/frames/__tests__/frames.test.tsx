
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { PhoneFrame, TabletFrame, LaptopFrame, ThermalReceiptFrame, getFrameAnchor } from '../index';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import { Brand } from '../../../schema/brand';
import brandJson from '../../../../../brands/bharatqr/brand.json';

const brand = Brand.parse(brandJson);

describe('Device Frames (UI-03)', () => {
  it('calculates anchor points correctly across all device frames', () => {
    const phoneCenter = getFrameAnchor('phone', 'center', 390, 844);
    expect(phoneCenter).toEqual({ x: 195, y: 422 });

    const phoneIsland = getFrameAnchor('phone', 'island', 390, 844);
    expect(phoneIsland).toEqual({ x: 195, y: 24 });

    const tabletHeader = getFrameAnchor('tablet', 'header', 820, 580);
    expect(tabletHeader).toEqual({ x: 410, y: 50 });

    const laptopTrackpad = getFrameAnchor('laptop', 'trackpad', 960, 600);
    expect(laptopTrackpad).toEqual({ x: 480, y: 588 });

    const receiptTotal = getFrameAnchor('receipt', 'total', 340, 620);
    expect(receiptTotal).toEqual({ x: 170, y: 560 });
  });

  it('renders PhoneFrame with children', () => {
    const html = renderToString(
      <ThemeProvider brand={brand}>
        <PhoneFrame>
          <div data-testid="screen-content">Mobile Screen</div>
        </PhoneFrame>
      </ThemeProvider>
    );
    expect(html).toContain('Mobile Screen');
  });

  it('renders TabletFrame with children', () => {
    const html = renderToString(
      <ThemeProvider brand={brand}>
        <TabletFrame>
          <div>Tablet Screen</div>
        </TabletFrame>
      </ThemeProvider>
    );
    expect(html).toContain('Tablet Screen');
  });

  it('renders LaptopFrame with children', () => {
    const html = renderToString(
      <ThemeProvider brand={brand}>
        <LaptopFrame>
          <div>Laptop Screen</div>
        </LaptopFrame>
      </ThemeProvider>
    );
    expect(html).toContain('Laptop Screen');
  });

  it('renders ThermalReceiptFrame with children', () => {
    const html = renderToString(
      <ThemeProvider brand={brand}>
        <ThermalReceiptFrame>
          <div>Receipt Details</div>
        </ThermalReceiptFrame>
      </ThemeProvider>
    );
    expect(html).toContain('Receipt Details');
  });
});
