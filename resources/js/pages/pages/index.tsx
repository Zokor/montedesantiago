import { usePage } from '@inertiajs/react';

import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PageListItem {
    id: number;
    title: string;
    slug: string;
    status: string;
    is_homepage: boolean;
    published_at?: string | null;
    creator?: { id: number; name: string } | null;
    updater?: { id: number; name: string } | null;
    page_components_count?: number;
}

interface PagesPayload {
    data: PageListItem[];
    meta?: {
        links?: PaginationLink[];
        total: number;
    };
}

interface PageProps {
    pages: PagesPayload;
    filters: {
        search?: string;
        status?: string;
    };
}

const PagesIndex = () => {
    const { pages } = usePage<PageProps>().props;

    return (
        <AdminLayout
            title="Pages"
            breadcrumbs={[
                { label: 'Pages', href: '/bo/pages' },
                { label: 'Overview' },
            ]}
        >
            <Card>
                <CardHeader>
                    <CardTitle>Pages admin</CardTitle>
                    <CardDescription>
                        Page builder UI is coming soon. In the meantime, manage content through the API or database.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Total pages: {pages.meta?.total ?? pages.data.length}
                    </p>
                </CardContent>
            </Card>
        </AdminLayout>
    );
};

export default PagesIndex;
