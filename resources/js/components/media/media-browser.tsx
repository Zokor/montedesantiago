import { useCallback, useEffect, useState } from 'react';
import {
    FilesIcon,
    LayoutGridIcon,
    ListIcon,
    Loader2Icon,
    SearchIcon,
    Trash2Icon,
    UploadIcon,
    Check,
    Copy,
} from 'lucide-react';

import { useMediaLibrary, MediaFilters, MediaItem, MediaPayload, MediaViewMode } from '@/hooks/use-media-library';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useClipboard } from '@/hooks/use-clipboard';

interface MediaBrowserProps {
    initialPayload: MediaPayload;
    initialFilters?: MediaFilters;
    folders: string[];
    tags: string[];
    mode?: 'page' | 'modal';
    contextTag?: string | null;
    allowMultiple?: boolean;
    onSelect?: (items: MediaItem[]) => void;
}

interface SelectionSummaryProps {
    count: number;
    onClear: () => void;
    onDelete: () => void;
    onSelect?: () => void;
    allowBulkSelect?: boolean;
}

interface UploadDropzoneProps {
    onUpload: (files: File[]) => void;
    isUploading: boolean;
    queue: { id: string; name: string; progress: number; status: 'pending' | 'uploading' | 'finished' | 'failed'; error?: string }[];
}

interface MediaGridProps {
    items: MediaItem[];
    selected: Set<number>;
    onSelect: (item: MediaItem) => void;
    onPreview: (item: MediaItem) => void;
}

interface MediaListProps extends MediaGridProps {}

interface MediaPreviewProps {
    item: MediaItem | null;
    open: boolean;
    onClose: () => void;
    onRename: (payload: { original_name: string; folder: string; tags: string[] }) => Promise<void>;
    onReplace: (file: File, name?: string) => Promise<void>;
    onDelete: () => Promise<void>;
}

const debounce = (callback: () => void, delay: number) => {
    const handle = setTimeout(callback, delay);
    return () => clearTimeout(handle);
};

const humanReadableType = (type: string) => {
    if (type.startsWith('image/')) return 'Image';
    if (type.startsWith('video/')) return 'Video';
    if (type.startsWith('audio/')) return 'Audio';
    if (type === 'application/pdf') return 'PDF';
    if (type.includes('zip')) return 'Archive';
    return 'File';
};

const extractExtension = (filename: string) => {
    const parts = filename.split('.');
    if (parts.length <= 1) {
        return '';
    }
    return parts.pop() ?? '';
};

const acronymFromName = (value: string): string => {
    const withoutExtension = value.replace(/\.[^/.]+$/, '');
    const parts = withoutExtension.split(/[\s._-]+/).filter(Boolean);

    if (parts.length === 0) {
        return withoutExtension.slice(0, 3).toUpperCase() || '?';
    }

    const acronym = parts.map((part) => part[0] ?? '').join('');

    if (acronym.length >= 2) {
        return acronym.slice(0, 3).toUpperCase();
    }

    return (parts[0]?.slice(0, 3) ?? '?').toUpperCase();
};

const mediaAcronym = (item: MediaItem): string => {
    const source = item.original_name || item.filename || '';
    return acronymFromName(source);
};

const mediaLabel = (item: MediaItem): string => {
    const extension = extractExtension(item.filename).toUpperCase();
    if (extension) {
        return extension;
    }

    return humanReadableType(item.type).toUpperCase();
};

const renderFallbackCardPreview = (item: MediaItem) => (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background/90 text-xl font-semibold text-muted-foreground shadow-sm">
            {mediaAcronym(item)}
        </div>
        <span className="text-xs font-medium uppercase text-muted-foreground/70">{mediaLabel(item)}</span>
    </div>
);

const renderFallbackModalPreview = (item: MediaItem) => (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-muted">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-background/90 text-3xl font-semibold text-muted-foreground shadow-md">
            {mediaAcronym(item)}
        </div>
        <div className="text-sm font-medium uppercase text-muted-foreground/70">{mediaLabel(item)}</div>
    </div>
);

const relativeTimeFromNow = (value?: string | null) => {
    if (!value) {
        return '—';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '—';
    }

    const seconds = Math.round((Date.now() - date.getTime()) / 1000);
    const absoluteSeconds = Math.abs(seconds);

    const divisorMap: [number, Intl.RelativeTimeFormatUnit][] = [
        [60, 'second'],
        [60, 'minute'],
        [24, 'hour'],
        [7, 'day'],
        [4.34524, 'week'],
        [12, 'month'],
        [Number.POSITIVE_INFINITY, 'year'],
    ];

    const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

    let duration = absoluteSeconds;
    let unit: Intl.RelativeTimeFormatUnit = 'second';

    for (const [threshold, nextUnit] of divisorMap) {
        if (Math.abs(duration) < threshold) {
            unit = nextUnit;
            break;
        }
        duration /= threshold;
    }

    const valueRounded = Math.round(seconds < 0 ? duration : -duration);

    return formatter.format(valueRounded, unit);
};

const ALL_SELECT_VALUE = '__select_all__';
const SIZE_ANY_SELECT_VALUE = '__select_size_any__';

const typeFilters = [
    { value: 'image', label: 'Images' },
    { value: 'video', label: 'Videos' },
    { value: 'audio', label: 'Audio' },
    { value: 'application/pdf', label: 'Documents' },
];

const sizeFilters = [
    { value: '0-512000', label: 'Under 500KB' },
    { value: '512000-2097152', label: '0.5MB - 2MB' },
    { value: '2097152-8388608', label: '2MB - 8MB' },
    { value: '8388608-', label: 'Over 8MB' },
];

const sortOptions = [
    { value: 'created_at:desc', label: 'Newest first' },
    { value: 'created_at:asc', label: 'Oldest first' },
    { value: 'original_name:asc', label: 'Name (A-Z)' },
    { value: 'original_name:desc', label: 'Name (Z-A)' },
    { value: 'size:desc', label: 'Size (largest)' },
    { value: 'size:asc', label: 'Size (smallest)' },
];

export const MediaBrowser = ({
    initialPayload,
    initialFilters,
    folders,
    tags,
    mode = 'page',
    contextTag,
    allowMultiple = true,
    onSelect,
}: MediaBrowserProps) => {
    const {
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
    } = useMediaLibrary({
        initialPayload,
        initialFilters,
        contextTag,
    });

    const [search, setSearch] = useState(filters.search ?? '');
    const [sizeRange, setSizeRange] = useState(() => {
        const hasMin = filters.size_min !== undefined && filters.size_min !== null;
        const hasMax = filters.size_max !== undefined && filters.size_max !== null;

        if (hasMin && hasMax) {
            return `${filters.size_min}-${filters.size_max}`;
        }

        if (hasMin && !hasMax) {
            return `${filters.size_min}-`;
        }

        return '';
    });
    const [preview, setPreview] = useState<MediaItem | null>(null);

    useEffect(() => {
        if (!contextTag) {
            return;
        }

        if (filters.context_tag === contextTag) {
            return;
        }

        setFilters((current) => ({
            ...current,
            context_tag: contextTag,
        }));
    }, [contextTag, filters.context_tag, setFilters]);

    useEffect(() => {
        const dispose = debounce(() => load(false), 250);
        return () => dispose();
    }, [filters, load]);

    useEffect(() => {
        updateFilter('search', search);
    }, [search, updateFilter]);

    const hasSelection = selected.size > 0;

    const handleDeleteSelection = useCallback(async () => {
        if (selected.size === 0) {
            return;
        }

        await deleteItems(Array.from(selected));
        setPreview(null);
    }, [deleteItems, selected, setPreview]);

    const handleSizeChange = (value: string) => {
        if (value === SIZE_ANY_SELECT_VALUE) {
            setSizeRange('');
            updateFilter('size_min', null);
            updateFilter('size_max', null);
            return;
        }

        setSizeRange(value);

        if (!value) {
            updateFilter('size_min', null);
            updateFilter('size_max', null);
            return;
        }

        const [min, max] = value.split('-');
        updateFilter('size_min', min ? Number(min) : null);
        updateFilter('size_max', max ? Number(max) : null);
    };

    const handleSortChange = (value: string) => {
        const [sort, direction] = value.split(':');
        updateFilter('sort', sort);
        updateFilter('direction', direction as 'asc' | 'desc');
    };

    const handleRename = async (payload: { original_name: string; folder: string; tags: string[] }) => {
        if (!preview) {
            return;
        }

        const result = await updateItem(preview.id, payload);
        if (result) {
            setPreview(result);
        }
    };

    const handleReplace = async (file: File, name?: string | null) => {
        if (!preview) {
            return;
        }

        const result = await replaceItem(preview.id, file, name ?? preview.original_name);
        if (result) {
            setPreview(result);
        }
    };

    const handleSelect = (item: MediaItem) => {
        toggleSelect(item.id);
        if (!allowMultiple && onSelect) {
            onSelect([item]);
        }
    };

    const confirmSelection = useCallback(() => {
        if (!onSelect) {
            return;
        }

        const selectedItems = items.filter((item) => selected.has(item.id));
        onSelect(selectedItems);
    }, [items, onSelect, selected]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
                return;
            }

            if ((event.key === 'Delete' || event.key === 'Backspace') && selected.size > 0) {
                event.preventDefault();
                void handleDeleteSelection();
            }

            if ((event.key === 'a' || event.key === 'A') && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                if (allowMultiple) {
                    selectAll();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [allowMultiple, handleDeleteSelection, selectAll, selected]);

    return (
        <div className="flex h-full flex-col gap-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 items-center gap-2">
                    <div className="relative w-full max-w-sm">
                        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search media..."
                            className="pl-9"
                        />
                    </div>

                    <Select
                        value={filters.type ?? ALL_SELECT_VALUE}
                        onValueChange={(value) => updateFilter('type', value === ALL_SELECT_VALUE ? null : value)}
                    >
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL_SELECT_VALUE}>All types</SelectItem>
                            {typeFilters.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.tag ?? ALL_SELECT_VALUE}
                        onValueChange={(value) => updateFilter('tag', value === ALL_SELECT_VALUE ? null : value)}
                    >
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Tags" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL_SELECT_VALUE}>All tags</SelectItem>
                            {tags.filter((tag) => Boolean(tag?.trim?.() ?? tag)).map((tag) => (
                                <SelectItem key={tag} value={tag}>
                                    {tag}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.folder ?? ALL_SELECT_VALUE}
                        onValueChange={(value) => updateFilter('folder', value === ALL_SELECT_VALUE ? null : value)}
                    >
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Folder" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL_SELECT_VALUE}>All folders</SelectItem>
                            {folders.filter((folder) => Boolean(folder?.trim?.() ?? folder)).map((folder) => (
                                <SelectItem key={folder} value={folder}>
                                    {folder}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Input
                        type="date"
                        value={filters.from ?? ''}
                        onChange={(event) => updateFilter('from', event.target.value || null)}
                        className="w-[150px]"
                    />
                    <Input
                        type="date"
                        value={filters.to ?? ''}
                        onChange={(event) => updateFilter('to', event.target.value || null)}
                        className="w-[150px]"
                    />

                    <Select value={sizeRange || SIZE_ANY_SELECT_VALUE} onValueChange={handleSizeChange}>
                        <SelectTrigger className="w-[170px]">
                            <SelectValue placeholder="Size" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={SIZE_ANY_SELECT_VALUE}>Any size</SelectItem>
                            {sizeFilters.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={`${filters.sort ?? 'created_at'}:${filters.direction ?? 'desc'}`}
                        onValueChange={handleSortChange}
                    >
                        <SelectTrigger className="w-[170px]">
                            <SelectValue placeholder="Sort" />
                        </SelectTrigger>
                        <SelectContent>
                            {sortOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')}>
                        <LayoutGridIcon className="h-4 w-4" />
                        <span className="sr-only">Grid view</span>
                    </Button>
                    <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')}>
                        <ListIcon className="h-4 w-4" />
                        <span className="sr-only">List view</span>
                    </Button>
                        <Button variant="outline" size="icon" onClick={() => refresh()}>
                            <Loader2Icon className="h-4 w-4" />
                            <span className="sr-only">Refresh</span>
                        </Button>
                </div>
            </div>

            <UploadDropzone onUpload={(files) => upload(files)} isUploading={isUploading} queue={uploadQueue} />

            {error && (
                <Card className="border-destructive/50 bg-destructive/10">
                    <CardContent className="py-3 text-sm text-destructive-foreground">{error}</CardContent>
                </Card>
            )}

            {hasSelection && (
                <SelectionSummary
                    count={selected.size}
                    onClear={clearSelection}
                    onDelete={handleDeleteSelection}
                    onSelect={onSelect ? confirmSelection : undefined}
                    allowBulkSelect={allowMultiple}
                />
            )}

            <div className="relative flex-1 overflow-hidden rounded-lg border bg-background">
                {isLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60">
                        <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                )}

                {items.length === 0 && !isLoading ? (
                    <div className="flex h-full flex-col items-center justify-center gap-3 p-10 text-center text-sm text-muted-foreground">
                        <FilesIcon className="h-10 w-10" />
                        <p>No media found. Drag and drop files above to upload the first assets.</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <MediaGrid items={items} selected={selected} onSelect={handleSelect} onPreview={setPreview} />
                ) : (
                    <MediaList items={items} selected={selected} onSelect={handleSelect} onPreview={setPreview} />
                )}

                {canLoadMore && (
                    <div className="border-t bg-muted/40 p-4 text-center">
                        <Button variant="ghost" onClick={loadMore} disabled={isLoading}>
                            {isLoading ? 'Loading…' : 'Load more'}
                        </Button>
                    </div>
                )}
            </div>

            <MediaPreviewDialog
                item={preview}
                open={Boolean(preview)}
                onClose={() => setPreview(null)}
                onRename={async (payload) => {
                    await handleRename(payload);
                }}
                onReplace={async (file, name) => {
                    await handleReplace(file, name);
                }}
                onDelete={async () => {
                    if (!preview) return;
                    await deleteItems([preview.id]);
                    setPreview(null);
                }}
            />
        </div>
    );
};

const SelectionSummary = ({ count, onClear, onDelete, onSelect, allowBulkSelect }: SelectionSummaryProps) => (
    <Card className="border-primary/50 bg-primary/10">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
            <span className="font-medium text-primary">{count} item{count === 1 ? '' : 's'} selected</span>
            <div className="flex items-center gap-2">
                {allowBulkSelect && onSelect && (
                    <Button size="sm" onClick={onSelect}>
                        Use selection
                    </Button>
                )}
                <Button size="sm" variant="destructive" onClick={onDelete}>
                    Delete selected
                </Button>
                <Button size="sm" variant="outline" onClick={onClear}>
                    Clear selection
                </Button>
            </div>
        </CardContent>
    </Card>
);

const UploadDropzone = ({ onUpload, isUploading, queue }: UploadDropzoneProps) => {
    const [isDragActive, setIsDragActive] = useState(false);

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragActive(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragActive(false);
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragActive(false);

        const files = Array.from(event.dataTransfer.files ?? []).filter((file) => file.size > 0);
        if (files.length) {
            onUpload(files);
        }
    };

    const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files ? Array.from(event.target.files) : [];
        if (files.length) {
            onUpload(files);
        }
    };

    return (
        <div
            className={cn(
                'flex w-full flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/60 bg-muted/20 p-6 text-center transition-colors',
                isDragActive && 'border-primary bg-primary/10'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <UploadIcon className="mb-2 h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
                Drag and drop files here, or
                <label className="mx-1 cursor-pointer font-medium text-primary underline">
                    browse
                    <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileInput}
                        disabled={isUploading}
                    />
                </label>
                your computer.
            </p>
            {queue.length > 0 && (
                <div className="mt-4 flex w-full max-w-lg flex-col gap-2 text-left">
                    {queue.map((task) => (
                        <div
                            key={task.id}
                            className="overflow-hidden rounded border bg-background shadow-sm"
                        >
                            <div className="flex items-center justify-between px-3 py-2 text-sm">
                                <span className="font-medium">{task.name}</span>
                                <span className="text-muted-foreground">{task.progress}%</span>
                            </div>
                            <div className="h-1 w-full overflow-hidden bg-muted">
                                <div
                                    className={cn('h-full bg-primary transition-all', task.status === 'failed' && 'bg-destructive')}
                                    style={{ width: `${task.progress}%` }}
                                />
                            </div>
                            {task.error && (
                                <p className="px-3 py-1 text-xs text-destructive">{task.error}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const CopyUrlButton = ({ url }: { url?: string | null }) => {
    const [copiedValue, copy] = useClipboard();

    if (!url) {
        return null;
    }

    const isCopied = copiedValue === url;
    const Icon = isCopied ? Check : Copy;

    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        event.preventDefault();
        await copy(url);
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={cn(
                'inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background/95 text-foreground shadow-sm transition cursor-pointer',
                isCopied ? 'border-primary text-primary' : 'hover:bg-background'
            )}
            aria-label={isCopied ? 'URL copied' : 'Copy URL'}
            title={isCopied ? 'Copied to clipboard' : 'Copy file URL'}
        >
            <Icon className="h-4 w-4" />
        </button>
    );
};

const MediaGrid = ({ items, selected, onSelect, onPreview }: MediaGridProps) => (
    <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => {
            const isSelected = selected.has(item.id);
            const extensionLabel = mediaLabel(item);
            const preview = item.thumbnail_url ?? item.url ?? '';

            return (
                <Card
                    key={item.id}
                    className={cn(
                        'group relative cursor-pointer transition-shadow hover:shadow-lg',
                        isSelected && 'border-primary bg-primary/10 ring-1 ring-primary/30'
                    )}
                    onClick={() => onSelect(item)}
                    onDoubleClick={() => onPreview(item)}
                >
                    <div className="relative flex h-40 items-center justify-center overflow-hidden bg-muted">
                        {preview ? (
                            <img src={preview} alt={item.original_name} className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                            renderFallbackCardPreview(item)
                        )}
                        <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-background/80 px-2 py-1 shadow-sm backdrop-blur">
                            <div className="flex items-center">
                                <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() => onSelect(item)}
                                    className="pointer-events-none border-background text-background"
                                />
                            </div>
                            <Badge variant="secondary" className="bg-transparent text-foreground">
                                {humanReadableType(item.type)}
                            </Badge>
                        </div>
                        <div
                            className={cn(
                                'pointer-events-none absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100',
                                isSelected && 'opacity-100'
                            )}
                        >
                            <div className="pointer-events-auto">
                                <CopyUrlButton url={item.url} />
                            </div>
                        </div>
                    </div>
                    <CardHeader className="gap-1 py-3">
                        <CardTitle className="line-clamp-1 text-sm font-semibold">{item.original_name}</CardTitle>
                        <CardDescription className="text-xs">{item.formatted_size ?? `${(item.size / 1024).toFixed(1)} KB`}</CardDescription>
                    </CardHeader>
                        <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{extensionLabel}</span>
                            <span>{relativeTimeFromNow(item.created_at)}</span>
                        </CardFooter>
                    </Card>
                );
            })}
        </div>
);

const MediaList = ({ items, selected, onSelect, onPreview }: MediaListProps) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm">
            <thead>
                <tr className="border-b bg-muted/50">
                    <th className="w-12 px-4 py-3 text-left">Select</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Size</th>
                    <th className="px-4 py-3 text-left">Folder</th>
                    <th className="px-4 py-3 text-left">Updated</th>
                    <th className="w-20 px-4 py-3 text-right">Actions</th>
                </tr>
            </thead>
            <tbody>
                {items.map((item) => {
                    const isSelected = selected.has(item.id);
                    return (
                        <tr
                            key={item.id}
                            className={cn(
                                'border-b transition-colors hover:bg-muted/50',
                                isSelected && 'bg-primary/10'
                            )}
                            onClick={() => onSelect(item)}
                            onDoubleClick={() => onPreview(item)}
                        >
                            <td className="px-4 py-3">
                                <Checkbox checked={isSelected} onCheckedChange={() => onSelect(item)} />
                            </td>
                            <td className="max-w-xs truncate px-4 py-3 font-medium">{item.original_name}</td>
                            <td className="px-4 py-3">{humanReadableType(item.type)}</td>
                            <td className="px-4 py-3">{item.formatted_size ?? `${(item.size / 1024).toFixed(1)} KB`}</td>
                            <td className="px-4 py-3">{item.folder ?? '/'}</td>
                            <td className="px-4 py-3 text-muted-foreground">{relativeTimeFromNow(item.updated_at)}</td>
                            <td className="px-4 py-3 text-right">
                                <CopyUrlButton url={item.url} />
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>
);

const MediaPreviewDialog = ({ item, open, onClose, onRename, onReplace, onDelete }: MediaPreviewProps) => {
    const [name, setName] = useState('');
    const [folder, setFolder] = useState('/');
    const [tags, setTags] = useState('');

    useEffect(() => {
        if (item) {
            setName(item.original_name);
            setFolder(item.folder ?? '/');
            setTags((item.tags ?? []).join(', '));
        }
    }, [item]);

    const handleSubmit = async () => {
        await onRename({ original_name: name, folder, tags: tags.split(',').map((value) => value.trim()).filter(Boolean) });
    };

    if (!item) {
        return null;
    }

    const preview = item.url ?? item.thumbnail_url ?? '';

    return (
        <Dialog open={open} onOpenChange={(isOpen) => (!isOpen ? onClose() : null)}>
            <DialogContent className="max-w-3xl overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Media details</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="flex flex-col gap-3">
                        <div className="flex h-64 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                            {preview ? (
                                <img src={preview} alt={item.original_name} className="h-full w-full object-contain" />
                            ) : (
                                renderFallbackModalPreview(item)
                            )}
                        </div>
                        <div className="grid gap-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">File name</span>
                                <span className="font-medium">{item.filename}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Type</span>
                                <span className="font-medium">{item.type}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Size</span>
                                <span className="font-medium">{item.formatted_size ?? `${(item.size / 1024).toFixed(1)} KB`}</span>
                            </div>
                            {item.width && item.height ? (
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Dimensions</span>
                                    <span className="font-medium">{item.width} × {item.height}px</span>
                                </div>
                            ) : null}
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Uploaded</span>
                                <span className="font-medium">{relativeTimeFromNow(item.created_at)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="media-name">Display name</Label>
                            <Input id="media-name" value={name} onChange={(event) => setName(event.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="media-folder">Folder</Label>
                            <Input id="media-folder" value={folder} onChange={(event) => setFolder(event.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="media-tags">Tags</Label>
                            <Input
                                id="media-tags"
                                value={tags}
                                placeholder="marketing, homepage"
                                onChange={(event) => setTags(event.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Separate multiple tags with commas.</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Button size="sm" onClick={handleSubmit}>
                                Save changes
                            </Button>
                            <label className="flex cursor-pointer items-center gap-2 text-sm text-primary">
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={(event) => {
                                        const file = event.target.files?.[0];
                                        if (file) {
                                            void onReplace(file, name);
                                        }
                                    }}
                                />
                                Replace file
                            </label>
                            <Button size="sm" variant="destructive" onClick={() => onDelete()}>
                                <Trash2Icon className="mr-1 h-4 w-4" /> Delete
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default MediaBrowser;
