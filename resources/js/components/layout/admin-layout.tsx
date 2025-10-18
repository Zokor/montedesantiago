import type { ReactNode } from 'react';

import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';

type BreadcrumbInput = {
    title?: string;
    label?: string;
    href?: string;
};

interface AdminLayoutProps {
    children: ReactNode;
    title?: string;
    breadcrumbs?: BreadcrumbInput[];
}

export function AdminLayout({ children, title, breadcrumbs = [] }: AdminLayoutProps) {
    const normalizedBreadcrumbs = (breadcrumbs ?? []).reduce<BreadcrumbItem[]>((accumulator, crumb) => {
        if (crumb?.title) {
            accumulator.push({ title: crumb.title, href: crumb.href });
            return accumulator;
        }

        if (crumb?.label) {
            accumulator.push({ title: crumb.label, href: crumb.href });
        }

        return accumulator;
    }, []);

    return (
        <AppSidebarLayout breadcrumbs={normalizedBreadcrumbs}>
            <div className="flex w-full flex-col gap-6 px-6 py-6">
                {title ? (
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
                    </div>
                ) : null}
                <div className="flex-1">
                    <div className="mx-auto w-full max-w-7xl">{children}</div>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
