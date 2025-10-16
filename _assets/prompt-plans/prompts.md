# LLM Prompt Execution Plan

## 🤖 How to Use This Document

Each prompt is designed to be **copy-pasted directly into an LLM** (Claude, ChatGPT, Cursor, etc.) to generate working code.

### Instructions:

1. Copy the entire prompt (including context)
2. Paste into your LLM
3. Review the generated code
4. Copy the code into your project
5. Test it
6. Move to next prompt

### Prerequisites:

- ✅ Laravel 12 installed
- ✅ React + Vite working
- ✅ Database configured
- ✅ Redis running

---

## PHASE 1: Authentication & Layout

### Prompt 1.1: Install Required Packages

```
I have a fresh Laravel 11 project with React and Vite already set up.

Install and configure these packages:

1. Laravel Sanctum for API authentication
2. Spatie Laravel Permission for roles
3. pragmarx/google2fa-laravel for MFA
4. intervention/image for image processing

Provide:
- All composer commands
- All npm commands for shadcn/ui setup
- Configuration commands (php artisan vendor:publish)
- Updated .env variables I need to add

After setup, provide the complete Vite config for React with Tailwind.
```

---

### Prompt 1.2: Database Schema - Users & Authentication

```
Create the complete database migration for a headless CMS user system with MFA support.

Requirements:
- Extend the default Laravel users table
- Add MFA fields: is_mfa_enabled, mfa_secret, mfa_backup_codes (JSON)
- Add security fields: is_active, blocked_at, blocked_reason, last_login_at, last_login_ip
- Add soft deletes
- Add proper indexes

Also create:
- A seeder that creates a default "webmaster" user (email: webmaster@cms.local, password: password)
- The User model with proper fillable fields, casts, and soft deletes trait

Provide complete migration file and User model code.
```

---

### Prompt 1.3: Authentication Backend - Login & MFA

```
Create a complete authentication system for Laravel with MFA support.

Create these files:
1. app/Http/Controllers/Auth/AuthController.php
   - showLogin() - return view
   - login(Request) - handle login with validation and rate limiting
   - logout(Request) - handle logout

2. app/Http/Controllers/Auth/MfaController.php
   - enableMfa() - generate QR code and secret
   - verifyAndEnableMfa(Request) - verify TOTP and enable
   - disableMfa(Request) - disable MFA for user
   - verifyMfa(Request) - verify MFA code during login

3. app/Http/Middleware/EnsureUserIsActive.php
   - Check if user is active, redirect to login if blocked

Requirements:
- Use pragmarx/google2fa package
- Generate 10 backup codes (encrypted)
- Store last login details
- Rate limit login attempts (5 per minute)
- Proper validation
- Return JSON responses

Also provide the routes/web.php additions for these endpoints.
```

---

### Prompt 1.4: Admin Layout Component

```
Create a complete React admin layout with shadcn/ui components.

Create these files:
1. resources/js/Components/Layout/AdminLayout.jsx
   - Responsive layout with sidebar and main content
   - Header with user dropdown
   - Mobile-friendly

2. resources/js/Components/Layout/Sidebar.jsx
   - Navigation items: Dashboard, Collections, Components, Pages, Media, Users
   - Active link highlighting
   - Collapsible on mobile
   - Use lucide-react icons

3. resources/js/Components/Layout/Header.jsx
   - User dropdown menu with: Profile, Settings, MFA Setup, Logout
   - Breadcrumbs placeholder
   - Search placeholder

Requirements:
- Use shadcn/ui components (DropdownMenu, Button, etc.)
- Tailwind CSS styling
- Modern, clean design
- Dark mode support optional

Provide complete code for all three components.
```

---

### Prompt 1.5: Login Page Frontend

```
Create a complete login page with MFA support using React and shadcn/ui.

Create these files:
1. resources/js/Pages/Auth/Login.jsx
   - Email and password inputs
   - Remember me checkbox
   - Submit button with loading state
   - Error message display
   - Form validation
   - API call to /bo/login endpoint

2. resources/js/Pages/Auth/MfaVerify.jsx
   - 6-digit code input with auto-focus
   - "Use backup code" option
   - API call to /bo/mfa/verify
   - Error handling

3. resources/js/Pages/Dashboard.jsx
   - Welcome message
   - Stat cards placeholder (4 cards)
   - Recent activity section placeholder

Requirements:
- Use shadcn/ui Form, Input, Button, Card components
- Use axios for API calls
- Redirect on successful login
- Toast notifications for errors
- Responsive design

Provide complete code for all components with proper error handling.
```

---

### Prompt 1.6: Setup React Router

```
Set up React Router in my Laravel + React app.

Modify resources/js/app.jsx to include:
- BrowserRouter setup
- Routes for:
  - /bo/login → Login page
  - /bo/mfa-verify → MFA verification
  - /bo/* → AdminLayout wrapper
    - /bo/dashboard → Dashboard
    - /bo/collections → Collections (placeholder)
    - /bo/components → Components (placeholder)
    - /bo/pages → Pages (placeholder)
    - /bo/media → Media (placeholder)
    - /bo/users → Users (placeholder)

Create a ProtectedRoute component that checks authentication.

Also update resources/views/app.blade.php to properly load React.

Provide complete app.jsx and app.blade.php code.
```

---

## PHASE 2: Data Models & Database

### Prompt 2.1: DataType Enum

```
Create a DataType enum for the headless CMS.

Create app/Enums/DataType.php with:
- 9 types: SHORT_TEXT, TEXT, DATE, BOOLEAN, IMAGE, FILE, LIST, COLLECTION, COMPONENT
- label() method that returns user-friendly names
- validationRules() method that returns Laravel validation rules array for each type
- icon() method that returns lucide-react icon names for each type

Example:
DataType::SHORT_TEXT->label() // "Short Text (max 256 chars)"
DataType::SHORT_TEXT->validationRules() // ['string', 'max:256']
DataType::SHORT_TEXT->icon() // "Type"

DataType::COMPONENT->label() // "Component Reference"
DataType::COMPONENT->validationRules() // ['exists:components,id']
DataType::COMPONENT->icon() // "Box"

Provide complete enum code with all methods implemented.
```

---

### Prompt 2.2: Core Database Migrations

```
Create all database migrations for the headless CMS core tables.

Create these migration files in order:
1. create_collections_table
   - id, name, slug (unique), description, is_active, timestamps, soft deletes

2. create_collection_fields_table
   - id, collection_id (FK), name, slug, data_type (string), config (JSON), is_required, default_value, help_text, order, timestamps
   - Unique constraint on (collection_id, slug)

3. create_collection_items_table
   - id, collection_id (FK), data (JSON), is_published, order, timestamps, soft deletes

4. create_components_table
   - id, name, slug (unique), description, is_active, timestamps, soft deletes

5. create_component_fields_table
   - Same structure as collection_fields but with component_id

6. create_pages_table
   - id, title, slug (unique), is_homepage, status (enum: draft/published), published_at, created_by, updated_by (FKs to users), timestamps, soft deletes

7. create_page_components_table (pivot)
   - id, page_id (FK), component_id (FK), data (JSON), order, timestamps

8. create_page_versions_table
   - id, page_id (FK), content (JSON), created_by (FK), change_summary, timestamps

9. create_media_table
   - id, filename, original_filename, mime_type, disk, path, thumbnail_path, size, metadata (JSON), folder, uploaded_by (FK), timestamps, soft deletes

Add proper indexes on all foreign keys, slug fields, and commonly queried columns.

Provide all migration files with proper up() and down() methods.
```

---

### Prompt 2.3: Eloquent Models

```
Create all Eloquent models for the CMS with relationships and casts.

Create these model files:

1. app/Models/Collection.php
   - Relationships: hasMany(CollectionField), hasMany(CollectionItem)
   - Scope: active()
   - Auto-generate slug from name

2. app/Models/CollectionField.php
   - Relationship: belongsTo(Collection)
   - Cast data_type to DataType enum, config to array

3. app/Models/CollectionItem.php
   - Relationship: belongsTo(Collection)
   - Cast data to array
   - Scope: published()
   - Methods: getFieldValue($slug), setFieldValue($slug, $value)

4. app/Models/Component.php
   - Relationships: hasMany(ComponentField), belongsToMany(Page) via page_components
   - Method: getSchema() - returns array of field definitions

5. app/Models/ComponentField.php
   - Relationship: belongsTo(Component)
   - Cast data_type to DataType enum, config to array

6. app/Models/Page.php
   - Relationships: belongsToMany(Component), hasMany(PageVersion), belongsTo(User as creator/updater)
   - Scopes: published(), homepage()
   - Auto-generate slug from title

7. app/Models/PageVersion.php
   - Relationships: belongsTo(Page), belongsTo(User as author)
   - Cast content to array

8. app/Models/Media.php
   - Relationship: belongsTo(User as uploader)
   - Accessors: url, thumbnail_url, formatted_size
   - Cast metadata to array

Provide all model files with proper fillable, casts, relationships, and helper methods.
```

---

### Prompt 2.4: Service Classes

```
Create service classes for the CMS business logic.

Create these service files:

1. app/Services/VersioningService.php
   Methods:
   - createVersion(Page $page, ?string $summary): PageVersion
     // Capture current page state, create version, prune old versions (keep last 5)
   - restoreVersion(PageVersion $version): Page
     // Restore page to selected version, create new version for history
   - compareVersions(PageVersion $v1, PageVersion $v2): array
     // Return diff between two versions

2. app/Services/SlugService.php
   Methods:
   - generate(string $text, string $model, ?int $excludeId = null): string
     // Generate unique slug, append -1, -2, etc if exists
   - validate(string $slug): bool
     // Check slug format (lowercase, numbers, hyphens only)

3. app/Services/ComponentBuilderService.php
   Methods:
   - buildComponent(array $data): Component
     // Create component with fields in transaction
   - updateComponent(Component $component, array $data): Component
     // Update component, delete old fields, create new ones
   - validateComponentData(Component $component, array $data): array
     // Validate data against component schema, return errors

Use DB transactions where appropriate. Add proper type hints and docblocks.

Provide complete code for all three services.
```

---

### Prompt 2.5: React Input Components - Part 1

```
Create React input components for the CMS data types (Part 1 of 2).

Create these components using shadcn/ui:

1. resources/js/Components/Forms/DataTypeFields/ShortTextInput.jsx
   Props: field (object with slug, name, is_required, help_text), value, onChange, error
   - Input with max 256 characters
   - Character counter
   - Error display

2. resources/js/Components/Forms/DataTypeFields/RichTextEditor.jsx
   Props: field, value, onChange, error
   - Use TipTap editor
   - Toolbar with: Bold, Italic, Headings, Lists, Links
   - Returns HTML string

3. resources/js/Components/Forms/DataTypeFields/DatePicker.jsx
   Props: field, value, onChange, error
   - Use shadcn Calendar component
   - Popover trigger button
   - Returns ISO date string

4. resources/js/Components/Forms/DataTypeFields/BooleanToggle.jsx
   Props: field, value, onChange, error
   - Use shadcn Switch component
   - Label with ON/OFF indicator

5. resources/js/Components/Forms/DataTypeFields/ComponentSelector.jsx
   Props: field, value, onChange, error, components (array)
   - Dropdown to select a component
   - Shows component name and description
   - Single select (returns component ID)
   - Search/filter components
   - Shows component preview on hover

Install required packages:
npm install @tiptap/react @tiptap/starter-kit date-fns

Provide complete code for all five components with proper TypeScript types if possible.
```

---

### Prompt 2.6: React Input Components - Part 2

```
Create React input components for the CMS data types (Part 2 of 2).

Create these components:

1. resources/js/Components/Forms/DataTypeFields/ImageUploader.jsx
   Props: field, value, onChange, error
   - Drag-and-drop zone
   - Click to browse
   - Image preview
   - Remove button
   - File validation (type, size max 5MB)
   - Upload progress indicator
   - Returns media ID

2. resources/js/Components/Forms/DataTypeFields/FileUploader.jsx
   Props: field, value, onChange, error
   - Similar to ImageUploader but for any file type
   - Show file icon based on MIME type
   - Display filename and size
   - Max 10MB

3. resources/js/Components/Forms/DataTypeFields/ListBuilder.jsx
   Props: field, value, onChange, error
   - Add list item button
   - Remove item button
   - Drag-drop reordering using @dnd-kit
   - Nested field rendering based on field.config
   - Each item has its own data type inputs

4. resources/js/Components/Forms/DataTypeFields/CollectionSelector.jsx
   Props: field, value, onChange, error, collections (array)
   - Dropdown to select collection
   - Load and display collection items
   - Single or multiple select based on field.config
   - Search/filter items

Note: ComponentSelector was already created in Part 1.

Install: npm install @dnd-kit/core @dnd-kit/sortable

Provide complete code for all four components.
```

---

## PHASE 3: Collections Module

### Prompt 3.1: Collections Backend API

````
Create the complete backend API for Collections management.

Create app/Http/Controllers/Admin/CollectionController.php with:
- index() - List all collections with item counts, paginated
- store(Request) - Create collection with fields
- show(Collection) - Get single collection with fields
- update(Request, Collection) - Update collection and fields
- destroy(Collection) - Delete collection (soft delete)

Validation rules:
- name: required, max:255
- slug: unique, lowercase-hyphens only
- fields: required array, min 1
- fields.*.name: required
- fields.*.data_type: required, valid DataType enum value

Create app/Http/Resources/CollectionResource.php:
- Transform collection with fields
- Include items_count when loaded

Add routes to routes/web.php:
```php
Route::middleware(['auth', 'active.user'])->prefix('bo')->group(function () {
    Route::apiResource('collections', CollectionController::class);
});
````

Provide complete controller, resource, and route code.

```

---

### Prompt 3.2: Collections Frontend - List Page

```

Create the Collections list page with table view.

Create resources/js/Pages/Collections/Index.jsx:

- Fetch collections from /bo/collections API
- Display in shadcn Table component
- Columns: Name, Slug, Fields Count, Items Count, Status, Actions
- Search by name
- Filter by status (active/inactive)
- Pagination
- Actions dropdown: Edit, Delete
- "New Collection" button
- Delete confirmation dialog

Create resources/js/Pages/Collections/components/CollectionsTable.jsx:

- Reusable table component
- Sortable columns
- Action buttons

Use:

- shadcn Table, Button, DropdownMenu, AlertDialog, Input components
- lucide-react icons
- axios for API calls
- React hooks for state management

Provide complete code for both components with proper error handling and loading states.

```

---

### Prompt 3.3: Collection Form Builder

```

Create the collection create/edit form with visual field builder.

Create resources/js/Pages/Collections/Create.jsx and Edit.jsx:

- Form sections: Basic Info, Fields Builder
- Basic info: Name, Slug (auto-generated), Description
- Fields builder:
    - Add field button
    - Drag-drop field reordering using @dnd-kit
    - Each field card shows: Name, Type selector, Required toggle, Remove button
    - Field properties in expandable section

Create resources/js/Pages/Collections/components/FieldBuilder.jsx:

- Sortable list of fields
- Each field editable inline
- Drag handle visible
- Add field modal/inline form

Create resources/js/Components/Forms/DataTypeSelector.jsx:

- Dropdown showing all 9 data types with icons:
    - Short Text (Type icon)
    - Long Text (AlignLeft icon)
    - Date (Calendar icon)
    - Boolean (ToggleLeft icon)
    - Image (Image icon)
    - File (File icon)
    - List (List icon)
    - Collection (Database icon)
    - Component (Box icon)
- Type descriptions on hover
- Color-coded by category

Form validation:

- Name required
- At least one field
- All field names filled
- No duplicate slugs

API endpoints:

- POST /bo/collections (create)
- PUT /bo/collections/{id} (update)

Provide complete code with form state management, validation, and submission handling.

```

---

### Prompt 3.4: Collection Items Backend API

```

Create the backend API for Collection Items CRUD.

Create app/Http/Controllers/Admin/CollectionItemController.php with:

- index(Collection) - List items in collection with pagination, search, filters
- store(Request, Collection) - Create item with dynamic validation
- show(Collection, CollectionItem) - Get single item
- update(Request, Collection, CollectionItem) - Update item
- destroy(Collection, CollectionItem) - Delete item
- reorder(Request, Collection) - Bulk update order

Dynamic validation based on collection fields:

- Loop through collection->fields
- Build validation rules array based on field data_type and is_required
- Validate against request->data

Create app/Http/Resources/CollectionItemResource.php

Add nested routes:

```php
Route::prefix('collections/{collection}')->group(function () {
    Route::get('items', [CollectionItemController::class, 'index']);
    Route::post('items', [CollectionItemController::class, 'store']);
    Route::get('items/{item}', [CollectionItemController::class, 'show']);
    Route::put('items/{item}', [CollectionItemController::class, 'update']);
    Route::delete('items/{item}', [CollectionItemController::class, 'destroy']);
    Route::post('items/reorder', [CollectionItemController::class, 'reorder']);
});
```

Provide complete controller and routes code with dynamic validation.

```

---

### Prompt 3.5: Collection Items Frontend

```

Create the Collection Items management interface.

Create resources/js/Pages/Collections/Items/Index.jsx:

- Display collection info at top (name, description)
- Items table with dynamic columns based on collection fields
- Show first 4 field values
- Published status indicator
- Actions: Edit, Delete
- Search functionality
- Bulk actions: Publish, Unpublish, Delete selected
- Drag-drop to reorder items
- "New Item" button

Create resources/js/Pages/Collections/Items/Create.jsx and Edit.jsx:

- Dynamic form generation based on collection.fields
- Render appropriate input component for each field type:
    ```jsx
    const renderField = (field) => {
        switch (field.data_type) {
            case 'short_text':
                return <ShortTextInput {...fieldProps} />;
            case 'text':
                return <RichTextEditor {...fieldProps} />;
            case 'date':
                return <DatePicker {...fieldProps} />;
            case 'boolean':
                return <BooleanToggle {...fieldProps} />;
            case 'image':
                return <ImageUploader {...fieldProps} />;
            case 'file':
                return <FileUploader {...fieldProps} />;
            case 'list':
                return <ListBuilder {...fieldProps} />;
            case 'collection':
                return <CollectionSelector {...fieldProps} />;
            case 'component':
                return <ComponentSelector {...fieldProps} />;
            default:
                return null;
        }
    };
    ```
- Form layout: 2 columns on desktop, 1 on mobile
- Published toggle
- Submit to POST/PUT /bo/collections/{id}/items

Create resources/js/Pages/Collections/Items/components/DynamicForm.jsx:

- Reusable dynamic form renderer
- Field type switcher
- Validation handling
- Fetch components list for ComponentSelector fields

Use @dnd-kit for reordering.

Provide complete code for all components with proper state management.

```

---

## PHASE 4: Components Module

### Prompt 4.1: Components Backend API

```

Create the complete backend API for Components management.

Create app/Http/Controllers/Admin/ComponentController.php with:

- index() - List all components with field counts
- store(Request) - Create component using ComponentBuilderService
- show(Component) - Get component with fields and schema
- update(Request, Component) - Update component
- destroy(Component) - Delete (check if used in pages first)
- duplicate(Component) - Create copy with "(Copy)" appended to name

Create app/Http/Resources/ComponentResource.php:

- Include fields, pages_count, schema

Add routes:

```php
Route::apiResource('components', ComponentController::class);
Route::post('components/{component}/duplicate', [ComponentController::class, 'duplicate']);
```

Validation similar to collections but for components.

Provide complete controller, resource, and routes.

```

---

### Prompt 4.2: Components List Page

```

Create the Components list page with card-based layout.

Create resources/js/Pages/Components/Index.jsx:

- Grid of component cards (3-4 per row)
- Each card shows: Name, Description, Field count, Pages using it
- View toggle: Grid/List
- Search by name
- Actions dropdown: Edit, Duplicate, Delete
- "New Component" button
- Click card to preview schema

Create resources/js/Pages/Components/components/ComponentCard.jsx:

- Beautiful card design
- Hover effects
- Status indicator
- Action buttons

Create resources/js/Pages/Components/components/SchemaPreview.jsx:

- Modal/drawer showing component schema
- JSON formatted display with syntax highlighting
- Export JSON button
- Close button

Use react-syntax-highlighter for JSON display.

Provide complete code with modern UI design.

```

---

### Prompt 4.3: Visual Component Builder - Part 1

```

Create the visual component builder interface (Part 1 - Layout & Palette).

Create resources/js/Pages/Components/Create.jsx and Edit.jsx:

- Three-panel layout:
    - Left: Field Types Palette (20% width)
    - Center: Component Canvas (50% width)
    - Right: Field Properties Panel (30% width)
- Responsive: Stack on mobile

Create resources/js/Pages/Components/components/FieldPalette.jsx:

- List of 9 data types as draggable cards
- Each shows: Icon, Name, Description
- Drag to canvas to add field
- Grouped by category:
    - Text: Short Text, Long Text
    - Media: Image, File
    - Data: Date, Boolean
    - Relationships: List, Collection, Component
- Search filter

Data types array:

```jsx
const fieldTypes = [
    {
        type: 'short_text',
        icon: 'Type',
        label: 'Short Text',
        color: 'blue',
        category: 'text',
    },
    {
        type: 'text',
        icon: 'AlignLeft',
        label: 'Long Text',
        color: 'purple',
        category: 'text',
    },
    {
        type: 'date',
        icon: 'Calendar',
        label: 'Date',
        color: 'green',
        category: 'data',
    },
    {
        type: 'boolean',
        icon: 'ToggleLeft',
        label: 'Boolean',
        color: 'yellow',
        category: 'data',
    },
    {
        type: 'image',
        icon: 'Image',
        label: 'Image',
        color: 'pink',
        category: 'media',
    },
    {
        type: 'file',
        icon: 'File',
        label: 'File',
        color: 'orange',
        category: 'media',
    },
    {
        type: 'list',
        icon: 'List',
        label: 'List',
        color: 'indigo',
        category: 'relationships',
    },
    {
        type: 'collection',
        icon: 'Database',
        label: 'Collection',
        color: 'teal',
        category: 'relationships',
    },
    {
        type: 'component',
        icon: 'Box',
        label: 'Component',
        color: 'violet',
        category: 'relationships',
    },
];
```

Provide complete code for layout and palette components.

```

---

### Prompt 4.4: Visual Component Builder - Part 2

```

Create the visual component builder canvas and field properties (Part 2).

Create resources/js/Pages/Components/components/ComponentCanvas.jsx:

- Drop zone for fields from palette
- Drag-drop reordering of existing fields using @dnd-kit
- Empty state when no fields
- Each field shows as sortable card:
    - Drag handle
    - Field name
    - Field type badge
    - Required indicator
    - Click to select for editing
    - Remove button

Create resources/js/Pages/Components/components/SortableField.jsx:

- Individual field card in canvas
- Highlight when selected
- Drag handle using @dnd-kit/sortable

Create resources/js/Pages/Components/components/FieldPropertiesPanel.jsx:

- Empty state: "Select a field to edit properties"
- When field selected:
    - Field Name input
    - Field Slug input (auto-generated, editable)
    - Required toggle
    - Help Text textarea
    - Type-specific config section (collapsible)
    - Updates field in parent state

Implement drag-drop logic:

- Drag from palette → Add new field to canvas
- Drag in canvas → Reorder existing fields

Provide complete code with drag-drop implementation.

```

---

### Prompt 4.5: Component Builder - Form Submission

```

Create the component form state management and submission.

In resources/js/Pages/Components/Create.jsx and Edit.jsx:

- Form state structure:

```jsx
const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    fields: [],
});
```

- Field structure:

```jsx
{
  id: Date.now(), // temporary client ID
  name: '',
  slug: '',
  data_type: 'short_text',
  is_required: false,
  config: {},
  help_text: '',
}
```

Functions needed:

- addField(type) - Add field from palette
- updateField(id, updates) - Update field properties
- removeField(id) - Remove field
- reorderFields(oldIndex, newIndex) - Change field order
- handleSubmit() - Validate and POST/PUT to API

Validation:

- Name required
- At least one field
- All field names filled
- No duplicate field slugs
- Valid slug format

API submission:

- POST /bo/components (create)
- PUT /bo/components/{id} (update)

Toast notifications for success/error.

Provide complete form logic and submission handling.

```

---

## PHASE 5: Pages Module

### Prompt 5.1: Pages Backend API

```

Create the backend API for Pages management with versioning.

Create app/Http/Controllers/Admin/PageController.php with:

- index() - List pages with status, homepage flag
- store(Request) - Create page
- show(Page) - Get page with components
- update(Request, Page) - Update page, create version
- destroy(Page) - Soft delete
- publish(Page) - Set status to published, create version
- unpublish(Page) - Set status to draft
- versions(Page) - Get page versions
- restoreVersion(Page, PageVersion) - Restore to version using VersioningService

Validation:

- Only one page can be homepage at a time
- If setting is_homepage=true, unset others
- Slug unique

Create app/Http/Resources/PageResource.php:

- Include components with their data
- Include version count

Add routes with versioning endpoints.

Provide complete controller, resource, and routes.

```

---

### Prompt 5.2: Pages List Page

```

Create the Pages list page.

Create resources/js/Pages/Pages/Index.jsx:

- Table view with columns:
    - Title
    - Slug
    - Status (badge with color)
    - Homepage (icon if true)
    - Last Updated
    - Actions
- Filters: Status (all/draft/published), Homepage only
- Search by title
- Quick actions: Edit, Duplicate, Delete, Publish/Unpublish
- "New Page" button
- Status badges: Published (green), Draft (yellow)
- Homepage star icon

Create resources/js/Pages/Pages/components/PagesTable.jsx:

- Sortable table
- Status toggle button (publish/unpublish)
- Confirmation for publish
- Delete confirmation

Provide complete code with filtering and status management.

```

---

### Prompt 5.3: Page Composer - Part 1

```

Create the page composer interface (Part 1 - Layout & Component Selector).

Create resources/js/Pages/Pages/Create.jsx and Edit.jsx:

- Two-panel layout:
    - Left (30%): Page metadata
    - Right (70%): Component canvas
- Left panel fields:
    - Title input
    - Slug (auto-generated)
    - Homepage toggle
    - Status select (draft/published)
    - "Add Component" button
- Right panel: Component composition canvas

Create resources/js/Pages/Pages/components/ComponentSelector.jsx:

- Modal/drawer to browse components
- Grid of component cards
- Search components
- Click to add to page
- Shows component schema preview
- Can add multiple instances

Component selector features:

- Fetch from /bo/components API
- Search/filter
- Component preview
- Add button

Provide complete code for page form layout and component selector.

```

---

### Prompt 5.4: Page Composer - Part 2

```

Create the page composer canvas (Part 2 - Component Composition).

Create resources/js/Pages/Pages/components/PageCanvas.jsx:

- List of components added to page
- Each component instance shows:
    - Component name/type
    - Preview of data (first 2-3 fields)
    - Edit button (opens data editor)
    - Remove button
    - Drag handle for reordering
- Drag-drop reordering using @dnd-kit
- Empty state when no components

Create resources/js/Pages/Pages/components/ComponentInstanceEditor.jsx:

- Modal/drawer to edit component data
- Dynamically render form based on component.fields
- Use appropriate input component for each field type
- Save/Cancel buttons
- Form validation

Page state structure:

```jsx
{
  title: '',
  slug: '',
  is_homepage: false,
  status: 'draft',
  components: [
    {
      id: 'temp-id',
      component_id: 1,
      component: { name: 'Hero', slug: 'hero', fields: [...] },
      data: { heading: 'Welcome', ... },
      order: 0
    }
  ]
}
```

Functions:

- addComponent(component) - Add component instance
- removeComponent(id) - Remove instance
- editComponentData(id) - Open editor
- updateComponentData(id, data) - Update instance data
- reorderComponents(oldIndex, newIndex) - Change order

Provide complete code with component composition logic.

```

---

### Prompt 5.5: Page Versioning UI

```

Create the page versioning interface.

Create resources/js/Pages/Pages/components/VersionHistory.jsx:

- Button to open version history modal
- List of versions showing:
    - Date/time
    - Author name
    - Change summary
    - View/Restore buttons
- Timeline or list layout
- Restore confirmation dialog

Create resources/js/Pages/Pages/components/VersionComparison.jsx:

- Side-by-side diff view
- Highlight changes:
    - Title/slug changes
    - Components added (green)
    - Components removed (red)
    - Data field changes (yellow)
- Close button

API calls:

- GET /bo/pages/{id}/versions - List versions
- POST /bo/pages/{id}/versions/{version}/restore - Restore

Show version history button in page edit header.
Auto-create version on publish.

Provide complete versioning UI code.

```

---

## PHASE 6: Media Library

### Prompt 6.1: Media Backend API

```

Create the complete Media Library backend.

Create app/Http/Controllers/Admin/MediaController.php with:

- index() - List media with pagination, search, filters
- store(Request) - Upload files with processing
- show(Media) - Get single media
- update(Request, Media) - Update metadata (alt, title, description)
- destroy(Media) - Delete file and record

File upload logic:

- Validate file type and size
- Generate unique filename
- Store in storage/app/public/media
- For images: Generate thumbnail (300x300), resize large images (max 2000px)
- Extract metadata (dimensions for images)
- Create Media record

Use intervention/image for image processing.

Create app/Http/Resources/MediaResource.php:

- Include url, thumbnail_url, formatted_size accessors

Add routes:

```php
Route::apiResource('media', MediaController::class);
Route::post('media/bulk-delete', [MediaController::class, 'bulkDelete']);
```

Search/filter options:

- By mime_type
- By folder
- By filename

Provide complete controller with file upload and image processing.

```

---

### Prompt 6.2: Media Library Frontend

```

Create the complete Media Library interface.

Create resources/js/Pages/Media/Index.jsx:

- Header with "Upload Files" button
- View toggle: Grid (default) / List
- Grid view: Thumbnails in responsive grid (4-6 per row)
- List view: Table with filename, size, type, date
- Search by filename
- Filter by type (all/images/documents/videos)
- Folder navigation (if implemented)
- Bulk selection with checkbox
- Bulk delete button

Create resources/js/Pages/Media/components/MediaGrid.jsx:

- Grid of media items
- Each item shows:
    - Thumbnail/icon
    - Checkbox for selection
    - Filename
    - Click to open details
- Lazy loading with intersection observer

Create resources/js/Pages/Media/components/MediaUploader.jsx:

- Drag-drop zone
- Click to browse
- Multiple file upload
- Upload progress bars
- Preview before upload
- Cancel upload

Create resources/js/Pages/Media/components/MediaDetails.jsx:

- Drawer/modal showing:
    - Large preview
    - Filename
    - File size, dimensions, type
    - Upload date
    - Direct URL with copy button
    - Metadata editor: Alt text, Title, Description
    - Replace file button
    - Delete button

API endpoints:

- GET /bo/media
- POST /bo/media (upload)
- PUT /bo/media/{id} (update metadata)
- DELETE /bo/media/{id}

Provide complete code with upload handling and grid view.

```

---

### Prompt 6.3: Media Picker Integration

```

Create a reusable Media Picker component and integrate with upload fields.

Create resources/js/Components/MediaPicker.jsx:

- Modal with tabs: Browse / Upload
- Browse tab:
    - Grid of media items
    - Search and filter
    - Select single or multiple (based on props)
    - Preview selected
    - Confirm selection button
- Upload tab:
    - Drag-drop uploader
    - Upload and auto-select
- Props: multiple (bool), onSelect (callback), defaultValue

Update resources/js/Components/Forms/DataTypeFields/ImageUploader.jsx:

- Add "Browse Library" button
- Opens MediaPicker modal
- On select: Store media ID, display image
- Keep existing upload functionality

Update resources/js/Components/Forms/DataTypeFields/FileUploader.jsx:

- Similar integration with MediaPicker
- Show file icon and name when selected from library

Integration state management:

- Store media ID (not just URL)
- Fetch media URL for display
- Handle both uploaded and library-selected files

Provide complete MediaPicker and updated uploader components.

```

---

## PHASE 7: User Management

### Prompt 7.1: Users Backend API

```

Create the User management backend API.

Create app/Http/Controllers/Admin/UserController.php with:

- index() - List users (exclude webmaster), paginated
- store(Request) - Create user
- show(User) - Get user details
- update(Request, User) - Update user (can't edit webmaster)
- destroy(User) - Delete user (can't delete self or webmaster)
- block(Request, User) - Block user with reason
- unblock(User) - Unblock user
- changePassword(Request, User) - Admin change user password

Validation:

- Email unique
- Password min 8 chars, requires uppercase, lowercase, number
- Can't block/delete self
- Can't edit/delete webmaster

Create app/Http/Resources/UserResource.php:

- Exclude sensitive fields (password, mfa_secret)
- Include is_blocked (computed from blocked_at)

Add routes:

```php
Route::apiResource('users', UserController::class);
Route::post('users/{user}/block', [UserController::class, 'block']);
Route::post('users/{user}/unblock', [UserController::class, 'unblock']);
Route::post('users/{user}/change-password', [UserController::class, 'changePassword']);
```

Provide complete controller and routes.

```

---

### Prompt 7.2: Users List Page

```

Create the Users management interface.

Create resources/js/Pages/Users/Index.jsx:

- Table with columns:
    - Name
    - Email
    - Status (Active/Blocked badge)
    - MFA Enabled (icon)
    - Last Login
    - Actions dropdown
- Search by name/email
- Filter by status (all/active/blocked)
- "Add User" button
- Actions: Edit, Change Password, Block/Unblock, Delete

Create resources/js/Pages/Users/Create.jsx and Edit.jsx:

- Form fields:
    - Name (required)
    - Email (required, unique)
    - Password (required on create, optional on edit)
    - Active toggle
    - MFA enabled (read-only, controlled by user)
- Submit to POST/PUT /bo/users/{id}

Create resources/js/Pages/Users/components/BlockUserDialog.jsx:

- Modal with reason textarea
- Block button
- Posts to /bo/users/{id}/block

Create resources/js/Pages/Users/components/ChangePasswordDialog.jsx:

- Modal with new password input
- Password strength indicator
- Posts to /bo/users/{id}/change-password

Show blocked indicator and reason in table.
Hide webmaster user from list.

Provide complete code for all user management components.

```

---

### Prompt 7.3: User Profile & MFA Settings

```

Create user profile and MFA management pages.

Create resources/js/Pages/Profile/Index.jsx:

- User can edit own profile:
    - Name
    - Email
    - Change password section
- MFA section:
    - Current status (enabled/disabled)
    - Enable/disable toggle
    - View backup codes
    - Regenerate backup codes

Create resources/js/Pages/Profile/components/MfaSetup.jsx:

- When enabling MFA:
    - Generate QR code (from backend)
    - Show secret key for manual entry
    - Verification code input
    - Submit to verify and enable
    - Show backup codes (download/print)
- When disabling MFA:
    - Password confirmation
    - Disable button

Create resources/js/Pages/Profile/components/ChangePasswordForm.jsx:

- Current password
- New password
- Confirm new password
- Password strength indicator
- Submit to update

Backend endpoints needed:

- GET /bo/profile
- PUT /bo/profile
- POST /bo/profile/change-password
- POST /bo/profile/mfa/enable
- POST /bo/profile/mfa/verify
- POST /bo/profile/mfa/disable

Provide complete profile and MFA management code.

```

---

## PHASE 8: Public API

### Prompt 8.1: API Token System Backend

```

Create the API token authentication system.

Create migration: create_api_tokens_table

- id, user_id (FK), name, token (unique 64 chars), permissions (JSON), last_used_at, expires_at, timestamps

Create app/Models/ApiToken.php:

- Relationship: belongsTo(User)
- Cast permissions to array
- Generate secure random token on create

Create app/Http/Controllers/Admin/ApiTokenController.php:

- index() - List user's tokens
- store(Request) - Create token (return token only once)
- destroy(ApiToken) - Revoke token

Create app/Http/Middleware/AuthenticateApiToken.php:

- Check Authorization: Bearer {token} header
- Validate token exists and not expired
- Update last_used_at
- Set auth user
- Check permissions for route

Token generation:

- Use Str::random(64) or hash of timestamp + random
- Store hashed version
- Return plain token only on creation

Add routes:

```php
Route::prefix('bo/api-tokens')->group(function () {
    Route::get('/', [ApiTokenController::class, 'index']);
    Route::post('/', [ApiTokenController::class, 'store']);
    Route::delete('/{token}', [ApiTokenController::class, 'destroy']);
});
```

Provide complete token system backend.

```

---

### Prompt 8.2: API Token Management UI

```

Create the API Token management interface.

Create resources/js/Pages/Settings/ApiTokens.jsx:

- List of user's tokens showing:
    - Name/description
    - Token (masked: ••••••••••••••••abc123)
    - Permissions
    - Last used date
    - Created date
    - Revoke button
- "Create New Token" button

Create resources/js/Pages/Settings/components/CreateTokenDialog.jsx:

- Modal form:
    - Token name/description input
    - Permissions checkboxes:
        - pages:read
        - collections:read
        - All others as needed
    - Optional expiry date picker
    - Create button
- On success:
    - Show token in alert/modal (only once!)
    - "Copy to clipboard" button
    - Warning: "Save this token, you won't see it again"

API calls:

- GET /bo/api-tokens
- POST /bo/api-tokens
- DELETE /bo/api-tokens/{id}

Token display after creation:

```jsx
<Alert>
    <AlertTitle>Token Created Successfully</AlertTitle>
    <AlertDescription>
        <code className="block rounded bg-gray-100 p-2">{token}</code>
        <Button onClick={copyToClipboard}>Copy Token</Button>
        <p className="mt-2 text-red-600">
            Save this token now. You won't be able to see it again!
        </p>
    </AlertDescription>
</Alert>
```

Provide complete token management UI.

```

---

### Prompt 8.3: Public API Controllers

```

Create the public API endpoints for consuming CMS content.

Create app/Http/Controllers/Api/V1/PageController.php:

- index() - List all published pages
    - Filters: homepage (bool)
    - Returns: id, title, slug, is_homepage, components with data
- show($slug) - Get single page by slug
    - Only published pages
    - Include all components with data
    - Transform media references to full URLs

Create app/Http/Controllers/Api/V1/CollectionController.php:

- index($slug) - List items in collection
    - Only published items
    - Filters: search, sort_by, sort_dir
    - Pagination
    - Transform media references to full URLs
- show($slug, $id) - Get single item

Create app/Http/Resources/PageApiResource.php:

- Optimized structure for frontend consumption:

```json
{
    "id": 1,
    "title": "Homepage",
    "slug": "home",
    "is_homepage": true,
    "published_at": "2024-01-15T10:30:00Z",
    "components": [
        {
            "type": "hero-section",
            "data": {
                "heading": "Welcome",
                "image": {
                    "id": 123,
                    "url": "https://cdn.example.com/hero.jpg",
                    "alt": "Hero image"
                }
            }
        }
    ]
}
```

Add public API routes in routes/api.php:

```php
Route::prefix('v1')->middleware('auth:api-token')->group(function () {
    Route::get('pages', [PageController::class, 'index']);
    Route::get('pages/{slug}', [PageController::class, 'show']);
    Route::get('collections/{slug}', [CollectionController::class, 'index']);
    Route::get('collections/{slug}/{id}', [CollectionController::class, 'show']);
});
```

Provide complete public API controllers and resources.

```

---

### Prompt 8.4: API Caching & Rate Limiting

```

Implement API response caching and rate limiting.

Create app/Http/Middleware/CacheApiResponse.php:

- Check Redis cache for response
- Cache key: request URL + query params
- Cache TTL: 1 hour (3600 seconds)
- Return cached response if exists
- Store response in cache after processing
- Add cache headers: ETag, Last-Modified, Cache-Control

Invalidate cache when content updates:

- In PageController@update: Cache::tags(['pages', "page:{id}"])->flush()
- In CollectionItemController@update: Cache::tags(['collections', "collection:{slug}"])->flush()

Configure rate limiting in app/Providers/RouteServiceProvider.php:

```php
RateLimiter::for('api', function (Request $request) {
    return $request->user()
        ? Limit::perMinute(1000)->by($request->user()->id)
        : Limit::perMinute(60)->by($request->ip());
});
```

Apply middleware in routes/api.php:

```php
Route::middleware(['throttle:api', 'cache.response'])->group(function () {
    // API routes
});
```

Add cache headers to responses:

- Cache-Control: public, max-age=3600
- ETag: hash of content
- Last-Modified: updated_at timestamp

Handle conditional requests:

- If-None-Match header → return 304 if ETag matches
- If-Modified-Since header → return 304 if not modified

Provide complete caching and rate limiting implementation.

```

---

### Prompt 8.5: Webhooks System

```

Create the webhooks system for event notifications.

Create migrations:

1. create_webhooks_table
    - id, user_id (FK), name, url, events (JSON array), secret, is_active, timestamps

2. create_webhook_logs_table
    - id, webhook_id (FK), event, status_code, response (text), sent_at, timestamps

Create app/Models/Webhook.php and app/Models/WebhookLog.php

Create app/Services/WebhookService.php:

- dispatch(string $event, mixed $data): void
    - Find active webhooks listening to event
    - Queue webhook call (don't block request)
    - Sign payload with HMAC-SHA256
    - Retry on failure (3 attempts with exponential backoff)
    - Log all attempts

Create app/Jobs/SendWebhookJob.php:

- Send HTTP POST to webhook URL
- Include headers:
    - X-Webhook-Event: event name
    - X-Webhook-Signature: HMAC signature
    - Content-Type: application/json
- Timeout: 10 seconds
- Log response

Create app/Http/Controllers/Admin/WebhookController.php:

- index() - List user's webhooks
- store(Request) - Create webhook
- update(Request, Webhook) - Update webhook
- destroy(Webhook) - Delete webhook
- test(Webhook) - Send test ping

Available events:

- page.published
- page.unpublished
- page.deleted
- collection.item.created
- collection.item.updated
- collection.item.deleted

Trigger webhooks in controllers:

```php
// In PageController@publish
WebhookService::dispatch('page.published', $page);
```

Add routes for webhook management.

Provide complete webhook system implementation.

```

---

### Prompt 8.6: Webhooks Management UI

```

Create the Webhooks management interface.

Create resources/js/Pages/Settings/Webhooks.jsx:

- List of webhooks showing:
    - Name
    - URL
    - Events listening to (badges)
    - Status (active/inactive)
    - Last delivery status
    - Actions: Edit, Test, View Logs, Delete
- "Create Webhook" button

Create resources/js/Pages/Settings/components/CreateWebhookDialog.jsx:

- Modal form:
    - Name input
    - URL input (must be https://)
    - Events multi-select checkboxes:
        - page.published
        - page.unpublished
        - collection.item.created
        - etc.
    - Secret input (optional, for signature verification)
    - Active toggle
- Submit to POST /bo/webhooks

Create resources/js/Pages/Settings/components/WebhookLogs.jsx:

- Modal showing delivery logs:
    - Event name
    - Status code
    - Response body
    - Timestamp
    - Retry count
- Pagination
- Fetch from GET /bo/webhooks/{id}/logs

Test webhook feature:

- Send test ping to webhook
- Show delivery result
- POST /bo/webhooks/{id}/test

Provide complete webhooks management UI.

```

---

## PHASE 9: Polish & Production

### Prompt 9.1: Database Optimization

```

Add database indexes and optimize queries for production.

Create a new migration: add_indexes_for_performance

Add indexes:

```php
// collections table
$table->index('slug');
$table->index('is_active');

// collection_items table
$table->index(['collection_id', 'is_published']);
$table->index(['collection_id', 'order']);

// components table
$table->index('slug');
$table->index('is_active');

// pages table
$table->index('slug');
$table->index(['status', 'published_at']);
$table->index('is_homepage');

// media table
$table->index('mime_type');
$table->index('folder');
$table->index('uploaded_by');

// Composite indexes
Schema::table('collection_fields', function (Blueprint $table) {
    $table->index(['collection_id', 'order']);
});

Schema::table('page_components', function (Blueprint $table) {
    $table->index(['page_id', 'order']);
});
```

N+1 Query Prevention:
Update all controller index() methods to use eager loading:

```php
// Pages
$pages = Page::with(['components.fields', 'creator', 'updater'])->get();

// Collections
$collections = Collection::with(['fields'])->withCount('items')->get();

// Collection Items
$items = $collection->items()->with('collection.fields')->get();
```

Install Laravel Debugbar for development:

```bash
composer require barryvdh/laravel-debugbar --dev
```

Provide complete migration and optimized query examples.

```

---

### Prompt 9.2: Loading States & Error Handling

```

Add comprehensive loading states and error handling throughout the app.

Create resources/js/Components/LoadingSpinner.jsx:

- Reusable spinner component
- Sizes: sm, md, lg
- Centered option

Create resources/js/Components/LoadingSkeleton.jsx:

- Skeleton loaders for:
    - Table rows
    - Cards
    - Forms
- Use shadcn Skeleton component

Create resources/js/Components/ErrorBoundary.jsx:

- React error boundary
- Catch JavaScript errors
- Show friendly error message
- Log to console in dev
- Report to error tracking in production

Create resources/js/Components/EmptyState.jsx:

- Reusable empty state component
- Props: icon, title, description, action (button)
- Use throughout app when no data

Update all pages to use loading states:

```jsx
if (loading) return <LoadingSkeleton type="table" />;
if (error) return <ErrorState error={error} />;
if (!data.length)
    return <EmptyState title="No items" action={<Button>Create</Button>} />;
```

Create resources/js/lib/errorHandler.js:

- handleApiError(error) - Parse and display API errors
- showToast helper for notifications

Add to all axios calls:

```jsx
try {
    const response = await axios.get('/api/...');
    setData(response.data);
} catch (error) {
    handleApiError(error);
} finally {
    setLoading(false);
}
```

Provide all loading and error handling components.

```

---

### Prompt 9.3: Keyboard Shortcuts

```

Implement keyboard shortcuts for power users.

Install: npm install react-hotkeys-hook

Create resources/js/Components/KeyboardShortcuts.jsx:

- Component that registers global shortcuts
- Show help dialog with Ctrl+?

Shortcuts to implement:

- Ctrl+S / Cmd+S: Save form
- Ctrl+K / Cmd+K: Focus search
- Esc: Close modal/drawer
- Ctrl+N / Cmd+N: New item (contextual)
- Ctrl+/ / Cmd+/: Show shortcuts help

Usage in forms:

```jsx
import { useHotkeys } from 'react-hotkeys-hook';

function MyForm() {
    useHotkeys('ctrl+s, cmd+s', (e) => {
        e.preventDefault();
        handleSubmit();
    });

    return <form>...</form>;
}
```

Create resources/js/Components/ShortcutsDialog.jsx:

- Modal showing all available shortcuts
- Grouped by category
- Keyboard key visual component

Register shortcuts in key pages:

- Collections: Ctrl+N for new collection
- Components: Ctrl+N for new component
- Pages: Ctrl+N for new page
- Global: Ctrl+K for search

Provide complete keyboard shortcuts implementation.

```

---

### Prompt 9.4: Testing Suite - Backend

```

Create comprehensive backend tests.

Create tests/Feature/CollectionTest.php:

```php
class CollectionTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_collections()
    {
        Collection::factory()->count(3)->create();

        $response = $this->actingAs(User::factory()->create())
            ->getJson('/bo/collections');

        $response->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_can_create_collection_with_fields()
    {
        $data = [
            'name' => 'Blog Posts',
            'slug' => 'blog-posts',
            'fields' => [
                [
                    'name' => 'Title',
                    'data_type' => 'short_text',
                    'is_required' => true
                ]
            ]
        ];

        $response = $this->actingAs(User::factory()->create())
            ->postJson('/bo/collections', $data);

        $response->assertCreated();
        $this->assertDatabaseHas('collections', ['slug' => 'blog-posts']);
        $this->assertDatabaseHas('collection_fields', ['name' => 'Title']);
    }

    public function test_validates_collection_data() { }
    public function test_can_update_collection() { }
    public function test_can_delete_collection() { }
}
```

Create similar test files for:

- tests/Feature/ComponentTest.php
- tests/Feature/PageTest.php
- tests/Feature/MediaTest.php
- tests/Feature/ApiTokenTest.php
- tests/Feature/WebhookTest.php
- tests/Feature/Api/PageApiTest.php
- tests/Feature/Api/CollectionApiTest.php

Create tests/Unit/Services/VersioningServiceTest.php:

- Test version creation
- Test version restoration
- Test old version pruning

Create factories for all models:

- database/factories/CollectionFactory.php
- database/factories/ComponentFactory.php
- database/factories/PageFactory.php
- etc.

Run tests: php artisan test

Target: 80%+ code coverage

Provide test files for all major features.

```

---

### Prompt 9.5: Production Deployment Script

```

Create deployment scripts and production configuration.

Create deploy.sh:

```bash
#!/bin/bash

echo "🚀 Deploying CMS..."

# Pull latest code
git pull origin main

# Install dependencies
composer install --no-dev --optimize-autoloader
npm ci

# Build assets
npm run build

# Run migrations
php artisan migrate --force

# Clear and cache
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Restart services
php artisan queue:restart
sudo systemctl restart php8.2-fpm
sudo systemctl reload nginx

echo "✅ Deployment complete!"
```

Create .env.production template:

```env
APP_NAME="Headless CMS"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cms_production
DB_USERNAME=cms_user
DB_PASSWORD=

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=
MAIL_PORT=
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=tls

FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=
AWS_BUCKET=
AWS_URL=

SENTRY_LARAVEL_DSN=
```

Create config/deploy.php (if using Deployer):

```php
require 'recipe/laravel.php';

set('repository', 'git@github.com:yourname/cms.git');
set('keep_releases', 5);

host('production')
    ->hostname('your-server.com')
    ->user('deploy')
    ->set('deploy_path', '/var/www/cms');

task('npm:build', function () {
    run('cd {{release_path}} && npm ci && npm run build');
});

after('deploy:update_code', 'npm:build');
```

Create supervisor config for queues:

```ini
[program:cms-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/cms/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=4
redirect_stderr=true
stdout_logfile=/var/www/cms/storage/logs/worker.log
stopwaitsecs=3600
```

Provide complete deployment setup.

```

---

### Prompt 9.6: Documentation Generation

```

Create comprehensive user and developer documentation.

Create docs/USER_GUIDE.md:

- Getting started section
- How to create collections (with screenshots placeholders)
- How to build components
- How to compose pages
- How to use media library
- How to manage users
- FAQ section

Create docs/DEVELOPER_GUIDE.md:

- Installation instructions
- Environment setup
- Database setup
- Running locally
- Testing
- Contributing guidelines

Create docs/API_DOCUMENTATION.md:

- Complete API reference
- Authentication
- All endpoints with examples
- Error codes
- Rate limiting info
- Webhook documentation

Create README.md:

```markdown
# Headless CMS

A flexible, powerful headless CMS built with Laravel and React.

## Features

- 🎨 Visual component builder
- 📦 Flexible collections
- 🖼️ Media library
- 📄 Page composition
- 🔄 Version control
- 🔐 MFA support
- 🚀 JSON API
- 🪝 Webhooks

## Quick Start

[Installation instructions]

## Documentation

- [User Guide](docs/USER_GUIDE.md)
- [Developer Guide](docs/DEVELOPER_GUIDE.md)
- [API Documentation](docs/API_DOCUMENTATION.md)

## Tech Stack

- Laravel 11
- React 18
- Tailwind CSS
- shadcn/ui

## License

MIT
```

Generate API documentation with Swagger:

```bash
composer require darkaonline/l5-swagger
php artisan vendor:publish --provider="L5Swagger\L5SwaggerServiceProvider"
```

Add Swagger annotations to API controllers.

Provide complete documentation templates.

```

---

## 🎉 FINAL PROMPT: Pull It All Together

### Prompt 9.7: Final Review & Checklist

```

Perform a final review and create a pre-launch checklist.

Create LAUNCH_CHECKLIST.md:

## Security

- [ ] All routes protected with middleware
- [ ] CSRF protection enabled
- [ ] Rate limiting configured
- [ ] API tokens secure
- [ ] Passwords hashed
- [ ] MFA working
- [ ] File upload validation
- [ ] SQL injection prevention (using Eloquent)
- [ ] XSS prevention (React auto-escapes)

## Performance

- [ ] Database indexes added
- [ ] N+1 queries eliminated
- [ ] API responses cached
- [ ] Assets minified
- [ ] Images optimized
- [ ] Lazy loading implemented

## Testing

- [ ] All feature tests passing
- [ ] 80%+ code coverage
- [ ] Manual testing complete
- [ ] Cross-browser testing
- [ ] Mobile responsive

## Documentation

- [ ] README complete
- [ ] User guide written
- [ ] Developer guide written
- [ ] API documented
- [ ] Code commented

## Production

- [ ] Environment variables set
- [ ] SSL certificate installed
- [ ] Database backed up
- [ ] Queue workers running
- [ ] Cron jobs configured
- [ ] Error tracking (Sentry)
- [ ] Logging configured
- [ ] Monitoring set up

## Final Steps

- [ ] Create default webmaster user
- [ ] Test complete user flow
- [ ] Test API endpoints
- [ ] Test webhooks
- [ ] Load testing
- [ ] Security audit
- [ ] Deploy to production!

Review all code, run all tests, and ensure everything is working perfectly before launch.

```

---

## ✅ YOU'RE DONE!

You now have **complete, copy-paste-ready prompts** for an LLM to build your entire headless CMS.

### How to Use:
1. Copy a prompt
2. Paste into Claude/ChatGPT/Cursor
3. Review generated code
4. Paste into your project
5. Test it
6. Move to next prompt

**Total: ~60 prompts to build the complete system**

Good luck! 🚀
```
