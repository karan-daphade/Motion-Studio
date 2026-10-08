// Sourced from frontend/app/operations/orders/page.tsx
// Pure Remotion Component: OrderListPanel (UI-01, UI-05)

import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { useTheme } from '../../../theme/useTheme';
import { formatIndianNumber } from '../../../engine/charts/format';
import { OrderListPanelProps, OrderListPanelPropsSchema } from './OrderListPanel.schema';

const STRINGS = {
  en: {
    waitingAccept: 'New Order',
    preparing: 'In Kitchen',
    ready: 'Ready to Serve',
    dispatch: 'Dispatch Order',
    accept: 'Accept Order',
    total: 'Total Amount',
    items: 'items',
    notes: 'Chef Instructions',
    comingSoon: 'Coming soon',
    poweredBy: 'Live Order Dispatch • BharatQR',
  },
  hi: {
    waitingAccept: 'नया ऑर्डर',
    preparing: 'रसोई में प्रगति पर',
    ready: 'परोसने के लिए तैयार',
    dispatch: 'ऑर्डर भेजें',
    accept: 'ऑर्डर स्वीकारें',
    total: 'कुल राशि',
    items: 'आइटम',
    notes: 'विशेष निर्देश',
    comingSoon: 'जल्द आ रहा है',
    poweredBy: 'लाइव ऑर्डर ट्रैकिंग • भारतक्यूआर',
  },
  mr: {
    waitingAccept: 'नवीन ऑर्डर',
    preparing: 'किचनमध्ये तयारी सुरू',
    ready: 'सर्व्ह करण्यासाठी सज्ज',
    dispatch: 'ऑर्डर रवाना करा',
    accept: 'ऑर्डर स्वीकारा',
    total: 'एकूण रक्कम',
    items: 'पदार्थ',
    notes: 'विशेष सूचना',
    comingSoon: 'लवकरच येत आहे',
    poweredBy: 'थेट ऑर्डर ट्रॅकिंग • भारतक्यूआर',
  },
};

export const OrderListPanel: React.FC<OrderListPanelProps> = (rawProps) => {
  const props = OrderListPanelPropsSchema.parse(rawProps);
  const remotionFrame = useCurrentFrame();
  const frame = props.frame ?? remotionFrame;
  const { colors, layout, fontFamily } = useTheme();

  const t = STRINGS[props.locale] || STRINGS.en;

  // Frame entrance animation
  const progress = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const eased = 1 - Math.pow(1 - progress, 3);

  const getStatusMeta = () => {
    switch (props.status) {
      case 'waiting_accept':
        return { label: t.waitingAccept, color: colors.accent, action: t.accept };
      case 'preparing':
        return { label: t.preparing, color: colors.primary, action: t.dispatch };
      case 'ready':
        return { label: t.ready, color: colors.secondary, action: t.dispatch };
    }
  };

  const statusMeta = getStatusMeta();

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
        minHeight: 440,
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
          <div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: colors.text.muted,
              }}
            >
              {props.id} • {props.token}
            </span>
            <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.2, marginTop: 2 }}>
              {props.table}
            </div>
          </div>

          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: statusMeta.color,
              backgroundColor: `${statusMeta.color}14`,
              padding: '3px 8px',
              borderRadius: layout.radii.small,
            }}
          >
            {statusMeta.label}
          </div>
        </div>

        <div style={{ fontSize: 11, color: colors.text.muted, marginTop: 4 }}>
          ⏱ {props.timeAgo}
        </div>
      </div>

      {/* Items List */}
      <div
        style={{
          margin: `${layout.spacingUnit * 1.5}px 0`,
          borderTop: `1px solid ${colors.border}`,
          borderBottom: `1px solid ${colors.border}`,
          padding: `${layout.spacingUnit * 1.5}px 0`,
          display: 'flex',
          flexDirection: 'column',
          gap: layout.spacingUnit,
        }}
      >
        {props.items.map((item, idx) => (
          <div
            key={`${item.name}-${idx}`}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {/* Veg / Non-Veg Dot Indicator */}
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 2,
                  border: `1.5px solid ${item.tag === 'veg' ? colors.secondary : colors.accent}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: item.tag === 'veg' ? colors.secondary : colors.accent,
                  }}
                />
              </span>

              <span style={{ fontSize: 13, fontWeight: 600 }}>
                {item.name}
              </span>
              <span style={{ fontSize: 11, color: colors.text.muted, fontWeight: 600 }}>
                x{item.qty}
              </span>
            </div>

            <span style={{ fontSize: 13, fontWeight: 700 }}>
              ₹{formatIndianNumber(item.price)}
            </span>
          </div>
        ))}

        {props.notes && (
          <div
            style={{
              backgroundColor: colors.surfaceMuted,
              padding: `${layout.spacingUnit}px`,
              borderRadius: layout.radii.small,
              fontSize: 11,
              color: colors.text.muted,
              marginTop: 4,
            }}
          >
            📝 {t.notes}: {props.notes}
          </div>
        )}
      </div>

      {/* Total & Action Footer */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: layout.spacingUnit * 1.5,
          }}
        >
          <span style={{ fontSize: 12, color: colors.text.muted }}>
            {t.total} ({props.items.length} {t.items})
          </span>
          <span style={{ fontSize: 20, fontWeight: 800, color: colors.text.primary }}>
            ₹{formatIndianNumber(props.total)}
          </span>
        </div>

        <div
          style={{
            backgroundColor: statusMeta.color,
            color: colors.surface,
            padding: `${layout.spacingUnit * 1.2}px`,
            borderRadius: layout.radii.medium,
            textAlign: 'center',
            fontWeight: 700,
            fontSize: 13,
            boxShadow: `0 4px 10px ${statusMeta.color}33`,
          }}
        >
          {statusMeta.action} →
        </div>

        <div
          style={{
            textAlign: 'center',
            fontSize: 11,
            color: colors.text.muted,
            marginTop: layout.spacingUnit,
          }}
        >
          {t.poweredBy}
        </div>
      </div>
    </div>
  );
};
