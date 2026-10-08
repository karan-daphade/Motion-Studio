// Sourced from frontend/components/operations/TableCard.tsx
// Pure Remotion Component: TableCard (UI-01, UI-05)

import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { useTheme } from '../../../theme/useTheme';
import { formatIndianNumber } from '../../../engine/charts/format';
import { TableCardProps, TableCardPropsSchema } from './TableCard.schema';

const STRINGS = {
  en: {
    vacant: 'Vacant',
    assigned: 'Assigned',
    occupied: 'Occupied',
    reserved: 'Reserved',
    guests: 'guests',
    preparing: 'prep',
    ready: 'ready',
    due: 'Due',
    total: 'Total',
    comingSoon: 'Coming soon',
    table: 'Table',
  },
  hi: {
    vacant: 'खाली',
    assigned: 'सौंपा गया',
    occupied: 'व्यस्त',
    reserved: 'आरक्षित',
    guests: 'अतिथि',
    preparing: 'तैयारी',
    ready: 'तैयार',
    due: 'बाकी',
    total: 'कुल',
    comingSoon: 'जल्द आ रहा है',
    table: 'टेबल',
  },
  mr: {
    vacant: 'रिक्त',
    assigned: 'नियुक्त',
    occupied: 'व्यस्त',
    reserved: 'राखीव',
    guests: 'पाहुणे',
    preparing: 'तयारी',
    ready: 'तयार',
    due: 'थकबाकी',
    total: 'एकूण',
    comingSoon: 'लवकरच येत आहे',
    table: 'टेबल',
  },
};

export const TableCard: React.FC<TableCardProps> = (rawProps) => {
  const props = TableCardPropsSchema.parse(rawProps);
  const remotionFrame = useCurrentFrame();
  const frame = props.frame ?? remotionFrame;
  const { colors, layout, fontFamily } = useTheme();

  const t = STRINGS[props.locale] || STRINGS.en;
  const tableLabel = props.shortCode || `${t.table} ${props.tableNumber}`;

  // Pulse animation for assigned state (pure mathematical oscillation, 30 frames cycle)
  const pulseOpacity = interpolate(
    frame % 30,
    [0, 15, 30],
    [0.7, 1.0, 0.7],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const getStatusColor = () => {
    switch (props.status) {
      case 'vacant':
        return colors.secondary;
      case 'assigned':
        return colors.primary;
      case 'occupied':
        return colors.primary;
      case 'reserved':
        return colors.accent;
    }
  };

  const statusColor = getStatusColor();

  return (
    <div
      style={{
        position: 'relative',
        backgroundColor: colors.surface,
        borderRadius: layout.radii.medium,
        borderWidth: props.status === 'assigned' ? 2 : 1,
        borderStyle: 'solid',
        borderColor: props.status === 'assigned' ? statusColor : colors.border,
        padding: layout.spacingUnit * 2,
        boxShadow: layout.shadows,
        width: 320,
        minHeight: 180,
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

      {/* Header: Table Label, Section, Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>
            {tableLabel}
          </div>
          <div style={{ fontSize: 12, color: colors.text.muted, marginTop: 2 }}>
            {props.section} • {props.capacity} {t.guests}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: `${layout.spacingUnit * 0.5}px ${layout.spacingUnit}px`,
            borderRadius: layout.radii.small,
            backgroundColor: `${statusColor}18`,
            color: statusColor,
            fontSize: 11,
            fontWeight: 600,
            opacity: props.status === 'assigned' ? pulseOpacity : 1,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: statusColor,
              display: 'inline-block',
            }}
          />
          {t[props.status]}
        </div>
      </div>

      {/* Body: State-specific content */}
      <div style={{ margin: `${layout.spacingUnit * 1.5}px 0` }}>
        {props.status === 'assigned' && props.assignedGuest && (
          <div
            style={{
              backgroundColor: `${colors.primary}0D`,
              borderRadius: layout.radii.medium,
              padding: layout.spacingUnit * 1.5,
              border: `1px dashed ${colors.primary}40`,
            }}
          >
            <div style={{ fontSize: 11, color: colors.text.muted }}>
              Token #{props.assignedGuest.token}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>
              {props.assignedGuest.name}
            </div>
            <div style={{ fontSize: 12, color: colors.text.muted, marginTop: 2 }}>
              {props.assignedGuest.guestCount} {t.guests}
            </div>
          </div>
        )}

        {props.status === 'occupied' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {props.orderSummary && (
                  <>
                    <span
                      style={{
                        fontSize: 11,
                        padding: '2px 6px',
                        borderRadius: 4,
                        backgroundColor: `${colors.accent}20`,
                        color: colors.accent,
                        fontWeight: 600,
                      }}
                    >
                      {props.orderSummary.preparingCount} {t.preparing}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        padding: '2px 6px',
                        borderRadius: 4,
                        backgroundColor: `${colors.secondary}20`,
                        color: colors.secondary,
                        fontWeight: 600,
                      }}
                    >
                      {props.orderSummary.readyCount} {t.ready}
                    </span>
                  </>
                )}
              </div>
              {props.durationText && (
                <div style={{ fontSize: 12, color: colors.text.muted, fontWeight: 500 }}>
                  ⏱ {props.durationText}
                </div>
              )}
            </div>

            {props.bill && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginTop: layout.spacingUnit * 1.5,
                  paddingTop: layout.spacingUnit,
                  borderTop: `1px solid ${colors.border}`,
                }}
              >
                <div style={{ fontSize: 12, color: colors.text.muted }}>
                  {t.due}: ₹{formatIndianNumber(props.bill.dueAmount)}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: colors.text.primary }}>
                  ₹{formatIndianNumber(props.bill.totalAmount)}
                </div>
              </div>
            )}
          </div>
        )}

        {props.status === 'vacant' && (
          <div
            style={{
              padding: layout.spacingUnit * 1.5,
              textAlign: 'center',
              color: colors.text.muted,
              fontSize: 13,
            }}
          >
            ✓ Ready for next seating
          </div>
        )}

        {props.status === 'reserved' && (
          <div
            style={{
              padding: layout.spacingUnit * 1.5,
              textAlign: 'center',
              color: colors.accent,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Reserved table
          </div>
        )}
      </div>

      {/* Footer info: Devices active */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 11,
          color: colors.text.muted,
          borderTop: `1px solid ${colors.border}`,
          paddingTop: layout.spacingUnit,
        }}
      >
        <span>
          {props.deviceCount ? `📱 ${props.deviceCount} devices connected` : 'Single order'}
        </span>
        <span>ID: {props.tableNumber}</span>
      </div>
    </div>
  );
};
