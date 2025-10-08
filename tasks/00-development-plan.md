# Headless CMS Development Plan

## Project Overview

A Laravel-based headless CMS with React/shadcn UI, featuring flexible content modeling, version control, and JSON API outputs.

## Architecture Improvements & Recommendations

### Enhanced Features to Consider

1. **Multi-language Support** - Essential for headless CMS
2. **API Token Management** - For frontend applications to consume content
3. **Webhooks** - Notify external services on content changes
4. **Media Library** - Centralized asset management
5. **SEO Metadata** - Per page/component SEO fields
6. **Content Preview** - Before publishing
7. **Search & Filtering** - Full-text search across content
8. **Audit Logs** - Track all changes with user attribution

### Technical Stack Decisions

- **Laravel 11.x** - Backend API & Admin
- **React 18** - Frontend UI
- **shadcn/ui** - Component library
- **TailwindCSS** - Styling
- **Inertia.js or API-based** - Choose your integration pattern
- **PostgreSQL/MySQL** - Database (PostgreSQL recommended for JSON fields)
- **Redis** - Caching & sessions
- **Sanctum** - API authentication
- **Spatie Permissions** - Role-based access

---

## Development Phases

### Phase 1: Foundation (Week 1-2)

**Goal:** Set up project infrastructure and authentication

#### Tasks:

1. **Project Setup**

   - Initialize Laravel project
   - Configure database, Redis
   - Set up React with Vite
   - Install shadcn/ui components
   - Configure TailwindCSS

2. **Authentication System**

   - User model with MFA support
   - Login/logout endpoints
   - MFA setup (TOTP using Google Authenticator)
   - Password reset functionality
   - Session management
   - `/bo` route protection

3. **Admin Layout**
   - Dashboard shell
   - Sidebar navigation
   - User menu
   - Responsive layout

**Deliverable:** Working admin panel with secure authentication

---

### Phase 2: Core Data Models (Week 2-3)

**Goal:** Implement foundational data structures

#### Tasks:

1. **Data Types System**

   - Create `DataType` enum/model
   - Define validation rules per type
   - Build type-specific input components:
     - ShortTextInput (max 256 chars)
     - RichTextEditor
     - DatePicker
     - Toggle/Switch
     - ImageUploader
     - FileUploader
     - ListBuilder (nested)
     - CollectionSelector

2. **Database Schema**

   ```
   - data_types (reference table)
   - collections
   - collection_fields (polymorphic field definitions)
   - collection_items (actual data storage - JSON)
   - components
   - component_fields
   - pages
   - page_components (pivot with order)
   - page_versions
   - media (centralized media library)
   ```

3. **Eloquent Models**
   - Collection model with field definitions
   - Component model with field schema
   - Page model with component relationships
   - Version model (polymorphic for pages/components)
   - Media model

**Deliverable:** Database migrations and models ready

---

### Phase 3: Collections Module (Week 3-4)

**Goal:** Full CRUD for collections

#### Tasks:

1. **Collection Management**

   - List all collections (table view)
   - Create collection (name, slug, description)
   - Define collection fields:
     - Add/remove fields
     - Reorder fields
     - Set field type and validation
     - Mark required fields
     - Set default values
   - Edit collection structure
   - Delete collection (with confirmation)

2. **Collection Items**

   - List items in a collection
   - Create item with dynamic form
   - Edit item
   - Delete item
   - Bulk actions
   - Pagination & search

3. **API Endpoints**
   - `GET /api/collections` - List all
   - `GET /api/collections/{slug}` - Get collection items
   - `GET /api/collections/{slug}/{id}` - Get single item

**Deliverable:** Fully functional collections system

---

### Phase 4: Components Module (Week 4-5)

**Goal:** Dynamic component builder

#### Tasks:

1. **Component Structure**

   - List components
   - Create component with:
     - Name (auto-slug)
     - Field definitions
     - Embedded lists (localized collections)
     - Reference to collections
   - Visual field builder (drag-drop ordering)
   - Edit component structure
   - Delete component

2. **Component Validation**

   - Validate field types
   - Ensure slug uniqueness
   - Check circular references
   - Preview component schema

3. **Component UI**
   - Card-based component list
   - Search & filter
   - Copy component (duplicate)
   - Export component schema

**Deliverable:** Component builder with all data types

---

### Phase 5: Pages Module (Week 5-6)

**Goal:** Page composition and versioning

#### Tasks:

1. **Page CRUD**

   - List pages (table with status indicators)
   - Create page:
     - Title
     - Slug (auto-generated, editable)
     - Homepage flag (only one allowed)
     - Status (draft/published)
   - Edit page metadata
   - Delete page

2. **Page Composition**

   - Add components to page
   - Reorder components (drag-drop)
   - Remove components
   - Configure component data inline
   - Support multiple instances of same component

3. **Version Control**

   - Auto-save on publish
   - Keep last 5 versions
   - Version comparison UI
   - Restore previous version
   - Show version metadata (user, timestamp)

4. **Page Preview**
   - JSON output preview
   - Render preview (optional)

**Deliverable:** Complete page management with versioning

---

### Phase 6: Media Library (Week 6-7)

**Goal:** Centralized asset management

#### Tasks:

1. **Media Upload**

   - Drag-drop uploader
   - Multiple file upload
   - Image optimization (automatic resizing)
   - Thumbnail generation
   - File validation (type, size)

2. **Media Browser**

   - Grid/list view toggle
   - Folder organization
   - Search by filename/alt text
   - Filter by type
   - Bulk select
   - Delete media

3. **Media Integration**
   - Insert in image/file fields
   - Alt text & metadata
   - CDN integration (optional)

**Deliverable:** Full media library system

---

### Phase 7: User Management (Week 7)

**Goal:** Admin user controls

#### Tasks:

1. **User CRUD**

   - List users (exclude webmaster)
   - Create user (email, name, password)
   - Edit user profile
   - Delete user

2. **User Security**

   - MFA enable/disable per user
   - QR code generation for TOTP
   - Backup codes
   - Block/unblock user
   - Force password change
   - Password strength requirements

3. **Roles & Permissions** (Optional but recommended)
   - Define roles (admin, editor, viewer)
   - Assign permissions
   - Role-based UI filtering

**Deliverable:** Secure user management

---

### Phase 8: API & JSON Output (Week 8)

**Goal:** Headless API for content consumption

#### Tasks:

1. **Public API**

   - `GET /api/v1/pages` - List all published pages
   - `GET /api/v1/pages/{slug}` - Get page with components
   - `GET /api/v1/collections/{slug}` - Get collection items
   - `GET /api/v1/components/{slug}` - Get component data
   - Response caching (Redis)
   - Rate limiting

2. **API Authentication**

   - API token generation
   - Token management UI
   - Per-token permissions
   - Token expiry

3. **JSON Structure**

   ```json
   {
     "page": {
       "title": "Homepage",
       "slug": "home",
       "components": [
         {
           "type": "hero-banner",
           "data": {
             "title": "Welcome",
             "image": { "url": "...", "alt": "..." }
           }
         }
       ]
     }
   }
   ```

4. **Webhooks**
   - Configure webhook URLs
   - Trigger on publish/unpublish
   - Retry logic
   - Webhook logs

**Deliverable:** Production-ready API

---

### Phase 9: Polish & Optimization (Week 9)

**Goal:** Performance, UX, and testing

#### Tasks:

1. **Performance**

   - Database indexing
   - Query optimization (N+1 prevention)
   - Asset minification
   - Lazy loading
   - API response caching

2. **UX Improvements**

   - Loading states
   - Error handling
   - Toast notifications
   - Keyboard shortcuts
   - Tooltips & help text
   - Onboarding tutorial

3. **Testing**

   - Unit tests (PHPUnit)
   - Feature tests
   - API tests
   - Frontend component tests

4. **Documentation**
   - API documentation (OpenAPI/Swagger)
   - User guide
   - Developer setup guide

**Deliverable:** Production-ready CMS

---

## File Structure Suggestion

```
laravel-cms/
├── app/
│   ├── Models/
│   │   ├── Collection.php
│   │   ├── CollectionItem.php
│   │   ├── Component.php
│   │   ├── Page.php
│   │   ├── PageVersion.php
│   │   ├── Media.php
│   │   └── User.php
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/
│   │   │   │   ├── CollectionController.php
│   │   │   │   ├── ComponentController.php
│   │   │   │   ├── PageController.php
│   │   │   │   ├── UserController.php
│   │   │   │   └── MediaController.php
│   │   │   └── Api/
│   │   │       └── V1/
│   │   │           ├── PageController.php
│   │   │           └── CollectionController.php
│   │   └── Resources/
│   │       ├── PageResource.php
│   │       └── CollectionResource.php
│   ├── Services/
│   │   ├── VersioningService.php
│   │   ├── ComponentBuilderService.php
│   │   └── MediaService.php
│   └── Enums/
│       ├── DataType.php
│       └── PageStatus.php
├── resources/
│   └── js/
│       ├── Pages/
│       │   ├── Collections/
│       │   │   ├── Index.jsx
│       │   │   ├── Create.jsx
│       │   │   └── Edit.jsx
│       │   ├── Components/
│       │   ├── Pages/
│       │   ├── Users/
│       │   └── Dashboard.jsx
│       └── Components/
│           ├── ui/ (shadcn components)
│           ├── Layout/
│           │   ├── AdminLayout.jsx
│           │   └── Sidebar.jsx
│           ├── Forms/
│           │   ├── DataTypeFields/
│           │   │   ├── ShortTextInput.jsx
│           │   │   ├── RichTextEditor.jsx
│           │   │   ├── DatePicker.jsx
│           │   │   ├── ImageUploader.jsx
│           │   │   └── ListBuilder.jsx
│           │   └── ComponentBuilder.jsx
│           └── VersionHistory.jsx
└── database/
    └── migrations/
```

---

## Suggested Task Breakdown Files

I recommend creating these separate markdown files:

1. **01-setup-authentication.md** - Phase 1 detailed tasks
2. **02-data-models.md** - Phase 2 schema & models
3. **03-collections.md** - Phase 3 collections system
4. **04-components.md** - Phase 4 component builder
5. **05-pages.md** - Phase 5 page management
6. **06-media.md** - Phase 6 media library
7. **07-users.md** - Phase 7 user management
8. **08-api.md** - Phase 8 API development
9. **09-polish.md** - Phase 9 final touches
10. **database-schema.md** - Complete DB schema reference
11. **api-spec.md** - API endpoint documentation

---

## Next Steps

1. Review and approve this plan
2. Choose integration pattern (Inertia.js vs. pure API)
3. Set up Git repository
4. Create detailed task files for Phase 1
5. Begin development sprint

Once bases are complete, proceed to `01-setup-authentication` to build the core data structures.
