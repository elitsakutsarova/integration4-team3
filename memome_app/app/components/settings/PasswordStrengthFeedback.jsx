import {
  CheckCircleOutlineIcon,
  CheckIcon,
  CrossCircleIcon,
  XIcon,
} from '../auth/AuthIcons';
import {
  getPasswordChecks,
  strengthBarCount,
  strengthBarCount4,
} from '../../utils/passwordRules';

const VARIANTS = {
  settings: {
    barCount: 4,
    getBarCount: (checks) => strengthBarCount4(checks.strength),
    getStrengthClass: (checks) => checks.strength,
    getLabel: (checks) => checks.strength.charAt(0).toUpperCase() + checks.strength.slice(1),
    wrapper: 'settings-password-strength',
    row: 'settings-password-strength-row',
    barsContainer: 'settings-password-strength-bars',
    bar: 'settings-password-strength-bar',
    barActive: 'settings-password-strength-bar--active',
    barStrength: (strength) => `settings-password-strength-bar--${strength}`,
    label: 'settings-password-strength-label',
    labelStrength: (strength) => `settings-password-strength-label--${strength}`,
    rules: 'settings-password-rules',
    ruleOk: 'settings-password-rule--ok',
    ruleBad: 'settings-password-rule--bad',
    ruleIcon: 'settings-password-rule-icon',
    OkIcon: CheckIcon,
    BadIcon: XIcon,
  },
  auth: {
    barCount: 3,
    getBarCount: (checks) => strengthBarCount(checks.strength),
    getStrengthClass: (checks) => checks.strength,
    getLabel: (checks) => checks.strength.charAt(0).toUpperCase() + checks.strength.slice(1),
    wrapper: 'auth-password-meta',
    row: 'auth-strength-row',
    barsContainer: 'auth-strength-bars',
    bar: 'auth-strength-bar',
    barActive: 'auth-strength-bar--active',
    barStrength: (strength) => `auth-strength-bar--${strength}`,
    label: 'auth-strength-label',
    labelStrength: (strength) => `auth-strength-label--${strength}`,
    rules: 'auth-rule-list',
    ruleOk: 'auth-rule--ok',
    ruleBad: 'auth-rule--bad',
    ruleIcon: 'auth-rule-icon',
    OkIcon: CheckIcon,
    BadIcon: XIcon,
  },
  register: {
    barCount: 4,
    getBarCount: (checks) => strengthBarCount4(checks.strength),
    getStrengthClass: (checks) => checks.strength,
    getLabel: (checks) => checks.strength.charAt(0).toUpperCase() + checks.strength.slice(1),
    wrapper: 'register-password-strength',
    row: 'register-password-strength-row',
    barsContainer: 'register-password-strength-bars',
    bar: 'register-password-strength-bar',
    barActive: 'register-password-strength-bar--active',
    barStrength: (strength) => `register-password-strength-bar--${strength}`,
    label: 'register-password-strength-label',
    labelStrength: (strength) => `register-password-strength-label--${strength}`,
    rules: 'register-password-rules',
    ruleOk: 'register-password-rule--ok',
    ruleBad: 'register-password-rule--bad',
    ruleIcon: 'register-password-rule-icon',
    OkIcon: CheckCircleOutlineIcon,
    BadIcon: CrossCircleIcon,
  },
};

export default function PasswordStrengthFeedback({ password, variant = 'settings' }) {
  const v = VARIANTS[variant];
  const checks = getPasswordChecks(password);
  const strengthClass = v.getStrengthClass(checks);
  const bars = v.getBarCount(checks);
  const label = v.getLabel(checks);
  const hasInput = password.length > 0;
  const OkIcon = v.OkIcon;
  const BadIcon = v.BadIcon;

  return (
    <div className={v.wrapper} aria-live="polite">
      <div className={v.row}>
        <div className={v.barsContainer} aria-hidden="true">
          {Array.from({ length: v.barCount }, (_, index) => (
            <span
              key={index}
              className={`${v.bar} ${v.barStrength(strengthClass)}${index < bars ? ` ${v.barActive}` : ''}`}
            />
          ))}
        </div>
        {hasInput && (
          <span className={`${v.label} ${v.labelStrength(strengthClass)}`}>
            {label}
          </span>
        )}
      </div>

      <ul className={v.rules}>
        <li className={checks.hasMinLength ? v.ruleOk : hasInput ? v.ruleBad : ''}>
          <span className={v.ruleIcon} aria-hidden="true">
            {checks.hasMinLength ? <OkIcon /> : hasInput ? <BadIcon /> : null}
          </span>
          Use at least 8 characters
        </li>
        <li className={checks.hasMixedCase ? v.ruleOk : hasInput ? v.ruleBad : ''}>
          <span className={v.ruleIcon} aria-hidden="true">
            {checks.hasMixedCase ? <OkIcon /> : hasInput ? <BadIcon /> : null}
          </span>
          Use upper and lower case characters
        </li>
      </ul>
    </div>
  );
}
