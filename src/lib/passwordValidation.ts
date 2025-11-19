export interface PasswordRequirement {
  label: string;
  met: boolean;
}

export interface PasswordStrength {
  score: number; // 0-4
  label: 'Muito Fraca' | 'Fraca' | 'Média' | 'Forte' | 'Muito Forte';
  requirements: PasswordRequirement[];
}

export const validatePassword = (password: string): PasswordStrength => {
  const requirements: PasswordRequirement[] = [
    {
      label: 'Mínimo 8 caracteres',
      met: password.length >= 8,
    },
    {
      label: 'Letra maiúscula',
      met: /[A-Z]/.test(password),
    },
    {
      label: 'Letra minúscula',
      met: /[a-z]/.test(password),
    },
    {
      label: 'Número',
      met: /[0-9]/.test(password),
    },
    {
      label: 'Caractere especial (@#$%...)',
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const metCount = requirements.filter(r => r.met).length;
  
  let score: number;
  let label: PasswordStrength['label'];
  
  if (metCount === 0) {
    score = 0;
    label = 'Muito Fraca';
  } else if (metCount <= 2) {
    score = 1;
    label = 'Fraca';
  } else if (metCount === 3) {
    score = 2;
    label = 'Média';
  } else if (metCount === 4) {
    score = 3;
    label = 'Forte';
  } else {
    score = 4;
    label = 'Muito Forte';
  }

  return { score, label, requirements };
};

export const isPasswordStrong = (password: string): boolean => {
  const strength = validatePassword(password);
  return strength.score >= 3; // At least "Forte"
};
