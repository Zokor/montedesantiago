# Admin Layout Components

This directory contains the complete React admin layout system built with shadcn/ui components.

## Components

### AdminLayout

The main layout wrapper that combines the sidebar and header.

**Props:**

- `children`: ReactNode - The page content
- `title`: string - Page title (optional, defaults to "Dashboard")
- `breadcrumbs`: Array<{label: string, href?: string}> - Breadcrumb navigation

**Usage:**

```jsx
import { AdminLayout } from '@/Components/Layout/AdminLayout';

export default function MyPage() {
    const breadcrumbs = [
        { label: 'Collections', href: '/bo/collections' },
        { label: 'Create Collection' },
    ];

    return (
        <AdminLayout title="Create Collection" breadcrumbs={breadcrumbs}>
            {/* Your page content */}
        </AdminLayout>
    );
}
```

### Sidebar

The navigation sidebar with collapsible mobile menu.

**Props:**

- `isOpen`: boolean - Whether mobile sidebar is open
- `onClose`: function - Callback to close mobile sidebar

**Features:**

- Responsive design (fixed on desktop, overlay on mobile)
- Active link highlighting
- Navigation items: Dashboard, Collections, Components, Pages, Media, Users
- Lucide React icons

### Header

The top header bar with user menu and search.

**Props:**

- `title`: string - Page title
- `breadcrumbs`: Array<{label: string, href?: string}> - Breadcrumb items
- `onMenuClick`: function - Callback for mobile menu button

**Features:**

- User dropdown menu (Profile, Settings, MFA Setup, Logout)
- Search input (placeholder functionality)
- Breadcrumb navigation
- Mobile menu toggle

## Dependencies

- `@inertiajs/react` - For routing and page context
- `lucide-react` - For icons
- `shadcn/ui` components:
    - `button`
    - `dropdown-menu`
    - `input`
- `@/lib/utils` - For `cn()` utility function

## Styling

- Tailwind CSS classes
- Dark mode support (optional)
- Responsive breakpoints
- Modern, clean design

## Navigation Structure

The sidebar includes links to:

- `/bo/dashboard` - Dashboard
- `/bo/collections` - Collections management
- `/bo/components` - Components management
- `/bo/pages` - Pages management
- `/bo/media` - Media library
- `/bo/users` - User management

## Mobile Support

- Sidebar collapses to overlay on mobile
- Header includes hamburger menu button
- Touch-friendly interactions
- Responsive grid layouts
