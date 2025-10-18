import { usePage } from '@inertiajs/react';

import { AdminLayout } from '@/components/layout/admin-layout';
import MediaBrowser from '@/components/media/media-browser';
import { MediaFilters, MediaPayload } from '@/hooks/use-media-library';

interface PageProps {
    media: MediaPayload;
    filters: MediaFilters;
    folders: string[];
    tags: string[];
}

const MediaIndex = () => {
    const { media, filters, folders, tags } = usePage<PageProps>().props;

    return (
        <AdminLayout
            title="Media"
            breadcrumbs={[
                { label: 'Media', href: '/bo/media' },
                { label: 'Library' },
            ]}
        >
            <MediaBrowser initialPayload={media} initialFilters={filters} folders={folders} tags={tags} />
        </AdminLayout>
    );
};

export default MediaIndex;
