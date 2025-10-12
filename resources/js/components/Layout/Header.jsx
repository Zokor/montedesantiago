import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import {
    Menu,
    Search,
    User,
    Settings,
    Shield,
    LogOut,
    Menu as MenuIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function Header({ title, breadcrumbs = [], onMenuClick }) {
    const [searchQuery, setSearchQuery] = useState('');

    // Mock user data - replace with actual user context
    const user = {
        name: 'John Doe',
        email: 'john@example.com',
        avatar: null,
    };

    const handleLogout = () => {
        // Implement logout logic
        console.log('Logout clicked');
    };

    return (
        <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex h-16 items-center gap-x-4 px-4 sm:gap-x-6 sm:px-6 lg:px-8">
                {/* Mobile menu button */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={onMenuClick}
                >
                    <MenuIcon className="h-5 w-5" />
                </Button>

                {/* Breadcrumbs */}
                <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                    <div className="flex items-center gap-x-2">
                        {breadcrumbs.length > 0 ? (
                            <nav className="flex" aria-label="Breadcrumb">
                                <ol className="flex items-center space-x-2">
                                    <li>
                                        <Link
                                            to="/bo/dashboard"
                                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                        >
                                            Dashboard
                                        </Link>
                                    </li>
                                    {breadcrumbs.map((crumb, index) => (
                                        <li key={index} className="flex items-center">
                                            <span className="text-gray-400 mx-2">/</span>
                                            {crumb.href ? (
                                                <Link
                                                    to={crumb.href}
                                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                                >
                                                    {crumb.label}
                                                </Link>
                                            ) : (
                                                <span className="text-gray-900 dark:text-white font-medium">
                                                    {crumb.label}
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ol>
                            </nav>
                        ) : (
                            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {title || 'Dashboard'}
                            </h1>
                        )}
                    </div>
                </div>

                {/* Search */}
                <div className="flex flex-1 items-center justify-end gap-x-4 lg:ml-0">
                    <div className="w-full max-w-lg lg:max-w-xs">
                        <label htmlFor="search" className="sr-only">
                            Search
                        </label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search className="h-4 w-4 text-gray-400" aria-hidden="true" />
                            </div>
                            <Input
                                id="search"
                                name="search"
                                className="block w-full rounded-md border-0 bg-white dark:bg-gray-700 py-1.5 pl-10 pr-3 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
                                placeholder="Search..."
                                type="search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* User menu */}
                <div className="flex items-center gap-x-4 lg:gap-x-6">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                {user.avatar ? (
                                    <img
                                        className="h-8 w-8 rounded-full"
                                        src={user.avatar}
                                        alt={user.name}
                                    />
                                ) : (
                                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                                        <User className="h-4 w-4 text-white" />
                                    </div>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user.name}</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {user.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/bo/profile" className="flex items-center">
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/bo/settings" className="flex items-center">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/bo/profile/mfa" className="flex items-center">
                                    <Shield className="mr-2 h-4 w-4" />
                                    <span>MFA Setup</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                                onClick={handleLogout}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Logout</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
