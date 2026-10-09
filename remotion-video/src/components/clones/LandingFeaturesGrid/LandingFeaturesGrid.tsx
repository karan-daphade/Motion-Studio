// Cloned from frontend/components/landing/features-grid.tsx
import { useCurrentFrame } from 'remotion';
import { useTheme } from '../../../theme';
import { MOCK_LANDING_FEATURES } from '../../../catalog/mock/landing';
import {
  LandingFeaturesGridPropsSchema,
  type LandingFeaturesGridProps,
} from './LandingFeaturesGrid.schema';

const I18N = {
  en: {
    badge: 'Enterprise-Grade POS & Live Operations',
    title: 'Engineered Specifically for High-Velocity Hospitality',
    description: 'Every feature is modeled after the real-world operational chaos of bustling restaurants, cafes, bars, and hotels.',
    deployText: 'Deploy in your restaurant',
  },
  hi: {
    badge: 'एंटरप्राइज पीओएस और लाइव संचालन',
    title: 'उच्च गति वाले आतिथ्य सत्कार के लिए विशेष रूप से डिज़ाइन किया गया',
    description: 'प्रत्येक सुविधा व्यस्त रेस्तरां, कैफे, बार और होटलों की वास्तविक संचालन आवश्यकताओं के अनुसार बनाई गई है।',
    deployText: 'अपने रेस्तरां में शुरू करें',
  },
  mr: {
    badge: 'एंटरप्राइज पीओएस आणि थेट कामकाज',
    title: 'हॉस्पिटॅलिटी व्यवसायासाठी खास तयार केलेली प्रणाली',
    description: 'प्रत्येक वैशिष्ट्य रेस्टॉरंट, कॅफे, बार आणि हॉटेल्सच्या दैनंदिन कामकाजातील आव्हाने लक्षात घेऊन बनवले आहे.',
    deployText: 'तुमच्या रेस्टॉरंटमध्ये लागू करा',
  },
};

const FEATURE_ICONS: Record<string, string> = {
  qr: '📱',
  kds: '👨‍🍳',
  branch: '🏢',
  staff: '👥',
  tax: '🧾',
  security: '🛡️',
};

export const LandingFeaturesGrid: React.FC<LandingFeaturesGridProps> = (rawProps) => {
  const props = LandingFeaturesGridPropsSchema.parse(rawProps);
  const { colors, layout, fontFamily } = useTheme();
  useCurrentFrame();

  const locale = props.locale || 'en';
  const t = I18N[locale];

  const featuresList =
    props.features || MOCK_LANDING_FEATURES[locale] || MOCK_LANDING_FEATURES.en;
  const sectionBadge = props.badge || t.badge;
  const sectionTitle = props.title || t.title;
  const sectionDesc = props.description || t.description;

  return (
    <section
      style={{
        width: '100%',
        backgroundColor: colors.surface,
        borderTop: `1px solid ${colors.border}`,
        borderBottom: `1px solid ${colors.border}`,
        padding: '48px 24px',
        fontFamily,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 36px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              borderRadius: layout.radii.full,
              backgroundColor: colors.surfaceMuted,
              padding: '6px 16px',
              fontSize: 12,
              fontWeight: 700,
              color: colors.primary,
              border: `1px solid ${colors.border}`,
              marginBottom: '14px',
            }}
          >
            <span>{sectionBadge}</span>
          </div>

          <h2
            style={{
              margin: '0 0 12px',
              fontSize: 26,
              fontWeight: 800,
              color: colors.secondary,
              letterSpacing: '-0.02em',
              lineHeight: 1.25,
            }}
          >
            {sectionTitle}
          </h2>

          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: colors.text.muted,
              lineHeight: 1.6,
            }}
          >
            {sectionDesc}
          </p>
        </div>

        {/* 6 Features Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: '20px',
          }}
        >
          {featuresList.map((item) => {
            const icon = FEATURE_ICONS[item.id] || '⚡';
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: layout.radii.large,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surfaceMuted,
                  padding: '24px',
                  boxShadow: layout.shadows,
                  boxSizing: 'border-box',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '16px',
                    }}
                  >
                    <div
                      style={{
                        height: '44px',
                        width: '44px',
                        borderRadius: layout.radii.medium,
                        backgroundColor: colors.surface,
                        border: `1px solid ${colors.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                      }}
                    >
                      {icon}
                    </div>
                    <span
                      style={{
                        borderRadius: layout.radii.full,
                        backgroundColor: colors.surface,
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: colors.text.muted,
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      {item.badge}
                    </span>
                  </div>

                  <h3
                    style={{
                      margin: '0 0 10px',
                      fontSize: 16,
                      fontWeight: 700,
                      color: colors.secondary,
                    }}
                  >
                    {item.title}
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      color: colors.text.muted,
                      lineHeight: 1.5,
                    }}
                  >
                    {item.description}
                  </p>
                </div>

                <div
                  style={{
                    marginTop: '20px',
                    paddingTop: '14px',
                    borderTop: `1px solid ${colors.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: 12,
                    fontWeight: 700,
                    color: colors.primary,
                  }}
                >
                  <span>{t.deployText}</span>
                  <span>&rarr;</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
