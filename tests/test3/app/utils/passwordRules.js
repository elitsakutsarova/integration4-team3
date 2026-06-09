export function getPasswordChecks(password) {
  const hasMinLength = password.length >= 8;
  const hasMixedCase = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  let strength = 'weak';
  if (hasMinLength && hasMixedCase) {
    strength = password.length >= 12 && hasNumber ? 'strong' : 'medium';
  }

  return {
    hasMinLength,
    hasMixedCase,
    hasNumber,
    strength,
    isValid: hasMinLength && hasMixedCase,
  };
}

export function strengthBarCount(strength) {
  if (strength === 'strong') return 3;
  if (strength === 'medium') return 2;
  return 1;
}
