import { useEffect, useMemo, useState } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, PointerSensor, useDroppable, useDraggable, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2 } from 'lucide-react';

import { AdminLayout } from '@/components/layout/admin-layout';
import ConfirmDialog from '@/components/feedback/confirm-dialog';
import MediaPicker from '@/components/media/media-picker';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { MediaItem } from '@/hooks/use-media-library';

import { cn } from '@/lib/utils';

interface PaletteItem {
    type: FieldType;
    label: string;
    description: string;
    icon: string;
}

type FieldType =
    | 'short_text'
    | 'text'
    | 'number'
    | 'boolean'
    | 'date'
    | 'markdown'
    | 'image'
    | 'file'
    | 'select'
    | 'list'
    | 'collection'
    | 'component';

interface CanvasField {
    id: string;
    type: FieldType;
    name: string;
    slug: string;
    is_required: boolean;
    help_text: string;
    config: Record<string, unknown>;
}

interface PersistedComponent {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
}

type MediaReference = {
    id: number;
    original_name: string;
    url?: string | null;
    thumbnail_url?: string | null;
    type: string;
};

const palette: PaletteItem[] = [
    {
        type: 'short_text',
        label: 'Short Text',
        description: 'Single line input (max 256 chars)',
        icon: 'Type',
    },
    {
        type: 'text',
        label: 'Long Text',
        description: 'Multi-line text area',
        icon: 'FileText',
    },
    {
        type: 'markdown',
        label: 'Markdown',
        description: 'Content with markdown support',
        icon: 'TextQuote',
    },
    {
        type: 'number',
        label: 'Number',
        description: 'Numeric value with validation',
        icon: 'Hash',
    },
    {
        type: 'boolean',
        label: 'Toggle',
        description: 'Boolean true/false',
        icon: 'ToggleLeft',
    },
    {
        type: 'date',
        label: 'Date & Time',
        description: 'Date picker or datetime',
        icon: 'Calendar',
    },
    {
        type: 'image',
        label: 'Image',
        description: 'Single image upload field',
        icon: 'Image',
    },
    {
        type: 'file',
        label: 'File',
        description: 'Any file upload',
        icon: 'File',
    },
    {
        type: 'select',
        label: 'Select',
        description: 'Dropdown with static options',
        icon: 'ListFilter',
    },
    {
        type: 'list',
        label: 'List',
        description: 'List of values or nested fields',
        icon: 'List',
    },
    {
        type: 'collection',
        label: 'Collection reference',
        description: 'Link to entries from a collection',
        icon: 'Database',
    },
    {
        type: 'component',
        label: 'Component reference',
        description: 'Reuse another component schema',
        icon: 'Layers',
    },
];

const generateId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `field-${Date.now()}-${Math.random()}`);

const slugify = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

const CanvasSortableItem = ({ field, isSelected, onSelect, onRemove }: {
    field: CanvasField;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onRemove: (id: string) => void;
}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: field.id,
        data: { from: 'canvas' },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className={cn('border-dashed hover:border-foreground/40 cursor-grab', isSelected && 'border-primary shadow-sm', isDragging && 'opacity-70')}
            onClick={() => onSelect(field.id)}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" {...listeners} {...attributes} className="h-8 w-8 cursor-grab">
                        <GripVertical className="h-4 w-4" />
                    </Button>
                    <CardTitle className="text-base font-semibold">
                        {field.name || 'Untitled field'}
                    </CardTitle>
                </div>
                <ConfirmDialog
                    title="Remove field"
                    description={`This action will remove ${field.name ? `"${field.name}"` : 'this field'} from the component.`}
                    confirmLabel="Remove"
                    confirmLoadingLabel="Removing…"
                    onConfirm={() => onRemove(field.id)}
                    trigger={({ isPending }) => (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(event) => {
                                event.stopPropagation();
                            }}
                            disabled={isPending}
                        >
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    )}
                />
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Badge variant="outline">{field.type.replace('_', ' ')}</Badge>
                    {field.is_required && <Badge variant="secondary">Required</Badge>}
                </div>
                {field.help_text && <p>{field.help_text}</p>}
            </CardContent>
        </Card>
    );
};

const PaletteDraggableItem = ({ item }: { item: PaletteItem }) => {
    const id = `palette-${item.type}`;
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id,
        data: { from: 'palette', fieldType: item.type },
    });

    return (
        <Card
            ref={setNodeRef}
            className={cn('cursor-pointer border-dashed hover:border-foreground/50', isDragging && 'opacity-60')}
            {...listeners}
            {...attributes}
        >
            <CardHeader>
                <CardTitle className="text-base">{item.label}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
            </CardHeader>
        </Card>
    );
};

const CanvasDropZone = ({ isOver, children }: { isOver: boolean; children: React.ReactNode }) => (
    <div
        className={cn(
            'min-h-[320px] rounded-lg border border-dashed border-muted-foreground/40 p-4 transition-colors',
            isOver ? 'border-primary bg-primary/5' : 'bg-muted/10'
        )}
    >
        {children}
    </div>
);

interface InspectorProps {
    field: CanvasField | undefined;
    onChange: (fieldId: string, data: Partial<CanvasField>) => void;
}

const FieldInspector = ({ field, onChange }: InspectorProps) => {
    if (!field) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Field inspector</CardTitle>
                    <CardDescription>Select a field to edit its settings.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const update = (changes: Partial<CanvasField>) => onChange(field.id, changes);
    const [isMediaPickerOpen, setMediaPickerOpen] = useState(false);

    const defaultMedia = useMemo<MediaReference[]>(() => {
        const value = field.config?.default_media;
        if (!Array.isArray(value)) {
            return [];
        }

        return value as MediaReference[];
    }, [field.config?.default_media]);

    const allowMultipleMedia = Boolean(field.config?.allow_multiple);

    const handleMediaSelect = (items: MediaItem[]) => {
        const references: MediaReference[] = items.map((item) => ({
            id: item.id,
            original_name: item.original_name,
            url: item.url ?? null,
            thumbnail_url: item.thumbnail_url ?? null,
            type: item.type,
        }));

        const nextConfig = {
            ...(field.config ?? {}),
            default_media: references,
        };

        update({ config: nextConfig });
    };

    const removeDefaultMedia = (id: number) => {
        const nextConfig = {
            ...(field.config ?? {}),
            default_media: defaultMedia.filter((item) => item.id !== id),
        };

        update({ config: nextConfig });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Field settings</CardTitle>
                <CardDescription>Configure label, slug, validation, and helper text.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="field-name">Display name</Label>
                    <Input
                        id="field-name"
                        value={field.name}
                        onChange={(event) => update({ name: event.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="field-slug">Slug</Label>
                    <Input
                        id="field-slug"
                        value={field.slug}
                        onChange={(event) => update({ slug: slugify(event.target.value) })}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Checkbox
                        id="field-required"
                        checked={field.is_required}
                        onCheckedChange={(checked) => update({ is_required: Boolean(checked) })}
                    />
                    <Label htmlFor="field-required">Required field</Label>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="field-help">Help text</Label>
                    <textarea
                        id="field-help"
                        value={field.help_text}
                        onChange={(event) => update({ help_text: event.target.value })}
                        className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                </div>

                {['short_text', 'text', 'markdown'].includes(field.type) && (
                    <div className="space-y-2">
                        <Label htmlFor="field-placeholder">Placeholder</Label>
                        <Input
                            id="field-placeholder"
                            value={(field.config?.placeholder as string) ?? ''}
                            onChange={(event) => update({ config: { ...field.config, placeholder: event.target.value } })}
                        />
                    </div>
                )}

                {field.type === 'select' && (
                    <div className="space-y-2">
                        <Label htmlFor="field-options">Options (comma separated)</Label>
                        <Input
                            id="field-options"
                            value={Array.isArray(field.config?.options) ? (field.config?.options as string[]).join(', ') : ''}
                            onChange={(event) =>
                                update({
                                    config: {
                                        ...field.config,
                                        options: event.target.value
                                            .split(',')
                                            .map((option) => option.trim())
                                            .filter(Boolean),
                                    },
                                })
                            }
                        />
                    </div>
                )}

                {field.type === 'collection' && (
                    <div className="space-y-2">
                        <Label htmlFor="field-collection">Collection slug</Label>
                        <Input
                            id="field-collection"
                            value={(field.config?.collection as string) ?? ''}
                            onChange={(event) =>
                                update({ config: { ...field.config, collection: slugify(event.target.value) } })
                            }
                        />
                    </div>
                )}

                {['image', 'file'].includes(field.type) && (
                    <div className="space-y-3 rounded-lg border border-dashed border-muted-foreground/40 p-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label>Media options</Label>
                                <p className="text-xs text-muted-foreground">
                                    Configure how this field interacts with the media library.
                                </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setMediaPickerOpen(true)}>
                                Browse media
                            </Button>
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id={`field-${field.id}-allow-multiple`}
                                checked={allowMultipleMedia}
                                onCheckedChange={(checked) => {
                                    const nextConfig = {
                                        ...(field.config ?? {}),
                                        allow_multiple: Boolean(checked),
                                    };

                                    update({ config: nextConfig });
                                }}
                            />
                            <Label htmlFor={`field-${field.id}-allow-multiple`} className="text-sm font-normal">
                                Allow selecting multiple files
                            </Label>
                        </div>

                        <div className="space-y-2 text-xs">
                            <p className="font-medium text-muted-foreground">Default selection</p>
                            {defaultMedia.length === 0 ? (
                                <p className="text-muted-foreground">No default media selected.</p>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {defaultMedia.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between rounded border bg-muted/40 px-3 py-2"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary">{item.type.split('/')[0]}</Badge>
                                                <span className="font-medium text-foreground">{item.original_name}</span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeDefaultMedia(item.id)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <MediaPicker
                            open={isMediaPickerOpen}
                            onClose={() => setMediaPickerOpen(false)}
                            onSelect={handleMediaSelect}
                            allowMultiple={allowMultipleMedia}
                            contextTag={field.slug ? `component:${field.slug}` : undefined}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const ComponentWorkspace = () => {
    const [fields, setFields] = useState<CanvasField[]>([]);
    const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
    const [componentName, setComponentName] = useState('');
    const [componentDescription, setComponentDescription] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [notification, setNotification] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [components, setComponents] = useState<PersistedComponent[]>([]);
    const [isLoadingComponents, setIsLoadingComponents] = useState(false);

    const [draggedPaletteType, setDraggedPaletteType] = useState<FieldType | null>(null);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    const { setNodeRef: setCanvasRef, isOver } = useDroppable({ id: 'canvas' });

    useEffect(() => {
        const fetchComponents = async () => {
            setIsLoadingComponents(true);
            try {
                const response = await fetch('/bo/components?per_page=20', {
                    headers: { Accept: 'application/json' },
                });
                if (!response.ok) {
                    throw new Error('Unable to load components');
                }
                const payload = await response.json();
                const list = (payload.data ?? []).map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    slug: item.slug,
                    description: item.description,
                })) as PersistedComponent[];
                setComponents(list);
            } catch (fetchError) {
                console.error(fetchError);
            } finally {
                setIsLoadingComponents(false);
            }
        };

        fetchComponents();
    }, []);

    const selectedField = useMemo(
        () => fields.find((field) => field.id === selectedFieldId),
        [fields, selectedFieldId]
    );

    const addFieldFromPalette = (type: FieldType) => {
        const paletteItem = palette.find((item) => item.type === type);
        if (!paletteItem) {
            return;
        }

        const baseName = paletteItem.label;
        const baseSlug = slugify(baseName);
        let slug = baseSlug;
        let suffix = 1;
        while (fields.some((field) => field.slug === slug)) {
            slug = `${baseSlug}-${suffix}`;
            suffix += 1;
        }

        const newField: CanvasField = {
            id: generateId(),
            type,
            name: baseName,
            slug,
            is_required: false,
            help_text: '',
            config: {},
        };

        setFields((previous) => [...previous, newField]);
        setSelectedFieldId(newField.id);
    };

    const handleDragStart = (event: DragStartEvent) => {
        const data = event.active.data.current as { from?: string; fieldType?: FieldType } | undefined;

        if (data?.from === 'palette' && data.fieldType) {
            setDraggedPaletteType(data.fieldType);
        } else {
            setDraggedPaletteType(null);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (draggedPaletteType) {
            if (over?.id === 'canvas') {
                addFieldFromPalette(draggedPaletteType);
            }
            setDraggedPaletteType(null);
            return;
        }

        const activeIndex = fields.findIndex((field) => field.id === active.id);
        const overIndex = fields.findIndex((field) => field.id === over?.id);

        if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
            setFields((items) => arrayMove(items, activeIndex, overIndex));
        }
    };

    const updateField = (fieldId: string, changes: Partial<CanvasField>) => {
        setFields((previous) =>
            previous.map((field) => (field.id === fieldId ? { ...field, ...changes } : field))
        );
    };

    const removeField = (fieldId: string) => {
        setFields((previous) => previous.filter((field) => field.id !== fieldId));
        if (selectedFieldId === fieldId) {
            setSelectedFieldId(null);
        }
    };

    const resetWorkspace = () => {
        setFields([]);
        setComponentName('');
        setComponentDescription('');
        setIsActive(true);
        setSelectedFieldId(null);
        setNotification(null);
        setError(null);
    };

    const handleSave = async () => {
        setSaving(true);
        setNotification(null);
        setError(null);

        try {
            const payload = {
                name: componentName,
                description: componentDescription,
                is_active: isActive,
                fields: fields.map((field, index) => ({
                    name: field.name || `Field ${index + 1}`,
                    slug: field.slug,
                    data_type: field.type,
                    is_required: field.is_required,
                    help_text: field.help_text,
                    order: index,
                    config: field.config,
                })),
            };

            const response = await fetch('/bo/components', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorPayload = await response.json().catch(() => ({}));
                const message = errorPayload?.message ?? 'Unable to save component.';
                throw new Error(message);
            }

            const newComponent = await response.json();
            setNotification('Component saved successfully.');
            setComponents((previous) => [
                {
                    id: newComponent.data.id,
                    name: newComponent.data.name,
                    slug: newComponent.data.slug,
                    description: newComponent.data.description,
                },
                ...previous,
            ]);
            resetWorkspace();
        } catch (requestError) {
            console.error(requestError);
            setError(requestError instanceof Error ? requestError.message : 'Something went wrong while saving.');
        } finally {
            setSaving(false);
        }
    };

    const canSave = componentName.trim().length > 0 && fields.length > 0;

    return (
        <AdminLayout
            title="Component Builder"
            breadcrumbs={[
                { label: 'Components', href: '/bo/components/workspace' },
                { label: 'Builder' },
            ]}
        >
            <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold">Component Builder</h1>
                        <p className="text-muted-foreground">
                            Drag fields from the palette, configure them in the inspector, and save reusable component schemas.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={resetWorkspace} disabled={saving}>
                            Reset
                        </Button>
                        <Button onClick={handleSave} disabled={!canSave || saving}>
                            {saving ? 'Saving…' : 'Save component'}
                        </Button>
                    </div>
                </div>

                {notification && (
                    <Alert className="border-primary bg-primary/5">
                        <AlertDescription>{notification}</AlertDescription>
                    </Alert>
                )}
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <DndContext
                    sensors={sensors}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragCancel={() => setDraggedPaletteType(null)}
                >
                    <div className="grid gap-6 lg:grid-cols-[320px_1fr_320px]">
                        <Card className="h-fit">
                            <CardHeader>
                                <CardTitle>Field palette</CardTitle>
                                <CardDescription>Select a field type and drag it onto the canvas.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {palette.map((item) => (
                                    <PaletteDraggableItem key={item.type} item={item} />
                                ))}
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            <Card>
                            <CardHeader>
                                <CardTitle>Component details</CardTitle>
                                <CardDescription>These details describe the component schema.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="component-name">Name</Label>
                                    <Input
                                        id="component-name"
                                        value={componentName}
                                        onChange={(event) => setComponentName(event.target.value)}
                                        placeholder="Hero Banner"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="component-description">Description</Label>
                                    <textarea
                                        id="component-description"
                                        value={componentDescription}
                                        onChange={(event) => setComponentDescription(event.target.value)}
                                        className="min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        placeholder="A reusable hero section with heading, body and CTA."
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="component-active"
                                        checked={isActive}
                                        onCheckedChange={(checked) => setIsActive(Boolean(checked))}
                                    />
                                    <Label htmlFor="component-active">Component is active</Label>
                                </div>
                            </CardContent>
                        </Card>

                            <SortableContext items={fields.map((field) => field.id)} strategy={verticalListSortingStrategy}>
                                <CanvasDropZone isOver={isOver}>
                                    <div ref={setCanvasRef} className="space-y-3">
                                        {fields.length === 0 && (
                                            <div className="flex h-32 flex-col items-center justify-center text-sm text-muted-foreground">
                                                <Plus className="mb-2 h-5 w-5" />
                                                Drag fields from the left palette into this canvas.
                                            </div>
                                        )}
                                        {fields.map((field) => (
                                            <CanvasSortableItem
                                                key={field.id}
                                                field={field}
                                                isSelected={selectedFieldId === field.id}
                                                onSelect={setSelectedFieldId}
                                                onRemove={removeField}
                                            />
                                        ))}
                                    </div>
                                </CanvasDropZone>
                            </SortableContext>
                        </div>

                        <div className="space-y-4">
                            <FieldInspector field={selectedField ?? undefined} onChange={updateField} />
                            <Card>
                            <CardHeader>
                                <CardTitle>Existing components</CardTitle>
                                <CardDescription>Recently created schemas.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {isLoadingComponents && <p className="text-sm text-muted-foreground">Loading…</p>}
                                {!isLoadingComponents && components.length === 0 && (
                                    <p className="text-sm text-muted-foreground">Components will appear here after saving.</p>
                                )}
                                {!isLoadingComponents &&
                                    components.map((component) => (
                                        <div key={component.id} className="space-y-1 rounded-lg border bg-muted/20 p-3 text-sm">
                                            <div className="font-medium">{component.name}</div>
                                            <div className="text-muted-foreground">/{component.slug}</div>
                                            {component.description && (
                                                <div className="text-muted-foreground">{component.description}</div>
                                            )}
                                        </div>
                                    ))}
                            </CardContent>
                        </Card>
                    </div>
                    </div>
                </DndContext>

                <Card>
                    <CardHeader>
                        <CardTitle>Payload preview</CardTitle>
                        <CardDescription>Review the JSON that will be sent to the API.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <pre className="rounded bg-muted/40 p-4 text-xs">
                            {JSON.stringify(
                                {
                                    name: componentName,
                                    description: componentDescription,
                                    is_active: isActive,
                                    fields,
                                },
                                null,
                                2
                            )}
                        </pre>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default ComponentWorkspace;
