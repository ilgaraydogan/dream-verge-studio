import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'px-4 py-2 text-sm font-medium transition-colors',
          variant === 'default' && 'bg-accent text-white hover:bg-accent/90',
          variant === 'ghost' && 'text-text-muted hover:text-text-primary hover:bg-surface',
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
