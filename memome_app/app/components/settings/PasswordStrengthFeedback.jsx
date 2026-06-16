import { CheckIcon, XIcon } from '../auth/AuthIcons';
import { getPasswordChecks, strengthBarCount, strengthBarCount4 } from '../../utils/passwordRules';

const VARIANTS = {
  settings: {
    barCount: 4,
    getBarCount: strengthBarCount4,
    wrapper: 'settings-password-strength',
    row: 'settings-password-strength-row',
    barsContainer: 'settings-password-strength-bars',
    bar: 'settings-password-strength-bar',
    barActive: 'settings-password-strength-bar--active',
    barStrength: (s) => `settings-password-strength-bar--${s}`,
    label: 'settings-password-strength-label',
    labelStrength: (s) => `settings-password-strength-label--${s}`,
    rules: 'settings-password-rules',
    ruleOk: 'settings-password-rule--ok',
    ruleBad: 'settings-password-rule--bad',
    ruleIcon: 'settings-password-rule-icon',
  },
  auth: {
    barCount: 3,
    getBarCount: strengthBarCount,
    wrapper: 'auth-password-meta',
    row: 'auth-strength-row',
    barsContainer: 'auth-strength-bars',
    bar: 'auth-strength-bar',
    barActive: 'auth-strength-bar--active',
    barStrength: (s) => `auth-strength-bar--${s}`,
    label: 'auth-strength-label',
    labelStrength: (s) => `auth-strength-label--${s}`,
    rules: 'auth-rule-list',
    ruleOk: 'auth-rule--ok',
    ruleBad: 'auth-rule--bad',
    ruleIcon: 'auth-rule-icon',
  },
};

export default function PasswordStrengthFeedback({ password, variant = 'settings' }) {
  const v = VARIANTS[variant];
  const checks = getPasswordChecks(password);
  const bars = v.getBarCount(checks.strength);
  const label = checks.strength.charAt(0).toUpperCase() + checks.strength.slice(1);
  const hasInput = password.length > 0;

  return (
    <div className={v.wrapper} aria-live="polite">
      <div className={v.row}>
        <div className={v.barsContainer} aria-hidden="true">
          {Array.from({ length: v.barCount }, (_, index) => (
            <span
              key={index}
              className={`${v.bar} ${v.barStrength(checks.strength)}${index < bars ? ` ${v.barActive}` : ''}`}
            />
          ))}
        </div>
        {hasInput && (
          <span className={`${v.label} ${v.labelStrength(checks.strength)}`}>
            {label}
          </span>
        )}
      </div>

      <ul className={v.rules}>
        <li className={checks.hasMinLength ? v.ruleOk : hasInput ? v.ruleBad : ''}>
          <span className={v.ruleIcon} aria-hidden="true">
            {checks.hasMinLength ? <CheckIcon /> : hasInput ? <XIcon /> : null}
          </span>
          Use at least 8 characters
        </li>
        <li className={checks.hasMixedCase ? v.ruleOk : hasInput ? v.ruleBad : ''}>
          <span className={v.ruleIcon} aria-hidden="true">
            {checks.hasMixedCase ? <CheckIcon /> : hasInput ? <XIcon /> : null}
          </span>
          Use upper and lower case characters
        </li>
      </ul>
    </div>
  );
}
