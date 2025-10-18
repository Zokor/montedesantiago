import { FormEvent, useState } from 'react';
import { Link, router, useForm, usePage } from '@inertiajs/react';

import { AdminLayout } from '@/components/layout/admin-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface UserListItem {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    roles?: string[];
    email_verified_at?: string | null;
    last_login_at?: string | null;
    last_login_ip?: string | null;
}

interface UsersPayload {
    data: UserListItem[];
    meta?: {
        links?: PaginationLink[];
        total: number;
    };
}

interface PageProps {
    users: UsersPayload;
    filters: {
        search?: string;
        status?: string;
    };
    availableRoles: string[];
    canManageUsers: boolean;
    canInviteUsers: boolean;
    showPagination: boolean;
    userCreated?: {
        id: number;
        name: string;
        email: string;
        role: string;
        setupUrl: string;
        temporaryPassword: string;
    };
    userDeleted?: {
        id: number;
        email: string;
    };
}

const UsersIndex = () => {
    const { users, filters, availableRoles, canManageUsers, canInviteUsers, showPagination, userCreated, userDeleted } =
        usePage<PageProps>().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [updating, setUpdating] = useState<number | null>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState<null | UserListItem>(null);

    const paginationLinks = users.meta?.links ?? [];

    const createForm = useForm({
        name: '',
        email: '',
        role: availableRoles?.includes('editor') ? 'editor' : availableRoles?.[0] ?? 'editor',
    });

    const deleteForm = useForm({ confirmation: '' });

    const handleFilter = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get(
            '/bo/users',
            { search: search || undefined, status: status || undefined },
            { preserveState: true, replace: true }
        );
    };

    const toggleActive = (user: UserListItem) => {
        setUpdating(user.id);
        router.put(
            `/bo/users/${user.id}`,
            { is_active: !user.is_active },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => setUpdating(null),
            }
        );
    };

    const handleCreate = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        createForm.post('/bo/users', {
            preserveState: true,
            onSuccess: () => {
                setCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleDelete = (event: FormEvent<HTMLFormElement>, user: UserListItem) => {
        event.preventDefault();
        deleteForm.delete(`/bo/users/${user.id}`, {
            preserveState: true,
            onSuccess: () => {
                setDeleteOpen(null);
                deleteForm.reset();
            },
        });
    };

    return (
        <AdminLayout
            title="Users"
            breadcrumbs={[
                { label: 'Users', href: '/bo/users' },
                { label: 'Directory' },
            ]}
        >
            <div className="space-y-6">
                <Card>
                    <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <CardTitle>User Directory</CardTitle>
                            <CardDescription>Manage active accounts and see recent activity.</CardDescription>
                        </div>
                        <div className="flex flex-col gap-2 md:flex-row md:items-center">
                            <form
                                onSubmit={handleFilter}
                                className="flex flex-col gap-2 md:flex-row md:items-center"
                            >
                                <Input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search by name or email"
                                    className="w-full md:w-64"
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
                            {canInviteUsers && (
                                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="md:ml-2">Add user</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Invite a new user</DialogTitle>
                                            <DialogDescription>
                                                An invitation email will be sent with a password setup link. You will also receive the temporary password in case you need to share it manually.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleCreate} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Full name</Label>
                                                <Input
                                                    id="name"
                                                    value={createForm.data.name}
                                                    onChange={(event) => createForm.setData('name', event.target.value)}
                                                    required
                                                />
                                                {createForm.errors.name && (
                                                    <p className="text-sm text-destructive">{createForm.errors.name}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={createForm.data.email}
                                                    onChange={(event) => createForm.setData('email', event.target.value)}
                                                    required
                                                />
                                                {createForm.errors.email && (
                                                    <p className="text-sm text-destructive">{createForm.errors.email}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="role">Role</Label>
                                                <select
                                                    id="role"
                                                    value={createForm.data.role}
                                                    onChange={(event) => createForm.setData('role', event.target.value)}
                                                    className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                                                >
                                                    {availableRoles.map((role) => (
                                                        <option key={role} value={role}>
                                                            {role.replace(/\b\w/g, (char) => char.toUpperCase())}
                                                        </option>
                                                    ))}
                                                </select>
                                                {createForm.errors.role && (
                                                    <p className="text-sm text-destructive">{createForm.errors.role}</p>
                                                )}
                                            </div>
                                            <DialogFooter>
                                                <Button type="submit" disabled={createForm.processing}>
                                                    {createForm.processing ? 'Inviting…' : 'Send invitation'}
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                    </CardHeader>
                </Card>

                {userCreated && (
                    <Card className="border-green-600/30 bg-green-50 dark:bg-green-900/20">
                        <CardHeader>
                            <CardTitle>User invited</CardTitle>
                            <CardDescription>
                                Share the details below if the user needs manual assistance.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-1 text-sm">
                            <div>
                                <strong>Name:</strong> {userCreated.name}
                            </div>
                            <div>
                                <strong>Email:</strong> {userCreated.email}
                            </div>
                            <div>
                                <strong>Role:</strong> {userCreated.role}
                            </div>
                            <div>
                                <strong>Setup link:</strong>{' '}
                                <a href={userCreated.setupUrl} className="text-primary underline" target="_blank" rel="noreferrer">
                                    {userCreated.setupUrl}
                                </a>
                            </div>
                            <div>
                                <strong>Temporary password:</strong> {userCreated.temporaryPassword}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {userDeleted && (
                    <Card className="border-orange-500/30 bg-orange-50 dark:bg-orange-900/20">
                        <CardHeader>
                            <CardTitle>User deleted</CardTitle>
                            <CardDescription>{userDeleted.email} has been removed.</CardDescription>
                        </CardHeader>
                    </Card>
                )}

                <Card>
                    <CardContent className="overflow-x-auto p-0">
                        <table className="w-full min-w-[720px] text-sm">
                            <thead>
                                <tr className="border-b bg-muted/40 text-left font-semibold">
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3">Roles</th>
                                    <th className="px-4 py-3">Last login</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.map((user) => (
                                    <tr key={user.id} className="border-b last:border-b-0">
                                        <td className="px-4 py-3 font-medium">{user.name}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                                        <td className="px-4 py-3">
                                            {user.roles?.length ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles.map((role) => (
                                                        <Badge key={role} variant="outline">
                                                            {role}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <Badge variant={user.is_active ? 'secondary' : 'outline'}>
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                                {canManageUsers && (
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Switch
                                                            checked={user.is_active}
                                                            onCheckedChange={() => toggleActive(user)}
                                                            disabled={updating === user.id}
                                                            aria-label="Toggle active status"
                                                        />
                                                        <span>{user.is_active ? 'Disable' : 'Enable'}</span>
                                                    </div>
                                                )}
                                                {canManageUsers && (
                                                    <Dialog open={deleteOpen?.id === user.id} onOpenChange={(open) => setDeleteOpen(open ? user : null)}>
                                                        <DialogTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="text-destructive">
                                                                Delete
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Delete user</DialogTitle>
                                                                <DialogDescription>
                                                                    This action cannot be undone. Type <strong>I Confirm</strong> to proceed.
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <form onSubmit={(event) => handleDelete(event, user)} className="space-y-4">
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="confirmation">Confirmation</Label>
                                                                    <Input
                                                                        id="confirmation"
                                                                        value={deleteForm.data.confirmation}
                                                                        onChange={(event) => deleteForm.setData('confirmation', event.target.value)}
                                                                        placeholder="I Confirm"
                                                                        required
                                                                    />
                                                                    {deleteForm.errors.confirmation && (
                                                                        <p className="text-sm text-destructive">{deleteForm.errors.confirmation}</p>
                                                                    )}
                                                                </div>
                                                                <DialogFooter>
                                                                    <Button type="submit" variant="destructive" disabled={deleteForm.processing}>
                                                                        {deleteForm.processing ? 'Deleting…' : 'Delete user'}
                                                                    </Button>
                                                                </DialogFooter>
                                                            </form>
                                                        </DialogContent>
                                                    </Dialog>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {users.data.length === 0 && (
                                    <tr>
                                        <td className="px-4 py-6 text-center text-muted-foreground" colSpan={5}>
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                {showPagination && paginationLinks.length > 0 && (
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

export default UsersIndex;
