import { useState, type ReactNode } from 'react';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

type ButtonVariant = React.ComponentProps<typeof Button>['variant'];

type TriggerRenderer = (context: {
    open: () => void;
    isPending: boolean;
}) => ReactNode;

interface ConfirmDialogProps {
    trigger: ReactNode | TriggerRenderer;
    title: string;
    description?: ReactNode;
    confirmLabel?: string;
    confirmLoadingLabel?: string;
    cancelLabel?: string;
    confirmVariant?: ButtonVariant;
    onConfirm?: () => void | Promise<void>;
    children?: ReactNode;
}

const isPromise = (
    value: unknown
): value is Promise<unknown> => {
    return (
        typeof value === 'object' &&
        value !== null &&
        'then' in value &&
        typeof (value as Promise<unknown>).then === 'function'
    );
};

const ConfirmDialog = ({
    trigger,
    title,
    description,
    confirmLabel = 'Delete',
    confirmLoadingLabel,
    cancelLabel = 'Cancel',
    confirmVariant = 'destructive',
    onConfirm,
    children,
}: ConfirmDialogProps) => {
    const [open, setOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const handleOpenChange = (nextOpen: boolean) => {
        if (isPending) {
            return;
        }

        setOpen(nextOpen);
    };

    const handleConfirm = async () => {
        if (!onConfirm) {
            setOpen(false);
            return;
        }

        try {
            const result = onConfirm();

            if (isPromise(result)) {
                setIsPending(true);
                try {
                    await result;
                    setOpen(false);
                } finally {
                    setIsPending(false);
                }
                return;
            }

            setOpen(false);
        } catch (error) {
            console.error(error);
            setIsPending(false);
        }
    };

    const renderedTrigger =
        typeof trigger === 'function'
            ? (trigger as TriggerRenderer)({
                  open: () => setOpen(true),
                  isPending,
              })
            : trigger;

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogTrigger asChild>{renderedTrigger}</AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
                </AlertDialogHeader>

                {children}

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>{cancelLabel}</AlertDialogCancel>
                    <Button
                        type="button"
                        variant={confirmVariant}
                        onClick={handleConfirm}
                        disabled={isPending}
                    >
                        {isPending ? confirmLoadingLabel ?? `${confirmLabel}…` : confirmLabel}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default ConfirmDialog;
