// Cloned from frontend/components/landing/hero-visual.tsx
import { useCurrentFrame } from 'remotion';
import { useTheme } from '../../../theme';
import { MOCK_HERO_VISUAL } from '../../../catalog/mock/landing';
import {
  LandingHeroVisualPropsSchema,
  type LandingHeroVisualProps,
} from './LandingHeroVisual.schema';

const I18N = {
  en: {
    terminalUrl: 'operations.live/kds',
    kdsActive: 'Realtime KDS Active',
    activeSession: 'Active Session',
    guestsOrder: (count: number) => `Guest QR Ordering • ${count} Guests`,
    runningBill: 'Running Bill',
    mainKitchen: 'Main Kitchen',
    station1: 'Station 1',
    beverageCounter: 'Beverage Counter',
    station2: 'Station 2',
    preparing: 'Preparing',
    prep: 'Prep',
    ready: 'Ready',
    served: 'Served',
    avgTurnaround: (mins: number) => `Avg order turnaround: ${mins} mins`,
    zeroDelay: 'Zero Waiter Delay',
  },
  hi: {
    terminalUrl: 'operations.live/kds',
    kdsActive: 'लाइव केडीएस सक्रिय',
    activeSession: 'सक्रिय सत्र',
    guestsOrder: (count: number) => `क्यूआर ऑर्डरिंग • ${count} अतिथि`,
    runningBill: 'वर्तमान बिल',
    mainKitchen: 'मुख्य रसोई',
    station1: 'स्टेशन 1',
    beverageCounter: 'पेय काउंटर',
    station2: 'स्टेशन 2',
    preparing: 'तैयारी जारी',
    prep: 'तैयारी',
    ready: 'तैयार',
    served: 'परोसा गया',
    avgTurnaround: (mins: number) => `औसत डिलीवरी समय: ${mins} मिनट`,
    zeroDelay: 'शून्य प्रतीक्षा समय',
  },
  mr: {
    terminalUrl: 'operations.live/kds',
    kdsActive: 'थेट केडीएस सक्रिय',
    activeSession: 'सक्रिय सत्र',
    guestsOrder: (count: number) => `क्यूआर ऑर्डरिंग • ${count} ग्राहक`,
    runningBill: 'चालू बिल',
    mainKitchen: 'मुख्य स्वयंपाकघर',
    station1: 'स्टेशन 1',
    beverageCounter: 'पेय विभाग',
    station2: 'स्टेशन 2',
    preparing: 'तयारी सुरू',
    prep: 'तयारी',
    ready: 'तयार',
    served: 'दिले गेले',
    avgTurnaround: (mins: number) => `सरासरी वेळ: ${mins} मिनिटे`,
    zeroDelay: 'शून्य विलंब',
  },
};

export const LandingHeroVisual: React.FC<LandingHeroVisualProps> = (rawProps) => {
  const props = LandingHeroVisualPropsSchema.parse(rawProps);
  const { colors, layout, fontFamily } = useTheme();
  const remotionFrame = useCurrentFrame();
  const frame = props.frame ?? remotionFrame;

  const locale = props.locale || 'en';
  const t = I18N[locale];

  const defaultMock = MOCK_HERO_VISUAL[locale] || MOCK_HERO_VISUAL.en;
  const mainItems = props.mainKitchenItems || defaultMock.mainKitchenItems;
  const bevItems = props.beverageItems || defaultMock.beverageItems;

  const pulseOpacity = 0.5 + 0.5 * Math.sin(frame * 0.15);

  const formatStatus = (st: string) => {
    switch (st) {
      case 'preparing':
        return t.preparing;
      case 'prep':
        return t.prep;
      case 'ready':
        return t.ready;
      case 'served':
        return t.served;
      default:
        return st;
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '720px',
        margin: '0 auto',
        fontFamily,
        boxSizing: 'border-box',
      }}
    >
      {/* Main Terminal Mockup Window */}
      <div
        style={{
          borderRadius: layout.radii.large,
          border: `1px solid ${colors.border}`,
          backgroundColor: colors.surface,
          padding: '24px',
          boxShadow: layout.shadows,
        }}
      >
        {/* Mock Window Titlebar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: `1px solid ${colors.border}`,
            paddingBottom: '14px',
            marginBottom: '18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                height: '10px',
                width: '10px',
                borderRadius: layout.radii.full,
                backgroundColor: colors.status.cancelled,
              }}
            />
            <span
              style={{
                height: '10px',
                width: '10px',
                borderRadius: layout.radii.full,
                backgroundColor: colors.status.pending,
              }}
            />
            <span
              style={{
                height: '10px',
                width: '10px',
                borderRadius: layout.radii.full,
                backgroundColor: colors.status.ready,
              }}
            />
            <span
              style={{
                marginLeft: '8px',
                fontFamily,
                fontSize: 12,
                color: colors.text.muted,
              }}
            >
              {t.terminalUrl}
            </span>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: layout.radii.full,
              backgroundColor: colors.surfaceMuted,
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 700,
              color: colors.status.ready,
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
            <span>{t.kdsActive}</span>
          </div>
        </div>

        {/* Live Order Card Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderRadius: layout.radii.medium,
            backgroundColor: colors.surfaceMuted,
            padding: '14px',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                height: '40px',
                width: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: layout.radii.medium,
                backgroundColor: colors.surface,
                color: colors.primary,
                fontWeight: 700,
                fontSize: 14,
                border: `1px solid ${colors.border}`,
              }}
            >
              {props.tableCode}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontWeight: 700,
                    color: colors.secondary,
                    fontSize: 14,
                  }}
                >
                  {props.tableName}
                </span>
                <span
                  style={{
                    borderRadius: layout.radii.full,
                    backgroundColor: colors.surface,
                    padding: '2px 8px',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: colors.status.pending,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  {t.activeSession}
                </span>
              </div>
              <span
                style={{
                  fontSize: 12,
                  color: colors.text.muted,
                }}
              >
                {t.guestsOrder(props.guestCount)}
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span
              style={{
                fontSize: 12,
                color: colors.text.muted,
              }}
            >
              {t.runningBill}
            </span>
            <p
              style={{
                margin: '2px 0 0',
                fontWeight: 700,
                color: colors.secondary,
                fontSize: 16,
              }}
            >
              {`₹${props.runningBill.toLocaleString('en-IN')}`}
            </p>
          </div>
        </div>

        {/* Kitchen Routing Stream Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          {/* Main Kitchen Ticket */}
          <div
            style={{
              borderRadius: layout.radii.medium,
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.surface,
              padding: '14px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
                paddingBottom: '8px',
                borderBottom: `1px solid ${colors.border}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 700,
                  fontSize: 12,
                  color: colors.secondary,
                }}
              >
                <span>👨‍🍳</span>
                <span>{t.mainKitchen}</span>
              </div>
              <span
                style={{
                  fontSize: '10px',
                  color: colors.text.muted,
                }}
              >
                {t.station1}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {mainItems.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontWeight: 700,
                        color: colors.primary,
                      }}
                    >
                      {`${item.qty}x`}
                    </span>
                    <span style={{ color: colors.text.primary }}>{item.name}</span>
                  </div>
                  <span
                    style={{
                      borderRadius: layout.radii.small,
                      padding: '2px 6px',
                      fontSize: '10px',
                      fontWeight: 700,
                      backgroundColor: colors.surfaceMuted,
                      color:
                        item.status === 'ready' ? colors.status.ready : colors.primary,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    {formatStatus(item.status)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Beverage Ticket */}
          <div
            style={{
              borderRadius: layout.radii.medium,
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.surface,
              padding: '14px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
                paddingBottom: '8px',
                borderBottom: `1px solid ${colors.border}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 700,
                  fontSize: 12,
                  color: colors.secondary,
                }}
              >
                <span>🍹</span>
                <span>{t.beverageCounter}</span>
              </div>
              <span
                style={{
                  fontSize: '10px',
                  color: colors.text.muted,
                }}
              >
                {t.station2}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {bevItems.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontWeight: 700,
                        color: colors.status.ready,
                      }}
                    >
                      {`${item.qty}x`}
                    </span>
                    <span style={{ color: colors.text.primary }}>{item.name}</span>
                  </div>
                  <span
                    style={{
                      borderRadius: layout.radii.small,
                      padding: '2px 6px',
                      fontSize: '10px',
                      fontWeight: 700,
                      backgroundColor: colors.surfaceMuted,
                      color:
                        item.status === 'served' ? colors.status.ready : colors.status.pending,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    {formatStatus(item.status)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '12px',
            borderTop: `1px solid ${colors.border}`,
            fontSize: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '24px',
                width: '24px',
                borderRadius: layout.radii.small,
                backgroundColor: colors.surfaceMuted,
                color: colors.status.ready,
              }}
            >
              📈
            </span>
            <span style={{ color: colors.text.muted }}>
              {t.avgTurnaround(props.avgTurnaroundMins)}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: colors.primary,
              fontWeight: 700,
            }}
          >
            <span>📱</span>
            <span>{t.zeroDelay}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
