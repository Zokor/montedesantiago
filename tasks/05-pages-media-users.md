# Phases 5-7: Pages, Media & Users

This document combines the remaining core modules for efficiency.

---

## PHASE 5: Pages Module (Week 5-6)

### 5.1 Backend - Pages

**Task 5.1.1: Page Controller (3h)**

- [ ] Create `PageController` with CRUD methods
- [ ] Implement homepage validation (only one allowed)
- [ ] Add publish/unpublish endpoints
- [ ] Add version creation on save
- [ ] Implement `PageResource` for API responses

**Task 5.1.2: Page Routes (30min)**

```php
Route::apiResource('pages', PageController::class);
Route::post('pages/{page}/publish', [PageController::class, 'publish']);
Route::post('pages/{page}/unpublish', [PageController::class, 'unpublish']);
Route::get('pages/{page}/versions', [PageController::class, 'versions']);
Route::post('pages/{page}/versions/{version}/restore', [PageController::class, 'restoreVersion']);
```

---

### 5.2 Frontend - Pages List

**Task 5.2.1: Pages Index (4h)**

- [ ] Create `Pages/Index.jsx` with table view
- [ ] Show: title, slug, status, homepage flag, updated date
- [ ] Add filters: status, homepage
- [ ] Add search by title
- [ ] Status badge indicators
- [ ] Quick actions: edit, duplicate, delete, publish/unpublish

**Task 5.2.2: Pages Table Component (3h)**

- [ ] Sortable columns
- [ ] Pagination
- [ ] Bulk actions (publish, unpublish, delete)
- [ ] Status indicators with color coding
- [ ] Preview link (optional)

---

### 5.3 Frontend - Page Composer

**Task 5.3.1: Page Form Layout (5h)**

- [ ] Create `Pages/Create.jsx` and `Pages/Edit.jsx`
- [ ] Two-panel layout:
  - **Left:** Page metadata (title, slug, homepage toggle, status)
  - **Right:** Component composition canvas
- [ ] Breadcrumb navigation
- [ ] Save/Cancel/Publish buttons
- [ ] Auto-save draft (optional)

**Task 5.3.2: Component Selector (4h)**

- [ ] Modal/sidebar to browse available components
- [ ] Search components
- [ ] Show component preview
- [ ] Add component to page
- [ ] Support multiple instances of same component

**Task 5.3.3: Page Canvas (6h)**

- [ ] Drag-drop components to reorder
- [ ] Each component instance shows:
  - Component name
  - Preview of data
  - Edit button (opens form)
  - Remove button
  - Drag handle
- [ ] Empty state
- [ ] Visual separator between components

**Task 5.3.4: Component Instance Editor (5h)**

- [ ] Modal/drawer to edit component data
- [ ] Dynamically render form based on component schema
- [ ] Use appropriate input for each field type
- [ ] Validate required fields
- [ ] Save/cancel buttons
- [ ] Form state management

---

### 5.4 Version Control

**Task 5.4.1: Version Creation (Backend) (2h)**

- [ ] Auto-create version on publish
- [ ] Capture complete page state (metadata + components + data)
- [ ] Store in `page_versions` table
- [ ] Keep only last 5 versions (prune old ones)
- [ ] Add optional change summary field

**Task 5.4.2: Version History UI (4h)**

- [ ] Create `VersionHistory.jsx` component
- [ ] List all versions with:
  - Date/time
  - Author name
  - Change summary
  - View/restore buttons
- [ ] Show as timeline or list
- [ ] Restore confirmation dialog

**Task 5.4.3: Version Comparison (3h)**

- [ ] Side-by-side diff view
- [ ] Highlight changes:
  - Title/slug changes
  - Components added/removed
  - Data field changes
- [ ] Use diff library or custom implementation

**Task 5.4.4: Version Restoration (2h)**

- [ ] Implement restore endpoint
- [ ] Restore page to selected version
- [ ] Create new version after restore (for history)
- [ ] Show success notification
- [ ] Redirect to edit page

---

### 5.5 Page Publishing

**Task 5.5.1: Publish Workflow (3h)**

- [ ] Draft vs Published states
- [ ] Publish button (with confirmation)
- [ ] Unpublish button
- [ ] Schedule publish (optional)
- [ ] Last published date display
- [ ] Publish creates version automatically

**Task 5.5.2: Homepage Management (2h)**

- [ ] Only one page can be homepage
- [ ] When marking as homepage, unmark others
- [ ] Visual indicator in list
- [ ] Warning when trying to unpublish homepage

---

### 5.6 Testing (4h)

- [ ] Test page CRUD
- [ ] Test version creation/restoration
- [ ] Test publish/unpublish
- [ ] Test homepage exclusivity
- [ ] Test component attachment/detachment

**Phase 5 Total: ~50-60 hours**

---

## PHASE 6: Media Library (Week 6-7)

### 6.1 Backend - Media Upload

**Task 6.1.1: Media Controller (4h)**

- [ ] Create `MediaController`
- [ ] Upload endpoint with validation
- [ ] Generate thumbnails for images (Intervention Image)
- [ ] Store metadata (dimensions, type, size)
- [ ] List/search/filter endpoint
- [ ] Delete endpoint
- [ ] Folder management (optional)

**Task 6.1.2: Image Processing (3h)**

- [ ] Auto-resize large images (max 2000px)
- [ ] Generate multiple thumbnail sizes
- [ ] Optimize file size
- [ ] Extract EXIF data
- [ ] Support formats: JPG, PNG, GIF, WebP, SVG

**Task 6.1.3: File Validation (1h)**

- [ ] Max file size limits
- [ ] Allowed MIME types
- [ ] Filename sanitization
- [ ] Virus scanning (optional)

---

### 6.2 Frontend - Media Browser

**Task 6.2.1: Media Library Page (5h)**

- [ ] Create `Media/Index.jsx`
- [ ] Grid view with thumbnails
- [ ] List view option
- [ ] Upload button/dropzone
- [ ] Search by filename
- [ ] Filter by type (images, documents, etc.)
- [ ] Folder navigation (if implemented)

**Task 6.2.2: File Upload Component (4h)**

- [ ] Drag-and-drop zone
- [ ] Click to browse
- [ ] Multiple file upload
- [ ] Upload progress bars
- [ ] Preview before upload
- [ ] Cancel upload
- [ ] Error handling

**Task 6.2.3: Media Grid (3h)**

- [ ] Thumbnail display
- [ ] Checkbox for selection
- [ ] File info overlay on hover
- [ ] Click to select/open details
- [ ] Lazy loading
- [ ] Infinite scroll or pagination

**Task 6.2.4: Media Details Panel (3h)**

- [ ] Show file details:
  - Filename
  - File size
  - Dimensions (for images)
  - Upload date
  - Uploaded by
  - Direct URL
- [ ] Edit metadata:
  - Alt text
  - Title
  - Description
- [ ] Replace file option
- [ ] Delete button
- [ ] Copy URL button

---

### 6.3 Media Picker Integration

**Task 6.3.1: Media Picker Modal (5h)**

- [ ] Reusable modal component
- [ ] Browse media library
- [ ] Upload new files
- [ ] Select single or multiple
- [ ] Search and filter
- [ ] Preview selected
- [ ] Confirm selection button

**Task 6.3.2: Integration with ImageUploader (2h)**

- [ ] "Browse Library" button
- [ ] Open media picker
- [ ] Return selected image
- [ ] Display in ImageUploader
- [ ] Store media ID (not just URL)

**Task 6.3.3: Integration with FileUploader (2h)**

- [ ] Same as ImageUploader but for any file type
- [ ] Show file icon based on type
- [ ] Display filename and size

---

### 6.4 Testing (3h)

- [ ] Test file upload
- [ ] Test thumbnail generation
- [ ] Test media deletion
- [ ] Test search/filter
- [ ] Test picker selection

**Phase 6 Total: ~35-40 hours**

---

## PHASE 7: User Management (Week 7)

### 7.1 Backend - Users

**Task 7.1.1: User Controller (3h)**

- [ ] Create `UserController`
- [ ] List users (exclude webmaster)
- [ ] Create user endpoint
- [ ] Update user endpoint
- [ ] Block/unblock endpoint
- [ ] Delete endpoint
- [ ] Password change endpoint
- [ ] MFA enable/disable endpoint

**Task 7.1.2: User Validation (1h)**

- [ ] Email unique validation
- [ ] Password strength requirements
- [ ] Name required
- [ ] Prevent deleting self
- [ ] Prevent blocking self

---

### 7.2 Frontend - Users List

**Task 7.2.1: Users Index (4h)**

- [ ] Create `Users/Index.jsx`
- [ ] Table with columns:
  - Name
  - Email
  - Status (active/blocked)
  - MFA enabled indicator
  - Last login
  - Actions
- [ ] Search by name/email
- [ ] Filter by status
- [ ] Add user button

**Task 7.2.2: User Form (4h)**

- [ ] Create `Users/Create.jsx` and `Users/Edit.jsx`
- [ ] Fields:
  - Name
  - Email
  - Password (on create)
  - Active toggle
  - MFA enabled (read-only, user controls)
- [ ] Validation
- [ ] Submit handling

---

### 7.3 User Security Features

**Task 7.3.1: Block/Unblock (2h)**

- [ ] Block button with reason input
- [ ] Unblock button
- [ ] Update `blocked_at` and `blocked_reason`
- [ ] Blocked users can't login
- [ ] Show block status/reason in UI

**Task 7.3.2: Force Password Change (2h)**

- [ ] Admin can mark "force password change"
- [ ] User redirected to change password on next login
- [ ] Implement backend flag
- [ ] Implement frontend flow

**Task 7.3.3: Activity Logs (3h - Optional)**

- [ ] Track user logins
- [ ] Track important actions
- [ ] Display in user profile
- [ ] Admin can view all activity

---

### 7.4 User Profile & Settings

**Task 7.4.1: User Profile Page (3h)**

- [ ] View own profile
- [ ] Edit name, email
- [ ] Change password form
- [ ] MFA setup section
- [ ] Session management (active sessions)

**Task 7.4.2: MFA Setup in Profile (2h)**

- [ ] Show current MFA status
- [ ] Enable MFA flow:
  - Generate QR code
  - Verify TOTP code
  - Show backup codes
  - Download backup codes
- [ ] Disable MFA flow (with password confirmation)
- [ ] Regenerate backup codes

---

### 7.5 Roles & Permissions (Optional but Recommended)

**Task 7.5.1: Roles Setup (3h)**

- [ ] Use Spatie Laravel Permission
- [ ] Define roles:
  - Admin (full access)
  - Editor (can't manage users)
  - Viewer (read-only)
- [ ] Assign permissions to roles
- [ ] Role assignment UI

**Task 7.5.2: Permission Checks (4h)**

- [ ] Middleware for route protection
- [ ] Frontend UI hiding based on permissions
- [ ] Check permissions in components
- [ ] Show "no permission" messages

---

### 7.6 Testing (3h)\*\*

- [ ] Test user CRUD
- [ ] Test block/unblock
- [ ] Test password change
- [ ] Test MFA setup/disable
- [ ] Test role assignment (if implemented)

**Phase 7 Total: ~35-40 hours**

---

## Quick Reference - Phases 5-7 Checklist

### Phase 5 - Pages

- [ ] Page CRUD complete
- [ ] Component composition working
- [ ] Version control functional
- [ ] Publish/unpublish works
- [ ] Homepage management
- [ ] Tests passing

### Phase 6 - Media

- [ ] File upload working
- [ ] Thumbnail generation
- [ ] Media browser functional
- [ ] Media picker integration
- [ ] Search/filter working
- [ ] Tests passing

### Phase 7 - Users

- [ ] User CRUD complete
- [ ] MFA management working
- [ ] Block/unblock functional
- [ ] User profile editable
- [ ] Roles/permissions (if included)
- [ ] Tests passing

**Combined Estimated Time: 120-140 hours (3-4 weeks)**

---

## Ready for Phase 8?

Proceed to `06-api-polish.md` for API development and final polish.
