// src/components/clones/OrderListPanel/OrderListPanel.test.tsx
import { describe, it, expect } from 'vitest';
import { OrderListPanel } from './OrderListPanel';
import { MOCK_OPERATION_ORDERS } from '../../../catalog/mock/operations';
import { renderWithTheme } from '../../../test/renderWithTheme';

describe('OrderListPanel UI Clone (frontend/app/operations/orders/page.tsx)', () => {
  it('renders deterministically at frames 0, 30, 60 without throwing', () => {
    for (const frame of [0, 30, 60]) {
      const html = renderWithTheme(
        <OrderListPanel {...MOCK_OPERATION_ORDERS.preparing} frame={frame} locale="en" />
      );
      expect(html).toContain('ORD-102');
      expect(html).toContain('Chicken Tikka Kebab');
      expect(html).toContain('840');
    }
  });

  it('renders ready state with dispatch action', () => {
    const html = renderWithTheme(
      <OrderListPanel {...MOCK_OPERATION_ORDERS.ready} frame={15} locale="en" />
    );
    expect(html).toContain('Ready to Serve');
    expect(html).toContain('Dal Makhani');
    expect(html).toContain('Dispatch Order');
  });

  it('renders in Hindi and Marathi locales', () => {
    const hiHtml = renderWithTheme(
      <OrderListPanel {...MOCK_OPERATION_ORDERS.preparing} frame={10} locale="hi" />,
      { locale: 'hi' }
    );
    expect(hiHtml).toContain('रसोई में प्रगति पर');

    const mrHtml = renderWithTheme(
      <OrderListPanel {...MOCK_OPERATION_ORDERS.preparing} frame={10} locale="mr" />,
      { locale: 'mr' }
    );
    expect(mrHtml).toContain('किचनमध्ये तयारी सुरू');
  });

  it('renders roadmap coming soon badge when isRoadmap is true', () => {
    const html = renderWithTheme(
      <OrderListPanel {...MOCK_OPERATION_ORDERS.preparing} isRoadmap={true} frame={0} />
    );
    expect(html).toContain('Coming soon');
  });
});
