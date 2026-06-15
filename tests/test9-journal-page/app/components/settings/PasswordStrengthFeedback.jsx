import { CheckIcon, XIcon } from '../auth/AuthIcons';
import { getPasswordChecks, strengthBarCount4 } from '../../utils/passwordRules';

export default function PasswordStrengthFeedback({ password }) {
  const checks = getPasswordChecks(password);
  const bars = strengthBarCount4(checks.strength);
  const label = checks.strength.charAt(0).toUpperCase() + checks.strength.slice(1);
  const hasInput = password.length > 0;

  return (
    <div className="settings-password-strength" aria-live="polite">
      <div className="settings-password-strength-row">
        <div className="settings-password-strength-bars" aria-hidden="true">
          {[0, 1, 2, 3].map((index) => (
            <span
              key={index}
              className={`settings-password-strength-bar settings-password-strength-bar--${checks.strength}${index < bars ? ' settings-password-strength-bar--active' : ''}`}
            />
          ))}
        </div>
        {hasInput ? (
          <span className={`settings-password-strength-label settings-password-strength-label--${checks.strength}`}>
            {label}
          </span>
        ) : null}
      </div>

      <ul className="settings-password-rules">
        <li className={checks.hasMinLength ? 'settings-password-rule--ok' : hasInput ? 'settings-password-rule--bad' : ''}>
          <span className="settings-password-rule-icon" aria-hidden="true">
            {checks.hasMinLength ? <CheckIcon /> : hasInput ? <XIcon /> : null}
          </span>
          Use at least 8 characters
        </li>
        <li className={checks.hasMixedCase ? 'settings-password-rule--ok' : hasInput ? 'settings-password-rule--bad' : ''}>
          <span className="settings-password-rule-icon" aria-hidden="true">
            {checks.hasMixedCase ? <CheckIcon /> : hasInput ? <XIcon /> : null}
          </span>
          Use upper and lower case characters
        </li>
      </ul>
    </div>
  );
}
