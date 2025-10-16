import * as SwitchPrimitives from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

export interface SwitchProps extends SwitchPrimitives.SwitchProps {}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(({ className, ...props }, ref) => (
    <SwitchPrimitives.Root
        ref={ref}
        className={cn(
            'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
            'data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted',
            className
        )}
        {...props}
    >
        <SwitchPrimitives.Thumb
            className={cn(
                'pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform',
                'data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0'
            )}
        />
    </SwitchPrimitives.Root>
));

Switch.displayName = SwitchPrimitives.Root.displayName;
