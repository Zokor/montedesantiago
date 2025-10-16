import { usePage } from '@inertiajs/react';

import { AdminLayout } from '@/components/Layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface MediaItem {
    id: number;
    original_filename: string;
    mime_type: string;
    size: number;
    folder: string;
    url?: string;
}

interface MediaPayload {
    data: MediaItem[];
    meta?: {
        links?: PaginationLink[];
        total: number;
    };
}

interface PageProps {
    media: MediaPayload;
    filters: {
        search?: string;
        folder?: string;
        mime?: string;
    };
    showPagination: boolean;
}

const MediaIndex = () => {
    const { media } = usePage<PageProps>().props;

    return (
        <AdminLayout
            title="Media"
            breadcrumbs={[
                { label: 'Media', href: '/bo/media' },
                { label: 'Library' },
            ]}
        >
            <Card>
                <CardHeader>
                    <CardTitle>Media library</CardTitle>
                    <CardDescription>
                        Upload and management UI is under development. Use the API endpoints for now.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Total files: {media.meta?.total ?? media.data.length}
                    </p>
                </CardContent>
            </Card>
        </AdminLayout>
    );
};

export default MediaIndex;
