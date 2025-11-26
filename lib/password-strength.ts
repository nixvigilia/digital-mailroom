export function checkPasswordStrength(password: string) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const checks = {
    length: password.length >= minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar,
  };

  const passedChecks = Object.values(checks).filter(Boolean).length;
  const strength = passedChecks <= 2 ? "weak" : passedChecks <= 4 ? "medium" : "strong";
  const isValid = checks.length && hasUpperCase && hasLowerCase && hasNumbers;

  return {
    ...checks,
    strength,
    isValid,
    score: passedChecks,
  };
}

