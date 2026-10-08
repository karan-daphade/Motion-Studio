// Sourced from frontend/components/operations/panels/WaitingListPanel.tsx
// Pure Remotion Component: WaitlistManagementPanel (UI-01, LOC-02)

import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { useTheme } from '../../../theme/useTheme';
import { WaitlistManagementPanelProps, WaitlistManagementPanelPropsSchema } from './WaitlistManagementPanel.schema';

const STRINGS = {
  en: {
    queueTitle: 'Floor Waitlist Queue',
    activeWaiting: 'waiting',
    avgWait: 'avg wait',
    assignedBadge: 'Assigned',
    waitingBadge: 'Waiting',
    guests: 'guests',
    seatParty: 'Seat Assigned Party',
    comingSoon: 'Coming soon',
    poweredBy: 'Section Host Dispatch • BharatQR',
    mins: 'm',
  },
  hi: {
    queueTitle: 'फ्लोर प्रतीक्षा सूची',
    activeWaiting: 'प्रतीक्षारत',
    avgWait: 'औसत समय',
    assignedBadge: 'टेबल तय',
    waitingBadge: 'प्रतीक्षा जारी',
    guests: 'अतिथि',
    seatParty: 'अतिथि को बैठाएं',
    comingSoon: 'जल्द आ रहा है',
    poweredBy: 'होस्ट डिस्पैच • भारतक्यूआर',
    mins: 'मि',
  },
  mr: {
    queueTitle: 'फ्लोअर रांग व्यवस्थापन',
    activeWaiting: 'प्रतीक्षेत',
    avgWait: 'सरासरी वेळ',
    assignedBadge: 'टेबल नियुक्त',
    waitingBadge: 'प्रतीक्षा सुरू',
    guests: 'पाहुणे',
    seatParty: 'टेबलवर बसवा',
    comingSoon: 'लवकरच येत आहे',
    poweredBy: 'होस्ट डिस्पॅच • भारतक्यूआर',
    mins: 'मि',
  },
};

export const WaitlistManagementPanel: React.FC<WaitlistManagementPanelProps> = (rawProps) => {
  const props = WaitlistManagementPanelPropsSchema.parse(rawProps);
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
              color: colors.primary,
              backgroundColor: `${colors.primary}12`,
              padding: '2px 8px',
              borderRadius: layout.radii.small,
            }}
          >
            {t.queueTitle}
          </span>
          <span style={{ fontSize: 11, color: colors.text.muted }}>
            ~{props.avgWaitMins}{t.mins} {t.avgWait}
          </span>
        </div>

        <div style={{ marginTop: layout.spacingUnit }}>
          <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.2 }}>
            {props.sectionName}
          </div>
          <div style={{ fontSize: 12, color: colors.text.muted, marginTop: 2 }}>
            {props.activeCount} {t.activeWaiting}
          </div>
        </div>
      </div>

      {/* Queue Entries List */}
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
        {props.entries.map((entry) => {
          const isAssigned = entry.status === 'TABLE_ASSIGNED';
          const badgeColor = isAssigned ? colors.secondary : colors.primary;

          return (
            <div
              key={entry.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: `${layout.spacingUnit}px`,
                borderRadius: layout.radii.small,
                backgroundColor: isAssigned ? `${colors.secondary}0D` : colors.surfaceMuted,
                border: isAssigned ? `1px solid ${colors.secondary}40` : `1px solid ${colors.border}`,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: badgeColor,
                    }}
                  >
                    {entry.token}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>
                    {entry.guestName}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: colors.text.muted, marginTop: 2 }}>
                  {entry.partySize} {t.guests} • ⏱ {entry.waitMinutes}{t.mins}
                </div>
              </div>

              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: badgeColor,
                  backgroundColor: `${badgeColor}18`,
                  padding: '2px 8px',
                  borderRadius: layout.radii.small,
                  textAlign: 'right',
                }}
              >
                {isAssigned ? `${t.assignedBadge} ${entry.assignedTable}` : t.waitingBadge}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
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
          {t.seatParty} →
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
