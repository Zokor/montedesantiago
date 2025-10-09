# Phase 2: Core Data Models

**Duration:** Week 2-3
**Goal:** Implement foundational data structures and type system

---

## 2.1 Data Types System

### Task 2.1.1: DataType Enum

**Estimated Time:** 1 hour

- [ ] Create enum: `php artisan make:enum DataType`
- [ ] Define data types:

```php
namespace App\Enums;

enum DataType: string
{
case SHORT_TEXT = 'short_text';
case TEXT = 'text';
case DATE = 'date';
case BOOLEAN = 'boolean';
case IMAGE = 'image';
case FILE = 'file';
case LIST = 'list';
case COLLECTION = 'collection';

public function label(): string
{
return match($this) {
self::SHORT_TEXT => 'Short Text (max 256 chars)',
self::TEXT => 'Long Text',
self::DATE => 'Date',
self::BOOLEAN => 'Boolean (Yes/No)',
self::IMAGE => 'Image',
self::FILE => 'File',
self::LIST => 'Embedded List',
self::COLLECTION => 'Collection Reference',
};
}

public function validationRules(): array
{
return match($this) {
self::SHORT_TEXT => ['string', 'max:256'],
self::TEXT => ['string'],
self::DATE => ['date'],
self::BOOLEAN => ['boolean'],
self::IMAGE => ['file', 'image', 'max:5120'], // 5MB
self::FILE => ['file', 'max:10240'], // 10MB
self::LIST => ['array'],
self::COLLECTION => ['exists:collections,id'],
};
}
}
```

**Verification:** Enum accessible, labels display correctly

---

### Task 2.1.2: Field Validation Service

**Estimated Time:** 2 hours

- [ ] Create service: `app/Services/FieldValidationService.php`
- [ ] Implement methods:

```php
public function validate(array $data, DataType $type): bool
public function getErrorMessages(DataType $type): array
public function validateListStructure(array $listConfig): bool
```

- [ ] Add custom validation for nested lists:
- Validate list item types
- Prevent infinite nesting
- Check required fields
- [ ] Add validation for collection references:
- Check collection exists
- Validate foreign key

**Verification:** Unit tests for each data type

---

## 2.2 Database Schema

### Task 2.2.1: Collections Tables

**Estimated Time:** 2 hours

- [ ] Create migration: `create_collections_table`

```php
Schema::create('collections', function (Blueprint $table) {
$table->id();
$table->string('name');
$table->string('slug')->unique();
$table->text('description')->nullable();
$table->boolean('is_active')->default(true);
$table->timestamps();
$table->softDeletes();
});
```

- [ ] Create migration: `create_collection_fields_table`

```php
Schema::create('collection_fields', function (Blueprint $table) {
$table->id();
$table->foreignId('collection_id')->constrained()->cascadeOnDelete();
$table->string('name');
$table->string('slug');
$table->string('data_type'); // enum value
$table->json('config')->nullable(); // for lists, validation rules, etc.
$table->boolean('is_required')->default(false);
$table->text('default_value')->nullable();
$table->text('help_text')->nullable();
$table->integer('order')->default(0);
$table->timestamps();

$table->unique(['collection_id', 'slug']);
});
```

- [ ] Create migration: `create_collection_items_table`

```php
Schema::create('collection_items', function (Blueprint $table) {
$table->id();
$table->foreignId('collection_id')->constrained()->cascadeOnDelete();
$table->json('data'); // Actual field values stored as JSON
$table->boolean('is_published')->default(true);
$table->integer('order')->default(0);
$table->timestamps();
$table->softDeletes();

$table->index('collection_id');
});
```

**Verification:** Migrations run successfully

---

### Task 2.2.2: Components Tables

**Estimated Time:** 2 hours

- [ ] Create migration: `create_components_table`

```php
Schema::create('components', function (Blueprint $table) {
$table->id();
$table->string('name');
$table->string('slug')->unique();
$table->text('description')->nullable();
$table->boolean('is_active')->default(true);
$table->timestamps();
$table->softDeletes();
});
```

- [ ] Create migration: `create_component_fields_table`

```php
Schema::create('component_fields', function (Blueprint $table) {
$table->id();
$table->foreignId('component_id')->constrained()->cascadeOnDelete();
$table->string('name');
$table->string('slug');
$table->string('data_type');
$table->json('config')->nullable();
$table->boolean('is_required')->default(false);
$table->text('default_value')->nullable();
$table->text('help_text')->nullable();
$table->integer('order')->default(0);
$table->timestamps();

$table->unique(['component_id', 'slug']);
});
```

**Verification:** Migrations run successfully

---

### Task 2.2.3: Pages Tables

**Estimated Time:** 2 hours

- [ ] Create migration: `create_pages_table`

```php
Schema::create('pages', function (Blueprint $table) {
$table->id();
$table->string('title');
$table->string('slug')->unique();
$table->boolean('is_homepage')->default(false);
$table->enum('status', ['draft', 'published'])->default('draft');
$table->timestamp('published_at')->nullable();
$table->foreignId('created_by')->nullable()->constrained('users');
$table->foreignId('updated_by')->nullable()->constrained('users');
$table->timestamps();
$table->softDeletes();
});
```

- [ ] Create migration: `create_page_components_table`

```php
Schema::create('page_components', function (Blueprint $table) {
$table->id();
$table->foreignId('page_id')->constrained()->cascadeOnDelete();
$table->foreignId('component_id')->constrained();
$table->json('data'); // Component field values
$table->integer('order')->default(0);
$table->timestamps();

$table->index(['page_id', 'order']);
});
```

- [ ] Create migration: `create_page_versions_table`

```php
Schema::create('page_versions', function (Blueprint $table) {
$table->id();
$table->foreignId('page_id')->constrained()->cascadeOnDelete();
$table->json('content'); // Complete page snapshot
$table->foreignId('created_by')->constrained('users');
$table->string('change_summary')->nullable();
$table->timestamps();

$table->index(['page_id', 'created_at']);
});
```

**Verification:** Migrations run successfully

---

### Task 2.2.4: Media Table

**Estimated Time:** 1 hour

- [ ] Create migration: `create_media_table`

```php
Schema::create('media', function (Blueprint $table) {
$table->id();
$table->string('filename');
$table->string('original_filename');
$table->string('mime_type');
$table->string('disk')->default('public');
$table->string('path');
$table->string('thumbnail_path')->nullable();
$table->unsignedBigInteger('size'); // bytes
$table->json('metadata')->nullable(); // width, height, alt, etc.
$table->string('folder')->default('/');
$table->foreignId('uploaded_by')->constrained('users');
$table->timestamps();
$table->softDeletes();

$table->index('mime_type');
$table->index('folder');
});
```

**Verification:** Migration runs successfully

---

### Task 2.2.5: Run All Migrations

**Estimated Time:** 30 minutes

- [ ] Run: `php artisan migrate`
- [ ] Verify all tables created
- [ ] Check foreign key constraints
- [ ] Test cascade deletes with dummy data
- [ ] Create database diagram/ERD for documentation

**Verification:** Database schema complete and correct

---

## 2.3 Eloquent Models

### Task 2.3.1: Collection Model

**Estimated Time:** 2 hours

- [ ] Create model: `php artisan make:model Collection`
- [ ] Define relationships:

```php
public function fields()
{
return $this->hasMany(CollectionField::class)->orderBy('order');
}

public function items()
{
return $this->hasMany(CollectionItem::class);
}
```

- [ ] Add accessors/mutators:

```php
protected function slug(): Attribute
{
return Attribute::make(
set: fn ($value) => Str::slug($value),
);
}
```

- [ ] Add scopes:

```php
public function scopeActive($query)
{
return $query->where('is_active', true);
}
```

- [ ] Configure:

```php
protected $fillable = ['name', 'slug', 'description', 'is_active'];
protected $casts = ['is_active' => 'boolean'];
use SoftDeletes;
```

**Verification:** Model relationships work

---

### Task 2.3.2: CollectionField Model

**Estimated Time:** 1 hour

- [ ] Create model: `php artisan make:model CollectionField`
- [ ] Define relationships:

```php
public function collection()
{
return $this->belongsTo(Collection::class);
}
```

- [ ] Add casts:

```php
protected $casts = [
'config' => 'array',
'is_required' => 'boolean',
'data_type' => DataType::class,
];
```

- [ ] Add fillable:

```php
protected $fillable = [
'collection_id', 'name', 'slug', 'data_type',
'config', 'is_required', 'default_value',
'help_text', 'order'
];
```

**Verification:** Field definitions store correctly

---

### Task 2.3.3: CollectionItem Model

**Estimated Time:** 1 hour

- [ ] Create model: `php artisan make:model CollectionItem`
- [ ] Define relationships:

```php
public function collection()
{
return $this->belongsTo(Collection::class);
}
```

- [ ] Add data accessor:

```php
protected $casts = [
'data' => 'array',
'is_published' => 'boolean',
];

public function getFieldValue(string $fieldSlug)
{
return $this->data[$fieldSlug] ?? null;
}

public function setFieldValue(string $fieldSlug, $value)
{
$data = $this->data;
$data[$fieldSlug] = $value;
$this->data = $data;
}
```

- [ ] Add scopes:

```php
public function scopePublished($query)
{
return $query->where('is_published', true);
}
```

**Verification:** Can store/retrieve JSON data

---

### Task 2.3.4: Component Model

**Estimated Time:** 2 hours

- [ ] Create model: `php artisan make:model Component`
- [ ] Define relationships:

```php
public function fields()
{
return $this->hasMany(ComponentField::class)->orderBy('order');
}

public function pages()
{
return $this->belongsToMany(Page::class, 'page_components')
->withPivot(['data', 'order'])
->withTimestamps();
}
```

- [ ] Add slug generation:

```php
protected function slug(): Attribute
{
return Attribute::make(
set: fn ($value) => Str::slug($value),
);
}
```

- [ ] Configure:

```php
protected $fillable = ['name', 'slug', 'description', 'is_active'];
protected $casts = ['is_active' => 'boolean'];
use SoftDeletes;
```

- [ ] Add method to get schema:

```php
public function getSchema(): array
{
return $this->fields->map(function ($field) {
return [
'slug' => $field->slug,
'name' => $field->name,
'type' => $field->data_type->value,
'required' => $field->is_required,
'config' => $field->config,
];
})->toArray();
}
```

**Verification:** Schema generation works

---

### Task 2.3.5: ComponentField Model

**Estimated Time:** 1 hour

- [ ] Create model: `php artisan make:model ComponentField`
- [ ] Define relationships:

```php
public function component()
{
return $this->belongsTo(Component::class);
}
```

- [ ] Configure:

```php
protected $fillable = [
'component_id', 'name', 'slug', 'data_type',
'config', 'is_required', 'default_value',
'help_text', 'order'
];

protected $casts = [
'config' => 'array',
'is_required' => 'boolean',
'data_type' => DataType::class,
];
```

**Verification:** Component fields store correctly

---

### Task 2.3.6: Page Model

**Estimated Time:** 2 hours

- [ ] Create model: `php artisan make:model Page`
- [ ] Define relationships:

```php
public function components()
{
return $this->belongsToMany(Component::class, 'page_components')
->withPivot(['data', 'order'])
->orderByPivot('order')
->withTimestamps();
}

public function versions()
{
return $this->hasMany(PageVersion::class)->latest();
}

public function creator()
{
return $this->belongsTo(User::class, 'created_by');
}

public function updater()
{
return $this->belongsTo(User::class, 'updated_by');
}
```

- [ ] Add scopes:

```php
public function scopePublished($query)
{
return $query->where('status', 'published');
}

public function scopeHomepage($query)
{
return $query->where('is_homepage', true);
}
```

- [ ] Configure:

```php
protected $fillable = [
'title', 'slug', 'is_homepage', 'status',
'published_at', 'created_by', 'updated_by'
];

protected $casts = [
'is_homepage' => 'boolean',
'published_at' => 'datetime',
];

use SoftDeletes;
```

**Verification:** Page relationships work

---

### Task 2.3.7: PageVersion Model

**Estimated Time:** 1 hour

- [ ] Create model: `php artisan make:model PageVersion`
- [ ] Define relationships:

```php
public function page()
{
return $this->belongsTo(Page::class);
}

public function author()
{
return $this->belongsTo(User::class, 'created_by');
}
```

- [ ] Configure:

```php
protected $fillable = [
'page_id', 'content', 'created_by', 'change_summary'
];

protected $casts = [
'content' => 'array',
];
```

- [ ] Add method to restore version:

```php
public function restore(): void
{
$this->page->update([
'title' => $this->content['title'],
'slug' => $this->content['slug'],
'is_homepage' => $this->content['is_homepage'],
]);

// Restore page components...
}
```

**Verification:** Version storage works

---

### Task 2.3.8: Media Model

**Estimated Time:** 1 hour

- [ ] Create model: `php artisan make:model Media`
- [ ] Define relationships:

```php
public function uploader()
{
return $this->belongsTo(User::class, 'uploaded_by');
}
```

- [ ] Add accessors:

````php
public function getUrlAttribute(): string
{
return Storage::disk($this->disk)->url($this->path);
}

public function getThumbnailUrlAttribute(): ?string
{
return $this->thumbnail_path
? Storage::disk($this->disk)->url($this->thumbnail_path)
: null;
}

public function getFormattedSizeAttribute(): string
{
$units = ['B', 'KB', 'MB', 'GB'];
$size = $this->size;
$unit = 0;

while ($size > 1024 && $unit < 3) {
    $size /=1024;
    $unit++;
    }

    return round($size, 2) . ' ' . $units[$unit];
    }
    ```
    - [ ] Configure:
    ```php
    protected $fillable=[ 'filename' , 'original_filename' , 'mime_type' , 'disk' , 'path' , 'thumbnail_path' , 'size' , 'metadata' , 'folder' , 'uploaded_by'
    ];

    protected $casts=[ 'metadata'=> 'array',
    'size' => 'integer',
    ];

    protected $appends = ['url', 'thumbnail_url', 'formatted_size'];

    use SoftDeletes;
    ```

    **Verification:** Media URLs generate correctly

    ---

    ## 2.4 Services Layer

    ### Task 2.4.1: Versioning Service
    **Estimated Time:** 3 hours

    - [ ] Create service: `app/Services/VersioningService.php`
    - [ ] Implement methods:
    ```php
    public function createVersion(Page $page, string $summary = null): PageVersion
    {
    // Capture current page state
    $content = [
    'title' => $page->title,
    'slug' => $page->slug,
    'is_homepage' => $page->is_homepage,
    'status' => $page->status,
    'components' => $page->components->map(function ($component) {
    return [
    'id' => $component->id,
    'slug' => $component->slug,
    'data' => $component->pivot->data,
    'order' => $component->pivot->order,
    ];
    })->toArray(),
    ];

    $version = $page->versions()->create([
    'content' => $content,
    'created_by' => auth()->id(),
    'change_summary' => $summary,
    ]);

    $this->pruneOldVersions($page);

    return $version;
    }

    private function pruneOldVersions(Page $page): void
    {
    // Keep only last 5 versions
    $versions = $page->versions()->orderByDesc('created_at')->get();

    if ($versions->count() > 5) {
    $versionsToDelete = $versions->slice(5);
    PageVersion::whereIn('id', $versionsToDelete->pluck('id'))->delete();
    }
    }

    public function restoreVersion(PageVersion $version): Page
    {
    $page = $version->page;
    $content = $version->content;

    DB::transaction(function () use ($page, $content) {
    // Update page metadata
    $page->update([
    'title' => $content['title'],
    'slug' => $content['slug'],
    'is_homepage' => $content['is_homepage'],
    ]);

    // Remove existing components
    $page->components()->detach();

    // Restore components
    foreach ($content['components'] as $component) {
    $page->components()->attach($component['id'], [
    'data' => $component['data'],
    'order' => $component['order'],
    ]);
    }
    });

    // Create new version to track restoration
    $this->createVersion($page, "Restored to version from " . $version->created_at);

    return $page->fresh();
    }

    public function compareVersions(PageVersion $v1, PageVersion $v2): array
    {
    // Return diff between two versions
    return [
    'title_changed' => $v1->content['title'] !== $v2->content['title'],
    'slug_changed' => $v1->content['slug'] !== $v2->content['slug'],
    'components_added' => [],
    'components_removed' => [],
    'components_modified' => [],
    ];
    }
    ```

    **Verification:** Create and restore versions work

    ---

    ### Task 2.4.2: Slug Generation Service
    **Estimated Time:** 2 hours

    - [ ] Create service: `app/Services/SlugService.php`
    - [ ] Implement methods:
    ```php
    public function generate(string $text, string $model, ?int $excludeId = null): string
    {
    $slug = Str::slug($text);
    $originalSlug = $slug;
    $counter = 1;

    while ($this->slugExists($slug, $model, $excludeId)) {
    $slug = $originalSlug . '-' . $counter;
    $counter++;
    }

    return $slug;
    }

    private function slugExists(string $slug, string $model, ?int $excludeId): bool
    {
    $query = $model::where('slug', $slug);

    if ($excludeId) {
    $query->where('id', '!=', $excludeId);
    }

    return $query->exists();
    }

    public function validate(string $slug): bool
    {
    // Only lowercase letters, numbers, and hyphens
    return (bool) preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug);
    }
    ```

    **Verification:** Unique slugs generated correctly

    ---

    ### Task 2.4.3: Component Builder Service
    **Estimated Time:** 3 hours

    - [ ] Create service: `app/Services/ComponentBuilderService.php`
    - [ ] Implement methods:
    ```php
    public function buildComponent(array $data): Component
    {
    return DB::transaction(function () use ($data) {
    $component = Component::create([
    'name' => $data['name'],
    'slug' => $data['slug'] ?? Str::slug($data['name']),
    'description' => $data['description'] ?? null,
    ]);

    foreach ($data['fields'] as $index => $field) {
    $component->fields()->create([
    'name' => $field['name'],
    'slug' => $field['slug'] ?? Str::slug($field['name']),
    'data_type' => $field['data_type'],
    'config' => $field['config'] ?? null,
    'is_required' => $field['is_required'] ?? false,
    'default_value' => $field['default_value'] ?? null,
    'help_text' => $field['help_text'] ?? null,
    'order' => $index,
    ]);
    }

    return $component->fresh('fields');
    });
    }

    public function updateComponent(Component $component, array $data): Component
    {
    return DB::transaction(function () use ($component, $data) {
    $component->update([
    'name' => $data['name'],
    'description' => $data['description'] ?? null,
    ]);

    // Remove old fields
    $component->fields()->delete();

    // Add new fields
    foreach ($data['fields'] as $index => $field) {
    $component->fields()->create([
    'name' => $field['name'],
    'slug' => $field['slug'] ?? Str::slug($field['name']),
    'data_type' => $field['data_type'],
    'config' => $field['config'] ?? null,
    'is_required' => $field['is_required'] ?? false,
    'default_value' => $field['default_value'] ?? null,
    'help_text' => $field['help_text'] ?? null,
    'order' => $index,
    ]);
    }

    return $component->fresh('fields');
    });
    }

    public function validateComponentData(Component $component, array $data): array
    {
    $errors = [];

    foreach ($component->fields as $field) {
    $value = $data[$field->slug] ?? null;

    if ($field->is_required && empty($value)) {
    $errors[$field->slug] = "{$field->name} is required";
    continue;
    }

    // Validate based on data type
    $validator = Validator::make(
    [$field->slug => $value],
    [$field->slug => $field->data_type->validationRules()]
    );

    if ($validator->fails()) {
    $errors[$field->slug] = $validator->errors()->first($field->slug);
    }
    }

    return $errors;
    }
    ```

    **Verification:** Components build with validation

    ---

    ## 2.5 Input Components (React)

    ### Task 2.5.1: ShortTextInput Component
    **Estimated Time:** 1 hour

    - [ ] Create: `resources/js/Components/Forms/DataTypeFields/ShortTextInput.jsx`
    - [ ] Implement:
    ```jsx
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';

    export default function ShortTextInput({
    field,
    value,
    onChange,
    error
    }) {
    return (
    <div className="space-y-2">
        <Label htmlFor={field.slug}>
            {field.name}
            {field.is_required && <span className="text-red-500">*</span>}
        </Label>
        <Input
            id={field.slug}
            value={value || '' }
            onChange={(e)=> onChange(field.slug, e.target.value)}
        maxLength={256}
        placeholder={field.help_text}
        className={error ? 'border-red-500' : ''}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <p className="text-sm text-gray-500">
            {value?.length || 0}/256 characters
        </p>
    </div>
    );
    }
    ```

    **Verification:** Input renders with character count

    ---

    ### Task 2.5.2: RichTextEditor Component
    **Estimated Time:** 3 hours

    - [ ] Install TipTap: `npm install @tiptap/react @tiptap/starter-kit`
    - [ ] Create: `resources/js/Components/Forms/DataTypeFields/RichTextEditor.jsx`
    - [ ] Implement editor with:
    - Bold, italic, underline
    - Headings (H1-H6)
    - Lists (ordered/unordered)
    - Links
    - Blockquotes
    - Code blocks
    - Toolbar
    - [ ] Style editor container
    - [ ] Add character counter (optional)

    **Verification:** Can format text, output is HTML

    ---

    ### Task 2.5.3: DatePicker Component
    **Estimated Time:** 2 hours

    - [ ] Install: `npx shadcn-ui@latest add calendar popover`
    - [ ] Create: `resources/js/Components/Forms/DataTypeFields/DatePicker.jsx`
    - [ ] Implement:
    ```jsx
    import { Calendar } from '@/components/ui/calendar';
    import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
    import { Button } from '@/components/ui/button';
    import { CalendarIcon } from 'lucide-react';
    import { format } from 'date-fns';

    export default function DatePicker({ field, value, onChange, error }) {
    const [date, setDate] = useState(value ? new Date(value) : null);

    return (
    <div className="space-y-2">
        <Label>{field.name}</Label>
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : 'Pick a date'}
                </Button>
            </PopoverTrigger>
            <PopoverContent>
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d)=> {
                    setDate(d);
                    onChange(field.slug, d?.toISOString());
                    }}
                    />
            </PopoverContent>
        </Popover>
        {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
    );
    }
    ```

    **Verification:** Date picker works, outputs ISO string

    ---

    ### Task 2.5.4: BooleanToggle Component
    **Estimated Time:** 1 hour

    - [ ] Install: `npx shadcn-ui@latest add switch`
    - [ ] Create: `resources/js/Components/Forms/DataTypeFields/BooleanToggle.jsx`
    - [ ] Implement with Switch component
    - [ ] Add label and help text
    - [ ] Show ON/OFF state

    **Verification:** Toggle works, returns boolean

    ---

    ### Task 2.5.5: ImageUploader Component
    **Estimated Time:** 3 hours

    - [ ] Create: `resources/js/Components/Forms/DataTypeFields/ImageUploader.jsx`
    - [ ] Implement:
    - Drag-and-drop zone
    - Click to browse
    - Image preview
    - Remove image button
    - File validation (type, size)
    - Loading state during upload
    - Integration with Media Library (later)
    - [ ] Add image cropping (optional)

    **Verification:** Can upload, preview, remove images

    ---

    ### Task 2.5.6: FileUploader Component
    **Estimated Time:** 2 hours

    - [ ] Create: `resources/js/Components/Forms/DataTypeFields/FileUploader.jsx`
    - [ ] Similar to ImageUploader but for any file type
    - [ ] Show file icon based on MIME type
    - [ ] Display file name and size
    - [ ] Progress bar during upload

    **Verification:** Can upload any file type

    ---

    ### Task 2.5.7: ListBuilder Component
    **Estimated Time:** 4 hours

    - [ ] Create: `resources/js/Components/Forms/DataTypeFields/ListBuilder.jsx`
    - [ ] Implement:
    - Add list item button
    - Remove item button
    - Reorder items (drag-drop)
    - Nested field rendering based on config
    - Each item has own data type inputs
    - [ ] Handle nested validation
    - [ ] Prevent deep nesting (max 2 levels)

    **Verification:** Can build complex nested lists

    ---

    ### Task 2.5.8: CollectionSelector Component
    **Estimated Time:** 2 hours

    - [ ] Install: `npx shadcn-ui@latest add select`
    - [ ] Create: `resources/js/Components/Forms/DataTypeFields/CollectionSelector.jsx`
    - [ ] Implement:
    - Dropdown to select collection
    - Load collection items
    - Single or multiple select
    - Search/filter items
    - Display selected items
    - [ ] Fetch collections via API

    **Verification:** Can select collection items

    ---

    ## 2.6 Testing

    ### Task 2.6.1: Model Tests
    **Estimated Time:** 4 hours

    - [ ] Test Collection model:
    - Create/update/delete
    - Relationships
    - Scopes
    - [ ] Test Component model:
    - Schema generation
    - Field relationships
    - [ ] Test Page model:
    - Component attachments
    - Version creation
    - [ ] Test Media model:
    - URL generation
    - Metadata storage

    **Verification:** All model tests pass

    ---

    ### Task 2.6.2: Service Tests
    **Estimated Time:** 3 hours

    - [ ] Test VersioningService:
    - Version creation
    - Version restoration
    - Old version pruning
    - [ ] Test SlugService:
    - Unique slug generation
    - Validation
    - [ ] Test ComponentBuilderService:
    - Component creation
    - Data validation

    **Verification:** All service tests pass

    ---

    ## Phase 2 Checklist

    - [ ] All data type enums defined
    - [ ] All database tables created
    - [ ] All Eloquent models functional
    - [ ] All services implemented
    - [ ] All React input components working
    - [ ] Tests passing
    - [ ] Database schema documented

    **Estimated Total Time:** 50-60 hours

    ---

    ## Ready for Phase 3?

    Proceed to `03-collections.md` to build the collections management UI.
````
