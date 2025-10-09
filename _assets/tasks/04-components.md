# Phase 4: Components Module

**Duration:** Week 4-5  
**Goal:** Build the component creation and management system

---

## 4.1 Backend - Components

### Task 4.1.1: Component Controller

**Estimated Time:** 3 hours

- [ ] Create controller: `php artisan make:controller Admin/ComponentController`
- [ ] Implement methods (similar to Collections):

  ```php
  public function index()
  {
      $components = Component::with('fields')
          ->orderBy('name')
          ->paginate(20);

      return response()->json(ComponentResource::collection($components));
  }

  public function store(Request $request)
  {
      $validated = $request->validate([
          'name' => 'required|string|max:255',
          'slug' => 'nullable|string|unique:components,slug',
          'description' => 'nullable|string',
          'fields' => 'required|array|min:1',
          'fields.*.name' => 'required|string',
          'fields.*.data_type' => 'required',
          'fields.*.config' => 'nullable|array',
      ]);

      $component = app(ComponentBuilderService::class)
          ->buildComponent($validated);

      return response()->json(new ComponentResource($component), 201);
  }

  public function show(Component $component)
  {
      return response()->json(
          new ComponentResource($component->load('fields'))
      );
  }

  public function update(Request $request, Component $component)
  {
      $validated = $request->validate([
          'name' => 'required|string|max:255',
          'description' => 'nullable|string',
          'fields' => 'required|array|min:1',
      ]);

      $component = app(ComponentBuilderService::class)
          ->updateComponent($component, $validated);

      return response()->json(new ComponentResource($component));
  }

  public function destroy(Component $component)
  {
      // Check if component is used in any pages
      if ($component->pages()->exists()) {
          return response()->json([
              'message' => 'Cannot delete component that is used in pages'
          ], 422);
      }

      $component->delete();
      return response()->json(['message' => 'Component deleted']);
  }

  public function duplicate(Component $component)
  {
      $newComponent = $component->replicate();
      $newComponent->name = $component->name . ' (Copy)';
      $newComponent->slug = null;
      $newComponent->save();

      foreach ($component->fields as $field) {
          $newField = $field->replicate();
          $newField->component_id = $newComponent->id;
          $newField->save();
      }

      return response()->json(new ComponentResource($newComponent->fresh('fields')), 201);
  }
  ```

**Verification:** Component CRUD works via API

---

### Task 4.1.2: Component Resource

**Estimated Time:** 1 hour

- [ ] Create: `php artisan make:resource ComponentResource`
- [ ] Transform data:
  ```php
  public function toArray($request)
  {
      return [
          'id' => $this->id,
          'name' => $this->name,
          'slug' => $this->slug,
          'description' => $this->description,
          'is_active' => $this->is_active,
          'fields' => ComponentFieldResource::collection($this->whenLoaded('fields')),
          'pages_count' => $this->when($this->pages_count !== null, $this->pages_count),
          'schema' => $this->when($request->input('include_schema'), fn() => $this->getSchema()),
          'created_at' => $this->created_at->toISOString(),
          'updated_at' => $this->updated_at->toISOString(),
      ];
  }
  ```

**Verification:** Consistent API responses

---

### Task 4.1.3: Component Routes

**Estimated Time:** 30 minutes

- [ ] Add to `routes/web.php`:
  ```php
  Route::middleware(['auth', 'active.user'])->prefix('bo')->group(function () {
      Route::apiResource('components', ComponentController::class);
      Route::post('components/{component}/duplicate', [ComponentController::class, 'duplicate']);
  });
  ```

**Verification:** All routes accessible

---

## 4.2 Frontend - Components List

### Task 4.2.1: Components Index Page

**Estimated Time:** 4 hours

- [ ] Create: `resources/js/Pages/Components/Index.jsx`
- [ ] Implement card-based layout (better than table for components):

  ```jsx
  export default function ComponentsIndex() {
    const [components, setComponents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // grid or list

    return (
      <AdminLayout>
        <div className='space-y-6'>
          <div className='flex justify-between items-center'>
            <div>
              <h1 className='text-3xl font-bold'>Components</h1>
              <p className='text-gray-600'>Build reusable content components</p>
            </div>
            <Button onClick={() => navigate('/bo/components/create')}>
              <PlusIcon className='mr-2 h-4 w-4' />
              New Component
            </Button>
          </div>

          <div className='flex gap-4'>
            <Input
              type='search'
              placeholder='Search components...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='max-w-sm'
            />
            <ToggleGroup
              type='single'
              value={viewMode}
              onValueChange={setViewMode}
            >
              <ToggleGroupItem value='grid'>
                <LayoutGrid className='h-4 w-4' />
              </ToggleGroupItem>
              <ToggleGroupItem value='list'>
                <List className='h-4 w-4' />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {viewMode === 'grid' ? (
            <ComponentsGrid components={filteredComponents} />
          ) : (
            <ComponentsList components={filteredComponents} />
          )}
        </div>
      </AdminLayout>
    );
  }
  ```

**Verification:** Components list displays

---

### Task 4.2.2: Component Card Component

**Estimated Time:** 3 hours

- [ ] Create: `resources/js/Pages/Components/components/ComponentCard.jsx`
- [ ] Design card with:
  - Component name (large)
  - Description (truncated)
  - Field count badge
  - Pages using it badge
  - Status indicator (active/inactive)
  - Action buttons:
    - Edit
    - Duplicate
    - Delete
  - Hover effects
- [ ] Add dropdown menu for actions:
  ```jsx
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant='ghost' size='sm'>
        <MoreVertical className='h-4 w-4' />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem
        onClick={() => navigate(`/bo/components/${component.id}/edit`)}
      >
        <Pencil className='mr-2 h-4 w-4' /> Edit
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleDuplicate(component.id)}>
        <Copy className='mr-2 h-4 w-4' /> Duplicate
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={() => handleDelete(component.id)}
        className='text-red-600'
      >
        <Trash2 className='mr-2 h-4 w-4' /> Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
  ```

**Verification:** Cards display beautifully

---

### Task 4.2.3: Component Schema Preview

**Estimated Time:** 2 hours

- [ ] Create: `resources/js/Pages/Components/components/SchemaPreview.jsx`
- [ ] Show component schema in dialog:
  - Click card to preview
  - Show all fields with types
  - Show configuration
  - JSON export button
  - Close button
- [ ] Format JSON nicely with syntax highlighting:

  ```jsx
  import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
  import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

  <SyntaxHighlighter language='json' style={tomorrow}>
    {JSON.stringify(component.schema, null, 2)}
  </SyntaxHighlighter>;
  ```

**Verification:** Schema preview displays

---

## 4.3 Frontend - Component Builder

### Task 4.3.1: Component Form Page

**Estimated Time:** 5 hours

- [ ] Create: `resources/js/Pages/Components/Create.jsx`
- [ ] Create: `resources/js/Pages/Components/Edit.jsx`
- [ ] Implement three-column layout:

  **Left Panel (Field Types Palette):**

  - List of available data types
  - Drag to add to canvas
  - Search field types
  - Icons for each type

  **Center Panel (Canvas):**

  - Component name input
  - Slug preview
  - Description
  - Drop zone for fields
  - Field list with drag-drop reorder
  - Live preview of component structure

  **Right Panel (Field Properties):**

  - Shows when field selected
  - Edit field name
  - Edit field slug
  - Configure type-specific settings
  - Required toggle
  - Default value
  - Help text
  - Validation rules

**Verification:** Three-panel layout works

---

### Task 4.3.2: Field Palette Component

**Estimated Time:** 3 hours

- [ ] Create: `resources/js/Pages/Components/components/FieldPalette.jsx`
- [ ] List all data types as draggable items:

  ```jsx
  const fieldTypes = [
    { type: 'short_text', icon: Type, label: 'Short Text', color: 'blue' },
    { type: 'text', icon: AlignLeft, label: 'Long Text', color: 'purple' },
    { type: 'date', icon: Calendar, label: 'Date', color: 'green' },
    { type: 'boolean', icon: ToggleLeft, label: 'Boolean', color: 'yellow' },
    { type: 'image', icon: Image, label: 'Image', color: 'pink' },
    { type: 'file', icon: File, label: 'File', color: 'orange' },
    { type: 'list', icon: List, label: 'List', color: 'indigo' },
    { type: 'collection', icon: Database, label: 'Collection', color: 'teal' },
  ];

  return (
    <div className='space-y-2'>
      <h3 className='font-semibold mb-3'>Field Types</h3>
      {fieldTypes.map((field) => (
        <DraggableFieldType
          key={field.type}
          field={field}
          onAddField={() => addField(field.type)}
        />
      ))}
    </div>
  );
  ```

- [ ] Make items draggable to canvas
- [ ] Show field descriptions on hover
- [ ] Group by category (Text, Media, Data, Relationships)

**Verification:** Can drag field types to canvas

---

### Task 4.3.3: Component Canvas

**Estimated Time:** 5 hours

- [ ] Create: `resources/js/Pages/Components/components/ComponentCanvas.jsx`
- [ ] Implement drag-drop area:

  ```jsx
  import { DndContext, DragOverlay } from '@dnd-kit/core';
  import { SortableContext } from '@dnd-kit/sortable';

  export default function ComponentCanvas({
    fields,
    onFieldsChange,
    selectedField,
    onSelectField,
  }) {
    const handleDragEnd = (event) => {
      const { active, over } = event;

      if (!over) return;

      // Adding new field from palette
      if (active.id.startsWith('palette-')) {
        const fieldType = active.id.replace('palette-', '');
        addNewField(fieldType, over.index);
      }
      // Reordering existing fields
      else {
        const oldIndex = fields.findIndex((f) => f.id === active.id);
        const newIndex = fields.findIndex((f) => f.id === over.id);
        const reordered = arrayMove(fields, oldIndex, newIndex);
        onFieldsChange(reordered);
      }
    };

    const addNewField = (type, index) => {
      const newField = {
        id: Date.now(),
        name: `New ${type.replace('_', ' ')} field`,
        slug: '',
        data_type: type,
        is_required: false,
        config: {},
        help_text: '',
      };

      const newFields = [...fields];
      newFields.splice(index, 0, newField);
      onFieldsChange(newFields);
      onSelectField(newField);
    };

    return (
      <DndContext onDragEnd={handleDragEnd}>
        <div className='bg-gray-50 rounded-lg p-6 min-h-[500px]'>
          {fields.length === 0 ? (
            <div className='text-center py-12 text-gray-400'>
              <BoxIcon className='h-12 w-12 mx-auto mb-3' />
              <p>Drag field types here to build your component</p>
            </div>
          ) : (
            <SortableContext items={fields.map((f) => f.id)}>
              {fields.map((field, index) => (
                <SortableField
                  key={field.id}
                  field={field}
                  index={index}
                  isSelected={selectedField?.id === field.id}
                  onSelect={() => onSelectField(field)}
                  onRemove={() => removeField(field.id)}
                />
              ))}
            </SortableContext>
          )}
        </div>
      </DndContext>
    );
  }
  ```

- [ ] Show empty state when no fields
- [ ] Visual feedback during drag
- [ ] Highlight drop zones

**Verification:** Drag-drop from palette works

---

### Task 4.3.4: Sortable Field Item

**Estimated Time:** 3 hours

- [ ] Create: `resources/js/Pages/Components/components/SortableField.jsx`
- [ ] Display field in canvas:

  ```jsx
  import { useSortable } from '@dnd-kit/sortable';
  import { CSS } from '@dnd-kit/utilities';
  import { GripVertical, X } from 'lucide-react';

  export default function SortableField({
    field,
    index,
    isSelected,
    onSelect,
    onRemove,
  }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: field.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`
                  bg-white rounded-lg p-4 mb-3 border-2 
                  ${isSelected ? 'border-blue-500' : 'border-gray-200'}
                  hover:border-blue-300 cursor-pointer
              `}
        onClick={onSelect}
      >
        <div className='flex items-center gap-3'>
          <div {...attributes} {...listeners} className='cursor-grab'>
            <GripVertical className='h-5 w-5 text-gray-400' />
          </div>

          <div className='flex-1'>
            <div className='flex items-center gap-2'>
              <span className='font-medium'>{field.name}</span>
              {field.is_required && (
                <span className='text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded'>
                  Required
                </span>
              )}
            </div>
            <div className='text-sm text-gray-500'>
              {field.data_type.replace('_', ' ')} • {field.slug || 'No slug'}
            </div>
          </div>

          <Button
            variant='ghost'
            size='sm'
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <X className='h-4 w-4' />
          </Button>
        </div>
      </div>
    );
  }
  ```

**Verification:** Fields display and are sortable

---

### Task 4.3.5: Field Properties Panel

**Estimated Time:** 4 hours

- [ ] Create: `resources/js/Pages/Components/components/FieldPropertiesPanel.jsx`
- [ ] Show when field is selected:

  ```jsx
  export default function FieldPropertiesPanel({
    field,
    onUpdate,
    collections,
  }) {
    if (!field) {
      return (
        <div className='text-center py-12 text-gray-400'>
          <Settings className='h-12 w-12 mx-auto mb-3' />
          <p>Select a field to edit its properties</p>
        </div>
      );
    }

    return (
      <div className='space-y-6'>
        <div>
          <h3 className='font-semibold mb-4'>Field Properties</h3>
        </div>

        {/* Field Name */}
        <div>
          <Label>Field Name</Label>
          <Input
            value={field.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
          />
        </div>

        {/* Field Slug */}
        <div>
          <Label>Field Slug</Label>
          <Input
            value={field.slug}
            onChange={(e) => onUpdate({ slug: e.target.value })}
            placeholder='Auto-generated'
          />
          <p className='text-xs text-gray-500 mt-1'>Used in API responses</p>
        </div>

        {/* Required Toggle */}
        <div className='flex items-center justify-between'>
          <Label>Required Field</Label>
          <Switch
            checked={field.is_required}
            onCheckedChange={(checked) => onUpdate({ is_required: checked })}
          />
        </div>

        {/* Help Text */}
        <div>
          <Label>Help Text</Label>
          <Textarea
            value={field.help_text || ''}
            onChange={(e) => onUpdate({ help_text: e.target.value })}
            placeholder='Optional hint for content editors'
          />
        </div>

        {/* Type-Specific Config */}
        <div>
          <Label>Configuration</Label>
          {renderTypeConfig(field)}
        </div>
      </div>
    );
  }
  ```

- [ ] Add type-specific configuration sections
- [ ] Auto-generate slug from name
- [ ] Validate field properties

**Verification:** Can edit field properties

---

### Task 4.3.6: Type-Specific Config Forms

**Estimated Time:** 4 hours

- [ ] Create config components for each type:

**ShortTextConfig.jsx:**

```jsx
- Min/max length sliders
- Pattern validation input
- Placeholder text
```

**TextConfig.jsx:**

```jsx
- Enable rich text toggle
- Max length (optional)
- Allowed HTML tags (if rich text)
```

**ListConfig.jsx:**

```jsx
- Select allowed item types (checkboxes)
- Min/max items
- Allow reordering toggle
- Collapsible by default toggle
```

**CollectionConfig.jsx:**

```jsx
- Collection selector dropdown
- Single/multiple select radio
- Display template input
```

**ImageConfig.jsx:**

```jsx
- Max file size
- Allowed formats
- Max dimensions
- Thumbnail settings
```

- [ ] Save config to field.config JSON
- [ ] Validate config values

**Verification:** Type configs save correctly

---

### Task 4.3.7: Component Form Validation

**Estimated Time:** 2 hours

- [ ] Validate component before save:

  ```jsx
  const validateComponent = () => {
    const errors = {};

    if (!formData.name) {
      errors.name = 'Component name is required';
    }

    if (formData.fields.length === 0) {
      errors.fields = 'Add at least one field';
    }

    formData.fields.forEach((field, index) => {
      if (!field.name) {
        errors[`field_${index}_name`] = 'Field name required';
      }

      // Check for duplicate slugs
      const duplicates = formData.fields.filter(
        (f) => f.slug === field.slug && f.id !== field.id
      );

      if (duplicates.length > 0) {
        errors[`field_${index}_slug`] = 'Duplicate slug';
      }
    });

    return errors;
  };
  ```

- [ ] Show validation errors
- [ ] Prevent save if invalid
- [ ] Highlight invalid fields

**Verification:** Validation prevents invalid saves

---

## 4.4 Component Preview

### Task 4.4.1: Live Component Preview

**Estimated Time:** 4 hours

- [ ] Create: `resources/js/Pages/Components/components/ComponentPreview.jsx`
- [ ] Show how component will look when used:

  ```jsx
  export default function ComponentPreview({ component, sampleData }) {
    return (
      <Card className='p-6'>
        <h3 className='font-semibold mb-4'>Preview</h3>

        <div className='space-y-4'>
          {component.fields.map((field) => (
            <div key={field.id} className='border-b pb-4'>
              <Label className='block mb-2'>
                {field.name}
                {field.is_required && (
                  <span className='text-red-500 ml-1'>*</span>
                )}
              </Label>

              {renderPreviewField(field, sampleData[field.slug])}

              {field.help_text && (
                <p className='text-sm text-gray-500 mt-1'>{field.help_text}</p>
              )}
            </div>
          ))}
        </div>
      </Card>
    );
  }
  ```

- [ ] Add toggle to show/hide preview
- [ ] Allow entering sample data
- [ ] Show JSON output of sample data

**Verification:** Preview updates as component changes

---

### Task 4.4.2: Component Export

**Estimated Time:** 2 hours

- [ ] Add "Export Schema" button
- [ ] Generate JSON schema:

  ```jsx
  const exportSchema = () => {
    const schema = {
      name: component.name,
      slug: component.slug,
      fields: component.fields.map((field) => ({
        name: field.name,
        slug: field.slug,
        type: field.data_type,
        required: field.is_required,
        config: field.config,
      })),
    };

    const blob = new Blob([JSON.stringify(schema, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${component.slug}-schema.json`;
    a.click();
  };
  ```

- [ ] Add "Copy JSON" button
- [ ] Show success toast after export

**Verification:** Schema exports correctly

---

## 4.5 Component Templates (Optional)

### Task 4.5.1: Component Templates Library

**Estimated Time:** 4 hours

- [ ] Create pre-built component templates:

  - Hero Section (image, title, subtitle, CTA)
  - Feature Grid (icon, title, description)
  - Testimonial (quote, author, photo)
  - FAQ Item (question, answer)
  - Team Member (name, role, photo, bio, socials)
  - Pricing Card (name, price, features list, CTA)
  - Blog Post (title, date, author, content, featured image)
  - Contact Form (name, email, message)

- [ ] Show templates on create component page
- [ ] "Start from template" button
- [ ] Preview template before using
- [ ] Customize after selecting template

**Verification:** Can start from templates

---

### Task 4.5.2: Save as Template

**Estimated Time:** 2 hours

- [ ] Add "Save as Template" option
- [ ] Create `component_templates` table:
  ```php
  Schema::create('component_templates', function (Blueprint $table) {
      $table->id();
      $table->string('name');
      $table->string('slug')->unique();
      $table->text('description')->nullable();
      $table->string('category')->default('custom');
      $table->json('schema');
      $table->foreignId('created_by')->constrained('users');
      $table->timestamps();
  });
  ```
- [ ] Allow users to save their components as templates
- [ ] Share templates across team

**Verification:** Can save and reuse templates

---

## 4.6 Component Usage Tracking

### Task 4.6.1: Usage Statistics

**Estimated Time:** 3 hours

- [ ] Show where component is used:

  ```jsx
  export default function ComponentUsage({ componentId }) {
    const [pages, setPages] = useState([]);

    useEffect(() => {
      fetchComponentUsage();
    }, []);

    return (
      <Card>
        <CardHeader>
          <h3 className='font-semibold'>Used In</h3>
        </CardHeader>
        <CardContent>
          {pages.length === 0 ? (
            <p className='text-gray-500'>Not used in any pages yet</p>
          ) : (
            <ul className='space-y-2'>
              {pages.map((page) => (
                <li key={page.id} className='flex items-center justify-between'>
                  <span>{page.title}</span>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => navigate(`/bo/pages/${page.id}/edit`)}
                  >
                    Edit Page
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    );
  }
  ```

- [ ] Backend endpoint to get component usage
- [ ] Prevent deletion of used components
- [ ] Show warning when editing used component

**Verification:** Usage tracking works

---

## 4.7 Testing

### Task 4.7.1: Component Builder Tests

**Estimated Time:** 4 hours

- [ ] Test component creation
- [ ] Test field drag-drop
- [ ] Test field reordering
- [ ] Test field property editing
- [ ] Test validation
- [ ] Test component duplication
- [ ] Test component deletion

**Verification:** All tests pass

---

### Task 4.7.2: Service Tests

**Estimated Time:** 2 hours

- [ ] Test ComponentBuilderService
- [ ] Test schema generation
- [ ] Test data validation
- [ ] Test circular reference prevention

**Verification:** Service tests pass

---

## Phase 4 Checklist

- [ ] Component CRUD complete
- [ ] Visual component builder working
- [ ] Drag-drop functionality implemented
- [ ] Field properties panel functional
- [ ] All data types configurable
- [ ] Component preview working
- [ ] Schema export available
- [ ] Templates implemented (if included)
- [ ] Usage tracking works
- [ ] Tests passing
- [ ] Documentation updated

**Estimated Total Time:** 55-65 hours

---

## Ready for Phase 5?

Proceed to `05-pages-media-users.md` to build the page composition and versioning module.
