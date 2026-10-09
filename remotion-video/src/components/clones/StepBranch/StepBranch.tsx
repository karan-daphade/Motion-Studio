// Cloned from frontend/components/onboarding/step-branch.tsx
import { useCurrentFrame } from 'remotion';
import { useTheme } from '../../../theme';
import { StepBranchPropsSchema, type StepBranchProps } from './StepBranch.schema';

const I18N = {
  en: {
    title: 'Step 1: Branch Setup',
    firstBranchTitle: 'Create Your First Branch',
    subtitle: 'Establish the physical identity, location coordinates, manager contact, and GST compliance for this outlet.',
    status: 'Status: Onboarding In Progress',
    outletProfile: 'Outlet Profile',
    branchNameLabel: 'Branch Display Name',
    phoneLabel: 'Outlet Phone Number',
    addressHeader: 'Physical Address & GPS',
    gpsButton: 'GPS Detected',
    addressLabel: 'Street Address',
    cityLabel: 'City',
    stateLabel: 'State',
    pinCodeLabel: 'PIN Code',
    latLngLabel: 'GPS Coordinates',
    managerSection: 'Manager & GST Compliance',
    managerNameLabel: 'Branch Manager Name',
    managerPhoneLabel: 'Manager Mobile',
    gstinLabel: 'GSTIN (Tax Identification)',
    gstinHint: 'Optional. 15-digit alphanumeric format required if issuing B2B GST tax invoices.',
    saveButton: 'Save & Continue to Kitchens',
    savingButton: 'Saving Branch Profile...',
  },
  hi: {
    title: 'चरण 1: शाखा सेटअप',
    firstBranchTitle: 'अपनी पहली शाखा बनाएं',
    subtitle: 'इस आउटलेट के लिए भौतिक पहचान, जीपीएस स्थान, प्रबंधक संपर्क और जीएसटी अनुपालन स्थापित करें।',
    status: 'स्थिति: ऑनबोर्डिंग जारी है',
    outletProfile: 'आउटलेट प्रोफ़ाइल',
    branchNameLabel: 'शाखा का नाम',
    phoneLabel: 'शाखा फोन नंबर',
    addressHeader: 'पता और जीपीएस',
    gpsButton: 'जीपीएस पहचाना गया',
    addressLabel: 'सड़क का पता',
    cityLabel: 'शहर',
    stateLabel: 'राज्य',
    pinCodeLabel: 'पिन कोड',
    latLngLabel: 'जीपीएस निर्देशांक',
    managerSection: 'प्रबंधक और जीएसटी अनुपालन',
    managerNameLabel: 'शाखा प्रबंधक का नाम',
    managerPhoneLabel: 'प्रबंधक मोबाइल',
    gstinLabel: 'जीएसटीआईएन (कर पहचान)',
    gstinHint: 'वैकल्पिक। बी2बी जीएसटी चालान जारी करने के लिए 15-अंकीय प्रारूप आवश्यक है।',
    saveButton: 'सहेजें और रसोई सेटअप पर जाएं',
    savingButton: 'शाखा सहेजी जा रही है...',
  },
  mr: {
    title: 'टप्पा 1: शाखा सेटअप',
    firstBranchTitle: 'तुमची पहिली शाखा तयार करा',
    subtitle: 'या आउटलेटसाठी प्रत्यक्ष पत्ता, जीपीएस स्थान, व्यवस्थापक संपर्क आणि जीएसटी तपशील निश्चित करा.',
    status: 'स्थिती: ऑनबोर्डिंग सुरू आहे',
    outletProfile: 'आउटलेट प्रोफाइल',
    branchNameLabel: 'शाखेचे नाव',
    phoneLabel: 'शाखेचा फोन नंबर',
    addressHeader: 'पत्ता आणि जीपीएस',
    gpsButton: 'जीपीएस शोधले',
    addressLabel: 'रस्त्याचा पत्ता',
    cityLabel: 'शहर',
    stateLabel: 'राज्य',
    pinCodeLabel: 'पिन कोड',
    latLngLabel: 'जीपीएस समन्वय',
    managerSection: 'व्यवस्थापक आणि जीएसटी कायदेशीर बाबी',
    managerNameLabel: 'शाखा व्यवस्थापकाचे नाव',
    managerPhoneLabel: 'व्यवस्थापक मोबाइल',
    gstinLabel: 'जीएसटीआयएन (कर ओळख)',
    gstinHint: 'पर्यायी. बी2बी जीएसटी कर पावती देण्यासाठी 15-अंकी क्रमांक आवश्यक आहे.',
    saveButton: 'जतन करा आणि स्वयंपाकघर सेटअपवर जा',
    savingButton: 'शाखा जतन होत आहे...',
  },
};

export const StepBranch: React.FC<StepBranchProps> = (rawProps) => {
  const props = StepBranchPropsSchema.parse(rawProps);
  const { colors, layout, fontFamily } = useTheme();
  const remotionFrame = useCurrentFrame();
  const frame = props.frame ?? remotionFrame;

  const locale = props.locale || 'en';
  const t = I18N[locale];

  const pulseOpacity = 0.5 + 0.5 * Math.sin(frame * 0.15);

  const latText = props.latitude !== undefined && props.latitude !== null ? props.latitude.toFixed(4) : '12.9716';
  const lngText = props.longitude !== undefined && props.longitude !== null ? props.longitude.toFixed(4) : '77.5946';

  return (
    <div
      style={{
        borderRadius: layout.radii.large,
        border: `1px solid ${colors.border}`,
        backgroundColor: colors.surface,
        padding: '32px',
        boxShadow: layout.shadows,
        fontFamily,
        boxSizing: 'border-box',
        width: '100%',
      }}
    >
      {/* Step Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          borderBottom: `1px solid ${colors.border}`,
          paddingBottom: '20px',
          marginBottom: '24px',
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
              backgroundColor: colors.surfaceMuted,
              color: colors.primary,
              fontSize: '20px',
              fontWeight: 700,
            }}
          >
            🏪
          </div>
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 800,
                color: colors.secondary,
                letterSpacing: '-0.02em',
              }}
            >
              {props.isFirstBranch ? t.firstBranchTitle : t.title}
            </h2>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: 12,
                color: colors.text.muted,
              }}
            >
              {t.subtitle}
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: 12,
            fontWeight: 500,
            color: colors.text.muted,
          }}
        >
          <span
            style={{
              height: '8px',
              width: '8px',
              borderRadius: layout.radii.full,
              backgroundColor: colors.status.pending,
              opacity: pulseOpacity,
            }}
          />
          <span>{t.status}</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Section 1: Basic Outlet Profile */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: 14,
              fontWeight: 700,
              color: colors.secondary,
              marginBottom: '14px',
              paddingBottom: '8px',
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            <span>🏢</span>
            <span>{t.outletProfile}</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '16px',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 700,
                  color: colors.secondary,
                  marginBottom: '6px',
                }}
              >
                {t.branchNameLabel} <span style={{ color: colors.status.cancelled }}>*</span>
              </label>
              <div
                style={{
                  width: '100%',
                  borderRadius: layout.radii.medium,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surface,
                  padding: '10px 14px',
                  fontSize: 14,
                  color: colors.text.primary,
                  boxSizing: 'border-box',
                }}
              >
                {props.name}
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 700,
                  color: colors.secondary,
                  marginBottom: '6px',
                }}
              >
                {t.phoneLabel} <span style={{ color: colors.status.cancelled }}>*</span>
              </label>
              <div
                style={{
                  width: '100%',
                  borderRadius: layout.radii.medium,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surface,
                  padding: '10px 14px',
                  fontSize: 14,
                  color: colors.text.primary,
                  boxSizing: 'border-box',
                }}
              >
                {`+91 ${props.phone}`}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Address & GPS */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 14,
              fontWeight: 700,
              color: colors.secondary,
              marginBottom: '14px',
              paddingBottom: '8px',
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📍</span>
              <span>{t.addressHeader}</span>
            </div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: layout.radii.medium,
                backgroundColor: colors.surfaceMuted,
                border: `1px solid ${colors.border}`,
                padding: '4px 10px',
                fontSize: 12,
                fontWeight: 700,
                color: colors.primary,
              }}
            >
              🧭 {t.gpsButton}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: '16px',
            }}
          >
            <div style={{ gridColumn: 'span 3' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 700,
                  color: colors.secondary,
                  marginBottom: '6px',
                }}
              >
                {t.addressLabel} <span style={{ color: colors.status.cancelled }}>*</span>
              </label>
              <div
                style={{
                  width: '100%',
                  borderRadius: layout.radii.medium,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surface,
                  padding: '10px 14px',
                  fontSize: 14,
                  color: colors.text.primary,
                  boxSizing: 'border-box',
                }}
              >
                {props.address}
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 700,
                  color: colors.secondary,
                  marginBottom: '6px',
                }}
              >
                {t.cityLabel}
              </label>
              <div
                style={{
                  width: '100%',
                  borderRadius: layout.radii.medium,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surface,
                  padding: '10px 14px',
                  fontSize: 14,
                  color: colors.text.primary,
                  boxSizing: 'border-box',
                }}
              >
                {props.city}
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 700,
                  color: colors.secondary,
                  marginBottom: '6px',
                }}
              >
                {t.stateLabel}
              </label>
              <div
                style={{
                  width: '100%',
                  borderRadius: layout.radii.medium,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surface,
                  padding: '10px 14px',
                  fontSize: 14,
                  color: colors.text.primary,
                  boxSizing: 'border-box',
                }}
              >
                {props.state}
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 700,
                  color: colors.secondary,
                  marginBottom: '6px',
                }}
              >
                {t.pinCodeLabel}
              </label>
              <div
                style={{
                  width: '100%',
                  borderRadius: layout.radii.medium,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surface,
                  padding: '10px 14px',
                  fontSize: 14,
                  color: colors.text.primary,
                  boxSizing: 'border-box',
                }}
              >
                {props.pinCode}
              </div>
            </div>

            <div style={{ gridColumn: 'span 3' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 700,
                  color: colors.secondary,
                  marginBottom: '6px',
                }}
              >
                {t.latLngLabel}
              </label>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  borderRadius: layout.radii.medium,
                  backgroundColor: colors.surfaceMuted,
                  border: `1px solid ${colors.border}`,
                  fontSize: 12,
                  color: colors.text.muted,
                }}
              >
                {`Lat: ${latText}, Lng: ${lngText}`}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Manager & GSTIN */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: 14,
              fontWeight: 700,
              color: colors.secondary,
              marginBottom: '14px',
              paddingBottom: '8px',
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            <span>📄</span>
            <span>{t.managerSection}</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: '16px',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 700,
                  color: colors.secondary,
                  marginBottom: '6px',
                }}
              >
                {t.managerNameLabel} <span style={{ color: colors.status.cancelled }}>*</span>
              </label>
              <div
                style={{
                  width: '100%',
                  borderRadius: layout.radii.medium,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surface,
                  padding: '10px 14px',
                  fontSize: 14,
                  color: colors.text.primary,
                  boxSizing: 'border-box',
                }}
              >
                {props.managerName}
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 700,
                  color: colors.secondary,
                  marginBottom: '6px',
                }}
              >
                {t.managerPhoneLabel} <span style={{ color: colors.status.cancelled }}>*</span>
              </label>
              <div
                style={{
                  width: '100%',
                  borderRadius: layout.radii.medium,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surface,
                  padding: '10px 14px',
                  fontSize: 14,
                  color: colors.text.primary,
                  boxSizing: 'border-box',
                }}
              >
                {`+91 ${props.managerPhone}`}
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 700,
                  color: colors.secondary,
                  marginBottom: '6px',
                }}
              >
                {t.gstinLabel}
              </label>
              <div
                style={{
                  width: '100%',
                  borderRadius: layout.radii.medium,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surface,
                  padding: '10px 14px',
                  fontSize: 14,
                  color: colors.text.primary,
                  boxSizing: 'border-box',
                }}
              >
                {props.gstin || '29AAAAA0000A1Z5'}
              </div>
              <p
                style={{
                  margin: '4px 0 0',
                  fontSize: 11,
                  color: colors.text.muted,
                }}
              >
                {t.gstinHint}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            paddingTop: '16px',
            borderTop: `1px solid ${colors.border}`,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: layout.radii.medium,
              backgroundColor: colors.primary,
              padding: '12px 28px',
              fontSize: 14,
              fontWeight: 700,
              color: colors.surface,
              boxShadow: layout.shadows,
            }}
          >
            <span>{props.isSaving ? t.savingButton : t.saveButton}</span>
            <span>&rarr;</span>
          </div>
        </div>
      </div>
    </div>
  );
};
