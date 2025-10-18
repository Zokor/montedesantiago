import { NavMain } from '@/components/navigation/nav-main';
import { NavUser } from '@/components/navigation/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    LayoutDashboard,
    Database,
    Puzzle,
    FileText,
    Image,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/branding/app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/bo/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Collections',
        href: '/bo/collections',
        icon: Database,
    },
    {
        title: 'Components',
        href: '/bo/components',
        icon: Puzzle,
    },
    {
        title: 'Pages',
        href: '/bo/pages',
        icon: FileText,
    },
    {
        title: 'Media',
        href: '/bo/media',
        icon: Image,
    },
    {
        title: 'Users',
        href: '/bo/users',
        icon: Users,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/bo/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
