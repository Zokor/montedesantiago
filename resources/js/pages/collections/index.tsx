import { FormEvent, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';

import { AdminLayout } from '@/components/layout/admin-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface CollectionListItem {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    is_active: boolean;
    fields_count?: number;
    collection_items_count?: number;
    created_at?: string | null;
    updated_at?: string | null;
}

interface CollectionsPayload {
    data: CollectionListItem[];
    meta?: {
        links?: PaginationLink[];
        total: number;
    };
}

interface PageProps {
    collections: CollectionsPayload;
    filters: {
        search?: string;
        status?: string;
        sort?: string;
        direction?: string;
    };
}

const CollectionsIndex = () => {
    const { collections, filters } = usePage<PageProps>().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    const handleFilter = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get(
            '/bo/collections',
            { search, status: status || undefined },
            { preserveState: true, replace: true }
        );
    };

    const paginationLinks = collections.meta?.links ?? [];

    return (
        <AdminLayout
            title="Collections"
            breadcrumbs={[
                { label: 'Collections', href: '/bo/collections' },
                { label: 'Index' },
            ]}
        >
            <div className="space-y-6">
                <Card>
                    <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <CardTitle>Content Collections</CardTitle>
                            <CardDescription>
                                Manage repeatable content structures used across the CMS.
                            </CardDescription>
                        </div>
                        <div className="flex flex-col gap-2 md:flex-row">
                            <form
                                onSubmit={handleFilter}
                                className="flex flex-col gap-2 md:flex-row md:items-center"
                            >
                                <Input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search collections"
                                    className="w-full md:w-56"
                                />
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="status" className="text-xs text-muted-foreground">
                                        Status
                                    </Label>
                                    <select
                                        id="status"
                                        value={status}
                                        onChange={(event) => setStatus(event.target.value)}
                                        className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                                    >
                                        <option value="">Any</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                <Button type="submit" variant="outline">
                                    Apply
                                </Button>
                            </form>
                        </div>
                    </CardHeader>
                </Card>

                <Card>
                    <CardContent className="overflow-x-auto p-0">
                        <table className="w-full min-w-[640px] text-sm">
                            <thead>
                                <tr className="border-b bg-muted/40 text-left font-semibold">
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Slug</th>
                                    <th className="px-4 py-3">Fields</th>
                                    <th className="px-4 py-3">Items</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {collections.data.map((collection) => (
                                    <tr key={collection.id} className="border-b last:border-b-0">
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{collection.name}</div>
                                            {collection.description && (
                                                <div className="text-xs text-muted-foreground">
                                                    {collection.description}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">/{collection.slug}</td>
                                        <td className="px-4 py-3">{collection.fields_count ?? 0}</td>
                                        <td className="px-4 py-3">{collection.collection_items_count ?? 0}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={collection.is_active ? 'secondary' : 'outline'}>
                                                {collection.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                                {collections.data.length === 0 && (
                                    <tr>
                                        <td className="px-4 py-6 text-center text-muted-foreground" colSpan={5}>
                                            No collections found.
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

export default CollectionsIndex;
