import { useEffect, useState } from 'react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MediaBrowser from '@/components/media/media-browser';
import { Button } from '@/components/ui/button';
import { MediaFilters, MediaItem, MediaPayload } from '@/hooks/use-media-library';

interface MediaPickerProps {
    open: boolean;
    onClose: () => void;
    onSelect: (items: MediaItem[]) => void;
    allowMultiple?: boolean;
    contextTag?: string | null;
}

const emptyPayload: MediaPayload = { data: [] };

const MediaPicker = ({ open, onClose, onSelect, allowMultiple = true, contextTag }: MediaPickerProps) => {
    const [payload, setPayload] = useState<MediaPayload>(emptyPayload);
    const [filters, setFilters] = useState<MediaFilters>({ context_tag: contextTag ?? null });
    const [folders, setFolders] = useState<string[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) {
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch('/bo/media?per_page=24', {
                    headers: {
                        Accept: 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Unable to load media.');
                }

                const payload = await response.json();
                setPayload(payload.media ?? payload);
                setFolders(payload.folders ?? []);
                setTags(payload.tags ?? []);
                setFilters((current) => ({ ...current, context_tag: contextTag ?? current.context_tag ?? null }));
            } catch (exception) {
                setError(exception instanceof Error ? exception.message : 'Unable to load media.');
            } finally {
                setLoading(false);
            }
        };

        void fetchData();
    }, [contextTag, open]);

    return (
        <Dialog open={open} onOpenChange={(isOpen) => (!isOpen ? onClose() : null)}>
            <DialogContent className="max-w-5xl">
                <DialogHeader className="flex flex-row items-center justify-between">
                    <DialogTitle>Select media</DialogTitle>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        Close
                    </Button>
                </DialogHeader>

                {error && <p className="rounded border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

                <div className="mt-4">
                    <MediaBrowser
                        initialPayload={payload}
                        initialFilters={filters}
                        folders={folders}
                        tags={tags}
                        mode="modal"
                        allowMultiple={allowMultiple}
                        contextTag={contextTag}
                        onSelect={(items) => {
                            onSelect(items);
                            onClose();
                        }}
                    />
                </div>

                {loading && <p className="mt-2 text-xs text-muted-foreground">Loading library…</p>}
            </DialogContent>
        </Dialog>
    );
};

export default MediaPicker;
