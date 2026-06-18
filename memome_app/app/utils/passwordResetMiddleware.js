import { redirect } from 'react-router';
import { paths, resetPasswordSuccessPath } from './appPaths';
import {
  canAccessResetPasswordPage,
  canAccessResetPasswordSuccessPage,
  PASSWORD_RESET_STEPS,
  getPasswordResetFlowStep,
} from './passwordResetFlow';

export async function requirePasswordResetVerifiedMiddleware(_args, next) {
  const step = getPasswordResetFlowStep();

  if (step === PASSWORD_RESET_STEPS.completed) {
    throw redirect(resetPasswordSuccessPath());
  }

  if (!canAccessResetPasswordPage()) {
    throw redirect(paths.forgotPassword);
  }

  return next();
}

export async function requirePasswordResetCompletedMiddleware(_args, next) {
  if (!canAccessResetPasswordSuccessPage()) {
    throw redirect(paths.forgotPassword);
  }

  return next();
}
