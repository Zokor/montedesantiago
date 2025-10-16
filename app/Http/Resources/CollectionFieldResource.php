<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CollectionFieldResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'collection_id' => $this->collection_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'data_type' => $this->data_type->value,
            'data_type_label' => $this->data_type->label(),
            'data_type_icon' => $this->data_type->icon(),
            'config' => $this->config ?? [],
            'is_required' => $this->is_required,
            'default_value' => $this->default_value,
            'help_text' => $this->help_text,
            'order' => $this->order,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
