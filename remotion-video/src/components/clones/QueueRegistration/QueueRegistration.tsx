// Sourced from frontend/app/q/[branchCode]/[sectionCode]/queue-registration-client.tsx
// Pure Remotion Component: QueueRegistration (UI-01, LOC-02)

import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { useTheme } from '../../../theme/useTheme';
import { QueueRegistrationProps, QueueRegistrationPropsSchema } from './QueueRegistration.schema';

const STRINGS = {
  en: {
    kioskTitle: 'Join Dining Waitlist',
    partiesInLine: 'parties in queue',
    avgWait: 'avg wait',
    selectPartySize: 'Select Party Size',
    yourName: 'Your Full Name',
    mobileNumber: 'Mobile Number',
    getTokenButton: 'Get Queue Token',
    comingSoon: 'Coming soon',
    poweredBy: 'Instant SMS & WhatsApp Queue Updates • BharatQR',
    mins: 'mins',
    guests: 'guests',
  },
  hi: {
    kioskTitle: 'प्रतीक्षा सूची में शामिल हों',
    partiesInLine: 'कतार में परिवार',
    avgWait: 'औसत समय',
    selectPartySize: 'अतिथि संख्या चुनें',
    yourName: 'आपका पूरा नाम',
    mobileNumber: 'मोबाइल नंबर',
    getTokenButton: 'कतार टोकन प्राप्त करें',
    comingSoon: 'जल्द आ रहा है',
    poweredBy: 'तुरंत एसएमएस और व्हाट्सएप अपडेट • भारतक्यूआर',
    mins: 'मिनट',
    guests: 'अतिथि',
  },
  mr: {
    kioskTitle: 'प्रतीक्षा यादीत सामील व्हा',
    partiesInLine: 'रांगेत ग्राहक',
    avgWait: 'सरासरी वेळ',
    selectPartySize: 'पाहुण्यांची संख्या निवडा',
    yourName: 'आपले पूर्ण नाव',
    mobileNumber: 'मोबाइल नंबर',
    getTokenButton: 'रांग टोकन मिळवा',
    comingSoon: 'लवकरच येत आहे',
    poweredBy: 'झटपट एसएमएस आणि व्हॉट्सअॅप अपडेट्स • भारतक्यूआर',
    mins: 'मि',
    guests: 'पाहुणे',
  },
};

export const QueueRegistration: React.FC<QueueRegistrationProps> = (rawProps) => {
  const props = QueueRegistrationPropsSchema.parse(rawProps);
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

  const guestName = props.guestNameMock || 'Pooja Kulkarni';
  const mobile = props.mobileNumberMock || '+91 91234 56789';

  const partyOptions = [1, 2, 4, 6, 8];

  return (
    <div
      style={{
        position: 'relative',
        backgroundColor: colors.surface,
        borderRadius: layout.radii.large,
        border: `1px solid ${colors.border}`,
        padding: layout.spacingUnit * 3,
        boxShadow: layout.shadows,
        width: 340,
        minHeight: 480,
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
            top: layout.spacingUnit * 1.5,
            right: layout.spacingUnit * 1.5,
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
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: colors.primary,
            backgroundColor: `${colors.primary}12`,
            padding: '2px 8px',
            borderRadius: layout.radii.small,
            display: 'inline-block',
            marginBottom: 6,
          }}
        >
          {t.kioskTitle}
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>
          {props.restaurantName}
        </div>
        <div style={{ fontSize: 12, color: colors.text.muted, marginTop: 4 }}>
          {props.branchName} • {props.sectionName}
        </div>
      </div>

      {/* Live Queue Pulse Banner */}
      <div
        style={{
          margin: `${layout.spacingUnit * 1.5}px 0`,
          padding: `${layout.spacingUnit * 1.5}px`,
          borderRadius: layout.radii.medium,
          backgroundColor: `${colors.accent}10`,
          border: `1px solid ${colors.accent}30`,
          display: 'flex',
          justifyContent: 'space-around',
          textAlign: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: colors.accent }}>
            {props.currentQueueLength}
          </div>
          <div style={{ fontSize: 11, color: colors.text.muted }}>
            {t.partiesInLine}
          </div>
        </div>
        <div style={{ width: 1, backgroundColor: `${colors.accent}30` }} />
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: colors.accent }}>
            {`~${props.averageWaitMinutes} ${t.mins}`}
          </div>
          <div style={{ fontSize: 11, color: colors.text.muted }}>
            {t.avgWait}
          </div>
        </div>
      </div>

      {/* Party Size Selector Simulation */}
      <div>
        <label style={{ fontSize: 11, fontWeight: 600, color: colors.text.muted, display: 'block', marginBottom: 6 }}>
          {t.selectPartySize}
        </label>
        <div style={{ display: 'flex', gap: 6 }}>
          {partyOptions.map((num) => {
            const isSelected = num === props.selectedPartySize;
            return (
              <div
                key={num}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  textAlign: 'center',
                  borderRadius: layout.radii.small,
                  fontSize: 13,
                  fontWeight: 700,
                  backgroundColor: isSelected ? colors.primary : colors.surfaceMuted,
                  color: isSelected ? colors.surface : colors.text.primary,
                  border: `1px solid ${isSelected ? colors.primary : colors.border}`,
                }}
              >
                {num}
              </div>
            );
          })}
        </div>
      </div>

      {/* Inputs Simulation */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: layout.spacingUnit, marginTop: layout.spacingUnit }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: colors.text.muted, display: 'block', marginBottom: 4 }}>
            {t.yourName}
          </label>
          <div
            style={{
              padding: `${layout.spacingUnit}px ${layout.spacingUnit * 1.5}px`,
              borderRadius: layout.radii.small,
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.surfaceMuted,
              fontSize: 13,
              fontWeight: 500,
              color: colors.text.primary,
            }}
          >
            {guestName}
          </div>
        </div>

        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: colors.text.muted, display: 'block', marginBottom: 4 }}>
            {t.mobileNumber}
          </label>
          <div
            style={{
              padding: `${layout.spacingUnit}px ${layout.spacingUnit * 1.5}px`,
              borderRadius: layout.radii.small,
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.surfaceMuted,
              fontSize: 13,
              fontWeight: 500,
              color: colors.text.primary,
            }}
          >
            {mobile}
          </div>
        </div>
      </div>

      {/* Action Button & Footer */}
      <div style={{ marginTop: layout.spacingUnit * 1.5 }}>
        <div
          style={{
            backgroundColor: colors.primary,
            color: colors.surface,
            padding: `${layout.spacingUnit * 1.5}px`,
            borderRadius: layout.radii.medium,
            textAlign: 'center',
            fontWeight: 700,
            fontSize: 14,
            boxShadow: `0 4px 12px ${colors.primary}33`,
          }}
        >
          {t.getTokenButton} →
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
