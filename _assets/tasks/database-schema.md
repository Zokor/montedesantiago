# Complete Database Schema

## Entity Relationship Diagram (ERD)

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id              │
│ name            │
│ email           │◄────────────┐
│ password        │             │
│ is_active       │             │
│ is_mfa_enabled  │             │
│ mfa_secret      │             │
│ blocked_at      │             │
│ last_login_at   │             │
│ timestamps      │             │
└────────┬────────┘             │
         │                       │
         │ created_by            │
         │ updated_by            │
         │ uploaded_by           │
         │                       │
┌────────┴────────┐         ┌───┴──────────┐
│   collections   │         │     pages    │
├─────────────────┤         ├──────────────┤
│ id              │         │ id           │
│ name            │         │ title        │
│ slug  (unique)  │         │ slug (unique)│
│ description     │         │ is_homepage  │
│ is_active       │         │ status       │
│ timestamps      │         │ published_at │
└────────┬────────┘         │ created_by   │───┐
         │                  │ updated_by   │───┘
         │                  │ timestamps   │
         │                  └───────┬──────┘
         │                          │
         │                          │ page_id
         │                          │
┌────────┴──────────┐      ┌───────┴──────────────┐
│ collection_fields │      │   page_versions      │
├───────────────────┤      ├──────────────────────┤
│ id                │      │ id                   │
│ collection_id     │──┐   │ page_id              │
│ name              │  │   │ content (JSON)       │
│ slug              │  │   │ created_by           │
│ data_type (enum)  │  │   │ change_summary       │
│ config (JSON)     │  │   │ timestamps           │
│ is_required       │  │   └──────────────────────┘
│ default_value     │  │
│ help_text         │  │
│ order             │  │
│ timestamps        │  │
└───────────────────┘  │
                       │
         collection_id │
                       │
┌──────────────────────┴┐
│   collection_items    │
├───────────────────────┤
│ id                    │
│ collection_id         │
│ data (JSON)           │◄── Stores all field values
│ is_published          │
│ order                 │
│ timestamps            │
└───────────────────────┘


┌─────────────────┐
│   components    │
├─────────────────┤
│ id              │
│ name            │
│ slug  (unique)  │
│ description     │
│ is_active       │
│ timestamps      │
└────────┬────────┘
         │
         │ component_id
         │
┌────────┴──────────┐
│ component_fields  │
├───────────────────┤
│ id                │
│ component_id      │
│ name              │
│ slug              │
│ data_type (enum)  │
│ config (JSON)     │
│ is_required       │
│ default_value     │
│ help_text         │
│ order             │
│ timestamps        │
└───────────────────┘


┌──────────────────────┐
│   page_components    │ ◄── Pivot table
├──────────────────────┤
│ id                   │
│ page_id              │───┐
│ component_id         │───┼──┐
│ data (JSON)          │   │  │
│ order                │   │  │
│ timestamps           │   │  │
└──────────────────────┘   │  │
         │                  │  │
         └──────────────────┘  │
                               │
                       ┌───────┘
                       │
              ┌────────┴────────┐
              │   components    │
              └─────────────────┘


┌─────────────────┐
│      media      │
├─────────────────┤
│ id              │
│ filename        │
│ original_name   │
│ mime_type       │
│ disk            │
│ path            │
│ thumbnail_path  │
│ size            │
│ metadata (JSON) │◄── width, height, alt, etc.
│ folder          │
│ uploaded_by     │───┐
│ timestamps      │   │
└─────────────────┘   │
                      │
              ┌───────┘
              │
      ┌───────┴────────┐
      │     users      │
      └────────────────┘


┌─────────────────┐
│   api_tokens    │
├─────────────────┤
│ id              │
│ user_id         │───┐
│ name            │   │
│ token (unique)  │   │
│ permissions     │   │
│ last_used_at    │   │
│ expires_at      │   │
│ timestamps      │   │
└─────────────────┘   │
                      │
              ┌───────┘
              │
      ┌───────┴────────┐
      │     users      │
      └────────────────┘


┌─────────────────┐
│    webhooks     │
├─────────────────┤
│ id              │
│ user_id         │───┐
│ name            │   │
│ url             │   │
│ events (JSON)   │   │
│ secret          │   │
│ is_active       │   │
│ timestamps      │   │
└────────┬────────┘   │
         │            │
         │ webhook_id │
         │            │
┌────────┴─────────┐  │
│  webhook_logs    │  │
├──────────────────┤  │
│ id               │  │
│ webhook_id       │──┘
│ event            │
│ status_code      │
│ response         │
│ sent_at          │
│ timestamps       │
└──────────────────┘
```

---

## Table Definitions

### 1. users

```sql
CREATE TABLE users (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret TEXT NULL,
    mfa_backup_codes JSON NULL,
    blocked_at TIMESTAMP NULL,
    blocked_reason VARCHAR(255) NULL,
    last_login_at TIMESTAMP NULL,
    last_login_ip VARCHAR(45) NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP NULL,

    INDEX idx_email (email),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 2. collections

```sql
CREATE TABLE collections (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP NULL,

    INDEX idx_slug (slug),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 3. collection_fields

```sql
CREATE TABLE collection_fields (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    collection_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    data_type VARCHAR(50) NOT NULL, -- Enum: short_text, text, date, boolean, image, file, list, collection
    config JSON NULL,
    is_required BOOLEAN DEFAULT FALSE,
    default_value TEXT NULL,
    help_text TEXT NULL,
    `order` INT DEFAULT 0,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,

    FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
    UNIQUE KEY unique_collection_slug (collection_id, slug),
    INDEX idx_collection_id (collection_id),
    INDEX idx_order (collection_id, `order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 4. collection_items

```sql
CREATE TABLE collection_items (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    collection_id BIGINT UNSIGNED NOT NULL,
    data JSON NOT NULL, -- All field values stored here
    is_published BOOLEAN DEFAULT TRUE,
    `order` INT DEFAULT 0,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP NULL,

    FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
    INDEX idx_collection_published (collection_id, is_published),
    INDEX idx_collection_order (collection_id, `order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 5. components

```sql
CREATE TABLE components (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP NULL,

    INDEX idx_slug (slug),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 6. component_fields

```sql
CREATE TABLE component_fields (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    component_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    data_type VARCHAR(50) NOT NULL,
    config JSON NULL,
    is_required BOOLEAN DEFAULT FALSE,
    default_value TEXT NULL,
    help_text TEXT NULL,
    `order` INT DEFAULT 0,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,

    FOREIGN KEY (component_id) REFERENCES components(id) ON DELETE CASCADE,
    UNIQUE KEY unique_component_slug (component_id, slug),
    INDEX idx_component_id (component_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 7. pages

```sql
CREATE TABLE pages (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    is_homepage BOOLEAN DEFAULT FALSE,
    status ENUM('draft', 'published') DEFAULT 'draft',
    published_at TIMESTAMP NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP NULL,

    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_status_published (status, published_at),
    INDEX idx_is_homepage (is_homepage)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 8. page_components

```sql
CREATE TABLE page_components (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    page_id BIGINT UNSIGNED NOT NULL,
    component_id BIGINT UNSIGNED NOT NULL,
    data JSON NOT NULL, -- Component field values
    `order` INT DEFAULT 0,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,

    FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
    FOREIGN KEY (component_id) REFERENCES components(id) ON DELETE RESTRICT,
    INDEX idx_page_order (page_id, `order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 9. page_versions

```sql
CREATE TABLE page_versions (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    page_id BIGINT UNSIGNED NOT NULL,
    content JSON NOT NULL, -- Complete page snapshot
    created_by BIGINT UNSIGNED NOT NULL,
    change_summary VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,

    FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_page_created (page_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 10. media

```sql
CREATE TABLE media (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    disk VARCHAR(50) DEFAULT 'public',
    path VARCHAR(500) NOT NULL,
    thumbnail_path VARCHAR(500) NULL,
    size BIGINT UNSIGNED NOT NULL, -- bytes
    metadata JSON NULL, -- width, height, alt, title, description
    folder VARCHAR(255) DEFAULT '/',
    uploaded_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP NULL,

    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_mime_type (mime_type),
    INDEX idx_folder (folder),
    INDEX idx_uploaded_by (uploaded_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 11. api_tokens

```sql
CREATE TABLE api_tokens (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(64) UNIQUE NOT NULL,
    permissions JSON NULL, -- ['pages:read', 'collections:read']
    last_used_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 12. webhooks

```sql
CREATE TABLE webhooks (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    events JSON NOT NULL, -- ['page.published', 'collection.updated']
    secret VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 13. webhook_logs

```sql
CREATE TABLE webhook_logs (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    webhook_id BIGINT UNSIGNED NOT NULL,
    event VARCHAR(100) NOT NULL,
    status_code INT NULL,
    response TEXT NULL,
    sent_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,

    FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE,
    INDEX idx_webhook_sent (webhook_id, sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Relationships Summary

### One-to-Many

- `users` → `pages` (created_by, updated_by)
- `users` → `media` (uploaded_by)
- `users` → `api_tokens`
- `users` → `webhooks`
- `collections` → `collection_fields`
- `collections` → `collection_items`
- `components` → `component_fields`
- `pages` → `page_versions`
- `webhooks` → `webhook_logs`

### Many-to-Many

- `pages` ↔ `components` (through `page_components`)

---

## JSON Field Structures

### collection_items.data

```json
{
  "title": "Example Item",
  "description": "Lorem ipsum...",
  "publish_date": "2024-01-15",
  "is_featured": true,
  "thumbnail": 123,
  "tags": ["news", "featured"]
}
```

### page_components.data

```json
{
  "heading": "Welcome",
  "subheading": "To our site",
  "background_image": 456,
  "cta_text": "Learn More",
  "cta_link": "/about"
}
```

### page_versions.content

```json
{
    "title": "Homepage",
    "slug": "home",
    "is_homepage": true,
    "status": "published",
    "components": [
        {
            "id": 1,
            "slug": "hero-section",
            "data": {...},
            "order": 0
        }
    ]
}
```

### media.metadata

```json
{
  "width": 1920,
  "height": 1080,
  "alt": "Hero image",
  "title": "Homepage hero",
  "description": "Main banner image"
}
```

---

## Index Strategy

### Critical Indexes

- All foreign keys
- Slug fields (for lookups)
- Status + published_at (for filtering published pages)
- collection_id + is_published (for querying items)
- Timestamps (for sorting)

### Composite Indexes

- `(collection_id, slug)` - Unique field slugs per collection
- `(page_id, order)` - Ordered component retrieval
- `(status, published_at)` - Published page queries

---

## Data Types Used

- **BIGINT UNSIGNED** - IDs (supports billions of records)
- **VARCHAR** - Text with known limits
- **TEXT** - Long text without limits
- **JSON** - Flexible data storage
- **BOOLEAN** - True/false flags
- **TIMESTAMP** - Date/time with timezone
- **ENUM** - Fixed set of values
- **INT** - Numeric ordering

---

## Storage Estimates

### Approximate sizes per record:

- Collection: ~500 bytes
- Collection Item: ~2-5 KB (depends on data)
- Component: ~500 bytes
- Page: ~1 KB
- Page Version: ~10-50 KB (full snapshot)
- Media: ~200 bytes (file stored separately)

### For 10,000 records each:

- Collections: ~5 MB
- Items: ~20-50 MB
- Components: ~5 MB
- Pages: ~10 MB
- Versions (5 per page): ~250-500 MB
- Media metadata: ~2 MB

**Total Database Size: ~300-600 MB** (excluding actual media files)
