import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type MediaViewMode = 'grid' | 'list';

export interface MediaItem {
    id: number;
    filename: string;
    original_name: string;
    type: string;
    disk: string;
    path: string;
    url?: string | null;
    thumbnail_path?: string | null;
    thumbnail_url?: string | null;
    size: number;
    formatted_size?: string;
    metadata?: Record<string, unknown> | null;
    folder?: string | null;
    tags?: string[] | null;
    width?: number | null;
    height?: number | null;
    uploaded_by?: number | null;
    created_at?: string | null;
    updated_at?: string | null;
}

export interface MediaPayload {
    data: MediaItem[];
    meta?: {
        current_page?: number;
        last_page?: number;
        per_page?: number;
        total?: number;
        next_page_url?: string | null;
        prev_page_url?: string | null;
        links?: { url: string | null; label: string; active: boolean }[];
    };
}

export interface MediaFilters {
    search?: string;
    folder?: string | null;
    type?: string | null;
    tag?: string | null;
    from?: string | null;
    to?: string | null;
    size_min?: number | null;
    size_max?: number | null;
    sort?: string;
    direction?: 'asc' | 'desc';
    context_tag?: string | null;
}

export interface UploadTask {
    id: string;
    name: string;
    progress: number;
    status: 'pending' | 'uploading' | 'finished' | 'failed';
    error?: string;
}

interface UseMediaLibraryOptions {
    initialPayload: MediaPayload;
    initialFilters?: MediaFilters;
    endpoint?: string;
    contextTag?: string | null;
    defaultFolder?: string;
}

interface UseMediaLibraryResult {
    items: MediaItem[];
    filters: MediaFilters;
    setFilters: (filters: MediaFilters) => void;
    updateFilter: <Key extends keyof MediaFilters>(key: Key, value: MediaFilters[Key]) => void;
    isLoading: boolean;
    error: string | null;
    load: (append?: boolean) => Promise<void>;
    loadMore: () => Promise<void>;
    canLoadMore: boolean;
    selected: Set<number>;
    toggleSelect: (id: number) => void;
    clearSelection: () => void;
    selectAll: () => void;
    deleteItems: (ids: number[]) => Promise<void>;
    updateItem: (id: number, payload: Partial<Pick<MediaItem, 'original_name' | 'folder' | 'tags'>>) => Promise<MediaItem | null>;
    replaceItem: (id: number, file: File, originalName?: string | null) => Promise<MediaItem | null>;
    upload: (files: File[], extras?: { tags?: string[]; folder?: string }) => Promise<void>;
    uploadQueue: UploadTask[];
    isUploading: boolean;
    viewMode: MediaViewMode;
    setViewMode: (mode: MediaViewMode) => void;
    refresh: () => Promise<void>;
}

const csrfToken = () => (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)?.content ?? '';

const parsePayload = (payload: any): MediaPayload => {
    if (!payload) {
        return { data: [] };
    }

    if (Array.isArray(payload.data)) {
        return payload as MediaPayload;
    }

    if (Array.isArray(payload.media?.data)) {
        return payload.media as MediaPayload;
    }

    return { data: [] };
};

const nextPageFromMeta = (meta?: MediaPayload['meta']) => {
    if (!meta) {
        return null;
    }

    if (meta.next_page_url) {
        return meta.next_page_url;
    }

    if (Array.isArray(meta.links)) {
        const next = meta.links.find((link) => link.label.toLowerCase().includes('next'));
        return next?.url ?? null;
    }

    return null;
};

const createUploadTask = (file: File): UploadTask => ({
    id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    name: file.name,
    progress: 0,
    status: 'pending',
});

export const useMediaLibrary = ({
    initialPayload,
    initialFilters,
    endpoint = '/bo/media',
    contextTag,
    defaultFolder = '/',
}: UseMediaLibraryOptions): UseMediaLibraryResult => {
    const payload = parsePayload(initialPayload);

    const [items, setItems] = useState<MediaItem[]>(payload.data ?? []);
    const [meta, setMeta] = useState<MediaPayload['meta'] | undefined>(payload.meta);
    const [filters, setFilters] = useState<MediaFilters>({
        ...initialFilters,
        context_tag: initialFilters?.context_tag ?? contextTag ?? null,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadQueue, setUploadQueue] = useState<UploadTask[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [viewMode, setViewModeState] = useState<MediaViewMode>(() => {
        if (typeof window === 'undefined') {
            return 'grid';
        }

        const cached = window.localStorage.getItem('media.view');
        return cached === 'list' ? 'list' : 'grid';
    });

    const abortController = useRef<AbortController | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem('media.view', viewMode);
        }
    }, [viewMode]);

    const setViewMode = useCallback((mode: MediaViewMode) => {
        setViewModeState(mode);
    }, []);

    const buildQuery = useCallback(
        (overrides?: Partial<MediaFilters>, pageUrl?: string | null) => {
            if (pageUrl) {
                return pageUrl;
            }

            const query = new URLSearchParams();
            const state = { ...filters, ...overrides };

            Object.entries(state).forEach(([key, value]) => {
                if (value === undefined || value === null || value === '') {
                    return;
                }

                query.set(key, String(value));
            });

            return `${endpoint}?${query.toString()}`;
        },
        [endpoint, filters]
    );

    const request = useCallback(async (input: RequestInfo, init?: RequestInit) => {
        const response = await fetch(input, {
            ...init,
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                ...(init?.headers ?? {}),
            },
        });

        if (!response.ok) {
            const payload = await response.json().catch(() => ({}));
            const message = payload?.message ?? 'Unable to complete request.';
            throw new Error(message);
        }

        return response.json();
    }, []);

    const load = useCallback(async (append = false) => {
        setIsLoading(true);
        setError(null);

        abortController.current?.abort();
        abortController.current = new AbortController();

        try {
            const url = buildQuery();
            const payload = await request(url, { signal: abortController.current.signal });
            const parsed = parsePayload(payload);

            setItems((current) => (append ? [...current, ...(parsed.data ?? [])] : parsed.data ?? []));
            setMeta(parsed.meta);
        } catch (exception) {
            if ((exception as Error).name === 'AbortError') {
                return;
            }
            setError(exception instanceof Error ? exception.message : 'Something went wrong.');
        } finally {
            setIsLoading(false);
        }
    }, [buildQuery, request]);

    const refresh = useCallback(async () => load(false), [load]);

    const loadMore = useCallback(async () => {
        const next = nextPageFromMeta(meta);
        if (!next) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const payload = await request(next);
            const parsed = parsePayload(payload);
            setItems((current) => [...current, ...(parsed.data ?? [])]);
            setMeta(parsed.meta);
        } catch (exception) {
            setError(exception instanceof Error ? exception.message : 'Unable to load more media.');
        } finally {
            setIsLoading(false);
        }
    }, [meta, request]);

    const updateFilter = useCallback(<Key extends keyof MediaFilters>(key: Key, value: MediaFilters[Key]) => {
        setFilters((current) => ({
            ...current,
            [key]: value,
        }));
    }, []);

    useEffect(() => {
        return () => {
            abortController.current?.abort();
        };
    }, []);

    const updateSelection = useCallback((updater: (draft: Set<number>) => void) => {
        setSelected((current) => {
            const next = new Set(current);
            updater(next);
            return next;
        });
    }, []);

    const toggleSelect = useCallback((id: number) => {
        updateSelection((draft) => {
            if (draft.has(id)) {
                draft.delete(id);
            } else {
                draft.add(id);
            }
        });
    }, [updateSelection]);

    const clearSelection = useCallback(() => setSelected(new Set()), []);

    const selectAll = useCallback(() => {
        updateSelection((draft) => {
            items.forEach((item) => draft.add(item.id));
        });
    }, [items, updateSelection]);

    const mutateItem = useCallback((id: number, updater: (item: MediaItem) => MediaItem) => {
        setItems((current) => current.map((item) => (item.id === id ? updater(item) : item)));
    }, []);

    const deleteItems = useCallback(async (ids: number[]) => {
        if (ids.length === 0) {
            return;
        }

        await Promise.all(
            ids.map(async (id) => {
                await request(`${endpoint}/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-TOKEN': csrfToken(),
                    },
                });
            })
        );

        setItems((current) => current.filter((item) => !ids.includes(item.id)));
        updateSelection((draft) => {
            ids.forEach((id) => draft.delete(id));
        });
    }, [endpoint, request, updateSelection]);

    const updateItem = useCallback<UseMediaLibraryResult['updateItem']>(async (id, payload) => {
        try {
            const response = await request(`${endpoint}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken(),
                },
                body: JSON.stringify(payload),
            });

            const updated = parsePayload({ data: [response.data ?? response] }).data?.[0] ?? response.data ?? response;

            mutateItem(id, () => updated);

            return updated as MediaItem;
        } catch (exception) {
            setError(exception instanceof Error ? exception.message : 'Unable to update media item.');
            return null;
        }
    }, [endpoint, mutateItem, request]);

    const replaceItem = useCallback<UseMediaLibraryResult['replaceItem']>(async (id, file, originalName) => {
        const formData = new FormData();
        formData.append('file', file);
        if (originalName) {
            formData.append('original_name', originalName);
        }

        try {
            const response = await request(`${endpoint}/${id}/replace`, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': csrfToken(),
                },
            });

            const replaced = parsePayload({ data: [response.data ?? response] }).data?.[0] ?? response.data ?? response;

            mutateItem(id, () => replaced);

            return replaced as MediaItem;
        } catch (exception) {
            setError(exception instanceof Error ? exception.message : 'Unable to replace media.');
            return null;
        }
    }, [endpoint, mutateItem, request]);

    const upload = useCallback<UseMediaLibraryResult['upload']>(async (files, extras) => {
        if (files.length === 0) {
            return;
        }

        setIsUploading(true);
        setError(null);

        const task = createUploadTask(files[0]);
        setUploadQueue((queue) => [...queue, { ...task, status: 'uploading' }]);

        const formData = new FormData();
        files.forEach((file) => formData.append('files[]', file));

        const folder = extras?.folder ?? filters.folder ?? defaultFolder ?? '/';

        formData.append('folder', folder);

        const tags = extras?.tags ?? filters.tag ? [filters.tag] : [];
        tags
            .concat(contextTag ? [contextTag] : [])
            .filter(Boolean)
            .forEach((tag) => formData.append('tags[]', tag as string));

        const xhr = new XMLHttpRequest();

        const updateProgress = (progress: number) => {
            setUploadQueue((queue) => queue.map((item) => (item.id === task.id ? { ...item, progress } : item)));
        };

        const finalize = (status: UploadTask['status'], errorMessage?: string) => {
            setUploadQueue((queue) =>
                queue.map((item) => (item.id === task.id ? { ...item, status, error: errorMessage } : item))
            );

            setTimeout(() => {
                setUploadQueue((queue) => queue.filter((item) => item.id !== task.id));
            }, 1500);
        };

        await new Promise<void>((resolve) => {
            xhr.upload.addEventListener('progress', (event) => {
                if (!event.lengthComputable) {
                    return;
                }

                updateProgress(Math.round((event.loaded / event.total) * 100));
            });

            xhr.addEventListener('readystatechange', () => {
                if (xhr.readyState !== XMLHttpRequest.DONE) {
                    return;
                }

                if (xhr.status >= 200 && xhr.status < 300) {
                    const response = JSON.parse(xhr.responseText ?? '{}');
                    const parsed = parsePayload(response);
                    setItems((current) => [...(parsed.data ?? []), ...current]);
                    finalize('finished');
                } else {
                    try {
                        const payload = JSON.parse(xhr.responseText ?? '{}');
                        finalize('failed', payload?.message ?? 'Upload failed.');
                        setError(payload?.message ?? 'Upload failed.');
                    } catch (parseError) {
                        finalize('failed', 'Upload failed.');
                        setError('Upload failed.');
                    }
                }

                resolve();
            });

            xhr.open('POST', endpoint, true);
            xhr.setRequestHeader('X-CSRF-TOKEN', csrfToken());
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.send(formData);
        });

        setIsUploading(false);
    }, [contextTag, defaultFolder, endpoint, filters.folder, filters.tag]);

    const canLoadMore = useMemo(() => Boolean(nextPageFromMeta(meta)), [meta]);

    return {
        items,
        filters,
        setFilters,
        updateFilter,
        isLoading,
        error,
        load,
        loadMore,
        canLoadMore,
        selected,
        toggleSelect,
        clearSelection,
        selectAll,
        deleteItems,
        updateItem,
        replaceItem,
        upload,
        uploadQueue,
        isUploading,
        viewMode,
        setViewMode,
        refresh,
    };
};
