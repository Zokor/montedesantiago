<?php

namespace App\Services;

use Illuminate\Support\Arr;

class ConditionalVisibilityService
{
    /**
     * Determine if a field should be visible based on rules and form values.
     *
     * @param  array<string, mixed>|array<int, mixed>|null  $rules
     * @param  array<string, mixed>  $values
     */
    public function isVisible(?array $rules, array $values): bool
    {
        if (empty($rules)) {
            return true;
        }

        $group = $this->normaliseGroup($rules);

        $logic = strtolower($group['logic'] ?? 'and');
        $logic = in_array($logic, ['and', 'or'], true) ? $logic : 'and';

        $results = [];

        foreach ($group['rules'] as $rule) {
            $results[] = $this->evaluateRule($rule, $values);
        }

        return $logic === 'and'
            ? ! in_array(false, $results, true)
            : in_array(true, $results, true);
    }

    /**
     * Normalise rule payloads into a predictable structure.
     *
     * @param  array<string, mixed>|array<int, mixed>  $rules
     * @return array{logic:string,rules:array<int,array<string,mixed>>}
     */
    private function normaliseGroup(array $rules): array
    {
        if (isset($rules['rules'])) {
            return [
                'logic' => $rules['logic'] ?? 'and',
                'rules' => $rules['rules'],
            ];
        }

        if ($this->isAssociative($rules)) {
            return [
                'logic' => 'and',
                'rules' => [$rules],
            ];
        }

        return [
            'logic' => 'and',
            'rules' => $rules,
        ];
    }

    /**
     * Evaluate a single rule.
     *
     * @param  array<string, mixed>  $rule
     */
    private function evaluateRule(array $rule, array $values): bool
    {
        $dependsOn = $rule['dependsOn'] ?? $rule['depends_on'] ?? null;
        $operator = strtolower($rule['operator'] ?? 'equals');
        $expected = $rule['value'] ?? null;

        $actual = Arr::get($values, (string) $dependsOn);

        $actual = $this->castValue($actual);
        $expected = $this->castValue($expected);

        return match ($operator) {
            'equals' => $actual === $expected,
            'not_equals' => $actual !== $expected,
            'in' => is_array($expected) ? in_array($actual, $expected, true) : false,
            'not_in' => is_array($expected) ? ! in_array($actual, $expected, true) : true,
            'contains' => $this->contains($actual, $expected),
            'not_contains' => ! $this->contains($actual, $expected),
            'truthy' => $this->isTruthy($actual),
            'falsy' => ! $this->isTruthy($actual),
            default => true,
        };
    }

    /**
     * Determine whether a rule target contains a value.
     */
    private function contains(mixed $actual, mixed $expected): bool
    {
        if (is_array($actual)) {
            return in_array($expected, array_map([$this, 'castValue'], $actual), true);
        }

        if (is_string($actual) && is_string($expected)) {
            return str_contains($actual, $expected);
        }

        return false;
    }

    /**
     * Cast a value according to vanilla builder coercion.
     */
    private function castValue(mixed $value): mixed
    {
        if (is_string($value)) {
            $lower = strtolower($value);

            if ($lower === 'true' || $lower === 'false') {
                return $lower === 'true';
            }

            if (is_numeric($value)) {
                return $value + 0;
            }
        }

        if (is_array($value)) {
            return array_map([$this, 'castValue'], $value);
        }

        return $value;
    }

    /**
     * Determine truthiness similar to the vanilla implementation.
     */
    private function isTruthy(mixed $value): bool
    {
        if (is_bool($value)) {
            return $value;
        }

        if (is_numeric($value)) {
            return (int) $value !== 0;
        }

        if (is_string($value)) {
            return trim($value) !== '';
        }

        if (is_array($value)) {
            return ! empty($value);
        }

        return (bool) $value;
    }

    /**
     * Determine if array is associative.
     */
    private function isAssociative(array $values): bool
    {
        return array_keys($values) !== range(0, count($values) - 1);
    }
}
