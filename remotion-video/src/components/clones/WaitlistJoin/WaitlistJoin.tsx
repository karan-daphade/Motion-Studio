// Sourced from frontend/components/waitlist/waitlist-join-client.tsx
// Pure Remotion Component: WaitlistJoin (UI-01, LOC-02)

import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { useTheme } from '../../../theme/useTheme';
import { WaitlistJoinProps, WaitlistJoinPropsSchema } from './WaitlistJoin.schema';

const STRINGS = {
  en: {
    digitalTicket: 'Digital Queue Ticket',
    waitingTitle: 'Waiting in Queue',
    readyTitle: 'Your Table is Ready!',
    readySub: 'Please proceed to your table now.',
    position: 'Position',
    partiesAhead: 'Parties Ahead',
    estWait: 'Est. Wait',
    mins: 'mins',
    guests: 'guests',
    assignedTable: 'Assigned Table',
    proceedToTable: 'Proceed to Table',
    comingSoon: 'Coming soon',
    poweredBy: 'Live Waitlist • BharatQR',
  },
  hi: {
    digitalTicket: 'डिजिटल कतार टिकट',
    waitingTitle: 'कतार में प्रतीक्षा जारी',
    readyTitle: 'आपकी टेबल तैयार है!',
    readySub: 'कृपया अब अपनी टेबल पर जाएं।',
    position: 'स्थान',
    partiesAhead: 'आगे कतार',
    estWait: 'अनुमानित समय',
    mins: 'मिनट',
    guests: 'अतिथि',
    assignedTable: 'आवंटित टेबल',
    proceedToTable: 'टेबल पर जाएं',
    comingSoon: 'जल्द आ रहा है',
    poweredBy: 'लाइव प्रतीक्षा सूची • भारतक्यूआर',
  },
  mr: {
    digitalTicket: 'डिजिटल रांग तिकीट',
    waitingTitle: 'रांगेत प्रतीक्षा सुरू',
    readyTitle: 'आपले टेबल तयार आहे!',
    readySub: 'कृपया आता आपल्या टेबलवर जा.',
    position: 'क्रमांक',
    partiesAhead: 'पुढील ग्राहक',
    estWait: 'अंदाजे वेळ',
    mins: 'मि',
    guests: 'पाहुणे',
    assignedTable: 'नियुक्त टेबल',
    proceedToTable: 'टेबलकडे चला',
    comingSoon: 'लवकरच येत आहे',
    poweredBy: 'थेट प्रतीक्षा यादी • भारतक्यूआर',
  },
};

export const WaitlistJoin: React.FC<WaitlistJoinProps> = (rawProps) => {
  const props = WaitlistJoinPropsSchema.parse(rawProps);
  const remotionFrame = useCurrentFrame();
  const frame = props.frame ?? remotionFrame;
  const { colors, layout, fontFamily } = useTheme();

  const t = STRINGS[props.locale] || STRINGS.en;
  const isReady = props.status === 'TABLE_ASSIGNED';

  // Ready pulse animation (30 frames cycle)
  const pulseScale = interpolate(
    frame % 30,
    [0, 15, 30],
    [1, 1.03, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const cardBorderColor = isReady ? colors.secondary : colors.border;

  return (
    <div
      style={{
        position: 'relative',
        backgroundColor: colors.surface,
        borderRadius: layout.radii.large,
        border: `1.5px solid ${cardBorderColor}`,
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
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: colors.primary,
            marginBottom: 4,
          }}
        >
          {t.digitalTicket}
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>
          {props.restaurantName}
        </div>
        <div style={{ fontSize: 12, color: colors.text.muted, marginTop: 4 }}>
          {props.branchName} • {props.sectionName}
        </div>
      </div>

      {/* Ticket Centerpiece */}
      <div
        style={{
          margin: `${layout.spacingUnit * 2}px 0`,
          padding: layout.spacingUnit * 2.5,
          borderRadius: layout.radii.medium,
          backgroundColor: isReady ? `${colors.secondary}10` : `${colors.primary}08`,
          border: `1px dashed ${isReady ? colors.secondary : colors.primary}60`,
          textAlign: 'center',
          transform: isReady ? `scale(${pulseScale})` : undefined,
        }}
      >
        <div style={{ fontSize: 12, color: colors.text.muted, fontWeight: 600 }}>
          TOKEN NUMBER
        </div>
        <div
          style={{
            fontSize: 34,
            fontWeight: 800,
            letterSpacing: '0.05em',
            color: isReady ? colors.secondary : colors.primary,
            marginTop: 4,
          }}
        >
          {props.tokenNumber}
        </div>

        <div style={{ fontSize: 14, fontWeight: 600, marginTop: 6 }}>
          {props.guestName}
        </div>
        <div style={{ fontSize: 12, color: colors.text.muted }}>
          {props.partySize} {t.guests}
        </div>

        {isReady && props.assignedTableLabel && (
          <div
            style={{
              marginTop: layout.spacingUnit * 1.5,
              padding: `${layout.spacingUnit}px`,
              borderRadius: layout.radii.small,
              backgroundColor: colors.secondary,
              color: colors.surface,
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            ✓ {t.readyTitle}
            <div style={{ fontSize: 12, fontWeight: 500, marginTop: 2 }}>
              {t.assignedTable}: {props.assignedTableLabel}
            </div>
          </div>
        )}
      </div>

      {/* Queue Stats Row */}
      {!isReady && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: layout.spacingUnit,
            padding: `${layout.spacingUnit * 1.5}px 0`,
            borderTop: `1px solid ${colors.border}`,
            borderBottom: `1px solid ${colors.border}`,
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: colors.text.muted }}>{t.position}</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>
              {`#${props.position}`}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: colors.text.muted }}>{t.partiesAhead}</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>
              {props.partiesAhead}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: colors.text.muted }}>{t.estWait}</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>
              {props.estimatedWaitMinutes} {t.mins}
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div style={{ marginTop: layout.spacingUnit * 1.5 }}>
        {isReady ? (
          <div
            style={{
              backgroundColor: colors.secondary,
              color: colors.surface,
              padding: `${layout.spacingUnit * 1.5}px`,
              borderRadius: layout.radii.medium,
              textAlign: 'center',
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            {t.proceedToTable} →
          </div>
        ) : (
          <div
            style={{
              backgroundColor: `${colors.primary}12`,
              color: colors.primary,
              padding: `${layout.spacingUnit}px`,
              borderRadius: layout.radii.small,
              textAlign: 'center',
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            🔔 We will notify you when table is ready
          </div>
        )}

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
