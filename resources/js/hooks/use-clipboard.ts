// Credit: https://usehooks-ts.com/
import { useCallback, useState } from 'react';

type CopiedValue = string | null;

type CopyFn = (text: string) => Promise<boolean>;

export function useClipboard(): [CopiedValue, CopyFn] {
    const [copiedText, setCopiedText] = useState<CopiedValue>(null);

    const copy: CopyFn = useCallback(async (text) => {
        const writeWithNavigator = async () => {
            if (typeof window === 'undefined' || typeof navigator === 'undefined' || !navigator.clipboard?.writeText || !window.isSecureContext) {
                return false;
            }

            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch {
                return false;
            }
        };

        const writeWithFallback = () => {
            if (typeof document === 'undefined') {
                return false;
            }

            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.setAttribute('readonly', '');
            textarea.style.position = 'absolute';
            textarea.style.left = '-9999px';

            const selection = document.getSelection();
            const originalRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

            document.body.appendChild(textarea);
            textarea.select();

            let success = false;

            try {
                success = document.execCommand('copy');
            } catch {
                success = false;
            }

            document.body.removeChild(textarea);

            if (originalRange && selection) {
                selection.removeAllRanges();
                selection.addRange(originalRange);
            }

            return success;
        };

        const copied = (await writeWithNavigator()) || writeWithFallback();

        if (copied) {
            setCopiedText(text);
            return true;
        }

        setCopiedText(null);

        return false;
    }, []);

    return [copiedText, copy];
}
