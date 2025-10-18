import * as React from 'react';

import {
  Dialog as AlertDialog,
  DialogClose as AlertDialogClose,
  DialogContent as AlertDialogContentPrimitive,
  DialogDescription as AlertDialogDescription,
  DialogFooter as AlertDialogFooter,
  DialogHeader as AlertDialogHeader,
  DialogOverlay as AlertDialogOverlay,
  DialogPortal as AlertDialogPortal,
  DialogTitle as AlertDialogTitle,
  DialogTrigger as AlertDialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ButtonProps = React.ComponentProps<typeof Button>;

function AlertDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogContentPrimitive>) {
  return (
    <AlertDialogContentPrimitive
      role="alertdialog"
      data-slot="alert-dialog-content"
      className={cn('sm:max-w-[425px]', className)}
      {...props}
    />
  );
}

const AlertDialogAction = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'destructive', ...props }, ref) => (
    <AlertDialogClose asChild>
      <Button
        ref={ref}
        data-slot="alert-dialog-action"
        className={className}
        variant={variant}
        {...props}
      />
    </AlertDialogClose>
  )
);
AlertDialogAction.displayName = 'AlertDialogAction';

const AlertDialogCancel = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'outline', ...props }, ref) => (
    <AlertDialogClose asChild>
      <Button
        ref={ref}
        data-slot="alert-dialog-cancel"
        className={className}
        variant={variant}
        {...props}
      />
    </AlertDialogClose>
  )
);
AlertDialogCancel.displayName = 'AlertDialogCancel';

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};
