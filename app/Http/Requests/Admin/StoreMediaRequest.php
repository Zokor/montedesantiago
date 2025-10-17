<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\UploadedFile;

class StoreMediaRequest extends FormRequest
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
        $max = config('media.max_upload_size', 20480);

        return [
            'files' => ['required', 'array', 'min:1', 'max:20'],
            'files.*' => ['file', "max:{$max}"],
            'folder' => ['nullable', 'string', 'max:255'],
            'disk' => ['nullable', 'string', 'max:50'],
            'tags' => ['nullable', 'array', 'max:25'],
            'tags.*' => ['string', 'max:50'],
        ];
    }

    /**
     * Normalize single file payloads into an array for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->hasFile('file') && ! $this->hasFile('files')) {
            $file = $this->file('file');
            \assert($file instanceof UploadedFile);

            $this->merge(['files' => [$file]]);
            $this->files->set('files', [$file]);
        }
    }
}
