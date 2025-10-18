import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AdminLayout title="Dashboard">
            <Head title="Dashboard" />
            <div className="grid gap-6 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Next steps</CardTitle>
                        <CardDescription>Quick links to keep building the CMS.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                        <p>- Design collections and content types under Collections.</p>
                        <p>- Create reusable component schemas in the Component Builder.</p>
                        <p>- Publish pages and manage media assets.</p>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Get started</CardTitle>
                        <CardDescription>Use the sidebar to navigate through collections, components, pages, and media.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p>Need the schema builder? Open the Component Builder to drag-and-drop new field definitions.</p>
                        <p>Headless consumers can read from the new `/api/v1` endpoints once the headless feature flag is enabled.</p>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
