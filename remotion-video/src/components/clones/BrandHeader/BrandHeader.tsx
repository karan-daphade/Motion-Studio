// Cloned from frontend/components/brand/brand-header.tsx
import { useCurrentFrame } from 'remotion';
import { useTheme } from '../../../theme';
import { BrandHeaderPropsSchema, type BrandHeaderProps } from './BrandHeader.schema';

const I18N = {
  en: {
    branchPrefix: 'Branch:',
    roleHub: 'Role Hub',
    notifications: 'Notifications',
  },
  hi: {
    branchPrefix: 'शाखा:',
    roleHub: 'भूमिका हब',
    notifications: 'सूचनाएं',
  },
  mr: {
    branchPrefix: 'शाखा:',
    roleHub: 'भूमिका केंद्र',
    notifications: 'सूचना',
  },
};

export const BrandHeader: React.FC<BrandHeaderProps> = (rawProps) => {
  const props = BrandHeaderPropsSchema.parse(rawProps);
  const { colors, layout, fontFamily } = useTheme();
  const remotionFrame = useCurrentFrame();
  const frame = props.frame ?? remotionFrame;

  const locale = props.locale || 'en';
  const t = I18N[locale];

  const pulseOpacity = 0.5 + 0.5 * Math.sin(frame * 0.15);
  const displayName = props.userName?.trim() || props.userEmail.split('@')[0];

  return (
    <header
      style={{
        width: '100%',
        height: '64px',
        backgroundColor: colors.surface,
        borderBottom: `1px solid ${colors.border}`,
        boxShadow: layout.shadows,
        fontFamily,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        boxSizing: 'border-box',
      }}
    >
      {/* Brand logo & branch info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              height: '36px',
              width: '36px',
              borderRadius: layout.radii.medium,
              backgroundColor: colors.primary,
              color: colors.surface,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 16,
              boxShadow: layout.shadows,
            }}
          >
            🍴
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: colors.secondary,
                letterSpacing: '-0.02em',
              }}
            >
              {props.appName}
            </span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '2px 8px',
                borderRadius: layout.radii.full,
                backgroundColor: colors.surfaceMuted,
                color: colors.primary,
                border: `1px solid ${colors.border}`,
              }}
            >
              {props.roleName}
            </span>
          </div>
        </div>

        {props.currentBranch && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: layout.radii.medium,
              backgroundColor: colors.surfaceMuted,
              padding: '4px 10px',
              fontSize: 12,
              color: colors.text.muted,
              border: `1px solid ${colors.border}`,
            }}
          >
            <span
              style={{
                height: '6px',
                width: '6px',
                borderRadius: layout.radii.full,
                backgroundColor: colors.status.ready,
                opacity: pulseOpacity,
              }}
            />
            <span>
              {`${t.branchPrefix} `}
              <strong style={{ color: colors.text.primary }}>{props.currentBranch}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Right nav & profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {props.showBackToHub && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: layout.radii.medium,
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.surface,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 500,
              color: colors.text.muted,
            }}
          >
            <span>&larr;</span>
            <span>{t.roleHub}</span>
          </div>
        )}

        {props.hasActiveBranch && (
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '32px',
              width: '32px',
              borderRadius: layout.radii.medium,
              backgroundColor: colors.surfaceMuted,
              color: colors.text.muted,
              fontSize: '14px',
            }}
          >
            <span>🔔</span>
            {props.notificationCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  height: '6px',
                  width: '6px',
                  borderRadius: layout.radii.full,
                  backgroundColor: colors.primary,
                }}
              />
            )}
          </div>
        )}

        <div
          style={{
            height: '20px',
            width: '1px',
            backgroundColor: colors.border,
          }}
        />

        {/* User profile capsule */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            borderRadius: layout.radii.medium,
            padding: '4px 8px',
            backgroundColor: colors.surfaceMuted,
            border: `1px solid ${colors.border}`,
          }}
        >
          <div
            style={{
              height: '30px',
              width: '30px',
              borderRadius: layout.radii.full,
              backgroundColor: colors.primary,
              color: colors.surface,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: colors.secondary,
                maxWidth: '120px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {displayName}
            </span>
            <span
              style={{
                fontSize: 10,
                color: colors.text.muted,
              }}
            >
              {props.roleName}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
