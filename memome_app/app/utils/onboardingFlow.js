const ONBOARDING_STEP_KEY = 'memome_onboarding_step';

export const ONBOARDING_STEPS = {
  screen1: '1',
  screen2: '2',
  screen3: '3',
  completed: 'completed',
};

function canUseSessionStorage() {
  return typeof sessionStorage !== 'undefined';
}

export function beginOnboardingFlow() {
  if (!canUseSessionStorage()) return;
  sessionStorage.setItem(ONBOARDING_STEP_KEY, ONBOARDING_STEPS.screen1);
}

export function advanceOnboardingTo(step) {
  if (!canUseSessionStorage()) return;
  sessionStorage.setItem(ONBOARDING_STEP_KEY, String(step));
}

export function completeOnboardingFlow() {
  if (!canUseSessionStorage()) return;
  sessionStorage.setItem(ONBOARDING_STEP_KEY, ONBOARDING_STEPS.completed);
}

export function getOnboardingStep() {
  if (!canUseSessionStorage()) return '';
  return sessionStorage.getItem(ONBOARDING_STEP_KEY) ?? '';
}

export function canAccessOnboardingScreen(step) {
  return getOnboardingStep() === String(step);
}

export function isOnboardingComplete() {
  return getOnboardingStep() === ONBOARDING_STEPS.completed;
}

export function clearOnboardingFlow() {
  if (!canUseSessionStorage()) return;
  sessionStorage.removeItem(ONBOARDING_STEP_KEY);
}
