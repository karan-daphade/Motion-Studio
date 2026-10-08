// Sourced from frontend/app/operations/billing/page.tsx
// Pure Remotion Component: BillingSummary (UI-01, UI-05)

import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { useTheme } from '../../../theme/useTheme';
import { formatIndianNumber } from '../../../engine/charts/format';
import { BillingSummaryProps, BillingSummaryPropsSchema } from './BillingSummary.schema';

const STRINGS = {
  en: {
    taxInvoice: 'Tax Invoice',
    subtotal: 'Subtotal',
    cgst: 'CGST (2.5%)',
    sgst: 'SGST (2.5%)',
    grandTotal: 'Grand Total',
    settleInvoice: 'Settle Invoice',
    paymentMode: 'Payment Mode',
    items: 'items',
    gstNote: '100% Automated GST-Compliant Billing',
    comingSoon: 'Coming soon',
  },
  hi: {
    taxInvoice: 'टैक्स इनवॉइस',
    subtotal: 'उप-कुल',
    cgst: 'सीजीएसटी (2.5%)',
    sgst: 'एसजीएसटी (2.5%)',
    grandTotal: 'कुल देय राशि',
    settleInvoice: 'भुगतान पूरा करें',
    paymentMode: 'भुगतान विधि',
    items: 'आइटम',
    gstNote: 'जीएसटी प्रमाणित बिलिंग प्रणाली',
    comingSoon: 'जल्द आ रहा है',
  },
  mr: {
    taxInvoice: 'कर बीजक',
    subtotal: 'उप-एकूण',
    cgst: 'सीजीएसटी (2.5%)',
    sgst: 'एसजीएसटी (2.5%)',
    grandTotal: 'एकूण देय रक्कम',
    settleInvoice: 'बील अदा करा',
    paymentMode: 'पेमेंट प्रकार',
    items: 'पदार्थ',
    gstNote: 'जीएसटी अनुपालित बीलिंग प्रणाली',
    comingSoon: 'लवकरच येत आहे',
  },
};

export const BillingSummary: React.FC<BillingSummaryProps> = (rawProps) => {
  const props = BillingSummaryPropsSchema.parse(rawProps);
  const remotionFrame = useCurrentFrame();
  const frame = props.frame ?? remotionFrame;
  const { colors, layout, fontFamily } = useTheme();

  const t = STRINGS[props.locale] || STRINGS.en;

  // Frame entrance animation (0..15 frames)
  const progress = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const eased = 1 - Math.pow(1 - progress, 3);

  const paymentModes = ['UPI', 'Cash', 'Card'] as const;

  return (
    <div
      style={{
        position: 'relative',
        backgroundColor: colors.surface,
        borderRadius: layout.radii.large,
        border: `1px solid ${colors.border}`,
        padding: layout.spacingUnit * 2.5,
        boxShadow: layout.shadows,
        width: 320,
        minHeight: 460,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        fontFamily,
        color: colors.text.primary,
        boxSizing: 'border-box',
        opacity: eased,
        transform: `scale(${0.96 + 0.04 * eased})`,
        overflow: 'hidden',
      }}
    >
      {/* Roadmap Badge */}
      {props.isRoadmap && (
        <div
          style={{
            position: 'absolute',
            top: layout.spacingUnit,
            right: layout.spacingUnit,
            backgroundColor: colors.accent,
            color: colors.surface,
            fontSize: 10,
            fontWeight: 700,
            padding: `${layout.spacingUnit * 0.5}px ${layout.spacingUnit}px`,
            borderRadius: layout.radii.small,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            zIndex: 10,
          }}
        >
          {t.comingSoon}
        </div>
      )}

      {/* Header Info */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: colors.secondary,
              backgroundColor: `${colors.secondary}14`,
              padding: '2px 8px',
              borderRadius: layout.radii.small,
            }}
          >
            {t.taxInvoice}
          </span>
          <span style={{ fontSize: 11, color: colors.text.muted }}>
            ⏱ {props.duration}
          </span>
        </div>

        <div style={{ marginTop: layout.spacingUnit }}>
          <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.2 }}>
            {props.table}
          </div>
          <div style={{ fontSize: 12, color: colors.text.muted, marginTop: 2 }}>
            {props.billNumber} • {props.party} ({props.itemsCount} {t.items})
          </div>
        </div>
      </div>

      {/* Financial Breakdown Table */}
      <div
        style={{
          margin: `${layout.spacingUnit * 1.5}px 0`,
          borderTop: `1px solid ${colors.border}`,
          borderBottom: `1px solid ${colors.border}`,
          padding: `${layout.spacingUnit * 1.5}px 0`,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: colors.text.muted }}>
          <span>{t.subtotal}</span>
          <span>₹{formatIndianNumber(props.subtotal)}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: colors.text.muted }}>
          <span>{t.cgst}</span>
          <span>₹{props.cgst.toFixed(2)}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: colors.text.muted }}>
          <span>{t.sgst}</span>
          <span>₹{props.sgst.toFixed(2)}</span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 18,
            fontWeight: 800,
            color: colors.text.primary,
            borderTop: `1px dashed ${colors.border}`,
            paddingTop: 8,
            marginTop: 4,
          }}
        >
          <span>{t.grandTotal}</span>
          <span>₹{formatIndianNumber(props.total)}</span>
        </div>
      </div>

      {/* Payment Mode Selector Simulation */}
      <div>
        <label style={{ fontSize: 11, fontWeight: 600, color: colors.text.muted, display: 'block', marginBottom: 6 }}>
          {t.paymentMode}
        </label>
        <div style={{ display: 'flex', gap: 6 }}>
          {paymentModes.map((mode) => {
            const isSelected = mode === props.paymentMode;
            return (
              <div
                key={mode}
                style={{
                  flex: 1,
                  padding: '7px 0',
                  textAlign: 'center',
                  borderRadius: layout.radii.small,
                  fontSize: 12,
                  fontWeight: 700,
                  backgroundColor: isSelected ? colors.primary : colors.surfaceMuted,
                  color: isSelected ? colors.surface : colors.text.primary,
                  border: `1px solid ${isSelected ? colors.primary : colors.border}`,
                }}
              >
                {mode === 'UPI' ? '⚡ UPI' : mode}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div style={{ marginTop: layout.spacingUnit * 1.5 }}>
        <div
          style={{
            backgroundColor: colors.secondary,
            color: colors.surface,
            padding: `${layout.spacingUnit * 1.2}px`,
            borderRadius: layout.radii.medium,
            textAlign: 'center',
            fontWeight: 700,
            fontSize: 13,
            boxShadow: `0 4px 10px ${colors.secondary}33`,
          }}
        >
          {t.settleInvoice} →
        </div>

        <div
          style={{
            textAlign: 'center',
            fontSize: 10,
            color: colors.text.muted,
            marginTop: layout.spacingUnit,
          }}
        >
          ✓ {t.gstNote}
        </div>
      </div>
    </div>
  );
};
