<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * DataType
 *
 * Enum representing field/data types used by the headless CMS.
 *
 * Methods:
 *  - label(): string           -> Human friendly label for UI
 *  - validationRules(): array  -> Laravel validation rules for the type
 *  - icon(): string            -> Suggested lucide-react icon name
 */
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
    case COMPONENT = 'component';

    /**
     * Return a human-friendly label for the type.
     */
    public function label(): string
    {
        return match ($this) {
            self::SHORT_TEXT => 'Short Text (max 256 chars)',
            self::TEXT => 'Long Text',
            self::DATE => 'Date',
            self::BOOLEAN => 'Boolean',
            self::IMAGE => 'Image',
            self::FILE => 'File',
            self::LIST => 'List (array)',
            self::COLLECTION => 'Collection (relation)',
            self::COMPONENT => 'Component (structured)',
        };
    }

    /**
     * Return Laravel validation rules for the type.
     *
     * Note: These are starter rules — refine per-field settings when building forms.
     *
     * Example:
     *  DataType::SHORT_TEXT->validationRules() // ['string', 'max:256']
     */
    public function validationRules(): array
    {
        return match ($this) {
            self::SHORT_TEXT => ['string', 'max:256'],
            self::TEXT => ['string'],
            self::DATE => ['date'],
            self::BOOLEAN => ['boolean'],
            self::IMAGE => ['image', 'max:10240'], // max 10MB by default
            self::FILE => ['file', 'max:10240'],   // max 10MB by default
            self::LIST => ['array'],
            self::COLLECTION => ['integer'],       // typically an id reference; refine as needed
            self::COMPONENT => ['array'],          // structured JSON for component data
        };
    }

    /**
     * Return a lucide-react icon name suggestion for the type.
     *
     * These are common lucide icon identifiers used in the frontend.
     */
    public function icon(): string
    {
        return match ($this) {
            self::SHORT_TEXT => 'Type',
            self::TEXT => 'FileText',
            self::DATE => 'Calendar',
            self::BOOLEAN => 'ToggleLeft',
            self::IMAGE => 'Image',
            self::FILE => 'File',
            self::LIST => 'List',
            self::COLLECTION => 'Database',
            self::COMPONENT => 'Layers',
        };
    }
}
