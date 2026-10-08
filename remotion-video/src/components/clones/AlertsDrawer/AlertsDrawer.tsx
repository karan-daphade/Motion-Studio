// Sourced from frontend/components/operations/panels/AlertsDrawer.tsx
// Pure Remotion Component: AlertsDrawer (UI-01, LOC-02)

import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { useTheme } from '../../../theme/useTheme';
import { AlertsDrawerProps, AlertsDrawerPropsSchema } from './AlertsDrawer.schema';

const STRINGS = {
  en: {
    alertsTitle: 'Live Operational Alerts',
    urgentBadge: 'Urgent',
    accessRequest: 'Access Request',
    occupiedScan: 'Occupied Re-scan',
    billHelp: 'Bill Assistance',
    approve: 'Approve',
    dismiss: 'Dismiss',
    comingSoon: 'Coming soon',
    poweredBy: 'Real-Time Floor Dispatch • BharatQR',
  },
  hi: {
    alertsTitle: 'लाइव संचालन अलर्ट',
    urgentBadge: 'आवश्यक',
    accessRequest: 'टेबल प्रवेश अनुरोध',
    occupiedScan: 'व्यस्त टेबल स्कैन',
    billHelp: 'बिल सहायता',
    approve: 'स्वीकारें',
    dismiss: 'हटाएं',
    comingSoon: 'जल्द आ रहा है',
    poweredBy: 'रियल-टाइम फ्लोर डिस्पैच • भारतक्यूआर',
  },
  mr: {
    alertsTitle: 'थेट ऑपरेशन्स सूचना',
    urgentBadge: 'तातडीचे',
    accessRequest: 'टेबल प्रवेश विनंती',
    occupiedScan: 'व्यस्त टेबल स्कॅन',
    billHelp: 'बिल मदत',
    approve: 'मंजूर करा',
    dismiss: 'वगळा',
    comingSoon: 'लवकरच येत आहे',
    poweredBy: 'थेट फ्लोअर डिस्पॅच • भारतक्यूआर',
  },
};

export const AlertsDrawer: React.FC<AlertsDrawerProps> = (rawProps) => {
  const props = AlertsDrawerPropsSchema.parse(rawProps);
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

  // Urgent beacon pulse
  const urgentOpacity = interpolate(
    frame % 20,
    [0, 10, 20],
    [0.6, 1.0, 0.6],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const getTypeMeta = (type: string) => {
    switch (type) {
      case 'access_request':
        return { label: t.accessRequest, color: colors.primary };
      case 'occupied_scan':
        return { label: t.occupiedScan, color: colors.accent };
      case 'bill_assistance':
        return { label: t.billHelp, color: colors.secondary };
      default:
        return { label: 'Alert', color: colors.text.muted };
    }
  };

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
              color: colors.accent,
              backgroundColor: `${colors.accent}14`,
              padding: '2px 8px',
              borderRadius: layout.radii.small,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: colors.accent,
                opacity: urgentOpacity,
              }}
            />
            {`${props.urgentCount} ${t.urgentBadge}`}
          </span>
          <span style={{ fontSize: 11, color: colors.text.muted }}>
            {props.branchName}
          </span>
        </div>

        <div style={{ marginTop: layout.spacingUnit }}>
          <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.2 }}>
            {t.alertsTitle}
          </div>
        </div>
      </div>

      {/* Alerts List */}
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
        {props.alerts.map((alert) => {
          const meta = getTypeMeta(alert.type);

          return (
            <div
              key={alert.id}
              style={{
                padding: `${layout.spacingUnit * 1.2}px`,
                borderRadius: layout.radii.medium,
                backgroundColor: alert.urgent ? `${meta.color}0A` : colors.surfaceMuted,
                border: `1px solid ${alert.urgent ? `${meta.color}40` : colors.border}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: meta.color,
                      backgroundColor: `${meta.color}15`,
                      padding: '1px 6px',
                      borderRadius: layout.radii.small,
                    }}
                  >
                    {meta.label}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 800 }}>
                    {alert.table}
                  </span>
                </div>

                <span style={{ fontSize: 10, color: colors.text.muted }}>
                  {alert.timeAgo}
                </span>
              </div>

              <div style={{ fontSize: 12, color: colors.text.primary, lineHeight: 1.3 }}>
                {alert.message}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 4 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: meta.color,
                    padding: '2px 8px',
                    borderRadius: layout.radii.small,
                    backgroundColor: `${meta.color}15`,
                  }}
                >
                  {t.approve}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div>
        <div
          style={{
            backgroundColor: colors.primary,
            color: colors.surface,
            padding: `${layout.spacingUnit * 1.2}px`,
            borderRadius: layout.radii.medium,
            textAlign: 'center',
            fontWeight: 700,
            fontSize: 13,
            boxShadow: `0 4px 10px ${colors.primary}33`,
          }}
        >
          Acknowledge All →
        </div>

        <div
          style={{
            textAlign: 'center',
            fontSize: 10,
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
