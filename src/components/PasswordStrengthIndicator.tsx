import { validatePassword } from '@/lib/passwordValidation';
import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  if (!password) return null;

  const strength = validatePassword(password);
  
  const getColor = () => {
    switch (strength.score) {
      case 0:
      case 1:
        return 'bg-destructive';
      case 2:
        return 'bg-yellow-500';
      case 3:
        return 'bg-blue-500';
      case 4:
        return 'bg-green-500';
      default:
        return 'bg-muted';
    }
  };

  const getTextColor = () => {
    switch (strength.score) {
      case 0:
      case 1:
        return 'text-destructive';
      case 2:
        return 'text-yellow-500';
      case 3:
        return 'text-blue-500';
      case 4:
        return 'text-green-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-2 mt-2">
      {/* Progress bar */}
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-colors ${
              level <= strength.score ? getColor() : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Strength label */}
      <p className={`text-sm font-medium ${getTextColor()}`}>
        Força: {strength.label}
      </p>

      {/* Requirements checklist */}
      <div className="space-y-1">
        {strength.requirements.map((req, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            {req.met ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <X className="h-3 w-3 text-muted-foreground" />
            )}
            <span className={req.met ? 'text-green-500' : 'text-muted-foreground'}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;
