// Sourced from frontend/app/session/join/join-session-client.tsx
// Pure Remotion Component: JoinSession (UI-01, LOC-02)

import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { useTheme } from '../../../theme/useTheme';
import { JoinSessionProps, JoinSessionPropsSchema } from './JoinSession.schema';

const STRINGS = {
  en: {
    groupDining: 'Collaborative Dining',
    joinPrompt: 'Join Table Session',
    dinersTogether: 'diners currently ordering',
    activeFor: 'Active for',
    yourName: 'Your Name',
    mobileNumber: 'Mobile Number',
    joinButton: 'Join Group Session',
    syncNotice: 'Live cart & order sync enabled',
    comingSoon: 'Coming soon',
    poweredBy: 'Multi-Device Ordering • BharatQR',
  },
  hi: {
    groupDining: 'सहयोगी डाइनिंग',
    joinPrompt: 'टेबल सत्र में शामिल हों',
    dinersTogether: 'अतिथि वर्तमान में ऑर्डर कर रहे हैं',
    activeFor: 'सक्रिय अवधि',
    yourName: 'आपका नाम',
    mobileNumber: 'मोबाइल नंबर',
    joinButton: 'ग्रुप सत्र में शामिल हों',
    syncNotice: 'लाइव कार्ट और ऑर्डर सिंक सक्रिय',
    comingSoon: 'जल्द आ रहा है',
    poweredBy: 'मल्टी-डिवाइस ऑर्डरिंग • भारतक्यूआर',
  },
  mr: {
    groupDining: 'सहयोगी जेवण',
    joinPrompt: 'टेबल सत्रात सामील व्हा',
    dinersTogether: 'पाहुणे सध्या ऑर्डर करत आहेत',
    activeFor: 'सुरू वेळ',
    yourName: 'आपले नाव',
    mobileNumber: 'मोबाइल नंबर',
    joinButton: 'ग्रुप सत्रात सामील व्हा',
    syncNotice: 'थेट कार्ट आणि ऑर्डर समन्वय सक्रिय',
    comingSoon: 'लवकरच येत आहे',
    poweredBy: 'मल्टी-डिव्हाइस ऑर्डरिंग • भारतक्यूआर',
  },
};

export const JoinSession: React.FC<JoinSessionProps> = (rawProps) => {
  const props = JoinSessionPropsSchema.parse(rawProps);
  const remotionFrame = useCurrentFrame();
  const frame = props.frame ?? remotionFrame;
  const { colors, layout, fontFamily } = useTheme();

  const t = STRINGS[props.locale] || STRINGS.en;

  // Entrance scale and opacity
  const progress = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const eased = 1 - Math.pow(1 - progress, 3);

  const guestName = props.guestNameMock || 'Aarav Deshmukh';
  const mobile = props.mobileNumberMock || '+91 98765 43210';

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
            marginBottom: 8,
          }}
        >
          {t.groupDining}
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>
          {props.restaurantName}
        </div>
        <div style={{ fontSize: 12, color: colors.text.muted, marginTop: 4 }}>
          {props.branchName}
        </div>
      </div>

      {/* Session Highlight Card */}
      <div
        style={{
          margin: `${layout.spacingUnit * 1.5}px 0`,
          padding: layout.spacingUnit * 2,
          borderRadius: layout.radii.medium,
          backgroundColor: `${colors.primary}08`,
          border: `1px solid ${colors.primary}30`,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 800, color: colors.text.primary }}>
          {props.tableLabel}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: colors.primary, marginTop: 4 }}>
          {props.currentDinersCount} {t.dinersTogether}
        </div>
        <div style={{ fontSize: 11, color: colors.text.muted, marginTop: 4 }}>
          ⏱ {t.activeFor} {props.existingSessionDuration}
        </div>
      </div>

      {/* Form Fields Simulation */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: layout.spacingUnit * 1.5 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: colors.text.muted, display: 'block', marginBottom: 4 }}>
            {t.yourName}
          </label>
          <div
            style={{
              padding: `${layout.spacingUnit * 1.2}px ${layout.spacingUnit * 1.5}px`,
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
              padding: `${layout.spacingUnit * 1.2}px ${layout.spacingUnit * 1.5}px`,
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

      {/* Action Button & Sync Notice */}
      <div style={{ marginTop: layout.spacingUnit * 2 }}>
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
          {t.joinButton} →
        </div>

        <div
          style={{
            textAlign: 'center',
            fontSize: 11,
            color: colors.secondary,
            fontWeight: 600,
            marginTop: layout.spacingUnit,
          }}
        >
          ✓ {t.syncNotice}
        </div>

        <div
          style={{
            textAlign: 'center',
            fontSize: 11,
            color: colors.text.muted,
            marginTop: 6,
          }}
        >
          {t.poweredBy}
        </div>
      </div>
    </div>
  );
};
