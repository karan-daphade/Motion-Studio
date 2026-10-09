// Cloned from frontend/components/onboarding/onboarding-stepper.tsx
import { useCurrentFrame } from 'remotion';
import { useTheme } from '../../../theme';
import { MOCK_ONBOARDING_STEPS } from '../../../catalog/mock/onboarding';
import {
  OnboardingStepperPropsSchema,
  type OnboardingStepperProps,
} from './OnboardingStepper.schema';

const I18N = {
  en: {
    stepOf: (cur: number, total: number, name: string) => `Step ${cur} of ${total}: ${name}`,
    autosaving: 'Autosaving...',
    subtitle: 'Complete sequential setup to activate live operations for this branch.',
    completed: 'Completed',
    stepsFinished: (done: number, total: number) => `${done} of ${total} Steps Finished`,
    currentBadge: 'Current',
    doneBadge: 'Done',
    lockedBadge: 'Locked',
    nextBadge: 'Next',
  },
  hi: {
    stepOf: (cur: number, total: number, name: string) => `चरण ${cur} / ${total}: ${name}`,
    autosaving: 'स्वतः सहेजा जा रहा है...',
    subtitle: 'इस शाखा के लाइव संचालन को सक्रिय करने के लिए क्रमबद्ध सेटअप पूरा करें।',
    completed: 'पूर्ण',
    stepsFinished: (done: number, total: number) => `${done} / ${total} चरण पूरे हुए`,
    currentBadge: 'वर्तमान',
    doneBadge: 'पूर्ण',
    lockedBadge: 'लॉक्ड',
    nextBadge: 'अगला',
  },
  mr: {
    stepOf: (cur: number, total: number, name: string) => `टप्पा ${cur} / ${total}: ${name}`,
    autosaving: 'आपोआप जतन होत आहे...',
    subtitle: 'या शाखेचे थेट कामकाज सुरू करण्यासाठी सर्व टप्पे पूर्ण करा.',
    completed: 'पूर्ण',
    stepsFinished: (done: number, total: number) => `${done} / ${total} टप्पे पूर्ण`,
    currentBadge: 'सध्याचा',
    doneBadge: 'पूर्ण',
    lockedBadge: 'बंद',
    nextBadge: 'पुढील',
  },
};

export const OnboardingStepper: React.FC<OnboardingStepperProps> = (rawProps) => {
  const props = OnboardingStepperPropsSchema.parse(rawProps);
  const { colors, layout, fontFamily } = useTheme();
  const remotionFrame = useCurrentFrame();
  const frame = props.frame ?? remotionFrame;

  const locale = props.locale || 'en';
  const t = I18N[locale];

  const stepsList = props.steps || MOCK_ONBOARDING_STEPS[locale] || MOCK_ONBOARDING_STEPS.en;
  const total = props.totalSteps || stepsList.length;
  const completedCount = props.completedSteps.length;
  const progressPercent = Math.min(100, Math.round((completedCount / total) * 100));

  const currentStepDef =
    stepsList.find((s) => s.step === props.currentStep) || stepsList[0];

  const pulseOpacity = 0.5 + 0.5 * Math.sin(frame * 0.15);

  return (
    <div
      style={{
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: layout.radii.large,
        border: `1px solid ${colors.border}`,
        boxShadow: layout.shadows,
        padding: '24px',
        boxSizing: 'border-box',
        fontFamily,
      }}
    >
      {/* Top Header: Step Indicator & Overall Progress */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: layout.radii.full,
                backgroundColor: colors.surfaceMuted,
                padding: '4px 12px',
                fontSize: 12,
                fontWeight: 700,
                color: colors.primary,
                border: `1px solid ${colors.border}`,
              }}
            >
              <span
                style={{
                  height: '6px',
                  width: '6px',
                  borderRadius: layout.radii.full,
                  backgroundColor: colors.primary,
                  opacity: pulseOpacity,
                }}
              />
              {t.stepOf(props.currentStep, total, currentStepDef.name)}
            </span>
            {props.isSaving && (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: colors.text.muted,
                  opacity: pulseOpacity,
                }}
              >
                {t.autosaving}
              </span>
            )}
          </div>
          <p
            style={{
              margin: '6px 0 0',
              fontSize: 12,
              color: colors.text.muted,
            }}
          >
            {t.subtitle}
          </p>
        </div>

        {/* Progress bar info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: colors.secondary,
              }}
            >
              {`${progressPercent}% ${t.completed}`}
            </div>
            <div
              style={{
                fontSize: 11,
                color: colors.text.muted,
              }}
            >
              {t.stepsFinished(completedCount, total)}
            </div>
          </div>
          <div
            style={{
              width: '120px',
              height: '10px',
              backgroundColor: colors.surfaceMuted,
              borderRadius: layout.radii.full,
              overflow: 'hidden',
              border: `1px solid ${colors.border}`,
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progressPercent}%`,
                backgroundColor: colors.primary,
                borderRadius: layout.radii.full,
              }}
            />
          </div>
        </div>
      </div>

      {/* Connected 7 Steps Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${stepsList.length}, minmax(0, 1fr))`,
          gap: '8px',
          position: 'relative',
        }}
      >
        {stepsList.map((s, idx) => {
          const isCompleted = props.completedSteps.includes(s.step);
          const isCurrent = props.currentStep === s.step;
          const isLocked = !isCompleted && !isCurrent;

          let badgeBg = colors.surfaceMuted;
          let badgeColor = colors.text.muted;
          let badgeLabel = t.nextBadge;

          if (isCurrent) {
            badgeBg = colors.primary;
            badgeColor = colors.surface;
            badgeLabel = t.currentBadge;
          } else if (isCompleted) {
            badgeBg = colors.status.ready;
            badgeColor = colors.surface;
            badgeLabel = t.doneBadge;
          } else if (isLocked && s.step > 5) {
            badgeBg = colors.surfaceMuted;
            badgeColor = colors.text.muted;
            badgeLabel = t.lockedBadge;
          }

          return (
            <div
              key={s.step}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: '12px 6px',
                borderRadius: layout.radii.medium,
                backgroundColor: isCurrent
                  ? colors.surfaceMuted
                  : isCompleted
                  ? colors.surface
                  : colors.surfaceMuted,
                border: isCurrent
                  ? `2px solid ${colors.primary}`
                  : `1px solid ${colors.border}`,
                opacity: isLocked ? 0.75 : 1,
              }}
            >
              {/* Connector line */}
              {idx < stepsList.length - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '28px',
                    right: '-4px',
                    width: '8px',
                    height: '2px',
                    backgroundColor:
                      props.completedSteps.includes(s.step) &&
                      props.completedSteps.includes(s.step + 1)
                        ? colors.primary
                        : colors.border,
                    zIndex: 0,
                  }}
                />
              )}

              {/* Step circle */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 1,
                  display: 'flex',
                  height: '32px',
                  width: '32px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: layout.radii.full,
                  fontSize: 12,
                  fontWeight: 700,
                  backgroundColor: isCurrent
                    ? colors.primary
                    : isCompleted
                    ? colors.status.ready
                    : colors.surfaceMuted,
                  color: isCurrent || isCompleted ? colors.surface : colors.text.muted,
                  border:
                    !isCurrent && !isCompleted ? `1px solid ${colors.border}` : 'none',
                }}
              >
                {isCompleted && !isCurrent ? '✓' : isLocked ? '🔒' : s.step}
              </div>

              {/* Step name */}
              <span
                style={{
                  marginTop: '8px',
                  fontSize: 11,
                  fontWeight: 700,
                  color: isCurrent
                    ? colors.primary
                    : isCompleted
                    ? colors.secondary
                    : colors.text.muted,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%',
                }}
              >
                {s.name}
              </span>

              {/* Step shortDesc */}
              <span
                style={{
                  marginTop: '2px',
                  fontSize: 10,
                  color: colors.text.muted,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%',
                }}
              >
                {s.shortDesc}
              </span>

              {/* State pill */}
              <span
                style={{
                  marginTop: '6px',
                  fontSize: 9,
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: layout.radii.small,
                  backgroundColor: badgeBg,
                  color: badgeColor,
                }}
              >
                {badgeLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
