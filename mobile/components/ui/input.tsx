import * as React from 'react';
import { Platform, TextInput, type TextInputProps } from 'react-native';

import { cn } from '@/lib/utils';

const baseInputClassName = cn(
  'h-10 w-full rounded-md border border-input bg-background px-3 text-base text-foreground',
  Platform.select({
    web: 'outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
  })
);

type InputProps = TextInputProps & {
  className?: string;
  'aria-invalid'?: boolean;
};

const Input = React.forwardRef<TextInput, InputProps>(
  ({ className, editable = true, placeholderTextColor, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        className={cn(
          baseInputClassName,
          !editable && 'opacity-50',
          props['aria-invalid'] && 'border-destructive',
          className
        )}
        editable={editable}
        placeholderTextColor={placeholderTextColor ?? '#9CA3AF'}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };
