import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Database,
    Puzzle,
    FileText,
    Image,
    Users,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navigation = [
    { name: 'Dashboard', href: '/bo/dashboard', icon: LayoutDashboard },
    { name: 'Collections', href: '/bo/collections', icon: Database },
    { name: 'Components', href: '/bo/components', icon: Puzzle },
    { name: 'Pages', href: '/bo/pages', icon: FileText },
    { name: 'Media', href: '/bo/media', icon: Image },
    { name: 'Users', href: '/bo/users', icon: Users },
];

export function Sidebar({ isOpen, onClose }) {
    const { url } = usePage();

    return (
        <>
            {/* Desktop sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-800 px-6 pb-4 shadow-sm border-r border-gray-200 dark:border-gray-700">
                    <div className="flex h-16 shrink-0 items-center">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">CMS</span>
                            </div>
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                Admin Panel
                            </span>
                        </div>
                    </div>
                    <nav className="flex flex-1 flex-col">
                        <ul role="list" className="flex flex-1 flex-col gap-y-7">
                            <li>
                                <ul role="list" className="-mx-2 space-y-1">
                                    {navigation.map((item) => {
                                        const isActive = url === item.href ||
                                            (item.href !== '/bo/dashboard' && url.startsWith(item.href));

                                        return (
                                            <li key={item.name}>
                                                <Link
                                                    href={item.href}
                                                    className={cn(
                                                        'group flex gap-x-3 rounded-md p-2 text-sm font-medium leading-6 transition-colors',
                                                        isActive
                                                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                                                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                                                    )}
                                                >
                                                    <item.icon
                                                        className={cn(
                                                            'h-5 w-5 shrink-0',
                                                            isActive
                                                                ? 'text-blue-600 dark:text-blue-400'
                                                                : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300'
                                                        )}
                                                        aria-hidden="true"
                                                    />
                                                    {item.name}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

            {/* Mobile sidebar */}
            <div className={cn(
                'fixed inset-y-0 left-0 z-50 w-64 transform bg-white dark:bg-gray-800 transition-transform duration-300 ease-in-out lg:hidden',
                isOpen ? 'translate-x-0' : '-translate-x-full'
            )}>
                <div className="flex h-full flex-col">
                    <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">CMS</span>
                            </div>
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                Admin Panel
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4">
                        <nav className="flex flex-1 flex-col">
                            <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                <li>
                                    <ul role="list" className="-mx-2 space-y-1">
                                        {navigation.map((item) => {
                                            const isActive = location.pathname === item.href ||
                                                (item.href !== '/bo/dashboard' && location.pathname.startsWith(item.href));

                                            return (
                                                <li key={item.name}>
                                                    <Link
                                                        href={item.href}
                                                        onClick={onClose}
                                                        className={cn(
                                                            'group flex gap-x-3 rounded-md p-2 text-sm font-medium leading-6 transition-colors',
                                                            isActive
                                                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                                                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                                                        )}
                                                    >
                                                        <item.icon
                                                            className={cn(
                                                                'h-5 w-5 shrink-0',
                                                                isActive
                                                                    ? 'text-blue-600 dark:text-blue-400'
                                                                    : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300'
                                                            )}
                                                            aria-hidden="true"
                                                        />
                                                        {item.name}
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </>
    );
}
