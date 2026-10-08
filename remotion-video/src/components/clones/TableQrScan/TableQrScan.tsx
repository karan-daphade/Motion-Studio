// Sourced from frontend/components/waitlist/table-qr-scan-client.tsx
// Pure Remotion Component: TableQrScan (UI-01, LOC-02)

import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { useTheme } from '../../../theme/useTheme';
import { TableQrScanProps, TableQrScanPropsSchema } from './TableQrScan.schema';

const STRINGS = {
  en: {
    availableTitle: 'Table Available',
    availableSub: 'Scan verified. Start your dining experience.',
    occupiedTitle: 'Table Occupied',
    occupiedSub: 'A session is active on this table.',
    heldTitle: 'Table Reserved',
    heldSub: 'This table is held for an upcoming party.',
    startOrder: 'Start Ordering',
    joinSession: 'Join Dining Session',
    callCaptain: 'Call Captain',
    seats: 'seats',
    verifiedQr: 'Official QR Verified',
    comingSoon: 'Coming soon',
    poweredBy: 'Powered by BharatQR Contactless Dining',
  },
  hi: {
    availableTitle: 'टेबल उपलब्ध है',
    availableSub: 'क्यूआर सत्यापित। अपना भोजन शुरू करें।',
    occupiedTitle: 'टेबल व्यस्त है',
    occupiedSub: 'इस टेबल पर सत्र सक्रिय है।',
    heldTitle: 'टेबल आरक्षित है',
    heldSub: 'यह टेबल आगामी पार्टी के लिए रखी गई है।',
    startOrder: 'ऑर्डर शुरू करें',
    joinSession: 'सत्र में शामिल हों',
    callCaptain: 'कैप्टन को बुलाएं',
    seats: 'सीटें',
    verifiedQr: 'सत्यापित क्यूआर',
    comingSoon: 'जल्द आ रहा है',
    poweredBy: 'भारतक्यूआर संपर्क रहित डाइनिंग',
  },
  mr: {
    availableTitle: 'टेबल उपलब्ध आहे',
    availableSub: 'क्यूआर सत्यापित. आपला जेवणाचा अनुभव सुरू करा.',
    occupiedTitle: 'टेबल व्यस्त आहे',
    occupiedSub: 'या टेबलवर सत्र सुरू आहे.',
    heldTitle: 'टेबल राखीव आहे',
    heldSub: 'हे टेबल आरक्षित ठेवले आहे.',
    startOrder: 'ऑर्डर सुरू करा',
    joinSession: 'सत्रात सामील व्हा',
    callCaptain: 'कॅप्टनला बोलवा',
    seats: 'जागा',
    verifiedQr: 'सत्यापित क्यूआर',
    comingSoon: 'लवकरच येत आहे',
    poweredBy: 'भारतक्यूआर कॉन्टॅक्टलेस डायनिंग',
  },
};

export const TableQrScan: React.FC<TableQrScanProps> = (rawProps) => {
  const props = TableQrScanPropsSchema.parse(rawProps);
  const remotionFrame = useCurrentFrame();
  const frame = props.frame ?? remotionFrame;
  const { colors, layout, fontFamily } = useTheme();

  const t = STRINGS[props.locale] || STRINGS.en;

  // Entrance scale/opacity based on frame (0..15 frames)
  const entrance = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const easedEntrance = 1 - Math.pow(1 - entrance, 3);

  const getStatusMeta = () => {
    switch (props.status) {
      case 'AVAILABLE':
        return {
          title: t.availableTitle,
          sub: t.availableSub,
          actionText: t.startOrder,
          color: colors.secondary,
        };
      case 'OCCUPIED':
        return {
          title: t.occupiedTitle,
          sub: props.activeSessionGuestCount
            ? `${props.activeSessionGuestCount} diners active. ${t.occupiedSub}`
            : t.occupiedSub,
          actionText: t.joinSession,
          color: colors.primary,
        };
      case 'HELD':
        return {
          title: t.heldTitle,
          sub: t.heldSub,
          actionText: t.callCaptain,
          color: colors.accent,
        };
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
        opacity: easedEntrance,
        transform: `scale(${0.96 + 0.04 * easedEntrance})`,
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: colors.secondary,
              backgroundColor: `${colors.secondary}14`,
              padding: '2px 8px',
              borderRadius: layout.radii.small,
            }}
          >
            ✓ {t.verifiedQr}
          </span>
        </div>

        <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>
          {props.branchName}
        </div>
        <div style={{ fontSize: 12, color: colors.text.muted, marginTop: 4 }}>
          {props.sectionName} {props.branchCity ? `• ${props.branchCity}` : ''}
        </div>
      </div>

      {/* Hero Table Centerpiece */}
      <div
        style={{
          margin: `${layout.spacingUnit * 2}px 0`,
          padding: layout.spacingUnit * 3,
          borderRadius: layout.radii.medium,
          backgroundColor: `${statusMeta.color}0A`,
          border: `1.5px solid ${statusMeta.color}30`,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 800, color: colors.text.primary }}>
          {props.tableLabel}
        </div>
        <div
          style={{
            display: 'inline-block',
            fontSize: 12,
            fontWeight: 600,
            color: statusMeta.color,
            backgroundColor: `${statusMeta.color}15`,
            padding: '3px 10px',
            borderRadius: layout.radii.small,
            marginTop: 8,
          }}
        >
          {props.seatingCapacity} {t.seats}
        </div>

        <div style={{ marginTop: layout.spacingUnit * 2 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: statusMeta.color }}>
            {statusMeta.title}
          </div>
          <div
            style={{
              fontSize: 12,
              color: colors.text.muted,
              marginTop: 4,
              lineHeight: 1.4,
            }}
          >
            {statusMeta.sub}
          </div>
        </div>
      </div>

      {/* Primary Action Button Preview */}
      <div>
        <div
          style={{
            backgroundColor: statusMeta.color,
            color: colors.surface,
            padding: `${layout.spacingUnit * 1.5}px`,
            borderRadius: layout.radii.medium,
            textAlign: 'center',
            fontWeight: 700,
            fontSize: 14,
            boxShadow: `0 4px 12px ${statusMeta.color}33`,
          }}
        >
          {statusMeta.actionText} →
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
