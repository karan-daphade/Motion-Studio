// Sourced from frontend/app/operations/kds/page.tsx
// Pure Remotion Component: KdsCard (UI-01, UI-05)

import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { useTheme } from '../../../theme/useTheme';
import { KdsCardProps, KdsCardPropsSchema } from './KdsCard.schema';

const STRINGS = {
  en: {
    urgent: 'URGENT',
    bumpTicket: 'Bump Ticket',
    allDone: 'All Ready',
    comingSoon: 'Coming soon',
    server: 'Server',
    station: 'Station',
  },
  hi: {
    urgent: 'अति आवश्यक',
    bumpTicket: 'टिकट पूरा करें',
    allDone: 'सब तैयार',
    comingSoon: 'जल्द आ रहा है',
    server: 'वेटर',
    station: 'रसोई स्टेशन',
  },
  mr: {
    urgent: 'तातडीचे',
    bumpTicket: 'तिकीट पूर्ण करा',
    allDone: 'सर्व तयार',
    comingSoon: 'लवकरच येत आहे',
    server: 'वेटर',
    station: 'किचन स्टेशन',
  },
};

export const KdsCard: React.FC<KdsCardProps> = (rawProps) => {
  const props = KdsCardPropsSchema.parse(rawProps);
  const remotionFrame = useCurrentFrame();
  const frame = props.frame ?? remotionFrame;
  const { colors, layout, fontFamily } = useTheme();

  const t = STRINGS[props.locale] || STRINGS.en;

  // Urgent pulse animation (20 frames cycle)
  const urgentOpacity = interpolate(
    frame % 20,
    [0, 10, 20],
    [0.7, 1.0, 0.7],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const cardBorder = props.urgent ? colors.accent : colors.border;

  return (
    <div
      style={{
        position: 'relative',
        backgroundColor: colors.surface,
        borderRadius: layout.radii.large,
        borderWidth: props.urgent ? 2 : 1,
        borderStyle: 'solid',
        borderColor: cardBorder,
        padding: layout.spacingUnit * 2.5,
        boxShadow: layout.shadows,
        width: 320,
        minHeight: 380,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        fontFamily,
        color: colors.text.primary,
        boxSizing: 'border-box',
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

      {/* Ticket Header */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: colors.primary,
                backgroundColor: `${colors.primary}12`,
                padding: '3px 8px',
                borderRadius: layout.radii.small,
              }}
            >
              {props.token}
            </span>

            {props.urgent && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: colors.surface,
                  backgroundColor: colors.accent,
                  padding: '3px 6px',
                  borderRadius: layout.radii.small,
                  opacity: urgentOpacity,
                }}
              >
                🔥 {t.urgent}
              </span>
            )}
          </div>

          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: props.urgent ? colors.accent : colors.text.muted,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            ⏱ {props.elapsed}
          </div>
        </div>

        {/* Table & Station Info */}
        <div style={{ marginTop: layout.spacingUnit * 1.5 }}>
          <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.2 }}>
            {props.table}
          </div>
          <div style={{ fontSize: 12, color: colors.text.muted, marginTop: 2 }}>
            {props.station} • {props.server}
          </div>
        </div>
      </div>

      {/* Item Checklist */}
      <div
        style={{
          margin: `${layout.spacingUnit * 1.5}px 0`,
          display: 'flex',
          flexDirection: 'column',
          gap: layout.spacingUnit,
          borderTop: `1px solid ${colors.border}`,
          borderBottom: `1px solid ${colors.border}`,
          padding: `${layout.spacingUnit * 1.5}px 0`,
        }}
      >
        {props.items.map((item, idx) => (
          <div
            key={`${item.name}-${idx}`}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              opacity: item.completed ? 0.5 : 1,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span
                style={{
                  display: 'inline-block',
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  backgroundColor: item.completed ? colors.secondary : colors.surfaceMuted,
                  color: item.completed ? colors.surface : colors.text.muted,
                  textAlign: 'center',
                  fontSize: 11,
                  lineHeight: '18px',
                  fontWeight: 700,
                  border: `1px solid ${item.completed ? colors.secondary : colors.border}`,
                }}
              >
                {item.completed ? '✓' : ''}
              </span>

              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: item.completed ? 'line-through' : 'none',
                  }}
                >
                  {item.name}
                </div>
                {item.notes && (
                  <div style={{ fontSize: 11, color: colors.accent, fontWeight: 500, marginTop: 1 }}>
                    ↳ {item.notes}
                  </div>
                )}
              </div>
            </div>

            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: colors.text.primary,
                backgroundColor: colors.surfaceMuted,
                padding: '2px 6px',
                borderRadius: layout.radii.small,
              }}
            >
              x{item.qty}
            </span>
          </div>
        ))}
      </div>

      {/* Action Footer */}
      <div>
        <div
          style={{
            backgroundColor: props.urgent ? colors.accent : colors.primary,
            color: colors.surface,
            padding: `${layout.spacingUnit * 1.2}px`,
            borderRadius: layout.radii.medium,
            textAlign: 'center',
            fontWeight: 700,
            fontSize: 13,
            boxShadow: `0 4px 10px ${props.urgent ? colors.accent : colors.primary}33`,
          }}
        >
          {t.bumpTicket} →
        </div>
      </div>
    </div>
  );
};
