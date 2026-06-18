const PASSWORD_RESET_EMAIL_KEY = 'memome_password_reset_email';
const PASSWORD_RESET_STEP_KEY = 'memome_password_reset_step';

export const PASSWORD_RESET_STEPS = {
  verified: 'verified',
  completed: 'completed',
};

function canUseSessionStorage() {
  return typeof sessionStorage !== 'undefined';
}

export function beginPasswordResetFlow(email) {
  if (!canUseSessionStorage()) return;
  const value = String(email ?? '').trim().toLowerCase();
  if (!value) return;
  sessionStorage.setItem(PASSWORD_RESET_EMAIL_KEY, value);
  sessionStorage.setItem(PASSWORD_RESET_STEP_KEY, PASSWORD_RESET_STEPS.verified);
}

export function completePasswordResetFlow() {
  if (!canUseSessionStorage()) return;
  if (!getPasswordResetFlowEmail()) return;
  sessionStorage.setItem(PASSWORD_RESET_STEP_KEY, PASSWORD_RESET_STEPS.completed);
}

export function getPasswordResetFlowEmail() {
  if (!canUseSessionStorage()) return '';
  return sessionStorage.getItem(PASSWORD_RESET_EMAIL_KEY)?.trim() ?? '';
}

export function getPasswordResetFlowStep() {
  if (!canUseSessionStorage()) return '';
  return sessionStorage.getItem(PASSWORD_RESET_STEP_KEY) ?? '';
}

export function getPasswordResetFlowEmailForLogin() {
  if (getPasswordResetFlowStep() !== PASSWORD_RESET_STEPS.completed) return '';
  return getPasswordResetFlowEmail();
}

export function canAccessResetPasswordPage() {
  return (
    getPasswordResetFlowStep() === PASSWORD_RESET_STEPS.verified
    && Boolean(getPasswordResetFlowEmail())
  );
}

export function canAccessResetPasswordSuccessPage() {
  return (
    getPasswordResetFlowStep() === PASSWORD_RESET_STEPS.completed
    && Boolean(getPasswordResetFlowEmail())
  );
}

export function clearPasswordResetFlow() {
  if (!canUseSessionStorage()) return;
  sessionStorage.removeItem(PASSWORD_RESET_EMAIL_KEY);
  sessionStorage.removeItem(PASSWORD_RESET_STEP_KEY);
}

/** @deprecated Use clearPasswordResetFlow */
export function clearPasswordResetFlowEmail() {
  clearPasswordResetFlow();
}
