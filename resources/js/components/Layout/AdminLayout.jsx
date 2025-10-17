import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';

export function AdminLayout({ children, title, breadcrumbs = [] }) {
    const normalizedBreadcrumbs = (breadcrumbs ?? [])
        .map((crumb) => {
            if (crumb?.title) {
                return { title: crumb.title, href: crumb.href };
            }

            return {
                title: crumb?.label ?? '',
                href: crumb?.href,
            };
        })
        .filter((crumb) => Boolean(crumb.title));

    return (
        <AppSidebarLayout breadcrumbs={normalizedBreadcrumbs}>
            <div className="flex w-full flex-col gap-6 px-6 py-6">
                {title ? (
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                            {title}
                        </h1>
                    </div>
                ) : null}
                <div className="flex-1">
                    <div className="mx-auto w-full max-w-7xl">
                        {children}
                    </div>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
