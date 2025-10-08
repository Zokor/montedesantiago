# Phase 3: Collections Module

**Duration:** Week 3-4  
**Goal:** Full CRUD for collections and collection items

---

## 3.1 Backend - Collections

### Task 3.1.1: Collection Controller

**Estimated Time:** 3 hours

- [ ] Create controller: `php artisan make:controller Admin/CollectionController`
- [ ] Implement methods:

  ```php
  public function index()
  {
      $collections = Collection::withCount('items')
          ->orderBy('name')
          ->paginate(20);

      return response()->json($collections);
  }

  public function store(Request $request)
  {
      $validated = $request->validate([
          'name' => 'required|string|max:255',
          'slug' => 'nullable|string|unique:collections,slug',
          'description' => 'nullable|string',
          'fields' => 'required|array|min:1',
          'fields.*.name' => 'required|string',
          'fields.*.slug' => 'nullable|string',
          'fields.*.data_type' => 'required|in:' . implode(',', array_column(DataType::cases(), 'value')),
          'fields.*.config' => 'nullable|array',
          'fields.*.is_required' => 'boolean',
          'fields.*.default_value' => 'nullable',
          'fields.*.help_text' => 'nullable|string',
      ]);

      $collection = DB::transaction(function () use ($validated) {
          $collection = Collection::create([
              'name' => $validated['name'],
              'slug' => $validated['slug'] ?? Str::slug($validated['name']),
              'description' => $validated['description'] ?? null,
          ]);

          foreach ($validated['fields'] as $index => $field) {
              $collection->fields()->create([
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

          return $collection->fresh('fields');
      });

      return response()->json($collection, 201);
  }

  public function show(Collection $collection)
  {
      return response()->json($collection->load('fields'));
  }

  public function update(Request $request, Collection $collection)
  {
      // Similar to store but updates existing
  }

  public function destroy(Collection $collection)
  {
      $collection->delete();
      return response()->json(['message' => 'Collection deleted']);
  }
  ```

**Verification:** CRUD operations work via API

---

### Task 3.1.2: Collection Routes

**Estimated Time:** 30 minutes

- [ ] Add to `routes/web.php`:
  ```php
  Route::middleware(['auth', 'active.user'])->prefix('bo')->group(function () {
      Route::apiResource('collections', CollectionController::class);
  });
  ```
- [ ] Test routes with Postman/Insomnia

**Verification:** All routes accessible and working

---

### Task 3.1.3: Collection Resource

**Estimated Time:** 1 hour

- [ ] Create resource: `php artisan make:resource CollectionResource`
- [ ] Implement transformation:
  ```php
  public function toArray($request)
  {
      return [
          'id' => $this->id,
          'name' => $this->name,
          'slug' => $this->slug,
          'description' => $this->description,
          'is_active' => $this->is_active,
          'items_count' => $this->when($this->items_count !== null, $this->items_count),
          'fields' => FieldResource::collection($this->whenLoaded('fields')),
          'created_at' => $this->created_at->toISOString(),
          'updated_at' => $this->updated_at->toISOString(),
      ];
  }
  ```
- [ ] Create FieldResource for nested data
- [ ] Use resources in controller responses

**Verification:** API returns consistent JSON structure

---

## 3.2 Frontend - Collections List

### Task 3.2.1: Collections Index Page

**Estimated Time:** 4 hours

- [ ] Create: `resources/js/Pages/Collections/Index.jsx`
- [ ] Implement:

  ```jsx
  import { useState, useEffect } from 'react';
  import AdminLayout from '@/Components/Layout/AdminLayout';
  import { Button } from '@/components/ui/button';
  import { PlusIcon } from 'lucide-react';
  import CollectionsTable from './components/CollectionsTable';

  export default function CollectionsIndex() {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      fetchCollections();
    }, []);

    const fetchCollections = async () => {
      const response = await axios.get('/bo/collections');
      setCollections(response.data.data);
      setLoading(false);
    };

    return (
      <AdminLayout>
        <div className='space-y-6'>
          <div className='flex justify-between items-center'>
            <div>
              <h1 className='text-3xl font-bold'>Collections</h1>
              <p className='text-gray-600'>Manage your content collections</p>
            </div>
            <Button onClick={() => navigate('/bo/collections/create')}>
              <PlusIcon className='mr-2 h-4 w-4' />
              New Collection
            </Button>
          </div>

          {loading ? (
            <div>Loading...</div>
          ) : (
            <CollectionsTable
              collections={collections}
              onDelete={handleDelete}
            />
          )}
        </div>
      </AdminLayout>
    );
  }
  ```

**Verification:** Collections list page displays

---

### Task 3.2.2: Collections Table Component

**Estimated Time:** 3 hours

- [ ] Create: `resources/js/Pages/Collections/components/CollectionsTable.jsx`
- [ ] Implement with shadcn Table:
  - Collection name
  - Slug
  - Field count
  - Items count
  - Status (active/inactive)
  - Actions (edit, delete, view items)
- [ ] Add search/filter functionality
- [ ] Add pagination
- [ ] Add sorting by column
- [ ] Delete confirmation dialog

**Verification:** Table displays and actions work

---

## 3.3 Frontend - Create/Edit Collection

### Task 3.3.1: Collection Form Page

**Estimated Time:** 5 hours

- [ ] Create: `resources/js/Pages/Collections/Create.jsx`
- [ ] Create: `resources/js/Pages/Collections/Edit.jsx`
- [ ] Implement form with sections:

  1. **Basic Info:**
     - Name input
     - Slug input (auto-generated, editable)
     - Description textarea
  2. **Fields Builder:**
     - Add field button
     - Field list with drag-drop reordering
     - Each field shows:
       - Name
       - Type selector
       - Required checkbox
       - Help text
       - Remove button
  3. **Submit/Cancel buttons**

- [ ] Form structure:

  ```jsx
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    fields: [],
  });

  const addField = () => {
    setFormData({
      ...formData,
      fields: [
        ...formData.fields,
        {
          id: Date.now(),
          name: '',
          slug: '',
          data_type: 'short_text',
          is_required: false,
          config: {},
          help_text: '',
        },
      ],
    });
  };

  const updateField = (index, updates) => {
    const newFields = [...formData.fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFormData({ ...formData, fields: newFields });
  };

  const removeField = (index) => {
    setFormData({
      ...formData,
      fields: formData.fields.filter((_, i) => i !== index),
    });
  };
  ```

**Verification:** Can create collection with fields

---

### Task 3.3.2: Field Builder Component

**Estimated Time:** 4 hours

- [ ] Create: `resources/js/Pages/Collections/components/FieldBuilder.jsx`
- [ ] Implement drag-drop with `@dnd-kit`:
  ```bash
  npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
  ```
- [ ] Each field card shows:
  - Drag handle
  - Field name input
  - Data type selector (dropdown)
  - Required checkbox
  - Help text input
  - Advanced config (collapse)
  - Delete button
- [ ] Add field validation:
  - Name required
  - Unique slugs within collection
- [ ] Show field count and validation errors

**Verification:** Can build fields with drag-drop

---

### Task 3.3.3: Data Type Selector

**Estimated Time:** 2 hours

- [ ] Create: `resources/js/Components/Forms/DataTypeSelector.jsx`
- [ ] Implement with shadcn Select
- [ ] Show icon for each type:
  - 📝 Short Text
  - 📄 Text
  - 📅 Date
  - ✅ Boolean
  - 🖼️ Image
  - 📎 File
  - 📋 List
  - 🔗 Collection
- [ ] Show type description on hover
- [ ] Handle type change (reset config)

**Verification:** All data types selectable

---

### Task 3.3.4: Advanced Field Config

**Estimated Time:** 3 hours

- [ ] Create: `resources/js/Pages/Collections/components/AdvancedFieldConfig.jsx`
- [ ] Implement type-specific configurations:

  **For Short Text:**

  - Min/max length
  - Regex pattern
  - Placeholder text

  **For Text:**

  - Enable rich text
  - Max length

  **For List:**

  - Select allowed item types
  - Min/max items
  - Default first item

  **For Collection:**

  - Select which collection
  - Single or multiple select
  - Display format

- [ ] Use collapsible section
- [ ] Save config to field.config JSON

**Verification:** Config saves per data type

---

### Task 3.3.5: Slug Auto-generation

**Estimated Time:** 1 hour

- [ ] Implement slug auto-generation:

  ```jsx
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Auto-generate on name change
  useEffect(() => {
    if (!slugManuallyEdited) {
      setFormData({
        ...formData,
        slug: generateSlug(formData.name),
      });
    }
  }, [formData.name]);
  ```

- [ ] Add "Edit" icon next to slug to enable manual editing
- [ ] Validate slug format and uniqueness
- [ ] Show slug preview

**Verification:** Slugs generate automatically

---

### Task 3.3.6: Form Validation & Submission

**Estimated Time:** 2 hours

- [ ] Implement client-side validation:
  - Name required
  - Slug valid format
  - At least one field
  - All field names filled
  - No duplicate field slugs
- [ ] Show validation errors inline
- [ ] Disable submit while validating
- [ ] Handle API errors:

  ```jsx
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    try {
      await axios.post('/bo/collections', formData);
      toast.success('Collection created!');
      navigate('/bo/collections');
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
      toast.error('Failed to create collection');
    } finally {
      setSubmitting(false);
    }
  };
  ```

**Verification:** Validation works, errors display

---

## 3.4 Backend - Collection Items

### Task 3.4.1: Collection Items Controller

**Estimated Time:** 4 hours

- [ ] Create: `php artisan make:controller Admin/CollectionItemController`
- [ ] Implement methods:

  ```php
  public function index(Collection $collection)
  {
      $items = $collection->items()
          ->orderBy('order')
          ->paginate(20);

      return response()->json([
          'collection' => new CollectionResource($collection->load('fields')),
          'items' => CollectionItemResource::collection($items),
      ]);
  }

  public function store(Request $request, Collection $collection)
  {
      // Build dynamic validation rules based on collection fields
      $rules = [];
      foreach ($collection->fields as $field) {
          $fieldRules = $field->data_type->validationRules();
          if ($field->is_required) {
              $fieldRules[] = 'required';
          }
          $rules['data.' . $field->slug] = $fieldRules;
      }

      $validated = $request->validate($rules);

      $item = $collection->items()->create([
          'data' => $validated['data'],
          'is_published' => $request->input('is_published', true),
          'order' => $collection->items()->max('order') + 1,
      ]);

      return response()->json(new CollectionItemResource($item), 201);
  }

  public function show(Collection $collection, CollectionItem $item)
  {
      return response()->json(new CollectionItemResource($item));
  }

  public function update(Request $request, Collection $collection, CollectionItem $item)
  {
      // Similar to store
  }

  public function destroy(Collection $collection, CollectionItem $item)
  {
      $item->delete();
      return response()->json(['message' => 'Item deleted']);
  }

  public function reorder(Request $request, Collection $collection)
  {
      $validated = $request->validate([
          'items' => 'required|array',
          'items.*.id' => 'required|exists:collection_items,id',
          'items.*.order' => 'required|integer',
      ]);

      DB::transaction(function () use ($validated) {
          foreach ($validated['items'] as $item) {
              CollectionItem::where('id', $item['id'])
                  ->update(['order' => $item['order']]);
          }
      });

      return response()->json(['message' => 'Items reordered']);
  }
  ```

**Verification:** Item CRUD works via API

---

### Task 3.4.2: Collection Items Routes

**Estimated Time:** 30 minutes

- [ ] Add nested routes:
  ```php
  Route::middleware(['auth', 'active.user'])->prefix('bo')->group(function () {
      Route::prefix('collections/{collection}')->group(function () {
          Route::get('items', [CollectionItemController::class, 'index']);
          Route::post('items', [CollectionItemController::class, 'store']);
          Route::get('items/{item}', [CollectionItemController::class, 'show']);
          Route::put('items/{item}', [CollectionItemController::class, 'update']);
          Route::delete('items/{item}', [CollectionItemController::class, 'destroy']);
          Route::post('items/reorder', [CollectionItemController::class, 'reorder']);
      });
  });
  ```

**Verification:** Routes work correctly

---

### Task 3.4.3: Collection Item Resource

**Estimated Time:** 1 hour

- [ ] Create: `php artisan make:resource CollectionItemResource`
- [ ] Transform data:
  ```php
  public function toArray($request)
  {
      return [
          'id' => $this->id,
          'collection_id' => $this->collection_id,
          'data' => $this->data,
          'is_published' => $this->is_published,
          'order' => $this->order,
          'created_at' => $this->created_at->toISOString(),
          'updated_at' => $this->updated_at->toISOString(),
      ];
  }
  ```

**Verification:** Consistent JSON responses

---

## 3.5 Frontend - Collection Items

### Task 3.5.1: Collection Items Index

**Estimated Time:** 4 hours

- [ ] Create: `resources/js/Pages/Collections/Items/Index.jsx`
- [ ] Show collection info at top:
  - Name
  - Description
  - Field count
  - "Edit Collection" button
  - "Back to Collections" button
- [ ] Items table:
  - Dynamic columns based on collection fields
  - Show first 3-4 fields
  - Published status indicator
  - Actions (edit, delete)
- [ ] Add "New Item" button
- [ ] Add search functionality
- [ ] Add bulk actions:
  - Publish/unpublish
  - Delete selected
- [ ] Add drag-drop to reorder items

**Verification:** Items list displays dynamically

---

### Task 3.5.2: Collection Item Form

**Estimated Time:** 5 hours

- [ ] Create: `resources/js/Pages/Collections/Items/Create.jsx`
- [ ] Create: `resources/js/Pages/Collections/Items/Edit.jsx`
- [ ] Dynamic form generation:
  ```jsx
  const renderField = (field) => {
      switch (field.data_type) {
          case 'short_text':
              return <ShortTextInput field={field} ... />;
          case 'text':
              return <RichTextEditor field={field} ... />;
          case 'date':
              return <DatePicker field={field} ... />;
          case 'boolean':
              return <BooleanToggle field={field} ... />;
          case 'image':
              return <ImageUploader field={field} ... />;
          case 'file':
              return <FileUploader field={field} ... />;
          case 'list':
              return <ListBuilder field={field} ... />;
          case 'collection':
              return <CollectionSelector field={field} ... />;
          default:
              return null;
      }
  };
  ```
- [ ] Form layout:
  - Two columns on desktop
  - Single column on mobile
  - Published toggle
  - Save/Cancel buttons
- [ ] Handle nested list data
- [ ] Auto-save draft (optional)

**Verification:** Can create/edit items with all field types

---

### Task 3.5.3: Dynamic Form Validation

**Estimated Time:** 2 hours

- [ ] Implement client-side validation:
  ```jsx
  const validateForm = () => {
    const errors = {};

    collection.fields.forEach((field) => {
      const value = formData[field.slug];

      if (field.is_required && !value) {
        errors[field.slug] = `${field.name} is required`;
      }

      // Type-specific validation
      if (field.data_type === 'short_text' && value?.length > 256) {
        errors[field.slug] = 'Maximum 256 characters';
      }

      // Add more validation rules...
    });

    return errors;
  };
  ```
- [ ] Show validation errors inline
- [ ] Prevent submission if invalid
- [ ] Handle server-side validation errors

**Verification:** Validation works for all field types

---

### Task 3.5.4: Items Table with Reordering

**Estimated Time:** 3 hours

- [ ] Create: `resources/js/Pages/Collections/Items/components/ItemsTable.jsx`
- [ ] Implement drag-drop reordering:

  ```jsx
  import { DndContext, closestCenter } from '@dnd-kit/core';
  import {
    SortableContext,
    verticalListSortingStrategy,
  } from '@dnd-kit/sortable';

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      // Update order in backend
      await axios.post(`/bo/collections/${collectionId}/items/reorder`, {
        items: newItems.map((item, index) => ({
          id: item.id,
          order: index,
        })),
      });
    }
  };
  ```

- [ ] Add drag handle icon
- [ ] Show visual feedback during drag

**Verification:** Can reorder items with drag-drop

---

### Task 3.5.5: Bulk Actions

**Estimated Time:** 3 hours

- [ ] Add checkbox column to table
- [ ] "Select all" checkbox in header
- [ ] Show bulk actions bar when items selected:
  - Count of selected items
  - Publish button
  - Unpublish button
  - Delete button
  - Cancel selection
- [ ] Implement bulk operations:
  ```jsx
  const handleBulkPublish = async () => {
    await axios.post(`/bo/collections/${collectionId}/items/bulk-publish`, {
      item_ids: selectedItems,
    });

    toast.success(`${selectedItems.length} items published`);
    refetchItems();
    setSelectedItems([]);
  };
  ```
- [ ] Add confirmation dialog for delete
- [ ] Update backend to handle bulk operations

**Verification:** Bulk actions work correctly

---

## 3.6 Search & Filtering

### Task 3.6.1: Backend Search

**Estimated Time:** 2 hours

- [ ] Update CollectionItemController index method:
  ```php
  public function index(Request $request, Collection $collection)
  {
      $query = $collection->items();

      // Search in JSON data
      if ($search = $request->input('search')) {
          $query->where(function ($q) use ($search, $collection) {
              foreach ($collection->fields as $field) {
                  $q->orWhereRaw("JSON_EXTRACT(data, '$.{$field->slug}') LIKE ?", ["%{$search}%"]);
              }
          });
      }

      // Filter by published status
      if ($request->has('published')) {
          $query->where('is_published', $request->boolean('published'));
      }

      // Sort
      $sortBy = $request->input('sort_by', 'order');
      $sortDir = $request->input('sort_dir', 'asc');
      $query->orderBy($sortBy, $sortDir);

      $items = $query->paginate(20);

      return response()->json([
          'collection' => new CollectionResource($collection->load('fields')),
          'items' => CollectionItemResource::collection($items),
          'meta' => [
              'total' => $items->total(),
              'per_page' => $items->perPage(),
              'current_page' => $items->currentPage(),
          ]
      ]);
  }
  ```

**Verification:** Search and filtering work

---

### Task 3.6.2: Frontend Search UI

**Estimated Time:** 2 hours

- [ ] Add search input above table:
  ```jsx
  <Input
    type='search'
    placeholder='Search items...'
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className='max-w-sm'
  />
  ```
- [ ] Debounce search input (300ms)
- [ ] Add filter dropdowns:
  - Published status (All/Published/Draft)
  - Sort by field
  - Sort direction
- [ ] Show active filters
- [ ] Clear filters button
- [ ] Update URL params with filters

**Verification:** Search and filters update results

---

## 3.7 Export/Import (Optional)

### Task 3.7.1: Export Collection Items

**Estimated Time:** 3 hours

- [ ] Add export button to items page
- [ ] Backend endpoint:
  ```php
  public function export(Collection $collection)
  {
      $items = $collection->items()->get();

      $csv = Writer::createFromString('');

      // Header row
      $headers = ['ID'];
      foreach ($collection->fields as $field) {
          $headers[] = $field->name;
      }
      $headers[] = 'Published';
      $csv->insertOne($headers);

      // Data rows
      foreach ($items as $item) {
          $row = [$item->id];
          foreach ($collection->fields as $field) {
              $row[] = $item->data[$field->slug] ?? '';
          }
          $row[] = $item->is_published ? 'Yes' : 'No';
          $csv->insertOne($row);
      }

      return response($csv->getContent())
          ->header('Content-Type', 'text/csv')
          ->header('Content-Disposition', "attachment; filename={$collection->slug}.csv");
  }
  ```
- [ ] Support CSV and JSON formats

**Verification:** Can export collection data

---

### Task 3.7.2: Import Collection Items

**Estimated Time:** 4 hours

- [ ] Add import button
- [ ] Upload CSV/JSON file
- [ ] Parse and validate data
- [ ] Show preview before import
- [ ] Map columns to fields
- [ ] Bulk insert items
- [ ] Show import progress
- [ ] Handle errors gracefully

**Verification:** Can import collection data

---

## 3.8 Testing

### Task 3.8.1: Controller Tests

**Estimated Time:** 4 hours

- [ ] Test CollectionController:
  - List collections
  - Create collection
  - Update collection
  - Delete collection
  - Validation errors
- [ ] Test CollectionItemController:
  - List items
  - Create item
  - Update item
  - Delete item
  - Reorder items
  - Search/filter

**Verification:** All tests pass

---

### Task 3.8.2: Frontend Component Tests

**Estimated Time:** 3 hours

- [ ] Test field builder component
- [ ] Test data type selector
- [ ] Test dynamic form rendering
- [ ] Test validation
- [ ] Test drag-drop reordering

**Verification:** Component tests pass

---

## Phase 3 Checklist

- [ ] Collections CRUD complete
- [ ] Collection items CRUD complete
- [ ] Dynamic form generation working
- [ ] All data type inputs functional
- [ ] Search and filtering implemented
- [ ] Reordering works
- [ ] Bulk actions available
- [ ] Export/import working (if included)
- [ ] Tests passing
- [ ] Documentation updated

**Estimated Total Time:** 60-70 hours

---

## Ready for Phase 4?

Proceed to `04-components.md` to build the component builder module.
