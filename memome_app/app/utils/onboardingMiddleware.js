import { redirect } from 'react-router';
import { paths } from './appPaths';
import { canAccessOnboardingScreen } from './onboardingFlow';

export function requireOnboardingScreenMiddleware(screen) {
  return async function onboardingScreenGuard(_args, next) {
    if (!canAccessOnboardingScreen(screen)) {
      throw redirect(paths.home);
    }
    return next();
  };
}
