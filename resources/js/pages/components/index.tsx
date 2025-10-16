import { FormEvent, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';

import { AdminLayout } from '@/components/Layout/AdminLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface ComponentListItem {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    is_active: boolean;
    fields_count?: number;
    page_components_count?: number;
    created_at?: string | null;
    updated_at?: string | null;
}

interface ComponentsPayload {
    data: ComponentListItem[];
    meta?: {
        current_page: number;
        last_page: number;
        total: number;
        links?: PaginationLink[];
    };
}

interface PageProps {
    components: ComponentsPayload;
    filters: {
        search?: string;
        sort?: string;
        direction?: string;
    };
}

const ComponentsIndex = () => {
    const { components, filters } = usePage<PageProps>().props;
    const [search, setSearch] = useState(filters.search ?? '');

    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get('/bo/components', { search }, { preserveState: true, replace: true });
    };

    const toggleSort = (field: string) => {
        const isCurrent = filters.sort === field;
        const direction = isCurrent && filters.direction === 'asc' ? 'desc' : 'asc';

        router.get(
            '/bo/components',
            { search, sort: field, direction },
            { preserveState: true, replace: true }
        );
    };

    const paginationLinks = components.meta?.links ?? [];

    return (
        <AdminLayout
            title="Components"
            breadcrumbs={[
                { label: 'Components', href: '/bo/components' },
                { label: 'Index' },
            ]}
        >
            <div className="space-y-6">
                <Card>
                    <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <CardTitle>Schema Library</CardTitle>
                            <CardDescription>
                                Browse saved component schemas or create new ones in the builder.
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <form onSubmit={handleSearch} className="flex items-center gap-2">
                                <Input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search by name or slug"
                                    className="w-48 md:w-64"
                                />
                                <Button type="submit" variant="outline">
                                    Search
                                </Button>
                            </form>
                            <Button asChild>
                                <Link href="/bo/components/workspace">Open Builder</Link>
                            </Button>
                        </div>
                    </CardHeader>
                </Card>

                <Card>
                    <CardContent className="overflow-x-auto p-0">
                        <table className="w-full min-w-[640px] text-sm">
                            <thead>
                                <tr className="border-b bg-muted/40 text-left font-semibold">
                                    <th className="px-4 py-3">
                                        <button
                                            type="button"
                                            onClick={() => toggleSort('name')}
                                            className="flex items-center gap-1"
                                        >
                                            Name
                                            <span className="text-xs font-normal text-muted-foreground">
                                                {filters.sort === 'name' ? filters.direction : ''}
                                            </span>
                                        </button>
                                    </th>
                                    <th className="px-4 py-3">Slug</th>
                                    <th className="px-4 py-3">Fields</th>
                                    <th className="px-4 py-3">Pages using</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {components.data.map((component) => (
                                    <tr key={component.id} className="border-b last:border-b-0">
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{component.name}</div>
                                            {component.description && (
                                                <div className="text-xs text-muted-foreground">
                                                    {component.description}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">/{component.slug}</td>
                                        <td className="px-4 py-3">{component.fields_count ?? 0}</td>
                                        <td className="px-4 py-3">{component.page_components_count ?? 0}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={component.is_active ? 'secondary' : 'outline'}>
                                                {component.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                                {components.data.length === 0 && (
                                    <tr>
                                        <td className="px-4 py-6 text-center text-muted-foreground" colSpan={5}>
                                            No components found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                {paginationLinks.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                        {paginationLinks.map((link, index) => (
                            <Button
                                key={index}
                                variant={link.active ? 'default' : 'outline'}
                                disabled={!link.url}
                                asChild={Boolean(link.url)}
                                className={cn('h-8 px-3 text-xs', link.active && 'pointer-events-none')}
                            >
                                {link.url ? (
                                    <Link
                                        href={link.url}
                                        preserveState
                                        preserveScroll
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                )}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default ComponentsIndex;
