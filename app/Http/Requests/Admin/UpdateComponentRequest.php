<?php

namespace App\Http\Requests\Admin;

use App\Enums\DataType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateComponentRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'],
            'description' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
            'fields' => ['required', 'array', 'min:1'],
            'fields.*.name' => ['required', 'string', 'max:255'],
            'fields.*.slug' => ['nullable', 'string', 'max:255', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'],
            'fields.*.data_type' => ['required', new Enum(DataType::class)],
            'fields.*.config' => ['sometimes', 'array'],
            'fields.*.is_required' => ['sometimes', 'boolean'],
            'fields.*.default_value' => ['nullable'],
            'fields.*.help_text' => ['nullable', 'string'],
            'fields.*.order' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
