<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('pages', 'slug'),
            ],
            'status' => ['required', Rule::in(['draft', 'published'])],
            'is_homepage' => ['sometimes', 'boolean'],
            'published_at' => ['nullable', 'date'],
            'components' => ['sometimes', 'array'],
            'components.*.component_id' => ['required_with:components', 'integer', 'exists:components,id'],
            'components.*.data' => ['nullable', 'array'],
            'components.*.order' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
